import { test, expect } from '@playwright/test';

test.describe('Visual Alignment & Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should ensure sidebar and topbar do not overlap', async ({ page }) => {
    // Check sidebar position
    const sidebar = page.locator('nav').first();
    const topbar = page.locator('header').first();
    
    await expect(sidebar).toBeVisible();
    await expect(topbar).toBeVisible();
    
    // Get bounding boxes
    const sidebarBox = await sidebar.boundingBox();
    const topbarBox = await topbar.boundingBox();
    
    expect(sidebarBox).toBeTruthy();
    expect(topbarBox).toBeTruthy();
    
    // Check that sidebar and topbar don't overlap
    if (sidebarBox && topbarBox) {
      // Sidebar should be to the left, topbar should be to the right
      expect(sidebarBox.x + sidebarBox.width).toBeLessThanOrEqual(topbarBox.x);
    }
  });

  test('should have consistent table column headers across pages', async ({ page }) => {
    const pages = [
      { url: '/listings', expectedHeaders: ['Title', 'Type', 'Status', 'Location'] },
      { url: '/orders', expectedHeaders: ['Order ID', 'Guest', 'Listing', 'Amount', 'Status'] },
      { url: '/customers', expectedHeaders: ['Name', 'Email', 'Bookings', 'Status'] },
      { url: '/widgets', expectedHeaders: ['Name', 'Type', 'Status', 'Created'] }
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Check each expected header exists
      for (const header of pageInfo.expectedHeaders) {
        await expect(page.locator('th').filter({ hasText: header })).toBeVisible();
      }
    }
  });

  test('should apply dark mode with correct contrast', async ({ page }) => {
    // Toggle dark mode
    const themeToggle = page.locator('button').filter({ hasText: /Toggle theme/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Check body has dark class
      const body = page.locator('body');
      const bodyClasses = await body.getAttribute('class');
      expect(bodyClasses).toContain('dark');
      
      // Check text contrast
      const mainText = page.locator('h1').first();
      const textColor = await mainText.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.color;
      });
      
      // Dark mode should have light text
      expect(textColor).toContain('rgb(255, 255, 255)'); // or similar light color
      
      // Check background contrast
      const mainContent = page.locator('main').first();
      const backgroundColor = await mainContent.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundColor;
      });
      
      // Dark mode should have dark background
      expect(backgroundColor).toContain('rgb(0, 0, 0)'); // or similar dark color
    }
  });

  test('should handle mobile responsive layout correctly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check sidebar is hidden
    const sidebar = page.locator('nav').first();
    const sidebarClasses = await sidebar.getAttribute('class');
    expect(sidebarClasses).toContain('-translate-x-full');
    
    // Check hamburger menu is visible
    const hamburgerMenu = page.locator('button').filter({ hasText: /Toggle sidebar/i });
    await expect(hamburgerMenu).toBeVisible();
    
    // Check main content is not overlapped
    const mainContent = page.locator('main').first();
    const mainBox = await mainContent.boundingBox();
    expect(mainBox?.x).toBe(0); // Should start at left edge
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    // Check layout adapts
    const updatedMainBox = await mainContent.boundingBox();
    expect(updatedMainBox?.x).toBeGreaterThan(0); // Should have some left margin
  });

  test('should maintain consistent spacing and padding', async ({ page }) => {
    // Check main content padding
    const mainContent = page.locator('main').first();
    const mainStyles = await mainContent.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        padding: styles.padding,
        margin: styles.margin
      };
    });
    
    // Should have consistent padding
    expect(mainStyles.padding).toBeTruthy();
    
    // Check card spacing
    const cards = page.locator('[class*="Card"]');
    const cardCount = await cards.count();
    
    if (cardCount > 1) {
      const firstCard = cards.first();
      const secondCard = cards.nth(1);
      
      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();
      
      if (firstCardBox && secondCardBox) {
        // Cards should have consistent spacing
        const spacing = secondCardBox.y - (firstCardBox.y + firstCardBox.height);
        expect(spacing).toBeGreaterThan(0);
      }
    }
  });

  test('should handle form alignment consistently', async ({ page }) => {
    // Navigate to a form page
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    
    // Click create button to open form
    const createButton = page.locator('button').filter({ hasText: /Create Listing/i });
    await createButton.click();
    
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check form field alignment
    const formFields = page.locator('input, textarea, select');
    const fieldCount = await formFields.count();
    
    for (let i = 0; i < Math.min(fieldCount, 5); i++) {
      const field = formFields.nth(i);
      const fieldBox = await field.boundingBox();
      
      if (fieldBox) {
        // Fields should be consistently aligned
        expect(fieldBox.x).toBeGreaterThan(0);
        expect(fieldBox.width).toBeGreaterThan(100);
      }
    }
  });

  test('should maintain consistent button styling', async ({ page }) => {
    // Check primary buttons
    const primaryButtons = page.locator('button').filter({ hasText: /Create|Save|Submit/i });
    const buttonCount = await primaryButtons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = primaryButtons.nth(i);
      const buttonStyles = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          borderRadius: styles.borderRadius,
          padding: styles.padding
        };
      });
      
      // Buttons should have consistent styling
      expect(buttonStyles.backgroundColor).toBeTruthy();
      expect(buttonStyles.color).toBeTruthy();
      expect(buttonStyles.borderRadius).toBeTruthy();
    }
  });

  test('should handle long content gracefully', async ({ page }) => {
    // Navigate to a page with potentially long content
    await page.goto('/listings');
    await page.waitForLoadState('networkidle');
    
    // Check table handles long content
    const table = page.locator('table');
    if (await table.isVisible()) {
      const tableBox = await table.boundingBox();
      const viewportWidth = page.viewportSize()?.width || 1440;
      
      // Table should not exceed viewport width
      if (tableBox) {
        expect(tableBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
    
    // Check text wrapping
    const longTextElements = page.locator('td, p, span').filter({ hasText: /.{50,}/ });
    const longTextCount = await longTextElements.count();
    
    for (let i = 0; i < Math.min(longTextCount, 3); i++) {
      const element = longTextElements.nth(i);
      const elementBox = await element.boundingBox();
      const viewportWidth = page.viewportSize()?.width || 1440;
      
      if (elementBox) {
        // Long text should wrap and not exceed viewport
        expect(elementBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
  });

  test('should maintain consistent navigation behavior', async ({ page }) => {
    const navigationItems = ['Dashboard', 'Listings', 'Orders', 'Customers'];
    
    for (const item of navigationItems) {
      // Click navigation item
      await page.click(`text=${item}`);
      await page.waitForLoadState('networkidle');
      
      // Check URL is correct
      const expectedUrl = item.toLowerCase() === 'dashboard' ? '/dashboard' : `/${item.toLowerCase()}`;
      await expect(page).toHaveURL(expectedUrl);
      
      // Check page title is correct
      await expect(page.locator('h1')).toContainText(item);
      
      // Check navigation item is highlighted
      const navItem = page.locator(`text=${item}`).locator('..');
      const navClasses = await navItem.getAttribute('class');
      expect(navClasses).toContain('bg-accent'); // or similar active class
    }
  });

  test('should handle loading states consistently', async ({ page }) => {
    // Navigate to a page that might have loading states
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    
    // Check for loading indicators
    const loadingIndicators = page.locator('[data-testid*="loading"], .animate-pulse, .loading');
    const loadingCount = await loadingIndicators.count();
    
    if (loadingCount > 0) {
      // Loading indicators should be visible and properly styled
      for (let i = 0; i < loadingCount; i++) {
        const indicator = loadingIndicators.nth(i);
        await expect(indicator).toBeVisible();
        
        const indicatorStyles = await indicator.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            opacity: styles.opacity,
            animation: styles.animation
          };
        });
        
        // Should have loading animation or opacity
        expect(indicatorStyles.opacity !== '0' || indicatorStyles.animation !== 'none').toBeTruthy();
      }
    }
  });
});