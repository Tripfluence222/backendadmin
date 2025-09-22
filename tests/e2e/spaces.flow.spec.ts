import { test, expect } from '@playwright/test';
import { gotoAndWait, fillRHFInput, waitForToast, mockApi } from './_utils/test-helpers';

test.describe('Spaces Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/spaces');
  });

  test('Create space with pricing and requests', async ({ page }) => {
    await test.step('Create new space', async () => {
      await page.getByRole('button', { name: /create space|add space/i }).click();
      
      await fillRHFInput(page, 'Name', 'Test Yoga Studio');
      await fillRHFInput(page, 'Description', 'A peaceful yoga studio for classes');
      await fillRHFInput(page, 'Capacity', '20');
      await fillRHFInput(page, 'Address', '123 Yoga Street, Bali');
      
      await page.getByRole('button', { name: /save|create/i }).click();
      await waitForToast(page, /space created|space saved/i);
    });

    await test.step('Verify space appears in table', async () => {
      const table = page.getByTestId('spaces-table');
      await expect(table.getByText('Test Yoga Studio')).toBeVisible();
    });

    await test.step('Add space pricing', async () => {
      await gotoAndWait(page, '/space-pricing');
      
      await page.getByRole('button', { name: /add pricing|create pricing/i }).click();
      
      await fillRHFInput(page, 'Space', 'Test Yoga Studio');
      await fillRHFInput(page, 'Hourly Rate', '50');
      await fillRHFInput(page, 'Cleaning Fee', '25');
      
      await page.getByRole('button', { name: /save|create/i }).click();
      await waitForToast(page, /pricing created|pricing saved/i);
    });

    await test.step('Create and approve space request', async () => {
      await gotoAndWait(page, '/space-requests');
      
      await page.getByRole('button', { name: /create request|new request/i }).click();
      
      await fillRHFInput(page, 'Space', 'Test Yoga Studio');
      await fillRHFInput(page, 'Date', '2024-12-25');
      await fillRHFInput(page, 'Start Time', '10:00');
      await fillRHFInput(page, 'End Time', '12:00');
      await fillRHFInput(page, 'Purpose', 'Yoga class');
      
      await page.getByRole('button', { name: /submit|create/i }).click();
      await waitForToast(page, /request created|request submitted/i);
      
      // Approve the request
      const requestRow = page.getByRole('row', { name: 'Test Yoga Studio' });
      await requestRow.getByRole('button', { name: /actions/i }).click();
      await page.getByRole('menuitem', { name: /approve/i }).click();
      await waitForToast(page, /request approved/i);
    });
  });
});
