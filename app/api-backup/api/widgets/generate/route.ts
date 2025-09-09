import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { ok, unauth, badReq, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { generateWidgetSchema } from '@/lib/validation/widgets';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const body = await request.json();
    const { widgetType, filters, theme, settings } = generateWidgetSchema.parse(body);

    // Get listings based on filters
    const where: any = {
      businessId: actor.businessId,
      status: 'PUBLISHED',
    };

    if (filters.listingId) where.id = filters.listingId;
    if (filters.category) where.type = filters.category;
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };

    const listings = await db.listing.findMany({
      where,
      include: {
        inventorySlots: {
          where: {
            start: { gte: new Date() },
            remaining: { gt: 0 },
          },
          orderBy: { start: 'asc' },
          take: 10,
        },
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            customer: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    // Generate widget configuration
    const config = {
      widgetType,
      filters,
      theme,
      settings,
      listings: listings.map(listing => ({
        id: listing.id,
        title: listing.title,
        type: listing.type,
        location: listing.location,
        price: listing.price,
        currency: listing.currency,
        capacity: listing.capacity,
        nextAvailable: listing.inventorySlots[0]?.start,
        rating: listing.reviews.length > 0 
          ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length 
          : null,
        reviewCount: listing.reviews.length,
      })),
    };

    // Generate embed codes
    const configParam = encodeURIComponent(JSON.stringify(config));
    const previewUrl = `${env.WIDGET_ORIGIN}/widgets/preview?config=${configParam}`;
    
    const script = `<script src="${env.WIDGET_ORIGIN}/widgets/embed.js" data-config="${configParam}"></script>`;
    const iframe = `<iframe src="${previewUrl}" width="100%" height="600" frameborder="0" style="border-radius: ${theme.borderRadius === 'none' ? '0' : theme.borderRadius === 'small' ? '4px' : theme.borderRadius === 'medium' ? '8px' : '12px'}"></iframe>`;

    return ok({
      script,
      iframe,
      previewUrl,
      config,
    });
  } catch (error) {
    console.error('Error generating widget:', error);
    return serverErr('Failed to generate widget');
  }
}
