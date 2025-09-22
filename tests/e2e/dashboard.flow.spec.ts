import { test, expect } from '@playwright/test';
import { gotoAndWait, waitForToast } from './_utils/test-helpers';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/dashboard');
  });

  test('Quick Actions navigate correctly', async ({ page }) => {
    await test.step('Navigate to Listings', async () => {
      await page.getByTestId('qa-add-event').click();
      await expect(page).toHaveURL(/\/listings\/new/);
      await page.goBack();
    });

    await test.step('Navigate to Customers', async () => {
      await page.getByTestId('qa-view-customers').click();
      await expect(page).toHaveURL(/\/customers/);
      await page.goBack();
    });

    await test.step('Navigate to Reports', async () => {
      await page.getByTestId('qa-view-reports').click();
      await expect(page).toHaveURL(/\/reports/);
      await page.goBack();
    });

    await test.step('Navigate to Social', async () => {
      await page.getByTestId('qa-social').click();
      await expect(page).toHaveURL(/\/social/);
      await page.goBack();
    });
  });

  test('Recent Orders row opens details drawer', async ({ page }) => {
    await test.step('Click on recent order row', async () => {
      const orderRow = page.getByTestId(/order-row-/).first();
      await expect(orderRow).toBeVisible();
      await orderRow.click();
      
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      await expect(drawer.getByText(/order details|booking details/i)).toBeVisible();
    });
  });

  test('Metric cards show non-empty values', async ({ page }) => {
    await test.step('Check metric cards have values', async () => {
      const metricCards = page.getByTestId('metric-card');
      const count = await metricCards.count();
      expect(count).toBeGreaterThanOrEqual(4);

      // Check each metric card has a non-empty value
      for (let i = 0; i < count; i++) {
        const card = metricCards.nth(i);
        const valueElement = card.locator('[data-testid*="metric-value"]');
        await expect(valueElement).toBeVisible();
        
        const value = await valueElement.textContent();
        expect(value).toBeTruthy();
        expect(value?.trim()).not.toBe('');
        expect(value).not.toBe('0');
      }
    });
  });

  test('View All Orders button works', async ({ page }) => {
    await test.step('Click View All Orders', async () => {
      await page.getByTestId('btn-view-orders').click();
      await expect(page).toHaveURL(/\/orders/);
    });
  });
});
