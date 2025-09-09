import { z } from 'zod';

export const generateWidgetSchema = z.object({
  widgetType: z.enum(['booking', 'calendar', 'reviews', 'social']),
  filters: z.object({
    listingId: z.string().cuid().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
  }),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    mode: z.enum(['light', 'dark']).default('light'),
    borderRadius: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
  }),
  settings: z.object({
    showPricing: z.boolean().default(true),
    showAvailability: z.boolean().default(true),
    showReviews: z.boolean().default(false),
    maxBookings: z.number().int().positive().optional(),
  }).optional(),
});

export type GenerateWidgetInput = z.infer<typeof generateWidgetSchema>;
