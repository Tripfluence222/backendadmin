import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { addSocialPublishJob } from "@/jobs/queue";
import { nanoid } from "@/lib/ids";
import { env } from "@/lib/env";

const createSocialPostSchema = z.object({
  businessId: z.string().cuid(),
  title: z.string().optional(),
  caption: z.string().min(1).max(2200), // Instagram limit
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(["image", "video"]),
  })).optional(),
  targets: z.array(z.enum(["facebook", "instagram", "google"])).min(1),
  scheduleAt: z.string().datetime().optional(),
});

const socialPostFiltersSchema = z.object({
  businessId: z.string().cuid(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHING", "PUBLISHED", "FAILED"]).optional(),
  platform: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// GET /api/social/posts - List social posts
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "social:read");
    
    const { searchParams } = new URL(request.url);
    const filters = socialPostFiltersSchema.parse({
      businessId: searchParams.get("businessId") || user.businessId,
      status: searchParams.get("status") || undefined,
      platform: searchParams.get("platform") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    });
    
    const where: any = {
      businessId: filters.businessId,
    };
    
    if (filters.status) where.status = filters.status;
    if (filters.platform) {
      where.results = {
        path: "$[*].platform",
        equals: filters.platform,
      };
    }
    
    const [posts, total] = await Promise.all([
      db.socialPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          business: {
            select: { name: true },
          },
        },
      }),
      db.socialPost.count({ where }),
    ]);
    
    return ok({
      posts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid filters", error.errors);
    }
    return serverErr("Failed to fetch social posts", error);
  }
}

// POST /api/social/posts - Create social post
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "social:post");
    
    const body = await request.json();
    const data = createSocialPostSchema.parse(body);
    
    // Verify user has access to business
    if (user.businessId !== data.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Check if real providers are enabled
    const useRealProviders = env.FEATURE_REAL_PROVIDERS;
    
    // Verify connected accounts for target platforms
    const connectedAccounts = await db.socialAccount.findMany({
      where: {
        businessId: data.businessId,
        provider: {
          in: data.targets.map(target => {
            switch (target) {
              case "facebook": return "FACEBOOK_PAGE";
              case "instagram": return "INSTAGRAM_BUSINESS";
              case "google": return "GOOGLE_BUSINESS";
              default: return target.toUpperCase();
            }
          }),
        },
        isActive: true,
      },
    });
    
    if (connectedAccounts.length === 0) {
      return badReq("No connected social accounts found for the specified platforms");
    }
    
    // Create social post
    const post = await db.socialPost.create({
      data: {
        id: nanoid(),
        businessId: data.businessId,
        title: data.title,
        caption: data.caption,
        media: data.media || [],
        platforms: data.targets,
        status: data.scheduleAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: data.scheduleAt ? new Date(data.scheduleAt) : null,
        results: [],
        metadata: {
          useRealProviders,
          connectedAccounts: connectedAccounts.map(acc => ({
            id: acc.id,
            provider: acc.provider,
            accountName: acc.accountName,
          })),
        },
      },
    });
    
    // Queue for publishing
    const publishJob = await addSocialPublishJob({
      postId: post.id,
      platforms: data.targets,
      content: data.caption,
      mediaUrls: data.media?.map(m => m.url),
      scheduledAt: data.scheduleAt,
    }, {
      delay: data.scheduleAt ? new Date(data.scheduleAt).getTime() - Date.now() : 0,
    });
    
    // Update post with job ID
    await db.socialPost.update({
      where: { id: post.id },
      data: {
        metadata: {
          ...post.metadata,
          jobId: publishJob.id,
        },
      },
    });
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.SOCIAL_POST_CREATED,
      "social_post",
      post.id,
      data.businessId,
      { 
        platforms: data.targets,
        scheduled: !!data.scheduleAt,
        useRealProviders,
      }
    );
    
    return NextResponse.json(post, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid post data", error.errors);
    }
    return serverErr("Failed to create social post", error);
  }
}
