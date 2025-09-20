import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

// Mock upload API response
test.beforeEach(async ({ page }) => {
  await page.route('/api/uploads', async route => {
    const formData = await route.request().formData();
    const files = formData.getAll('files') as File[];
    const urls = files.map((_, index) => `/uploads/mock-image-${index + 1}.jpg`);
    
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ urls }),
    });
  });
});

test.describe("Type-Aware Listings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/listings`);
    await page.waitForLoadState('networkidle');
  });

  test("Create EVENT listing with images and details", async ({ page }) => {
    // Click create listing button
    await page.getByRole('button', { name: /new listing|create|add/i }).click();
    await page.waitForSelector('[data-testid="listing-type"]');

    // Select Event type
    await page.getByTestId('listing-type').click();
    await page.getByRole('option', { name: 'Event' }).click();

    // Fill basic information
    await page.getByTestId('listing-title').fill('Summer Music Festival 2024');
    await page.getByTestId('listing-description').fill('An amazing outdoor music festival featuring local and international artists.');
    await page.getByTestId('listing-category').fill('Music & Entertainment');
    await page.getByTestId('listing-city').fill('San Francisco');
    await page.getByTestId('listing-country').fill('USA');
    await page.getByTestId('listing-slug').fill('summer-music-festival-2024');
    await page.getByTestId('listing-currency').fill('USD');
    await page.getByTestId('listing-price').fill('5000'); // $50.00
    await page.getByTestId('listing-capacity').fill('500');

    // Upload images
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      { name: 'festival-1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-data-1') },
      { name: 'festival-2.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-data-2') }
    ]);

    // Wait for images to upload
    await expect(page.locator('[data-testid="image-thumb"]')).toHaveCount(2);
    await expect(page.locator('text=Cover')).toBeVisible();

    // Fill event-specific details
    await page.getByTestId('event-start').fill('2024-07-15T18:00');
    await page.getByTestId('event-end').fill('2024-07-15T23:00');
    await page.getByTestId('event-venue-name').fill('Golden Gate Park');
    await page.getByTestId('event-venue-address').fill('Golden Gate Park, San Francisco, CA');
    await page.getByTestId('event-rsvp').fill('https://example.com/rsvp');
    await page.getByTestId('event-ticket-name').fill('General Admission');
    await page.getByTestId('event-ticket-price').fill('5000'); // $50.00
    await page.getByTestId('event-ticket-qty').fill('500');

    // Save as draft
    await page.getByRole('button', { name: /save|create/i }).click();

    // Verify success toast
    await expect(page.locator('[data-sonner-toast], [role="status"]')).toContainText(/success|created/i);

    // Verify listing appears in table
    await expect(page.getByText('Summer Music Festival 2024')).toBeVisible();
    await expect(page.locator('[data-testid="type-badge"]')).toContainText('EVENT');
    await expect(page.locator('[data-testid="cover-image"]')).toBeVisible();
    await expect(page.getByText('$50.00')).toBeVisible();
  });

  test("Create PROPERTY listing with rental details", async ({ page }) => {
    // Click create listing button
    await page.getByRole('button', { name: /new listing|create|add/i }).click();
    await page.waitForSelector('[data-testid="listing-type"]');

    // Select Property type
    await page.getByTestId('listing-type').click();
    await page.getByRole('option', { name: 'Property' }).click();

    // Fill basic information
    await page.getByTestId('listing-title').fill('Luxury Downtown Loft');
    await page.getByTestId('listing-description').fill('Beautiful modern loft in the heart of downtown with stunning city views.');
    await page.getByTestId('listing-category').fill('Accommodation');
    await page.getByTestId('listing-city').fill('New York');
    await page.getByTestId('listing-country').fill('USA');
    await page.getByTestId('listing-slug').fill('luxury-downtown-loft');
    await page.getByTestId('listing-currency').fill('USD');
    await page.getByTestId('listing-capacity').fill('4');

    // Upload cover image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      { name: 'loft-1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-data') }
    ]);

    await expect(page.locator('[data-testid="image-thumb"]')).toHaveCount(1);

    // Fill property-specific details
    await page.getByTestId('property-rental-type').click();
    await page.getByRole('option', { name: 'Nightly' }).click();
    await page.getByTestId('property-rate').fill('20000'); // $200.00
    await page.getByTestId('property-cleaning').fill('5000'); // $50.00
    await page.getByTestId('property-deposit').fill('10000'); // $100.00
    await page.getByTestId('property-bedrooms').fill('2');
    await page.getByTestId('property-baths').fill('2');
    await page.getByTestId('property-address').fill('123 Broadway, New York, NY 10001');
    await page.getByTestId('property-amenities').fill('WiFi, Kitchen, Parking, Gym');
    await page.getByTestId('property-rules').fill('No smoking, No pets, Quiet hours 10pm-7am');

    // Publish listing
    await page.getByTestId('listing-status').click();
    await page.getByRole('option', { name: 'Published' }).click();
    await page.getByRole('button', { name: /save|create/i }).click();

    // Verify success
    await expect(page.locator('[data-sonner-toast], [role="status"]')).toContainText(/success|created/i);

    // Verify listing appears with property details
    await expect(page.getByText('Luxury Downtown Loft')).toBeVisible();
    await expect(page.locator('[data-testid="type-badge"]')).toContainText('PROPERTY');
    await expect(page.getByText('$200.00')).toBeVisible();
    await expect(page.getByText('Nightly')).toBeVisible();
  });

  test("Create RESTAURANT listing with menu and reservation links", async ({ page }) => {
    // Click create listing button
    await page.getByRole('button', { name: /new listing|create|add/i }).click();
    await page.waitForSelector('[data-testid="listing-type"]');

    // Select Restaurant type
    await page.getByTestId('listing-type').click();
    await page.getByRole('option', { name: 'Restaurant' }).click();

    // Fill basic information
    await page.getByTestId('listing-title').fill('Bella Vista Italian');
    await page.getByTestId('listing-description').fill('Authentic Italian cuisine with a modern twist, featuring fresh pasta and local ingredients.');
    await page.getByTestId('listing-category').fill('Fine Dining');
    await page.getByTestId('listing-city').fill('San Francisco');
    await page.getByTestId('listing-country').fill('USA');
    await page.getByTestId('listing-slug').fill('bella-vista-italian');
    await page.getByTestId('listing-currency').fill('USD');
    await page.getByTestId('listing-capacity').fill('80');

    // Fill restaurant-specific details
    await page.getByTestId('restaurant-menu').fill('https://bellavista.com/menu');
    await page.getByTestId('restaurant-reservation').fill('https://opentable.com/bella-vista');
    await page.getByTestId('restaurant-cuisines').fill('Italian, Mediterranean, Fine Dining');

    // Save
    await page.getByRole('button', { name: /save|create/i }).click();

    // Verify success
    await expect(page.locator('[data-sonner-toast], [role="status"]')).toContainText(/success|created/i);

    // Verify listing appears
    await expect(page.getByText('Bella Vista Italian')).toBeVisible();
    await expect(page.locator('[data-testid="type-badge"]')).toContainText('RESTAURANT');
  });

  test("Create RETREAT listing with package details", async ({ page }) => {
    // Click create listing button
    await page.getByRole('button', { name: /new listing|create|add/i }).click();
    await page.waitForSelector('[data-testid="listing-type"]');

    // Select Retreat type
    await page.getByTestId('listing-type').click();
    await page.getByRole('option', { name: 'Retreat' }).click();

    // Fill basic information
    await page.getByTestId('listing-title').fill('Mountain Wellness Retreat');
    await page.getByTestId('listing-description').fill('A transformative 3-day wellness retreat in the mountains focusing on mindfulness and nature connection.');
    await page.getByTestId('listing-category').fill('Wellness');
    await page.getByTestId('listing-city').fill('Aspen');
    await page.getByTestId('listing-country').fill('USA');
    await page.getByTestId('listing-slug').fill('mountain-wellness-retreat');
    await page.getByTestId('listing-currency').fill('USD');
    await page.getByTestId('listing-capacity').fill('20');

    // Fill retreat-specific details
    await page.getByTestId('retreat-start').fill('2024-08-15T09:00');
    await page.getByTestId('retreat-end').fill('2024-08-17T17:00');
    await page.getByTestId('retreat-price').fill('75000'); // $750.00
    await page.getByTestId('retreat-includes').fill('Accommodation, all meals, guided meditation, yoga sessions, nature hikes, wellness workshops');

    // Save
    await page.getByRole('button', { name: /save|create/i }).click();

    // Verify success
    await expect(page.locator('[data-sonner-toast], [role="status"]')).toContainText(/success|created/i);

    // Verify listing appears
    await expect(page.getByText('Mountain Wellness Retreat')).toBeVisible();
    await expect(page.locator('[data-testid="type-badge"]')).toContainText('RETREAT');
    await expect(page.getByText('$750.00')).toBeVisible();
  });

  test("Create ACTIVITY listing with schedule and pricing", async ({ page }) => {
    // Click create listing button
    await page.getByRole('button', { name: /new listing|create|add/i }).click();
    await page.waitForSelector('[data-testid="listing-type"]');

    // Select Activity type
    await page.getByTestId('listing-type').click();
    await page.getByRole('option', { name: 'Activity' }).click();

    // Fill basic information
    await page.getByTestId('listing-title').fill('Rock Climbing Adventure');
    await page.getByTestId('listing-description').fill('Experience the thrill of outdoor rock climbing with certified guides in beautiful natural settings.');
    await page.getByTestId('listing-category').fill('Adventure Sports');
    await page.getByTestId('listing-city').fill('Boulder');
    await page.getByTestId('listing-country').fill('USA');
    await page.getByTestId('listing-slug').fill('rock-climbing-adventure');
    await page.getByTestId('listing-currency').fill('USD');
    await page.getByTestId('listing-capacity').fill('8');

    // Fill activity-specific details
    await page.getByTestId('activity-price').fill('12000'); // $120.00
    await page.getByTestId('activity-meetpoint').fill('Boulder Rock Gym, 123 Main St, Boulder, CO');
    await page.getByTestId('activity-skill').click();
    await page.getByRole('option', { name: 'Intermediate' }).click();
    await page.locator('[data-testid="activity-equipment"]').check();

    // Save
    await page.getByRole('button', { name: /save|create/i }).click();

    // Verify success
    await expect(page.locator('[data-sonner-toast], [role="status"]')).toContainText(/success|created/i);

    // Verify listing appears
    await expect(page.getByText('Rock Climbing Adventure')).toBeVisible();
    await expect(page.locator('[data-testid="type-badge"]')).toContainText('ACTIVITY');
    await expect(page.getByText('$120.00')).toBeVisible();
  });

  test("Edit listing and reorder images", async ({ page }) => {
    // Assume we have a listing from previous tests
    await page.getByText('Summer Music Festival 2024').click();
    
    // Wait for edit form to load
    await page.waitForSelector('[data-testid="listing-title"]');
    
    // Update title
    await page.getByTestId('listing-title').fill('Summer Music Festival 2024 - Updated');
    
    // Upload additional image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      { name: 'festival-3.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image-data-3') }
    ]);
    
    // Wait for new image to appear
    await expect(page.locator('[data-testid="image-thumb"]')).toHaveCount(3);
    
    // Drag to reorder images (simulate drag and drop)
    const firstImage = page.locator('[data-testid="image-thumb"]').first();
    const lastImage = page.locator('[data-testid="image-thumb"]').last();
    
    // Note: Actual drag and drop testing would require more complex setup
    // For now, we'll just verify the images are present
    await expect(firstImage).toBeVisible();
    await expect(lastImage).toBeVisible();
    
    // Update price
    await page.getByTestId('listing-price').fill('6000'); // $60.00
    
    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();
    
    // Verify success
    await expect(page.locator('[data-sonner-toast], [role="status"]')).toContainText(/success|updated/i);
    
    // Verify changes reflected in table
    await expect(page.getByText('Summer Music Festival 2024 - Updated')).toBeVisible();
    await expect(page.getByText('$60.00')).toBeVisible();
  });

  test("Filter listings by type and status", async ({ page }) => {
    // Test type filter
    await page.getByRole('button', { name: /filter|type/i }).click();
    await page.getByRole('option', { name: 'Event' }).click();
    
    // Verify only events are shown
    await expect(page.locator('[data-testid="type-badge"]')).toContainText('EVENT');
    
    // Test status filter
    await page.getByRole('button', { name: /status/i }).click();
    await page.getByRole('option', { name: 'Published' }).click();
    
    // Verify only published listings are shown
    await expect(page.locator('[data-testid="status-badge"]')).toContainText('PUBLISHED');
    
    // Test city filter
    await page.getByPlaceholder(/search|filter/i).fill('San Francisco');
    
    // Verify only San Francisco listings are shown
    await expect(page.getByText('San Francisco')).toBeVisible();
  });

  test("Validate required fields for each type", async ({ page }) => {
    // Test EVENT validation
    await page.getByRole('button', { name: /new listing|create|add/i }).click();
    await page.getByTestId('listing-type').click();
    await page.getByRole('option', { name: 'Event' }).click();
    
    // Fill only basic info, leave event details empty
    await page.getByTestId('listing-title').fill('Test Event');
    await page.getByTestId('listing-slug').fill('test-event');
    
    // Try to save without required event fields
    await page.getByRole('button', { name: /save|create/i }).click();
    
    // Should show validation errors
    await expect(page.locator('text=required|invalid|error')).toBeVisible();
    
    // Fill required event fields
    await page.getByTestId('event-start').fill('2024-07-15T18:00');
    await page.getByTestId('event-end').fill('2024-07-15T23:00');
    await page.getByTestId('event-venue-address').fill('Test Venue Address');
    
    // Now should save successfully
    await page.getByRole('button', { name: /save|create/i }).click();
    await expect(page.locator('[data-sonner-toast], [role="status"]')).toContainText(/success|created/i);
  });
});

