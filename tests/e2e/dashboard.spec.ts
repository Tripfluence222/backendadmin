import { test, expect } from '@playwright/test';
import { gotoAndWait, expectVisible } from './_utils/test-helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
  });

  test('should display sidebar and topbar correctly', async ({ page, browserName }) => {
    await test.step('Check sidebar visibility', async () => {
      if (browserName === 'webkit' && page.viewportSize()?.width === 375) {
        // Mobile: sidebar should be hidden initially
        const sidebar = page.getByTestId('sidebar');
        await expect(sidebar).toHaveClass(/hidden|translate-x-full/);
        
        // Click hamburger to show sidebar
        const hamburger = page.getByRole('button', { name: /menu|toggle/i });
        await hamburger.click();
        await expect(sidebar).toBeVisible();
      } else {
        // Desktop: sidebar should be visible
        await expectVisible(page, '[data-testid="sidebar"]');
      }
    });

    await test.step('Check topbar elements', async () => {
      await expectVisible(page, '[data-testid="topbar-search"]');
      await expectVisible(page, '[data-testid="topbar-notifications"]');
      await expectVisible(page, '[data-testid="topbar-profile"]');
    });
  });

  test('should display metric cards with values', async ({ page }) => {
    await test.step('Check metric cards exist and have values', async () => {
      const metricCards = page.locator('[data-testid*="metric-card"]');
      const count = await metricCards.count();
      expect(count).toBeGreaterThanOrEqual(3);

      // Check first few cards have non-empty values
      for (let i = 0; i < Math.min(3, count); i++) {
        const card = metricCards.nth(i);
        const value = card.locator('[data-testid*="value"]');
        await expect(value).toBeVisible();
        
        const text = await value.textContent();
        expect(text).toBeTruthy();
        expect(text?.trim()).not.toBe('');
      }
    });
  });

  test('should navigate between pages', async ({ page }) => {
    await test.step('Navigate to listings', async () => {
      await page.getByRole('link', { name: /listings/i }).click();
      await expect(page).toHaveURL('/listings');
    });

    await test.step('Navigate to orders', async () => {
      await page.getByRole('link', { name: /orders/i }).click();
      await expect(page).toHaveURL('/orders');
    });

    await test.step('Navigate back to dashboard', async () => {
      await page.getByRole('link', { name: /dashboard/i }).click();
      await expect(page).toHaveURL('/dashboard');
    });
  });
});