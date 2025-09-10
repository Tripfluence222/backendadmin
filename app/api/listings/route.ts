import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { triggerWebhook, WEBHOOK_EVENTS } from "@/lib/webhooks";
import { createListingSchema, updateListingSchema, listingFiltersSchema } from "@/lib/validation/listings";

// GET /api/listings - List listings with filters
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "listings:read");
    
    const { searchParams } = new URL(request.url);
    const filters = listingFiltersSchema.parse({
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      q: searchParams.get("q") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    });
    
    const where: any = {
      businessId: user.businessId,
    };
    
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { slug: { contains: filters.q, mode: "insensitive" } },
      ];
    }
    
    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
      }),
      db.listing.count({ where }),
    ]);
    
    return ok({
      listings,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid filters", error.errors);
    }
    return serverErr("Failed to fetch listings", error);
  }
}

// POST /api/listings - Create new listing
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "listings:create");
    
    const body = await request.json();
    const data = createListingSchema.parse(body);
    
    const listing = await db.listing.create({
      data: {
        ...data,
        businessId: user.businessId,
        status: "DRAFT",
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
      AUDIT_ACTIONS.LISTING_CREATED,
      "listing",
      listing.id,
      user.businessId,
      { title: listing.title, type: listing.type }
    );
    
    // Trigger webhook
    await triggerWebhook(
      WEBHOOK_EVENTS.LISTING_CREATED,
      listing,
      user.businessId
    );
    
    return NextResponse.json(listing, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid listing data", error.errors);
    }
    return serverErr("Failed to create listing", error);
  }
}

// PATCH /api/listings - Update listing
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "listings:update");
    
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("id");
    
    if (!listingId) {
      return badReq("Listing ID is required");
    }
    
    const body = await request.json();
    const data = updateListingSchema.parse(body);
    
    // Check if listing exists and user has access
    const existingListing = await db.listing.findFirst({
      where: {
        id: listingId,
        businessId: user.businessId,
      },
    });
    
    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
    
    const listing = await db.listing.update({
      where: { id: listingId },
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
