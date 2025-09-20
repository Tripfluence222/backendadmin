import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("Dashboard Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  test("Quick Actions navigation", async ({ page }) => {
    // Test Add Event
    await page.getByTestId("qa-add-event").click();
    await expect(page).toHaveURL(/.*\/listings\/new\?type=event/);
    await expect(page.getByTestId("create-listing-form")).toBeVisible();
    
    // Go back to dashboard
    await page.goBack();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Test View Customers
    await page.getByTestId("qa-view-customers").click();
    await expect(page).toHaveURL(/.*\/customers/);
    
    // Go back to dashboard
    await page.goBack();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Test View Reports
    await page.getByTestId("qa-view-reports").click();
    await expect(page).toHaveURL(/.*\/reports/);
    
    // Go back to dashboard
    await page.goBack();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Test Social Media
    await page.getByTestId("qa-social").click();
    await expect(page).toHaveURL(/.*\/social/);
  });

  test("Recent Orders navigation", async ({ page }) => {
    // Test View All Orders button
    await page.getByTestId("btn-view-orders").click();
    await expect(page).toHaveURL(/.*\/orders/);
    
    // Go back to dashboard
    await page.goBack();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Test clicking on a recent order row (if any exist)
    const orderRows = page.locator('[data-testid^="order-row-"]');
    const orderCount = await orderRows.count();
    
    if (orderCount > 0) {
      await orderRows.first().click();
      await expect(page.getByTestId("order-details-drawer")).toBeVisible({ timeout: 6000 });
      
      // Close the drawer
      await page.getByRole("button", { name: "Close" }).click();
      await expect(page.getByTestId("order-details-drawer")).not.toBeVisible();
    } else {
      // If no orders exist, just verify the empty state is shown
      await expect(page.getByText("No recent orders")).toBeVisible();
    }
  });

  test("Top Listings navigation", async ({ page }) => {
    // Test View All Listings button
    await page.getByTestId("btn-view-listings").click();
    await expect(page).toHaveURL(/.*\/listings/);
  });

  test("Quick Actions accessibility", async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    
    // Focus should be on the first quick action
    const firstAction = page.getByTestId("qa-add-event");
    await expect(firstAction).toBeFocused();
    
    // Test Enter key activation
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/.*\/listings\/new\?type=event/);
  });

  test("Order details drawer functionality", async ({ page }) => {
    // Look for any order rows
    const orderRows = page.locator('[data-testid^="order-row-"]');
    const orderCount = await orderRows.count();
    
    if (orderCount > 0) {
      // Click on the first order
      await orderRows.first().click();
      
      // Verify drawer opens
      await expect(page.getByTestId("order-details-drawer")).toBeVisible({ timeout: 6000 });
      
      // Verify drawer content
      await expect(page.getByText("Order Details")).toBeVisible();
      await expect(page.getByText("Customer Information")).toBeVisible();
      await expect(page.getByText("Order Items")).toBeVisible();
      await expect(page.getByText("Order Summary")).toBeVisible();
      
      // Test close button
      await page.getByRole("button", { name: "Close" }).click();
      await expect(page.getByTestId("order-details-drawer")).not.toBeVisible();
    }
  });

  test("Dashboard metrics are visible", async ({ page }) => {
    // Verify metric cards are present
    await expect(page.getByTestId("metric-card-revenue")).toBeVisible();
    await expect(page.getByTestId("metric-card-bookings")).toBeVisible();
    await expect(page.getByTestId("metric-card-customers")).toBeVisible();
    await expect(page.getByTestId("metric-card-social")).toBeVisible();
    
    // Verify metric values are displayed
    await expect(page.getByTestId("metric-value-revenue")).toBeVisible();
    await expect(page.getByTestId("metric-value-bookings")).toBeVisible();
    await expect(page.getByTestId("metric-value-customers")).toBeVisible();
    await expect(page.getByTestId("metric-value-social")).toBeVisible();
  });

  test("Responsive layout", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify quick actions are still accessible
    await expect(page.getByTestId("qa-add-event")).toBeVisible();
    await expect(page.getByTestId("qa-view-customers")).toBeVisible();
    await expect(page.getByTestId("qa-view-reports")).toBeVisible();
    await expect(page.getByTestId("qa-social")).toBeVisible();
    
    // Test clicking on mobile
    await page.getByTestId("qa-add-event").click();
    await expect(page).toHaveURL(/.*\/listings\/new\?type=event/);
  });
});
