import { z } from 'zod';
import { OrderStatus, PaymentProvider } from '@prisma/client';

export const cartItemSchema = z.object({
  listingId: z.string().cuid(),
  quantity: z.number().int().positive(),
  ratePlanId: z.string().cuid().optional(),
});

export const priceCartSchema = z.object({
  items: z.array(cartItemSchema),
  couponCode: z.string().optional(),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema),
  customerEmail: z.string().email(),
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().optional(),
  couponCode: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const capturePaymentSchema = z.object({
  paymentIntentId: z.string(),
});

export const refundOrderSchema = z.object({
  reason: z.string().max(500).optional(),
  amount: z.number().positive().optional(), // Partial refund
});

export const orderFiltersSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  customerEmail: z.string().email().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CartItem = z.infer<typeof cartItemSchema>;
export type PriceCartInput = z.infer<typeof priceCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CapturePaymentInput = z.infer<typeof capturePaymentSchema>;
export type RefundOrderInput = z.infer<typeof refundOrderSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
