import { describe, it, expect, vi, beforeEach } from "vitest";
import { MockFacebookProvider } from "../mocks/providers/facebook";
import { MockGoogleBusinessProvider } from "../mocks/providers/google-business";
import { MockEventbriteProvider } from "../mocks/providers/eventbrite";
import { MockMeetupProvider } from "../mocks/providers/meetup";

describe("Provider Adapters", () => {
  describe("Facebook Provider", () => {
    it("should create page post successfully", async () => {
      const result = await MockFacebookProvider.createPagePost(
        "valid_token",
        "page123",
        { message: "Test post" }
      );

      expect(result.id).toMatch(/^mock_fb_/);
      expect(result.url).toContain("facebook.com");
    });

    it("should handle expired token", async () => {
      await expect(
        MockFacebookProvider.createPagePost(
          "expired_token",
          "page123",
          { message: "Test post" }
        )
      ).rejects.toThrow("Token has expired");
    });

    it("should create Instagram media successfully", async () => {
      const mediaResult = await MockFacebookProvider.igCreateMedia(
        "ig123",
        "valid_token",
        { image_url: "https://example.com/image.jpg", caption: "Test" }
      );

      expect(mediaResult.id).toMatch(/^mock_ig_media_/);

      const publishResult = await MockFacebookProvider.igPublishMedia(
        "ig123",
        "valid_token",
        mediaResult.id
      );

      expect(publishResult.id).toMatch(/^mock_ig_/);
      expect(publishResult.url).toContain("instagram.com");
    });
  });

  describe("Google Business Provider", () => {
    it("should create post successfully", async () => {
      const result = await MockGoogleBusinessProvider.createPost(
        "locations/123",
        "valid_token",
        { summary: "Test post" }
      );

      expect(result.name).toMatch(/^mock_gbp_/);
      expect(result.url).toContain("business.google.com");
    });

    it("should refresh token successfully", async () => {
      const result = await MockGoogleBusinessProvider.refreshToken("valid_refresh");

      expect(result.access_token).toBe("new_access_token");
      expect(result.refresh_token).toBe("new_refresh_token");
      expect(result.expires_in).toBe(3600);
    });

    it("should handle invalid refresh token", async () => {
      await expect(
        MockGoogleBusinessProvider.refreshToken("invalid_refresh")
      ).rejects.toThrow("Invalid refresh token");
    });
  });

  describe("Eventbrite Provider", () => {
    it("should create and publish event successfully", async () => {
      const event = {
        name: { text: "Test Event" },
        start: { timezone: "UTC", utc: "2024-02-15T10:00:00Z" },
        currency: "USD",
        summary: "Test event description",
      };

      const createResult = await MockEventbriteProvider.createEvent(
        "valid_token",
        "org123",
        event
      );

      expect(createResult.id).toMatch(/^mock_eb_/);
      expect(createResult.url).toContain("eventbrite.com");

      const publishResult = await MockEventbriteProvider.publishEvent(
        "valid_token",
        createResult.id
      );

      expect(publishResult.id).toBe(createResult.id);
    });
  });

  describe("Meetup Provider", () => {
    it("should create event successfully", async () => {
      const event = {
        name: "Test Meetup",
        time: Date.now() + 86400000, // Tomorrow
        description: "Test meetup description",
        publish_status: "published",
      };

      const result = await MockMeetupProvider.createEvent(
        "valid_token",
        "test-group",
        event
      );

      expect(result.id).toMatch(/^mock_meetup_/);
      expect(result.url).toContain("meetup.com");
    });

    it("should format listing for Meetup correctly", () => {
      const listing = {
        title: "Test Event",
        startDate: "2024-02-15T10:00:00Z",
        endDate: "2024-02-15T12:00:00Z",
        description: "Test description",
        location: {
          name: "Test Venue",
          address: "123 Test St",
          city: "Test City",
          state: "TS",
          country: "US",
          latitude: 40.7128,
          longitude: -74.0060,
        },
        capacity: 50,
      };

      const formatted = MockMeetupProvider.formatEventForMeetup(listing);

      expect(formatted.name).toBe("Test Event");
      expect(formatted.description).toBe("Test description");
      expect(formatted.venue.name).toBe("Test Venue");
      expect(formatted.venue.city).toBe("Test City");
      expect(formatted.rsvp_limit).toBe(50);
      expect(formatted.publish_status).toBe("published");
    });
  });

  describe("Error Handling", () => {
    it("should handle rate limiting", async () => {
      // Mock rate limiting by setting a high probability
      vi.spyOn(Math, "random").mockReturnValue(0.05); // 5% chance

      await expect(
        MockFacebookProvider.createPagePost(
          "valid_token",
          "page123",
          { message: "Test post" }
        )
      ).rejects.toThrow("Rate limit exceeded");
    });

    it("should validate tokens correctly", async () => {
      expect(await MockFacebookProvider.validateToken("valid_token")).toBe(true);
      expect(await MockFacebookProvider.validateToken("expired_token")).toBe(false);

      expect(await MockGoogleBusinessProvider.validateToken("valid_token")).toBe(true);
      expect(await MockGoogleBusinessProvider.validateToken("expired_token")).toBe(false);
    });
  });
});
