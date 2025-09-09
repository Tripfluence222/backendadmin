import { Page, expect } from '@playwright/test';

export async function gotoAndWait(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

export async function expectVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

export async function fillRHFInput(page: Page, labelText: string, value: string) {
  const input = page.getByLabel(labelText);
  await input.fill(value);
}

export async function setDateByPlaceholder(page: Page, placeholder: string, isoString: string) {
  const input = page.getByPlaceholder(placeholder);
  await input.fill(isoString);
}

export async function mockApi(page: Page, route: string, status: number, json: any) {
  await page.route(`**${route}`, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(json)
    });
  });
}

export async function selectShadcnCombobox(page: Page, triggerLabel: string, optionText: string) {
  const trigger = page.getByRole('combobox', { name: triggerLabel });
  await trigger.click();
  await page.getByRole('option', { name: optionText }).click();
}

export async function openKebabAction(page: Page, rowText: string, actionLabel: string) {
  const row = page.getByRole('row', { name: rowText });
  const kebabButton = row.getByRole('button', { name: /actions/i });
  await kebabButton.click();
  await page.getByRole('menuitem', { name: actionLabel }).click();
}

export async function uploadMockFile(page: Page, inputSelector: string, fileName: string = 'test-image.jpg') {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles({
    name: fileName,
    mimeType: 'image/jpeg',
    buffer: Buffer.from('mock-image-data')
  });
}

export async function waitForToast(page: Page, message: string) {
  await expect(page.getByText(message)).toBeVisible();
}

export async function getBoundingBox(page: Page, selector: string) {
  return await page.locator(selector).boundingBox();
}

export async function isOverlapping(box1: any, box2: any): Promise<boolean> {
  if (!box1 || !box2) return false;
  
  return !(
    box1.x + box1.width <= box2.x ||
    box2.x + box2.width <= box1.x ||
    box1.y + box1.height <= box2.y ||
    box2.y + box2.height <= box1.y
  );
}
