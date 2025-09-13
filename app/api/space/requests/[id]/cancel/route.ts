import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceRequestCancelSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';

// POST /api/space/requests/[id]/cancel - Cancel space request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = SpaceRequestCancelSchema.parse({ ...body, requestId: params.id });

    // Check if space request exists
    const existingRequest = await db.spaceRequest.findFirst({
      where: {
        id: params.id,
      },
      include: {
        space: {
          select: {
            title: true,
            businessId: true,
          },
        },
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Space request not found' }, { status: 404 });
    }

    // Check if user has permission to cancel this request
    // Either the organizer or a business user with access
    const isOrganizer = existingRequest.organizerId === user.id;
    const hasBusinessAccess = existingRequest.space.businessId === user.businessId && 
      await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER', 'STAFF']);

    if (!isOrganizer && !hasBusinessAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow cancellation for certain statuses
    if (!['PENDING', 'NEEDS_PAYMENT', 'PAID_HOLD'].includes(existingRequest.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel request in current status' },
        { status: 400 }
      );
    }

    // Update the request status
    const updatedRequest = await db.spaceRequest.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
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
      'SPACE_REQUEST_CANCELLED',
      'SpaceRequest',
      params.id,
      existingRequest.space.businessId,
      {
        spaceId: existingRequest.spaceId,
        spaceTitle: existingRequest.space.title,
        title: existingRequest.title,
        previousStatus: existingRequest.status,
        reason: data.reason,
        cancelledBy: isOrganizer ? 'organizer' : 'business',
      }
    );

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error cancelling space request:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to cancel space request' },
      { status: 500 }
    );
  }
}
