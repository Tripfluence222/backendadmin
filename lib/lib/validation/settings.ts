import { z } from "zod";

export const userRoleSchema = z.enum([
  "admin",
  "staff",
  "influencer",
  "viewer"
]);

export const paymentGatewaySchema = z.enum([
  "stripe",
  "razorpay",
  "paypal",
  "crypto"
]);

export const updateBrandingSchema = z.object({
  logo: z.string().url().optional(),
  primaryColor: z.string().default("#3b82f6"),
  secondaryColor: z.string().default("#64748b"),
  fontFamily: z.string().default("Inter"),
  customCSS: z.string().optional(),
});

export const updatePaymentSettingsSchema = z.object({
  enabledGateways: z.array(paymentGatewaySchema).min(1, "At least one payment gateway must be enabled"),
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  razorpayKeyId: z.string().optional(),
  razorpayKeySecret: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
  cryptoWalletAddress: z.string().optional(),
  defaultCurrency: z.string().default("USD"),
  taxRate: z.number().min(0).max(100).default(0),
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: userRoleSchema,
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial();

export const createWebhookSchema = z.object({
  name: z.string().min(1, "Webhook name is required"),
  url: z.string().url("Invalid URL"),
  events: z.array(z.string()).min(1, "At least one event must be selected"),
  secret: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateWebhookSchema = createWebhookSchema.partial();

export const createApiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
  permissions: z.array(z.string()).min(1, "At least one permission must be selected"),
  expiresAt: z.date().optional(),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type UpdatePaymentSettingsInput = z.infer<typeof updatePaymentSettingsSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type PaymentGateway = z.infer<typeof paymentGatewaySchema>;

