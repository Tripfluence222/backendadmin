import { test, expect } from '@playwright/test';
import { gotoAndWait, fillRHFInput, waitForToast, selectShadcnCombobox } from './_utils/test-helpers';

test.describe('Marketing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWait(page, '/marketing');
  });

  test('Create and manage coupons', async ({ page }) => {
    await test.step('Create percentage coupon', async () => {
      await page.getByRole('button', { name: /create coupon|new coupon/i }).click();
      
      await fillRHFInput(page, 'Code', 'YOGADISCOUNT');
      await fillRHFInput(page, 'Description', '20% off yoga classes');
      await selectShadcnCombobox(page, 'Type', 'Percentage');
      await fillRHFInput(page, 'Value', '20');
      await fillRHFInput(page, 'Max Uses', '100');
      
      await page.getByRole('button', { name: /save|create/i }).click();
      await waitForToast(page, /coupon created|coupon saved/i);
    });

    await test.step('Create fixed amount coupon', async () => {
      await page.getByRole('button', { name: /create coupon|new coupon/i }).click();
      
      await fillRHFInput(page, 'Code', 'FIXED10');
      await fillRHFInput(page, 'Description', '$10 off any booking');
      await selectShadcnCombobox(page, 'Type', 'Fixed Amount');
      await fillRHFInput(page, 'Value', '10');
      
      await page.getByRole('button', { name: /save|create/i }).click();
      await waitForToast(page, /coupon created|coupon saved/i);
    });

    await test.step('Verify coupons in table', async () => {
      const table = page.getByTestId('coupons-table');
      await expect(table.getByText('YOGADISCOUNT')).toBeVisible();
      await expect(table.getByText('FIXED10')).toBeVisible();
    });

    await test.step('Toggle coupon status', async () => {
      const couponRow = page.getByRole('row', { name: 'YOGADISCOUNT' });
      const toggle = couponRow.getByRole('switch');
      await toggle.click();
      await waitForToast(page, /status updated|coupon updated/i);
    });
  });

  test('Manage loyalty points', async ({ page }) => {
    await test.step('Navigate to loyalty section', async () => {
      await page.getByRole('tab', { name: /loyalty/i }).click();
    });

    await test.step('Add points to customer', async () => {
      await page.getByRole('button', { name: /add points|award points/i }).click();
      
      await selectShadcnCombobox(page, 'Customer', 'John Doe');
      await fillRHFInput(page, 'Points', '100');
      await fillRHFInput(page, 'Reason', 'Referral bonus');
      
      await page.getByRole('button', { name: /save|add/i }).click();
      await waitForToast(page, /points added|points awarded/i);
    });

    await test.step('Check loyalty ledger', async () => {
      const ledger = page.getByTestId('loyalty-ledger');
      await expect(ledger).toBeVisible();
      
      const ledgerRow = page.getByRole('row', { name: 'John Doe' });
      await expect(ledgerRow.getByText('100')).toBeVisible();
      await expect(ledgerRow.getByText('Referral bonus')).toBeVisible();
    });
  });
});
