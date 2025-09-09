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

export const reviewFiltersSchema = z.object({
  status: z.nativeEnum(ReviewStatus).optional(),
  listingId: z.string().cuid().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewFilters = z.infer<typeof reviewFiltersSchema>;
