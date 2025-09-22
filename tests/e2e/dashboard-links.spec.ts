import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3005";

test.describe("Dashboard links/CTAs", () => {
  test("quick actions navigate", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    
    // sanity: no overlay stealing clicks
    const over = await page.evaluate(() => {
      const el = document.elementFromPoint(window.innerWidth/2, 120) as HTMLElement | null;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { 
        tag: el.tagName, 
        id: el.id, 
        cls: el.className, 
        pe: cs.pointerEvents, 
        z: cs.zIndex 
      };
    });
    
    expect(over && !(over.pe === "auto" && /overlay|backdrop|mask/i.test(String(over.cls)))).toBeTruthy();

    // Test quick action navigation
    await page.getByTestId("qa-view-customers").click();
    await expect(page).toHaveURL(/\/customers/);
    await page.goBack();
    
    await page.getByTestId("qa-view-reports").click();
    await expect(page).toHaveURL(/\/reports/);
    await page.goBack();
    
    await page.getByTestId("qa-social").click();
    await expect(page).toHaveURL(/\/social/);
    await page.goBack();
  });

  test("metric cards are clickable", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    
    // Check that metric cards are visible and have proper structure
    const metricCards = page.locator('[data-testid="metric-card"]');
    await expect(metricCards).toHaveCount(4);
    
    // Verify cards have proper heights
    const firstCard = metricCards.first();
    await expect(firstCard).toBeVisible();
    
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.height).toBeGreaterThan(150); // Should be at least 150px tall
  });

  test("recent orders view all button works", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    
    // Test the "View All Orders" button
    const viewAllButton = page.getByTestId("btn-view-orders");
    await expect(viewAllButton).toBeVisible();
    await viewAllButton.click();
    await expect(page).toHaveURL(/\/orders/);
  });

  test("no full-width overlay blocking clicks", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState("networkidle");
    
    // Check multiple points across the page for overlays
    const overlayCheck = await page.evaluate(() => {
      const points = [
        { x: window.innerWidth / 2, y: 120 },
        { x: window.innerWidth / 4, y: 200 },
        { x: (window.innerWidth * 3) / 4, y: 200 },
        { x: window.innerWidth / 2, y: 300 }
      ];
      
      return points.map(point => {
        const el = document.elementFromPoint(point.x, point.y) as HTMLElement | null;
        if (!el) return null;
        
        const cs = getComputedStyle(el);
        return {
          point,
          tag: el.tagName,
          id: el.id,
          className: el.className,
          position: cs.position,
          zIndex: cs.zIndex,
          pointerEvents: cs.pointerEvents,
          isOverlay: cs.position === "fixed" || cs.position === "absolute"
        };
      });
    });
    
    // Log overlay check results
    console.log("Overlay check results:", overlayCheck);
    
    // Ensure no problematic overlays
    const problematicOverlays = overlayCheck.filter(result => 
      result && 
      result.isOverlay && 
      result.pointerEvents === "auto" && 
      !/topbar|sidebar|dropdown|modal|dialog/i.test(result.className)
    );
    
    expect(problematicOverlays).toHaveLength(0);
  });
});
