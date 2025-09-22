import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3005";

test.describe("Dashboard Layout Alignment", () => {
  test("dashboard spacing sane under topbar (no huge gap)", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    
    // Wait for the page to load
    await page.waitForLoadState("networkidle");
    
    const tb = await page.locator('[data-testid="topbar"]').boundingBox();
    const cont = await page.locator('[data-testid="dashboard-container"]').boundingBox();
    
    expect(tb && cont).toBeTruthy();
    
    if (tb && cont) {
      const gap = cont.y - (tb.y + tb.height);
      // allow ≤ 24px; fail if 48px+
      expect(gap).toBeLessThanOrEqual(24);
      
      // Log the actual gap for debugging
      console.log(`Topbar height: ${tb.height}, Gap: ${gap}px`);
    }
    
    // cards fill the row with similar heights
    const cards = page.locator('[data-testid="metric-card"]');
    await expect(cards.first()).toBeVisible();
    
    const cardBoxes = await Promise.all(
      (await cards.elementHandles()).map(h => h.boundingBox())
    );
    
    const heights = cardBoxes
      .filter(Boolean)
      .map(b => Math.round(b!.height));
    
    if (heights.length > 0) {
      const spread = Math.max(...heights) - Math.min(...heights);
      expect(spread).toBeLessThanOrEqual(8);
      
      // Log card heights for debugging
      console.log(`Card heights: ${heights.join(', ')}, Spread: ${spread}px`);
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== "failed") return;
    
    const tb = await page.locator('[data-testid="topbar"]').boundingBox();
    const cont = await page.locator('[data-testid="dashboard-container"]').boundingBox();
    console.log("TOPBAR", tb, "CONTAINER", cont);
    
    // Take a screenshot for debugging
    await page.screenshot({ 
      path: `test-results/alignment-failure-${Date.now()}.png`,
      fullPage: true 
    });
  });
});