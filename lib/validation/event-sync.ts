import { z } from 'zod';

// Event sync platform enum
export const EventSyncPlatform = z.enum(['eventbrite', 'meetup', 'facebook_events', 'google_calendar', 'outlook_calendar']);
export type EventSyncPlatform = z.infer<typeof EventSyncPlatform>;

// Event sync schemas
export const createEventSyncSchema = z.object({
  name: z.string().min(1).max(100),
  platform: EventSyncPlatform,
  platformEventId: z.string().min(1),
  listingId: z.string().cuid().optional(),
  syncDirection: z.enum(['import', 'export', 'bidirectional']),
  isActive: z.boolean().default(true),
  syncSettings: z.object({
    autoSync: z.boolean().default(false),
    syncInterval: z.number().int().positive().default(3600), // seconds
    includeMedia: z.boolean().default(true),
    includeAttendees: z.boolean().default(false),
  }).optional(),
});

export const updateEventSyncSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  platform: EventSyncPlatform.optional(),
  platformEventId: z.string().min(1).optional(),
  listingId: z.string().cuid().optional(),
  syncDirection: z.enum(['import', 'export', 'bidirectional']).optional(),
  isActive: z.boolean().optional(),
  syncSettings: z.object({
    autoSync: z.boolean().optional(),
    syncInterval: z.number().int().positive().optional(),
    includeMedia: z.boolean().optional(),
    includeAttendees: z.boolean().optional(),
  }).optional(),
});

// Platform connection schemas
export const createPlatformConnectionSchema = z.object({
  platform: EventSyncPlatform,
  connectionName: z.string().min(1).max(100),
  credentials: z.object({
    apiKey: z.string().min(1).optional(),
    secretKey: z.string().min(1).optional(),
    accessToken: z.string().min(1).optional(),
    refreshToken: z.string().optional(),
    webhookUrl: z.string().url().optional(),
  }),
  isActive: z.boolean().default(true),
});

export const updatePlatformConnectionSchema = z.object({
  connectionName: z.string().min(1).max(100).optional(),
  credentials: z.object({
    apiKey: z.string().min(1).optional(),
    secretKey: z.string().min(1).optional(),
    accessToken: z.string().min(1).optional(),
    refreshToken: z.string().optional(),
    webhookUrl: z.string().url().optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});

// Platform connection schema (alias for compatibility)
export const connectPlatformSchema = createPlatformConnectionSchema;

// Event sync filters
export const eventSyncFiltersSchema = z.object({
  platform: EventSyncPlatform.optional(),
  syncDirection: z.enum(['import', 'export', 'bidirectional']).optional(),
  isActive: z.boolean().optional(),
  listingId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Platform connection filters
export const platformConnectionFiltersSchema = z.object({
  platform: EventSyncPlatform.optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Sync operation schemas
export const manualSyncSchema = z.object({
  eventSyncId: z.string().cuid(),
  direction: z.enum(['import', 'export']),
  forceUpdate: z.boolean().default(false),
});

export const bulkSyncSchema = z.object({
  eventSyncIds: z.array(z.string().cuid()),
  direction: z.enum(['import', 'export']),
  forceUpdate: z.boolean().default(false),
});

export const publishEventSyncSchema = z.object({
  eventSyncId: z.string().cuid(),
  platforms: z.array(EventSyncPlatform),
  publishSettings: z.object({
    includeMedia: z.boolean().default(true),
    includeAttendees: z.boolean().default(false),
    autoApprove: z.boolean().default(false),
  }).optional(),
});

// Type exports
export type CreateEventSyncInput = z.infer<typeof createEventSyncSchema>;
export type UpdateEventSyncInput = z.infer<typeof updateEventSyncSchema>;
export type CreatePlatformConnectionInput = z.infer<typeof createPlatformConnectionSchema>;
export type UpdatePlatformConnectionInput = z.infer<typeof updatePlatformConnectionSchema>;
export type ConnectPlatformInput = z.infer<typeof connectPlatformSchema>;
export type EventSyncFilters = z.infer<typeof eventSyncFiltersSchema>;
export type PlatformConnectionFilters = z.infer<typeof platformConnectionFiltersSchema>;
export type ManualSyncInput = z.infer<typeof manualSyncSchema>;
export type BulkSyncInput = z.infer<typeof bulkSyncSchema>;
export type PublishEventSyncInput = z.infer<typeof publishEventSyncSchema>;