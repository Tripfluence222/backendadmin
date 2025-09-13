import { test, expect } from "@playwright/test";

test.describe("Integrations Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/integrations");
  });

  test("should display integrations page with connections and logs tabs", async ({ page }) => {
    // Check page title and description
    await expect(page.locator("h1")).toContainText("Integrations");
    await expect(page.locator("text=Manage your social media and event platform connections")).toBeVisible();
    
    // Check feature flag badge
    await expect(page.locator('[data-testid="feature-flag-badge"]')).toBeVisible();
    
    // Check tabs
    await expect(page.locator('text=Connections')).toBeVisible();
    await expect(page.locator('text=Logs')).toBeVisible();
  });

  test("should show empty state when no accounts connected", async ({ page }) => {
    // Mock empty accounts response
    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: [], total: 0 }),
      });
    });

    await page.reload();
    
    // Check empty state
    await expect(page.locator('text=No Connected Accounts')).toBeVisible();
    await expect(page.locator('text=Connect your social media and event platform accounts')).toBeVisible();
    
    // Check provider cards for connection
    await expect(page.locator('text=Facebook Page')).toBeVisible();
    await expect(page.locator('text=Instagram Business')).toBeVisible();
    await expect(page.locator('text=Google Business')).toBeVisible();
    await expect(page.locator('text=Eventbrite')).toBeVisible();
    await expect(page.locator('text=Meetup')).toBeVisible();
  });

  test("should display connected accounts with proper status", async ({ page }) => {
    // Mock accounts response
    const mockAccounts = [
      {
        id: "acc1",
        provider: "FACEBOOK_PAGE",
        accountName: "Test Page",
        accountId: "page123",
        status: "CONNECTED",
        expiresInSec: 3600,
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: null,
        scopes: ["pages_manage_posts", "pages_manage_events"],
        isActive: true,
      },
      {
        id: "acc2",
        provider: "EVENTBRITE",
        accountName: "Test Organization",
        accountId: "org123",
        status: "EXPIRED",
        expiresInSec: 0,
        lastSuccessAt: new Date(Date.now() - 86400000).toISOString(),
        lastErrorAt: new Date().toISOString(),
        scopes: ["events.write", "organizers.read"],
        isActive: true,
      },
    ];

    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: mockAccounts, total: 2 }),
      });
    });

    await page.reload();
    
    // Check Facebook account card
    await expect(page.locator('[data-testid="integration-card-facebook_page"]')).toBeVisible();
    await expect(page.locator('text=Facebook Page')).toBeVisible();
    await expect(page.locator('text=Test Page')).toBeVisible();
    await expect(page.locator('text=Connected')).toBeVisible();
    
    // Check Eventbrite account card
    await expect(page.locator('[data-testid="integration-card-eventbrite"]')).toBeVisible();
    await expect(page.locator('text=Eventbrite')).toBeVisible();
    await expect(page.locator('text=Test Organization')).toBeVisible();
    await expect(page.locator('text=Expired')).toBeVisible();
  });

  test("should handle reconnect action", async ({ page }) => {
    // Mock accounts response
    const mockAccounts = [
      {
        id: "acc1",
        provider: "FACEBOOK_PAGE",
        accountName: "Test Page",
        accountId: "page123",
        status: "CONNECTED",
        expiresInSec: 3600,
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: null,
        scopes: ["pages_manage_posts"],
        isActive: true,
      },
    ];

    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: mockAccounts, total: 1 }),
      });
    });

    // Mock reconnect response
    await page.route("**/api/integrations/reconnect", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reconnectUrl: "/api/auth/connect/facebook?businessId=test",
          provider: "facebook",
        }),
      });
    });

    await page.reload();
    
    // Click reconnect button
    await page.click('[data-testid="btn-reconnect-facebook_page"]');
    
    // Should redirect to reconnect URL
    await expect(page).toHaveURL(/.*\/api\/auth\/connect\/facebook/);
  });

  test("should handle refresh token action", async ({ page }) => {
    // Mock accounts response with refreshable account
    const mockAccounts = [
      {
        id: "acc1",
        provider: "GOOGLE_BUSINESS",
        accountName: "Test Location",
        accountId: "location123",
        status: "CONNECTED",
        expiresInSec: 3600,
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: null,
        scopes: ["business.manage"],
        refreshToken: "refresh_token_123",
        isActive: true,
      },
    ];

    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: mockAccounts, total: 1 }),
      });
    });

    // Mock refresh response
    await page.route("**/api/integrations/refresh", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Token refreshed successfully",
          accountId: "acc1",
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
        }),
      });
    });

    await page.reload();
    
    // Click refresh button
    await page.click('[data-testid="btn-refresh-google_business"]');
    
    // Should show success toast
    await expect(page.locator('text=Token refreshed successfully')).toBeVisible();
  });

  test("should handle disconnect action", async ({ page }) => {
    // Mock accounts response
    const mockAccounts = [
      {
        id: "acc1",
        provider: "FACEBOOK_PAGE",
        accountName: "Test Page",
        accountId: "page123",
        status: "CONNECTED",
        expiresInSec: 3600,
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: null,
        scopes: ["pages_manage_posts"],
        isActive: true,
      },
    ];

    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: mockAccounts, total: 1 }),
      });
    });

    // Mock disconnect response
    await page.route("**/api/integrations/disconnect", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Account disconnected successfully",
          accountId: "acc1",
        }),
      });
    });

    await page.reload();
    
    // Click disconnect button
    await page.click('[data-testid="btn-disconnect-facebook_page"]');
    
    // Confirm in dialog
    await expect(page.locator('text=Disconnect Account')).toBeVisible();
    await expect(page.locator('text=Are you sure you want to disconnect this Facebook Page account?')).toBeVisible();
    
    await page.click('button:has-text("Disconnect")');
    
    // Should show success toast
    await expect(page.locator('text=Account disconnected successfully')).toBeVisible();
  });

  test("should handle test post action", async ({ page }) => {
    // Mock accounts response
    const mockAccounts = [
      {
        id: "acc1",
        provider: "FACEBOOK_PAGE",
        accountName: "Test Page",
        accountId: "page123",
        status: "CONNECTED",
        expiresInSec: 3600,
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: null,
        scopes: ["pages_manage_posts"],
        isActive: true,
      },
    ];

    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: mockAccounts, total: 1 }),
      });
    });

    // Mock test post response
    await page.route("**/api/integrations/test-post", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Test post queued successfully",
          postId: "post123",
          jobId: "job123",
        }),
      });
    });

    await page.reload();
    
    // Click test post button
    await page.click('[data-testid="btn-testpost-facebook_page"]');
    
    // Should show success toast
    await expect(page.locator('text=Test post sent successfully')).toBeVisible();
  });

  test("should handle test event action", async ({ page }) => {
    // Mock accounts response
    const mockAccounts = [
      {
        id: "acc1",
        provider: "EVENTBRITE",
        accountName: "Test Organization",
        accountId: "org123",
        status: "CONNECTED",
        expiresInSec: 3600,
        lastSuccessAt: new Date().toISOString(),
        lastErrorAt: null,
        scopes: ["events.write"],
        isActive: true,
      },
    ];

    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: mockAccounts, total: 1 }),
      });
    });

    // Mock test event response
    await page.route("**/api/integrations/test-event", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Test event queued successfully",
          eventSyncId: "sync123",
          listingId: "listing123",
          jobId: "job123",
        }),
      });
    });

    await page.reload();
    
    // Click test event button
    await page.click('[data-testid="btn-testevent-eventbrite"]');
    
    // Should show success toast
    await expect(page.locator('text=Test event sent successfully')).toBeVisible();
  });

  test("should display logs tab with webhook and audit logs", async ({ page }) => {
    // Mock logs response
    const mockLogs = [
      {
        id: "log1",
        type: "webhook",
        createdAt: new Date().toISOString(),
        eventType: "order.created",
        status: 200,
        durationMs: 150,
        requestBody: { orderId: "order123" },
        responseBody: { success: true },
        endpointId: "endpoint123",
      },
      {
        id: "log2",
        type: "audit",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        action: "provider.connected",
        entityType: "social_account",
        entityId: "acc123",
        actorType: "user",
        actorId: "user123",
        metadata: { provider: "facebook" },
      },
    ];

    await page.route("**/api/integrations/logs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ logs: mockLogs, total: 2 }),
      });
    });

    // Switch to logs tab
    await page.click('text=Logs');
    
    // Check logs table
    await expect(page.locator('[data-testid="logs-table"]')).toBeVisible();
    await expect(page.locator('text=Integration Logs')).toBeVisible();
    
    // Check filter
    await expect(page.locator('[data-testid="logs-filter-type"]')).toBeVisible();
    
    // Check log entries
    await expect(page.locator('text=order.created')).toBeVisible();
    await expect(page.locator('text=provider.connected')).toBeVisible();
    
    // Check status badges
    await expect(page.locator('text=200')).toBeVisible();
  });

  test("should open log details drawer", async ({ page }) => {
    // Mock logs response
    const mockLogs = [
      {
        id: "log1",
        type: "webhook",
        createdAt: new Date().toISOString(),
        eventType: "order.created",
        status: 200,
        durationMs: 150,
        requestBody: { orderId: "order123" },
        responseBody: { success: true },
        endpointId: "endpoint123",
      },
    ];

    await page.route("**/api/integrations/logs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ logs: mockLogs, total: 1 }),
      });
    });

    // Switch to logs tab
    await page.click('text=Logs');
    
    // Click eye icon to open details
    await page.click('button:has(svg)');
    
    // Check drawer content
    await expect(page.locator('text=Webhook Delivery Details')).toBeVisible();
    await expect(page.locator('text=order.created')).toBeVisible();
    await expect(page.locator('text=200')).toBeVisible();
    await expect(page.locator('text=150ms')).toBeVisible();
  });

  test("should filter logs by type", async ({ page }) => {
    // Mock logs response
    const mockLogs = [
      {
        id: "log1",
        type: "webhook",
        createdAt: new Date().toISOString(),
        eventType: "order.created",
        status: 200,
        durationMs: 150,
      },
      {
        id: "log2",
        type: "audit",
        createdAt: new Date().toISOString(),
        action: "provider.connected",
        entityType: "social_account",
        entityId: "acc123",
        actorType: "user",
        actorId: "user123",
      },
    ];

    await page.route("**/api/integrations/logs*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ logs: mockLogs, total: 2 }),
      });
    });

    // Switch to logs tab
    await page.click('text=Logs');
    
    // Filter by webhook
    await page.click('[data-testid="logs-filter-type"]');
    await page.click('text=Webhook');
    
    // Should only show webhook logs
    await expect(page.locator('text=order.created')).toBeVisible();
    await expect(page.locator('text=provider.connected')).not.toBeVisible();
    
    // Filter by audit
    await page.click('[data-testid="logs-filter-type"]');
    await page.click('text=Audit');
    
    // Should only show audit logs
    await expect(page.locator('text=order.created')).not.toBeVisible();
    await expect(page.locator('text=provider.connected')).toBeVisible();
  });

  test("should show mock mode when real providers disabled", async ({ page }) => {
    // Mock feature flag as false
    await page.route("**/api/integrations/accounts*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ accounts: [], total: 0 }),
      });
    });

    await page.reload();
    
    // Check mock mode badge
    await expect(page.locator('text=Mock Mode')).toBeVisible();
    
    // Test buttons should be disabled with tooltip
    const testButton = page.locator('[data-testid="btn-testpost-facebook_page"]');
    if (await testButton.isVisible()) {
      await testButton.hover();
      await expect(page.locator('text=Real providers disabled')).toBeVisible();
    }
  });
});
