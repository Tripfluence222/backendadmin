import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr, notFound } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { triggerWebhook, WEBHOOK_EVENTS } from "@/lib/webhooks";
import { ListingUpdateSchema } from "@/lib/validation/listings";

// GET /api/listings/[id] - Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "listings:read");
    
    const { id } = await params;
    
    const listing = await db.listing.findFirst({
      where: {
        id,
        businessId: user.businessId,
      },
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });
    
    if (!listing) {
      return notFound("Listing not found");
    }
    
    return ok(listing);
    
  } catch (error) {
    return serverErr("Failed to fetch listing", error);
  }
}

// PATCH /api/listings/[id] - Update listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "listings:update");
    
    const { id } = await params;
    const body = await request.json();
    const data = ListingUpdateSchema.parse(body);
    
    // Check if listing exists and user has access
    const existingListing = await db.listing.findFirst({
      where: {
        id,
        businessId: user.businessId,
      },
    });
    
    if (!existingListing) {
      return notFound("Listing not found");
    }
    
    // Ensure details.kind matches type if type is being updated
    if (data.details && data.type && data.details.kind !== data.type) {
      data.details.kind = data.type as any;
    }
    
    const listing = await db.listing.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.LISTING_UPDATED,
      "listing",
      listing.id,
      user.businessId,
      { 
        title: listing.title, 
        type: listing.type,
        changes: Object.keys(data),
      }
    );
    
    // Trigger webhook
    await triggerWebhook(
      WEBHOOK_EVENTS.LISTING_UPDATED,
      listing,
      user.businessId
    );
    
    return ok(listing);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid listing data", error.errors);
    }
    return serverErr("Failed to update listing", error);
  }
}

// DELETE /api/listings/[id] - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "listings:delete");
    
    const { id } = await params;
    
    // Check if listing exists and user has access
    const existingListing = await db.listing.findFirst({
      where: {
        id,
        businessId: user.businessId,
      },
    });
    
    if (!existingListing) {
      return notFound("Listing not found");
    }
    
    await db.listing.delete({
      where: { id },
    });
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.LISTING_DELETED,
      "listing",
      id,
      user.businessId,
      { 
        title: existingListing.title, 
        type: existingListing.type,
      }
    );
    
    // Trigger webhook
    await triggerWebhook(
      WEBHOOK_EVENTS.LISTING_DELETED,
      { id, ...existingListing },
      user.businessId
    );
    
    return ok({ success: true });
    
  } catch (error) {
    return serverErr("Failed to delete listing", error);
  }
}

