import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { ProviderError } from "./facebook";

export interface EventbriteEvent {
  name: {
    text: string;
    html?: string;
  };
  start: {
    timezone: string;
    utc: string; // ISO format
  };
  end?: {
    timezone: string;
    utc: string; // ISO format
  };
  currency?: string;
  summary?: string;
  description?: {
    text: string;
    html?: string;
  };
  venue_id?: string;
  online_event?: boolean;
  listed?: boolean;
  shareable?: boolean;
  invite_only?: boolean;
  show_remaining?: boolean;
  capacity?: number;
  is_reserved_seating?: boolean;
}

export interface EventbriteVenue {
  name: string;
  address?: {
    address_1?: string;
    address_2?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  capacity?: number;
}

export class EventbriteProvider {
  private static readonly API_BASE = "https://www.eventbriteapi.com";

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
          code: data.error || "UNKNOWN_ERROR",
          message: data.error_description || `HTTP ${response.status}`,
          retryable: this.isRetryableError(response.status, data.error),
          statusCode: response.status,
        };
        throw error;
      }

      return data;
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        throw error; // Re-throw ProviderError
      }
      
      logger.error(`Eventbrite API request failed: ${endpoint}`, error);
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
    
    // Eventbrite-specific retryable errors
    const retryableCodes = [
      "SERVICE_UNAVAILABLE",
      "INTERNAL_ERROR",
      "TEMPORARY_ISSUE",
    ];
    
    return retryableCodes.includes(errorCode || "");
  }

  static async createEvent(
    accessToken: string,
    organizerId: string,
    event: EventbriteEvent
  ): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest("/v3/events/", accessToken, {
      method: "POST",
      body: JSON.stringify({
        event: {
          ...event,
          organizer_id: organizerId,
        },
      }),
    });

    return {
      id: response.id,
      url: response.url,
    };
  }

  static async updateEvent(
    accessToken: string,
    eventId: string,
    event: Partial<EventbriteEvent>
  ): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/v3/events/${eventId}/`, accessToken, {
      method: "POST",
      body: JSON.stringify({
        event,
      }),
    });

    return {
      id: response.id,
      url: response.url,
    };
  }

  static async publishEvent(accessToken: string, eventId: string): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/v3/events/${eventId}/publish/`, accessToken, {
      method: "POST",
    });

    return {
      id: response.id,
      url: response.url,
    };
  }

  static async unpublishEvent(accessToken: string, eventId: string): Promise<{ id: string; url: string }> {
    const response = await this.makeRequest(`/v3/events/${eventId}/unpublish/`, accessToken, {
      method: "POST",
    });

    return {
      id: response.id,
      url: response.url,
    };
  }

  static async deleteEvent(accessToken: string, eventId: string): Promise<void> {
    await this.makeRequest(`/v3/events/${eventId}/`, accessToken, {
      method: "DELETE",
    });
  }

  static async getEvent(accessToken: string, eventId: string): Promise<any> {
    return this.makeRequest(`/v3/events/${eventId}/`, accessToken);
  }

  static async getEvents(accessToken: string, organizerId: string): Promise<any[]> {
    const response = await this.makeRequest(`/v3/organizers/${organizerId}/events/`, accessToken);
    return response.events || [];
  }

  static async createVenue(
    accessToken: string,
    organizerId: string,
    venue: EventbriteVenue
  ): Promise<{ id: string }> {
    const response = await this.makeRequest("/v3/venues/", accessToken, {
      method: "POST",
      body: JSON.stringify({
        venue: {
          ...venue,
          organizer_id: organizerId,
        },
      }),
    });

    return { id: response.id };
  }

  static async getVenues(accessToken: string, organizerId: string): Promise<any[]> {
    const response = await this.makeRequest(`/v3/organizers/${organizerId}/venues/`, accessToken);
    return response.venues || [];
  }

  static async getOrganizations(accessToken: string): Promise<any[]> {
    const response = await this.makeRequest("/v3/users/me/organizations/", accessToken);
    return response.organizations || [];
  }

  static async getOrganization(accessToken: string, organizationId: string): Promise<any> {
    return this.makeRequest(`/v3/organizations/${organizationId}/`, accessToken);
  }

  static async getUser(accessToken: string): Promise<any> {
    return this.makeRequest("/v3/users/me/", accessToken);
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
    const response = await fetch("https://www.eventbrite.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: env.EVENTBRITE_CLIENT_ID!,
        client_secret: env.EVENTBRITE_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    return response.json();
  }
}
