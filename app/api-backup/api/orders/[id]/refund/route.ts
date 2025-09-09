import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, notFound, conflict, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { refundOrderSchema } from '@/lib/validation/orders';
import { getIdempotencyKey, checkIdempotency, storeIdempotency } from '@/lib/idempotency';
import { dispatchToAllEndpoints } from '@/lib/webhooks';
import { createPaymentId } from '@/lib/ids';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const { reason, amount } = refundOrderSchema.parse(body);

    // Check idempotency
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (idempotencyKey) {
      const key = await getIdempotencyKey(idempotencyKey, actor.userId, `/orders/${params.id}/refund`);
      const cached = await checkIdempotency(key);
      if (cached) {
        return ok(cached);
      }
    }

    const order = await db.order.findFirst({
      where: {
        id: params.id,
        businessId: actor.businessId,
      },
      include: {
        customer: true,
        payments: true,
        orderItems: {
          include: {
            listing: true,
          },
        },
      },
    });

    if (!order) {
      return notFound('Order not found');
    }

    if (order.status !== 'PAID') {
      return conflict('Order is not in a refundable state');
    }

    const refundAmount = amount || order.total;

    // Create refund payment record
    const refundPayment = await db.payment.create({
      data: {
        id: createPaymentId(),
        orderId: order.id,
        provider: 'TEST', // In production, use actual provider
        amount: refundAmount,
        currency: order.currency,
        status: 'REFUNDED',
        raw: {
          reason,
          refundedBy: actor.userId,
          refundedAt: new Date().toISOString(),
        },
      },
    });

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED' },
      include: {
        customer: true,
        payments: true,
        orderItems: {
          include: {
            listing: true,
          },
        },
      },
    });

    await logAction(actor, AUDIT_ACTIONS.ORDER_REFUNDED, 'Order', order.id, {
      refundAmount,
      reason,
      refundPaymentId: refundPayment.id,
    });

    // Dispatch webhook
    try {
      await dispatchToAllEndpoints(actor.businessId, {
        event: 'order.refunded',
        data: {
          order: updatedOrder,
          refund: refundPayment,
        },
      });
    } catch (webhookError) {
      console.error('Webhook dispatch failed:', webhookError);
      // Don't fail the refund if webhook fails
    }

    const response = {
      order: updatedOrder,
      refund: refundPayment,
    };

    // Store idempotency response
    if (idempotencyKey) {
      const key = await getIdempotencyKey(idempotencyKey, actor.userId, `/orders/${params.id}/refund`);
      await storeIdempotency(key, response);
    }

    return ok(response);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error processing refund:', error);
    return serverErr('Failed to process refund');
  }
}
