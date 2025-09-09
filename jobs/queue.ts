import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from '@/lib/env';

const redis = new Redis(env.REDIS_URL);

export const socialQueue = new Queue('social', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const eventSyncQueue = new Queue('event-sync', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const webhookQueue = new Queue('webhook', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Job types
export interface SocialPublishJob {
  postId: string;
}

export interface EventSyncJob {
  eventSyncId: string;
}

export interface WebhookDispatchJob {
  webhookId: string;
  endpointId: string;
  payload: any;
}

// Add jobs
export async function addSocialPublishJob(data: SocialPublishJob) {
  return socialQueue.add('publish', data);
}

export async function addEventSyncJob(data: EventSyncJob) {
  return eventSyncQueue.add('sync', data);
}

export async function addWebhookDispatchJob(data: WebhookDispatchJob) {
  return webhookQueue.add('dispatch', data);
}
