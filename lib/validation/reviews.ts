import { z } from 'zod';
import { ReviewStatus } from '@prisma/client';

export const createReviewSchema = z.object({
  listingId: z.string().cuid(),
  customerId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000).optional(),
});

export const updateReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
  reply: z.string().max(500).optional(),
});

export const moderateReviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
  reason: z.string().max(500).optional(),
});

export const replyToReviewSchema = z.object({
  reply: z.string().min(1).max(500),
});

export const reviewFiltersSchema = z.object({
  status: z.nativeEnum(ReviewStatus).optional(),
  listingId: z.string().cuid().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>;
export type ReviewFilters = z.infer<typeof reviewFiltersSchema>;
