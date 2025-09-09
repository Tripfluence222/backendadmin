import { z } from 'zod';
import { SocialProvider, SocialStatus } from '@prisma/client';

export const createSocialPostSchema = z.object({
  title: z.string().min(1).max(100),
  caption: z.string().min(1).max(2200),
  media: z.array(z.object({
    type: z.enum(['image', 'video']),
    url: z.string().url(),
    alt: z.string().optional(),
  })).optional(),
  targets: z.array(z.nativeEnum(SocialProvider)).min(1),
  scheduleAt: z.string().datetime().optional(),
});

export const socialPostFiltersSchema = z.object({
  status: z.nativeEnum(SocialStatus).optional(),
  provider: z.nativeEnum(SocialProvider).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const createSocialAccountSchema = z.object({
  provider: z.nativeEnum(SocialProvider),
  token: z.string().min(1),
  scopes: z.array(z.string()),
  metadata: z.record(z.any()).optional(),
});

export type CreateSocialPostInput = z.infer<typeof createSocialPostSchema>;
export type SocialPostFilters = z.infer<typeof socialPostFiltersSchema>;
export type CreateSocialAccountInput = z.infer<typeof createSocialAccountSchema>;
