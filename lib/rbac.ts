import { Role } from '@prisma/client';
import { db } from './db';

export type UserRole = Role;

export async function assertRole(
  userId: string,
  businessId: string,
  allowedRoles: UserRole[]
): Promise<{ userId: string; businessId: string; roles: UserRole[] }> {
  const roleAssignment = await db.roleAssignment.findUnique({
    where: {
      userId_businessId: {
        userId,
        businessId,
      },
    },
  });

  if (!roleAssignment) {
    throw new Error('User not found in business');
  }

  if (!allowedRoles.includes(roleAssignment.role)) {
    throw new Error(`Insufficient permissions. Required: ${allowedRoles.join(' or ')}, got: ${roleAssignment.role}`);
  }

  return {
    userId,
    businessId,
    roles: [roleAssignment.role],
  };
}

export async function getUserRoles(
  userId: string,
  businessId: string
): Promise<UserRole[]> {
  const roleAssignment = await db.roleAssignment.findUnique({
    where: {
      userId_businessId: {
        userId,
        businessId,
      },
    },
  });

  return roleAssignment ? [roleAssignment.role] : [];
}

export function hasRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

export function isAdmin(userRoles: UserRole[]): boolean {
  return userRoles.includes(Role.ADMIN);
}

export function isManager(userRoles: UserRole[]): boolean {
  return userRoles.includes(Role.ADMIN) || userRoles.includes(Role.MANAGER);
}

export function isStaff(userRoles: UserRole[]): boolean {
  return userRoles.includes(Role.ADMIN) || 
         userRoles.includes(Role.MANAGER) || 
         userRoles.includes(Role.STAFF);
}

export function isInfluencer(userRoles: UserRole[]): boolean {
  return userRoles.includes(Role.INFLUENCER);
}
