import { NextRequest } from 'next/server';
import { getActor } from '@/lib/auth';
import { assertRole } from '@/lib/rbac';
import { logAction, AUDIT_ACTIONS } from '@/lib/audit';
import { ok, unauth, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { createSocialPostSchema, socialPostFiltersSchema } from '@/lib/validation/social';

export async function GET(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    const { searchParams } = new URL(request.url);
    const filters = socialPostFiltersSchema.parse({
      status: searchParams.get('status'),
      provider: searchParams.get('provider'),
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    });

    const where: any = {
      businessId: actor.businessId,
    };

    if (filters.status) where.status = filters.status;
    if (filters.provider) where.targets = { has: filters.provider };
    if (filters.from) where.createdAt = { gte: new Date(filters.from) };
    if (filters.to) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filters.to),
      };
    }

    const [posts, total] = await Promise.all([
      db.socialPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.socialPost.count({ where }),
    ]);

    return ok({
      posts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    console.error('Error fetching social posts:', error);
    return serverErr('Failed to fetch social posts');
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await getActor(request);
    if (!actor) return unauth();

    // Allow INFLUENCER role for social posts
    await assertRole(actor.userId, actor.businessId, ['ADMIN', 'MANAGER', 'INFLUENCER']);

    const body = await request.json();
    const data = createSocialPostSchema.parse(body);

    const post = await db.socialPost.create({
      data: {
        ...data,
        businessId: actor.businessId,
        scheduleAt: data.scheduleAt ? new Date(data.scheduleAt) : null,
        status: data.scheduleAt ? 'SCHEDULED' : 'DRAFT',
      },
    });

    await logAction(actor, AUDIT_ACTIONS.SOCIAL_POST_SCHEDULED, 'SocialPost', post.id, {
      title: post.title,
      targets: post.targets,
      scheduleAt: post.scheduleAt,
    });

    // TODO: Queue background job for publishing
    // await queue.add('social.publish', { postId: post.id });

    return ok(post, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      return unauth(error.message);
    }
    console.error('Error creating social post:', error);
    return serverErr('Failed to create social post');
  }
}
