import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { rbacServer } from '@/lib/rbac-server';
import { SocialProvider } from '@prisma/client';
import { encryptToken } from '@/lib/crypto';

const callbackSchema = z.object({
  code: z.string(),
  state: z.string(),
  provider: z.nativeEnum(SocialProvider),
});

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const providerEnum = provider as SocialProvider;

    // Validate input
    const validation = callbackSchema.safeParse({ code, state, provider: providerEnum });
    if (!validation.success) {
      return NextResponse.redirect(
        `${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/social?error=invalid_parameters`
      );
    }

    const { code: validCode, state: validState, provider: validProvider } = validation.data;

    // Verify state parameter
    const authState = await db.providerAuthState.findUnique({
      where: { state: validState },
    });

    if (!authState || authState.expiresAt < new Date()) {
      return NextResponse.redirect(
        `${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/social?error=invalid_state`
      );
    }

    // Clean up used state
    await db.providerAuthState.delete({
      where: { state: validState },
    });

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(validProvider, validCode);
    if (!tokenResponse) {
      return NextResponse.redirect(
        `${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/social?error=token_exchange_failed`
      );
    }

    // Fetch account information
    const accountInfo = await fetchAccountInfo(validProvider, tokenResponse.accessToken);
    if (!accountInfo) {
      return NextResponse.redirect(
        `${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/social?error=account_fetch_failed`
      );
    }

    // Encrypt tokens
    const encryptedAccessToken = encryptToken(tokenResponse.accessToken);
    const encryptedRefreshToken = tokenResponse.refreshToken 
      ? encryptToken(tokenResponse.refreshToken) 
      : null;

    // Upsert social account
    const socialAccount = await db.socialAccount.upsert({
      where: {
        businessId_provider_accountId: {
          businessId: authState.businessId,
          provider: validProvider,
          accountId: accountInfo.id,
        },
      },
      update: {
        accountName: accountInfo.name,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokenResponse.expiresAt,
        scopes: tokenResponse.scopes,
        metadata: accountInfo.metadata,
        lastSuccessAt: new Date(),
        lastErrorAt: null,
      },
      create: {
        businessId: authState.businessId,
        provider: validProvider,
        accountId: accountInfo.id,
        accountName: accountInfo.name,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: tokenResponse.expiresAt,
        scopes: tokenResponse.scopes,
        metadata: accountInfo.metadata,
        lastSuccessAt: new Date(),
      },
    });

    // Log successful connection
    await logAction(
      authState.userId || 'system',
      'user',
      'PROVIDER_CONNECTED',
      'SocialAccount',
      socialAccount.id,
      authState.businessId,
      { 
        provider: validProvider,
        accountName: accountInfo.name,
        accountId: accountInfo.id,
      }
    );

    return NextResponse.redirect(
      `${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/social?success=connected&provider=${validProvider}`
    );

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000'}/social?error=callback_failed`
    );
  }
}

async function exchangeCodeForTokens(provider: SocialProvider, code: string) {
  const baseUrl = process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;

  switch (provider) {
    case 'FACEBOOK_PAGE':
    case 'INSTAGRAM_BUSINESS':
      return exchangeFacebookTokens(code, redirectUri);
    case 'GOOGLE_BUSINESS':
      return exchangeGoogleTokens(code, redirectUri);
    case 'EVENTBRITE':
      return exchangeEventbriteTokens(code, redirectUri);
    case 'MEETUP':
      return exchangeMeetupTokens(code, redirectUri);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function exchangeFacebookTokens(code: string, redirectUri: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || '',
      client_secret: process.env.FACEBOOK_APP_SECRET || '',
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Facebook token exchange failed');
  }

  const data = await response.json();
  const expiresAt = data.expires_in 
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;

  return {
    accessToken: data.access_token,
    refreshToken: null, // Facebook uses long-lived tokens
    expiresAt,
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
  };
}

async function exchangeGoogleTokens(code: string, redirectUri: string) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error('Google token exchange failed');
  }

  const data = await response.json();
  const expiresAt = data.expires_in 
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    scopes: data.scope ? data.scope.split(' ') : [],
  };
}

async function exchangeEventbriteTokens(code: string, redirectUri: string) {
  const response = await fetch('https://www.eventbrite.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.EVENTBRITE_CLIENT_ID || '',
      client_secret: process.env.EVENTBRITE_CLIENT_SECRET || '',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Eventbrite token exchange failed');
  }

  const data = await response.json();
  const expiresAt = data.expires_in 
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    scopes: data.scope ? data.scope.split(' ') : [],
  };
}

async function exchangeMeetupTokens(code: string, redirectUri: string) {
  const response = await fetch('https://secure.meetup.com/oauth2/access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.MEETUP_CLIENT_ID || '',
      client_secret: process.env.MEETUP_CLIENT_SECRET || '',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error('Meetup token exchange failed');
  }

  const data = await response.json();
  const expiresAt = data.expires_in 
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt,
    scopes: data.scope ? data.scope.split(' ') : [],
  };
}

async function fetchAccountInfo(provider: SocialProvider, accessToken: string) {
  switch (provider) {
    case 'FACEBOOK_PAGE':
      return fetchFacebookPageInfo(accessToken);
    case 'INSTAGRAM_BUSINESS':
      return fetchInstagramBusinessInfo(accessToken);
    case 'GOOGLE_BUSINESS':
      return fetchGoogleBusinessInfo(accessToken);
    case 'EVENTBRITE':
      return fetchEventbriteUserInfo(accessToken);
    case 'MEETUP':
      return fetchMeetupUserInfo(accessToken);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

async function fetchFacebookPageInfo(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch Facebook pages');
  }

  const data = await response.json();
  const page = data.data?.[0]; // Get first page
  
  if (!page) {
    throw new Error('No Facebook pages found');
  }

  return {
    id: page.id,
    name: page.name,
    metadata: {
      pageId: page.id,
      pageName: page.name,
      category: page.category,
      tasks: page.tasks,
    },
  };
}

async function fetchInstagramBusinessInfo(accessToken: string) {
  // First get pages, then get Instagram business account
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );
  
  if (!pagesResponse.ok) {
    throw new Error('Failed to fetch Facebook pages for Instagram');
  }

  const pagesData = await pagesResponse.json();
  const page = pagesData.data?.[0];
  
  if (!page) {
    throw new Error('No Facebook pages found for Instagram');
  }

  // Get Instagram business account
  const instagramResponse = await fetch(
    `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${accessToken}`
  );
  
  if (!instagramResponse.ok) {
    throw new Error('Failed to fetch Instagram business account');
  }

  const instagramData = await instagramResponse.json();
  const instagramAccount = instagramData.instagram_business_account;
  
  if (!instagramAccount) {
    throw new Error('No Instagram business account found');
  }

  return {
    id: instagramAccount.id,
    name: page.name,
    metadata: {
      pageId: page.id,
      pageName: page.name,
      instagramAccountId: instagramAccount.id,
    },
  };
}

async function fetchGoogleBusinessInfo(accessToken: string) {
  const response = await fetch(
    'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch Google Business accounts');
  }

  const data = await response.json();
  const account = data.accounts?.[0];
  
  if (!account) {
    throw new Error('No Google Business accounts found');
  }

  return {
    id: account.name,
    name: account.accountName,
    metadata: {
      accountName: account.accountName,
      type: account.type,
    },
  };
}

async function fetchEventbriteUserInfo(accessToken: string) {
  const response = await fetch('https://www.eventbriteapi.com/v3/users/me/', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Eventbrite user info');
  }

  const data = await response.json();
  
  return {
    id: data.id,
    name: data.name,
    metadata: {
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
    },
  };
}

async function fetchMeetupUserInfo(accessToken: string) {
  const response = await fetch('https://api.meetup.com/2/member/self', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch Meetup user info');
  }

  const data = await response.json();
  
  return {
    id: data.id.toString(),
    name: data.name,
    metadata: {
      city: data.city,
      country: data.country,
      state: data.state,
    },
  };
}