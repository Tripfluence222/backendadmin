import { z } from "zod";

export const eventSyncPlatformSchema = z.enum([
  "facebook_events",
  "google_business",
  "eventbrite",
  "meetup",
  "airbnb_experiences"
]);

export const syncStatusSchema = z.enum([
  "connected",
  "disconnected",
  "error",
  "syncing"
]);

export const eventSyncStatusSchema = z.enum([
  "created",
  "updated",
  "deleted",
  "failed",
  "pending"
]);

export const createEventSyncSchema = z.object({
  platform: eventSyncPlatformSchema,
  platformEventId: z.string().min(1, "Platform event ID is required"),
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().optional(),
  capacity: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  status: eventSyncStatusSchema.default("pending"),
  externalUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
});

export const updateEventSyncSchema = createEventSyncSchema.partial();

export const connectPlatformSchema = z.object({
  platform: eventSyncPlatformSchema,
  apiKey: z.string().min(1, "API key is required"),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  autoSync: z.boolean().default(true),
});

export type CreateEventSyncInput = z.infer<typeof createEventSyncSchema>;
export type UpdateEventSyncInput = z.infer<typeof updateEventSyncSchema>;
export type ConnectPlatformInput = z.infer<typeof connectPlatformSchema>;
export type EventSyncPlatform = z.infer<typeof eventSyncPlatformSchema>;
export type SyncStatus = z.infer<typeof syncStatusSchema>;
export type EventSyncStatus = z.infer<typeof eventSyncStatusSchema>;
