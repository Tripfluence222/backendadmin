import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createMocks } from "node-mocks-http";
import { GET, POST, PATCH } from "@/app/api/listings/route";

describe("Listings API Tests", () => {
  describe("GET /api/listings", () => {
    it("returns list of listings", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "/api/listings",
        query: { page: "1", limit: "10" }
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data.listings)).toBe(true);
      expect(data.pagination).toBeDefined();
    });

    it("filters listings by type", async () => {
      const { req } = createMocks({
        method: "GET",
        url: "/api/listings",
        query: { type: "RESTAURANT" }
      });

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.listings.every((listing: any) => listing.type === "RESTAURANT")).toBe(true);
    });
  });

  describe("POST /api/listings", () => {
    it("creates a new listing", async () => {
      const listingData = {
        title: "Test Restaurant",
        type: "RESTAURANT",
        description: "A test restaurant",
        slug: "test-restaurant",
        price: 50,
        currency: "USD"
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/listings",
        body: listingData
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe(listingData.title);
      expect(data.type).toBe(listingData.type);
    });

    it("rejects invalid listing data", async () => {
      const invalidData = {
        title: "", // Invalid: empty title
        type: "INVALID_TYPE",
        description: "A test listing"
      };

      const { req } = createMocks({
        method: "POST",
        url: "/api/listings",
        body: invalidData
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /api/listings", () => {
    it("updates an existing listing", async () => {
      const updateData = {
        title: "Updated Restaurant Name",
        price: 75
      };

      const { req } = createMocks({
        method: "PATCH",
        url: "/api/listings",
        body: updateData,
        query: { id: "1" }
      });

      const response = await PATCH(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe(updateData.title);
      expect(data.price).toBe(updateData.price);
    });
  });
});
