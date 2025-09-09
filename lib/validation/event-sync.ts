import { z } from 'zod';

export const createEventSyncSchema = z.object({
  listingId: z.string().cuid(),
  targets: z.array(z.enum(['facebook', 'google', 'eventbrite', 'meetup'])).min(1),
});

export const publishEventSyncSchema = z.object({
  listingId: z.string().cuid(),
  targets: z.array(z.enum(['facebook', 'google', 'eventbrite', 'meetup'])).min(1),
});

export const eventSyncFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'UPDATED', 'FAILED']).optional(),
  listingId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateEventSyncInput = z.infer<typeof createEventSyncSchema>;
export type PublishEventSyncInput = z.infer<typeof publishEventSyncSchema>;
export type EventSyncFilters = z.infer<typeof eventSyncFiltersSchema>;
