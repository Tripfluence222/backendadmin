import { NextRequest } from "next/server";
import { requirePermission as rbacRequirePermission, User } from "@/lib/rbac";

// Mock user for development - in production, this would come from JWT/session
const getMockUser = (): User => ({
  id: "user-1",
  role: "admin",
  businessId: "business-1",
  permissions: ["listings:read", "listings:create", "listings:update", "listings:delete", "listings:publish"],
});

// Extract user from request headers (in production, this would validate JWT)
export const requireAuth = async (request: NextRequest): Promise<User> => {
  // In production, you would:
  // 1. Extract JWT from Authorization header
  // 2. Verify JWT signature
  // 3. Decode user information
  // 4. Return user object
  
  const authHeader = request.headers.get("authorization");
  const userId = request.headers.get("x-user-id");
  const businessId = request.headers.get("x-business-id");
  
  if (!authHeader && !userId) {
    // For development, return mock user
    return getMockUser();
  }
  
  // TODO: Implement proper JWT validation
  // const token = authHeader?.replace("Bearer ", "");
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  return {
    id: userId || "user-1",
    role: "admin", // This would come from JWT
    businessId: businessId || "business-1",
  };
};

// Middleware to require authentication
export const withAuth = <T extends any[]>(
  handler: (...args: T) => Promise<any>
) => {
  return async (...args: T): Promise<any> => {
    const request = args[0] as NextRequest;
    await requireAuth(request);
    return handler(...args);
  };
};

// Helper function to require specific permission
export const requirePermission = (user: User, permission: string): void => {
  rbacRequirePermission(user, permission as any);
};

// Middleware to require specific permission
export const withPermission = (permission: string) => {
  return <T extends any[]>(
    handler: (...args: T) => Promise<any>
  ) => {
    return async (...args: T): Promise<any> => {
      const request = args[0] as NextRequest;
      const user = await requireAuth(request);
      requirePermission(user, permission);
      return handler(...args);
    };
  };
};

// Middleware to require any of multiple permissions
export const withAnyPermission = (permissions: string[]) => {
  return <T extends any[]>(
    handler: (...args: T) => Promise<any>
  ) => {
    return async (...args: T): Promise<any> => {
      const request = args[0] as NextRequest;
      const user = await requireAuth(request);
      requirePermission(user, permissions[0] as any); // Simplified for now
      return handler(...args);
    };
  };
};