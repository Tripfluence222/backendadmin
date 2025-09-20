import { describe, it, expect } from "vitest";
import { 
  createListingSchema, 
  createWidgetSchema,
  createSocialPostSchema,
  createEventSyncSchema 
} from "@/lib/validation";

describe("Schema Validation Tests", () => {
  describe("Listings Schema", () => {
    it("validates valid listing data", () => {
      const validListing = {
        title: "Test Listing",
        type: "event" as const,
        description: "A test event",
        location: "Test Location", 
        images: ["https://example.com/test.jpg"],
        price: 50,
        currency: "USD",
        status: "draft" as const
      };
      
      const result = createListingSchema.safeParse(validListing);
      expect(result.success).toBe(true);
    });

    it("rejects invalid listing type", () => {
      const invalidListing = {
        title: "Test Listing",
        type: "INVALID_TYPE",
        description: "A test listing",
        slug: "test-listing"
      };
      
      const result = createListingSchema.safeParse(invalidListing);
      expect(result.success).toBe(false);
    });
  });


  describe("Widgets Schema", () => {
    it("validates valid widget data", () => {
      const validWidget = {
        widgetType: "booking" as const,
        filters: { category: "Yoga" },
        theme: { mode: "light" as const, primaryColor: "#2563eb" },
        settings: { showPricing: true }
      };
      
      const result = createWidgetSchema.safeParse(validWidget);
      expect(result.success).toBe(true);
    });
  });

  describe("Social Posts Schema", () => {
    it("validates valid social post data", () => {
      const validPost = {
        content: "Check out our new listing!",
        platforms: ["facebook" as const, "instagram" as const],
        scheduledAt: "2024-02-15T10:00:00Z"
      };
      
      const result = createSocialPostSchema.safeParse(validPost);
      expect(result.success).toBe(true);
    });
  });

  describe("Event Sync Schema", () => {
    it("validates valid event sync data", () => {
      const validEventSync = {
        name: "Test Event Sync",
        platform: "eventbrite" as const,
        platformEventId: "evt123",
        syncDirection: "import" as const
      };
      
      const result = createEventSyncSchema.safeParse(validEventSync);
      expect(result.success).toBe(true);
    });
  });
});
