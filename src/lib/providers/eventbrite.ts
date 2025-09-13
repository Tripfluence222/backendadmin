import { SocialProvider } from '@prisma/client';
import { decryptToken } from '@/lib/crypto';

export interface EventbriteEvent {
  id: string;
  name: {
    text: string;
    html: string;
  };
  description: {
    text: string;
    html: string;
  };
  start: {
    timezone: string;
    local: string;
    utc: string;
  };
  end: {
    timezone: string;
    local: string;
    utc: string;
  };
  url: string;
  status: 'draft' | 'live' | 'started' | 'ended' | 'completed' | 'canceled';
  currency: string;
  online_event: boolean;
  venue_id?: string;
  organizer_id: string;
}

export interface EventbriteVenue {
  id: string;
  name: string;
  address: {
    address_1: string;
    address_2?: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
    latitude?: string;
    longitude?: string;
  };
}

export class EventbriteProvider {
  private accessToken: string;
  private organizerId: string;

  constructor(accessToken: string, organizerId?: string) {
    this.accessToken = accessToken;
    this.organizerId = organizerId || '';
  }

  static async createFromSocialAccount(socialAccount: any) {
    const accessToken = decryptToken(socialAccount.accessToken);
    const organizerId = socialAccount.metadata?.organizerId;
    
    return new EventbriteProvider(accessToken, organizerId);
  }

  async createEvent(eventData: {
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    venueId?: string;
    onlineEvent?: boolean;
    currency?: string;
    capacity?: number;
    ticketPrice?: number;
  }): Promise<EventbriteEvent> {
    // First, get organizer ID if not provided
    if (!this.organizerId) {
      const user = await this.getUser();
      this.organizerId = user.id;
    }

    const eventPayload = {
      event: {
        name: {
          html: eventData.name,
        },
        description: {
          html: eventData.description,
        },
        start: {
          timezone: eventData.timezone,
          utc: eventData.startDate.toISOString(),
        },
        end: {
          timezone: eventData.timezone,
          utc: eventData.endDate.toISOString(),
        },
        currency: eventData.currency || 'USD',
        online_event: eventData.onlineEvent || false,
        ...(eventData.venueId && { venue_id: eventData.venueId }),
        ...(eventData.capacity && { capacity: eventData.capacity }),
      },
    };

    const response = await fetch('https://www.eventbriteapi.com/v3/events/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventPayload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Eventbrite event creation failed: ${error.error_description || 'Unknown error'}`);
    }

    const event = await response.json();
    
    // Create ticket class if price is specified
    if (eventData.ticketPrice && eventData.ticketPrice > 0) {
      await this.createTicketClass(event.event.id, {
        name: 'General Admission',
        description: 'General admission ticket',
        cost: eventData.ticketPrice,
        quantity_total: eventData.capacity || 100,
      });
    }

    return event.event;
  }

  async getEvent(eventId: string): Promise<EventbriteEvent> {
    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/${eventId}/`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Eventbrite event fetch failed: ${error.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    return data;
  }

  async createTicketClass(eventId: string, ticketData: {
    name: string;
    description: string;
    cost: number;
    quantity_total: number;
  }): Promise<any> {
    const ticketPayload = {
      ticket_class: {
        name: ticketData.name,
        description: ticketData.description,
        cost: {
          currency: 'USD',
          value: ticketData.cost,
          display: `$${ticketData.cost}`,
        },
        quantity_total: ticketData.quantity_total,
        free: ticketData.cost === 0,
      },
    };

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/${eventId}/ticket_classes/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketPayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Eventbrite ticket class creation failed: ${error.error_description || 'Unknown error'}`);
    }

    return response.json();
  }

  async createVenue(venueData: {
    name: string;
    address: {
      address1: string;
      address2?: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
      latitude?: number;
      longitude?: number;
    };
  }): Promise<EventbriteVenue> {
    if (!this.organizerId) {
      const user = await this.getUser();
      this.organizerId = user.id;
    }

    const venuePayload = {
      venue: {
        name: venueData.name,
        address: {
          address_1: venueData.address.address1,
          ...(venueData.address.address2 && { address_2: venueData.address.address2 }),
          city: venueData.address.city,
          region: venueData.address.region,
          postal_code: venueData.address.postalCode,
          country: venueData.address.country,
          ...(venueData.address.latitude && { latitude: venueData.address.latitude.toString() }),
          ...(venueData.address.longitude && { longitude: venueData.address.longitude.toString() }),
        },
      },
    };

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/organizers/${this.organizerId}/venues/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(venuePayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Eventbrite venue creation failed: ${error.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.venue;
  }

  async getUser(): Promise<{ id: string; name: string; email: string }> {
    const response = await fetch('https://www.eventbriteapi.com/v3/users/me/', {
      headers: { 'Authorization': `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Eventbrite user fetch failed: ${error.error_description || 'Unknown error'}`);
    }

    return response.json();
  }

  async refreshToken(): Promise<string> {
    const response = await fetch('https://www.eventbrite.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.EVENTBRITE_CLIENT_ID || '',
        client_secret: process.env.EVENTBRITE_CLIENT_SECRET || '',
        refresh_token: '', // This would need to be stored separately
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Eventbrite token refresh failed: ${error.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://www.eventbriteapi.com/v3/users/me/', {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  parseRateLimit(headers: Headers): { limit: number; remaining: number; resetTime: Date } | null {
    const limit = headers.get('x-ratelimit-limit');
    const remaining = headers.get('x-ratelimit-remaining');
    const reset = headers.get('x-ratelimit-reset');

    if (!limit || !remaining || !reset) return null;

    return {
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      resetTime: new Date(parseInt(reset) * 1000),
    };
  }
}
