import { Queue, Worker, Job } from "bullmq";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Redis connection
export const connection = {
  host: env.REDIS_URL ? new URL(env.REDIS_URL).hostname : "localhost",
  port: env.REDIS_URL ? parseInt(new URL(env.REDIS_URL).port) : 6379,
  password: env.REDIS_URL ? new URL(env.REDIS_URL).password : undefined,
};

// Queue definitions
export const socialQueue = new Queue("social", { connection });
export const eventSyncQueue = new Queue("event-sync", { connection });
export const webhookQueue = new Queue("webhook", { connection });
export const emailQueue = new Queue("email", { connection });
export const smsQueue = new Queue("sms", { connection });
export const spaceQueue = new Queue("space", { connection });

// Job types
export interface SocialPublishJob {
  postId: string;
  platforms: string[];
  content: string;
  mediaUrls?: string[];
  scheduledAt?: string;
}

export interface EventSyncJob {
  eventSyncId: string;
  direction: "import" | "export";
  forceUpdate?: boolean;
}

export interface WebhookJob {
  webhookId: string;
  event: string;
  data: any;
  retryCount?: number;
}

export interface EmailJob {
  to: string | string[];
  subject: string;
  template: string;
  data: any;
  priority?: "high" | "normal" | "low";
}

export interface SMSJob {
  to: string;
  message: string;
  template?: string;
  data?: any;
}

export interface SpaceHoldExpireJob {
  requestId: string;
  expiresAt: Date;
}

// Queue management functions
export const addSocialPublishJob = async (jobData: SocialPublishJob, options?: any) => {
  return socialQueue.add("publish", jobData, {
    delay: jobData.scheduledAt ? new Date(jobData.scheduledAt).getTime() - Date.now() : 0,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    ...options,
  });
};

export const addEventSyncJob = async (jobData: EventSyncJob, options?: any) => {
  return eventSyncQueue.add("sync", jobData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    ...options,
  });
};

export const addWebhookJob = async (jobData: WebhookJob, options?: any) => {
  return webhookQueue.add("dispatch", jobData, {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    ...options,
  });
};

export const addEmailJob = async (jobData: EmailJob, options?: any) => {
  return emailQueue.add("send", jobData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    ...options,
  });
};

export const addSMSJob = async (jobData: SMSJob, options?: any) => {
  return smsQueue.add("send", jobData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    ...options,
  });
};

export const addSpaceHoldExpireJob = async (jobData: SpaceHoldExpireJob, options?: any) => {
  return spaceQueue.add("hold-expire", jobData, {
    attempts: 1, // Only try once for hold expiry
    ...options,
  });
};

// Generic addJob function for convenience
export const addJob = async (queueName: string, jobData: any, options?: any) => {
  switch (queueName) {
    case 'socialPublish':
      return addSocialPublishJob(jobData, options);
    case 'eventSync':
      return addEventSyncJob(jobData, options);
    case 'webhook':
      return addWebhookJob(jobData, options);
    case 'email':
      return addEmailJob(jobData, options);
    case 'sms':
      return addSMSJob(jobData, options);
    case 'spaceHoldExpire':
      return addSpaceHoldExpireJob(jobData, options);
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
};

// Queue monitoring
export const getQueueStats = async () => {
  const [socialStats, eventSyncStats, webhookStats, emailStats, smsStats, spaceStats] = await Promise.all([
    socialQueue.getJobCounts(),
    eventSyncQueue.getJobCounts(),
    webhookQueue.getJobCounts(),
    emailQueue.getJobCounts(),
    smsQueue.getJobCounts(),
    spaceQueue.getJobCounts(),
  ]);

  return {
    social: socialStats,
    eventSync: eventSyncStats,
    webhook: webhookStats,
    email: emailStats,
    sms: smsStats,
    space: spaceStats,
  };
};

// Cleanup old jobs
export const cleanupOldJobs = async () => {
  const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
  
  await Promise.all([
    socialQueue.clean(cutoffTime, 100, "completed"),
    socialQueue.clean(cutoffTime, 100, "failed"),
    eventSyncQueue.clean(cutoffTime, 100, "completed"),
    eventSyncQueue.clean(cutoffTime, 100, "failed"),
    webhookQueue.clean(cutoffTime, 100, "completed"),
    webhookQueue.clean(cutoffTime, 100, "failed"),
    emailQueue.clean(cutoffTime, 100, "completed"),
    emailQueue.clean(cutoffTime, 100, "failed"),
    smsQueue.clean(cutoffTime, 100, "completed"),
    smsQueue.clean(cutoffTime, 100, "failed"),
    spaceQueue.clean(cutoffTime, 100, "completed"),
    spaceQueue.clean(cutoffTime, 100, "failed"),
  ]);
  
  logger.info("Cleaned up old jobs");
};

// Graceful shutdown
export const closeQueues = async () => {
  await Promise.all([
    socialQueue.close(),
    eventSyncQueue.close(),
    webhookQueue.close(),
    emailQueue.close(),
    smsQueue.close(),
    spaceQueue.close(),
  ]);
  
  logger.info("All queues closed");
};