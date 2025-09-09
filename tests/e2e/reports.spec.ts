import { test, expect } from '@playwright/test';
import { gotoAndWait, setDateByPlaceholder } from './_utils/test-helpers';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/reports');
  });

  test('should change date range and verify charts rerender', async ({ page }) => {
    await test.step('Change date range', async () => {
      const dateFilter = page.getByRole('combobox', { name: /date range/i });
      await dateFilter.click();
      await page.getByRole('option', { name: /last 30 days/i }).click();
      
      await page.waitForTimeout(1000); // Wait for charts to rerender
    });

    await test.step('Verify charts have updated', async () => {
      const charts = page.getByTestId('reports-chart');
      const chartCount = await charts.count();
      expect(chartCount).toBeGreaterThan(0);
      
      // Check aria-labels are present
      for (let i = 0; i < chartCount; i++) {
        const chart = charts.nth(i);
        const ariaLabel = await chart.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });
  });

  test('should export CSV', async ({ page }) => {
    await test.step('Export CSV', async () => {
      const downloadPromise = page.waitForEvent('download');
      
      await page.getByRole('button', { name: /export/i }).click();
      await page.getByRole('menuitem', { name: /csv/i }).click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test('should generate custom report', async ({ page }) => {
    await test.step('Toggle custom report', async () => {
      await page.getByRole('button', { name: /custom report/i }).click();
      
      const customReportSection = page.getByTestId('custom-report');
      await expect(customReportSection).toBeVisible();
    });

    await test.step('Verify custom report table renders', async () => {
      const table = page.getByRole('table');
      await expect(table).toBeVisible();
      
      const rows = table.getByRole('row');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(1); // Header + at least one data row
    });
  });

  test('should set custom date range', async ({ page }) => {
    await test.step('Set custom date range', async () => {
      await page.getByRole('combobox', { name: /date range/i }).click();
      await page.getByRole('option', { name: /custom range/i }).click();
      
      await setDateByPlaceholder(page, 'Start Date', '2024-01-01');
      await setDateByPlaceholder(page, 'End Date', '2024-03-31');
      
      await page.getByRole('button', { name: /apply/i }).click();
      
      await page.waitForTimeout(1000);
      
      const dateRangeDisplay = page.getByTestId('date-range-display');
      await expect(dateRangeDisplay).toContainText('Jan 1, 2024');
      await expect(dateRangeDisplay).toContainText('Mar 31, 2024');
    });
  });
});