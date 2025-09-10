import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ProviderError } from "./facebook";

export interface MeetupEvent {
  name: string;
  time: number; // Unix timestamp in milliseconds
  duration?: number; // Duration in milliseconds
  venue?: {
    name: string;
    address_1?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
  description?: string;
  how_to_find_us?: string;
  rsvp_limit?: number;
  waitlist?: boolean;
  announce?: boolean;
  publish_status?: "draft" | "published";
}

export interface MeetupGroup {
  id: number;
  name: string;
  urlname: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  members?: number;
  created?: number;
  category?: {
    id: number;
    name: string;
    shortname: string;
  };
}

export class MeetupProvider {
  private static readonly API_BASE = "https://api.meetup.com";

  private static async makeRequest(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.API_BASE}${endpoint}`;
    
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
          code: data.code || "UNKNOWN_ERROR",
          message: data.details || data.problem || `HTTP ${response.status}`,
          retryable: this.isRetryableError(response.status, data.code),
          statusCode: response.status,
        };
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error; // Re-throw ProviderError
      }
      
      logger.error(`Meetup API request failed: ${endpoint}`, error);
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
    
    // Meetup-specific retryable errors
    const retryableCodes = [
      "SERVICE_UNAVAILABLE",
      "INTERNAL_ERROR",
      "TEMPORARY_ISSUE",
    ];
    
    return retryableCodes.includes(errorCode || "");
  }

  static async createEvent(
    accessToken: string,
    groupUrlName: string,
    event: MeetupEvent
  ): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/${groupUrlName}/events`, accessToken, {
      method: "POST",
      body: JSON.stringify(event),
    });

    return {
      id: response.id.toString(),
      url: response.link,
    };
  }

  static async updateEvent(
    accessToken: string,
    groupUrlName: string,
    eventId: string,
    event: Partial<MeetupEvent>
  ): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/${groupUrlName}/events/${eventId}`, accessToken, {
      method: "PATCH",
      body: JSON.stringify(event),
    });

    return {
      id: response.id.toString(),
      url: response.link,
    };
  }

  static async deleteEvent(
    accessToken: string,
    groupUrlName: string,
    eventId: string
  ): Promise<void> {
    await this.makeRequest(`/${groupUrlName}/events/${eventId}`, accessToken, {
      method: "DELETE",
    });
  }

  static async getEvent(
    accessToken: string,
    groupUrlName: string,
    eventId: string
  ): Promise<any> {
    return this.makeRequest(`/${groupUrlName}/events/${eventId}`, accessToken);
  }

  static async getEvents(accessToken: string, groupUrlName: string): Promise<any[]> {
    const response = await this.makeRequest(`/${groupUrlName}/events`, accessToken);
    return response || [];
  }

  static async getGroup(accessToken: string, groupUrlName: string): Promise<MeetupGroup> {
    return this.makeRequest(`/${groupUrlName}`, accessToken);
  }

  static async getGroups(accessToken: string): Promise<MeetupGroup[]> {
    const response = await this.makeRequest("/self/groups", accessToken);
    return response || [];
  }

  static async getUser(accessToken: string): Promise<any> {
    return this.makeRequest("/members/self", accessToken);
  }

  static async getMember(accessToken: string, memberId: string): Promise<any> {
    return this.makeRequest(`/members/${memberId}`, accessToken);
  }

  static async getCategories(accessToken: string): Promise<any[]> {
    const response = await this.makeRequest("/categories", accessToken);
    return response || [];
  }

  static async searchGroups(
    accessToken: string,
    query: string,
    location?: string
  ): Promise<MeetupGroup[]> {
    const params = new URLSearchParams({
      text: query,
      ...(location && { location }),
    });

    const response = await this.makeRequest(`/find/groups?${params}`, accessToken);
    return response || [];
  }

  static async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUser(accessToken);
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
    const response = await fetch("https://secure.meetup.com/oauth2/access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: env.MEETUP_CLIENT_ID!,
        client_secret: env.MEETUP_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Utility methods
  static formatEventForMeetup(listing: any): MeetupEvent {
    const startTime = new Date(listing.startDate).getTime();
    const endTime = listing.endDate ? new Date(listing.endDate).getTime() : null;
    const duration = endTime ? endTime - startTime : undefined;

    return {
      name: listing.title,
      time: startTime,
      duration,
      description: listing.description,
      venue: listing.location ? {
        name: listing.location.name || listing.location.address,
        address_1: listing.location.address,
        city: listing.location.city,
        state: listing.location.state,
        country: listing.location.country,
        lat: listing.location.latitude,
        lon: listing.location.longitude,
      } : undefined,
      rsvp_limit: listing.capacity,
      publish_status: "published",
    };
  }
}
