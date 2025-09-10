import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ok, badReq, serverErr } from "@/lib/http";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { encryptToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import { nanoid } from "@/lib/ids";

const providerSchema = z.enum(["facebook", "google", "eventbrite", "meetup"]);
const callbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  error: z.string().optional(),
});

// Provider-specific token exchange and account fetching
class ProviderHandler {
  static async handleFacebook(code: string, businessId: string) {
    // Exchange code for access token
    const tokenResponse = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.FACEBOOK_APP_ID!,
        client_secret: env.FACEBOOK_APP_SECRET!,
        redirect_uri: `${env.OAUTH_REDIRECT_BASE || "http://localhost:3000"}/api/auth/callback/facebook`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Facebook token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, expires_in } = tokenData;

    // Get user's pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`
    );

    if (!pagesResponse.ok) {
      throw new Error(`Failed to fetch Facebook pages: ${pagesResponse.statusText}`);
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];

    // For now, save the first page (in production, you'd show a selection UI)
    if (pages.length === 0) {
      throw new Error("No Facebook pages found for this account");
    }

    const page = pages[0];
    const pageAccessToken = page.access_token;

    // Check if this page has an Instagram business account
    let instagramAccount = null;
    try {
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
      );
      if (igResponse.ok) {
        const igData = await igResponse.json();
        instagramAccount = igData.instagram_business_account;
      }
    } catch (error) {
      // Instagram account not connected, that's okay
    }

    const accounts = [];

    // Save Facebook page
    const encryptedPageToken = await encryptToken(pageAccessToken);
    accounts.push({
      provider: "FACEBOOK_PAGE" as const,
      accessToken: encryptedPageToken,
      accountId: page.id,
      accountName: page.name,
      scopes: ["pages_manage_metadata", "pages_manage_posts", "pages_manage_events"],
      metadata: { pageToken: pageAccessToken },
    });

    // Save Instagram business account if available
    if (instagramAccount) {
      const encryptedIgToken = await encryptToken(pageAccessToken); // Same token for IG
      accounts.push({
        provider: "INSTAGRAM_BUSINESS" as const,
        accessToken: encryptedIgToken,
        accountId: instagramAccount.id,
        accountName: instagramAccount.username,
        scopes: ["instagram_basic", "instagram_content_publish"],
        metadata: { igUserId: instagramAccount.id },
      });
    }

    return accounts;
  }

  static async handleGoogle(code: string, businessId: string) {
    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${env.OAUTH_REDIRECT_BASE || "http://localhost:3000"}/api/auth/callback/google`,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Google token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get business profile locations
    const locationsResponse = await fetch(
      "https://mybusiness.googleapis.com/v4/accounts",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!locationsResponse.ok) {
      throw new Error(`Failed to fetch Google Business locations: ${locationsResponse.statusText}`);
    }

    const locationsData = await locationsResponse.json();
    const accounts = locationsData.accounts || [];

    if (accounts.length === 0) {
      throw new Error("No Google Business Profile locations found");
    }

    // For now, save the first account (in production, you'd show a selection UI)
    const account = accounts[0];
    const encryptedToken = await encryptToken(access_token);
    const encryptedRefreshToken = refresh_token ? await encryptToken(refresh_token) : null;

    return [{
      provider: "GOOGLE_BUSINESS" as const,
      accessToken: encryptedToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
      accountId: account.name,
      accountName: account.accountName,
      scopes: ["https://www.googleapis.com/auth/business.manage"],
      metadata: { accountName: account.accountName },
    }];
  }

  static async handleEventbrite(code: string, businessId: string) {
    // Exchange code for access token
    const tokenResponse = await fetch("https://www.eventbrite.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: env.EVENTBRITE_CLIENT_ID!,
        client_secret: env.EVENTBRITE_CLIENT_SECRET!,
        code,
        redirect_uri: `${env.OAUTH_REDIRECT_BASE || "http://localhost:3000"}/api/auth/callback/eventbrite`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Eventbrite token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user's organizations
    const orgsResponse = await fetch("https://www.eventbriteapi.com/v3/users/me/organizations/", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!orgsResponse.ok) {
      throw new Error(`Failed to fetch Eventbrite organizations: ${orgsResponse.statusText}`);
    }

    const orgsData = await orgsResponse.json();
    const organizations = orgsData.organizations || [];

    if (organizations.length === 0) {
      throw new Error("No Eventbrite organizations found");
    }

    // For now, save the first organization (in production, you'd show a selection UI)
    const org = organizations[0];
    const encryptedToken = await encryptToken(access_token);
    const encryptedRefreshToken = refresh_token ? await encryptToken(refresh_token) : null;

    return [{
      provider: "EVENTBRITE" as const,
      accessToken: encryptedToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
      accountId: org.id,
      accountName: org.name,
      scopes: ["events.write", "organizers.read", "organizers.write"],
      metadata: { organizationId: org.id, organizationName: org.name },
    }];
  }

  static async handleMeetup(code: string, businessId: string) {
    // Exchange code for access token
    const tokenResponse = await fetch("https://secure.meetup.com/oauth2/access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: env.MEETUP_CLIENT_ID!,
        client_secret: env.MEETUP_CLIENT_SECRET!,
        code,
        redirect_uri: `${env.OAUTH_REDIRECT_BASE || "http://localhost:3000"}/api/auth/callback/meetup`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Meetup token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Get user info
    const userResponse = await fetch("https://api.meetup.com/members/self", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch Meetup user info: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    const encryptedToken = await encryptToken(access_token);
    const encryptedRefreshToken = refresh_token ? await encryptToken(refresh_token) : null;

    return [{
      provider: "MEETUP" as const,
      accessToken: encryptedToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: expires_in ? new Date(Date.now() + expires_in * 1000) : null,
      accountId: userData.id.toString(),
      accountName: userData.name,
      scopes: ["group_content_edit"],
      metadata: { userId: userData.id, userName: userData.name },
    }];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    // Validate provider
    const providerResult = providerSchema.safeParse(params.provider);
    if (!providerResult.success) {
      return badReq("Invalid provider", providerResult.error.errors);
    }
    const provider = providerResult.data;

    // Validate query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = callbackSchema.safeParse({
      code: searchParams.get("code"),
      state: searchParams.get("state"),
      error: searchParams.get("error"),
    });

    if (!queryResult.success) {
      return badReq("Invalid callback parameters", queryResult.error.errors);
    }

    const { code, state, error } = queryResult.data;

    // Handle OAuth error
    if (error) {
      return NextResponse.redirect(
        `/social?error=${encodeURIComponent(`OAuth error: ${error}`)}`
      );
    }

    // Validate state
    const authState = await db.providerAuthState.findUnique({
      where: { state },
    });

    if (!authState) {
      return NextResponse.redirect(
        `/social?error=${encodeURIComponent("Invalid OAuth state")}`
      );
    }

    // Clean up auth state
    await db.providerAuthState.delete({
      where: { id: authState.id },
    });

    // Handle provider-specific OAuth flow
    let accounts;
    switch (provider) {
      case "facebook":
        accounts = await ProviderHandler.handleFacebook(code, authState.businessId);
        break;
      case "google":
        accounts = await ProviderHandler.handleGoogle(code, authState.businessId);
        break;
      case "eventbrite":
        accounts = await ProviderHandler.handleEventbrite(code, authState.businessId);
        break;
      case "meetup":
        accounts = await ProviderHandler.handleMeetup(code, authState.businessId);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // Save accounts to database
    for (const accountData of accounts) {
      await db.socialAccount.upsert({
        where: {
          businessId_provider_accountId: {
            businessId: authState.businessId,
            provider: accountData.provider,
            accountId: accountData.accountId,
          },
        },
        update: {
          accessToken: accountData.accessToken,
          refreshToken: accountData.refreshToken,
          expiresAt: accountData.expiresAt,
          accountName: accountData.accountName,
          scopes: accountData.scopes,
          metadata: accountData.metadata,
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          id: nanoid(),
          businessId: authState.businessId,
          ...accountData,
        },
      });
    }

    // Log audit action
    await logAction(
      "system", // No specific user for OAuth callback
      "system",
      AUDIT_ACTIONS.SOCIAL_ACCOUNT_CONNECTED,
      "social_account",
      accounts[0].accountId,
      authState.businessId,
      { 
        provider, 
        accountsConnected: accounts.length,
        accountNames: accounts.map(a => a.accountName),
      }
    );

    // Redirect back to social page with success message
    return NextResponse.redirect(
      `/social?success=${encodeURIComponent(`${provider} account connected successfully`)}`
    );

  } catch (error) {
    return NextResponse.redirect(
      `/social?error=${encodeURIComponent(`Connection failed: ${error.message}`)}`
    );
  }
}
