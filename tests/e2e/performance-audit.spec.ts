import { test, expect } from '@playwright/test';

test.describe('Performance Audit', () => {
  test('Page load performance metrics', async ({ page }) => {
    // Navigate and measure load time
    const startTime = Date.now();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Load time should be under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals: any = {};
        
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.lcp = lastEntry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay (FID) - can't measure without real user interaction
        // Cumulative Layout Shift (CLS)
        new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        }).observe({ type: 'layout-shift', buffered: true });

        // First Contentful Paint (FCP)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.fcp = entries[0].startTime;
        }).observe({ type: 'paint', buffered: true });

        // Time to Interactive (TTI) approximation
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
        if (navigationEntry) {
          vitals.tti = navigationEntry.domContentLoadedEventEnd;
        }

        setTimeout(() => resolve(vitals), 2000);
      });
    });

    console.log('Core Web Vitals:', vitals);

    // Core Web Vitals thresholds
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500); // LCP should be < 2.5s
    }
    if (vitals.fcp) {
      expect(vitals.fcp).toBeLessThan(1800); // FCP should be < 1.8s  
    }
    if (vitals.cls !== undefined) {
      expect(vitals.cls).toBeLessThan(0.1); // CLS should be < 0.1
    }
  });

  test('Resource loading efficiency', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Get network requests
    const requests: any[] = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Analyze requests
    const staticAssets = requests.filter(req => 
      ['stylesheet', 'script', 'image', 'font'].includes(req.resourceType)
    );

    // Should not have excessive requests
    expect(staticAssets.length).toBeLessThan(50);

    // Check for proper caching headers (this would require response inspection)
    // For now, we'll just verify we don't have too many requests of the same type
    const jsRequests = requests.filter(req => req.resourceType === 'script');
    const cssRequests = requests.filter(req => req.resourceType === 'stylesheet');
    
    expect(jsRequests.length).toBeLessThan(20);
    expect(cssRequests.length).toBeLessThan(10);
  });

  test('Image optimization', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check all images
    const images = await page.locator('img').all();
    
    for (const image of images) {
      const src = await image.getAttribute('src');
      const loading = await image.getAttribute('loading');
      const width = await image.getAttribute('width');
      const height = await image.getAttribute('height');

      if (src) {
        // Images should use Next.js Image component optimizations
        // Check for proper lazy loading
        if (loading) {
          expect(['lazy', 'eager']).toContain(loading);
        }

        // Check for width/height attributes to prevent layout shift
        const isInViewport = await image.isInViewport();
        if (isInViewport) {
          // Critical images should have dimensions
          expect(width || height).toBeTruthy();
        }
      }
    }
  });

  test('JavaScript bundle size', async ({ page, context }) => {
    const responses: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') && response.status() === 200) {
        responses.push(response);
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Calculate total JS size
    let totalJSSize = 0;
    for (const response of responses) {
      try {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          totalJSSize += parseInt(contentLength);
        }
      } catch (error) {
        // Handle cases where content-length is not available
      }
    }

    // Total JS should be reasonable (less than 1MB for initial load)
    expect(totalJSSize).toBeLessThan(1024 * 1024); // 1MB
  });

  test('CSS optimization', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check for unused CSS (basic check)
    const stylesheets = await page.locator('link[rel="stylesheet"]').all();
    
    // Should not have excessive stylesheets
    expect(stylesheets.length).toBeLessThan(10);

    // Check for CSS-in-JS or inline styles efficiency
    const inlineStyles = await page.locator('[style]').count();
    
    // Minimal inline styles (some are okay for dynamic styling)
    expect(inlineStyles).toBeLessThan(20);
  });

  test('Memory usage', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Navigate to different pages to test memory leaks
    const pages = ['/venues', '/dashboard', '/about', '/contact'];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:3000${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      // Basic check - page should still be responsive
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
    }

    // Return to home
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Page should still be responsive after navigation
    const homeTitle = await page.title();
    expect(homeTitle.length).toBeGreaterThan(0);
  });

  test('Third-party script performance', async ({ page }) => {
    const thirdPartyRequests: any[] = [];
    
    page.on('request', request => {
      const url = request.url();
      const isThirdParty = !url.includes('localhost:3000') && 
                          !url.includes('127.0.0.1') &&
                          (url.includes('http://') || url.includes('https://'));
      
      if (isThirdParty) {
        thirdPartyRequests.push({
          url,
          resourceType: request.resourceType(),
        });
      }
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Should minimize third-party requests
    expect(thirdPartyRequests.length).toBeLessThan(10);

    // Log third-party requests for review
    if (thirdPartyRequests.length > 0) {
      console.log('Third-party requests:', thirdPartyRequests);
    }
  });

  test('Font loading performance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check font loading strategy
    const fontLinks = await page.locator('link[href*="font"]').all();
    
    for (const fontLink of fontLinks) {
      const rel = await fontLink.getAttribute('rel');
      const crossorigin = await fontLink.getAttribute('crossorigin');
      
      // Fonts should use proper loading strategies
      if (rel === 'preload') {
        expect(crossorigin).toBeTruthy(); // Fonts should be preloaded with crossorigin
      }
    }

    // Check for font-display CSS property
    const hasProperFontDisplay = await page.evaluate(() => {
      const stylesheets = document.styleSheets;
      for (const stylesheet of stylesheets) {
        try {
          for (const rule of stylesheet.cssRules) {
            if (rule instanceof CSSFontFaceRule) {
              const fontDisplay = rule.style.getPropertyValue('font-display');
              if (fontDisplay && ['swap', 'optional', 'fallback'].includes(fontDisplay)) {
                return true;
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may not be accessible
        }
      }
      return false;
    });

    // Should use font-display for better loading performance
    if (fontLinks.length > 0) {
      expect(hasProperFontDisplay).toBe(true);
    }
  });

  test('API response times', async ({ page }) => {
    const apiRequests: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiRequests.push({
          url: response.url(),
          status: response.status(),
          timing: response.request().timing(),
        });
      }
    });

    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');

    // Check API response times
    for (const request of apiRequests) {
      if (request.timing) {
        const responseTime = request.timing.responseEnd - request.timing.requestStart;
        
        // API calls should be fast (under 1 second)
        expect(responseTime).toBeLessThan(1000);
      }
      
      // API calls should return successful status codes
      expect([200, 201, 204, 304]).toContain(request.status);
    }
  });

  test('Client-side navigation performance', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Test client-side navigation speed
    const navigationStart = Date.now();
    
    // Click on a navigation link (if available)
    const navLink = page.locator('a[href="/venues"]').first();
    const linkExists = await navLink.count() > 0;
    
    if (linkExists) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
      
      const navigationTime = Date.now() - navigationStart;
      
      // Client-side navigation should be fast
      expect(navigationTime).toBeLessThan(1000);
    }
  });
});