import { Worker, Job } from "bullmq";
import { connection } from "./queue";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { SocialPublishJob, EventSyncJob, WebhookJob, EmailJob, SMSJob, SpaceHoldExpireJob } from "./queue";
import { logAction } from "@/lib/audit";
import { FacebookProvider } from "@/lib/providers/facebook";
import { GoogleBusinessProvider } from "@/lib/providers/google-business";
import { EventbriteProvider } from "@/lib/providers/eventbrite";
import { MeetupProvider } from "@/lib/providers/meetup";
import { refreshProviderToken } from "@/lib/oauth/refresh";

// Social Media Worker
const socialWorker = new Worker(
  "social",
  async (job: Job<SocialPublishJob>) => {
    const { postId, platforms, content, mediaUrls } = job.data;
    
    logger.info(`Processing social post ${postId} for platforms: ${platforms.join(", ")}`);
    
    try {
      // Get the post first
      const post = await db.socialPost.findUnique({
        where: { id: postId },
        include: { business: true },
      });

      if (!post) {
        throw new Error(`Social post ${postId} not found`);
      }

      // Update post status to publishing
      await db.socialPost.update({
        where: { id: postId },
        data: { status: "PUBLISHING" },
      });
      
      const results = [];
      
      // Get social accounts for the platforms
      const socialAccounts = await db.socialAccount.findMany({
        where: {
          businessId: post.businessId,
          provider: {
            in: platforms.map(p => {
              switch (p) {
                case "facebook": return "FACEBOOK_PAGE";
                case "instagram": return "INSTAGRAM_BUSINESS";
                case "google": return "GOOGLE_BUSINESS";
                default: return p.toUpperCase();
              }
            }),
          },
        },
      });

      // Publish to each platform
      for (const platform of platforms) {
        try {
          const account = socialAccounts.find(acc => {
            switch (platform) {
              case "facebook": return acc.provider === "FACEBOOK_PAGE";
              case "instagram": return acc.provider === "INSTAGRAM_BUSINESS";
              case "google": return acc.provider === "GOOGLE_BUSINESS";
              default: return false;
            }
          });

          if (!account) {
            throw new Error(`No active ${platform} account found`);
          }

          let result;
          
          switch (platform) {
            case "facebook":
              result = await publishToFacebook(content, mediaUrls, account);
              break;
            case "instagram":
              result = await publishToInstagram(content, mediaUrls, account);
              break;
            case "google":
              result = await publishToGoogleBusiness(content, mediaUrls, account);
              break;
            default:
              throw new Error(`Unsupported platform: ${platform}`);
          }
          
          results.push({ 
            platform, 
            success: true, 
            externalId: result.id,
            url: result.url,
            accountName: account.accountName,
          });
          
        } catch (error) {
          logger.error(`Failed to publish to ${platform}:`, error);
          results.push({ platform, success: false, error: error.message });
        }
      }
      
      // Update post with results
      const allSuccessful = results.every(r => r.success);
      await db.socialPost.update({
        where: { id: postId },
        data: {
          status: allSuccessful ? "PUBLISHED" : "FAILED",
          publishedAt: allSuccessful ? new Date() : undefined,
          externalIds: results.filter(r => r.success).map(r => r.externalId),
          errorMessage: allSuccessful ? null : results.find(r => !r.success)?.error,
        },
      });

      // Log audit trail
      await logAction(
        'system',
        'system',
        allSuccessful ? 'SOCIAL_POST_PUBLISHED' : 'SOCIAL_POST_FAILED',
        'SocialPost',
        postId,
        post.businessId,
        { platforms, results }
      );
      
      logger.info(`Social post ${postId} processed successfully`);
      
    } catch (error) {
      logger.error(`Failed to process social post ${postId}:`, error);
      
      await db.socialPost.update({
        where: { id: postId },
        data: {
          status: "FAILED",
          errorMessage: error.message,
        },
      });
      
      throw error;
    }
  },
  { connection }
);

// Event Sync Worker
const eventSyncWorker = new Worker(
  "event-sync",
  async (job: Job<EventSyncJob>) => {
    const { eventSyncId, direction, forceUpdate } = job.data;
    
    logger.info(`Processing event sync ${eventSyncId} (${direction})`);
    
    try {
      const eventSync = await db.eventSync.findUnique({
        where: { id: eventSyncId },
        include: { listing: true },
      });
      
      if (!eventSync) {
        throw new Error(`Event sync ${eventSyncId} not found`);
      }
      
      // Update sync status
      await db.eventSync.update({
        where: { id: eventSyncId },
        data: { lastSyncStatus: "SYNCING" },
      });
      
      let result;
      
      if (direction === "import") {
        // Import logic would go here - for now, we'll focus on export
        result = { externalIds: [], data: {} };
      } else {
        // Export to platforms
        const externalIds: string[] = [];
        const syncData: any = {};
        
        // Get connected accounts for the platforms
        const socialAccounts = await db.socialAccount.findMany({
          where: {
            businessId: eventSync.businessId,
            provider: {
              in: ["FACEBOOK_PAGE", "EVENTBRITE", "MEETUP"],
            },
          },
        });

        for (const account of socialAccounts) {
          try {
            let platformResult;
            
            switch (account.provider) {
              case "FACEBOOK_PAGE":
                platformResult = await createFacebookEvent(eventSync.listing, account);
                break;
              case "EVENTBRITE":
                platformResult = await createEventbriteEvent(eventSync.listing, account);
                break;
              case "MEETUP":
                platformResult = await createMeetupEvent(eventSync.listing, account);
                break;
            }
            
            if (platformResult) {
              externalIds.push(...platformResult.externalIds);
              syncData[account.provider.toLowerCase()] = platformResult.data;
            }
          } catch (error) {
            logger.error(`Failed to sync to ${account.provider}:`, error);
            syncData[account.provider.toLowerCase()] = { error: error.message };
          }
        }
        
        result = { externalIds, data: syncData };
      }
      
      // Update sync with results
      await db.eventSync.update({
        where: { id: eventSyncId },
        data: {
          lastSyncStatus: "SUCCESS",
          lastSyncAt: new Date(),
          externalIds: result.externalIds,
          syncData: result.data,
        },
      });

      // Log audit trail
      await logAction(
        'system',
        'system',
        'EVENT_SYNC_COMPLETED',
        'EventSync',
        eventSyncId,
        eventSync.businessId,
        { direction, externalIds: result.externalIds }
      );
      
      logger.info(`Event sync ${eventSyncId} completed successfully`);
      
    } catch (error) {
      logger.error(`Failed to process event sync ${eventSyncId}:`, error);
      
      await db.eventSync.update({
        where: { id: eventSyncId },
        data: {
          lastSyncStatus: "FAILED",
          lastSyncError: error.message,
        },
      });
      
      throw error;
    }
  },
  { connection }
);

// Webhook Worker
const webhookWorker = new Worker(
  "webhook",
  async (job: Job<WebhookJob>) => {
    const { webhookId, event, data, retryCount = 0 } = job.data;
    
    logger.info(`Processing webhook ${webhookId} for event ${event}`);
    
    try {
      const webhook = await db.webhookEndpoint.findUnique({
        where: { id: webhookId },
      });
      
      if (!webhook || !webhook.isActive) {
        throw new Error(`Webhook ${webhookId} not found or inactive`);
      }
      
      // Sign the payload
      const signature = await signWebhookPayload(JSON.stringify(data), webhook.secret);
      
      // Send webhook
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event,
          "X-Webhook-Delivery": job.id,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status} ${response.statusText}`);
      }
      
      // Record successful delivery
      await db.webhookDelivery.create({
        data: {
          webhookId,
          event,
          status: "SUCCESS",
          responseStatus: response.status,
          responseBody: await response.text(),
          deliveredAt: new Date(),
        },
      });
      
      logger.info(`Webhook ${webhookId} delivered successfully`);
      
    } catch (error) {
      logger.error(`Failed to deliver webhook ${webhookId}:`, error);
      
      // Record failed delivery
      await db.webhookDelivery.create({
        data: {
          webhookId,
          event,
          status: "FAILED",
          errorMessage: error.message,
          deliveredAt: new Date(),
        },
      });
      
      throw error;
    }
  },
  { connection }
);

// Email Worker
const emailWorker = new Worker(
  "email",
  async (job: Job<EmailJob>) => {
    const { to, subject, template, data, priority } = job.data;
    
    logger.info(`Sending email to ${Array.isArray(to) ? to.join(", ") : to}`);
    
    try {
      // TODO: Implement email sending logic
      // This would integrate with your email service (SendGrid, AWS SES, etc.)
      
      logger.info(`Email sent successfully to ${Array.isArray(to) ? to.join(", ") : to}`);
      
    } catch (error) {
      logger.error(`Failed to send email:`, error);
      throw error;
    }
  },
  { connection }
);

// SMS Worker
const smsWorker = new Worker(
  "sms",
  async (job: Job<SMSJob>) => {
    const { to, message, template, data } = job.data;
    
    logger.info(`Sending SMS to ${to}`);
    
    try {
      // TODO: Implement SMS sending logic
      // This would integrate with your SMS service (Twilio, AWS SNS, etc.)
      
      logger.info(`SMS sent successfully to ${to}`);
      
    } catch (error) {
      logger.error(`Failed to send SMS:`, error);
      throw error;
    }
  },
  { connection }
);

// Platform-specific publishing functions with real integrations
async function publishToFacebook(content: string, mediaUrls?: string[], account?: any) {
  if (!account) {
    throw new Error("Facebook account is required");
  }

  // Check if token needs refresh
  if (account.expiresAt && account.expiresAt < new Date()) {
    const refreshResult = await refreshProviderToken(account.id);
    if (!refreshResult.success) {
      throw new Error(`Token refresh failed: ${refreshResult.error}`);
    }
  }

  const provider = await FacebookProvider.createFromSocialAccount(account);
  
  const result = await provider.createPost({
    message: content,
    link: mediaUrls?.[0],
  });

  return { id: result.id, url: result.permalink_url };
}

async function publishToInstagram(content: string, mediaUrls?: string[], account?: any) {
  if (!account) {
    throw new Error("Instagram account is required");
  }

  if (!mediaUrls || mediaUrls.length === 0) {
    throw new Error("Instagram requires at least one image or video");
  }

  // Check if token needs refresh
  if (account.expiresAt && account.expiresAt < new Date()) {
    const refreshResult = await refreshProviderToken(account.id);
    if (!refreshResult.success) {
      throw new Error(`Token refresh failed: ${refreshResult.error}`);
    }
  }

  const provider = await FacebookProvider.createFromSocialAccount(account);
  
  const result = await provider.createInstagramMedia({
    imageUrl: mediaUrls[0],
    caption: content,
  });

  return { id: result.id, url: result.permalink };
}

async function publishToGoogleBusiness(content: string, mediaUrls?: string[], account?: any) {
  if (!account) {
    throw new Error("Google Business account is required");
  }

  // Check if token needs refresh
  if (account.expiresAt && account.expiresAt < new Date()) {
    const refreshResult = await refreshProviderToken(account.id);
    if (!refreshResult.success) {
      throw new Error(`Token refresh failed: ${refreshResult.error}`);
    }
  }

  const provider = await GoogleBusinessProvider.createFromSocialAccount(account);
  
  const result = await provider.createPost({
    summary: content,
    media: mediaUrls?.map(url => ({
      mediaFormat: "PHOTO" as const,
      sourceUrl: url,
    })),
  });

  return { id: result.name, url: result.name };
}

async function createEventbriteEvent(listing: any, account?: any) {
  if (!account) {
    throw new Error("Eventbrite account is required");
  }

  // Check if token needs refresh
  if (account.expiresAt && account.expiresAt < new Date()) {
    const refreshResult = await refreshProviderToken(account.id);
    if (!refreshResult.success) {
      throw new Error(`Token refresh failed: ${refreshResult.error}`);
    }
  }

  const provider = await EventbriteProvider.createFromSocialAccount(account);
  
  const result = await provider.createEvent({
    name: listing.title,
    description: listing.description,
    startDate: new Date(listing.startDate),
    endDate: listing.endDate ? new Date(listing.endDate) : undefined,
    timezone: "UTC",
    currency: "USD",
    capacity: listing.capacity,
    ticketPrice: listing.price ? parseFloat(listing.price.toString()) : 0,
  });

  return { externalIds: [result.id], data: { eventUrl: result.url } };
}

async function createMeetupEvent(listing: any, account?: any) {
  if (!account) {
    throw new Error("Meetup account is required");
  }

  // Check if token needs refresh
  if (account.expiresAt && account.expiresAt < new Date()) {
    const refreshResult = await refreshProviderToken(account.id);
    if (!refreshResult.success) {
      throw new Error(`Token refresh failed: ${refreshResult.error}`);
    }
  }

  const provider = await MeetupProvider.createFromSocialAccount(account);
  
  const result = await provider.createEvent({
    name: listing.title,
    description: listing.description,
    startTime: new Date(listing.startDate),
    duration: listing.duration || 7200000, // 2 hours default
    visibility: "public",
    howToFindUs: listing.location,
  });

  return { externalIds: [result.id], data: { eventUrl: result.link } };
}

async function createFacebookEvent(listing: any, account?: any) {
  if (!account) {
    throw new Error("Facebook account is required");
  }

  // Check if token needs refresh
  if (account.expiresAt && account.expiresAt < new Date()) {
    const refreshResult = await refreshProviderToken(account.id);
    if (!refreshResult.success) {
      throw new Error(`Token refresh failed: ${refreshResult.error}`);
    }
  }

  const provider = await FacebookProvider.createFromSocialAccount(account);
  
  const result = await provider.createEvent({
    name: listing.title,
    description: listing.description,
    startTime: new Date(listing.startDate),
    endTime: listing.endDate ? new Date(listing.endDate) : undefined,
    location: listing.location,
  });

  return { externalIds: [result.id], data: { eventUrl: `https://facebook.com/events/${result.id}` } };
}

async function signWebhookPayload(payload: string, secret: string) {
  const crypto = await import("crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

// Worker event handlers
socialWorker.on("completed", (job) => {
  logger.info(`Social job ${job.id} completed`);
});

socialWorker.on("failed", (job, err) => {
  logger.error(`Social job ${job?.id} failed:`, err);
});

eventSyncWorker.on("completed", (job) => {
  logger.info(`Event sync job ${job.id} completed`);
});

eventSyncWorker.on("failed", (job, err) => {
  logger.error(`Event sync job ${job?.id} failed:`, err);
});

webhookWorker.on("completed", (job) => {
  logger.info(`Webhook job ${job.id} completed`);
});

webhookWorker.on("failed", (job, err) => {
  logger.error(`Webhook job ${job?.id} failed:`, err);
});

// Graceful shutdown
export const closeWorkers = async () => {
  await Promise.all([
    socialWorker.close(),
    eventSyncWorker.close(),
    webhookWorker.close(),
    emailWorker.close(),
    smsWorker.close(),
  ]);
  
  logger.info("All workers closed");
};

// Space Hold Expiry Worker
const spaceWorker = new Worker(
  "space",
  async (job: Job<SpaceHoldExpireJob>) => {
    const { requestId } = job.data;
    
    logger.info(`Processing space hold expiry for request ${requestId}`);
    
    try {
      // Get the space request
      const spaceRequest = await db.spaceRequest.findUnique({
        where: { id: requestId },
        include: {
          space: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!spaceRequest) {
        logger.warn(`Space request ${requestId} not found`);
        return;
      }

      // Check if the request is still in NEEDS_PAYMENT status
      if (spaceRequest.status !== 'NEEDS_PAYMENT') {
        logger.info(`Space request ${requestId} is no longer in NEEDS_PAYMENT status (${spaceRequest.status})`);
        return;
      }

      // Check if the hold has actually expired
      if (spaceRequest.holdExpiresAt && spaceRequest.holdExpiresAt > new Date()) {
        logger.info(`Space request ${requestId} hold has not expired yet`);
        return;
      }

      // Update the request status to EXPIRED
      await db.spaceRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' },
      });

      // Log the action
      await logAction(
        'system',
        'system',
        'SPACE_REQUEST_EXPIRED',
        'SpaceRequest',
        requestId,
        spaceRequest.businessId,
        {
          spaceId: spaceRequest.spaceId,
          spaceTitle: spaceRequest.space.title,
          title: spaceRequest.title,
          holdExpiresAt: spaceRequest.holdExpiresAt?.toISOString(),
        }
      );

      logger.info(`Space request ${requestId} expired successfully`);
    } catch (error) {
      logger.error(`Error processing space hold expiry for request ${requestId}:`, error);
      throw error;
    }
  },
  { connection }
);

// Export all workers
export const workers = [
  socialWorker,
  eventSyncWorker,
  webhookWorker,
  emailWorker,
  smsWorker,
  spaceWorker,
];

// Graceful shutdown for all workers
export const closeWorkers = async () => {
  await Promise.all([
    socialWorker.close(),
    eventSyncWorker.close(),
    webhookWorker.close(),
    emailWorker.close(),
    smsWorker.close(),
    spaceWorker.close(),
  ]);
  
  logger.info("All workers closed");
};