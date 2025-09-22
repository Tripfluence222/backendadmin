import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceRequestQuoteSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';

// POST /api/space/requests/[id]/quote - Update quote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN and MANAGER can update quotes
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = SpaceRequestQuoteSchema.parse({ ...body, requestId: id });

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

    // Only allow quote updates for PENDING requests
    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only update quotes for pending requests' },
        { status: 400 }
      );
    }

    // Update the quote
    const updatedRequest = await db.spaceRequest.update({
      where: { id: id },
      data: {
        quoteAmount: data.quoteAmount,
        depositAmount: data.depositAmount,
        cleaningFee: data.cleaningFee,
        pricingBreakdown: data.pricingBreakdown,
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
      'SPACE_REQUEST_QUOTED',
      'SpaceRequest',
      id,
      user.businessId,
      {
        spaceId: existingRequest.spaceId,
        spaceTitle: existingRequest.space.title,
        title: existingRequest.title,
        previousQuote: existingRequest.quoteAmount,
        newQuote: data.quoteAmount,
        depositAmount: data.depositAmount,
        cleaningFee: data.cleaningFee,
      }
    );

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating quote:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}
