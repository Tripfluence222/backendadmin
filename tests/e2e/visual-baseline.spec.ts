import { test, expect } from "@playwright/test";
const BASE = process.env.BASE_URL ?? "http://localhost:4000";

test.describe("Visual baselines", () => {
  test("dashboard baseline", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await expect(page).toHaveScreenshot("dashboard.png", { 
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('[data-testid^="metric-value"]'), 
        page.locator('canvas'),
        page.locator('[data-testid="metric-card"] .text-2xl'), // Dynamic numbers
        page.locator('time'), // Any time elements
      ]
    });
  });

  test("listings baseline", async ({ page }) => {
    await page.goto(`${BASE}/listings`);
    await expect(page).toHaveScreenshot("listings.png", { 
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('time'),
        page.locator('[data-testid="table"] tbody tr:first-child'), // First row might have dynamic data
      ]
    });
  });

  test("orders baseline", async ({ page }) => {
    await page.goto(`${BASE}/orders`);
    await expect(page).toHaveScreenshot("orders.png", { 
      maxDiffPixelRatio: 0.02,
      mask: [
        page.locator('time'),
        page.locator('[data-testid="table"] tbody tr:first-child'),
      ]
    });
  });
});
