import { test, expect } from '@playwright/test';
import { gotoAndWait, getBoundingBox, isOverlapping } from './_utils/test-helpers';

test.describe('Visual Alignment', () => {
  const pages = ['/dashboard', '/listings', '/orders'];

  for (const pagePath of pages) {
    test(`should check layout alignment on ${pagePath}`, async ({ page, browserName }) => {
      await gotoAndWait(page, pagePath);

      await test.step('Check sidebar and topbar do not overlap', async () => {
        const sidebar = page.getByTestId('sidebar');
        const topbar = page.getByTestId('topbar');
        
        if (await sidebar.isVisible() && await topbar.isVisible()) {
          const sidebarBox = await getBoundingBox(page, '[data-testid="sidebar"]');
          const topbarBox = await getBoundingBox(page, '[data-testid="topbar"]');
          
          const overlapping = await isOverlapping(sidebarBox, topbarBox);
          expect(overlapping).toBe(false);
        }
      });

      await test.step('Check dark mode contrast', async () => {
        // Set dark mode
        await page.emulateMedia({ colorScheme: 'dark' });
        await page.waitForTimeout(500);
        
        const body = page.locator('body');
        const bodyStyles = await body.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color
          };
        });
        
        // Check for reasonable contrast (not pure black on pure white)
        expect(bodyStyles.backgroundColor).not.toBe('rgb(0, 0, 0)');
        expect(bodyStyles.color).not.toBe('rgb(255, 255, 255)');
        
        // Check that background and text are different
        expect(bodyStyles.backgroundColor).not.toBe(bodyStyles.color);
      });

      await test.step('Check mobile responsive behavior', async () => {
        if (browserName === 'webkit' && page.viewportSize()?.width === 375) {
          // On mobile, check that tables use kebab menus
          const tables = page.getByRole('table');
          const tableCount = await tables.count();
          
          if (tableCount > 0) {
            const firstTable = tables.first();
            const kebabMenus = firstTable.getByRole('button', { name: /actions|menu/i });
            const kebabCount = await kebabMenus.count();
            
            // Should have kebab menus instead of individual action buttons
            expect(kebabCount).toBeGreaterThan(0);
            
            // Check no horizontally clipped buttons
            for (let i = 0; i < kebabCount; i++) {
              const kebab = kebabMenus.nth(i);
              const box = await kebab.boundingBox();
              if (box) {
                expect(box.x + box.width).toBeLessThanOrEqual(375); // Viewport width
              }
            }
          }
        }
      });
    });
  }

  test('should maintain consistent spacing and layout', async ({ page }) => {
    await gotoAndWait(page, '/dashboard');

    await test.step('Check main content container', async () => {
      const mainContent = page.locator('main');
      const container = mainContent.locator('.max-w-\\[1280px\\], .max-w-screen-xl, .container');
      
      if (await container.isVisible()) {
        const containerBox = await container.boundingBox();
        expect(containerBox?.width).toBeLessThanOrEqual(1280);
      }
    });

    await test.step('Check consistent padding', async () => {
      const mainContent = page.locator('main');
      const styles = await mainContent.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight
        };
      });
      
      // Should have consistent horizontal padding
      expect(styles.paddingLeft).toBeTruthy();
      expect(styles.paddingRight).toBeTruthy();
    });
  });
});
