import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceRequestDecisionSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';

// POST /api/space/requests/[id]/decline - Decline space request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN and MANAGER can decline requests
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = SpaceRequestDecisionSchema.parse({ ...body, requestId: id, decision: 'decline' });

    // Check if space request exists and belongs to user's business
    const existingRequest = await db.spaceRequest.findFirst({
      where: {
        id: id,
        businessId: user.businessId,
      },
      include: {
        space: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Space request not found' }, { status: 404 });
    }

    // Only allow decline for PENDING requests
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only decline pending requests' },
        { status: 400 }
      );
    }

    // Update the request status
    const updatedRequest = await db.spaceRequest.update({
      where: { id: id },
      data: {
        status: 'DECLINED',
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
      'SPACE_REQUEST_DECLINED',
      'SpaceRequest',
      id,
      user.businessId,
      {
        spaceId: existingRequest.spaceId,
        spaceTitle: existingRequest.space.title,
        title: existingRequest.title,
        quoteAmount: existingRequest.quoteAmount,
        message: data.message,
      }
    );

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error declining space request:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to decline space request' },
      { status: 500 }
    );
  }
}
