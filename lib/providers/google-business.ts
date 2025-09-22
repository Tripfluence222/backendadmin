import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ProviderError } from "./facebook";

export interface GoogleBusinessPost {
  summary: string;
  callToActionUrl?: string;
  media?: {
    mediaFormat: "PHOTO" | "VIDEO";
    sourceUrl: string;
  }[];
}

export interface GoogleBusinessEvent {
  title: string;
  schedule?: {
    startDate: string; // YYYY-MM-DD
    endDate?: string;
    startTime?: string; // HH:MM
    endTime?: string;
  };
  summary?: string;
}

export class GoogleBusinessProvider {
  private static readonly API_BASE = env.GBP_API_BASE || "https://mybusiness.googleapis.com";
  private static readonly API_VERSION = "v4";

  private static async makeRequest(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.API_BASE}/${this.API_VERSION}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
      
      logger.error(`Google Business API request failed: ${endpoint}`, error);
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
    
    // Google-specific retryable errors
    const retryableCodes = [
      "SERVICE_UNAVAILABLE",
      "INTERNAL_ERROR",
      "DEADLINE_EXCEEDED",
    ];
    
    return retryableCodes.includes(errorCode || "");
  }

  static async createPost(
    locationName: string,
    accessToken: string,
    post: GoogleBusinessPost
  ): Promise<{ name: string; url: string }> {
    const response = await this.makeRequest(
      `/${locationName}/localPosts`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          summary: post.summary,
          callToAction: post.callToActionUrl ? {
            actionType: "LEARN_MORE",
            url: post.callToActionUrl,
          } : undefined,
          media: post.media?.map(media => ({
            mediaFormat: media.mediaFormat,
            sourceUrl: media.sourceUrl,
          })),
        }),
      }
    );

    return {
      name: response.name,
      url: `https://business.google.com/posts/${response.name.split("/").pop()}`,
    };
  }

  static async createEventPost(
    locationName: string,
    accessToken: string,
    event: GoogleBusinessEvent
  ): Promise<{ name: string; url: string }> {
    const response = await this.makeRequest(
      `/${locationName}/localPosts`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          summary: event.summary || event.title,
          event: {
            title: event.title,
            schedule: event.schedule ? {
              startDate: event.schedule.startDate,
              endDate: event.schedule.endDate,
              startTime: event.schedule.startTime,
              endTime: event.schedule.endTime,
            } : undefined,
          },
        }),
      }
    );

    return {
      name: response.name,
      url: `https://business.google.com/posts/${response.name.split("/").pop()}`,
    };
  }

  static async updatePost(
    locationName: string,
    accessToken: string,
    postName: string,
    post: Partial<GoogleBusinessPost>
  ): Promise<{ name: string; url: string }> {
    const response = await this.makeRequest(
      `/${postName}`,
      accessToken,
      {
        method: "PATCH",
        body: JSON.stringify({
          summary: post.summary,
          callToAction: post.callToActionUrl ? {
            actionType: "LEARN_MORE",
            url: post.callToActionUrl,
          } : undefined,
          media: post.media?.map(media => ({
            mediaFormat: media.mediaFormat,
            sourceUrl: media.sourceUrl,
          })),
        }),
      }
    );

    return {
      name: response.name,
      url: `https://business.google.com/posts/${response.name.split("/").pop()}`,
    };
  }

  static async deletePost(
    locationName: string,
    accessToken: string,
    postName: string
  ): Promise<void> {
    await this.makeRequest(
      `/${postName}`,
      accessToken,
      {
        method: "DELETE",
      }
    );
  }

  static async getAccounts(accessToken: string): Promise<any[]> {
    const response = await this.makeRequest("/accounts", accessToken);
    return response.accounts || [];
  }

  static async getLocations(accessToken: string, accountName: string): Promise<any[]> {
    const response = await this.makeRequest(`/${accountName}/locations`, accessToken);
    return response.locations || [];
  }

  static async getLocationInfo(accessToken: string, locationName: string): Promise<any> {
    return this.makeRequest(`/${locationName}`, accessToken);
  }

  static async getPosts(accessToken: string, locationName: string): Promise<any[]> {
    const response = await this.makeRequest(`/${locationName}/localPosts`, accessToken);
    return response.localPosts || [];
  }

  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getAccounts(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async refreshToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return response.json();
  }
}
