import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, badReq, unauth, notFound, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { updateListingSchema } from '@/lib/validation/listings';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const data = updateListingSchema.parse(body);

    const existingListing = await db.listing.findFirst({
      where: {
        id: params.id,
        businessId: actor.businessId,
      },
    });

    if (!existingListing) {
      return notFound('Listing not found');
    }

    // Check slug uniqueness if being updated
    if (data.slug && data.slug !== existingListing.slug) {
      const slugExists = await db.listing.findUnique({
        where: {
          businessId_slug: {
            businessId: actor.businessId,
            slug: data.slug,
          },
        },
      });

      if (slugExists) {
        return badReq('Slug already exists');
      }
    }

    const listing = await db.listing.update({
      where: { id: params.id },
      data,
      include: {
        inventorySlots: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    await logAction(actor, AUDIT_ACTIONS.LISTING_UPDATED, 'Listing', listing.id, {
      changes: data,
      previousStatus: existingListing.status,
      newStatus: listing.status,
    });

    return ok(listing);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error updating listing:', error);
    return serverErr('Failed to update listing');
  }
}
