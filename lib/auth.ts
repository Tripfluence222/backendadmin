import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessId: string;
  isActive: boolean;
  lastLoginAt: Date | null;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('user-id')?.value;
    
    if (!userId) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessId: true,
        isActive: true,
        lastLoginAt: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Mock user for development/testing
export function getMockUser(): User {
  return {
    id: "mock-user-id",
    email: "admin@tripfluence.com",
    firstName: "Admin",
    lastName: "User",
    businessId: "mock-business-id",
    isActive: true,
    lastLoginAt: new Date(),
  };
}

// Auth middleware functions for API routes
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requirePermission(permission: string): Promise<User> {
  const user = await requireAuth();
  // For now, just return the user - in a real app you'd check permissions
  return user;
}