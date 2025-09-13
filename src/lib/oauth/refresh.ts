import { db } from '@/lib/db';
import { encryptToken, decryptToken } from '@/lib/crypto';
import { SocialProvider } from '@prisma/client';
import { FacebookProvider } from '@/lib/providers/facebook';
import { GoogleBusinessProvider } from '@/lib/providers/google-business';
import { EventbriteProvider } from '@/lib/providers/eventbrite';
import { MeetupProvider } from '@/lib/providers/meetup';

export interface RefreshResult {
  success: boolean;
  newAccessToken?: string;
  error?: string;
}

export async function refreshProviderToken(
  socialAccountId: string
): Promise<RefreshResult> {
  try {
    const socialAccount = await db.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!socialAccount) {
      return { success: false, error: 'Social account not found' };
    }

    if (!socialAccount.refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    const refreshToken = decryptToken(socialAccount.refreshToken);
    let newAccessToken: string;

    switch (socialAccount.provider) {
      case 'FACEBOOK_PAGE':
      case 'INSTAGRAM_BUSINESS':
        const facebookProvider = new FacebookProvider(
          decryptToken(socialAccount.accessToken)
        );
        newAccessToken = await facebookProvider.refreshToken();
        break;

      case 'GOOGLE_BUSINESS':
        const googleProvider = new GoogleBusinessProvider(
          decryptToken(socialAccount.accessToken),
          socialAccount.accountName
        );
        newAccessToken = await googleProvider.refreshToken();
        break;

      case 'EVENTBRITE':
        const eventbriteProvider = new EventbriteProvider(
          decryptToken(socialAccount.accessToken)
        );
        newAccessToken = await eventbriteProvider.refreshToken();
        break;

      case 'MEETUP':
        const meetupProvider = new MeetupProvider(
          decryptToken(socialAccount.accessToken)
        );
        newAccessToken = await meetupProvider.refreshToken();
        break;

      default:
        return { success: false, error: `Unsupported provider: ${socialAccount.provider}` };
    }

    // Update the social account with the new token
    const encryptedNewToken = encryptToken(newAccessToken);
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    await db.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        accessToken: encryptedNewToken,
        expiresAt,
        lastSuccessAt: new Date(),
        lastErrorAt: null,
      },
    });

    return { success: true, newAccessToken };

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Update the social account with error information
    await db.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        lastErrorAt: new Date(),
      },
    });

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function refreshExpiredTokens(): Promise<{
  refreshed: number;
  failed: number;
  errors: string[];
}> {
  const now = new Date();
  const expiredAccounts = await db.socialAccount.findMany({
    where: {
      expiresAt: {
        lt: now,
      },
      refreshToken: {
        not: null,
      },
    },
  });

  let refreshed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const account of expiredAccounts) {
    const result = await refreshProviderToken(account.id);
    
    if (result.success) {
      refreshed++;
    } else {
      failed++;
      errors.push(`${account.provider} (${account.accountName}): ${result.error}`);
    }
  }

  return { refreshed, failed, errors };
}

export async function testProviderConnection(
  socialAccountId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const socialAccount = await db.socialAccount.findUnique({
      where: { id: socialAccountId },
    });

    if (!socialAccount) {
      return { success: false, error: 'Social account not found' };
    }

    const accessToken = decryptToken(socialAccount.accessToken);
    let isConnected: boolean;

    switch (socialAccount.provider) {
      case 'FACEBOOK_PAGE':
      case 'INSTAGRAM_BUSINESS':
        const facebookProvider = new FacebookProvider(accessToken);
        isConnected = await facebookProvider.testConnection();
        break;

      case 'GOOGLE_BUSINESS':
        const googleProvider = new GoogleBusinessProvider(
          accessToken,
          socialAccount.accountName
        );
        isConnected = await googleProvider.testConnection();
        break;

      case 'EVENTBRITE':
        const eventbriteProvider = new EventbriteProvider(accessToken);
        isConnected = await eventbriteProvider.testConnection();
        break;

      case 'MEETUP':
        const meetupProvider = new MeetupProvider(accessToken);
        isConnected = await meetupProvider.testConnection();
        break;

      default:
        return { success: false, error: `Unsupported provider: ${socialAccount.provider}` };
    }

    // Update connection status
    await db.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        lastSuccessAt: isConnected ? new Date() : null,
        lastErrorAt: isConnected ? null : new Date(),
      },
    });

    return { success: isConnected };

  } catch (error) {
    console.error('Connection test error:', error);
    
    await db.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        lastErrorAt: new Date(),
      },
    });

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
