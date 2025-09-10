import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { addWebhookJob } from "@/jobs/queue";
import { nanoid } from "@/lib/ids";

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  isActive: boolean;
  businessId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: "pending" | "success" | "failed";
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  deliveredAt: Date;
  retryCount: number;
}

// Webhook events
export const WEBHOOK_EVENTS = {
  // Listings
  LISTING_CREATED: "listing.created",
  LISTING_UPDATED: "listing.updated",
  LISTING_DELETED: "listing.deleted",
  LISTING_PUBLISHED: "listing.published",
  
  // Orders
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_REFUNDED: "order.refunded",
  
  // Availability
  SLOT_CREATED: "slot.created",
  SLOT_UPDATED: "slot.updated",
  SLOT_DELETED: "slot.deleted",
  
  // Social
  SOCIAL_POST_PUBLISHED: "social.post.published",
  SOCIAL_POST_FAILED: "social.post.failed",
  
  // Event Sync
  EVENT_SYNC_PUBLISHED: "event.sync.published",
  EVENT_SYNC_IMPORTED: "event.sync.imported",
  
  // Marketing
  COUPON_CREATED: "coupon.created",
  COUPON_UPDATED: "coupon.updated",
  COUPON_DELETED: "coupon.deleted",
} as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS];

// Sign webhook payload
export const signWebhookPayload = (payload: string, secret: string): string => {
  const crypto = require("crypto");
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
};

// Verify webhook signature
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  const expectedSignature = signWebhookPayload(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
};

// Create webhook endpoint
export const createWebhookEndpoint = async (
  data: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    businessId: string;
  }
): Promise<WebhookEndpoint> => {
  try {
    const webhook = await db.webhookEndpoint.create({
      data: {
        id: nanoid(),
        name: data.name,
        url: data.url,
        events: data.events,
        secret: data.secret || nanoid(32),
        isActive: true,
        businessId: data.businessId,
      },
    });
    
    logger.info(`Created webhook endpoint: ${webhook.name} (${webhook.id})`);
    
    return webhook;
    
  } catch (error) {
    logger.error(`Failed to create webhook endpoint:`, error);
    throw error;
  }
};

// Update webhook endpoint
export const updateWebhookEndpoint = async (
  id: string,
  data: Partial<{
    name: string;
    url: string;
    events: string[];
    secret: string;
    isActive: boolean;
  }>
): Promise<WebhookEndpoint> => {
  try {
    const webhook = await db.webhookEndpoint.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    
    logger.info(`Updated webhook endpoint: ${webhook.name} (${webhook.id})`);
    
    return webhook;
    
  } catch (error) {
    logger.error(`Failed to update webhook endpoint:`, error);
    throw error;
  }
};

// Delete webhook endpoint
export const deleteWebhookEndpoint = async (id: string): Promise<void> => {
  try {
    await db.webhookEndpoint.delete({
      where: { id },
    });
    
    logger.info(`Deleted webhook endpoint: ${id}`);
    
  } catch (error) {
    logger.error(`Failed to delete webhook endpoint:`, error);
    throw error;
  }
};

// Get webhook endpoints for business
export const getWebhookEndpoints = async (
  businessId: string,
  filters: {
    event?: string;
    isActive?: boolean;
  } = {}
): Promise<WebhookEndpoint[]> => {
  try {
    const where: any = { businessId };
    
    if (filters.event) {
      where.events = {
        has: filters.event,
      };
    }
    
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    const webhooks = await db.webhookEndpoint.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    
    return webhooks;
    
  } catch (error) {
    logger.error(`Failed to get webhook endpoints:`, error);
    throw error;
  }
};

// Trigger webhook
export const triggerWebhook = async (
  event: WebhookEvent,
  data: any,
  businessId: string,
  options: {
    delay?: number;
    retryCount?: number;
  } = {}
): Promise<void> => {
  try {
    // Get active webhooks for this event and business
    const webhooks = await getWebhookEndpoints(businessId, {
      event,
      isActive: true,
    });
    
    if (webhooks.length === 0) {
      logger.info(`No webhooks configured for event: ${event}`);
      return;
    }
    
    // Queue webhook jobs
    const jobs = webhooks.map(webhook =>
      addWebhookJob(
        {
          webhookId: webhook.id,
          event,
          data,
          retryCount: options.retryCount || 0,
        },
        {
          delay: options.delay || 0,
        }
      )
    );
    
    await Promise.all(jobs);
    
    logger.info(`Triggered ${webhooks.length} webhooks for event: ${event}`);
    
  } catch (error) {
    logger.error(`Failed to trigger webhook for event ${event}:`, error);
    throw error;
  }
};

// Get webhook delivery history
export const getWebhookDeliveries = async (
  webhookId: string,
  filters: {
    status?: "pending" | "success" | "failed";
    event?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  deliveries: WebhookDelivery[];
  total: number;
  page: number;
  limit: number;
}> => {
  const {
    status,
    event,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;
  
  const where: any = { webhookId };
  
  if (status) where.status = status;
  if (event) where.event = event;
  if (startDate || endDate) {
    where.deliveredAt = {};
    if (startDate) where.deliveredAt.gte = startDate;
    if (endDate) where.deliveredAt.lte = endDate;
  }
  
  try {
    const [deliveries, total] = await Promise.all([
      db.webhookDelivery.findMany({
        where,
        orderBy: { deliveredAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.webhookDelivery.count({ where }),
    ]);
    
    return {
      deliveries,
      total,
      page,
      limit,
    };
    
  } catch (error) {
    logger.error(`Failed to get webhook deliveries:`, error);
    throw error;
  }
};

// Test webhook endpoint
export const testWebhookEndpoint = async (
  webhookId: string,
  testData: any = { test: true, timestamp: new Date().toISOString() }
): Promise<WebhookDelivery> => {
  try {
    const webhook = await db.webhookEndpoint.findUnique({
      where: { id: webhookId },
    });
    
    if (!webhook) {
      throw new Error(`Webhook endpoint not found: ${webhookId}`);
    }
    
    // Create test delivery record
    const delivery = await db.webhookDelivery.create({
      data: {
        id: nanoid(),
        webhookId,
        event: "webhook.test",
        status: "pending",
        deliveredAt: new Date(),
        retryCount: 0,
      },
    });
    
    // Queue the test webhook
    await addWebhookJob({
      webhookId,
      event: "webhook.test",
      data: testData,
      retryCount: 0,
    });
    
    logger.info(`Test webhook queued for endpoint: ${webhook.name}`);
    
    return delivery;
    
  } catch (error) {
    logger.error(`Failed to test webhook endpoint:`, error);
    throw error;
  }
};

// Cleanup old webhook deliveries
export const cleanupOldWebhookDeliveries = async (retentionDays: number = 30): Promise<void> => {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await db.webhookDelivery.deleteMany({
      where: {
        deliveredAt: {
          lt: cutoffDate,
        },
        status: {
          in: ["success", "failed"],
        },
      },
    });
    
    logger.info(`Cleaned up ${result.count} old webhook deliveries`);
    
  } catch (error) {
    logger.error(`Failed to cleanup old webhook deliveries:`, error);
  }
};