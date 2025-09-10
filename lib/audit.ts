import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { nanoid } from "@/lib/ids";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorType: "user" | "system" | "api";
  action: string;
  entityType: string;
  entityId: string;
  businessId: string;
  metadata: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Audit log actions
export const AUDIT_ACTIONS = {
  // Listings
  LISTING_CREATED: "listing.created",
  LISTING_UPDATED: "listing.updated",
  LISTING_DELETED: "listing.deleted",
  LISTING_PUBLISHED: "listing.published",
  LISTING_UNPUBLISHED: "listing.unpublished",
  
  // Orders
  ORDER_CREATED: "order.created",
  ORDER_UPDATED: "order.updated",
  ORDER_CANCELLED: "order.cancelled",
  ORDER_REFUNDED: "order.refunded",
  
  // Availability
  SLOT_CREATED: "slot.created",
  SLOT_UPDATED: "slot.updated",
  SLOT_DELETED: "slot.deleted",
  SLOTS_IMPORTED: "slots.imported",
  SLOTS_EXPORTED: "slots.exported",
  
  // Widgets
  WIDGET_CREATED: "widget.created",
  WIDGET_UPDATED: "widget.updated",
  WIDGET_DELETED: "widget.deleted",
  WIDGET_GENERATED: "widget.generated",
  
  // Social
  SOCIAL_POST_CREATED: "social.post.created",
  SOCIAL_POST_PUBLISHED: "social.post.published",
  SOCIAL_POST_FAILED: "social.post.failed",
  SOCIAL_ACCOUNT_CONNECTED: "social.account.connected",
  SOCIAL_ACCOUNT_DISCONNECTED: "social.account.disconnected",
  
  // Event Sync
  EVENT_SYNC_CREATED: "event.sync.created",
  EVENT_SYNC_UPDATED: "event.sync.updated",
  EVENT_SYNC_DELETED: "event.sync.deleted",
  EVENT_SYNC_PUBLISHED: "event.sync.published",
  EVENT_SYNC_IMPORTED: "event.sync.imported",
  
  // Marketing
  COUPON_CREATED: "coupon.created",
  COUPON_UPDATED: "coupon.updated",
  COUPON_DELETED: "coupon.deleted",
  AFFILIATE_CREATED: "affiliate.created",
  AFFILIATE_UPDATED: "affiliate.updated",
  AFFILIATE_DELETED: "affiliate.deleted",
  
  // Settings
  SETTINGS_UPDATED: "settings.updated",
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  WEBHOOK_CREATED: "webhook.created",
  WEBHOOK_UPDATED: "webhook.updated",
  WEBHOOK_DELETED: "webhook.deleted",
  API_KEY_CREATED: "api.key.created",
  API_KEY_DELETED: "api.key.deleted",
  
  // System
  LOGIN: "user.login",
  LOGOUT: "user.logout",
  PASSWORD_CHANGED: "user.password.changed",
  PERMISSION_CHANGED: "user.permission.changed",
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];

// Create audit log entry
export const logAction = async (
  actorId: string,
  actorType: "user" | "system" | "api",
  action: AuditAction,
  entityType: string,
  entityId: string,
  businessId: string,
  metadata: any = {},
  context?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<AuditLogEntry> => {
  try {
    const auditEntry = await db.auditLog.create({
      data: {
        id: nanoid(),
        actorId,
        actorType,
        action,
        entityType,
        entityId,
        businessId,
        metadata: JSON.stringify(metadata),
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      },
    });
    
    logger.info(`Audit log created: ${action} on ${entityType}:${entityId} by ${actorType}:${actorId}`);
    
    return auditEntry;
    
  } catch (error) {
    logger.error(`Failed to create audit log entry:`, error);
    throw error;
  }
};

// Get audit logs with filtering
export const getAuditLogs = async (filters: {
  businessId: string;
  actorId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}): Promise<{
  logs: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
}> => {
  const {
    businessId,
    actorId,
    action,
    entityType,
    entityId,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = filters;
  
  const where: any = {
    businessId,
  };
  
  if (actorId) where.actorId = actorId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }
  
  try {
    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);
    
    return {
      logs: logs.map(log => ({
        ...log,
        metadata: JSON.parse(log.metadata || "{}"),
      })),
      total,
      page,
      limit,
    };
    
  } catch (error) {
    logger.error(`Failed to get audit logs:`, error);
    throw error;
  }
};

// Audit log middleware for API routes
export const withAuditLog = <T extends any[]>(
  handler: (...args: T) => Promise<any>,
  options: {
    action: AuditAction;
    entityType: string;
    entityIdExtractor: (...args: T) => string;
    metadataExtractor?: (...args: T) => any;
  }
) => {
  return async (...args: T): Promise<any> => {
    const { action, entityType, entityIdExtractor, metadataExtractor } = options;
    
    try {
      // Execute the handler
      const result = await handler(...args);
      
      // Extract context from request
      const request = args[0] as Request;
      const entityId = entityIdExtractor(...args);
      const metadata = metadataExtractor ? metadataExtractor(...args) : {};
      
      // Extract user context (this would come from your auth system)
      const userId = request.headers.get("x-user-id") || "system";
      const businessId = request.headers.get("x-business-id") || "default";
      
      // Log the action
      await logAction(
        userId,
        "user",
        action,
        entityType,
        entityId,
        businessId,
        metadata,
        {
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          userAgent: request.headers.get("user-agent"),
        }
      );
      
      return result;
      
    } catch (error) {
      // Log failed action
      const request = args[0] as Request;
      const entityId = entityIdExtractor(...args);
      
      await logAction(
        request.headers.get("x-user-id") || "system",
        "user",
        action,
        entityType,
        entityId,
        request.headers.get("x-business-id") || "default",
        { error: error.message },
        {
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          userAgent: request.headers.get("user-agent"),
        }
      );
      
      throw error;
    }
  };
};

// Cleanup old audit logs
export const cleanupOldAuditLogs = async (retentionDays: number = 90): Promise<void> => {
  try {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const result = await db.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    logger.info(`Cleaned up ${result.count} old audit log entries`);
    
  } catch (error) {
    logger.error(`Failed to cleanup old audit logs:`, error);
  }
};