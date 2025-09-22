import { z } from 'zod';

// Social platform enum
export const SocialPlatform = z.enum(['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube']);
export type SocialPlatform = z.infer<typeof SocialPlatform>;

// Social post schemas
export const createSocialPostSchema = z.object({
  content: z.string().min(1).max(2000),
  platforms: z.array(SocialPlatform),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledAt: z.string().datetime().optional(),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
});

export const updateSocialPostSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  platforms: z.array(SocialPlatform).optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledAt: z.string().datetime().optional(),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  hashtags: z.array(z.string()).optional(),
});

// Social account connection schemas
export const createSocialAccountSchema = z.object({
  platform: SocialPlatform,
  accountId: z.string().min(1),
  accountName: z.string().min(1).max(100),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const updateSocialAccountSchema = z.object({
  accountName: z.string().min(1).max(100).optional(),
  accessToken: z.string().min(1).optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Account connection schema (alias for compatibility)
export const connectAccountSchema = createSocialAccountSchema;

// Social analytics schemas
export const socialAnalyticsFiltersSchema = z.object({
  platform: SocialPlatform.optional(),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }),
  metrics: z.array(z.enum(['likes', 'shares', 'comments', 'clicks', 'impressions', 'reach'])).optional(),
});

// Social post filters
export const socialPostFiltersSchema = z.object({
  platforms: z.array(SocialPlatform).optional(),
  isPublished: z.boolean().optional(),
  scheduledAt: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Social account filters
export const socialAccountFiltersSchema = z.object({
  platform: SocialPlatform.optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Type exports
export type CreateSocialPostInput = z.infer<typeof createSocialPostSchema>;
export type UpdateSocialPostInput = z.infer<typeof updateSocialPostSchema>;
export type CreateSocialAccountInput = z.infer<typeof createSocialAccountSchema>;
export type UpdateSocialAccountInput = z.infer<typeof updateSocialAccountSchema>;
export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;
export type SocialAnalyticsFilters = z.infer<typeof socialAnalyticsFiltersSchema>;
export type SocialPostFilters = z.infer<typeof socialPostFiltersSchema>;
export type SocialAccountFilters = z.infer<typeof socialAccountFiltersSchema>;