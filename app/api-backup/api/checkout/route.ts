import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, badReq, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { checkoutSchema } from '@/lib/validation/orders';
import { createOrderId, createPaymentId } from '@/lib/ids';

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Price the cart first
    const pricingResponse = await fetch(`${request.nextUrl.origin}/api/cart/price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        items: data.items,
        couponCode: data.couponCode,
      }),
    });

    if (!pricingResponse.ok) {
      return badReq('Failed to price cart');
    }

    const pricing = await pricingResponse.json();

    // Find or create customer
    let customer = await db.customer.findUnique({
      where: {
        businessId_email: {
          businessId: actor.businessId,
          email: data.customerEmail,
        },
      },
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          businessId: actor.businessId,
          email: data.customerEmail,
          name: data.customerName,
          phone: data.customerPhone,
        },
      });
    }

    // Create order
    const order = await db.order.create({
      data: {
        id: createOrderId(),
        businessId: actor.businessId,
        customerId: customer.id,
        total: pricing.data.total,
        currency: 'USD',
        status: 'PENDING',
        items: data.items,
        metadata: data.metadata || {},
      },
    });

    // Create order items
    await db.orderItem.createMany({
      data: data.items.map((item: any) => ({
        orderId: order.id,
        listingId: item.listingId,
        quantity: item.quantity,
        price: item.unitPrice,
        metadata: {},
      })),
    });

    // Create payment record
    const payment = await db.payment.create({
      data: {
        id: createPaymentId(),
        orderId: order.id,
        provider: 'TEST',
        amount: pricing.data.total,
        currency: 'USD',
        status: 'AUTHORIZED',
        raw: {
          clientSecret: `pi_test_${Math.random().toString(36).substr(2, 9)}`,
          paymentMethod: 'test',
        },
      },
    });

    await logAction(actor, AUDIT_ACTIONS.ORDER_CREATED, 'Order', order.id, {
      customerEmail: data.customerEmail,
      total: pricing.data.total,
      itemCount: data.items.length,
    });

    return ok({
      order,
      payment,
      clientSecret: payment.raw.clientSecret,
    }, 201);
  } catch (error) {
    console.error('Error creating checkout:', error);
    return serverErr('Failed to create checkout');
  }
}
