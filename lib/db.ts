import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a mock database client for build time
const createMockDb = () => ({
  $queryRaw: () => Promise.resolve([]),
  $executeRaw: () => Promise.resolve(0),
  $transaction: (fn: any) => fn({}),
  // Add other commonly used methods as needed
  user: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
  business: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
  space: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
  socialAccount: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
  webhookDelivery: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
  auditLog: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
  spaceAvailability: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
  spaceRequest: { findMany: () => Promise.resolve([]), findFirst: () => Promise.resolve(null) },
} as any);

export const db = (() => {
  // During build time or when SKIP_ENV_VALIDATION is set, use mock database
  if (process.env.SKIP_ENV_VALIDATION === 'true' || process.env.NODE_ENV === 'production') {
    try {
      return globalForPrisma.prisma ?? new PrismaClient({
        log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        datasources: {
          db: {
            url: env.DATABASE_URL,
          },
        },
      });
    } catch (error) {
      console.warn('Database connection failed during build, using mock database:', error);
      return createMockDb();
    }
  }

  return globalForPrisma.prisma ?? new PrismaClient({
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });
})();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;