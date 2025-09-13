import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PublicQuoteSchema } from '@/lib/validation/space';
import { priceSpaceRequest } from '@/lib/space/pricing';

// POST /api/public/quote - Get pricing quote
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = PublicQuoteSchema.parse(body);

    // Check if space exists and is published
    const space = await db.space.findFirst({
      where: {
        id: data.spaceId,
        status: 'PUBLISHED',
      },
      include: {
        pricingRules: true,
      },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check if space has capacity for attendees
    if (data.attendees > space.capacity) {
      return NextResponse.json(
        { error: `Space capacity is ${space.capacity}, requested ${data.attendees}` },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricing = priceSpaceRequest(space, space.pricingRules, {
      start: data.start,
      end: data.end,
      attendees: data.attendees,
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Error calculating quote:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to calculate quote' },
      { status: 500 }
    );
  }
}
