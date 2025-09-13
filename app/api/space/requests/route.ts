import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceRequestCreateSchema, SpaceRequestFilterSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';
import { priceSpaceRequest } from '@/lib/space/pricing';

// GET /api/space/requests - List space requests
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only business users can access
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER', 'STAFF']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filters = SpaceRequestFilterSchema.parse({
      status: searchParams.get('status'),
      spaceId: searchParams.get('spaceId'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    const where: any = {
      businessId: user.businessId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.spaceId) {
      where.spaceId = filters.spaceId;
    }

    if (filters.from && filters.to) {
      where.OR = [
        {
          start: {
            gte: filters.from,
            lte: filters.to,
          },
        },
        {
          end: {
            gte: filters.from,
            lte: filters.to,
          },
        },
        {
          AND: [
            { start: { lte: filters.from } },
            { end: { gte: filters.to } },
          ],
        },
      ];
    }

    const [requests, total] = await Promise.all([
      db.spaceRequest.findMany({
        where,
        include: {
          space: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.spaceRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching space requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch space requests' },
      { status: 500 }
    );
  }
}

// POST /api/space/requests - Create space request
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = SpaceRequestCreateSchema.parse(body);

    // Check if space exists and is published
    const space = await db.space.findFirst({
      where: {
        id: data.spaceId,
        status: 'PUBLISHED',
      },
      include: {
        pricingRules: true,
        calendars: {
          where: {
            OR: [
              {
                AND: [
                  { start: { lte: data.start } },
                  { end: { gt: data.start } },
                ],
              },
              {
                AND: [
                  { start: { lt: data.end } },
                  { end: { gte: data.end } },
                },
              },
              {
                AND: [
                  { start: { gte: data.start } },
                  { end: { lte: data.end } },
                },
              },
            ],
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found or not available' }, { status: 404 });
    }

    // Check if space is available for the requested time
    const isAvailable = space.calendars.some(block => !block.isBlocked);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Space is not available for the requested time' },
        { status: 400 }
      );
    }

    // Check if space has capacity for attendees
    if (data.attendees > space.capacity) {
      return NextResponse.json(
        { error: `Space capacity is ${space.capacity}, requested ${data.attendees}` },
        { status: 400 }
      );
    }

    // Check for conflicting requests
    const conflictingRequest = await db.spaceRequest.findFirst({
      where: {
        spaceId: data.spaceId,
        status: {
          in: ['PENDING', 'NEEDS_PAYMENT', 'PAID_HOLD', 'CONFIRMED'],
        },
        OR: [
          {
            AND: [
              { start: { lte: data.start } },
              { end: { gt: data.start } },
            ],
          },
          {
            AND: [
              { start: { lt: data.end } },
              { end: { gte: data.end } },
            ],
          },
          {
            AND: [
              { start: { gte: data.start } },
              { end: { lte: data.end } },
            },
          },
        ],
      },
    });

    if (conflictingRequest) {
      return NextResponse.json(
        { error: 'Space is already booked for the requested time' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const pricing = priceSpaceRequest(space, space.pricingRules, {
      start: data.start,
      end: data.end,
      attendees: data.attendees,
    });

    // Create space request
    const spaceRequest = await db.spaceRequest.create({
      data: {
        businessId: space.businessId,
        spaceId: data.spaceId,
        organizerId: data.organizerId,
        title: data.title,
        description: data.description,
        attendees: data.attendees,
        start: data.start,
        end: data.end,
        status: 'PENDING',
        quoteAmount: pricing.subtotal,
        currency: pricing.currency,
        depositAmount: pricing.breakdown.deposit,
        cleaningFee: pricing.breakdown.cleaning,
        pricingBreakdown: pricing,
      },
      include: {
        space: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_REQUEST_CREATED',
      'SpaceRequest',
      spaceRequest.id,
      space.businessId,
      {
        spaceId: data.spaceId,
        spaceTitle: space.title,
        title: data.title,
        attendees: data.attendees,
        start: data.start.toISOString(),
        end: data.end.toISOString(),
        quoteAmount: pricing.subtotal,
      }
    );

    return NextResponse.json(spaceRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating space request:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create space request' },
      { status: 500 }
    );
  }
}
