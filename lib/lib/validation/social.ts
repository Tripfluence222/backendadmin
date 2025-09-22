import { z } from "zod";

export const socialPlatformSchema = z.enum([
  "instagram",
  "facebook",
  "tiktok",
  "google_business",
  "twitter",
  "linkedin"
]);

export const postStatusSchema = z.enum([
  "draft",
  "scheduled",
  "published",
  "failed"
]);

export const createSocialPostSchema = z.object({
  content: z.string().min(1, "Content is required").max(2000, "Content too long"),
  media: z.array(z.string().url()).optional(),
  hashtags: z.array(z.string()).optional(),
  links: z.array(z.string().url()).optional(),
  platforms: z.array(socialPlatformSchema).min(1, "At least one platform is required"),
  scheduledAt: z.date().optional(),
  isPublished: z.boolean().default(false),
});

export const updateSocialPostSchema = createSocialPostSchema.partial();

export const connectAccountSchema = z.object({
  platform: socialPlatformSchema,
  accountName: z.string().min(1, "Account name is required"),
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
});

export const socialAnalyticsSchema = z.object({
  impressions: z.number().default(0),
  clicks: z.number().default(0),
  likes: z.number().default(0),
  shares: z.number().default(0),
  comments: z.number().default(0),
  bookings: z.number().default(0),
  revenue: z.number().default(0),
});

export type CreateSocialPostInput = z.infer<typeof createSocialPostSchema>;
export type UpdateSocialPostInput = z.infer<typeof updateSocialPostSchema>;
export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;
export type PostStatus = z.infer<typeof postStatusSchema>;
export type SocialAnalytics = z.infer<typeof socialAnalyticsSchema>;
