import { z } from "zod";

export const reviewStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "flagged"
]);

export const createReviewSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
  customerId: z.string().min(1, "Customer is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  content: z.string().min(1, "Content is required").max(1000, "Content too long"),
  status: reviewStatusSchema.default("pending"),
  isVerified: z.boolean().default(false),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const replyToReviewSchema = z.object({
  reply: z.string().min(1, "Reply is required").max(500, "Reply too long"),
  isPublic: z.boolean().default(true),
});

export const moderateReviewSchema = z.object({
  status: reviewStatusSchema,
  reason: z.string().optional(),
  moderatorNotes: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;
