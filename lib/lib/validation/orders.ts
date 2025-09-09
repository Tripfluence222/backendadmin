import { z } from "zod";

export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
  "cancelled"
]);

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show"
]);

export const createOrderSchema = z.object({
  guestName: z.string().min(1, "Guest name is required"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().optional(),
  listingId: z.string().min(1, "Listing is required"),
  date: z.date(),
  time: z.string().optional(),
  guests: z.number().min(1, "At least 1 guest required"),
  totalAmount: z.number().min(0, "Amount must be non-negative"),
  paymentStatus: paymentStatusSchema,
  status: orderStatusSchema,
  specialRequests: z.string().optional(),
  waivers: z.array(z.object({
    type: z.string(),
    signed: z.boolean(),
    signedAt: z.date().optional(),
  })).optional(),
});

export const updateOrderSchema = createOrderSchema.partial();

export const refundOrderSchema = z.object({
  amount: z.number().min(0, "Refund amount must be non-negative"),
  reason: z.string().min(1, "Refund reason is required"),
});

export const rescheduleOrderSchema = z.object({
  newDate: z.date(),
  newTime: z.string().optional(),
  reason: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type RefundOrderInput = z.infer<typeof refundOrderSchema>;
export type RescheduleOrderInput = z.infer<typeof rescheduleOrderSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
