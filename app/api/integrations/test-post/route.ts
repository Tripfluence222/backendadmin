import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { addSocialPublishJob } from "@/jobs/queue";
import { nanoid } from "@/lib/ids";
import { env } from "@/lib/env";

const testPostSchema = z.object({
  accountId: z.string().cuid(),
  caption: z.string().optional().default("Test post from Tripfluence Admin"),
  mediaUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
});

// POST /api/integrations/test-post - Send test post
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "integrations:test");
    
    const body = await request.json();
    const data = testPostSchema.parse(body);
    
    // Get the account and verify access
    const account = await db.socialAccount.findUnique({
      where: { id: data.accountId },
      include: { business: true },
    });
    
    if (!account) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }
    
    // Verify user has access to business
    if (user.businessId !== account.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Check if account is active
    if (!account.isActive) {
      return badReq("Account is not active");
    }
    
    // Create test social post
    const testPost = await db.socialPost.create({
      data: {
        id: nanoid(),
        businessId: account.businessId,
        title: "Test Post",
        caption: data.caption,
        media: data.mediaUrl ? [{ url: data.mediaUrl, type: "image" }] : [],
        platforms: [account.provider.toLowerCase().replace("_", "")],
        status: "DRAFT",
        results: [],
        metadata: {
          isTestPost: true,
          accountId: data.accountId,
          useRealProviders: env.FEATURE_REAL_PROVIDERS,
        },
      },
    });
    
    // Queue for immediate publishing
    const publishJob = await addSocialPublishJob({
      postId: testPost.id,
      platforms: [account.provider.toLowerCase().replace("_", "")],
      content: data.caption,
      mediaUrls: data.mediaUrl ? [data.mediaUrl] : [],
      scheduledAt: null,
    });
    
    // Update post with job ID
    await db.socialPost.update({
      where: { id: testPost.id },
      data: {
        metadata: {
          ...testPost.metadata,
          jobId: publishJob.id,
        },
      },
    });
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.SOCIAL_TEST_POST,
      "social_post",
      testPost.id,
      account.businessId,
      { 
        provider: account.provider,
        accountName: account.accountName,
        isTestPost: true,
      }
    );
    
    return ok({
      message: "Test post queued successfully",
      postId: testPost.id,
      jobId: publishJob.id,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid test post data", error.errors);
    }
    return serverErr("Failed to send test post", error);
  }
}
