import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";

const disconnectSchema = z.object({
  accountId: z.string().cuid(),
});

// POST /api/integrations/disconnect - Disconnect an account
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "integrations:disconnect");
    
    const body = await request.json();
    const data = disconnectSchema.parse(body);
    
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
    
    // Soft delete: clear tokens and mark as disconnected
    await db.socialAccount.update({
      where: { id: data.accountId },
      data: {
        accessToken: "",
        refreshToken: null,
        expiresAt: null,
        isActive: false,
        metadata: {
          ...account.metadata,
          status: "DISCONNECTED",
          disconnectedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      },
    });
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.PROVIDER_DISCONNECTED,
      "social_account",
      data.accountId,
      account.businessId,
      { 
        provider: account.provider,
        accountName: account.accountName,
      }
    );
    
    return ok({
      message: "Account disconnected successfully",
      accountId: data.accountId,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid disconnect data", error.errors);
    }
    return serverErr("Failed to disconnect account", error);
  }
}
