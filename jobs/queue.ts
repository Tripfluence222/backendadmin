import { Queue, Worker, Job } from "bullmq";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Redis connection
export const connection = env.REDIS_URL ? {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port),
  password: new URL(env.REDIS_URL).password,
} : null;

// Queue definitions - only create if Redis is configured
export const socialQueue = connection ? new Queue("social", { connection }) : null;
export const eventSyncQueue = connection ? new Queue("event-sync", { connection }) : null;
export const webhookQueue = connection ? new Queue("webhook", { connection }) : null;
export const emailQueue = connection ? new Queue("email", { connection }) : null;
export const smsQueue = connection ? new Queue("sms", { connection }) : null;
export const spaceQueue = connection ? new Queue("space", { connection }) : null;

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
  if (!socialQueue) {
    logger.warn("Redis not configured, skipping social publish job");
    return null;
  }
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
  if (!eventSyncQueue) {
    logger.warn("Redis not configured, skipping event sync job");
    return null;
  }
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
  if (!webhookQueue) {
    logger.warn("Redis not configured, skipping webhook job");
    return null;
  }
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
  if (!emailQueue) {
    logger.warn("Redis not configured, skipping email job");
    return null;
  }
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
  if (!smsQueue) {
    logger.warn("Redis not configured, skipping SMS job");
    return null;
  }
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
  if (!spaceQueue) {
    logger.warn("Redis not configured, skipping space hold expire job");
    return null;
  }
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
  if (!env.REDIS_URL) {
    return {
      social: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      eventSync: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      webhook: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      email: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      sms: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      space: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
    };
  }

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
  if (!connection) {
    logger.info("Redis not configured, skipping cleanup");
    return;
  }
  
  const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago
  
  const cleanupPromises = [];
  if (socialQueue) cleanupPromises.push(socialQueue.clean(cutoffTime, 100, "completed"), socialQueue.clean(cutoffTime, 100, "failed"));
  if (eventSyncQueue) cleanupPromises.push(eventSyncQueue.clean(cutoffTime, 100, "completed"), eventSyncQueue.clean(cutoffTime, 100, "failed"));
  if (webhookQueue) cleanupPromises.push(webhookQueue.clean(cutoffTime, 100, "completed"), webhookQueue.clean(cutoffTime, 100, "failed"));
  if (emailQueue) cleanupPromises.push(emailQueue.clean(cutoffTime, 100, "completed"), emailQueue.clean(cutoffTime, 100, "failed"));
  if (smsQueue) cleanupPromises.push(smsQueue.clean(cutoffTime, 100, "completed"), smsQueue.clean(cutoffTime, 100, "failed"));
  if (spaceQueue) cleanupPromises.push(spaceQueue.clean(cutoffTime, 100, "completed"), spaceQueue.clean(cutoffTime, 100, "failed"));
  
  await Promise.all(cleanupPromises);
  
  logger.info("Cleaned up old jobs");
};

// Graceful shutdown
export const closeQueues = async () => {
  const closePromises = [];
  if (socialQueue) closePromises.push(socialQueue.close());
  if (eventSyncQueue) closePromises.push(eventSyncQueue.close());
  if (webhookQueue) closePromises.push(webhookQueue.close());
  if (emailQueue) closePromises.push(emailQueue.close());
  if (smsQueue) closePromises.push(smsQueue.close());
  if (spaceQueue) closePromises.push(spaceQueue.close());
  
  await Promise.all(closePromises);
  
  logger.info("All queues closed");
};