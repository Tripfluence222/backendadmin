import { db } from "@/lib/db";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import { GoogleBusinessProvider } from "@/lib/providers/google-business";
import { EventbriteProvider } from "@/lib/providers/eventbrite";
import { MeetupProvider } from "@/lib/providers/meetup";

export interface RefreshResult {
  success: boolean;
  newAccessToken?: string;
  newRefreshToken?: string;
  expiresAt?: Date;
  error?: string;
}

export class TokenRefreshService {
  static async refreshToken(accountId: string): Promise<RefreshResult> {
    try {
      const account = await db.socialAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return { success: false, error: "Account not found" };
      }

      if (!account.refreshToken) {
        return { success: false, error: "No refresh token available" };
      }

      const refreshToken = await decryptToken(account.refreshToken);
      let refreshResult;

      switch (account.provider) {
        case "GOOGLE_BUSINESS":
          refreshResult = await GoogleBusinessProvider.refreshToken(refreshToken);
          break;
        case "EVENTBRITE":
          refreshResult = await EventbriteProvider.refreshToken(refreshToken);
          break;
        case "MEETUP":
          refreshResult = await MeetupProvider.refreshToken(refreshToken);
          break;
        case "FACEBOOK_PAGE":
        case "INSTAGRAM_BUSINESS":
          // Facebook tokens are long-lived and don't need refresh
          return { success: false, error: "Facebook tokens are long-lived" };
        default:
          return { success: false, error: `Unsupported provider: ${account.provider}` };
      }

      // Encrypt new tokens
      const newAccessToken = await encryptToken(refreshResult.access_token);
      const newRefreshToken = refreshResult.refresh_token 
        ? await encryptToken(refreshResult.refresh_token)
        : account.refreshToken; // Keep existing if no new refresh token

      const expiresAt = refreshResult.expires_in 
        ? new Date(Date.now() + refreshResult.expires_in * 1000)
        : null;

      // Update account with new tokens
      await db.socialAccount.update({
        where: { id: accountId },
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt,
          updatedAt: new Date(),
        },
      });

      logger.info(`Token refreshed successfully for account ${accountId}`);

      return {
        success: true,
        newAccessToken: refreshResult.access_token,
        newRefreshToken: refreshResult.refresh_token,
        expiresAt,
      };

    } catch (error) {
      logger.error(`Token refresh failed for account ${accountId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static async refreshExpiredTokens(): Promise<{
    refreshed: number;
    failed: number;
    errors: string[];
  }> {
    const now = new Date();
    const accounts = await db.socialAccount.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
        refreshToken: {
          not: null,
        },
        isActive: true,
      },
    });

    let refreshed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const account of accounts) {
      const result = await this.refreshToken(account.id);
      if (result.success) {
        refreshed++;
      } else {
        failed++;
        errors.push(`${account.provider} (${account.accountName}): ${result.error}`);
      }
    }

    logger.info(`Token refresh completed: ${refreshed} refreshed, ${failed} failed`);

    return { refreshed, failed, errors };
  }

  static async getValidToken(accountId: string): Promise<string | null> {
    try {
      const account = await db.socialAccount.findUnique({
        where: { id: accountId },
      });

      if (!account || !account.isActive) {
        return null;
      }

      // Check if token is expired
      if (account.expiresAt && account.expiresAt < new Date()) {
        // Try to refresh
        const refreshResult = await this.refreshToken(accountId);
        if (refreshResult.success && refreshResult.newAccessToken) {
          return refreshResult.newAccessToken;
        }
        return null;
      }

      // Return decrypted token
      return await decryptToken(account.accessToken);

    } catch (error) {
      logger.error(`Failed to get valid token for account ${accountId}:`, error);
      return null;
    }
  }

  static async validateAndRefreshToken(accountId: string): Promise<boolean> {
    try {
      const token = await this.getValidToken(accountId);
      if (!token) {
        return false;
      }

      // Validate token with provider
      const account = await db.socialAccount.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        return false;
      }

      let isValid = false;

      switch (account.provider) {
        case "FACEBOOK_PAGE":
        case "INSTAGRAM_BUSINESS":
          const { FacebookProvider } = await import("@/lib/providers/facebook");
          isValid = await FacebookProvider.validateToken(token);
          break;
        case "GOOGLE_BUSINESS":
          isValid = await GoogleBusinessProvider.validateToken(token);
          break;
        case "EVENTBRITE":
          isValid = await EventbriteProvider.validateToken(token);
          break;
        case "MEETUP":
          isValid = await MeetupProvider.validateToken(token);
          break;
      }

      if (!isValid) {
        // Try to refresh
        const refreshResult = await this.refreshToken(accountId);
        return refreshResult.success;
      }

      return true;

    } catch (error) {
      logger.error(`Token validation failed for account ${accountId}:`, error);
      return false;
    }
  }
}
