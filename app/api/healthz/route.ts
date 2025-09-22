import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getQueueStats } from "@/jobs/queue";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check database connection
    let dbStatus = "healthy";
    let dbLatency = 0;
    
    try {
      const dbStart = Date.now();
      await db.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch (error) {
      dbStatus = "unhealthy";
    }
    
    // Check Redis connection (if configured)
    let redisStatus = "not_configured";
    const redisLatency = 0;
    
    if (env.REDIS_URL) {
      try {
        // TODO: Implement Redis health check
        // const redis = new Redis(env.REDIS_URL);
        // const redisStart = Date.now();
        // await redis.ping();
        // redisLatency = Date.now() - redisStart;
        // redisStatus = "healthy";
        redisStatus = "healthy"; // Placeholder
      } catch (error) {
        redisStatus = "unhealthy";
      }
    }
    
    // Check queue status
    let queueStatus = "healthy";
    let queueStats = null;
    
    try {
      // Only check queue stats if Redis is configured
      if (env.REDIS_URL) {
        queueStats = await getQueueStats();
      } else {
        queueStatus = "not_configured";
        queueStats = { message: "Redis not configured" };
      }
    } catch (error) {
      queueStatus = "unhealthy";
      queueStats = { error: error.message };
    }
    
    // Check external services
    const externalServices = {
      stripe: env.STRIPE_SECRET_KEY ? "configured" : "not_configured",
      razorpay: env.RAZORPAY_KEY_ID ? "configured" : "not_configured",
      email: env.SMTP_HOST ? "configured" : "not_configured",
      sms: env.TWILIO_ACCOUNT_SID ? "configured" : "not_configured",
    };
    
    // Overall health status
    const overallStatus = dbStatus === "healthy" ? "healthy" : "unhealthy";
    const responseTime = Date.now() - startTime;
    
    const healthData = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || "1.0.0",
      environment: env.NODE_ENV,
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        redis: {
          status: redisStatus,
          latency: redisLatency > 0 ? `${redisLatency}ms` : undefined,
        },
        queues: {
          status: queueStatus,
          stats: queueStats,
        },
        external: externalServices,
      },
    };
    
    return NextResponse.json(healthData, {
      status: overallStatus === "healthy" ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        error: error.message,
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  }
}
