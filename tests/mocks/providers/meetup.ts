import { ProviderError } from "@/lib/providers/facebook";

export class MockMeetupProvider {
  static async createEvent(
    accessToken: string,
    groupUrlName: string,
    event: any
  ): Promise<{ id: string; url: string }> {
    await new Promise(resolve => setTimeout(resolve, 180));
    
    if (accessToken === "expired_token") {
      const error: ProviderError = {
        code: "INVALID_TOKEN",
        message: "Token has expired",
        retryable: false,
        statusCode: 401,
      };
      throw error;
    }
    
    const eventId = `mock_meetup_${Date.now()}`;
    return {
      id: eventId,
      url: `https://www.meetup.com/${groupUrlName}/events/${eventId}`,
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

  static formatEventForMeetup(listing: any): any {
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
