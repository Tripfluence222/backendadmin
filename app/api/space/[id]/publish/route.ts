import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpacePublishSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';
import { SpaceStatus } from '@prisma/client';

// POST /api/space/[id]/publish - Publish space
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN and MANAGER can publish spaces
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = SpacePublishSchema.parse({ id: params.id });

    // Check if space exists and belongs to user's business
    const existingSpace = await db.space.findFirst({
      where: {
        id: params.id,
        businessId: user.businessId,
      },
      include: {
        amenities: true,
        rules: true,
        pricingRules: true,
      },
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Validate space is ready for publishing
    const validationErrors = [];

    if (!existingSpace.amenities || existingSpace.amenities.length === 0) {
      validationErrors.push('Space must have at least one amenity');
    }

    if (!existingSpace.rules || existingSpace.rules.length === 0) {
      validationErrors.push('Space must have at least one rule');
    }

    if (!existingSpace.pricingRules || existingSpace.pricingRules.length === 0) {
      validationErrors.push('Space must have at least one pricing rule');
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Space not ready for publishing', details: validationErrors },
        { status: 400 }
      );
    }

    // Update space status
    const updatedSpace = await db.space.update({
      where: { id: params.id },
      data: {
        status: SpaceStatus.PUBLISHED,
      },
      include: {
        amenities: true,
        rules: true,
        pricingRules: true,
      },
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_PUBLISHED',
      'Space',
      params.id,
      user.businessId,
      {
        title: updatedSpace.title,
        slug: updatedSpace.slug,
        previousStatus: existingSpace.status,
        newStatus: SpaceStatus.PUBLISHED,
      }
    );

    return NextResponse.json(updatedSpace);
  } catch (error) {
    console.error('Error publishing space:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to publish space' },
      { status: 500 }
    );
  }
}
