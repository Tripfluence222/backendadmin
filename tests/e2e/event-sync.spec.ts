import { test, expect } from '@playwright/test';
import { gotoAndWait, mockApi, waitForToast, setDateByPlaceholder } from './_utils/test-helpers';

test.describe('Event Sync', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/event-sync');
  });

  test('should create event and publish to channels', async ({ page }) => {
    await test.step('Create new event', async () => {
      await page.getByRole('button', { name: /new event/i }).click();
      
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      await page.getByPlaceholder(/event title/i).fill('Test Yoga Workshop');
      await setDateByPlaceholder(page, 'Event Date', '2024-03-25');
      await page.getByPlaceholder(/location/i).fill('Bali Yoga Studio');
      
      await page.getByRole('button', { name: /publish to channels/i }).click();
    });

    await test.step('Mock webhook and verify published status', async () => {
      await mockApi(page, '/api/webhooks/event-sync', 200, { 
        success: true, 
        externalId: 'ext_12345',
        status: 'Published'
      });
      
      await waitForToast(page, 'Event published successfully');
      
      const statusElement = page.getByTestId('eventsync-status');
      await expect(statusElement).toContainText('Published');
    });

    await test.step('Update event time and verify activity log', async () => {
      await page.getByRole('button', { name: /edit/i }).click();
      
      await setDateByPlaceholder(page, 'Event Date', '2024-03-26');
      await page.getByRole('button', { name: /save changes/i }).click();
      
      await waitForToast(page, 'Event updated successfully');
      
      const activityLog = page.getByTestId('activity-log');
      await expect(activityLog).toContainText('Updated');
    });
  });

  test('should handle sync errors gracefully', async ({ page }) => {
    await test.step('Create event and trigger sync error', async () => {
      await page.getByRole('button', { name: /new event/i }).click();
      
      await page.getByPlaceholder(/event title/i).fill('Error Test Event');
      await setDateByPlaceholder(page, 'Event Date', '2024-03-30');
      
      await mockApi(page, '/api/webhooks/event-sync', 500, { 
        error: 'External platform unavailable' 
      });
      
      await page.getByRole('button', { name: /publish to channels/i }).click();
      
      await waitForToast(page, 'Sync failed: External platform unavailable');
    });
  });
});