import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { TokenRefreshService } from "@/lib/oauth/refresh";

const refreshSchema = z.object({
  accountId: z.string().cuid(),
});

// POST /api/integrations/refresh - Refresh account token
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "integrations:refresh");
    
    const body = await request.json();
    const data = refreshSchema.parse(body);
    
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
    
    // Check if refresh token is available
    if (!account.refreshToken) {
      return badReq("No refresh token available for this account");
    }
    
    // Attempt token refresh
    const refreshResult = await TokenRefreshService.refreshToken(data.accountId);
    
    if (!refreshResult.success) {
      return badReq(`Token refresh failed: ${refreshResult.error}`);
    }
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.PROVIDER_REFRESHED,
      "social_account",
      data.accountId,
      account.businessId,
      { 
        provider: account.provider,
        accountName: account.accountName,
        newExpiresAt: refreshResult.expiresAt,
      }
    );
    
    return ok({
      message: "Token refreshed successfully",
      accountId: data.accountId,
      expiresAt: refreshResult.expiresAt,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid refresh data", error.errors);
    }
    return serverErr("Failed to refresh token", error);
  }
}
