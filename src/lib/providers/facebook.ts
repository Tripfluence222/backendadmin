import { SocialProvider } from '@prisma/client';
import { decryptToken } from '@/lib/crypto';

export interface FacebookPageEvent {
  id: string;
  name: string;
  description: string;
  start_time: string;
  end_time?: string;
  place?: {
    name: string;
    location?: {
      city: string;
      country: string;
      latitude: number;
      longitude: number;
    };
  };
  cover?: {
    source: string;
  };
}

export interface FacebookPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

export class FacebookProvider {
  private accessToken: string;
  private pageId?: string;
  private instagramAccountId?: string;

  constructor(accessToken: string, pageId?: string, instagramAccountId?: string) {
    this.accessToken = accessToken;
    this.pageId = pageId;
    this.instagramAccountId = instagramAccountId;
  }

  static async createFromSocialAccount(socialAccount: any) {
    const accessToken = decryptToken(socialAccount.accessToken);
    const pageId = socialAccount.metadata?.pageId;
    const instagramAccountId = socialAccount.metadata?.instagramAccountId;
    
    return new FacebookProvider(accessToken, pageId, instagramAccountId);
  }

  async createEvent(eventData: {
    name: string;
    description: string;
    startTime: Date;
    endTime?: Date;
    location?: string;
    coverPhoto?: string;
  }): Promise<FacebookPageEvent> {
    if (!this.pageId) {
      throw new Error('Page ID is required for Facebook events');
    }

    const eventPayload: any = {
      name: eventData.name,
      description: eventData.description,
      start_time: eventData.startTime.toISOString(),
      access_token: this.accessToken,
    };

    if (eventData.endTime) {
      eventPayload.end_time = eventData.endTime.toISOString();
    }

    if (eventData.location) {
      eventPayload.place = {
        name: eventData.location,
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.pageId}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(eventPayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook event creation failed: ${error.error?.message || 'Unknown error'}`);
    }

    const event = await response.json();
    return this.getEvent(event.id);
  }

  async getEvent(eventId: string): Promise<FacebookPageEvent> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${eventId}?fields=id,name,description,start_time,end_time,place,cover&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook event fetch failed: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async createPost(postData: {
    message: string;
    link?: string;
    scheduledPublishTime?: Date;
  }): Promise<FacebookPost> {
    if (!this.pageId) {
      throw new Error('Page ID is required for Facebook posts');
    }

    const postPayload: any = {
      message: postData.message,
      access_token: this.accessToken,
    };

    if (postData.link) {
      postPayload.link = postData.link;
    }

    if (postData.scheduledPublishTime) {
      postPayload.scheduled_publish_time = Math.floor(postData.scheduledPublishTime.getTime() / 1000);
      postPayload.published = false;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(postPayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook post creation failed: ${error.error?.message || 'Unknown error'}`);
    }

    const post = await response.json();
    return this.getPost(post.id);
  }

  async getPost(postId: string): Promise<FacebookPost> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=id,message,created_time,permalink_url&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook post fetch failed: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async createInstagramMedia(mediaData: {
    imageUrl: string;
    caption?: string;
    scheduledPublishTime?: Date;
  }): Promise<InstagramMedia> {
    if (!this.instagramAccountId) {
      throw new Error('Instagram Business Account ID is required');
    }

    // Step 1: Create media container
    const containerPayload: any = {
      image_url: mediaData.imageUrl,
      access_token: this.accessToken,
    };

    if (mediaData.caption) {
      containerPayload.caption = mediaData.caption;
    }

    if (mediaData.scheduledPublishTime) {
      containerPayload.scheduled_publish_time = Math.floor(mediaData.scheduledPublishTime.getTime() / 1000);
    }

    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${this.instagramAccountId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(containerPayload),
      }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(`Instagram media container creation failed: ${error.error?.message || 'Unknown error'}`);
    }

    const container = await containerResponse.json();

    // Step 2: Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${this.instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          creation_id: container.id,
          access_token: this.accessToken,
        }),
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(`Instagram media publish failed: ${error.error?.message || 'Unknown error'}`);
    }

    const publishedMedia = await publishResponse.json();
    return this.getInstagramMedia(publishedMedia.id);
  }

  async getInstagramMedia(mediaId: string): Promise<InstagramMedia> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}?fields=id,media_type,media_url,caption,timestamp,permalink&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Instagram media fetch failed: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async refreshToken(): Promise<string> {
    // Facebook uses long-lived tokens, but we can extend them
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${this.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook token refresh failed: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?access_token=${this.accessToken}`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  parseRateLimit(headers: Headers): { limit: number; remaining: number; resetTime: Date } | null {
    const limit = headers.get('x-app-usage');
    if (!limit) return null;

    try {
      const usage = JSON.parse(limit);
      return {
        limit: 100, // Facebook's default limit
        remaining: Math.max(0, 100 - (usage.call_count || 0)),
        resetTime: new Date(Date.now() + 3600000), // Reset every hour
      };
    } catch {
      return null;
    }
  }
}
