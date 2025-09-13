import { Page, expect } from "@playwright/test";

export async function getBox(page: Page, selector: string) {
  const el = page.locator(selector).first();
  await expect(el).toBeVisible();
  const box = await el.boundingBox();
  expect(box, `No bounding box for ${selector}`).toBeTruthy();
  return box!;
}

export function noOverlap(a: {x:number;y:number;width:number;height:number}, b:{x:number;y:number;width:number;height:number}, pad=0) {
  const ax2 = a.x + a.width, ay2 = a.y + a.height;
  const bx2 = b.x + b.width, by2 = b.y + b.height;
  const sep = (ax2 + pad <= b.x) || (bx2 + pad <= a.x) || (ay2 + pad <= b.y) || (by2 + pad <= a.y);
  expect(sep, "Elements overlap unexpectedly").toBeTruthy();
}

export function equalHeights(boxes: {height:number}[], tol=2) {
  const hs = boxes.map(b => Math.round(b.height));
  const min = Math.min(...hs), max = Math.max(...hs);
  expect(max - min, `Heights vary more than ${tol}px: ${hs.join(",")}`).toBeLessThanOrEqual(tol);
}

export function withinGrid(n: number, base=8, tol=1) {
  const r = Math.abs(n % base);
  const ok = r <= tol || Math.abs(r - base) <= tol;
  expect(ok, `Value ${n} not aligned to ${base}px grid (±${tol})`).toBeTruthy();
}

export async function assertContrastOK(page: Page, selector: string) {
  const el = page.locator(selector).first();
  await expect(el).toBeVisible();
  const color = await el.evaluate((node) => getComputedStyle(node as HTMLElement).color);
  const bg = await el.evaluate((node) => getComputedStyle(node as HTMLElement).backgroundColor);
  // Simple check: avoid low-contrast gray-on-gray; defer full WCAG to axe later
  expect(color !== bg, "Text and background colors identical (low contrast)").toBeTruthy();
}
