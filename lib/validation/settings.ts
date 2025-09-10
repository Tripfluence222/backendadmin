import { z } from 'zod';

// Branding schemas
export const updateBrandingSchema = z.object({
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  fontFamily: z.string().optional(),
  customCss: z.string().max(10000).optional(),
});

// Payment settings schemas
export const updatePaymentSettingsSchema = z.object({
  stripePublishableKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  defaultCurrency: z.string().length(3).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  processingFee: z.number().min(0).optional(),
});

// User management schemas
export const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Webhook schemas
export const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  events: z.array(z.string()),
  secret: z.string().min(10).optional(),
  isActive: z.boolean().default(true),
});

export const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  secret: z.string().min(10).optional(),
  isActive: z.boolean().optional(),
});

// API Key schemas
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const updateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Filter schemas
export const userFiltersSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const webhookFiltersSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const apiKeyFiltersSchema = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Type exports
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type UpdatePaymentSettingsInput = z.infer<typeof updatePaymentSettingsSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
export type WebhookFilters = z.infer<typeof webhookFiltersSchema>;
export type ApiKeyFilters = z.infer<typeof apiKeyFiltersSchema>;

// Enums
export type UserRole = 'admin' | 'manager' | 'staff' | 'viewer';
export type PaymentGateway = 'stripe' | 'paypal' | 'square';
