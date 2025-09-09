import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, notFound, serverErr } from '@/lib/http';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const review = await db.review.findFirst({
      where: {
        id: params.id,
        businessId: actor.businessId,
      },
      include: {
        customer: true,
        listing: true,
      },
    });

    if (!review) {
      return notFound('Review not found');
    }

    const updatedReview = await db.review.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
      include: {
        customer: true,
        listing: true,
      },
    });

    await logAction(actor, AUDIT_ACTIONS.REVIEW_APPROVED, 'Review', params.id, {
      listingId: review.listingId,
      listingTitle: review.listing.title,
      customerEmail: review.customer.email,
      rating: review.rating,
    });

    return ok(updatedReview);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error approving review:', error);
    return serverErr('Failed to approve review');
  }
}
