import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth, requirePermission } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { env } from "@/lib/env";

const reconnectSchema = z.object({
  businessId: z.string().cuid(),
  provider: z.enum(["facebook", "google", "eventbrite", "meetup"]),
});

// POST /api/integrations/reconnect - Generate reconnect URL
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    requirePermission(user, "integrations:reconnect");
    
    const body = await request.json();
    const data = reconnectSchema.parse(body);
    
    // Verify user has access to business
    if (user.businessId !== data.businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Generate reconnect URL
    const reconnectUrl = `${env.OAUTH_REDIRECT_BASE || "http://localhost:3000"}/api/auth/connect/${data.provider}?businessId=${data.businessId}`;
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.PROVIDER_RECONNECT_REQUESTED,
      "social_account",
      data.provider,
      data.businessId,
      { provider: data.provider }
    );
    
    return ok({
      reconnectUrl,
      provider: data.provider,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badReq("Invalid reconnect data", error.errors);
    }
    return serverErr("Failed to generate reconnect URL", error);
  }
}
