import { SocialProvider } from '@prisma/client';
import { decryptToken } from '@/lib/crypto';

export interface MeetupEvent {
  id: string;
  name: string;
  description: string;
  time: number;
  duration: number;
  venue?: {
    id: number;
    name: string;
    address_1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: number;
    lon: number;
  };
  group: {
    id: number;
    name: string;
    urlname: string;
  };
  link: string;
  status: 'upcoming' | 'past' | 'cancelled' | 'draft';
  visibility: 'public' | 'public_limited' | 'members';
  how_to_find_us?: string;
  rsvp_limit?: number;
  fee?: {
    amount: number;
    currency: string;
    description: string;
  };
}

export interface MeetupGroup {
  id: number;
  name: string;
  urlname: string;
  description: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  members: number;
  visibility: 'public' | 'public_limited' | 'members';
}

export class MeetupProvider {
  private accessToken: string;
  private groupId?: number;

  constructor(accessToken: string, groupId?: number) {
    this.accessToken = accessToken;
    this.groupId = groupId;
  }

  static async createFromSocialAccount(socialAccount: any) {
    const accessToken = decryptToken(socialAccount.accessToken);
    const groupId = socialAccount.metadata?.groupId;
    
    return new MeetupProvider(accessToken, groupId);
  }

  async createEvent(eventData: {
    name: string;
    description: string;
    startTime: Date;
    duration: number; // in milliseconds
    venueId?: number;
    groupId?: number;
    visibility?: 'public' | 'public_limited' | 'members';
    howToFindUs?: string;
    rsvpLimit?: number;
    fee?: {
      amount: number;
      currency: string;
      description: string;
    };
  }): Promise<MeetupEvent> {
    const groupId = eventData.groupId || this.groupId;
    if (!groupId) {
      throw new Error('Group ID is required for Meetup events');
    }

    const eventPayload: any = {
      name: eventData.name,
      description: eventData.description,
      time: eventData.startTime.getTime(),
      duration: eventData.duration,
      group_id: groupId,
      visibility: eventData.visibility || 'public',
    };

    if (eventData.venueId) {
      eventPayload.venue_id = eventData.venueId;
    }

    if (eventData.howToFindUs) {
      eventPayload.how_to_find_us = eventData.howToFindUs;
    }

    if (eventData.rsvpLimit) {
      eventPayload.rsvp_limit = eventData.rsvpLimit;
    }

    if (eventData.fee) {
      eventPayload.fee = eventData.fee;
    }

    const response = await fetch(
      `https://api.meetup.com/${groupId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(eventPayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meetup event creation failed: ${error.details || 'Unknown error'}`);
    }

    const event = await response.json();
    return this.getEvent(event.id);
  }

  async getEvent(eventId: string): Promise<MeetupEvent> {
    const response = await fetch(
      `https://api.meetup.com/2/event/${eventId}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meetup event fetch failed: ${error.details || 'Unknown error'}`);
    }

    return response.json();
  }

  async createVenue(venueData: {
    name: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    lat: number;
    lon: number;
    phone?: string;
    repinned?: boolean;
  }): Promise<any> {
    if (!this.groupId) {
      throw new Error('Group ID is required for Meetup venues');
    }

    const venuePayload = {
      name: venueData.name,
      address_1: venueData.address1,
      city: venueData.city,
      state: venueData.state,
      zip: venueData.zip,
      country: venueData.country,
      lat: venueData.lat,
      lon: venueData.lon,
      ...(venueData.phone && { phone: venueData.phone }),
      ...(venueData.repinned !== undefined && { repinned: venueData.repinned }),
    };

    const response = await fetch(
      `https://api.meetup.com/${this.groupId}/venues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(venuePayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meetup venue creation failed: ${error.details || 'Unknown error'}`);
    }

    return response.json();
  }

  async getGroups(): Promise<MeetupGroup[]> {
    const response = await fetch(
      'https://api.meetup.com/self/groups',
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meetup groups fetch failed: ${error.details || 'Unknown error'}`);
    }

    return response.json();
  }

  async getUser(): Promise<{ id: number; name: string; city: string; country: string }> {
    const response = await fetch(
      'https://api.meetup.com/2/member/self',
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meetup user fetch failed: ${error.details || 'Unknown error'}`);
    }

    return response.json();
  }

  async refreshToken(): Promise<string> {
    const response = await fetch('https://secure.meetup.com/oauth2/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.MEETUP_CLIENT_ID || '',
        client_secret: process.env.MEETUP_CLIENT_SECRET || '',
        refresh_token: '', // This would need to be stored separately
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Meetup token refresh failed: ${error.error_description || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        'https://api.meetup.com/2/member/self',
        {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }
      );
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
