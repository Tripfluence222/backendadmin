import { ProviderError } from "@/lib/providers/facebook";

export class MockFacebookProvider {
  static async createPagePost(
    pageAccessToken: string,
    pageId: string,
    post: { message: string; imageUrl?: string }
  ): Promise<{ id: string; url: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate rate limiting
    if (Math.random() < 0.1) {
      const error: ProviderError = {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Rate limit exceeded",
        retryable: true,
        statusCode: 429,
      };
      throw error;
    }
    
    // Simulate token expiration
    if (pageAccessToken === "expired_token") {
      const error: ProviderError = {
        code: "INVALID_TOKEN",
        message: "Token has expired",
        retryable: false,
        statusCode: 401,
      };
      throw error;
    }
    
    const postId = `mock_fb_${Date.now()}`;
    return {
      id: postId,
      url: `https://www.facebook.com/${pageId}/posts/${postId}`,
    };
  }

  static async createPageEvent(
    pageAccessToken: string,
    pageId: string,
    event: any
  ): Promise<{ id: string; url: string }> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (pageAccessToken === "expired_token") {
      const error: ProviderError = {
        code: "INVALID_TOKEN",
        message: "Token has expired",
        retryable: false,
        statusCode: 401,
      };
      throw error;
    }
    
    const eventId = `mock_event_${Date.now()}`;
    return {
      id: eventId,
      url: `https://www.facebook.com/events/${eventId}`,
    };
  }

  static async igCreateMedia(
    igUserId: string,
    accessToken: string,
    media: { image_url?: string; video_url?: string; caption: string }
  ): Promise<{ id: string }> {
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
    
    return { id: `mock_ig_media_${Date.now()}` };
  }

  static async igPublishMedia(
    igUserId: string,
    accessToken: string,
    creationId: string
  ): Promise<{ id: string; url: string }> {
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
    
    const mediaId = `mock_ig_${Date.now()}`;
    return {
      id: mediaId,
      url: `https://www.instagram.com/p/${mediaId}/`,
    };
  }

  static async validateToken(accessToken: string): Promise<boolean> {
    return accessToken !== "expired_token";
  }
}
