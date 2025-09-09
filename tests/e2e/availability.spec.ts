import { test, expect } from '@playwright/test';
import { gotoAndWait, setDateByPlaceholder, waitForToast, uploadMockFile } from './_utils/test-helpers';

test.describe('Availability', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/availability');
  });

  test('should add and delete availability slots', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    
    await test.step('Add availability slot', async () => {
      await page.getByTestId('add-slot').click();
      
      await setDateByPlaceholder(page, 'Date', today);
      await page.getByPlaceholder(/start time/i).fill('10:00');
      await page.getByPlaceholder(/end time/i).fill('11:00');
      await page.getByPlaceholder(/capacity/i).fill('12');
      
      await page.getByRole('button', { name: /add slot/i }).click();
      await waitForToast(page, 'Slot added successfully');
    });

    await test.step('Verify slot appears in calendar', async () => {
      const calendar = page.getByTestId('availability-calendar');
      const slot = calendar.locator(`[data-date="${today}"]`);
      await expect(slot).toBeVisible();
      await expect(slot).toContainText('10:00');
      await expect(slot).toContainText('12');
    });

    await test.step('Delete slot', async () => {
      const slot = page.locator(`[data-date="${today}"]`);
      await slot.click();
      
      await page.getByRole('button', { name: /delete/i }).click();
      await page.getByRole('button', { name: /confirm/i }).click();
      
      await waitForToast(page, 'Slot deleted successfully');
      await expect(slot).not.toBeVisible();
    });
  });

  test('should import ICS file', async ({ page }) => {
    await test.step('Import ICS file', async () => {
      await page.getByRole('button', { name: /import/i }).click();
      
      await uploadMockFile(page, 'input[type="file"]', 'calendar.ics');
      
      await page.getByRole('button', { name: /import calendar/i }).click();
      await waitForToast(page, 'Calendar imported successfully');
    });
  });
});