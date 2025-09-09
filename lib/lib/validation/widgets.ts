import { z } from "zod";

export const widgetTypeSchema = z.enum([
  "booking",
  "calendar",
  "menu",
  "property_grid",
  "reviews",
  "contact_form"
]);

export const widgetDesignSchema = z.object({
  primaryColor: z.string().default("#3b82f6"),
  secondaryColor: z.string().default("#64748b"),
  fontFamily: z.string().default("Inter"),
  fontSize: z.number().min(12).max(24).default(16),
  borderRadius: z.number().min(0).max(20).default(8),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
  showBranding: z.boolean().default(true),
});

export const widgetFiltersSchema = z.object({
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  priceRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  dateRange: z.object({
    start: z.date().optional(),
    end: z.date().optional(),
  }).optional(),
});

export const createWidgetSchema = z.object({
  name: z.string().min(1, "Widget name is required").max(100, "Name too long"),
  type: widgetTypeSchema,
  description: z.string().max(500, "Description too long").optional(),
  filters: widgetFiltersSchema.optional(),
  design: widgetDesignSchema,
  isActive: z.boolean().default(true),
});

export const updateWidgetSchema = createWidgetSchema.partial();

export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;
export type WidgetType = z.infer<typeof widgetTypeSchema>;
export type WidgetDesign = z.infer<typeof widgetDesignSchema>;
export type WidgetFilters = z.infer<typeof widgetFiltersSchema>;
