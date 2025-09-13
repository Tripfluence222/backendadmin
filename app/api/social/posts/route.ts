import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { rbacServer } from '@/lib/rbac-server';
import { addSocialPublishJob } from '@/jobs/queue';
import { SocialProvider } from '@prisma/client';

const createPostSchema = z.object({
  businessId: z.string().cuid(),
  content: z.string().min(1).max(2000),
  platforms: z.array(z.enum(['facebook', 'instagram', 'google'])).min(1),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

const getPostsSchema = z.object({
  businessId: z.string().cuid(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'FAILED']).optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPostSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { businessId, content, platforms, mediaUrls, scheduledAt } = validation.data;

    // Check RBAC permissions
    const user = await rbacServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacServer.checkPermission(
      user.id,
      businessId,
      ['ADMIN', 'MANAGER', 'INFLUENCER']
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if feature flag is enabled
    const useRealProviders = process.env.FEATURE_REAL_PROVIDERS === 'true';

    // Create the social post
    const socialPost = await db.socialPost.create({
      data: {
        businessId,
        content,
        platforms: platforms.map(p => {
          switch (p) {
            case 'facebook': return 'FACEBOOK_PAGE';
            case 'instagram': return 'INSTAGRAM_BUSINESS';
            case 'google': return 'GOOGLE_BUSINESS';
            default: return p.toUpperCase() as SocialProvider;
          }
        }),
        mediaUrls: mediaUrls || [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    });

    // If not scheduled, enqueue for immediate publishing
    if (!scheduledAt && useRealProviders) {
      await addSocialPublishJob({
        postId: socialPost.id,
        platforms,
        content,
        mediaUrls,
      });
    }

    // Log audit trail
    await logAction(
      user.id,
      'user',
      'SOCIAL_POST_CREATED',
      'SocialPost',
      socialPost.id,
      businessId,
      { platforms, scheduledAt, useRealProviders }
    );

    return NextResponse.json({
      success: true,
      post: {
        id: socialPost.id,
        content: socialPost.content,
        platforms: socialPost.platforms,
        status: socialPost.status,
        scheduledAt: socialPost.scheduledAt,
        createdAt: socialPost.createdAt,
      },
    });

  } catch (error) {
    console.error('Social post creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create social post' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const validation = getPostsSchema.safeParse({
      businessId,
      status,
      limit,
      offset,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { businessId: validBusinessId, status: validStatus, limit: validLimit, offset: validOffset } = validation.data;

    // Check RBAC permissions
    const user = await rbacServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacServer.checkPermission(
      user.id,
      validBusinessId,
      ['ADMIN', 'MANAGER', 'INFLUENCER', 'STAFF']
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build where clause
    const where: any = { businessId: validBusinessId };
    if (validStatus) {
      where.status = validStatus;
    }

    // Get posts with pagination
    const [posts, total] = await Promise.all([
      db.socialPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: validLimit,
        skip: validOffset,
        select: {
          id: true,
          content: true,
          platforms: true,
          status: true,
          scheduledAt: true,
          publishedAt: true,
          externalIds: true,
          errorMessage: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.socialPost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        total,
        limit: validLimit,
        offset: validOffset,
        hasMore: validOffset + validLimit < total,
      },
    });

  } catch (error) {
    console.error('Social posts fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social posts' },
      { status: 500 }
    );
  }
}