import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { getCurrentUser } from '@/lib/auth';

// DELETE /api/space/availability/[slotId] - Delete availability block
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slotId: string } }
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

    // Find the availability block and verify it belongs to user's business
    const availabilityBlock = await db.spaceAvailability.findFirst({
      where: {
        id: params.slotId,
        space: {
          businessId: user.businessId,
        },
      },
      include: {
        space: true,
      },
    });

    if (!availabilityBlock) {
      return NextResponse.json({ error: 'Availability block not found' }, { status: 404 });
    }

    // Check if there are any confirmed requests for this time slot
    const confirmedRequests = await db.spaceRequest.count({
      where: {
        spaceId: availabilityBlock.spaceId,
        status: 'CONFIRMED',
        OR: [
          {
            AND: [
              { start: { lte: availabilityBlock.start } },
              { end: { gt: availabilityBlock.start } },
            ],
          },
          {
            AND: [
              { start: { lt: availabilityBlock.end } },
              { end: { gte: availabilityBlock.end } },
            ],
          },
          {
            AND: [
              { start: { gte: availabilityBlock.start } },
              { end: { lte: availabilityBlock.end } },
            ],
          },
        ],
      },
    });

    if (confirmedRequests > 0) {
      return NextResponse.json(
        { error: 'Cannot delete availability block with confirmed requests' },
        { status: 400 }
      );
    }

    // Delete the availability block
    await db.spaceAvailability.delete({
      where: { id: params.slotId },
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_AVAILABILITY_REMOVED',
      'SpaceAvailability',
      params.slotId,
      user.businessId,
      {
        spaceId: availabilityBlock.spaceId,
        spaceTitle: availabilityBlock.space.title,
        start: availabilityBlock.start.toISOString(),
        end: availabilityBlock.end.toISOString(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting availability block:', error);
    return NextResponse.json(
      { error: 'Failed to delete availability block' },
      { status: 500 }
    );
  }
}
