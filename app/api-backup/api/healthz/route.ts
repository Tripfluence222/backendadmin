import { NextRequest } from 'next/server';
import { ok, serverErr } from '@/lib/http';
import { db } from '@/lib/db';
import { Redis } from 'ioredis';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const checks = {
      database: 'unknown',
      redis: 'unknown',
      queue: 'unknown',
    };

    // Check database
    try {
      await db.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch (error) {
      checks.database = 'error';
      console.error('Database health check failed:', error);
    }

    // Check Redis
    try {
      const redis = new Redis(env.REDIS_URL);
      await redis.ping();
      redis.disconnect();
      checks.redis = 'ok';
    } catch (error) {
      checks.redis = 'error';
      console.error('Redis health check failed:', error);
    }

    // Check queue (Redis-based)
    try {
      const redis = new Redis(env.REDIS_URL);
      await redis.ping();
      redis.disconnect();
      checks.queue = 'ok';
    } catch (error) {
      checks.queue = 'error';
      console.error('Queue health check failed:', error);
    }

    const allHealthy = Object.values(checks).every(status => status === 'ok');

    return ok({
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString(),
    }, allHealthy ? 200 : 503);
  } catch (error) {
    console.error('Health check failed:', error);
    return serverErr('Health check failed');
  }
}
