import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "mobile", width: 375, height: 812 }
];

test.describe("Responsive Audit", () => {
  for (const viewport of viewports) {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      test("Dashboard responsive layout", async ({ page }) => {
        await page.goto(`${BASE}/dashboard`);
        await page.waitForLoadState('networkidle');

        // Test metric cards responsiveness
        const metricCards = page.locator('[data-testid^="metric-card"]');
        await expect(metricCards).toHaveCount(4);

        // Check if cards are properly stacked on mobile
        if (viewport.name === "mobile") {
          const firstCard = metricCards.first();
          const secondCard = metricCards.nth(1);
          const firstBox = await firstCard.boundingBox();
          const secondBox = await secondCard.boundingBox();
          
          // On mobile, cards should be stacked vertically
          expect(secondBox!.y).toBeGreaterThan(firstBox!.y + firstBox!.height - 10);
        }

        // Test quick actions responsiveness
        const quickActions = page.locator('[data-testid^="qa-"]');
        await expect(quickActions).toHaveCount(4);

        // Test navigation on mobile
        if (viewport.name === "mobile") {
          // Quick actions should be in 2x2 grid on mobile
          const actionGrid = page.locator('[data-testid="qa-add-event"]').locator('..');
          const gridStyle = await actionGrid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
          // Check for 2 columns (either repeat(2) or two equal pixel values)
          const hasTwoColumns = gridStyle.includes('repeat(2') || gridStyle.split(' ').length === 2;
          expect(hasTwoColumns).toBeTruthy();
        }
      });

      test("Listings table responsiveness", async ({ page }) => {
        await page.goto(`${BASE}/listings`);
        await page.waitForLoadState('networkidle');

        const table = page.locator('[data-testid="table"]');
        await expect(table).toBeVisible();

        // Check for horizontal scroll on mobile
        if (viewport.name === "mobile") {
          const tableContainer = table.locator('..');
          const hasOverflow = await tableContainer.evaluate(el => {
            return el.scrollWidth > el.clientWidth;
          });
          
          // Table should have horizontal scroll on mobile
          expect(hasOverflow).toBeTruthy();
        }

        // Test table actions visibility
        const actionButtons = table.locator('button');
        const buttonCount = await actionButtons.count();
        
        if (viewport.name === "mobile" && buttonCount > 0) {
          // On mobile, some actions might be hidden or moved to dropdown
          const visibleButtons = await actionButtons.filter({ hasText: /edit|delete|view/i }).count();
          // Should have fewer visible buttons on mobile
          expect(visibleButtons).toBeLessThanOrEqual(2);
        }
      });

      test("Orders table and drawer", async ({ page }) => {
        await page.goto(`${BASE}/orders`);
        await page.waitForLoadState('networkidle');

        const table = page.locator('[data-testid="table"]');
        await expect(table).toBeVisible();

        // Test order details drawer
        const orderRows = page.locator('[data-testid^="order-row-"]');
        const orderCount = await orderRows.count();
        
        if (orderCount > 0) {
          await orderRows.first().click();
          
          // Check if drawer opens properly on all viewports
          const drawer = page.locator('[data-testid="order-details-drawer"]');
          await expect(drawer).toBeVisible({ timeout: 6000 });
          
          // Test drawer responsiveness
          const drawerBox = await drawer.boundingBox();
          expect(drawerBox!.width).toBeLessThanOrEqual(viewport.width);
          
          // Close drawer
          await page.getByRole("button", { name: "Close" }).click();
          await expect(drawer).not.toBeVisible();
        }
      });

      test("Calendar slots responsiveness", async ({ page }) => {
        await page.goto(`${BASE}/availability`);
        await page.waitForLoadState('networkidle');

        // Look for calendar component
        const calendar = page.locator('[data-testid="calendar"]').or(
          page.locator('.rdp').or(
            page.locator('[role="grid"]')
          )
        );

        const calendarExists = await calendar.count() > 0;
        if (calendarExists) {
          await expect(calendar).toBeVisible();
          
          // Test calendar responsiveness
          const calendarBox = await calendar.boundingBox();
          expect(calendarBox!.width).toBeLessThanOrEqual(viewport.width - 32); // Account for padding
        }
      });

      test("Widget builder responsiveness", async ({ page }) => {
        await page.goto(`${BASE}/widgets`);
        await page.waitForLoadState('networkidle');

        // Look for widget builder or generate button
        const generateButton = page.getByRole("button", { name: /generate|create|build/i });
        const buttonExists = await generateButton.count() > 0;
        
        if (buttonExists) {
          await generateButton.first().click();
          
          // Check if widget preview opens
          const preview = page.locator('[data-testid="widget-preview"]');
          const previewExists = await preview.count() > 0;
          
          if (previewExists) {
            await expect(preview).toBeVisible({ timeout: 6000 });
            
            // Test preview responsiveness
            const previewBox = await preview.boundingBox();
            expect(previewBox!.width).toBeLessThanOrEqual(viewport.width - 32);
          }
        }
      });

      test("Social composer responsiveness", async ({ page }) => {
        await page.goto(`${BASE}/social`);
        await page.waitForLoadState('networkidle');

        // Look for post composer
        const composerButton = page.getByRole("button", { name: /compose|create|new post/i });
        const buttonExists = await composerButton.count() > 0;
        
        if (buttonExists) {
          await composerButton.first().click();
          
          // Check if composer modal opens
          const modal = page.locator('[role="dialog"]');
          const modalExists = await modal.count() > 0;
          
          if (modalExists) {
            await expect(modal).toBeVisible({ timeout: 6000 });
            
            // Test modal responsiveness
            const modalBox = await modal.boundingBox();
            // Allow some tolerance for modal width on mobile
            const maxWidth = viewport.name === "mobile" ? viewport.width : viewport.width - 32;
            expect(modalBox!.width).toBeLessThanOrEqual(maxWidth);
          }
        }
      });

      test("Event sync responsiveness", async ({ page }) => {
        await page.goto(`${BASE}/event-sync`);
        await page.waitForLoadState('networkidle');

        // Look for connect buttons
        const connectButtons = page.getByRole("button", { name: /connect|link/i });
        const buttonCount = await connectButtons.count();
        
        if (buttonCount > 0) {
          // Test first connect button
          const firstButton = connectButtons.first();
          await expect(firstButton).toBeVisible();
          await expect(firstButton).toBeEnabled();
        }
      });

      test("Reports date filter responsiveness", async ({ page }) => {
        await page.goto(`${BASE}/reports`);
        await page.waitForLoadState('networkidle');

        // Look for date filter or export buttons
        const dateFilter = page.locator('input[type="date"]').or(
          page.getByRole("button", { name: /date|filter/i })
        );
        const exportButton = page.getByRole("button", { name: /export|download/i });
        
        const hasDateFilter = await dateFilter.count() > 0;
        const hasExportButton = await exportButton.count() > 0;
        
        if (hasDateFilter) {
          await expect(dateFilter.first()).toBeVisible();
        }
        
        if (hasExportButton) {
          await expect(exportButton.first()).toBeVisible();
          await expect(exportButton.first()).toBeEnabled();
        }
      });
    });
  }
});
