import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Additional buffer
  }

  /**
   * Navigate to a page and wait for it to load
   */
  async navigateToPage(path: string) {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Fill a form field with error handling
   */
  async fillField(selector: string, value: string) {
    const field = this.page.locator(selector);
    await expect(field).toBeVisible();
    await field.clear();
    await field.fill(value);
  }

  /**
   * Click a button with error handling
   */
  async clickButton(text: string) {
    const button = this.page.locator('button').filter({ hasText: text });
    await expect(button).toBeVisible();
    await button.click();
  }

  /**
   * Select an option from a dropdown
   */
  async selectDropdownOption(dropdownSelector: string, optionText: string) {
    await this.page.click(dropdownSelector);
    await this.page.click(`text=${optionText}`);
  }

  /**
   * Upload a file with mock data
   */
  async uploadFile(inputSelector: string, fileName: string, mimeType: string = 'image/jpeg') {
    const fileInput = this.page.locator(inputSelector);
    await fileInput.setInputFiles({
      name: fileName,
      mimeType: mimeType,
      buffer: Buffer.from('mock-file-data')
    });
  }

  /**
   * Wait for a modal to appear
   */
  async waitForModal() {
    await this.page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    return this.page.locator('[role="dialog"]');
  }

  /**
   * Close a modal
   */
  async closeModal() {
    const modal = this.page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      const closeButton = modal.locator('button').filter({ hasText: /Close|Cancel/i });
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        // Try pressing Escape key
        await this.page.keyboard.press('Escape');
      }
    }
  }

  /**
   * Wait for a success message
   */
  async waitForSuccessMessage(message?: string) {
    const successSelector = message 
      ? `text=${message}` 
      : '[data-testid="success-message"], .text-green-600, .text-success';
    
    await this.page.waitForSelector(successSelector, { timeout: 5000 });
  }

  /**
   * Wait for a loading state to finish
   */
  async waitForLoadingToFinish() {
    // Wait for loading indicators to disappear
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid*="loading"], .animate-pulse, .loading');
      return loadingElements.length === 0;
    }, { timeout: 10000 });
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Mock an API endpoint
   */
  async mockApiEndpoint(url: string, response: any, status: number = 200) {
    await this.page.route(`**${url}`, async route => {
      await route.fulfill({
        status: status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Check if element is visible and has correct text
   */
  async expectElementWithText(selector: string, expectedText: string) {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toContainText(expectedText);
  }

  /**
   * Check table headers
   */
  async expectTableHeaders(expectedHeaders: string[]) {
    for (const header of expectedHeaders) {
      await expect(this.page.locator('th').filter({ hasText: header })).toBeVisible();
    }
  }

  /**
   * Check if a row exists in a table
   */
  async expectTableRow(expectedText: string) {
    await expect(this.page.locator('td').filter({ hasText: expectedText })).toBeVisible();
  }

  /**
   * Handle mobile viewport testing
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(500);
  }

  /**
   * Handle desktop viewport testing
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1440, height: 900 });
    await this.page.waitForTimeout(500);
  }

  /**
   * Toggle dark mode
   */
  async toggleDarkMode() {
    const themeToggle = this.page.locator('button').filter({ hasText: /Toggle theme/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Wait for download to complete
   */
  async waitForDownload() {
    return await this.page.waitForEvent('download');
  }

  /**
   * Check if sidebar is collapsed on mobile
   */
  async expectSidebarCollapsed() {
    const sidebar = this.page.locator('nav').first();
    const sidebarClasses = await sidebar.getAttribute('class');
    expect(sidebarClasses).toContain('-translate-x-full');
  }

  /**
   * Check if sidebar is expanded
   */
  async expectSidebarExpanded() {
    const sidebar = this.page.locator('nav').first();
    const sidebarClasses = await sidebar.getAttribute('class');
    expect(sidebarClasses).toContain('translate-x-0');
  }

  /**
   * Click hamburger menu to expand sidebar
   */
  async expandSidebar() {
    const hamburgerMenu = this.page.locator('button').filter({ hasText: /Toggle sidebar/i });
    await expect(hamburgerMenu).toBeVisible();
    await hamburgerMenu.click();
    await this.page.waitForTimeout(500);
  }
}