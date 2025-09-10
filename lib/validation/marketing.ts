import { z } from 'zod';

// Coupon schemas
export const createCouponSchema = z.object({
  code: z.string().min(3).max(20),
  description: z.string().max(200).optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerCustomer: z.number().int().positive().optional(),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = z.object({
  code: z.string().min(3).max(20).optional(),
  description: z.string().max(200).optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']).optional(),
  value: z.number().positive().optional(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerCustomer: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Affiliate schemas
export const createAffiliateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  commissionRate: z.number().min(0).max(100),
  trackingCode: z.string().min(3).max(20),
  isActive: z.boolean().default(true),
});

export const updateAffiliateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  trackingCode: z.string().min(3).max(20).optional(),
  isActive: z.boolean().optional(),
});

// Loyalty schemas
export const createLoyaltyRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['points_per_dollar', 'points_per_visit', 'bonus_points']),
  value: z.number().positive(),
  conditions: z.object({
    minOrderAmount: z.number().positive().optional(),
    categories: z.array(z.string()).optional(),
    validDays: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
  isActive: z.boolean().default(true),
});

export const updateLoyaltyRuleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['points_per_dollar', 'points_per_visit', 'bonus_points']).optional(),
  value: z.number().positive().optional(),
  conditions: z.object({
    minOrderAmount: z.number().positive().optional(),
    categories: z.array(z.string()).optional(),
    validDays: z.array(z.number().min(0).max(6)).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});

// Email campaign schemas
export const createEmailCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  template: z.string().optional(),
  recipientType: z.enum(['all', 'segment', 'list']),
  recipientIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});

export const updateEmailCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  template: z.string().optional(),
  recipientType: z.enum(['all', 'segment', 'list']).optional(),
  recipientIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Filter schemas
export const couponFiltersSchema = z.object({
  code: z.string().optional(),
  type: z.enum(['percentage', 'fixed', 'free_shipping']).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const affiliateFiltersSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const loyaltyFiltersSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['points_per_dollar', 'points_per_visit', 'bonus_points']).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const emailCampaignFiltersSchema = z.object({
  name: z.string().optional(),
  recipientType: z.enum(['all', 'segment', 'list']).optional(),
  isActive: z.boolean().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// Type exports
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CreateAffiliateInput = z.infer<typeof createAffiliateSchema>;
export type UpdateAffiliateInput = z.infer<typeof updateAffiliateSchema>;
export type CreateLoyaltyRuleInput = z.infer<typeof createLoyaltyRuleSchema>;
export type UpdateLoyaltyRuleInput = z.infer<typeof updateLoyaltyRuleSchema>;
export type CreateEmailCampaignInput = z.infer<typeof createEmailCampaignSchema>;
export type UpdateEmailCampaignInput = z.infer<typeof updateEmailCampaignSchema>;
export type CouponFilters = z.infer<typeof couponFiltersSchema>;
export type AffiliateFilters = z.infer<typeof affiliateFiltersSchema>;
export type LoyaltyFilters = z.infer<typeof loyaltyFiltersSchema>;
export type EmailCampaignFilters = z.infer<typeof emailCampaignFiltersSchema>;
