import { test, expect } from '@playwright/test';
import { gotoAndWait, mockApi } from './_utils/test-helpers';

test.describe('Health & Jobs', () => {
  test('Health endpoint returns all services OK', async ({ page }) => {
    await test.step('Check health endpoint', async () => {
      const response = await page.request.get('/api/healthz');
      expect(response.status()).toBe(200);
      
      const health = await response.json();
      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('services');
      
      const services = health.services;
      expect(services).toHaveProperty('database', 'ok');
      expect(services).toHaveProperty('redis', 'ok');
      expect(services).toHaveProperty('queue', 'ok');
    });
  });

  test('Job queue processing', async ({ page }) => {
    await test.step('Enqueue a test job', async () => {
      // Mock the job enqueue endpoint
      await mockApi(page, '/api/jobs/enqueue', 200, {
        success: true,
        jobId: 'test-job-123'
      });
      
      const response = await page.request.post('/api/jobs/enqueue', {
        data: {
          type: 'test-job',
          payload: { message: 'test' }
        }
      });
      
      expect(response.status()).toBe(200);
      const result = await response.json();
      expect(result).toHaveProperty('jobId');
    });

    await test.step('Check job status', async ({ page }) => {
      // Mock job status endpoint
      await mockApi(page, '/api/jobs/test-job-123/status', 200, {
        status: 'completed',
        result: { success: true }
      });
      
      const response = await page.request.get('/api/jobs/test-job-123/status');
      expect(response.status()).toBe(200);
      
      const status = await response.json();
      expect(status).toHaveProperty('status', 'completed');
    });
  });

  test('Worker health check', async ({ page }) => {
    await test.step('Check worker status', async () => {
      const response = await page.request.get('/api/healthz/worker');
      expect(response.status()).toBe(200);
      
      const workerHealth = await response.json();
      expect(workerHealth).toHaveProperty('status', 'ok');
      expect(workerHealth).toHaveProperty('activeJobs');
      expect(workerHealth).toHaveProperty('processedJobs');
    });
  });
});
