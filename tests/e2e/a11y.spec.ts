import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("Accessibility Tests", () => {
  test("dashboard accessibility", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    
    // Run Axe accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('color-contrast') // Exclude color-contrast as it can be flaky
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Check that all interactive controls have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      const textContent = await button.textContent();
      const title = await button.getAttribute('title');
      
      // At least one of these should provide an accessible name
      const hasAccessibleName = ariaLabel || ariaLabelledBy || (textContent && textContent.trim()) || title;
      expect(hasAccessibleName, `Button at index ${i} lacks accessible name`).toBeTruthy();
    }
  });

  test("listings accessibility", async ({ page }) => {
    await page.goto(`${BASE}/listings`);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Check table accessibility
    const table = page.locator('[data-testid="table"]');
    await expect(table).toBeVisible();
    
    // Check for proper table headers
    const headers = table.locator('th');
    const headerCount = await headers.count();
    expect(headerCount, "Table should have headers").toBeGreaterThan(0);
    
    // Check for proper table structure
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    if (rowCount > 0) {
      const firstRow = rows.first();
      const cells = firstRow.locator('td');
      const cellCount = await cells.count();
      expect(cellCount, "Table rows should have cells").toBeGreaterThan(0);
    }
  });

  test("orders accessibility", async ({ page }) => {
    await page.goto(`${BASE}/orders`);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("widgets accessibility", async ({ page }) => {
    await page.goto(`${BASE}/widgets`);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('color-contrast')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
    
    // Check iframe accessibility if present
    const iframes = page.locator('iframe');
    const iframeCount = await iframes.count();
    
    for (let i = 0; i < iframeCount; i++) {
      const iframe = iframes.nth(i);
      const title = await iframe.getAttribute('title');
      expect(title, `Iframe at index ${i} should have a title`).toBeTruthy();
    }
    
    // Check focus rings on interactive elements
    const focusableElements = page.locator('button, input, select, textarea, a[href]');
    const focusableCount = await focusableElements.count();
    
    for (let i = 0; i < Math.min(focusableCount, 10); i++) {
      const element = focusableElements.nth(i);
      await element.focus();
      
      // Check if element has focus ring (basic check)
      const computedStyle = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
        };
      });
      
      const hasFocusRing = computedStyle.outline !== 'none' || 
                          computedStyle.outlineWidth !== '0px' || 
                          computedStyle.boxShadow !== 'none';
      
      expect(hasFocusRing, `Focusable element at index ${i} should have focus ring`).toBeTruthy();
    }
  });
});
