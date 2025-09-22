import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

export const auditLogFiltersSchema = z.object({
  action: z.string().optional(),
  entity: z.string().optional(),
  actorUserId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>;
