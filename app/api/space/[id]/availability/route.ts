import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceAvailabilityBulkSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';

// GET /api/space/[id]/availability - Get availability blocks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const space = await db.space.findFirst({
      where: {
        id: params.id,
        businessId: user.businessId,
      },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const where: any = {
      spaceId: params.id,
    };

    if (from && to) {
      where.OR = [
        {
          start: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        {
          end: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        {
          AND: [
            { start: { lte: new Date(from) } },
            { end: { gte: new Date(to) } },
          ],
        },
      ];
    }

    const availability = await db.spaceAvailability.findMany({
      where,
      orderBy: { start: 'asc' },
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

// POST /api/space/[id]/availability - Create availability blocks
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN and MANAGER can manage availability
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = SpaceAvailabilityBulkSchema.parse({ ...body, spaceId: params.id });

    // Check if space exists and belongs to user's business
    const existingSpace = await db.space.findFirst({
      where: {
        id: params.id,
        businessId: user.businessId,
      },
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check for overlapping availability blocks
    for (const block of data.blocks) {
      const overlapping = await db.spaceAvailability.findFirst({
        where: {
          spaceId: params.id,
          OR: [
            {
              AND: [
                { start: { lte: block.start } },
                { end: { gt: block.start } },
              ],
            },
            {
              AND: [
                { start: { lt: block.end } },
                { end: { gte: block.end } },
              ],
            },
            {
              AND: [
                { start: { gte: block.start } },
                { end: { lte: block.end } },
              ],
            },
          ],
        },
      });

      if (overlapping) {
        return NextResponse.json(
          { 
            error: 'Overlapping availability blocks not allowed',
            details: `Block from ${block.start.toISOString()} to ${block.end.toISOString()} overlaps with existing block`,
          },
          { status: 400 }
        );
      }
    }

    // Create availability blocks
    const availability = await db.spaceAvailability.createMany({
      data: data.blocks.map(block => ({
        spaceId: params.id,
        start: block.start,
        end: block.end,
        isBlocked: block.isBlocked,
        notes: block.notes,
      })),
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_AVAILABILITY_ADDED',
      'Space',
      params.id,
      user.businessId,
      {
        title: existingSpace.title,
        blocksCount: data.blocks.length,
        blocks: data.blocks.map(b => ({
          start: b.start.toISOString(),
          end: b.end.toISOString(),
          isBlocked: b.isBlocked,
        })),
      }
    );

    return NextResponse.json({ success: true, count: availability.count });
  } catch (error) {
    console.error('Error creating availability blocks:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create availability blocks' },
      { status: 500 }
    );
  }
}
