import { customAlphabet, nanoid } from 'nanoid';

// Re-export nanoid for direct usage
export { nanoid };

// Create custom alphabets for different ID types
const orderAlphabet = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
const paymentAlphabet = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
const couponAlphabet = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export function createOrderId(): string {
  return `ORD-${orderAlphabet()}`;
}

export function createPaymentId(): string {
  return `PAY-${paymentAlphabet()}`;
}

export function createCouponCode(): string {
  return couponAlphabet();
}