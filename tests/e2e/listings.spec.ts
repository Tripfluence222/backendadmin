import { test, expect } from '@playwright/test';
import { gotoAndWait, fillRHFInput, selectShadcnCombobox, uploadMockFile, waitForToast } from './_utils/test-helpers';

test.describe('Listings', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/listings');
  });

  test('should create, publish, and edit a listing', async ({ page }) => {
    await test.step('Create new listing', async () => {
      await page.getByTestId('listings-new').click();
      
      await fillRHFInput(page, 'Title', 'Test Yoga Event');
      await selectShadcnCombobox(page, 'Type', 'Event');
      await fillRHFInput(page, 'Description', 'A relaxing yoga session for beginners');
      await fillRHFInput(page, 'SEO Slug', 'test-yoga-event');
      
      // Upload mock image
      await uploadMockFile(page, 'input[type="file"]');
      
      await page.getByRole('button', { name: /save as draft/i }).click();
      await waitForToast(page, 'Listing saved as draft');
    });

    await test.step('Verify draft appears in table', async () => {
      const table = page.getByTestId('listings-table');
      await expect(table.getByText('Test Yoga Event')).toBeVisible();
      await expect(table.getByText('Draft')).toBeVisible();
    });

    await test.step('Publish the listing', async () => {
      await page.getByRole('row', { name: 'Test Yoga Event' }).getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /publish/i }).click();
      await waitForToast(page, 'Listing published successfully');
      
      await expect(page.getByRole('row', { name: 'Test Yoga Event' }).getByText('Published')).toBeVisible();
    });

    await test.step('Edit listing title', async () => {
      await page.getByRole('row', { name: 'Test Yoga Event' }).getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /edit/i }).click();
      
      await fillRHFInput(page, 'Title', 'Updated Yoga Event');
      await page.getByRole('button', { name: /save changes/i }).click();
      await waitForToast(page, 'Listing updated successfully');
      
      await expect(page.getByRole('row', { name: 'Updated Yoga Event' })).toBeVisible();
    });
  });

  test('should filter and search listings', async ({ page }) => {
    await test.step('Filter by type', async () => {
      await selectShadcnCombobox(page, 'Filter by type', 'Event');
      await page.waitForTimeout(500); // Wait for filter to apply
      
      const rows = page.getByRole('row');
      const count = await rows.count();
      expect(count).toBeGreaterThan(1); // Header + at least one filtered row
    });

    await test.step('Search listings', async () => {
      await page.getByPlaceholder(/search/i).fill('yoga');
      await page.waitForTimeout(500);
      
      const visibleRows = page.getByRole('row').filter({ hasText: 'yoga' });
      const count = await visibleRows.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});