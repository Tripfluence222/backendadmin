import { z } from "zod";

export const couponTypeSchema = z.enum([
  "percentage",
  "fixed_amount",
  "free_shipping",
  "buy_one_get_one"
]);

export const couponStatusSchema = z.enum([
  "active",
  "inactive",
  "expired",
  "exhausted"
]);

export const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(50, "Code too long"),
  name: z.string().min(1, "Coupon name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  type: couponTypeSchema,
  value: z.number().min(0, "Value must be non-negative"),
  minimumAmount: z.number().min(0, "Minimum amount must be non-negative").optional(),
  maximumDiscount: z.number().min(0, "Maximum discount must be non-negative").optional(),
  usageLimit: z.number().min(1, "Usage limit must be at least 1").optional(),
  usageLimitPerCustomer: z.number().min(1, "Per customer limit must be at least 1").optional(),
  validFrom: z.date(),
  validUntil: z.date(),
  applicableListings: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateCouponSchema = createCouponSchema.partial();

export const createAffiliateSchema = z.object({
  name: z.string().min(1, "Affiliate name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  commissionRate: z.number().min(0, "Commission rate must be non-negative").max(100, "Commission rate cannot exceed 100%"),
  paymentMethod: z.enum(["paypal", "bank_transfer", "crypto"]).default("paypal"),
  paymentDetails: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateAffiliateSchema = createAffiliateSchema.partial();

export const createLoyaltyRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  triggerType: z.enum(["booking", "spend", "frequency", "referral"]),
  triggerValue: z.number().min(0, "Trigger value must be non-negative"),
  rewardType: z.enum(["points", "discount", "free_item", "upgrade"]),
  rewardValue: z.number().min(0, "Reward value must be non-negative"),
  isActive: z.boolean().default(true),
});

export const updateLoyaltyRuleSchema = createLoyaltyRuleSchema.partial();

export const createEmailCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").max(100, "Name too long"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  content: z.string().min(1, "Content is required"),
  recipientType: z.enum(["all", "segment", "list"]).default("all"),
  recipientSegment: z.string().optional(),
  recipientList: z.array(z.string()).optional(),
  scheduledAt: z.date().optional(),
  isActive: z.boolean().default(true),
});

export const updateEmailCampaignSchema = createEmailCampaignSchema.partial();

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type CreateAffiliateInput = z.infer<typeof createAffiliateSchema>;
export type UpdateAffiliateInput = z.infer<typeof updateAffiliateSchema>;
export type CreateLoyaltyRuleInput = z.infer<typeof createLoyaltyRuleSchema>;
export type UpdateLoyaltyRuleInput = z.infer<typeof updateLoyaltyRuleSchema>;
export type CreateEmailCampaignInput = z.infer<typeof createEmailCampaignSchema>;
export type UpdateEmailCampaignInput = z.infer<typeof updateEmailCampaignSchema>;
export type CouponType = z.infer<typeof couponTypeSchema>;
export type CouponStatus = z.infer<typeof couponStatusSchema>;
