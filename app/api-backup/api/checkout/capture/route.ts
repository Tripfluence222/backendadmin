import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, badReq, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { capturePaymentSchema } from '@/lib/validation/orders';
import { dispatchToAllEndpoints } from '@/lib/webhooks';

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const body = await request.json();
    const { paymentIntentId } = capturePaymentSchema.parse(body);

    // Find the payment
    const payment = await db.payment.findFirst({
      where: {
        id: paymentIntentId,
        order: {
          businessId: actor.businessId,
        },
      },
      include: {
        order: {
          include: {
            customer: true,
            orderItems: {
              include: {
                listing: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return badReq('Payment not found');
    }

    if (payment.status !== 'AUTHORIZED') {
      return badReq('Payment is not in a capturable state');
    }

    // Update payment status
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: { status: 'CAPTURED' },
    });

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: payment.orderId },
      data: { status: 'PAID' },
      include: {
        customer: true,
        orderItems: {
          include: {
            listing: true,
          },
        },
      },
    });

    await logAction(actor, AUDIT_ACTIONS.ORDER_PAID, 'Order', payment.orderId, {
      paymentId: payment.id,
      amount: payment.amount,
    });

    // Dispatch webhook
    try {
      await dispatchToAllEndpoints(actor.businessId, {
        event: 'order.paid',
        data: {
          order: updatedOrder,
          payment: updatedPayment,
        },
      });
    } catch (webhookError) {
      console.error('Webhook dispatch failed:', webhookError);
      // Don't fail the capture if webhook fails
    }

    return ok({
      order: updatedOrder,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error('Error capturing payment:', error);
    return serverErr('Failed to capture payment');
  }
}
