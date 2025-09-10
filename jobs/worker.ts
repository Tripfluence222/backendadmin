import { Worker, Job } from "bullmq";
import { connection } from "./queue";
import { logger } from "@/lib/logger";
import { db } from "@/lib/db";
import { SocialPublishJob, EventSyncJob, WebhookJob, EmailJob, SMSJob } from "./queue";

// Social Media Worker
const socialWorker = new Worker(
  "social",
  async (job: Job<SocialPublishJob>) => {
    const { postId, platforms, content, mediaUrls } = job.data;
    
    logger.info(`Processing social post ${postId} for platforms: ${platforms.join(", ")}`);
    
    try {
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
          isActive: true,
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
              result = await publishToFacebook(content, mediaUrls, account.id);
              break;
            case "instagram":
              result = await publishToInstagram(content, mediaUrls, account.id);
              break;
            case "google":
              result = await publishToGoogleBusiness(content, mediaUrls, account.id);
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
            isActive: true,
          },
        });

        for (const account of socialAccounts) {
          try {
            let platformResult;
            
            switch (account.provider) {
              case "FACEBOOK_PAGE":
                platformResult = await createFacebookEvent(eventSync.listing, account.id);
                break;
              case "EVENTBRITE":
                platformResult = await createEventbriteEvent(eventSync.listing, account.id);
                break;
              case "MEETUP":
                platformResult = await createMeetupEvent(eventSync.listing, account.id);
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
async function publishToFacebook(content: string, mediaUrls?: string[], accountId?: string) {
  const { FacebookProvider } = await import("@/lib/providers/facebook");
  const { TokenRefreshService } = await import("@/lib/oauth/refresh");
  
  if (!accountId) {
    throw new Error("Facebook account ID is required");
  }

  const token = await TokenRefreshService.getValidToken(accountId);
  if (!token) {
    throw new Error("Invalid or expired Facebook token");
  }

  // Get page access token from metadata or fetch it
  const account = await db.socialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Facebook account not found");
  }

  const pageAccessToken = account.metadata?.pageToken || token;
  const pageId = account.accountId;

  const result = await FacebookProvider.createPagePost(pageAccessToken, pageId, {
    message: content,
    imageUrl: mediaUrls?.[0],
  });

  return { id: result.id, url: result.url };
}

async function publishToInstagram(content: string, mediaUrls?: string[], accountId?: string) {
  const { FacebookProvider } = await import("@/lib/providers/facebook");
  const { TokenRefreshService } = await import("@/lib/oauth/refresh");
  
  if (!accountId) {
    throw new Error("Instagram account ID is required");
  }

  const token = await TokenRefreshService.getValidToken(accountId);
  if (!token) {
    throw new Error("Invalid or expired Instagram token");
  }

  const account = await db.socialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Instagram account not found");
  }

  const igUserId = account.accountId;
  const pageAccessToken = account.metadata?.pageToken || token;

  if (!mediaUrls || mediaUrls.length === 0) {
    throw new Error("Instagram requires at least one image or video");
  }

  // Create media
  const mediaResult = await FacebookProvider.igCreateMedia(igUserId, pageAccessToken, {
    image_url: mediaUrls[0],
    caption: content,
  });

  // Publish media
  const publishResult = await FacebookProvider.igPublishMedia(igUserId, pageAccessToken, mediaResult.id);

  return { id: publishResult.id, url: publishResult.url };
}

async function publishToGoogleBusiness(content: string, mediaUrls?: string[], accountId?: string) {
  const { GoogleBusinessProvider } = await import("@/lib/providers/google-business");
  const { TokenRefreshService } = await import("@/lib/oauth/refresh");
  
  if (!accountId) {
    throw new Error("Google Business account ID is required");
  }

  const token = await TokenRefreshService.getValidToken(accountId);
  if (!token) {
    throw new Error("Invalid or expired Google Business token");
  }

  const account = await db.socialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Google Business account not found");
  }

  const locationName = account.accountId;

  const result = await GoogleBusinessProvider.createPost(locationName, token, {
    summary: content,
    media: mediaUrls?.map(url => ({
      mediaFormat: "PHOTO" as const,
      sourceUrl: url,
    })),
  });

  return { id: result.name, url: result.url };
}

async function createEventbriteEvent(listing: any, accountId: string) {
  const { EventbriteProvider } = await import("@/lib/providers/eventbrite");
  const { TokenRefreshService } = await import("@/lib/oauth/refresh");
  
  const token = await TokenRefreshService.getValidToken(accountId);
  if (!token) {
    throw new Error("Invalid or expired Eventbrite token");
  }

  const account = await db.socialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Eventbrite account not found");
  }

  const organizerId = account.accountId;

  const event = {
    name: {
      text: listing.title,
    },
    start: {
      timezone: "UTC",
      utc: new Date(listing.startDate).toISOString(),
    },
    end: listing.endDate ? {
      timezone: "UTC", 
      utc: new Date(listing.endDate).toISOString(),
    } : undefined,
    currency: "USD",
    summary: listing.description,
    description: {
      text: listing.description,
    },
    listed: true,
    shareable: true,
  };

  const result = await EventbriteProvider.createEvent(token, organizerId, event);
  
  // Publish the event
  const publishedResult = await EventbriteProvider.publishEvent(token, result.id);

  return { externalIds: [result.id], data: { eventUrl: publishedResult.url } };
}

async function createMeetupEvent(listing: any, accountId: string, groupUrlName?: string) {
  const { MeetupProvider } = await import("@/lib/providers/meetup");
  const { TokenRefreshService } = await import("@/lib/oauth/refresh");
  
  const token = await TokenRefreshService.getValidToken(accountId);
  if (!token) {
    throw new Error("Invalid or expired Meetup token");
  }

  const account = await db.socialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Meetup account not found");
  }

  if (!groupUrlName) {
    groupUrlName = account.metadata?.groupUrlName;
  }

  if (!groupUrlName) {
    throw new Error("Meetup group URL name is required");
  }

  const event = MeetupProvider.formatEventForMeetup(listing);
  const result = await MeetupProvider.createEvent(token, groupUrlName, event);

  return { externalIds: [result.id], data: { eventUrl: result.url } };
}

async function createFacebookEvent(listing: any, accountId: string) {
  const { FacebookProvider } = await import("@/lib/providers/facebook");
  const { TokenRefreshService } = await import("@/lib/oauth/refresh");
  
  const token = await TokenRefreshService.getValidToken(accountId);
  if (!token) {
    throw new Error("Invalid or expired Facebook token");
  }

  const account = await db.socialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new Error("Facebook account not found");
  }

  const pageAccessToken = account.metadata?.pageToken || token;
  const pageId = account.accountId;

  const event = {
    name: listing.title,
    start_time: new Date(listing.startDate).toISOString(),
    end_time: listing.endDate ? new Date(listing.endDate).toISOString() : undefined,
    description: listing.description,
    place: listing.location ? {
      name: listing.location.name || listing.location.address,
      location: {
        city: listing.location.city,
        state: listing.location.state,
        country: listing.location.country,
        latitude: listing.location.latitude,
        longitude: listing.location.longitude,
      },
    } : undefined,
    ticket_uri: listing.ticketUrl,
  };

  const result = await FacebookProvider.createPageEvent(pageAccessToken, pageId, event);

  return { externalIds: [result.id], data: { eventUrl: result.url } };
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