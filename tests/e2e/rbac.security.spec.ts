import { test, expect } from '@playwright/test';
import { gotoAndWait, waitForToast } from './_utils/test-helpers';

test.describe('RBAC Security', () => {
  test.describe('STAFF role restrictions', () => {
    test.beforeEach(async ({ page }) => {
      // Mock STAFF role user
      await page.addInitScript(() => {
        window.localStorage.setItem('user-role', 'STAFF');
      });
      await gotoAndWait(page, '/dashboard');
    });

    test('Cannot access refund functionality', async ({ page }) => {
      await gotoAndWait(page, '/orders');
      
      const firstRow = page.getByRole('row').nth(1);
      await firstRow.click();
      
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      
      // Refund button should not be visible for STAFF
      const refundButton = drawer.getByRole('button', { name: /refund/i });
      await expect(refundButton).not.toBeVisible();
    });

    test('Cannot create API keys', async ({ page }) => {
      await gotoAndWait(page, '/settings');
      
      // API Keys section should not be accessible
      const apiKeysTab = page.getByRole('tab', { name: /api keys/i });
      await expect(apiKeysTab).not.toBeVisible();
    });
  });

  test.describe('INFLUENCER role restrictions', () => {
    test.beforeEach(async ({ page }) => {
      // Mock INFLUENCER role user
      await page.addInitScript(() => {
        window.localStorage.setItem('user-role', 'INFLUENCER');
      });
      await gotoAndWait(page, '/dashboard');
    });

    test('Can only access social features', async ({ page }) => {
      // Should be able to access social
      await page.getByRole('link', { name: /social/i }).click();
      await expect(page).toHaveURL(/\/social/);
      
      // Should not be able to access orders
      await page.getByRole('link', { name: /orders/i }).click();
      await expect(page).toHaveURL(/\/dashboard/); // Redirected back
    });

    test('Cannot access admin settings', async ({ page }) => {
      await gotoAndWait(page, '/settings');
      
      // Should be redirected or see limited options
      const adminTabs = page.getByRole('tab', { name: /api keys|webhooks/i });
      await expect(adminTabs).not.toBeVisible();
    });
  });

  test.describe('ADMIN full access', () => {
    test.beforeEach(async ({ page }) => {
      // Mock ADMIN role user
      await page.addInitScript(() => {
        window.localStorage.setItem('user-role', 'ADMIN');
      });
      await gotoAndWait(page, '/dashboard');
    });

    test('Has full access to all features', async ({ page }) => {
      // Should be able to access all sections
      const sections = ['listings', 'orders', 'customers', 'settings', 'social'];
      
      for (const section of sections) {
        await page.getByRole('link', { name: new RegExp(section, 'i') }).click();
        await expect(page).toHaveURL(new RegExp(`/${section}`));
        await page.goBack();
      }
    });

    test('Can create API keys', async ({ page }) => {
      await gotoAndWait(page, '/settings');
      
      await page.getByRole('tab', { name: /api keys/i }).click();
      
      await page.getByRole('button', { name: /create api key|new api key/i }).click();
      await fillRHFInput(page, 'Name', 'Test API Key');
      await page.getByRole('button', { name: /create|save/i }).click();
      
      await waitForToast(page, /api key created|key generated/i);
    });
  });
});
