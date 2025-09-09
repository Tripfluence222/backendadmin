import { nanoid } from 'nanoid';

export function createId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}

export function createOrderId(): string {
  return `ord_${nanoid(8).toUpperCase()}`;
}

export function createPaymentId(): string {
  return `pay_${nanoid(8).toUpperCase()}`;
}

export function createWebhookId(): string {
  return `wh_${nanoid(8)}`;
}

export function createApiKeyId(): string {
  return `ak_${nanoid(8)}`;
}

export function createCouponCode(): string {
  return nanoid(8).toUpperCase();
}
