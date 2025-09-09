import { test, expect } from '@playwright/test';
import { gotoAndWait, uploadMockFile, waitForToast } from './_utils/test-helpers';

test.describe('Social Hub', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/social');
  });

  test('should compose and schedule posts', async ({ page }) => {
    await test.step('Compose post', async () => {
      await page.getByTestId('social-compose').click();
      
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Upload image
      await uploadMockFile(page, 'input[type="file"]');
      
      // Add caption
      await page.getByPlaceholder(/caption|content/i).fill('Hello from Tripfluence');
      
      // Select platforms
      await page.getByLabel(/instagram/i).check();
      await page.getByLabel(/facebook/i).check();
      
      // Schedule for +1 hour
      const futureTime = new Date(Date.now() + 60 * 60 * 1000);
      const timeString = futureTime.toISOString().slice(0, 16);
      
      await page.getByLabel(/schedule/i).check();
      await page.getByPlaceholder(/date.*time/i).fill(timeString);
      
      await page.getByRole('button', { name: /schedule post/i }).click();
      await waitForToast(page, 'Post scheduled successfully');
    });

    await test.step('Verify post appears on calendar', async () => {
      const calendar = page.getByTestId('social-calendar');
      await expect(calendar).toBeVisible();
      
      // Check for scheduled post
      const scheduledPost = calendar.locator('[data-scheduled="true"]');
      await expect(scheduledPost).toBeVisible();
    });
  });

  test('should view analytics', async ({ page }) => {
    await test.step('Open analytics tab', async () => {
      await page.getByRole('tab', { name: /analytics/i }).click();
      
      const impressionsCard = page.getByText(/impressions/i);
      const clicksCard = page.getByText(/clicks/i);
      
      await expect(impressionsCard).toBeVisible();
      await expect(clicksCard).toBeVisible();
      
      // Check values are not null/empty
      const impressionsValue = impressionsCard.locator('..').locator('[data-testid*="value"]');
      const clicksValue = clicksCard.locator('..').locator('[data-testid*="value"]');
      
      await expect(impressionsValue).toBeVisible();
      await expect(clicksValue).toBeVisible();
      
      const impressionsText = await impressionsValue.textContent();
      const clicksText = await clicksValue.textContent();
      
      expect(impressionsText).toBeTruthy();
      expect(clicksText).toBeTruthy();
    });
  });
});