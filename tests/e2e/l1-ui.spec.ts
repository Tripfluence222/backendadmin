import { test, expect } from "@playwright/test";

test.describe("L1 - UI Layout Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("Dashboard layout renders correctly", async ({ page }) => {
    // Check sidebar
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // Check topbar
    await expect(page.locator('[data-testid="topbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="topbar-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="topbar-notifications"]')).toBeVisible();
    await expect(page.locator('[data-testid="topbar-profile"]')).toBeVisible();
    
    // Check main content area
    await expect(page.locator("main")).toBeVisible();
    
    // Check metric cards
    await expect(page.locator('[data-testid="metric-card-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-bookings"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-card-social-reach"]')).toBeVisible();
  });

  test("Navigation works correctly", async ({ page }) => {
    // Test sidebar navigation
    await page.click('a[href="/listings"]');
    await expect(page).toHaveURL("/listings");
    
    await page.click('a[href="/orders"]');
    await expect(page).toHaveURL("/orders");
    
    await page.click('a[href="/availability"]');
    await expect(page).toHaveURL("/availability");
    
    await page.click('a[href="/widgets"]');
    await expect(page).toHaveURL("/widgets");
    
    await page.click('a[href="/marketing"]');
    await expect(page).toHaveURL("/marketing");
    
    await page.click('a[href="/reports"]');
    await expect(page).toHaveURL("/reports");
    
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL("/settings");
  });

  test("Responsive design works on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that sidebar is hidden on mobile
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
    
    // Check that mobile menu button exists
    await expect(page.locator('[aria-label="Open menu"]')).toBeVisible();
  });

  test("Dark mode toggle works", async ({ page }) => {
    // Check initial theme
    const html = page.locator("html");
    await expect(html).toHaveAttribute("class", /light/);
    
    // Toggle dark mode
    await page.click('[data-testid="theme-toggle"]');
    await expect(html).toHaveAttribute("class", /dark/);
    
    // Toggle back to light mode
    await page.click('[data-testid="theme-toggle"]');
    await expect(html).toHaveAttribute("class", /light/);
  });
});

test.describe("L1 - Page Layout Tests", () => {
  const pages = [
    { name: "Dashboard", url: "/dashboard" },
    { name: "Listings", url: "/listings" },
    { name: "Orders", url: "/orders" },
    { name: "Availability", url: "/availability" },
    { name: "Customers", url: "/customers" },
    { name: "Reviews", url: "/reviews" },
    { name: "Widgets", url: "/widgets" },
    { name: "Social", url: "/social" },
    { name: "Event Sync", url: "/event-sync" },
    { name: "Marketing", url: "/marketing" },
    { name: "Reports", url: "/reports" },
    { name: "Settings", url: "/settings" },
  ];

  for (const page of pages) {
    test(`${page.name} page renders correctly`, async ({ page: testPage }) => {
      await testPage.goto(page.url);
      
      // Check that page loads without errors
      await expect(testPage.locator("main")).toBeVisible();
      
      // Check that sidebar and topbar are present
      await expect(testPage.locator('[data-testid="sidebar"]')).toBeVisible();
      await expect(testPage.locator('[data-testid="topbar"]')).toBeVisible();
      
      // Check that page title is present
      await expect(testPage.locator("h1")).toBeVisible();
    });
  }
});

test.describe("L1 - Component Tests", () => {
  test("DataTable renders correctly", async ({ page }) => {
    await page.goto("/listings");
    
    // Check table headers
    await expect(page.locator("thead")).toBeVisible();
    
    // Check table body
    await expect(page.locator("tbody")).toBeVisible();
    
    // Check pagination
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test("Modal components work", async ({ page }) => {
    await page.goto("/listings");
    
    // Click create button
    await page.click('button:has-text("Create Listing")');
    
    // Check modal opens
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Check modal content
    await expect(page.locator('h2:has-text("Create Listing")')).toBeVisible();
    
    // Close modal
    await page.click('[aria-label="Close"]');
    
    // Check modal closes
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("Form components work", async ({ page }) => {
    await page.goto("/listings");
    
    // Open create form
    await page.click('button:has-text("Create Listing")');
    
    // Check form fields
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('select[name="type"]')).toBeVisible();
    
    // Fill form
    await page.fill('input[name="title"]', "Test Listing");
    await page.fill('textarea[name="description"]', "Test Description");
    await page.selectOption('select[name="type"]', "RESTAURANT");
    
    // Check form validation
    await page.click('button[type="submit"]');
    
    // Check for success message or error handling
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});
