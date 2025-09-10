import { CreateCouponInput, UpdateCouponInput, CreateAffiliateInput, UpdateAffiliateInput, CreateLoyaltyRuleInput, UpdateLoyaltyRuleInput, CreateEmailCampaignInput, UpdateEmailCampaignInput, CouponType, CouponStatus } from "@/lib/validation/marketing";

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  usageCount: number;
  validFrom: string;
  validUntil: string;
  applicableListings?: string[];
  applicableCategories?: string[];
  isActive: boolean;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  commissionRate: number;
  paymentMethod: "paypal" | "bank_transfer" | "crypto";
  paymentDetails?: string;
  isActive: boolean;
  totalReferrals: number;
  totalCommissions: number;
  uniqueLink: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyRule {
  id: string;
  name: string;
  description?: string;
  triggerType: "booking" | "spend" | "frequency" | "referral";
  triggerValue: number;
  rewardType: "points" | "discount" | "free_item" | "upgrade";
  rewardValue: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipientType: "all" | "segment" | "list";
  recipientSegment?: string;
  recipientList?: string[];
  scheduledAt?: string;
  sentAt?: string;
  isActive: boolean;
  status: "draft" | "scheduled" | "sent" | "failed";
  recipientCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME20",
    name: "Welcome Discount",
    description: "20% off for new customers",
    type: "percentage",
    value: 20,
    minimumAmount: 100,
    usageLimit: 1000,
    usageLimitPerCustomer: 1,
    usageCount: 234,
    validFrom: "2024-01-01T00:00:00Z",
    validUntil: "2024-12-31T23:59:59Z",
    applicableCategories: ["Wellness", "Retreat"],
    isActive: true,
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    code: "SAVE50",
    name: "Fixed Amount Discount",
    description: "$50 off any booking over $200",
    type: "fixed_amount",
    value: 50,
    minimumAmount: 200,
    usageLimit: 500,
    usageLimitPerCustomer: 2,
    usageCount: 89,
    validFrom: "2024-02-01T00:00:00Z",
    validUntil: "2024-03-31T23:59:59Z",
    isActive: true,
    status: "active",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-25T14:30:00Z",
  },
];

const mockAffiliates: Affiliate[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    commissionRate: 15,
    paymentMethod: "paypal",
    paymentDetails: "sarah.johnson@email.com",
    isActive: true,
    totalReferrals: 45,
    totalCommissions: 1250,
    uniqueLink: "https://tripfluence.com/ref/sarah-johnson",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Travel Bloggers United",
    email: "contact@travelbloggers.com",
    commissionRate: 20,
    paymentMethod: "bank_transfer",
    paymentDetails: "Account: 1234567890, Bank: Chase",
    isActive: true,
    totalReferrals: 78,
    totalCommissions: 2100,
    uniqueLink: "https://tripfluence.com/ref/travel-bloggers",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-22T16:45:00Z",
  },
];

const mockLoyaltyRules: LoyaltyRule[] = [
  {
    id: "1",
    name: "First Booking Bonus",
    description: "Earn 100 points for your first booking",
    triggerType: "booking",
    triggerValue: 1,
    rewardType: "points",
    rewardValue: 100,
    isActive: true,
    usageCount: 156,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Spend $500 Get 10% Off",
    description: "Get 10% discount when you spend $500 or more",
    triggerType: "spend",
    triggerValue: 500,
    rewardType: "discount",
    rewardValue: 10,
    isActive: true,
    usageCount: 23,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
  },
];

const mockEmailCampaigns: EmailCampaign[] = [
  {
    id: "1",
    name: "Welcome Series",
    subject: "Welcome to Tripfluence!",
    content: "Thank you for joining us...",
    recipientType: "all",
    scheduledAt: "2024-02-01T09:00:00Z",
    isActive: true,
    status: "scheduled",
    recipientCount: 1250,
    openRate: 0,
    clickRate: 0,
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
  },
  {
    id: "2",
    name: "Monthly Newsletter",
    subject: "February Highlights & New Experiences",
    content: "Discover our latest offerings...",
    recipientType: "segment",
    recipientSegment: "active_customers",
    sentAt: "2024-01-15T10:00:00Z",
    isActive: true,
    status: "sent",
    recipientCount: 890,
    openRate: 24.5,
    clickRate: 8.2,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
];

export const marketingApi = {
  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockCoupons];
  },

  async getCouponById(id: string): Promise<Coupon | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCoupons.find(coupon => coupon.id === id) || null;
  },

  async createCoupon(data: CreateCouponInput): Promise<Coupon> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCoupon: Coupon = {
      id: (mockCoupons.length + 1).toString(),
      usageCount: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
      validFrom: data.validFrom.toISOString(),
      validUntil: data.validUntil.toISOString(),
    };
    mockCoupons.push(newCoupon);
    return newCoupon;
  },

  async updateCoupon(id: string, data: UpdateCouponInput): Promise<Coupon> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockCoupons.findIndex(coupon => coupon.id === id);
    if (index === -1) {
      throw new Error("Coupon not found");
    }
    mockCoupons[index] = {
      ...mockCoupons[index],
      ...data,
      validFrom: data.validFrom ? data.validFrom.toISOString() : mockCoupons[index].validFrom,
      validUntil: data.validUntil ? data.validUntil.toISOString() : mockCoupons[index].validUntil,
      updatedAt: new Date().toISOString(),
    };
    return mockCoupons[index];
  },

  async deleteCoupon(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockCoupons.findIndex(coupon => coupon.id === id);
    if (index === -1) {
      throw new Error("Coupon not found");
    }
    mockCoupons.splice(index, 1);
  },

  // Affiliates
  async getAffiliates(): Promise<Affiliate[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockAffiliates];
  },

  async getAffiliateById(id: string): Promise<Affiliate | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAffiliates.find(affiliate => affiliate.id === id) || null;
  },

  async createAffiliate(data: CreateAffiliateInput): Promise<Affiliate> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newAffiliate: Affiliate = {
      id: (mockAffiliates.length + 1).toString(),
      totalReferrals: 0,
      totalCommissions: 0,
      uniqueLink: `https://tripfluence.com/ref/${data.name.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockAffiliates.push(newAffiliate);
    return newAffiliate;
  },

  async updateAffiliate(id: string, data: UpdateAffiliateInput): Promise<Affiliate> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockAffiliates.findIndex(affiliate => affiliate.id === id);
    if (index === -1) {
      throw new Error("Affiliate not found");
    }
    mockAffiliates[index] = {
      ...mockAffiliates[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockAffiliates[index];
  },

  async deleteAffiliate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockAffiliates.findIndex(affiliate => affiliate.id === id);
    if (index === -1) {
      throw new Error("Affiliate not found");
    }
    mockAffiliates.splice(index, 1);
  },

  // Loyalty Rules
  async getLoyaltyRules(): Promise<LoyaltyRule[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockLoyaltyRules];
  },

  async createLoyaltyRule(data: CreateLoyaltyRuleInput): Promise<LoyaltyRule> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newRule: LoyaltyRule = {
      id: (mockLoyaltyRules.length + 1).toString(),
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };
    mockLoyaltyRules.push(newRule);
    return newRule;
  },

  async updateLoyaltyRule(id: string, data: UpdateLoyaltyRuleInput): Promise<LoyaltyRule> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockLoyaltyRules.findIndex(rule => rule.id === id);
    if (index === -1) {
      throw new Error("Loyalty rule not found");
    }
    mockLoyaltyRules[index] = {
      ...mockLoyaltyRules[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockLoyaltyRules[index];
  },

  async deleteLoyaltyRule(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockLoyaltyRules.findIndex(rule => rule.id === id);
    if (index === -1) {
      throw new Error("Loyalty rule not found");
    }
    mockLoyaltyRules.splice(index, 1);
  },

  // Email Campaigns
  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockEmailCampaigns];
  },

  async createEmailCampaign(data: CreateEmailCampaignInput): Promise<EmailCampaign> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newCampaign: EmailCampaign = {
      id: (mockEmailCampaigns.length + 1).toString(),
      status: data.scheduledAt ? "scheduled" : "draft",
      recipientCount: 0,
      openRate: 0,
      clickRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
      scheduledAt: data.scheduledAt ? data.scheduledAt.toISOString() : undefined,
    };
    mockEmailCampaigns.push(newCampaign);
    return newCampaign;
  },

  async updateEmailCampaign(id: string, data: UpdateEmailCampaignInput): Promise<EmailCampaign> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockEmailCampaigns.findIndex(campaign => campaign.id === id);
    if (index === -1) {
      throw new Error("Email campaign not found");
    }
    mockEmailCampaigns[index] = {
      ...mockEmailCampaigns[index],
      ...data,
      scheduledAt: data.scheduledAt ? data.scheduledAt.toISOString() : mockEmailCampaigns[index].scheduledAt,
      updatedAt: new Date().toISOString(),
    };
    return mockEmailCampaigns[index];
  },

  async deleteEmailCampaign(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockEmailCampaigns.findIndex(campaign => campaign.id === id);
    if (index === -1) {
      throw new Error("Email campaign not found");
    }
    mockEmailCampaigns.splice(index, 1);
  },
};
