import { test, expect } from "@playwright/test";
import { dismissOverlays, smartClick, expectEffect } from "./_utils/ui";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:4000";

const ROUTES = [
  "/dashboard",
  "/listings",
  "/orders",
  "/spaces",
  "/availability",
  "/widgets",
  "/social",
  "/event-sync",
  "/reports",
  "/reviews",
  "/marketing",
  "/integrations",
  "/settings",
  "/venues",
  "/search",
];

test.describe.configure({ mode: "serial" });

test("Dead-click audit across primary routes", async ({ page }, testInfo) => {
  const failures: Array<{selector: string; text: string; href: string; url: string; reason: string;}> = [];
  
  for (const route of ROUTES) {
    try {
      await page.goto(`${BASE}${route}`);
      await dismissOverlays(page);
      await page.waitForLoadState('networkidle');

      const btns = page.locator('button:visible:not([disabled]), [role="button"]:visible');
      const links = page.locator('a:visible[href]');
      const candidates = (await btns.all()).slice(0, 15).concat((await links.all()).slice(0, 10)); // cap per page

      for (const el of candidates) {
        const text = (await el.innerText().catch(() => ""))?.trim().slice(0, 60);
        const href = await el.getAttribute("href").catch(() => "") || "";
        const selector = await el.evaluate((n) => (n as HTMLElement).outerHTML.slice(0, 120)).catch(() => "<node>");
        
        try {
          await expectEffect({
            page,
            action: () => smartClick(el),
            timeoutMs: 2500,
          });
        } catch (e: any) {
          failures.push({ 
            selector, 
            text, 
            href, 
            url: page.url(), 
            reason: e?.message?.slice(0, 120) || "no visible effect" 
          });
        }
        
        // go back if we navigated
        if (page.url() !== `${BASE}${route}`) {
          await page.goBack().catch(() => {});
          await dismissOverlays(page);
          await page.waitForLoadState('networkidle');
        }
      }
    } catch (error) {
      failures.push({
        selector: "page-load",
        text: route,
        href: "",
        url: `${BASE}${route}`,
        reason: `Failed to load page: ${error}`
      });
    }
  }

      if (failures.length) {
        const header = "selector,text,href,url,reason\n";
        const rows = failures.map(f =>
          `"${f.selector.replace(/"/g,'\"')}","${(f.text||'').replace(/"/g,'\"')}","${f.href}","${f.url}","${f.reason.replace(/"/g,'\"')}"`).join("\n");
        const csv = header + rows + "\n";
        const outDir = testInfo.outputDir;
        
        // Ensure the output directory exists
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        
        fs.writeFileSync(`${outDir}/deadclick-report.csv`, csv, "utf-8");
    
    // Also log to console for immediate feedback
    console.log(`\n🚨 Found ${failures.length} dead clicks:`);
    failures.forEach(f => {
      console.log(`  - ${f.text || 'No text'} (${f.url}): ${f.reason}`);
    });
  }
  
  // Assert that we found no dead clicks
  expect(failures.length).toBe(0);
});
