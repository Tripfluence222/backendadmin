import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { checkRBAC } from '@/lib/rbac-server';
import { SpaceCreateSchema, SpaceFilterSchema } from '@/lib/validation/space';
import { getCurrentUser } from '@/lib/auth';

// GET /api/space - List spaces with filters
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = SpaceFilterSchema.parse({
      status: searchParams.get('status'),
      city: searchParams.get('city'),
      capacity: searchParams.get('capacity'),
      q: searchParams.get('q'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    // Check RBAC - only business users can access
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER', 'STAFF']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const where: any = {
      businessId: user.businessId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.city) {
      where.location = {
        path: ['address'],
        string_contains: filters.city,
      };
    }

    if (filters.capacity) {
      where.capacity = {
        gte: filters.capacity,
      };
    }

    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const [spaces, total] = await Promise.all([
      db.space.findMany({
        where,
        include: {
          amenities: true,
          rules: true,
          pricingRules: true,
          _count: {
            select: {
              calendars: true,
              requests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.space.count({ where }),
    ]);

    return NextResponse.json({
      spaces,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}

// POST /api/space - Create new space
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC - only ADMIN and MANAGER can create spaces
    const hasAccess = await checkRBAC(user.id, user.businessId, ['ADMIN', 'MANAGER']);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = SpaceCreateSchema.parse(body);

    // Check if slug is unique
    const existingSpace = await db.space.findUnique({
      where: { slug: data.slug },
    });

    if (existingSpace) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    // Create space with amenities and rules
    const space = await db.space.create({
      data: {
        businessId: user.businessId,
        title: data.title,
        slug: data.slug,
        description: data.description,
        photos: data.photos,
        location: data.location,
        capacity: data.capacity,
        floorAreaM2: data.floorAreaM2,
        amenities: {
          create: data.amenities,
        },
        rules: {
          create: data.rules,
        },
      },
      include: {
        amenities: true,
        rules: true,
      },
    });

    // Log the action
    await logAction(
      user.id,
      'user',
      'SPACE_CREATED',
      'Space',
      space.id,
      user.businessId,
      {
        title: space.title,
        slug: space.slug,
        capacity: space.capacity,
      }
    );

    return NextResponse.json(space, { status: 201 });
  } catch (error) {
    console.error('Error creating space:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}
