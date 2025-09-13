import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { addEventSyncJob } from "@/jobs/queue";
import { nanoid } from "@/lib/ids";
import { env } from "@/lib/env";
import { isEventProvider } from "@/lib/providers";

const testEventSchema = z.object({
  accountId: z.string().cuid(),
  listingId: z.string().cuid().optional(),
  title: z.string().optional().default("Test Event from Tripfluence Admin"),
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
});

// POST /api/integrations/test-event - Send test event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "integrations:test");
    
    const body = await request.json();
    const data = testEventSchema.parse(body);
    
    // Get the account and verify access
    const account = await db.socialAccount.findUnique({
      where: { id: data.accountId },
      include: { business: true },
    });
    
    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }
    
    // Verify user has access to business
    if (user.businessId !== account.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Check if account is active
    if (!account.isActive) {
      return badReq("Account is not active");
    }
    
    // Check if provider supports events
    if (!isEventProvider(account.provider)) {
      return badReq("Provider does not support event publishing");
    }
    
    let listing;
    
    if (data.listingId) {
      // Use existing listing
      listing = await db.listing.findFirst({
        where: {
          id: data.listingId,
          businessId: account.businessId,
        },
      });
      
      if (!listing) {
        return NextResponse.json(
          { error: "Listing not found" },
          { status: 404 }
        );
      }
    } else {
      // Create a test listing
      const startDate = data.start ? new Date(data.start) : new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const endDate = data.end ? new Date(data.end) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      listing = await db.listing.create({
        data: {
          id: nanoid(),
          businessId: account.businessId,
          title: data.title,
          description: "This is a test event created from Tripfluence Admin",
          type: "EVENT",
          status: "DRAFT",
          startDate,
          endDate,
          capacity: 10,
          price: 0,
          currency: "USD",
          location: {
            name: "Test Venue",
            address: "123 Test Street",
            city: "Test City",
            state: "TS",
            country: "US",
          },
          metadata: {
            isTestEvent: true,
            accountId: data.accountId,
          },
        },
      });
    }
    
    // Create test event sync
    const testEventSync = await db.eventSync.create({
      data: {
        id: nanoid(),
        businessId: account.businessId,
        listingId: listing.id,
        name: `${listing.title} - Test Sync`,
        platforms: [account.provider.toLowerCase().replace("_", "")],
        syncDirection: "export",
        status: "ACTIVE",
        lastSyncStatus: "PENDING",
        metadata: {
          isTestEvent: true,
          accountId: data.accountId,
          useRealProviders: env.FEATURE_REAL_PROVIDERS,
        },
      },
    });
    
    // Queue for immediate sync
    const syncJob = await addEventSyncJob({
      eventSyncId: testEventSync.id,
      direction: "export",
      forceUpdate: true,
    });
    
    // Update event sync with job ID
    await db.eventSync.update({
      where: { id: testEventSync.id },
      data: {
        metadata: {
          ...testEventSync.metadata,
          jobId: syncJob.id,
        },
      },
    });
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.EVENT_TEST_PUBLISH,
      "event_sync",
      testEventSync.id,
      account.businessId,
      { 
        provider: account.provider,
        accountName: account.accountName,
        listingTitle: listing.title,
        isTestEvent: true,
      }
    );
    
    return ok({
      message: "Test event queued successfully",
      eventSyncId: testEventSync.id,
      listingId: listing.id,
      jobId: syncJob.id,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid test event data", error.errors);
    }
    return serverErr("Failed to send test event", error);
  }
}
