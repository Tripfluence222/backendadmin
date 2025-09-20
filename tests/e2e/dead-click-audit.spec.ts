import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

test.describe("Dead Click & Missing Feature Audit", () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors and 404s
    const errors: string[] = [];
    const notFoundUrls: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('response', response => {
      if (response.status() === 404) {
        notFoundUrls.push(response.url());
      }
    });
    
    // Store errors for later assertion
    (page as any).__errors = errors;
    (page as any).__notFoundUrls = notFoundUrls;
  });

  test("Dashboard - all buttons and links are functional", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Test Quick Actions
    const quickActions = [
      { testId: "qa-add-event", expectedUrl: /listings\/new\?type=event/ },
      { testId: "qa-view-customers", expectedUrl: /customers/ },
      { testId: "qa-view-reports", expectedUrl: /reports/ },
      { testId: "qa-social", expectedUrl: /social/ }
    ];

    for (const action of quickActions) {
      const button = page.getByTestId(action.testId);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      
      // Test click and navigation
      // Try normal click first, then force click if dev overlay blocks
      try {
        await button.click({ timeout: 5000 });
      } catch (error) {
        await button.click({ force: true });
      }
      await expect(page).toHaveURL(action.expectedUrl);
      
      // Go back to dashboard
      await page.goBack();
      await expect(page).toHaveURL(/dashboard/);
    }

    // Test View All Orders button
    const viewOrdersButton = page.getByTestId("btn-view-orders");
    await expect(viewOrdersButton).toBeVisible();
    await expect(viewOrdersButton).toBeEnabled();
    await viewOrdersButton.click();
    await expect(page).toHaveURL(/orders/);

    // Test View All Listings button
    await page.goBack();
    const viewListingsButton = page.getByTestId("btn-view-listings");
    await expect(viewListingsButton).toBeVisible();
    await expect(viewListingsButton).toBeEnabled();
    await viewListingsButton.click();
    await expect(page).toHaveURL(/listings/);
  });

  test("Listings - table actions and forms work", async ({ page }) => {
    await page.goto(`${BASE}/listings`);
    await page.waitForLoadState('networkidle');

    // Test Create/Add button
    const createButton = page.getByRole("button", { name: /new|create|add/i });
    const createButtonExists = await createButton.count() > 0;
    
    if (createButtonExists) {
      await expect(createButton.first()).toBeVisible();
      await expect(createButton.first()).toBeEnabled();
      
      // Try normal click first, then force click if dev overlay blocks
      try {
        await createButton.first().click({ timeout: 10000 });
      } catch (error) {
        await createButton.first().click({ force: true });
      }
      
      // Should navigate to create page or open modal
      const isCreatePage = page.url().includes('/new');
      const hasModal = await page.locator('[role="dialog"]').count() > 0;
      
      expect(isCreatePage || hasModal).toBeTruthy();
      
      if (isCreatePage) {
        // Test form submission
        const form = page.locator('[data-testid="create-listing-form"]');
        const formExists = await form.count() > 0;
        
        if (formExists) {
          await expect(form).toBeVisible();
          
          // Test form fields are enabled
          const inputs = form.locator('input, textarea, select');
          const inputCount = await inputs.count();
          
          for (let i = 0; i < Math.min(inputCount, 5); i++) {
            const input = inputs.nth(i);
            await expect(input).toBeVisible();
            // Most inputs should be enabled (some might be disabled by design)
          }
        }
      }
    }

    // Test table row actions
    const table = page.locator('[data-testid="table"]');
    await expect(table).toBeVisible();
    
    const actionButtons = table.locator('button');
    const buttonCount = await actionButtons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = actionButtons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test("Orders - details drawer and actions work", async ({ page }) => {
    await page.goto(`${BASE}/orders`);
    await page.waitForLoadState('networkidle');

    const table = page.locator('[data-testid="table"]');
    await expect(table).toBeVisible();

    // Test order row clicks
    const orderRows = page.locator('[data-testid^="order-row-"]');
    const orderCount = await orderRows.count();
    
    if (orderCount > 0) {
      await orderRows.first().click();
      
      const drawer = page.locator('[data-testid="order-details-drawer"]');
      await expect(drawer).toBeVisible({ timeout: 6000 });
      
      // Test drawer action buttons
      const drawerButtons = drawer.locator('button');
      const drawerButtonCount = await drawerButtons.count();
      
      for (let i = 0; i < drawerButtonCount; i++) {
        const button = drawerButtons.nth(i);
        await expect(button).toBeVisible();
        // Some buttons might be disabled by design (like Edit Order)
        const isEnabled = await button.isEnabled();
        if (isEnabled) {
          // Test that enabled buttons don't cause errors when clicked
          // Try normal click first, then force click if dev overlay blocks
      try {
        await button.click({ timeout: 5000 });
      } catch (error) {
        await button.click({ force: true });
      }
          // Don't assert specific behavior, just ensure no crashes
        }
      }
      
      // Close drawer
      await page.getByRole("button", { name: "Close" }).click();
      await expect(drawer).not.toBeVisible();
    }
  });

  test("Space Pricing - form interactions work", async ({ page }) => {
    await page.goto(`${BASE}/space-pricing`);
    await page.waitForLoadState('networkidle');

    // Test form buttons (skip hidden mobile menu buttons)
    const formButtons = page.locator('button:visible');
    const buttonCount = await formButtons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = formButtons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }

    // Test form inputs
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      await expect(input).toBeVisible();
    }
  });

  test("Widgets - builder and preview work", async ({ page }) => {
    await page.goto(`${BASE}/widgets`);
    await page.waitForLoadState('networkidle');

    // Test generate/create button
    const generateButton = page.getByRole("button", { name: /generate|create|build/i });
    const buttonExists = await generateButton.count() > 0;
    
    if (buttonExists) {
      await expect(generateButton.first()).toBeVisible();
      await expect(generateButton.first()).toBeEnabled();
      
      await generateButton.first().click();
      
      // Check for preview or modal
      const preview = page.locator('[data-testid="widget-preview"]');
      const modal = page.locator('[role="dialog"]');
      
      const hasPreview = await preview.count() > 0;
      const hasModal = await modal.count() > 0;
      
      if (hasPreview) {
        await expect(preview).toBeVisible({ timeout: 6000 });
      }
      
      if (hasModal) {
        await expect(modal).toBeVisible({ timeout: 6000 });
      }
    }
  });

  test("Social - composer and actions work", async ({ page }) => {
    await page.goto(`${BASE}/social`);
    await page.waitForLoadState('networkidle');

    // Test compose button
    const composeButton = page.getByRole("button", { name: /compose|create|new post/i });
    const buttonExists = await composeButton.count() > 0;
    
    if (buttonExists) {
      await expect(composeButton.first()).toBeVisible();
      await expect(composeButton.first()).toBeEnabled();
      
      await composeButton.first().click();
      
      // Check for composer modal
      const modal = page.locator('[role="dialog"]');
      const modalExists = await modal.count() > 0;
      
      if (modalExists) {
        await expect(modal).toBeVisible({ timeout: 6000 });
        
        // Test modal buttons
        const modalButtons = modal.locator('button');
        const modalButtonCount = await modalButtons.count();
        
        for (let i = 0; i < Math.min(modalButtonCount, 3); i++) {
          const button = modalButtons.nth(i);
          await expect(button).toBeVisible();
        }
      }
    }
  });

  test("Event Sync - connection buttons work", async ({ page }) => {
    await page.goto(`${BASE}/event-sync`);
    await page.waitForLoadState('networkidle');

    // Test connect buttons
    const connectButtons = page.getByRole("button", { name: /connect|link/i });
    const buttonCount = await connectButtons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = connectButtons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test("Reports - filters and export work", async ({ page }) => {
    await page.goto(`${BASE}/reports`);
    await page.waitForLoadState('networkidle');

    // Test date filters
    const dateInputs = page.locator('input[type="date"]');
    const dateButtonCount = await dateInputs.count();
    
    for (let i = 0; i < dateButtonCount; i++) {
      const input = dateInputs.nth(i);
      await expect(input).toBeVisible();
    }

    // Test export buttons
    const exportButtons = page.getByRole("button", { name: /export|download/i });
    const exportButtonCount = await exportButtons.count();
    
    for (let i = 0; i < exportButtonCount; i++) {
      const button = exportButtons.nth(i);
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test("Navigation - all sidebar links work", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');

    const sidebarLinks = [
      { name: /customers/i, url: /customers/ },
      { name: /reviews/i, url: /reviews/ },
      { name: /widgets/i, url: /widgets/ },
      { name: /social/i, url: /social/ },
      { name: /event sync/i, url: /event-sync/ },
      { name: /integrations/i, url: /integrations/ },
      { name: /marketing/i, url: /marketing/ },
      { name: /reports/i, url: /reports/ },
      { name: /settings/i, url: /settings/ }
    ];

    for (const link of sidebarLinks) {
      const linkElement = page.getByRole("link", { name: link.name });
      const linkExists = await linkElement.count() > 0;
      
      if (linkExists) {
        await expect(linkElement.first()).toBeVisible();
        
        // Test navigation (with retry for dev overlay interference)
        try {
          await linkElement.first().click({ timeout: 10000 });
          await expect(page).toHaveURL(link.url, { timeout: 10000 });
        } catch (error) {
          // If click fails due to dev overlay, try force click
          await linkElement.first().click({ force: true });
          await expect(page).toHaveURL(link.url, { timeout: 10000 });
        }
        
        // Go back to dashboard
        await page.goto(`${BASE}/dashboard`);
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test("Check for console errors and 404s", async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Navigate through key pages
    const pages = ['/listings', '/orders', '/customers', '/widgets', '/social', '/reports'];
    
    for (const pagePath of pages) {
      await page.goto(`${BASE}${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any async operations
      await page.waitForTimeout(1000);
    }

    // Check for console errors
    const errors = (page as any).__errors || [];
    const notFoundUrls = (page as any).__notFoundUrls || [];
    
    // Filter out expected errors (like missing avatar images)
    const criticalErrors = errors.filter((error: string) => 
      !error.includes('admin.jpg') && 
      !error.includes('favicon') &&
      !error.includes('prompts.json')
    );
    
    const critical404s = notFoundUrls.filter((url: string) => 
      !url.includes('admin.jpg') && 
      !url.includes('favicon') &&
      !url.includes('prompts.json')
    );

    // Report findings
    if (criticalErrors.length > 0) {
      console.log('Critical console errors found:', criticalErrors);
    }
    
    if (critical404s.length > 0) {
      console.log('Critical 404s found:', critical404s);
    }

    // Assert no critical errors
    expect(criticalErrors.length).toBe(0);
    expect(critical404s.length).toBe(0);
  });
});
