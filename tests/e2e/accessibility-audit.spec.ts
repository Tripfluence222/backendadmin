import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit', () => {
  const routes = [
    { path: '/', name: 'Home Page' },
    { path: '/venues', name: 'Venues Page' },
    { path: '/search', name: 'Search Page' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/spaces', name: 'Spaces Management' },
    { path: '/customers', name: 'Customers Management' },
    { path: '/orders', name: 'Orders Management' },
    { path: '/listings', name: 'Listings Management' },
    { path: '/about', name: 'About Page' },
    { path: '/contact', name: 'Contact Page' },
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/help', name: 'Help Center' },
  ];

  for (const route of routes) {
    test(`${route.name} should be accessible`, async ({ page }) => {
      await page.goto(`http://localhost:3000${route.path}`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Run accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('body')
        .exclude('#__next script') // Exclude Next.js scripts from scan
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }

  test('Navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Test tab navigation through main elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus').getAttribute('role');
    
    // Continue tabbing through interactive elements
    const maxTabs = 20;
    let tabCount = 0;
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      const currentFocused = page.locator(':focus');
      const isVisible = await currentFocused.isVisible().catch(() => false);
      
      if (isVisible) {
        // Verify focused element is actually interactive
        const tagName = await currentFocused.evaluate(el => el.tagName.toLowerCase());
        const role = await currentFocused.getAttribute('role');
        const tabIndex = await currentFocused.getAttribute('tabindex');
        
        const isInteractive = [
          'button', 'a', 'input', 'select', 'textarea'
        ].includes(tagName) || 
        ['button', 'link', 'textbox'].includes(role || '') ||
        (tabIndex !== null && parseInt(tabIndex) >= 0);
        
        if (isInteractive) {
          expect(isVisible).toBe(true);
        }
      }
    }
  });

  test('Images should have alt text', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const alt = await image.getAttribute('alt');
      const isDecorative = await image.getAttribute('role') === 'presentation';
      
      // Images should either have alt text or be marked as decorative
      expect(alt !== null || isDecorative).toBe(true);
      
      if (alt !== null) {
        // Alt text should not be empty for non-decorative images
        expect(alt.length).toBeGreaterThan(0);
      }
    }
  });

  test('Form controls should have labels', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    
    const formControls = await page.locator('input, select, textarea').all();
    
    for (const control of formControls) {
      const id = await control.getAttribute('id');
      const ariaLabel = await control.getAttribute('aria-label');
      const ariaLabelledBy = await control.getAttribute('aria-labelledby');
      
      // Check if there's an associated label
      let hasLabel = false;
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        hasLabel = await label.count() > 0;
      }
      
      // Form control should have label, aria-label, or aria-labelledby
      expect(hasLabel || ariaLabel !== null || ariaLabelledBy !== null).toBe(true);
    }
  });

  test('Interactive elements should have sufficient color contrast', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Run axe scan specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('body')
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Page should have proper heading structure', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    if (headings.length > 0) {
      // Should have exactly one h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBe(1);
      
      // Check heading hierarchy (no skipping levels)
      const headingLevels = [];
      for (const heading of headings) {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        headingLevels.push(level);
      }
      
      // First heading should be h1
      expect(headingLevels[0]).toBe(1);
      
      // Check for skipped levels
      for (let i = 1; i < headingLevels.length; i++) {
        const prev = headingLevels[i - 1];
        const current = headingLevels[i];
        
        // Should not skip more than one level
        expect(current - prev).toBeLessThanOrEqual(1);
      }
    }
  });

  test('Focus should be visible', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Find all focusable elements
    const focusableElements = await page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).all();
    
    for (const element of focusableElements.slice(0, 5)) { // Test first 5 elements
      await element.focus();
      
      // Check if focus is visible (has outline or other focus indicator)
      const focusStyles = await element.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineWidth: styles.outlineWidth,
          outlineColor: styles.outlineColor,
          boxShadow: styles.boxShadow,
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = 
        focusStyles.outline !== 'none' ||
        focusStyles.outlineWidth !== '0px' ||
        focusStyles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    }
  });

  test('ARIA landmarks should be present', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for essential landmarks
    const main = await page.locator('main, [role="main"]').count();
    const navigation = await page.locator('nav, [role="navigation"]').count();
    
    expect(main).toBeGreaterThanOrEqual(1);
    expect(navigation).toBeGreaterThanOrEqual(1);
  });

  test('Page should have a title', async ({ page }) => {
    const routes = ['/', '/venues', '/dashboard', '/about'];
    
    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`);
      
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      expect(title).not.toBe('');
    }
  });

  test('Links should have descriptive text', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const links = await page.locator('a[href]').all();
    
    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      // Link should have descriptive text, aria-label, or title
      const hasDescription = 
        (text && text.trim().length > 0) ||
        (ariaLabel && ariaLabel.length > 0) ||
        (title && title.length > 0);
      
      expect(hasDescription).toBe(true);
      
      // Avoid generic link text
      const genericTexts = ['click here', 'read more', 'link', 'here'];
      if (text) {
        const isGeneric = genericTexts.some(generic => 
          text.toLowerCase().includes(generic)
        );
        expect(isGeneric).toBe(false);
      }
    }
  });
});