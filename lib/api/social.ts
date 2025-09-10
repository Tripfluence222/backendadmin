import { CreateSocialPostInput, UpdateSocialPostInput, ConnectAccountInput, SocialPlatform, PostStatus, SocialAnalytics } from "@/lib/validation/social";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  accountHandle: string;
  profileImage?: string;
  isConnected: boolean;
  lastSyncAt?: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  content: string;
  media?: string[];
  hashtags?: string[];
  links?: string[];
  platforms: SocialPlatform[];
  status: PostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  analytics: SocialAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAnalyticsSummary {
  totalPosts: number;
  totalImpressions: number;
  totalClicks: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  totalBookings: number;
  totalRevenue: number;
  engagementRate: number;
  conversionRate: number;
}

// Mock data
const mockAccounts: SocialAccount[] = [
  {
    id: "1",
    platform: "instagram",
    accountName: "Tripfluence Official",
    accountHandle: "@tripfluence",
    profileImage: "/images/instagram-profile.jpg",
    isConnected: true,
    lastSyncAt: "2024-01-25T10:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    platform: "facebook",
    accountName: "Tripfluence",
    accountHandle: "TripfluenceOfficial",
    profileImage: "/images/facebook-profile.jpg",
    isConnected: true,
    lastSyncAt: "2024-01-25T09:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    platform: "tiktok",
    accountName: "Tripfluence",
    accountHandle: "@tripfluence",
    isConnected: false,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

const mockPosts: SocialPost[] = [
  {
    id: "1",
    content: "🌅 Experience the magic of sunrise yoga in Bali! Our retreat combines ancient practices with modern luxury. Book your spot today! #YogaRetreat #Bali #Wellness #Mindfulness",
    media: ["/images/yoga-sunrise.jpg", "/images/retreat-center.jpg"],
    hashtags: ["#YogaRetreat", "#Bali", "#Wellness", "#Mindfulness"],
    links: ["https://tripfluence.com/retreats/bali-yoga"],
    platforms: ["instagram", "facebook"],
    status: "published",
    publishedAt: "2024-01-24T08:00:00Z",
    analytics: {
      impressions: 12500,
      clicks: 234,
      likes: 456,
      shares: 89,
      comments: 67,
      bookings: 12,
      revenue: 3600,
    },
    createdAt: "2024-01-23T15:00:00Z",
    updatedAt: "2024-01-24T08:00:00Z",
  },
  {
    id: "2",
    content: "🍽️ Tonight's special: Farm-to-table dining experience with locally sourced ingredients. Reserve your table now! #FineDining #FarmToTable #LocalFood #CulinaryExperience",
    media: ["/images/farm-to-table.jpg"],
    hashtags: ["#FineDining", "#FarmToTable", "#LocalFood", "#CulinaryExperience"],
    links: ["https://tripfluence.com/restaurants/farm-to-table"],
    platforms: ["instagram", "facebook", "tiktok"],
    status: "scheduled",
    scheduledAt: "2024-01-26T19:00:00Z",
    analytics: {
      impressions: 0,
      clicks: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      bookings: 0,
      revenue: 0,
    },
    createdAt: "2024-01-25T14:00:00Z",
    updatedAt: "2024-01-25T14:00:00Z",
  },
  {
    id: "3",
    content: "🏖️ Luxury beach villa with panoramic ocean views. Perfect for your next getaway! #LuxuryTravel #BeachVilla #VacationRental #OceanViews",
    media: ["/images/beach-villa-1.jpg", "/images/beach-villa-2.jpg", "/images/beach-villa-3.jpg"],
    hashtags: ["#LuxuryTravel", "#BeachVilla", "#VacationRental", "#OceanViews"],
    links: ["https://tripfluence.com/properties/luxury-beach-villa"],
    platforms: ["instagram"],
    status: "published",
    publishedAt: "2024-01-22T16:00:00Z",
    analytics: {
      impressions: 8900,
      clicks: 156,
      likes: 234,
      shares: 45,
      comments: 23,
      bookings: 3,
      revenue: 2400,
    },
    createdAt: "2024-01-22T10:00:00Z",
    updatedAt: "2024-01-22T16:00:00Z",
  },
  {
    id: "4",
    content: "🎨 Join our pottery workshop this weekend! Learn traditional techniques from master artisans. Limited spots available. #PotteryWorkshop #ArtisanCraft #WeekendActivity #CreativeLearning",
    media: ["/images/pottery-workshop.jpg"],
    hashtags: ["#PotteryWorkshop", "#ArtisanCraft", "#WeekendActivity", "#CreativeLearning"],
    platforms: ["facebook", "instagram"],
    status: "draft",
    analytics: {
      impressions: 0,
      clicks: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      bookings: 0,
      revenue: 0,
    },
    createdAt: "2024-01-25T11:00:00Z",
    updatedAt: "2024-01-25T11:00:00Z",
  },
];

export const socialApi = {
  // Accounts
  async getAccounts(): Promise<SocialAccount[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockAccounts];
  },

  async connectAccount(data: ConnectAccountInput): Promise<SocialAccount> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newAccount: SocialAccount = {
      id: (mockAccounts.length + 1).toString(),
      accountHandle: `@${data.accountName.toLowerCase()}`,
      isConnected: true,
      lastSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    mockAccounts.push(newAccount);
    return newAccount;
  },

  async disconnectAccount(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockAccounts.findIndex(account => account.id === id);
    if (index === -1) {
      throw new Error("Account not found");
    }
    mockAccounts[index].isConnected = false;
  },

  // Posts
  async getAllPosts(): Promise<SocialPost[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockPosts];
  },

  async getPostById(id: string): Promise<SocialPost | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPosts.find(post => post.id === id) || null;
  },

  async createPost(data: CreateSocialPostInput): Promise<SocialPost> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newPost: SocialPost = {
      id: (mockPosts.length + 1).toString(),
      status: data.isPublished ? "published" : data.scheduledAt ? "scheduled" : "draft",
      publishedAt: data.isPublished ? new Date().toISOString() : undefined,
      analytics: {
        impressions: 0,
        clicks: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        bookings: 0,
        revenue: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockPosts.push(newPost);
    return newPost;
  },

  async updatePost(id: string, data: UpdateSocialPostInput): Promise<SocialPost> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockPosts.findIndex(post => post.id === id);
    if (index === -1) {
      throw new Error("Post not found");
    }
    mockPosts[index] = {
      ...mockPosts[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockPosts[index];
  },

  async deletePost(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockPosts.findIndex(post => post.id === id);
    if (index === -1) {
      throw new Error("Post not found");
    }
    mockPosts.splice(index, 1);
  },

  async publishPost(id: string): Promise<SocialPost> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockPosts.findIndex(post => post.id === id);
    if (index === -1) {
      throw new Error("Post not found");
    }
    mockPosts[index] = {
      ...mockPosts[index],
      status: "published",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return mockPosts[index];
  },

  async schedulePost(id: string, scheduledAt: string): Promise<SocialPost> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockPosts.findIndex(post => post.id === id);
    if (index === -1) {
      throw new Error("Post not found");
    }
    mockPosts[index] = {
      ...mockPosts[index],
      status: "scheduled",
      scheduledAt,
      updatedAt: new Date().toISOString(),
    };
    return mockPosts[index];
  },

  // Analytics
  async getAnalyticsSummary(): Promise<SocialAnalyticsSummary> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const publishedPosts = mockPosts.filter(p => p.status === "published");
    const totalImpressions = publishedPosts.reduce((sum, p) => sum + p.analytics.impressions, 0);
    const totalClicks = publishedPosts.reduce((sum, p) => sum + p.analytics.clicks, 0);
    const totalLikes = publishedPosts.reduce((sum, p) => sum + p.analytics.likes, 0);
    const totalShares = publishedPosts.reduce((sum, p) => sum + p.analytics.shares, 0);
    const totalComments = publishedPosts.reduce((sum, p) => sum + p.analytics.comments, 0);
    const totalBookings = publishedPosts.reduce((sum, p) => sum + p.analytics.bookings, 0);
    const totalRevenue = publishedPosts.reduce((sum, p) => sum + p.analytics.revenue, 0);
    
    const engagementRate = totalImpressions > 0 ? ((totalLikes + totalShares + totalComments) / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalBookings / totalClicks) * 100 : 0;

    return {
      totalPosts: publishedPosts.length,
      totalImpressions,
      totalClicks,
      totalLikes,
      totalShares,
      totalComments,
      totalBookings,
      totalRevenue,
      engagementRate: Math.round(engagementRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  },

  async getPostsByDateRange(startDate: string, endDate: string): Promise<SocialPost[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const start = new Date(startDate);
    const end = new Date(endDate);
    return mockPosts.filter(post => {
      const postDate = new Date(post.createdAt);
      return postDate >= start && postDate <= end;
    });
  },
};
