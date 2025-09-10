import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { addEventSyncJob } from "@/jobs/queue";
import { nanoid } from "@/lib/ids";
import { env } from "@/lib/env";

const publishEventSyncSchema = z.object({
  businessId: z.string().cuid(),
  listingId: z.string().cuid(),
  targets: z.array(z.enum(["facebook", "eventbrite", "meetup"])).min(1),
  metadata: z.object({
    meetupGroup: z.string().optional(),
  }).optional(),
});

// POST /api/event-sync/publish - Publish event to external platforms
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "eventsync:publish");
    
    const body = await request.json();
    const data = publishEventSyncSchema.parse(body);
    
    // Verify user has access to business
    if (user.businessId !== data.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Get listing details
    const listing = await db.listing.findFirst({
      where: {
        id: data.listingId,
        businessId: data.businessId,
      },
    });
    
    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
    
    // Check if real providers are enabled
    const useRealProviders = env.FEATURE_REAL_PROVIDERS;
    
    // Verify connected accounts for target platforms
    const connectedAccounts = await db.socialAccount.findMany({
      where: {
        businessId: data.businessId,
        provider: {
          in: data.targets.map(target => {
            switch (target) {
              case "facebook": return "FACEBOOK_PAGE";
              case "eventbrite": return "EVENTBRITE";
              case "meetup": return "MEETUP";
              default: return target.toUpperCase();
            }
          }),
        },
        isActive: true,
      },
    });
    
    if (connectedAccounts.length === 0) {
      return badReq("No connected accounts found for the specified platforms");
    }
    
    // Create or update event sync
    const eventSync = await db.eventSync.upsert({
      where: {
        businessId_listingId: {
          businessId: data.businessId,
          listingId: data.listingId,
        },
      },
      update: {
        platforms: data.targets,
        metadata: data.metadata,
        lastSyncStatus: "PENDING",
        lastSyncAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: nanoid(),
        businessId: data.businessId,
        listingId: data.listingId,
        name: `${listing.title} - Event Sync`,
        platforms: data.targets,
        syncDirection: "export",
        status: "ACTIVE",
        lastSyncStatus: "PENDING",
        metadata: {
          ...data.metadata,
          useRealProviders,
          connectedAccounts: connectedAccounts.map(acc => ({
            id: acc.id,
            provider: acc.provider,
            accountName: acc.accountName,
          })),
        },
      },
    });
    
    // Queue for sync
    const syncJob = await addEventSyncJob({
      eventSyncId: eventSync.id,
      direction: "export",
      forceUpdate: true,
    });
    
    // Update event sync with job ID
    await db.eventSync.update({
      where: { id: eventSync.id },
      data: {
        metadata: {
          ...eventSync.metadata,
          jobId: syncJob.id,
        },
      },
    });
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.EVENT_SYNC_PUBLISHED,
      "event_sync",
      eventSync.id,
      data.businessId,
      { 
        platforms: data.targets,
        listingTitle: listing.title,
        useRealProviders,
      }
    );
    
    return ok({
      eventSync,
      message: "Event sync queued successfully",
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid publish data", error.errors);
    }
    return serverErr("Failed to publish event sync", error);
  }
}
