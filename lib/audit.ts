import { db } from './db';
import { Actor } from './auth';

export interface AuditAction {
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, any>;
}

export async function logAction(
  actor: Actor,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, any>
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        businessId: actor.businessId,
        actorUserId: actor.userId,
        action,
        entity,
        entityId,
        meta: meta || {},
        ip: actor.ip,
      },
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Failed to log audit action:', error);
  }
}

export async function getAuditLogs(
  businessId: string,
  page = 1,
  limit = 50
) {
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where: { businessId },
      include: {
        actor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.auditLog.count({
      where: { businessId },
    }),
  ]);

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// Common audit actions
export const AUDIT_ACTIONS = {
  LISTING_CREATED: 'LISTING_CREATED',
  LISTING_UPDATED: 'LISTING_UPDATED',
  LISTING_PUBLISHED: 'LISTING_PUBLISHED',
  LISTING_ARCHIVED: 'LISTING_ARCHIVED',
  
  SLOT_CREATED: 'SLOT_CREATED',
  SLOT_DELETED: 'SLOT_DELETED',
  SLOT_UPDATED: 'SLOT_UPDATED',
  
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_PAID: 'ORDER_PAID',
  ORDER_REFUNDED: 'ORDER_REFUNDED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  
  REVIEW_APPROVED: 'REVIEW_APPROVED',
  REVIEW_REJECTED: 'REVIEW_REJECTED',
  REVIEW_REPLIED: 'REVIEW_REPLIED',
  
  SOCIAL_POST_SCHEDULED: 'SOCIAL_POST_SCHEDULED',
  SOCIAL_POST_PUBLISHED: 'SOCIAL_POST_PUBLISHED',
  
  EVENT_SYNC_PUBLISHED: 'EVENT_SYNC_PUBLISHED',
  EVENT_SYNC_UPDATED: 'EVENT_SYNC_UPDATED',
  
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_DELETED: 'API_KEY_DELETED',
  
  WEBHOOK_ENDPOINT_CREATED: 'WEBHOOK_ENDPOINT_CREATED',
  WEBHOOK_ENDPOINT_UPDATED: 'WEBHOOK_ENDPOINT_UPDATED',
  WEBHOOK_ENDPOINT_DELETED: 'WEBHOOK_ENDPOINT_DELETED',
} as const;
