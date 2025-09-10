import { z } from 'zod';

export const createCustomerSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  preferences: z.object({
    newsletter: z.boolean().default(false),
    smsNotifications: z.boolean().default(false),
    language: z.string().default('en'),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateCustomerSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  preferences: z.object({
    newsletter: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    language: z.string().optional(),
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

export const addCustomerNoteSchema = z.object({
  note: z.string().min(1).max(1000),
  type: z.enum(['general', 'support', 'marketing', 'internal']).default('general'),
});

export const updateCustomerPreferencesSchema = z.object({
  newsletter: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export const customerFiltersSchema = z.object({
  search: z.string().optional(),
  segment: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddCustomerNoteInput = z.infer<typeof addCustomerNoteSchema>;
export type UpdateCustomerPreferencesInput = z.infer<typeof updateCustomerPreferencesSchema>;
export type CustomerFilters = z.infer<typeof customerFiltersSchema>;
