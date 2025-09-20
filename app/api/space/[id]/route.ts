import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceUpdateSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';

// GET /api/space/[id] - Get space details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const space = await db.space.findFirst({
      where: {
        id,
        businessId: user.businessId,
      },
      include: {
        amenities: true,
        rules: true,
        pricingRules: true,
        calendars: {
          orderBy: { start: 'asc' },
        },
        requests: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            calendars: true,
            requests: true,
          },
        },
      },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    return NextResponse.json(space);
  } catch (error) {
    console.error('Error fetching space:', error);
    return NextResponse.json(
      { error: 'Failed to fetch space' },
      { status: 500 }
    );
  }
}

// PATCH /api/space/[id] - Update space
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN and MANAGER can update spaces
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = SpaceUpdateSchema.parse({ ...body, id });

    // Check if space exists and belongs to user's business
    const existingSpace = await db.space.findFirst({
      where: {
        id: id,
        businessId: user.businessId,
      },
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check if slug is unique (if being updated)
    if (data.slug && data.slug !== existingSpace.slug) {
      const slugExists = await db.space.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update space
    const updatedSpace = await db.space.update({
      where: { id: id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        photos: data.photos,
        location: data.location,
        capacity: data.capacity,
        floorAreaM2: data.floorAreaM2,
      },
      include: {
        amenities: true,
        rules: true,
        pricingRules: true,
      },
    });

    // Update amenities if provided
    if (data.amenities) {
      await db.spaceAmenity.deleteMany({
        where: { spaceId: id },
      });

      await db.spaceAmenity.createMany({
        data: data.amenities.map(amenity => ({
          spaceId: id,
          label: amenity.label,
          category: amenity.category,
        })),
      });
    }

    // Update rules if provided
    if (data.rules) {
      await db.spaceRule.deleteMany({
        where: { spaceId: id },
      });

      await db.spaceRule.createMany({
        data: data.rules.map(rule => ({
          spaceId: id,
          label: rule.label,
          required: rule.required,
        })),
      });
    }

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_UPDATED',
      'Space',
      id,
      user.businessId,
      {
        title: updatedSpace.title,
        changes: Object.keys(data).filter(key => key !== 'id'),
      }
    );

    return NextResponse.json(updatedSpace);
  } catch (error) {
    console.error('Error updating space:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update space' },
      { status: 500 }
    );
  }
}

// DELETE /api/space/[id] - Delete space
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN can delete spaces
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if space exists and belongs to user's business
    const existingSpace = await db.space.findFirst({
      where: {
        id: id,
        businessId: user.businessId,
      },
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check if space has active requests
    const activeRequests = await db.spaceRequest.count({
      where: {
        spaceId: id,
        status: {
          in: ['PENDING', 'NEEDS_PAYMENT', 'PAID_HOLD', 'CONFIRMED'],
        },
      },
    });

    if (activeRequests > 0) {
      return NextResponse.json(
        { error: 'Cannot delete space with active requests' },
        { status: 400 }
      );
    }

    // Delete space (cascade will handle related records)
    await db.space.delete({
      where: { id: id },
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_DELETED',
      'Space',
      id,
      user.businessId,
      {
        title: existingSpace.title,
        slug: existingSpace.slug,
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting space:', error);
    return NextResponse.json(
      { error: 'Failed to delete space' },
      { status: 500 }
    );
  }
}
