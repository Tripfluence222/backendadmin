import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, notFound, badReq, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { z } from 'zod';

const replySchema = z.object({
  reply: z.string().min(1).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const { reply } = replySchema.parse(body);

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
      data: { reply },
      include: {
        customer: true,
        listing: true,
      },
    });

    await logAction(actor, AUDIT_ACTIONS.REVIEW_REPLIED, 'Review', params.id, {
      listingId: review.listingId,
      listingTitle: review.listing.title,
      customerEmail: review.customer.email,
      replyLength: reply.length,
    });

    return ok(updatedReview);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error replying to review:', error);
    return serverErr('Failed to reply to review');
  }
}
