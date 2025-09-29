import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PublicSpaceListSchema } from '@/lib/validation/space';
import { getMinHourlyRate } from '@/lib/space/pricing';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/public/space - Public space listing for discovery
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = PublicSpaceListSchema.parse({
      city: searchParams.get('city'),
      priceMin: searchParams.get('priceMin'),
      priceMax: searchParams.get('priceMax'),
      capacity: searchParams.get('capacity'),
      amenities: searchParams.get('amenities')?.split(','),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sort: searchParams.get('sort'),
      lat: searchParams.get('lat'),
      lng: searchParams.get('lng'),
      radius: searchParams.get('radius'),
    });

    const where: any = {
      status: 'PUBLISHED',
    };

    // City filter
    if (filters.city) {
      where.location = {
        path: ['address'],
        string_contains: filters.city,
      };
    }

    // Capacity filter
    if (filters.capacity) {
      where.capacity = {
        gte: filters.capacity,
      };
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      where.amenities = {
        some: {
          label: {
            in: filters.amenities,
          },
        },
      };
    }

    // Location-based filtering (if lat/lng provided)
    if (filters.lat && filters.lng) {
      // For now, we'll do a simple bounding box filter
      // In production, you'd want to use PostGIS for proper distance calculations
      const lat = parseFloat(filters.lat);
      const lng = parseFloat(filters.lng);
      const radius = filters.radius || 50; // km
      
      // Rough bounding box calculation (1 degree ≈ 111 km)
      const latDelta = radius / 111;
      const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180));
      
      where.location = {
        path: ['lat'],
        gte: lat - latDelta,
        lte: lat + latDelta,
      };
    }

    // Availability filter (if from/to provided)
    if (filters.from && filters.to) {
      where.calendars = {
        some: {
          start: { lte: filters.to },
          end: { gte: filters.from },
          isBlocked: false,
        },
      };
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default
    
    switch (filters.sort) {
      case 'price_asc':
        orderBy = { pricingRules: { _count: 'asc' } }; // This is a rough sort
        break;
      case 'price_desc':
        orderBy = { pricingRules: { _count: 'desc' } };
        break;
      case 'capacity':
        orderBy = { capacity: 'desc' };
        break;
      case 'relevance':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [spaces, total] = await Promise.all([
      db.space.findMany({
        where,
        include: {
          amenities: true,
          rules: true,
          pricingRules: true,
          business: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.space.count({ where }),
    ]);

    // Calculate min hourly rates and filter by price range
    const spacesWithPricing = spaces.map(space => {
      const minRate = getMinHourlyRate(space.pricingRules);
      return {
        ...space,
        minHourlyRate: minRate,
      };
    }).filter(space => {
      if (filters.priceMin && space.minHourlyRate < filters.priceMin) {
        return false;
      }
      if (filters.priceMax && space.minHourlyRate > filters.priceMax) {
        return false;
      }
      return true;
    });

    // Calculate bounding box for map
    const bbox = spacesWithPricing.length > 0 ? {
      north: Math.max(...spacesWithPricing.map(s => s.location.lat)),
      south: Math.min(...spacesWithPricing.map(s => s.location.lat)),
      east: Math.max(...spacesWithPricing.map(s => s.location.lng)),
      west: Math.min(...spacesWithPricing.map(s => s.location.lng)),
    } : null;

    return NextResponse.json({
      spaces: spacesWithPricing,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: spacesWithPricing.length,
        pages: Math.ceil(spacesWithPricing.length / filters.limit),
      },
      bbox,
    });
  } catch (error) {
    console.error('Error fetching public spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
