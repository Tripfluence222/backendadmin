import { test, expect } from '@playwright/test';
import { gotoAndWait, fillRHFInput, waitForToast, selectShadcnCombobox } from './_utils/test-helpers';

test.describe('Widgets Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/widgets');
  });

  test('Create widget with wizard and generate embed code', async ({ page }) => {
    await test.step('Start widget wizard', async () => {
      await page.getByRole('button', { name: /create widget|new widget/i }).click();
      
      // Step 1: Select widget type
      await page.getByRole('button', { name: /booking/i }).click();
      await page.getByRole('button', { name: /next|continue/i }).click();
    });

    await test.step('Configure widget settings', async () => {
      // Step 2: Select category
      await selectShadcnCombobox(page, 'Category', 'Yoga');
      await page.getByRole('button', { name: /next|continue/i }).click();
      
      // Step 3: Choose theme
      await page.getByRole('button', { name: /dark theme|dark/i }).click();
      await page.getByRole('button', { name: /next|continue/i }).click();
    });

    await test.step('Generate embed code', async () => {
      await page.getByRole('button', { name: /generate|create/i }).click();
      await waitForToast(page, /widget created|embed code generated/i);
      
      // Check embed code is generated
      const embedCode = page.getByTestId('embed-code');
      await expect(embedCode).toBeVisible();
      
      const codeText = await embedCode.textContent();
      expect(codeText).toContain('<iframe');
      expect(codeText).toContain('src=');
    });

    await test.step('Preview widget', async () => {
      const preview = page.getByTestId('widget-preview');
      await expect(preview).toBeVisible();
      
      const iframe = preview.locator('iframe');
      await expect(iframe).toBeVisible();
    });

    await test.step('Copy embed code', async () => {
      const copyButton = page.getByRole('button', { name: /copy|copy code/i });
      await expect(copyButton).toBeVisible();
      await copyButton.click();
      
      await waitForToast(page, /copied|code copied/i);
    });
  });

  test('Widget appears in widgets list', async ({ page }) => {
    await test.step('Check widget in table', async () => {
      const table = page.getByTestId('widgets-table');
      await expect(table).toBeVisible();
      
      // Should have at least one widget
      const rows = table.getByRole('row');
      const count = await rows.count();
      expect(count).toBeGreaterThan(1); // Header + at least one widget
    });
  });
});
