import { SocialAccount } from "@prisma/client";

export type AccountStatus = "CONNECTED" | "EXPIRED" | "ERROR" | "DISCONNECTED";

export interface AccountStatusInfo {
  status: AccountStatus;
  expiresInSec: number | null;
  lastSuccessAt: Date | null;
  lastErrorAt: Date | null;
  errorMessage?: string;
}

export function computeAccountStatus(account: SocialAccount): AccountStatusInfo {
  const now = new Date();
  
  // Check if account is disconnected
  if (!account.isActive || !account.accessToken) {
    return {
      status: "DISCONNECTED",
      expiresInSec: null,
      lastSuccessAt: account.lastSuccessAt,
      lastErrorAt: account.lastErrorAt,
    };
  }
  
  // Check if token is expired
  if (account.expiresAt && account.expiresAt < now) {
    return {
      status: "EXPIRED",
      expiresInSec: 0,
      lastSuccessAt: account.lastSuccessAt,
      lastErrorAt: account.lastErrorAt,
      errorMessage: "Token has expired",
    };
  }
  
  // Check if there's a recent error
  if (account.lastErrorAt) {
    const errorAge = now.getTime() - account.lastErrorAt.getTime();
    const errorAgeHours = errorAge / (1000 * 60 * 60);
    
    // If error is recent (within 24 hours) and no success since then
    if (errorAgeHours < 24 && (!account.lastSuccessAt || account.lastErrorAt > account.lastSuccessAt)) {
      return {
        status: "ERROR",
        expiresInSec: account.expiresAt ? Math.floor((account.expiresAt.getTime() - now.getTime()) / 1000) : null,
        lastSuccessAt: account.lastSuccessAt,
        lastErrorAt: account.lastErrorAt,
        errorMessage: "Recent error detected",
      };
    }
  }
  
  // Calculate time until expiry
  const expiresInSec = account.expiresAt 
    ? Math.floor((account.expiresAt.getTime() - now.getTime()) / 1000)
    : null;
  
  return {
    status: "CONNECTED",
    expiresInSec,
    lastSuccessAt: account.lastSuccessAt,
    lastErrorAt: account.lastErrorAt,
  };
}

export function formatExpiryTime(expiresInSec: number | null): string {
  if (expiresInSec === null) {
    return "Never expires";
  }
  
  if (expiresInSec <= 0) {
    return "Expired";
  }
  
  const days = Math.floor(expiresInSec / (24 * 60 * 60));
  const hours = Math.floor((expiresInSec % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((expiresInSec % (60 * 60)) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function formatTimeAgo(date: Date | null): string {
  if (!date) {
    return "Never";
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffDay > 0) {
    return `${diffDay}d ago`;
  } else if (diffHour > 0) {
    return `${diffHour}h ago`;
  } else if (diffMin > 0) {
    return `${diffMin}m ago`;
  } else {
    return "Just now";
  }
}
