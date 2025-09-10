import { ProviderError } from "@/lib/providers/facebook";

export class MockEventbriteProvider {
  static async createEvent(
    accessToken: string,
    organizerId: string,
    event: any
  ): Promise<{ id: string; url: string }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (accessToken === "expired_token") {
      const error: ProviderError = {
        code: "INVALID_TOKEN",
        message: "Token has expired",
        retryable: false,
        statusCode: 401,
      };
      throw error;
    }
    
    const eventId = `mock_eb_${Date.now()}`;
    return {
      id: eventId,
      url: `https://www.eventbrite.com/e/${eventId}`,
    };
  }

  static async publishEvent(accessToken: string, eventId: string): Promise<{ id: string; url: string }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (accessToken === "expired_token") {
      const error: ProviderError = {
        code: "INVALID_TOKEN",
        message: "Token has expired",
        retryable: false,
        statusCode: 401,
      };
      throw error;
    }
    
    return {
      id: eventId,
      url: `https://www.eventbrite.com/e/${eventId}`,
    };
  }

  static async validateToken(accessToken: string): Promise<boolean> {
    return accessToken !== "expired_token";
  }

  static async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (refreshToken === "invalid_refresh") {
      throw new Error("Invalid refresh token");
    }
    
    return {
      access_token: "new_access_token",
      refresh_token: "new_refresh_token",
      expires_in: 3600,
    };
  }
}
