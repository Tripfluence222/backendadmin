import { z } from 'zod';

// Define enums locally to avoid SSR issues with Prisma client
const PricingKind = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY', 
  PEAK: 'PEAK',
  CLEANING_FEE: 'CLEANING_FEE',
  SECURITY_DEPOSIT: 'SECURITY_DEPOSIT'
} as const;

const SpaceStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
} as const;

const SpaceReqStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED'
} as const;

// Space CRUD schemas
export const SpaceCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(50, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  photos: z.array(z.string().url('Invalid photo URL')).max(10, 'Maximum 10 photos allowed'),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(1000, 'Capacity too large'),
  floorAreaM2: z.number().int().min(1).max(10000).optional(),
  amenities: z.array(z.object({
    label: z.string().min(1, 'Amenity label is required'),
    category: z.string().optional(),
  })).max(20, 'Maximum 20 amenities allowed'),
  rules: z.array(z.object({
    label: z.string().min(1, 'Rule label is required'),
    required: z.boolean(),
  })).max(10, 'Maximum 10 rules allowed'),
});

export const SpaceUpdateSchema = SpaceCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const SpacePublishSchema = z.object({
  id: z.string().cuid(),
});

// Pricing rule schemas
export const SpacePricingRuleSchema = z.object({
  kind: z.enum(['HOURLY', 'DAILY', 'PEAK', 'CLEANING_FEE', 'SECURITY_DEPOSIT']),
  amount: z.number().int().min(0, 'Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  dow: z.array(z.number().int().min(0).max(6)).default([]), // 0=Sunday, 6=Saturday
  startHour: z.number().int().min(0).max(23).optional(),
  endHour: z.number().int().min(0).max(23).optional(),
}).refine(
  (data) => {
    if (data.startHour !== undefined && data.endHour !== undefined) {
      return data.startHour < data.endHour;
    }
    return true;
  },
  {
    message: 'Start hour must be before end hour',
    path: ['endHour'],
  }
);

export const SpacePricingRulesBulkSchema = z.object({
  spaceId: z.string().cuid(),
  rules: z.array(SpacePricingRuleSchema).max(10, 'Maximum 10 pricing rules allowed'),
});

// Availability schemas
export const SpaceAvailabilitySchema = z.object({
  spaceId: z.string().cuid(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  isBlocked: z.boolean().default(false),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.start < data.end,
  {
    message: 'Start time must be before end time',
    path: ['end'],
  }
);

export const SpaceAvailabilityBulkSchema = z.object({
  spaceId: z.string().cuid(),
  blocks: z.array(SpaceAvailabilitySchema.omit({ spaceId: true })).max(50, 'Maximum 50 availability blocks allowed'),
});

// Space request schemas
export const SpaceRequestCreateSchema = z.object({
  spaceId: z.string().cuid(),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500).optional(),
  attendees: z.number().int().min(1, 'At least 1 attendee required').max(1000, 'Too many attendees'),
  start: z.coerce.date(),
  end: z.coerce.date(),
  organizerId: z.string().min(1, 'Organizer ID is required'),
}).refine(
  (data) => data.start < data.end,
  {
    message: 'Start time must be before end time',
    path: ['end'],
  }
).refine(
  (data) => {
    const duration = data.end.getTime() - data.start.getTime();
    const maxDuration = 24 * 60 * 60 * 1000; // 24 hours
    return duration <= maxDuration;
  },
  {
    message: 'Booking duration cannot exceed 24 hours',
    path: ['end'],
  }
);

export const SpaceRequestQuoteSchema = z.object({
  requestId: z.string().cuid(),
  quoteAmount: z.number().int().min(0, 'Quote amount must be positive'),
  depositAmount: z.number().int().min(0).optional(),
  cleaningFee: z.number().int().min(0).optional(),
  pricingBreakdown: z.record(z.any()),
});

export const SpaceRequestDecisionSchema = z.object({
  requestId: z.string().cuid(),
  decision: z.enum(['approve', 'decline']),
  message: z.string().max(500).optional(),
});

export const SpaceRequestCancelSchema = z.object({
  requestId: z.string().cuid(),
  reason: z.string().max(200).optional(),
});

// Message schemas
export const SpaceMessageSchema = z.object({
  spaceReqId: z.string().cuid(),
  body: z.string().min(1, 'Message body is required').max(1000, 'Message too long'),
  attachments: z.array(z.string().url('Invalid attachment URL')).max(5, 'Maximum 5 attachments allowed').optional(),
});

// Payment schemas
export const SpacePaymentSchema = z.object({
  requestId: z.string().cuid(),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  idempotencyKey: z.string().uuid('Invalid idempotency key'),
});

// Payout schemas
export const PayoutAccountConnectSchema = z.object({
  businessId: z.string().cuid(),
  returnUrl: z.string().url('Invalid return URL').optional(),
  refreshUrl: z.string().url('Invalid refresh URL').optional(),
});

// Public API schemas
export const PublicSpaceListSchema = z.object({
  city: z.string().optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  amenities: z.array(z.string()).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(24),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'capacity', 'distance']).default('relevance'),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().int().min(1).max(100).default(50), // km
});

export const PublicAvailabilitySchema = z.object({
  spaceId: z.string().cuid(),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const PublicQuoteSchema = z.object({
  spaceId: z.string().cuid(),
  start: z.coerce.date(),
  end: z.coerce.date(),
  attendees: z.number().int().min(1).max(1000),
});

// Search schemas
export const SpaceSearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  filters: z.object({
    city: z.string().optional(),
    priceRange: z.tuple([z.number(), z.number()]).optional(),
    capacity: z.number().int().min(1).optional(),
    amenities: z.array(z.string()).optional(),
  }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Filter schemas for admin
export const SpaceFilterSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  city: z.string().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const SpaceRequestFilterSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'DECLINED', 'CANCELLED']).optional(),
  spaceId: z.string().cuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Type exports
export type SpaceCreateInput = z.infer<typeof SpaceCreateSchema>;
export type SpaceUpdateInput = z.infer<typeof SpaceUpdateSchema>;
export type SpacePricingRuleInput = z.infer<typeof SpacePricingRuleSchema>;
export type SpacePricingRulesBulkInput = z.infer<typeof SpacePricingRulesBulkSchema>;
export type SpaceAvailabilityInput = z.infer<typeof SpaceAvailabilitySchema>;
export type SpaceAvailabilityBulkInput = z.infer<typeof SpaceAvailabilityBulkSchema>;
export type SpaceRequestCreateInput = z.infer<typeof SpaceRequestCreateSchema>;
export type SpaceRequestQuoteInput = z.infer<typeof SpaceRequestQuoteSchema>;
export type SpaceRequestDecisionInput = z.infer<typeof SpaceRequestDecisionSchema>;
export type SpaceRequestCancelInput = z.infer<typeof SpaceRequestCancelSchema>;
export type SpaceMessageInput = z.infer<typeof SpaceMessageSchema>;
export type SpacePaymentInput = z.infer<typeof SpacePaymentSchema>;
export type PayoutAccountConnectInput = z.infer<typeof PayoutAccountConnectSchema>;
export type PublicSpaceListInput = z.infer<typeof PublicSpaceListSchema>;
export type PublicAvailabilityInput = z.infer<typeof PublicAvailabilitySchema>;
export type PublicQuoteInput = z.infer<typeof PublicQuoteSchema>;
export type SpaceSearchInput = z.infer<typeof SpaceSearchSchema>;
export type SpaceFilterInput = z.infer<typeof SpaceFilterSchema>;
export type SpaceRequestFilterInput = z.infer<typeof SpaceRequestFilterSchema>;
