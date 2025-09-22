import { z } from "zod";

export const slotStatusSchema = z.enum([
  "available",
  "booked",
  "blocked",
  "maintenance"
]);

export const createSlotSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  location: z.string().optional(),
  room: z.string().optional(),
  table: z.string().optional(),
  isBlackout: z.boolean().default(false),
  price: z.number().min(0, "Price must be non-negative").optional(),
  notes: z.string().optional(),
});

export const updateSlotSchema = createSlotSchema.partial();

export const bulkCreateSlotsSchema = z.object({
  listingId: z.string().min(1, "Listing is required"),
  startDate: z.date(),
  endDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  daysOfWeek: z.array(z.number().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
  location: z.string().optional(),
  room: z.string().optional(),
  table: z.string().optional(),
  isBlackout: z.boolean().default(false),
  price: z.number().min(0, "Price must be non-negative").optional(),
});

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type UpdateSlotInput = z.infer<typeof updateSlotSchema>;
export type BulkCreateSlotsInput = z.infer<typeof bulkCreateSlotsSchema>;
export type SlotStatus = z.infer<typeof slotStatusSchema>;
