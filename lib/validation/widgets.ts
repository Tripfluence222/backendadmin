import { z } from 'zod';

/** Types/Enums */
export const WidgetType = z.enum(['booking', 'calendar', 'reviews', 'social']);
export type WidgetType = z.infer<typeof WidgetType>;

export const ThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  mode: z.enum(['light', 'dark']).default('light'),
  borderRadius: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
});
export type WidgetTheme = z.infer<typeof ThemeSchema>;

export const FiltersSchema = z.object({
  listingId: z.string().cuid().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
});
export type WidgetFilters = z.infer<typeof FiltersSchema>;

export const SettingsSchema = z.object({
  showPricing: z.boolean().default(true),
  showAvailability: z.boolean().default(true),
  showReviews: z.boolean().default(false),
  maxBookings: z.number().int().positive().optional(),
}).optional();

/** Canonical schema used internally */
export const generateWidgetSchema = z.object({
  widgetType: WidgetType,
  filters: FiltersSchema.default({}),
  theme: ThemeSchema.default({ mode: 'light', borderRadius: 'medium' }),
  settings: SettingsSchema.default({
    showPricing: true,
    showAvailability: true,
    showReviews: false,
  }),
});

/** Back-compat export expected by callers */
export const createWidgetSchema = generateWidgetSchema;

/** Update schema for existing widgets */
export const updateWidgetSchema = z.object({
  widgetType: WidgetType.optional(),
  filters: FiltersSchema.optional(),
  theme: ThemeSchema.optional(),
  settings: SettingsSchema,
});

// Named exports for consumers:
export { FiltersSchema as WidgetFiltersSchema, ThemeSchema as WidgetThemeSchema };

export type GenerateWidgetInput = z.infer<typeof generateWidgetSchema>;
export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;
