import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";

const logsQuerySchema = z.object({
  businessId: z.string().cuid(),
  type: z.enum(["all", "webhook", "audit"]).default("all"),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// GET /api/integrations/logs - Get integration logs
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "integrations:read");
    
    const { searchParams } = new URL(request.url);
    const query = logsQuerySchema.parse({
      businessId: searchParams.get("businessId") || user?.businessId || "default",
      type: searchParams.get("type") || "all",
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    });
    
    // Verify user has access to business
    if (user?.businessId && user.businessId !== query.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    const logs = [];
    
    // Get webhook deliveries if requested
    if (query.type === "all" || query.type === "webhook") {
      try {
        const webhookLogs = await db.webhookDelivery.findMany({
          where: {
            businessId: query.businessId,
          },
          orderBy: { createdAt: "desc" },
          take: query.limit,
          skip: query.offset,
        });
        
        logs.push(...(webhookLogs || []).map(log => ({
          id: log.id,
          type: "webhook",
          createdAt: log.createdAt,
          eventType: log.eventType,
          status: log.status,
          durationMs: log.durationMs,
          requestBody: log.requestBody,
          responseBody: log.responseBody,
          endpointId: log.endpointId,
        })));
      } catch (error) {
        // Table might not exist, continue without webhook logs
        console.warn("Webhook logs table not available:", error);
      }
    }
    
    // Get audit logs if requested
    if (query.type === "all" || query.type === "audit") {
      try {
        const auditLogs = await db.auditLog.findMany({
          where: {
            businessId: query.businessId,
            action: {
              in: [
                "PROVIDER_CONNECTED",
                "PROVIDER_DISCONNECTED",
                "PROVIDER_RECONNECT_REQUESTED",
                "PROVIDER_REFRESHED",
                "SOCIAL_POST_PUBLISHED",
                "SOCIAL_POST_FAILED",
                "SOCIAL_TEST_POST",
                "EVENT_PUBLISHED",
                "EVENT_UPDATED",
                "EVENT_FAILED",
                "EVENT_TEST_PUBLISH",
              ],
            },
          },
          orderBy: { createdAt: "desc" },
          take: query.limit,
          skip: query.offset,
        });
        
        logs.push(...(auditLogs || []).map(log => ({
          id: log.id,
          type: "audit",
          createdAt: log.createdAt,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          actorType: log.actorType,
          actorId: log.actorId,
          metadata: log.metadata,
        })));
      } catch (error) {
        // Table might not exist, continue without audit logs
        console.warn("Audit logs table not available:", error);
      }
    }
    
    // Sort combined logs by creation date
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Limit to requested number
    const limitedLogs = logs.slice(0, query.limit);
    
    return ok({
      logs: limitedLogs,
      total: logs.length,
      hasMore: logs.length > query.limit,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid query parameters", error.errors);
    }
    return serverErr("Failed to fetch integration logs", error);
  }
}
