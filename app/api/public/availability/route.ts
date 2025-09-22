import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PublicAvailabilitySchema } from '@/lib/validation/space';

// GET /api/public/availability - Get public availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = PublicAvailabilitySchema.parse({
      spaceId: searchParams.get('spaceId'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
    });

    // Check if space exists and is published
    const space = await db.space.findFirst({
      where: {
        id: data.spaceId,
        status: 'PUBLISHED',
      },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Get availability blocks
    const availability = await db.spaceAvailability.findMany({
      where: {
        spaceId: data.spaceId,
        OR: [
          {
            start: {
              gte: data.from,
              lte: data.to,
            },
          },
          {
            end: {
              gte: data.from,
              lte: data.to,
            },
          },
          {
            AND: [
              { start: { lte: data.from } },
              { end: { gte: data.to } },
            ],
          },
        ],
      },
      orderBy: { start: 'asc' },
    });

    // Get confirmed requests for the same period
    const confirmedRequests = await db.spaceRequest.findMany({
      where: {
        spaceId: data.spaceId,
        status: 'CONFIRMED',
        OR: [
          {
            start: {
              gte: data.from,
              lte: data.to,
            },
          },
          {
            end: {
              gte: data.from,
              lte: data.to,
            },
          },
          {
            AND: [
              { start: { lte: data.from } },
              { end: { gte: data.to } },
            ],
          },
        ],
      },
      select: {
        start: true,
        end: true,
        title: true,
      },
    });

    return NextResponse.json({
      availability,
      confirmedRequests,
    });
  } catch (error) {
    console.error('Error fetching public availability:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
