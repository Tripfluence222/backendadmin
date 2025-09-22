import { test, expect } from '@playwright/test';

test.describe('Dashboard Alignment Tests', () => {
  test('dashboard spacing is reasonable under topbar', async ({ page }) => {
    await page.goto((process.env.BASE_URL ?? 'http://localhost:3000') + '/dashboard');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-container"]');
    
    // Get topbar and dashboard container positions
    const topbar = await page.locator('[data-testid="topbar"]').boundingBox();
    const container = await page.locator('[data-testid="dashboard-container"]').boundingBox();
    
    if (topbar && container) {
      // Gap between topbar bottom and dashboard container top should be reasonable (≤ 48px)
      const gap = container.y - (topbar.y + topbar.height);
      expect(gap).toBeLessThanOrEqual(48);
      expect(gap).toBeGreaterThanOrEqual(16); // But not too small
    }
  });

  test('metric cards have consistent heights', async ({ page }) => {
    await page.goto((process.env.BASE_URL ?? 'http://localhost:3000') + '/dashboard');
    
    // Wait for metric cards to load
    await page.waitForSelector('[data-testid="metric-grid"]');
    
    const cards = page.locator('[data-testid="metric-card"]');
    await expect(cards.first()).toBeVisible();
    
    // Get heights of all metric cards
    const cardHandles = await cards.elementHandles();
    const boxes = await Promise.all(cardHandles.map(handle => handle.boundingBox()));
    const heights = boxes.filter(Boolean).map(box => Math.round(box!.height));
    
    if (heights.length > 1) {
      const maxHeight = Math.max(...heights);
      const minHeight = Math.min(...heights);
      
      // Heights should be consistent (within 8px tolerance)
      expect(maxHeight - minHeight).toBeLessThanOrEqual(8);
    }
  });

  test('dashboard content fits within viewport width', async ({ page }) => {
    await page.goto((process.env.BASE_URL ?? 'http://localhost:3000') + '/dashboard');
    
    // Test on different viewport sizes
    const viewports = [
      { width: 320, height: 568 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1440, height: 900 },  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForSelector('[data-testid="dashboard-container"]');
      
      const container = await page.locator('[data-testid="dashboard-container"]').boundingBox();
      
      if (container) {
        // Content should not exceed viewport width
        expect(container.width).toBeLessThanOrEqual(viewport.width);
        // Content should not cause horizontal overflow
        expect(container.x + container.width).toBeLessThanOrEqual(viewport.width + 10); // 10px tolerance
      }
    }
  });

  test('sidebar and content do not overlap on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto((process.env.BASE_URL ?? 'http://localhost:3000') + '/dashboard');
    
    await page.waitForSelector('[data-testid="sidebar"]');
    await page.waitForSelector('[data-testid="dashboard-container"]');
    
    const sidebar = await page.locator('[data-testid="sidebar"]').boundingBox();
    const container = await page.locator('[data-testid="dashboard-container"]').boundingBox();
    
    if (sidebar && container) {
      // Content should start after sidebar ends (with some padding)
      expect(container.x).toBeGreaterThanOrEqual(sidebar.width - 10); // 10px tolerance
    }
  });

  test('spacing tokens are applied consistently', async ({ page }) => {
    await page.goto((process.env.BASE_URL ?? 'http://localhost:3000') + '/dashboard');
    
    // Check that spacing classes are applied correctly
    const metricGrid = page.locator('[data-testid="metric-grid"]');
    await expect(metricGrid).toHaveClass(/gap-4|gap-6/);
    
    const dashboardContainer = page.locator('[data-testid="dashboard-container"]');
    await expect(dashboardContainer).toHaveClass(/space-y-4|space-y-6/);
  });
});