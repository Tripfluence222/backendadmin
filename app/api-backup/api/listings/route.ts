import { NextRequest } from 'next/server';
import { getActor, requireAuth } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, badReq, unauth, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { createListingSchema, listingFiltersSchema } from '@/lib/validation/listings';

export async function GET(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const { searchParams } = new URL(request.url);
    const filters = listingFiltersSchema.parse({
      type: searchParams.get('type'),
      status: searchParams.get('status'),
      q: searchParams.get('q'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    const where: any = {
      businessId: actor.businessId,
    };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          inventorySlots: {
            select: {
              id: true,
              start: true,
              end: true,
              capacity: true,
              remaining: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.listing.count({ where }),
    ]);

    return ok({
      listings,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return serverErr('Failed to fetch listings');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const data = createListingSchema.parse(body);

    // Check if slug is unique within business
    const existingListing = await db.listing.findUnique({
      where: {
        businessId_slug: {
          businessId: actor.businessId,
          slug: data.slug,
        },
      },
    });

    if (existingListing) {
      return badReq('Slug already exists');
    }

    const listing = await db.listing.create({
      data: {
        ...data,
        businessId: actor.businessId,
      },
      include: {
        inventorySlots: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    await logAction(actor, AUDIT_ACTIONS.LISTING_CREATED, 'Listing', listing.id, {
      title: listing.title,
      type: listing.type,
    });

    return ok(listing, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error creating listing:', error);
    return serverErr('Failed to create listing');
  }
}
