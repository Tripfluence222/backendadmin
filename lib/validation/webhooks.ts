import { z } from 'zod';

export const createWebhookEndpointSchema = z.object({
  url: z.string().url(),
  secret: z.string().min(32),
  active: z.boolean().default(true),
});

export const updateWebhookEndpointSchema = createWebhookEndpointSchema.partial();

export const testWebhookSchema = z.object({
  payload: z.record(z.any()).optional(),
});

export const webhookFiltersSchema = z.object({
  active: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateWebhookEndpointInput = z.infer<typeof createWebhookEndpointSchema>;
export type UpdateWebhookEndpointInput = z.infer<typeof updateWebhookEndpointSchema>;
export type TestWebhookInput = z.infer<typeof testWebhookSchema>;
export type WebhookFilters = z.infer<typeof webhookFiltersSchema>;
