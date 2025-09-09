import { test, expect } from '@playwright/test';
import { gotoAndWait, mockApi, waitForToast } from './_utils/test-helpers';

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/orders');
  });

  test('should view order details and process refund', async ({ page }) => {
    await test.step('View order details', async () => {
      const firstRow = page.getByRole('row').nth(1); // Skip header row
      await firstRow.click();
      
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      await expect(modal.getByText(/booking details|order details/i)).toBeVisible();
    });

    await test.step('Process refund', async () => {
      await mockApi(page, '/api/orders/*/refund', 200, { success: true, message: 'Refund issued' });
      
      await page.getByRole('button', { name: /refund/i }).click();
      await page.getByRole('button', { name: /confirm refund/i }).click();
      
      await waitForToast(page, 'Refund issued');
    });
  });

  test('should filter orders by status', async ({ page }) => {
    await test.step('Filter by refunded status', async () => {
      await page.getByRole('combobox', { name: /status/i }).click();
      await page.getByRole('option', { name: /refunded/i }).click();
      
      await page.waitForTimeout(500);
      
      const refundedRows = page.getByRole('row').filter({ hasText: /refunded/i });
      const count = await refundedRows.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  test('should export orders to CSV', async ({ page }) => {
    await test.step('Export CSV', async () => {
      const downloadPromise = page.waitForEvent('download');
      
      await page.getByRole('button', { name: /export/i }).click();
      await page.getByRole('menuitem', { name: /csv/i }).click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });
});