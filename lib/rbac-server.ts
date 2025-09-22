import { db } from '@/lib/db';
import { Role } from '@prisma/client';

export async function checkRBAC(
  userId: string,
  businessId: string,
  allowedRoles: Role[]
): Promise<boolean> {
  try {
    const roleAssignment = await db.roleAssignment.findFirst({
      where: {
        userId,
        businessId,
        role: {
          in: allowedRoles,
        },
      },
    });

    return !!roleAssignment;
  } catch (error) {
    console.error('Error checking RBAC:', error);
    return false;
  }
}

export async function getUserRole(
  userId: string,
  businessId: string
): Promise<Role | null> {
  try {
    const roleAssignment = await db.roleAssignment.findFirst({
      where: {
        userId,
        businessId,
      },
    });

    return roleAssignment?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function hasPermission(
  userId: string,
  businessId: string,
  permission: string
): Promise<boolean> {
  try {
    const role = await getUserRole(userId, businessId);
    
    if (!role) {
      return false;
    }

    // Define role-based permissions
    const permissions: Record<Role, string[]> = {
      [Role.ADMIN]: [
        'spaces.create',
        'spaces.read',
        'spaces.update',
        'spaces.delete',
        'spaces.publish',
        'requests.read',
        'requests.approve',
        'requests.decline',
        'requests.cancel',
        'pricing.manage',
        'availability.manage',
        'payouts.manage',
        'users.manage',
        'settings.manage',
      ],
      [Role.MANAGER]: [
        'spaces.create',
        'spaces.read',
        'spaces.update',
        'spaces.publish',
        'requests.read',
        'requests.approve',
        'requests.decline',
        'requests.cancel',
        'pricing.manage',
        'availability.manage',
        'payouts.view',
      ],
      [Role.STAFF]: [
        'spaces.read',
        'requests.read',
        'requests.cancel',
        'availability.read',
      ],
      [Role.INFLUENCER]: [
        'spaces.read',
      ],
    };

    return permissions[role]?.includes(permission) || false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Export a default object for backward compatibility
export const rbacServer = {
  checkRBAC,
  getUserRole,
  hasPermission,
};