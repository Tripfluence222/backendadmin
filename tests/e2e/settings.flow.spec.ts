import { test, expect } from '@playwright/test';
import { gotoAndWait, fillRHFInput, waitForToast, mockApi } from './_utils/test-helpers';

test.describe('Settings Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/settings');
  });

  test('API key management', async ({ page }) => {
    await test.step('Create API key', async () => {
      await page.getByRole('tab', { name: /api keys/i }).click();
      
      await page.getByRole('button', { name: /create api key|new api key/i }).click();
      
      await fillRHFInput(page, 'Name', 'Test API Key');
      await fillRHFInput(page, 'Description', 'API key for testing');
      
      await page.getByRole('button', { name: /create|save/i }).click();
      await waitForToast(page, /api key created|key generated/i);
    });

    await test.step('Verify API key in list', async () => {
      const table = page.getByTestId('api-keys-table');
      await expect(table.getByText('Test API Key')).toBeVisible();
    });

    await test.step('Delete API key', async ({ page }) => {
      const keyRow = page.getByRole('row', { name: 'Test API Key' });
      await keyRow.getByRole('button', { name: /actions|delete/i }).click();
      await page.getByRole('menuitem', { name: /delete/i }).click();
      
      await page.getByRole('button', { name: /confirm|yes/i }).click();
      await waitForToast(page, /api key deleted|key removed/i);
    });
  });

  test('Webhook endpoint management', async ({ page }) => {
    await test.step('Create webhook endpoint', async () => {
      await page.getByRole('tab', { name: /webhooks/i }).click();
      
      await page.getByRole('button', { name: /create webhook|new webhook/i }).click();
      
      await fillRHFInput(page, 'URL', 'https://example.com/webhook');
      await fillRHFInput(page, 'Name', 'Test Webhook');
      await page.getByRole('checkbox', { name: /enabled/i }).check();
      
      await page.getByRole('button', { name: /create|save/i }).click();
      await waitForToast(page, /webhook created|endpoint created/i);
    });

    await test.step('Test webhook delivery', async ({ page }) => {
      // Mock successful webhook delivery
      await mockApi(page, 'https://example.com/webhook', 200, { success: true });
      
      const webhookRow = page.getByRole('row', { name: 'Test Webhook' });
      await webhookRow.getByRole('button', { name: /test|send test/i }).click();
      
      await waitForToast(page, /webhook test sent|delivery successful/i);
    });

    await test.step('Check recent deliveries', async ({ page }) => {
      const deliveries = page.getByTestId('webhook-deliveries');
      await expect(deliveries).toBeVisible();
      
      const deliveryRow = page.getByRole('row', { name: /200|success/i });
      await expect(deliveryRow).toBeVisible();
    });
  });

  test('User role management', async ({ page }) => {
    await test.step('Change user role', async () => {
      await page.getByRole('tab', { name: /users|team/i }).click();
      
      const userRow = page.getByRole('row', { name: /john doe|test user/i });
      await userRow.getByRole('button', { name: /actions|edit/i }).click();
      
      await page.getByRole('menuitem', { name: /edit role|change role/i }).click();
      
      await page.getByRole('combobox', { name: /role/i }).click();
      await page.getByRole('option', { name: /staff/i }).click();
      
      await page.getByRole('button', { name: /save|update/i }).click();
      await waitForToast(page, /role updated|user updated/i);
    });

    await test.step('Verify role change persisted', async ({ page }) => {
      const userRow = page.getByRole('row', { name: /john doe|test user/i });
      await expect(userRow.getByText('Staff')).toBeVisible();
    });
  });
});
