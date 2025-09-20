import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { rbacServer } from '@/lib/rbac-server';
import { SocialProvider } from '@prisma/client';
import { randomBytes } from 'crypto';

const connectSchema = z.object({
  businessId: z.string().cuid(),
  provider: z.nativeEnum(SocialProvider),
});

// OAuth scopes for each provider
const PROVIDER_SCOPES = {
  FACEBOOK_PAGE: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'instagram_basic', 'instagram_content_publish'],
  INSTAGRAM_BUSINESS: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
  GOOGLE_BUSINESS: ['https://www.googleapis.com/auth/business.manage'],
  EVENTBRITE: ['event:read', 'event:write', 'user:read'],
  MEETUP: ['ageless', 'group_edit', 'event_management'],
};

// OAuth URLs for each provider
const PROVIDER_AUTH_URLS = {
  FACEBOOK_PAGE: 'https://www.facebook.com/v18.0/dialog/oauth',
  INSTAGRAM_BUSINESS: 'https://www.facebook.com/v18.0/dialog/oauth',
  GOOGLE_BUSINESS: 'https://accounts.google.com/o/oauth2/v2/auth',
  EVENTBRITE: 'https://www.eventbrite.com/oauth/authorize',
  MEETUP: 'https://secure.meetup.com/oauth2/authorize',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const providerEnum = provider as SocialProvider;

    // Validate input
    const validation = connectSchema.safeParse({ businessId, provider: providerEnum });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { businessId: validBusinessId, provider: validProvider } = validation.data;

    // Check RBAC permissions
    const user = await rbacServer.getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacServer.checkPermission(
      user.id,
      validBusinessId,
      ['ADMIN', 'MANAGER', 'INFLUENCER']
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Generate state parameter for OAuth security
    const state = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store state in database
    await db.providerAuthState.create({
      data: {
        state,
        provider: validProvider,
        businessId: validBusinessId,
        expiresAt,
      },
    });

    // Build OAuth URL
    const baseUrl = process.env.OAUTH_REDIRECT_BASE || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/callback/${validProvider}`;
    
    const scopes = PROVIDER_SCOPES[validProvider];
    const authUrl = PROVIDER_AUTH_URLS[validProvider];

    const params = new URLSearchParams({
      client_id: getClientId(validProvider),
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
      response_type: 'code',
      state,
    });

    // Provider-specific parameters
    if (validProvider === 'FACEBOOK_PAGE' || validProvider === 'INSTAGRAM_BUSINESS') {
      params.append('config_id', getConfigId(validProvider));
    }

    const fullAuthUrl = `${authUrl}?${params.toString()}`;

    // Log the connection attempt
    await logAction(
      user.id,
      'user',
      'PROVIDER_CONNECT_ATTEMPT',
      'SocialAccount',
      'temp',
      validBusinessId,
      { provider: validProvider }
    );

    return NextResponse.json({ authUrl: fullAuthUrl });

  } catch (error) {
    console.error('OAuth connect error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth connection' },
      { status: 500 }
    );
  }
}

function getClientId(provider: SocialProvider): string {
  switch (provider) {
    case 'FACEBOOK_PAGE':
    case 'INSTAGRAM_BUSINESS':
      return process.env.FACEBOOK_APP_ID || '';
    case 'GOOGLE_BUSINESS':
      return process.env.GOOGLE_CLIENT_ID || '';
    case 'EVENTBRITE':
      return process.env.EVENTBRITE_CLIENT_ID || '';
    case 'MEETUP':
      return process.env.MEETUP_CLIENT_ID || '';
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

function getConfigId(provider: SocialProvider): string {
  switch (provider) {
    case 'FACEBOOK_PAGE':
      return process.env.FACEBOOK_PAGE_CONFIG_ID || '';
    case 'INSTAGRAM_BUSINESS':
      return process.env.INSTAGRAM_CONFIG_ID || '';
    default:
      return '';
  }
}