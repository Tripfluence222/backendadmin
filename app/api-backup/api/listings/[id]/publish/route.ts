import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, notFound, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { publishListingSchema } from '@/lib/validation/listings';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const { status } = publishListingSchema.parse(body);

    const existingListing = await db.listing.findFirst({
      where: {
        id: params.id,
        businessId: actor.businessId,
      },
    });

    if (!existingListing) {
      return notFound('Listing not found');
    }

    const listing = await db.listing.update({
      where: { id: params.id },
      data: { status },
      include: {
        inventorySlots: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    await logAction(actor, AUDIT_ACTIONS.LISTING_PUBLISHED, 'Listing', listing.id, {
      previousStatus: existingListing.status,
      newStatus: status,
    });

    return ok(listing);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error publishing listing:', error);
    return serverErr('Failed to publish listing');
  }
}
