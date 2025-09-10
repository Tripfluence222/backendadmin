import { test, expect } from "@playwright/test";

test.describe("L2 - Workflow Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("Listings CRUD workflow", async ({ page }) => {
    // Navigate to listings
    await page.goto("/listings");
    
    // Create new listing
    await page.click('button:has-text("Create Listing")');
    await page.fill('input[name="title"]', "Test Restaurant");
    await page.fill('textarea[name="description"]', "A test restaurant for automation");
    await page.selectOption('select[name="type"]', "RESTAURANT");
    await page.fill('input[name="slug"]', "test-restaurant");
    await page.fill('input[name="price"]', "50");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Listing created successfully')).toBeVisible();
    
    // Verify listing appears in table
    await expect(page.locator('text=Test Restaurant')).toBeVisible();
    
    // Edit listing
    await page.click('button[aria-label="Edit Test Restaurant"]');
    await page.fill('input[name="title"]', "Updated Test Restaurant");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Listing updated successfully')).toBeVisible();
    
    // Verify update
    await expect(page.locator('text=Updated Test Restaurant')).toBeVisible();
    
    // Publish listing
    await page.click('button[aria-label="Publish Updated Test Restaurant"]');
    await page.click('button:has-text("Confirm")');
    
    // Wait for success message
    await expect(page.locator('text=Listing published successfully')).toBeVisible();
    
    // Delete listing
    await page.click('button[aria-label="Delete Updated Test Restaurant"]');
    await page.click('button:has-text("Delete")');
    
    // Wait for success message
    await expect(page.locator('text=Listing deleted successfully')).toBeVisible();
    
    // Verify deletion
    await expect(page.locator('text=Updated Test Restaurant')).not.toBeVisible();
  });

  test("Availability slot management workflow", async ({ page }) => {
    // Navigate to availability
    await page.goto("/availability");
    
    // Select a listing
    await page.selectOption('select[name="listing"]', "1");
    
    // Add new slot
    await page.click('button:has-text("Add Slot")');
    await page.fill('input[name="start"]', "2024-02-15T10:00");
    await page.fill('input[name="end"]', "2024-02-15T12:00");
    await page.fill('input[name="capacity"]', "10");
    await page.fill('input[name="location"]', "Main Hall");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Slot created successfully')).toBeVisible();
    
    // Verify slot appears in calendar
    await expect(page.locator('text=10:00 AM - 12:00 PM')).toBeVisible();
    
    // Edit slot
    await page.click('button[aria-label="Edit slot"]');
    await page.fill('input[name="capacity"]', "15");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Slot updated successfully')).toBeVisible();
    
    // Delete slot
    await page.click('button[aria-label="Delete slot"]');
    await page.click('button:has-text("Delete")');
    
    // Wait for success message
    await expect(page.locator('text=Slot deleted successfully')).toBeVisible();
  });

  test("Order refund workflow", async ({ page }) => {
    // Navigate to orders
    await page.goto("/orders");
    
    // Find an order to refund
    await page.click('button[aria-label="View order details"]');
    
    // Open refund modal
    await page.click('button:has-text("Refund")');
    
    // Fill refund form
    await page.fill('input[name="amount"]', "50");
    await page.fill('textarea[name="reason"]', "Customer request");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Refund processed successfully')).toBeVisible();
    
    // Verify order status updated
    await expect(page.locator('text=Refunded')).toBeVisible();
  });

  test("Widget generation workflow", async ({ page }) => {
    // Navigate to widgets
    await page.goto("/widgets");
    
    // Create new widget
    await page.click('button:has-text("Create Widget")');
    
    // Fill widget form
    await page.selectOption('select[name="widgetType"]', "booking");
    await page.fill('input[name="filters.category"]', "Yoga");
    await page.selectOption('select[name="theme.mode"]', "dark");
    await page.fill('input[name="theme.primaryColor"]', "#2563eb");
    await page.check('input[name="settings.showPricing"]');
    await page.check('input[name="settings.showAvailability"]');
    
    // Generate widget
    await page.click('button:has-text("Generate Widget")');
    
    // Wait for generation
    await expect(page.locator('text=Widget generated successfully')).toBeVisible();
    
    // Check embed code is displayed
    await expect(page.locator('textarea[name="embedCode"]')).toBeVisible();
    
    // Test preview
    await page.click('button:has-text("Preview")');
    await expect(page.locator('iframe[src*="preview"]')).toBeVisible();
  });

  test("Social post scheduling workflow", async ({ page }) => {
    // Navigate to social
    await page.goto("/social");
    
    // Create new post
    await page.click('button:has-text("Create Post")');
    
    // Fill post form
    await page.fill('textarea[name="content"]', "Check out our new listing! #tripfluence");
    await page.check('input[name="platforms.facebook"]');
    await page.check('input[name="platforms.instagram"]');
    await page.fill('input[name="scheduledAt"]', "2024-02-15T10:00");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Post scheduled successfully')).toBeVisible();
    
    // Verify post appears in calendar
    await expect(page.locator('text=Check out our new listing!')).toBeVisible();
    
    // Check post status updates
    await page.waitForSelector('text=PUBLISHED', { timeout: 30000 });
  });

  test("Event sync publishing workflow", async ({ page }) => {
    // Navigate to event sync
    await page.goto("/event-sync");
    
    // Create new event sync
    await page.click('button:has-text("Connect Platform")');
    await page.selectOption('select[name="platform"]', "eventbrite");
    await page.fill('input[name="connectionName"]', "Test Eventbrite");
    await page.fill('input[name="credentials.apiKey"]', "test-api-key");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Platform connected successfully')).toBeVisible();
    
    // Create event sync
    await page.click('button:has-text("Create Event Sync")');
    await page.fill('input[name="name"]', "Test Event Sync");
    await page.selectOption('select[name="platform"]', "eventbrite");
    await page.fill('input[name="platformEventId"]', "evt123");
    await page.selectOption('select[name="syncDirection"]', "export");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Event sync created successfully')).toBeVisible();
    
    // Publish event sync
    await page.click('button[aria-label="Publish event sync"]');
    await page.click('button:has-text("Publish")');
    
    // Wait for success message
    await expect(page.locator('text=Event published successfully')).toBeVisible();
    
    // Verify external IDs are shown
    await expect(page.locator('text=External ID:')).toBeVisible();
  });

  test("Marketing coupon management workflow", async ({ page }) => {
    // Navigate to marketing
    await page.goto("/marketing");
    
    // Go to coupons tab
    await page.click('button[role="tab"]:has-text("Coupons")');
    
    // Create new coupon
    await page.click('button:has-text("Create Coupon")');
    await page.fill('input[name="code"]', "TEST20");
    await page.fill('input[name="description"]', "20% off test coupon");
    await page.selectOption('select[name="type"]', "percentage");
    await page.fill('input[name="value"]', "20");
    await page.fill('input[name="validFrom"]', "2024-02-01");
    await page.fill('input[name="validUntil"]', "2024-12-31");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Coupon created successfully')).toBeVisible();
    
    // Verify coupon appears in table
    await expect(page.locator('text=TEST20')).toBeVisible();
    
    // Edit coupon
    await page.click('button[aria-label="Edit TEST20"]');
    await page.fill('input[name="value"]', "25");
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Coupon updated successfully')).toBeVisible();
    
    // Delete coupon
    await page.click('button[aria-label="Delete TEST20"]');
    await page.click('button:has-text("Delete")');
    
    // Wait for success message
    await expect(page.locator('text=Coupon deleted successfully')).toBeVisible();
  });
});
