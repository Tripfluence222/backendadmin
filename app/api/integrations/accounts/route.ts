import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { computeAccountStatus } from "@/lib/integrations/status";
import { SocialProvider } from "@prisma/client";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

const accountsQuerySchema = z.object({
  businessId: z.string().cuid(),
});

// GET /api/integrations/accounts - List all social accounts for a business
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "integrations:read");
    
    const { searchParams } = new URL(request.url);
    const query = accountsQuerySchema.parse({
      businessId: searchParams.get("businessId") || user.businessId,
    });
    
    // Verify user has access to business
    if (user.businessId !== query.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Get all social accounts for the business
    const accounts = await db.socialAccount.findMany({
      where: {
        businessId: query.businessId,
      },
      orderBy: [
        { provider: "asc" },
        { createdAt: "desc" },
      ],
    });
    
    // Compute status for each account
    const accountsWithStatus = accounts.map(account => {
      const statusInfo = computeAccountStatus(account);
      return {
        ...account,
        status: statusInfo.status,
        expiresInSec: statusInfo.expiresInSec,
        errorMessage: statusInfo.errorMessage,
      };
    });
    
    return ok({
      accounts: accountsWithStatus,
      total: accounts.length,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid query parameters", error.errors);
    }
    return serverErr("Failed to fetch integration accounts", error);
  }
}
