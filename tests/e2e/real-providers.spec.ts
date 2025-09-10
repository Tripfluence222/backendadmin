import { test, expect } from "@playwright/test";

test.describe("Real Provider Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/social");
  });

  test("Social post with real providers", async ({ page }) => {
    // Mock the OAuth flow
    await page.route("**/api/auth/connect/facebook*", async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: "/api/auth/callback/facebook?code=mock_code&state=mock_state",
        },
      });
    });

    await page.route("**/api/auth/callback/facebook*", async (route) => {
      await route.fulfill({
        status: 302,
        headers: {
          Location: "/social?success=Facebook account connected successfully",
        },
      });
    });

    // Mock provider API calls
    await page.route("**/graph.facebook.com/**", async (route) => {
      const url = route.request().url();
      
      if (url.includes("/oauth/access_token")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            access_token: "mock_access_token",
            expires_in: 3600,
          }),
        });
      } else if (url.includes("/me/accounts")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                id: "page123",
                name: "Test Page",
                access_token: "page_access_token",
              },
            ],
          }),
        });
      } else if (url.includes("/page123/events")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "event123",
          }),
        });
      } else if (url.includes("/page123/feed")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "post123",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Connect Facebook account
    await page.click('button:has-text("Connect Facebook")');
    await page.waitForURL("/social?success=*");

    // Verify account is connected
    await expect(page.locator('text=Test Page')).toBeVisible();

    // Create social post
    await page.click('button:has-text("Create Post")');
    
    // Fill post form
    await page.fill('textarea[name="caption"]', "Check out our amazing event! #tripfluence");
    await page.check('input[name="targets.facebook"]');
    await page.check('input[name="targets.instagram"]');
    
    // Upload image
    await page.setInputFiles('input[type="file"]', {
      name: "test-image.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake image data"),
    });

    // Submit post
    await page.click('button[type="submit"]');

    // Verify post was created
    await expect(page.locator('text=Post created successfully')).toBeVisible();
    
    // Verify post appears in list
    await expect(page.locator('text=Check out our amazing event!')).toBeVisible();
  });

  test("Event sync with real providers", async ({ page }) => {
    // Mock Eventbrite API
    await page.route("**/www.eventbriteapi.com/**", async (route) => {
      const url = route.request().url();
      
      if (url.includes("/oauth/token")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            access_token: "mock_eventbrite_token",
            refresh_token: "mock_refresh_token",
            expires_in: 3600,
          }),
        });
      } else if (url.includes("/users/me/organizations")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            organizations: [
              {
                id: "org123",
                name: "Test Organization",
              },
            ],
          }),
        });
      } else if (url.includes("/v3/events/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "event123",
            url: "https://www.eventbrite.com/e/test-event-123",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to event sync
    await page.goto("/event-sync");

    // Connect Eventbrite
    await page.click('button:has-text("Connect Eventbrite")');
    await page.waitForURL("/event-sync?success=*");

    // Verify account is connected
    await expect(page.locator('text=Test Organization')).toBeVisible();

    // Publish event
    await page.click('button:has-text("Publish Event")');
    
    // Select platforms
    await page.check('input[name="targets.eventbrite"]');
    await page.check('input[name="targets.facebook"]');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify sync was queued
    await expect(page.locator('text=Event sync queued successfully')).toBeVisible();
    
    // Verify external IDs are shown
    await expect(page.locator('text=External ID:')).toBeVisible();
  });

  test("Token refresh flow", async ({ page }) => {
    // Mock expired token scenario
    await page.route("**/graph.facebook.com/**", async (route) => {
      const url = route.request().url();
      
      if (url.includes("/me")) {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "INVALID_TOKEN",
              message: "Token has expired",
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Try to create a post with expired token
    await page.click('button:has-text("Create Post")');
    await page.fill('textarea[name="caption"]', "Test post");
    await page.check('input[name="targets.facebook"]');
    await page.click('button[type="submit"]');

    // Should show token refresh error
    await expect(page.locator('text=Token has expired')).toBeVisible();
  });

  test("Rate limiting handling", async ({ page }) => {
    // Mock rate limiting
    await page.route("**/graph.facebook.com/**", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded",
          },
        }),
      });
    });

    // Try to create a post
    await page.click('button:has-text("Create Post")');
    await page.fill('textarea[name="caption"]', "Test post");
    await page.check('input[name="targets.facebook"]');
    await page.click('button[type="submit"]');

    // Should show rate limit error
    await expect(page.locator('text=Rate limit exceeded')).toBeVisible();
  });

  test("Feature flag toggle", async ({ page }) => {
    // Check if feature flag badge is visible
    await expect(page.locator('[data-testid="feature-flag-badge"]')).toBeVisible();
    
    // Should show current mode
    const mode = await page.locator('[data-testid="feature-flag-badge"]').textContent();
    expect(mode).toMatch(/Mock|Real/);
  });
});
