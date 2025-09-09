import { Redis } from 'ioredis';
import { env } from './env';

const redis = new Redis(env.REDIS_URL);

export interface IdempotencyKey {
  key: string;
  userId: string;
  path: string;
}

export async function getIdempotencyKey(
  key: string,
  userId: string,
  path: string
): Promise<IdempotencyKey> {
  return {
    key,
    userId,
    path,
  };
}

export async function checkIdempotency(
  idempotencyKey: IdempotencyKey
): Promise<any | null> {
  const redisKey = `idempotency:${idempotencyKey.userId}:${idempotencyKey.path}:${idempotencyKey.key}`;
  
  const cached = await redis.get(redisKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  return null;
}

export async function storeIdempotency(
  idempotencyKey: IdempotencyKey,
  response: any,
  ttlSeconds = 24 * 60 * 60 // 24 hours
): Promise<void> {
  const redisKey = `idempotency:${idempotencyKey.userId}:${idempotencyKey.path}:${idempotencyKey.key}`;
  
  await redis.setex(redisKey, ttlSeconds, JSON.stringify(response));
}

export async function clearIdempotency(
  idempotencyKey: IdempotencyKey
): Promise<void> {
  const redisKey = `idempotency:${idempotencyKey.userId}:${idempotencyKey.path}:${idempotencyKey.key}`;
  
  await redis.del(redisKey);
}
