import { z } from "zod";

// Role definitions
export const UserRole = z.enum(["admin", "manager", "staff", "influencer", "viewer"]);
export type UserRole = z.infer<typeof UserRole>;

// Permission definitions
export const Permission = z.enum([
  // Listings
  "listings:read",
  "listings:create", 
  "listings:update",
  "listings:delete",
  "listings:publish",
  
  // Orders
  "orders:read",
  "orders:update",
  "orders:refund",
  "orders:cancel",
  
  // Availability
  "availability:read",
  "availability:create",
  "availability:update", 
  "availability:delete",
  "availability:import",
  "availability:export",
  
  // Widgets
  "widgets:read",
  "widgets:create",
  "widgets:update",
  "widgets:delete",
  "widgets:generate",
  
  // Social
  "social:read",
  "social:post",
  "social:schedule",
  "social:accounts:manage",
  
  // Event Sync
  "eventsync:read",
  "eventsync:create",
  "eventsync:update",
  "eventsync:delete",
  "eventsync:publish",
  
  // Marketing
  "marketing:read",
  "marketing:coupons:manage",
  "marketing:affiliates:manage",
  "marketing:loyalty:manage",
  "marketing:campaigns:manage",
  
  // Reports
  "reports:read",
  "reports:export",
  
  // Settings
  "settings:read",
  "settings:branding:update",
  "settings:payments:update",
  "settings:users:manage",
  "settings:webhooks:manage",
  "settings:apikeys:manage",
  
  // Audit
  "audit:read",
]);

export type Permission = z.infer<typeof Permission>;

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // All permissions
    "listings:read", "listings:create", "listings:update", "listings:delete", "listings:publish",
    "orders:read", "orders:update", "orders:refund", "orders:cancel",
    "availability:read", "availability:create", "availability:update", "availability:delete", "availability:import", "availability:export",
    "widgets:read", "widgets:create", "widgets:update", "widgets:delete", "widgets:generate",
    "social:read", "social:post", "social:schedule", "social:accounts:manage",
    "eventsync:read", "eventsync:create", "eventsync:update", "eventsync:delete", "eventsync:publish",
    "marketing:read", "marketing:coupons:manage", "marketing:affiliates:manage", "marketing:loyalty:manage", "marketing:campaigns:manage",
    "reports:read", "reports:export",
    "settings:read", "settings:branding:update", "settings:payments:update", "settings:users:manage", "settings:webhooks:manage", "settings:apikeys:manage",
    "audit:read",
  ],
  
  manager: [
    "listings:read", "listings:create", "listings:update", "listings:publish",
    "orders:read", "orders:update", "orders:cancel",
    "availability:read", "availability:create", "availability:update", "availability:delete", "availability:import", "availability:export",
    "widgets:read", "widgets:create", "widgets:update", "widgets:generate",
    "social:read", "social:post", "social:schedule",
    "eventsync:read", "eventsync:create", "eventsync:update", "eventsync:publish",
    "marketing:read", "marketing:coupons:manage", "marketing:affiliates:manage", "marketing:loyalty:manage",
    "reports:read", "reports:export",
    "settings:read", "settings:branding:update",
    "audit:read",
  ],
  
  staff: [
    "listings:read", "listings:create", "listings:update",
    "orders:read", "orders:update",
    "availability:read", "availability:create", "availability:update", "availability:delete",
    "widgets:read", "widgets:create", "widgets:update",
    "social:read",
    "eventsync:read",
    "marketing:read",
    "reports:read",
    "settings:read",
  ],
  
  influencer: [
    "listings:read",
    "orders:read",
    "availability:read",
    "widgets:read",
    "social:read", "social:post", "social:schedule",
    "eventsync:read",
    "marketing:read",
    "reports:read",
  ],
  
  viewer: [
    "listings:read",
    "orders:read", 
    "availability:read",
    "widgets:read",
    "social:read",
    "eventsync:read",
    "marketing:read",
    "reports:read",
  ],
};

// User interface
export interface User {
  id: string;
  role: UserRole;
  permissions?: Permission[];
  businessId: string;
}

// RBAC functions
export const hasPermission = (user: User, permission: Permission): boolean => {
  // Check explicit permissions first
  if (user.permissions?.includes(permission)) {
    return true;
  }
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (user: User, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission));
};

export const hasAllPermissions = (user: User, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(user, permission));
};

export const requirePermission = (user: User, permission: Permission): void => {
  if (!hasPermission(user, permission)) {
    throw new Error(`Insufficient permissions. Required: ${permission}`);
  }
};

export const requireAnyPermission = (user: User, permissions: Permission[]): void => {
  if (!hasAnyPermission(user, permissions)) {
    throw new Error(`Insufficient permissions. Required one of: ${permissions.join(", ")}`);
  }
};

export const requireAllPermissions = (user: User, permissions: Permission[]): void => {
  if (!hasAllPermissions(user, permissions)) {
    throw new Error(`Insufficient permissions. Required all of: ${permissions.join(", ")}`);
  }
};

// Business context functions
export const requireBusinessAccess = (user: User, businessId: string): void => {
  if (user.businessId !== businessId) {
    throw new Error("Access denied: Business context mismatch");
  }
};

// Resource ownership functions
export const canAccessResource = (user: User, resourceBusinessId: string): boolean => {
  return user.businessId === resourceBusinessId;
};

export const requireResourceAccess = (user: User, resourceBusinessId: string): void => {
  if (!canAccessResource(user, resourceBusinessId)) {
    throw new Error("Access denied: Resource not accessible");
  }
};

// Role hierarchy functions
export const isHigherRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  const hierarchy: Record<UserRole, number> = {
    admin: 5,
    manager: 4,
    staff: 3,
    influencer: 2,
    viewer: 1,
  };
  
  return hierarchy[userRole] > hierarchy[targetRole];
};

export const canManageUser = (user: User, targetUser: User): boolean => {
  // Users can't manage themselves
  if (user.id === targetUser.id) {
    return false;
  }
  
  // Must be in same business
  if (user.businessId !== targetUser.businessId) {
    return false;
  }
  
  // Must have higher role
  return isHigherRole(user.role, targetUser.role);
};

// Permission groups for common operations
export const PERMISSION_GROUPS = {
  LISTING_MANAGEMENT: ["listings:read", "listings:create", "listings:update", "listings:delete", "listings:publish"] as Permission[],
  ORDER_MANAGEMENT: ["orders:read", "orders:update", "orders:refund", "orders:cancel"] as Permission[],
  AVAILABILITY_MANAGEMENT: ["availability:read", "availability:create", "availability:update", "availability:delete"] as Permission[],
  WIDGET_MANAGEMENT: ["widgets:read", "widgets:create", "widgets:update", "widgets:delete", "widgets:generate"] as Permission[],
  SOCIAL_MANAGEMENT: ["social:read", "social:post", "social:schedule", "social:accounts:manage"] as Permission[],
  EVENT_SYNC_MANAGEMENT: ["eventsync:read", "eventsync:create", "eventsync:update", "eventsync:delete", "eventsync:publish"] as Permission[],
  MARKETING_MANAGEMENT: ["marketing:read", "marketing:coupons:manage", "marketing:affiliates:manage", "marketing:loyalty:manage"] as Permission[],
  SETTINGS_MANAGEMENT: ["settings:read", "settings:branding:update", "settings:payments:update", "settings:users:manage"] as Permission[],
  ADMIN_FUNCTIONS: ["orders:refund", "settings:apikeys:manage", "settings:webhooks:manage", "audit:read"] as Permission[],
};