import { describe, it, expect } from "vitest";
import { createMocks } from "node-mocks-http";
import { POST } from "@/app/api/orders/[id]/refund/route";
import { POST as createApiKey } from "@/app/api/admin/api-keys/route";
import { POST as createSocialPost } from "@/app/api/social/posts/route";

describe("RBAC Integration Tests", () => {
  const mockAdminUser = {
    id: "admin-1",
    role: "admin",
    permissions: ["orders:refund", "api-keys:create", "social:post"]
  };

  const mockStaffUser = {
    id: "staff-1", 
    role: "staff",
    permissions: ["listings:read", "orders:read"]
  };

  const mockInfluencerUser = {
    id: "influencer-1",
    role: "influencer", 
    permissions: ["social:post"]
  };

  describe("Order Refund Permissions", () => {
    it("allows admin to refund orders", async () => {
      const { req } = createMocks({
        method: "POST",
        url: "/api/orders/1/refund",
        body: { amount: 50, reason: "Customer request" },
        headers: {
          "x-user": JSON.stringify(mockAdminUser)
        }
      });

      const response = await POST(req, { params: { id: "1" } });
      expect(response.status).toBe(200);
    });

    it("denies staff from refunding orders", async () => {
      const { req } = createMocks({
        method: "POST",
        url: "/api/orders/1/refund", 
        body: { amount: 50, reason: "Customer request" },
        headers: {
          "x-user": JSON.stringify(mockStaffUser)
        }
      });

      const response = await POST(req, { params: { id: "1" } });
      expect(response.status).toBe(403);
    });
  });

  describe("API Key Creation Permissions", () => {
    it("allows admin to create API keys", async () => {
      const { req } = createMocks({
        method: "POST",
        url: "/api/admin/api-keys",
        body: { name: "Test Key", permissions: ["read"] },
        headers: {
          "x-user": JSON.stringify(mockAdminUser)
        }
      });

      const response = await createApiKey(req);
      expect(response.status).toBe(201);
    });

    it("denies staff from creating API keys", async () => {
      const { req } = createMocks({
        method: "POST",
        url: "/api/admin/api-keys",
        body: { name: "Test Key", permissions: ["read"] },
        headers: {
          "x-user": JSON.stringify(mockStaffUser)
        }
      });

      const response = await createApiKey(req);
      expect(response.status).toBe(403);
    });
  });

  describe("Social Post Permissions", () => {
    it("allows influencer to create social posts", async () => {
      const { req } = createMocks({
        method: "POST",
        url: "/api/social/posts",
        body: { 
          content: "Test post",
          platforms: ["facebook"],
          scheduledAt: "2024-02-15T10:00:00Z"
        },
        headers: {
          "x-user": JSON.stringify(mockInfluencerUser)
        }
      });

      const response = await createSocialPost(req);
      expect(response.status).toBe(201);
    });

    it("denies staff from creating social posts", async () => {
      const { req } = createMocks({
        method: "POST",
        url: "/api/social/posts",
        body: { 
          content: "Test post",
          platforms: ["facebook"]
        },
        headers: {
          "x-user": JSON.stringify(mockStaffUser)
        }
      });

      const response = await createSocialPost(req);
      expect(response.status).toBe(403);
    });
  });
});
