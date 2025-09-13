import { describe, it, expect } from "vitest";
import { computeAccountStatus, formatExpiryTime, formatTimeAgo } from "@/lib/integrations/status";
import { SocialAccount } from "@prisma/client";

describe("Integration Status", () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  describe("computeAccountStatus", () => {
    it("should return CONNECTED for active account with valid token", () => {
      const account: Partial<SocialAccount> = {
        isActive: true,
        accessToken: "valid_token",
        expiresAt: oneHourFromNow,
        lastSuccessAt: oneHourAgo,
        lastErrorAt: null,
      };

      const result = computeAccountStatus(account as SocialAccount);

      expect(result.status).toBe("CONNECTED");
      expect(result.expiresInSec).toBeGreaterThan(0);
      expect(result.lastSuccessAt).toEqual(oneHourAgo);
      expect(result.lastErrorAt).toBeNull();
    });

    it("should return DISCONNECTED for inactive account", () => {
      const account: Partial<SocialAccount> = {
        isActive: false,
        accessToken: "valid_token",
        expiresAt: oneHourFromNow,
        lastSuccessAt: oneHourAgo,
        lastErrorAt: null,
      };

      const result = computeAccountStatus(account as SocialAccount);

      expect(result.status).toBe("DISCONNECTED");
      expect(result.expiresInSec).toBeNull();
    });

    it("should return DISCONNECTED for account without access token", () => {
      const account: Partial<SocialAccount> = {
        isActive: true,
        accessToken: "",
        expiresAt: oneHourFromNow,
        lastSuccessAt: oneHourAgo,
        lastErrorAt: null,
      };

      const result = computeAccountStatus(account as SocialAccount);

      expect(result.status).toBe("DISCONNECTED");
      expect(result.expiresInSec).toBeNull();
    });

    it("should return EXPIRED for account with expired token", () => {
      const account: Partial<SocialAccount> = {
        isActive: true,
        accessToken: "valid_token",
        expiresAt: oneHourAgo,
        lastSuccessAt: oneDayAgo,
        lastErrorAt: null,
      };

      const result = computeAccountStatus(account as SocialAccount);

      expect(result.status).toBe("EXPIRED");
      expect(result.expiresInSec).toBe(0);
      expect(result.errorMessage).toBe("Token has expired");
    });

    it("should return ERROR for account with recent error", () => {
      const account: Partial<SocialAccount> = {
        isActive: true,
        accessToken: "valid_token",
        expiresAt: oneHourFromNow,
        lastSuccessAt: oneDayAgo,
        lastErrorAt: oneHourAgo, // Recent error
      };

      const result = computeAccountStatus(account as SocialAccount);

      expect(result.status).toBe("ERROR");
      expect(result.expiresInSec).toBeGreaterThan(0);
      expect(result.errorMessage).toBe("Recent error detected");
    });

    it("should return CONNECTED for account with old error but recent success", () => {
      const account: Partial<SocialAccount> = {
        isActive: true,
        accessToken: "valid_token",
        expiresAt: oneHourFromNow,
        lastSuccessAt: oneHourAgo, // Recent success
        lastErrorAt: oneDayAgo, // Old error
      };

      const result = computeAccountStatus(account as SocialAccount);

      expect(result.status).toBe("CONNECTED");
      expect(result.expiresInSec).toBeGreaterThan(0);
    });

    it("should return CONNECTED for account with no expiry date", () => {
      const account: Partial<SocialAccount> = {
        isActive: true,
        accessToken: "valid_token",
        expiresAt: null,
        lastSuccessAt: oneHourAgo,
        lastErrorAt: null,
      };

      const result = computeAccountStatus(account as SocialAccount);

      expect(result.status).toBe("CONNECTED");
      expect(result.expiresInSec).toBeNull();
    });
  });

  describe("formatExpiryTime", () => {
    it("should format days and hours", () => {
      const days = 2 * 24 * 60 * 60 + 3 * 60 * 60; // 2 days, 3 hours
      expect(formatExpiryTime(days)).toBe("2d 3h");
    });

    it("should format hours and minutes", () => {
      const hours = 2 * 60 * 60 + 30 * 60; // 2 hours, 30 minutes
      expect(formatExpiryTime(hours)).toBe("2h 30m");
    });

    it("should format minutes only", () => {
      const minutes = 45 * 60; // 45 minutes
      expect(formatExpiryTime(minutes)).toBe("45m");
    });

    it("should handle null expiry", () => {
      expect(formatExpiryTime(null)).toBe("Never expires");
    });

    it("should handle expired token", () => {
      expect(formatExpiryTime(0)).toBe("Expired");
      expect(formatExpiryTime(-100)).toBe("Expired");
    });
  });

  describe("formatTimeAgo", () => {
    it("should format days ago", () => {
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      expect(formatTimeAgo(twoDaysAgo)).toBe("2d ago");
    });

    it("should format hours ago", () => {
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      expect(formatTimeAgo(twoHoursAgo)).toBe("2h ago");
    });

    it("should format minutes ago", () => {
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      expect(formatTimeAgo(twoMinutesAgo)).toBe("2m ago");
    });

    it("should format just now", () => {
      const justNow = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
      expect(formatTimeAgo(justNow)).toBe("Just now");
    });

    it("should handle null date", () => {
      expect(formatTimeAgo(null)).toBe("Never");
    });
  });
});
