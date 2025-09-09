import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { ok, unauth, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { orderFiltersSchema } from '@/lib/validation/orders';

export async function GET(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const { searchParams } = new URL(request.url);
    const filters = orderFiltersSchema.parse({
      status: searchParams.get('status'),
      customerEmail: searchParams.get('customerEmail'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    const where: any = {
      businessId: actor.businessId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.customerEmail) where.customerEmail = filters.customerEmail;
    if (filters.from) where.createdAt = { gte: new Date(filters.from) };
    if (filters.to) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.to),
      };
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          payments: {
            select: {
              id: true,
              provider: true,
              status: true,
              amount: true,
            },
          },
          orderItems: {
            include: {
              listing: {
                select: {
                  id: true,
                  title: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.order.count({ where }),
    ]);

    return ok({
      orders,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return serverErr('Failed to fetch orders');
  }
}
