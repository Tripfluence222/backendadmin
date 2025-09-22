import { z } from 'zod';

export const createSlotSchema = z.object({
  listingId: z.string().cuid(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  capacity: z.number().int().positive(),
  location: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  blackout: z.boolean().default(false),
});

export const updateSlotSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
  capacity: z.number().int().positive().optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  blackout: z.boolean().optional(),
});

export const bulkCreateSlotsSchema = z.object({
  listingId: z.string().cuid(),
  slots: z.array(createSlotSchema.omit({ listingId: true })),
});

export const createMultipleSlotsSchema = z.object({
  listingId: z.string().cuid(),
  slots: z.array(createSlotSchema.omit({ listingId: true })),
});

export const availabilityFiltersSchema = z.object({
  listingId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const importIcsSchema = z.object({
  listingId: z.string().cuid(),
  icsData: z.string().min(1),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type BulkCreateSlotsInput = z.infer<typeof bulkCreateSlotsSchema>;
export type CreateMultipleSlotsInput = z.infer<typeof createMultipleSlotsSchema>;
export type AvailabilityFilters = z.infer<typeof availabilityFiltersSchema>;
export type ImportIcsInput = z.infer<typeof importIcsSchema>;
