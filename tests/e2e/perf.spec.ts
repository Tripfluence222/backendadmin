import { test, expect } from "@playwright/test";
import { chromium } from "playwright";
import { chromium as lighthouseChromium } from "lighthouse";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("Performance Tests", () => {
  test("lighthouse performance audit", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run Lighthouse audit
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page2 = await context.newPage();
    
    const lighthouse = await lighthouseChromium.launch();
    const result = await lighthouse.run({
      url: `${BASE}/dashboard`,
      port: new URL(lighthouse.wsEndpoint()).port,
    });
    
    await lighthouse.close();
    await browser.close();
    
    // Assert Lighthouse scores
    const scores = result.lhr.categories;
    expect(scores.performance.score * 100, "Performance score should be >= 80").toBeGreaterThanOrEqual(80);
    expect(scores.accessibility.score * 100, "Accessibility score should be >= 90").toBeGreaterThanOrEqual(90);
    expect(scores['best-practices'].score * 100, "Best practices score should be >= 90").toBeGreaterThanOrEqual(90);
    expect(scores.seo.score * 100, "SEO score should be >= 90").toBeGreaterThanOrEqual(90);
  });

  test("core web vitals", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    expect(lcp, "LCP should be < 2.5s").toBeLessThan(2500);
    
    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
        
        // Resolve after 5 seconds
        setTimeout(() => resolve(clsValue), 5000);
      });
    });
    
    expect(cls, "CLS should be < 0.1").toBeLessThan(0.1);
  });

  test("javascript bundle size", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    
    // Get all script resources
    const scripts = await page.evaluate(() => {
      return Array.from(document.scripts).map(script => ({
        src: script.src,
        size: script.textContent?.length || 0
      }));
    });
    
    // Calculate total JS size (rough estimate)
    const totalJSSize = scripts.reduce((total, script) => total + script.size, 0);
    const maxJSSize = 350 * 1024; // 350KB
    
    expect(totalJSSize, `JS transfer should be < ${maxJSSize / 1024}KB`).toBeLessThan(maxJSSize);
  });
});
