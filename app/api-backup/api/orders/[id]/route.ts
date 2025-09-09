import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { ok, unauth, notFound, serverErr } from '@/lib/http';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

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
            listing: {
              select: {
                id: true,
                title: true,
                type: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return notFound('Order not found');
    }

    return ok(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return serverErr('Failed to fetch order');
  }
}
