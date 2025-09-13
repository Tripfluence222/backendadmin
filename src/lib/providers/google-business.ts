import { SocialProvider } from '@prisma/client';
import { decryptToken } from '@/lib/crypto';

export interface GoogleBusinessPost {
  name: string;
  summary: string;
  callToAction?: {
    actionType: 'BOOK' | 'ORDER_ONLINE' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP' | 'GET_OFFER' | 'CALL';
    url?: string;
  };
  media?: {
    mediaFormat: 'PHOTO' | 'VIDEO';
    sourceUrl: string;
  };
  event?: {
    title: string;
    schedule: {
      startDate: {
        year: number;
        month: number;
        day: number;
      };
      startTime?: {
        hours: number;
        minutes: number;
      };
      endDate?: {
        year: number;
        month: number;
        day: number;
      };
      endTime?: {
        hours: number;
        minutes: number;
      };
    };
  };
}

export class GoogleBusinessProvider {
  private accessToken: string;
  private accountName: string;

  constructor(accessToken: string, accountName: string) {
    this.accessToken = accessToken;
    this.accountName = accountName;
  }

  static async createFromSocialAccount(socialAccount: any) {
    const accessToken = decryptToken(socialAccount.accessToken);
    const accountName = socialAccount.metadata?.accountName || socialAccount.accountName;
    
    return new GoogleBusinessProvider(accessToken, accountName);
  }

  async createPost(postData: {
    summary: string;
    callToAction?: {
      actionType: 'BOOK' | 'ORDER_ONLINE' | 'SHOP' | 'LEARN_MORE' | 'SIGN_UP' | 'GET_OFFER' | 'CALL';
      url?: string;
    };
    media?: {
      mediaFormat: 'PHOTO' | 'VIDEO';
      sourceUrl: string;
    };
    event?: {
      title: string;
      startDate: Date;
      endDate?: Date;
    };
  }): Promise<GoogleBusinessPost> {
    const postPayload: GoogleBusinessPost = {
      name: `accounts/${this.accountName}/posts/${Date.now()}`,
      summary: postData.summary,
    };

    if (postData.callToAction) {
      postPayload.callToAction = postData.callToAction;
    }

    if (postData.media) {
      postPayload.media = postData.media;
    }

    if (postData.event) {
      const startDate = postData.event.startDate;
      const endDate = postData.event.endDate || startDate;
      
      postPayload.event = {
        title: postData.event.title,
        schedule: {
          startDate: {
            year: startDate.getFullYear(),
            month: startDate.getMonth() + 1,
            day: startDate.getDate(),
          },
          startTime: {
            hours: startDate.getHours(),
            minutes: startDate.getMinutes(),
          },
          endDate: {
            year: endDate.getFullYear(),
            month: endDate.getMonth() + 1,
            day: endDate.getDate(),
          },
          endTime: {
            hours: endDate.getHours(),
            minutes: endDate.getMinutes(),
          },
        },
      };
    }

    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${this.accountName}/posts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postPayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Business post creation failed: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async getPost(postName: string): Promise<GoogleBusinessPost> {
    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/${postName}`,
      {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Business post fetch failed: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async refreshToken(): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: '', // This would need to be stored separately
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google token refresh failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://mybusinessaccountmanagement.googleapis.com/v1/accounts/${this.accountName}`,
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
