import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getMinHourlyRate } from '@/lib/space/pricing';

// GET /api/public/space/[id] - Get public space details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const space = await db.space.findFirst({
      where: {
        id: params.id,
        status: 'PUBLISHED',
      },
      include: {
        amenities: true,
        rules: true,
        pricingRules: true,
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            domain: true,
          },
        },
        _count: {
          select: {
            requests: {
              where: {
                status: 'CONFIRMED',
              },
            },
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Calculate min hourly rate
    const minHourlyRate = getMinHourlyRate(space.pricingRules);

    return NextResponse.json({
      ...space,
      minHourlyRate,
    });
  } catch (error) {
    console.error('Error fetching public space:', error);
    return NextResponse.json(
      { error: 'Failed to fetch space' },
      { status: 500 }
    );
  }
}
