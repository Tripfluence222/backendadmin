import { test, expect } from '@playwright/test';
import { gotoAndWait, selectShadcnCombobox, waitForToast } from './_utils/test-helpers';

test.describe('Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/widgets');
  });

  test('should create widget with stepper and generate embed code', async ({ page }) => {
    await test.step('Start widget creation', async () => {
      await page.getByRole('button', { name: /create widget/i }).click();
      
      const stepper = page.getByTestId('widgets-stepper');
      await expect(stepper).toBeVisible();
    });

    await test.step('Step 1: Select widget type', async () => {
      await page.getByRole('button', { name: /booking widget/i }).click();
      await page.getByRole('button', { name: /next/i }).click();
    });

    await test.step('Step 2: Select category', async () => {
      await page.getByRole('button', { name: /yoga/i }).click();
      await page.getByRole('button', { name: /next/i }).click();
    });

    await test.step('Step 3: Select theme', async () => {
      await page.getByRole('button', { name: /dark/i }).click();
      await page.getByRole('button', { name: /next/i }).click();
    });

    await test.step('Generate embed code', async () => {
      await page.getByRole('button', { name: /generate/i }).click();
      
      const scriptCode = page.getByTestId('embed-script');
      const iframeCode = page.getByTestId('embed-iframe');
      
      await expect(scriptCode).toBeVisible();
      await expect(iframeCode).toBeVisible();
      
      const scriptContent = await scriptCode.textContent();
      const iframeContent = await iframeCode.textContent();
      
      expect(scriptContent).toContain('<script');
      expect(iframeContent).toContain('<iframe');
    });

    await test.step('Verify preview renders', async () => {
      const preview = page.getByTestId('preview-pane');
      await expect(preview).toBeVisible();
      
      const bookingButton = preview.getByRole('button', { name: /book now/i });
      await expect(bookingButton).toBeVisible();
      await expect(bookingButton).toBeEnabled();
    });
  });

  test('should save and manage widgets', async ({ page }) => {
    await test.step('Create and save widget', async () => {
      await page.getByRole('button', { name: /create widget/i }).click();
      
      // Quick creation
      await page.getByRole('button', { name: /booking widget/i }).click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.getByRole('button', { name: /yoga/i }).click();
      await page.getByRole('button', { name: /next/i }).click();
      await page.getByRole('button', { name: /light/i }).click();
      await page.getByRole('button', { name: /next/i }).click();
      
      await page.getByRole('button', { name: /save widget/i }).click();
      await waitForToast(page, 'Widget saved successfully');
    });

    await test.step('Verify widget appears in list', async () => {
      const table = page.getByRole('table');
      await expect(table.getByText(/booking widget/i)).toBeVisible();
    });
  });
});