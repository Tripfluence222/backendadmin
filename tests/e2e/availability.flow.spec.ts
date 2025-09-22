import { test, expect } from '@playwright/test';
import { gotoAndWait, fillRHFInput, waitForToast, setDateByPlaceholder } from './_utils/test-helpers';

test.describe('Availability Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/availability');
  });

  test('Add and delete availability slots', async ({ page }) => {
    await test.step('Add availability slot', async () => {
      await page.getByRole('button', { name: /add slot|create slot/i }).click();
      
      await fillRHFInput(page, 'Date', '2024-12-25');
      await fillRHFInput(page, 'Start Time', '10:00');
      await fillRHFInput(page, 'End Time', '12:00');
      await fillRHFInput(page, 'Capacity', '20');
      await fillRHFInput(page, 'Price', '50');
      
      await page.getByRole('button', { name: /save|create/i }).click();
      await waitForToast(page, /slot created|slot added/i);
    });

    await test.step('Verify slot appears in calendar', async () => {
      const calendar = page.getByTestId('availability-calendar');
      await expect(calendar).toBeVisible();
      
      // Check if the slot is visible in the calendar
      const slotElement = page.getByText('10:00 - 12:00').first();
      await expect(slotElement).toBeVisible();
    });

    await test.step('Delete availability slot', async () => {
      const slotRow = page.getByRole('row', { name: /2024-12-25/ });
      await slotRow.getByRole('button', { name: /actions|delete/i }).click();
      await page.getByRole('menuitem', { name: /delete/i }).click();
      
      // Confirm deletion
      await page.getByRole('button', { name: /confirm|yes/i }).click();
      await waitForToast(page, /slot deleted|slot removed/i);
    });

    await test.step('Verify slot is removed from calendar', async () => {
      const slotElement = page.getByText('10:00 - 12:00');
      await expect(slotElement).not.toBeVisible();
    });
  });

  test('ICS import and export', async ({ page }) => {
    await test.step('Export ICS file', async () => {
      const downloadPromise = page.waitForEvent('download');
      
      await page.getByRole('button', { name: /export|download/i }).click();
      await page.getByRole('menuitem', { name: /ics|calendar/i }).click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.ics');
    });

    await test.step('Import ICS file', async () => {
      await page.getByRole('button', { name: /import/i }).click();
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-calendar.ics',
        mimeType: 'text/calendar',
        buffer: Buffer.from('BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR')
      });
      
      await page.getByRole('button', { name: /upload|import/i }).click();
      await waitForToast(page, /imported|uploaded/i);
    });
  });
});
