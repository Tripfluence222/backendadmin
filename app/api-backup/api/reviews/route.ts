import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { ok, unauth, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { reviewFiltersSchema } from '@/lib/validation/reviews';

export async function GET(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const { searchParams } = new URL(request.url);
    const filters = reviewFiltersSchema.parse({
      status: searchParams.get('status'),
      listingId: searchParams.get('listingId'),
      rating: searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    const where: any = {
      businessId: actor.businessId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.listingId) where.listingId = filters.listingId;
    if (filters.rating) where.rating = filters.rating;

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.review.count({ where }),
    ]);

    return ok({
      reviews,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return serverErr('Failed to fetch reviews');
  }
}
