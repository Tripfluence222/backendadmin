import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { dispatchWebhook } from '@/lib/webhooks';
import { socialQueue, eventSyncQueue, webhookQueue, SocialPublishJob, EventSyncJob, WebhookDispatchJob } from './queue';

const redis = new Redis(env.REDIS_URL);

// Social publishing worker
const socialWorker = new Worker(
  'social',
  async (job) => {
    const { postId } = job.data as SocialPublishJob;
    
    console.log(`Processing social post ${postId}`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const post = await db.socialPost.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      throw new Error(`Social post ${postId} not found`);
    }
    
    // Simulate publishing to social platforms
    const results: Record<string, any> = {};
    
    for (const target of post.targets) {
      try {
        // Simulate platform-specific publishing
        await new Promise(resolve => setTimeout(resolve, 200));
        
        results[target] = {
          success: true,
          externalId: `post_${target}_${Date.now()}`,
          url: `https://${target}.com/posts/${Date.now()}`,
          publishedAt: new Date().toISOString(),
        };
      } catch (error) {
        results[target] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
    
    // Update post with results
    await db.socialPost.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        results,
      },
    });
    
    console.log(`Social post ${postId} published successfully`);
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

// Event sync worker
const eventSyncWorker = new Worker(
  'event-sync',
  async (job) => {
    const { eventSyncId } = job.data as EventSyncJob;
    
    console.log(`Processing event sync ${eventSyncId}`);
    
    const eventSync = await db.eventSync.findUnique({
      where: { id: eventSyncId },
      include: {
        listing: true,
      },
    });
    
    if (!eventSync) {
      throw new Error(`Event sync ${eventSyncId} not found`);
    }
    
    // Simulate external platform sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const externalIds: Record<string, string> = {};
    
    for (const target of eventSync.targets) {
      try {
        // Simulate platform-specific event creation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        externalIds[target] = `event_${target}_${Date.now()}`;
      } catch (error) {
        console.error(`Failed to sync to ${target}:`, error);
      }
    }
    
    // Update event sync with external IDs
    await db.eventSync.update({
      where: { id: eventSyncId },
      data: {
        status: 'PUBLISHED',
        externalIds,
        lastSyncAt: new Date(),
      },
    });
    
    console.log(`Event sync ${eventSyncId} completed successfully`);
  },
  {
    connection: redis,
    concurrency: 3,
  }
);

// Webhook dispatch worker
const webhookWorker = new Worker(
  'webhook',
  async (job) => {
    const { webhookId, endpointId, payload } = job.data as WebhookDispatchJob;
    
    console.log(`Dispatching webhook ${webhookId} to endpoint ${endpointId}`);
    
    try {
      const result = await dispatchWebhook(endpointId, payload);
      
      console.log(`Webhook ${webhookId} dispatched successfully:`, result);
      
      return result;
    } catch (error) {
      console.error(`Webhook ${webhookId} dispatch failed:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 10,
  }
);

// Error handling
socialWorker.on('error', (error) => {
  console.error('Social worker error:', error);
});

eventSyncWorker.on('error', (error) => {
  console.error('Event sync worker error:', error);
});

webhookWorker.on('error', (error) => {
  console.error('Webhook worker error:', error);
});

console.log('Background workers started');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down workers...');
  await Promise.all([
    socialWorker.close(),
    eventSyncWorker.close(),
    webhookWorker.close(),
  ]);
  await redis.disconnect();
  process.exit(0);
});
