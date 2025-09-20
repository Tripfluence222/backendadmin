import { expect, Locator, Page } from "@playwright/test";

export async function dismissOverlays(page: Page) {
  // Try common Next/Dev overlays
  await page.evaluate(() => {
    const kill = (sel: string) => document.querySelectorAll(sel).forEach(el => (el as HTMLElement).style.display = "none");
    kill('[data-nextjs-dialog]');      // Next error dialog
    kill('#nextjs__container');        // Legacy overlay container
    kill('nextjs-portal, [data-nextjs-toast]'); // toasts/portals
  }).catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
}

export async function smartClick(target: Locator) {
  await target.scrollIntoViewIfNeeded();
  try {
    await target.click({ timeout: 2000 });
    return;
  } catch {}
  try {
    await target.click({ trial: true, timeout: 1500 });
    await target.click({ timeout: 1500 });
    return;
  } catch {}
  await target.click({ force: true, timeout: 1500 });
}

export async function expectEffect(opts: {
  page: Page;
  before?: () => Promise<any>;
  action: () => Promise<any>;
  after?: () => Promise<any>;
  timeoutMs?: number;
}) {
  const { page, before, action, after, timeoutMs = 2500 } = opts;
  const urlBefore = page.url();
  if (before) await before();

  const promises: Promise<any>[] = [
    page.waitForEvent("framenavigated").catch(() => {}),
    page.getByRole("dialog").first().waitFor({ state: "visible", timeout: timeoutMs }).catch(() => {}),
    page.getByRole("status").first().waitFor({ state: "visible", timeout: timeoutMs }).catch(() => {}),
    page.locator('[data-sonner-toast], [role="alert"]').first().waitFor({ state: "visible", timeout: timeoutMs }).catch(() => {}),
  ];

  await action();

  const settled = await Promise.race([
    Promise.all(promises),
    page.waitForTimeout(timeoutMs),
  ]);

  const urlAfter = page.url();
  const navigated = urlAfter !== urlBefore;
  const dialogVisible = await page.getByRole("dialog").first().isVisible().catch(() => false);
  const toastVisible = await page.locator('[data-sonner-toast], [role="status"], [role="alert"]').first().isVisible().catch(() => false);

  if (after) await after();

  expect(navigated || dialogVisible || toastVisible).toBeTruthy();
}
