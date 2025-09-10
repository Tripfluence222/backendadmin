import { ProviderError } from "@/lib/providers/facebook";

export class MockGoogleBusinessProvider {
  static async createPost(
    locationName: string,
    accessToken: string,
    post: { summary: string; media?: any[] }
  ): Promise<{ name: string; url: string }> {
    await new Promise(resolve => setTimeout(resolve, 120));
    
    if (accessToken === "expired_token") {
      const error: ProviderError = {
        code: "INVALID_TOKEN",
        message: "Token has expired",
        retryable: false,
        statusCode: 401,
      };
      throw error;
    }
    
    const postName = `mock_gbp_${Date.now()}`;
    return {
      name: postName,
      url: `https://business.google.com/posts/${postName.split("/").pop()}`,
    };
  }

  static async createEventPost(
    locationName: string,
    accessToken: string,
    event: any
  ): Promise<{ name: string; url: string }> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (accessToken === "expired_token") {
      const error: ProviderError = {
        code: "INVALID_TOKEN",
        message: "Token has expired",
        retryable: false,
        statusCode: 401,
      };
      throw error;
    }
    
    const postName = `mock_gbp_event_${Date.now()}`;
    return {
      name: postName,
      url: `https://business.google.com/posts/${postName.split("/").pop()}`,
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
