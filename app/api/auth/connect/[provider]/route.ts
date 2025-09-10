import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { nanoid } from "@/lib/ids";
import { env } from "@/lib/env";

const providerSchema = z.enum(["facebook", "google", "eventbrite", "meetup"]);
const connectSchema = z.object({
  businessId: z.string().cuid(),
});

// OAuth scopes for each provider
const PROVIDER_SCOPES = {
  facebook: [
    "pages_manage_metadata",
    "pages_manage_posts", 
    "pages_read_engagement",
    "pages_read_user_content",
    "pages_manage_events",
    "instagram_basic",
    "instagram_content_publish"
  ].join(","),
  google: "https://www.googleapis.com/auth/business.manage",
  eventbrite: "events.write organizers.read organizers.write",
  meetup: "group_content_edit",
};

// OAuth URLs for each provider
const getOAuthUrl = (provider: string, state: string, businessId: string): string => {
  const redirectUri = `${env.OAUTH_REDIRECT_BASE || "http://localhost:3000"}/api/auth/callback/${provider}`;
  
  switch (provider) {
    case "facebook":
      return `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${env.FACEBOOK_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(PROVIDER_SCOPES.facebook)}&` +
        `state=${state}&` +
        `response_type=code`;
        
    case "google":
      return `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(PROVIDER_SCOPES.google)}&` +
        `state=${state}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;
        
    case "eventbrite":
      return `https://www.eventbrite.com/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${env.EVENTBRITE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;
        
    case "meetup":
      return `https://secure.meetup.com/oauth2/authorize?` +
        `client_id=${env.MEETUP_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;
        
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const user = await requireAuth(request);
    
    // Validate provider
    const providerResult = providerSchema.safeParse(params.provider);
    if (!providerResult.success) {
      return badReq("Invalid provider", providerResult.error.errors);
    }
    const provider = providerResult.data;
    
    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = connectSchema.safeParse({
      businessId: searchParams.get("businessId"),
    });
    if (!queryResult.success) {
      return badReq("Invalid query parameters", queryResult.error.errors);
    }
    const { businessId } = queryResult.data;
    
    // Verify user has access to business
    if (user.businessId !== businessId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
    
    // Check if provider is configured
    const providerConfig = {
      facebook: { id: env.FACEBOOK_APP_ID, secret: env.FACEBOOK_APP_SECRET },
      google: { id: env.GOOGLE_CLIENT_ID, secret: env.GOOGLE_CLIENT_SECRET },
      eventbrite: { id: env.EVENTBRITE_CLIENT_ID, secret: env.EVENTBRITE_CLIENT_SECRET },
      meetup: { id: env.MEETUP_CLIENT_ID, secret: env.MEETUP_CLIENT_SECRET },
    }[provider];
    
    if (!providerConfig.id || !providerConfig.secret) {
      return badReq(`${provider} provider is not configured`);
    }
    
    // Generate state and code verifier for PKCE
    const state = nanoid(32);
    const codeVerifier = nanoid(128);
    
    // Store auth state
    await db.providerAuthState.create({
      data: {
        id: nanoid(),
        businessId,
        provider,
        state,
        codeVerifier,
      },
    });
    
    // Generate OAuth URL
    const oauthUrl = getOAuthUrl(provider, state, businessId);
    
    // Log audit action
    await logAction(
      user.id,
      "user",
      AUDIT_ACTIONS.SOCIAL_ACCOUNT_CONNECTED,
      "provider_auth",
      state,
      businessId,
      { provider, action: "initiate" }
    );
    
    return NextResponse.redirect(oauthUrl);
    
  } catch (error) {
    return serverErr("Failed to initiate OAuth flow", error);
  }
}
