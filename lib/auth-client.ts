// Client-safe auth utilities
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  businessId: string;
  isActive: boolean;
  lastLoginAt: Date | null;
}

// Mock user for development/testing (client-safe)
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

// Client-side user utilities
export function getUserDisplayName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getUserInitials(user: User): string {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

export function isUserActive(user: User): boolean {
  return user.isActive;
}
