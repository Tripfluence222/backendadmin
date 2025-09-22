import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { nanoid } from "@/lib/ids";

export interface IdempotencyKey {
  id: string;
  key: string;
  requestHash: string;
  response: any;
  status: "pending" | "completed" | "failed";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Generate idempotency key
export const generateIdempotencyKey = (): string => {
  return `idemp_${nanoid()}`;
};

// Create idempotency record
export const createIdempotencyRecord = async (
  key: string,
  requestHash: string,
  ttlSeconds: number = 3600 // 1 hour default
): Promise<IdempotencyKey> => {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  
  try {
    const record = await db.idempotencyKey.create({
      data: {
        key,
        requestHash,
        status: "pending",
        expiresAt,
      },
    });
    
    logger.info(`Created idempotency record for key: ${key}`);
    return record;
    
  } catch (error) {
    logger.error(`Failed to create idempotency record:`, error);
    throw error;
  }
};

// Get idempotency record
export const getIdempotencyRecord = async (key: string): Promise<IdempotencyKey | null> => {
  try {
    const record = await db.idempotencyKey.findUnique({
      where: { key },
    });
    
    if (record && record.expiresAt < new Date()) {
      // Expired record, delete it
      await db.idempotencyKey.delete({
        where: { key },
      });
      return null;
    }
    
    return record;
    
  } catch (error) {
    logger.error(`Failed to get idempotency record:`, error);
    return null;
  }
};

// Update idempotency record with response
export const updateIdempotencyRecord = async (
  key: string,
  response: any,
  status: "completed" | "failed"
): Promise<void> => {
  try {
    await db.idempotencyKey.update({
      where: { key },
      data: {
        response: JSON.stringify(response),
        status,
        updatedAt: new Date(),
      },
    });
    
    logger.info(`Updated idempotency record for key: ${key} with status: ${status}`);
    
  } catch (error) {
    logger.error(`Failed to update idempotency record:`, error);
    throw error;
  }
};

// Generate request hash for idempotency
export const generateRequestHash = (method: string, url: string, body?: any): string => {
  const crypto = require("crypto");
  const content = `${method}:${url}:${body ? JSON.stringify(body) : ""}`;
  return crypto.createHash("sha256").update(content).digest("hex");
};

// Idempotency middleware for API routes
export const withIdempotency = <T extends any[]>(
  handler: (...args: T) => Promise<any>,
  options: {
    ttlSeconds?: number;
    keyExtractor?: (...args: T) => string;
  } = {}
) => {
  return async (...args: T): Promise<any> => {
    const { ttlSeconds = 3600, keyExtractor } = options;
    
    // Extract idempotency key from request
    const request = args[0] as Request;
    const idempotencyKey = request.headers.get("idempotency-key");
    
    if (!idempotencyKey) {
      throw new Error("Idempotency-Key header is required");
    }
    
    // Generate request hash
    const url = new URL(request.url);
    const method = request.method;
    const body = request.method !== "GET" ? await request.clone().text() : undefined;
    const requestHash = generateRequestHash(method, url.pathname, body);
    
    // Check for existing record
    const existingRecord = await getIdempotencyRecord(idempotencyKey);
    
    if (existingRecord) {
      if (existingRecord.requestHash !== requestHash) {
        throw new Error("Idempotency key already used with different request");
      }
      
      if (existingRecord.status === "completed") {
        logger.info(`Returning cached response for idempotency key: ${idempotencyKey}`);
        return JSON.parse(existingRecord.response);
      }
      
      if (existingRecord.status === "pending") {
        throw new Error("Request is already being processed");
      }
      
      if (existingRecord.status === "failed") {
        throw new Error("Previous request with this key failed");
      }
    }
    
    // Create new record if not exists
    if (!existingRecord) {
      await createIdempotencyRecord(idempotencyKey, requestHash, ttlSeconds);
    }
    
    try {
      // Execute the handler
      const result = await handler(...args);
      
      // Update record with success response
      await updateIdempotencyRecord(idempotencyKey, result, "completed");
      
      return result;
      
    } catch (error) {
      // Update record with error response
      await updateIdempotencyRecord(idempotencyKey, { error: error.message }, "failed");
      
      throw error;
    }
  };
};

// Cleanup expired idempotency records
export const cleanupExpiredIdempotencyRecords = async (): Promise<void> => {
  try {
    const result = await db.idempotencyKey.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    
    logger.info(`Cleaned up ${result.count} expired idempotency records`);
    
  } catch (error) {
    logger.error(`Failed to cleanup expired idempotency records:`, error);
  }
};

// Idempotency key validation
export const validateIdempotencyKey = (key: string): boolean => {
  // Basic validation: should be alphanumeric with optional hyphens/underscores
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(key) && key.length >= 10 && key.length <= 100;
};