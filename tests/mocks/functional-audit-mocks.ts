import { Page } from '@playwright/test';

export async function setupFunctionalAuditMocks(page: Page) {
  // Upload mock
  await page.route('**/api/uploads', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        urls: ['/uploads/fake1.jpg', '/uploads/fake2.jpg']
      })
    });
  });

  // Social/Event providers mock (FEATURE_REAL_PROVIDERS=false)
  await page.route('**/api/event-sync/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        externalIds: {
          facebook: 'fb_123',
          eventbrite: 'eb_456',
          meetup: 'mu_789'
        }
      })
    });
  });

  // Refund mock (idempotent)
  await page.route('**/api/orders/*/refund', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        status: 'REFUNDED',
        message: 'Refund processed successfully'
      })
    });
  });

  // Social post scheduling mock
  await page.route('**/api/social/posts', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          postId: 'post_123',
          status: 'SCHEDULED'
        })
      });
    }
  });

  // Job processing mock
  await page.route('**/api/jobs/**', async (route) => {
    const url = route.request().url();
    
    if (url.includes('/enqueue')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          jobId: 'job_123'
        })
      });
    } else if (url.includes('/status')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'completed',
          result: { success: true }
        })
      });
    }
  });

  // Health check mock
  await page.route('**/api/healthz**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'ok',
        services: {
          database: 'ok',
          redis: 'ok',
          queue: 'ok'
        }
      })
    });
  });

  // Webhook test mock
  await page.route('https://example.com/webhook', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    });
  });

  // Reports export mock
  await page.route('**/api/reports/export**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/csv',
      body: 'Date,Revenue,Bookings\n2024-01-01,1000,5\n2024-01-02,1500,8'
    });
  });
}
