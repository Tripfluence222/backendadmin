import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface ProviderError {
  code: string;
  message: string;
  retryable: boolean;
  statusCode?: number;
}

export interface FacebookPageEvent {
  name: string;
  start_time: string; // ISO format
  end_time?: string;
  description?: string;
  place?: {
    name: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  ticket_uri?: string;
}

export interface FacebookPost {
  message: string;
  link?: string;
  imageUrl?: string;
}

export interface InstagramMedia {
  image_url?: string;
  video_url?: string;
  caption: string;
}

export class FacebookProvider {
  private static readonly API_BASE = env.GRAPH_API_BASE || "https://graph.facebook.com";
  private static readonly API_VERSION = "v18.0";

  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.API_BASE}/${this.API_VERSION}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ProviderError = {
          code: data.error?.code || "UNKNOWN_ERROR",
          message: data.error?.message || `HTTP ${response.status}`,
          retryable: this.isRetryableError(response.status, data.error?.code),
          statusCode: response.status,
        };
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error; // Re-throw ProviderError
      }
      
      logger.error(`Facebook API request failed: ${endpoint}`, error);
      throw {
        code: "NETWORK_ERROR",
        message: error.message,
        retryable: true,
      } as ProviderError;
    }
  }

  private static isRetryableError(statusCode: number, errorCode?: string): boolean {
    // Rate limiting
    if (statusCode === 429) return true;
    
    // Temporary server errors
    if (statusCode >= 500) return true;
    
    // Facebook-specific retryable errors
    const retryableCodes = [
      "API_TEMPORARILY_UNAVAILABLE",
      "SERVICE_UNAVAILABLE",
      "TEMPORARY_ISSUE",
    ];
    
    return retryableCodes.includes(errorCode || "");
  }

  static async getLongLivedUserToken(shortLivedToken: string): Promise<string> {
    const response = await this.makeRequest("/oauth/access_token", {
      method: "POST",
      body: JSON.stringify({
        grant_type: "fb_exchange_token",
        client_id: env.FACEBOOK_APP_ID,
        client_secret: env.FACEBOOK_APP_SECRET,
        fb_exchange_token: shortLivedToken,
      }),
    });

    return response.access_token;
  }

  static async getPageAccessToken(userAccessToken: string, pageId: string): Promise<string> {
    const response = await this.makeRequest(`/${pageId}?fields=access_token&access_token=${userAccessToken}`);
    return response.access_token;
  }

  // Events
  static async createPageEvent(
    pageAccessToken: string,
    pageId: string,
    event: FacebookPageEvent
  ): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/${pageId}/events`, {
      method: "POST",
      body: JSON.stringify({
        ...event,
        access_token: pageAccessToken,
      }),
    });

    return {
      id: response.id,
      url: `https://www.facebook.com/events/${response.id}`,
    };
  }

  static async updatePageEvent(
    pageAccessToken: string,
    eventId: string,
    event: Partial<FacebookPageEvent>
  ): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/${eventId}`, {
      method: "POST",
      body: JSON.stringify({
        ...event,
        access_token: pageAccessToken,
      }),
    });

    return {
      id: response.id,
      url: `https://www.facebook.com/events/${response.id}`,
    };
  }

  static async deletePageEvent(pageAccessToken: string, eventId: string): Promise<void> {
    await this.makeRequest(`/${eventId}`, {
      method: "DELETE",
      body: JSON.stringify({
        access_token: pageAccessToken,
      }),
    });
  }

  // Posts
  static async createPagePost(
    pageAccessToken: string,
    pageId: string,
    post: FacebookPost
  ): Promise<{ id: string; url: string }> {
    let endpoint = `/${pageId}/feed`;
    let body: any = {
      message: post.message,
      access_token: pageAccessToken,
    };

    // Handle image upload
    if (post.imageUrl) {
      // First upload the image
      const photoResponse = await this.makeRequest(`/${pageId}/photos`, {
        method: "POST",
        body: JSON.stringify({
          url: post.imageUrl,
          caption: post.message,
          access_token: pageAccessToken,
        }),
      });

      // Then create post with attached media
      body = {
        message: post.message,
        attached_media: `[{"media_fbid":"${photoResponse.id}"}]`,
        access_token: pageAccessToken,
      };
    } else if (post.link) {
      body.link = post.link;
    }

    const response = await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return {
      id: response.id,
      url: `https://www.facebook.com/${pageId}/posts/${response.id.split("_")[1]}`,
    };
  }

  // Instagram Business
  static async igCreateMedia(
    igUserId: string,
    accessToken: string,
    media: InstagramMedia
  ): Promise<{ id: string }> {
    const response = await this.makeRequest(`/${igUserId}/media`, {
      method: "POST",
      body: JSON.stringify({
        ...media,
        access_token: accessToken,
      }),
    });

    return { id: response.id };
  }

  static async igPublishMedia(
    igUserId: string,
    accessToken: string,
    creationId: string
  ): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/${igUserId}/media_publish`, {
      method: "POST",
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    return {
      id: response.id,
      url: `https://www.instagram.com/p/${response.id}/`,
    };
  }

  static async igGetMediaStatus(
    igUserId: string,
    accessToken: string,
    mediaId: string
  ): Promise<{ status: string; error?: any }> {
    const response = await this.makeRequest(`/${mediaId}?fields=status_code,status&access_token=${accessToken}`);
    
    return {
      status: response.status_code,
      error: response.status_code !== "FINISHED" ? response : undefined,
    };
  }

  // Utility methods
  static async getPageInfo(pageAccessToken: string, pageId: string): Promise<any> {
    return this.makeRequest(`/${pageId}?fields=id,name,category,fan_count&access_token=${pageAccessToken}`);
  }

  static async getInstagramAccountInfo(igUserId: string, accessToken: string): Promise<any> {
    return this.makeRequest(`/${igUserId}?fields=id,username,account_type,media_count&access_token=${accessToken}`);
  }

  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.makeRequest(`/me?access_token=${accessToken}`);
      return true;
    } catch (error) {
      return false;
    }
  }
}
