import { test, expect, Page } from '@playwright/test';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

interface LinkResult {
  url: string;
  status: number;
  text: string;
  href: string;
  error?: string;
}

interface DeadLinkReport {
  timestamp: string;
  baseUrl: string;
  totalLinks: number;
  workingLinks: number;
  brokenLinks: number;
  results: LinkResult[];
  errors: LinkResult[];
}

test.describe('Dead Link Audit', () => {
  let report: DeadLinkReport;

  test.beforeAll(async () => {
    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    report = {
      timestamp: new Date().toISOString(),
      baseUrl: 'http://localhost:3000',
      totalLinks: 0,
      workingLinks: 0,
      brokenLinks: 0,
      results: [],
      errors: []
    };
  });

  test.afterAll(async () => {
    // Generate JSON report
    writeFileSync(
      path.join(process.cwd(), 'reports/deadlinks.json'),
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdownReport = generateMarkdownReport(report);
    writeFileSync(
      path.join(process.cwd(), 'reports/deadlinks.md'),
      markdownReport
    );

    console.log(`Dead link audit completed. Found ${report.brokenLinks} broken links out of ${report.totalLinks} total links.`);
  });

  const routes = [
    '/',
    '/dashboard',
    '/venues',
    '/search',
    '/spaces',
    '/customers',
    '/orders',
    '/listings',
    '/availability',
    '/marketing',
    '/social',
    '/reports',
    '/reviews',
    '/integrations',
    '/settings'
  ];

  for (const route of routes) {
    test(`Check links on ${route}`, async ({ page }) => {
      try {
        await page.goto(`http://localhost:3000${route}`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Get all links on the page
        const links = await page.locator('a[href]').all();
        
        for (const link of links) {
          const href = await link.getAttribute('href');
          const text = (await link.textContent())?.trim() || '';
          
          if (!href) continue;
          
          // Skip external links, mailto, tel, and hash links
          if (href.startsWith('http') && !href.startsWith('http://localhost:3000')) continue;
          if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;
          
          const fullUrl = href.startsWith('/') ? `http://localhost:3000${href}` : href;
          
          report.totalLinks++;
          
          try {
            const response = await page.request.get(fullUrl);
            const status = response.status();
            
            const result: LinkResult = {
              url: fullUrl,
              status,
              text,
              href
            };
            
            if (status >= 200 && status < 400) {
              report.workingLinks++;
            } else {
              report.brokenLinks++;
              result.error = `HTTP ${status}`;
              report.errors.push(result);
            }
            
            report.results.push(result);
            
          } catch (error) {
            report.totalLinks++;
            report.brokenLinks++;
            const errorResult: LinkResult = {
              url: fullUrl,
              status: 0,
              text,
              href,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
            report.results.push(errorResult);
            report.errors.push(errorResult);
          }
        }
        
      } catch (error) {
        console.error(`Failed to check links on ${route}:`, error);
      }
    });
  }

  test('Verify no broken internal links', async ({ page }) => {
    // This test will fail if broken links are found
    expect(report.brokenLinks, `Found ${report.brokenLinks} broken links. Check reports/deadlinks.md for details.`).toBe(0);
  });
});

function generateMarkdownReport(report: DeadLinkReport): string {
  const { totalLinks, workingLinks, brokenLinks, errors } = report;
  
  let markdown = `# Dead Link Audit Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}  
**Base URL:** ${report.baseUrl}

## Summary

- **Total Links Checked:** ${totalLinks}
- **Working Links:** ${workingLinks}
- **Broken Links:** ${brokenLinks}
- **Success Rate:** ${totalLinks > 0 ? Math.round((workingLinks / totalLinks) * 100) : 0}%

`;

  if (brokenLinks === 0) {
    markdown += `## ✅ No Broken Links Found

All internal links are working correctly!

`;
  } else {
    markdown += `## ❌ Broken Links Found

The following ${brokenLinks} links need attention:

| URL | Link Text | Error | Status Code |
|-----|-----------|-------|-------------|
`;

    for (const error of errors) {
      markdown += `| ${error.url} | ${error.text || 'N/A'} | ${error.error || 'N/A'} | ${error.status || 'N/A'} |\n`;
    }

    markdown += `
## Recommendations

1. **404 Errors:** Create missing pages or redirect to appropriate alternatives
2. **500 Errors:** Fix server-side issues or API endpoints
3. **Authentication Errors:** Ensure proper access control and redirects
4. **Redirect Loops:** Check route configuration and middleware

`;
  }

  markdown += `## Tested Routes

The following routes were crawled for links:

`;

  const routes = [
    '/ (Home)',
    '/dashboard (Admin Dashboard)',
    '/venues (Public Venues)',
    '/search (Search Page)',
    '/spaces (Space Management)',
    '/customers (Customer Management)',
    '/orders (Order Management)',
    '/listings (Listing Management)',
    '/availability (Availability Management)',
    '/marketing (Marketing Tools)',
    '/social (Social Media)',
    '/reports (Analytics)',
    '/reviews (Review Management)',
    '/integrations (Third-party Integrations)',
    '/settings (System Settings)'
  ];

  for (const route of routes) {
    markdown += `- ${route}\n`;
  }

  markdown += `
## How to Fix

1. **Run the audit again:**
   \`\`\`bash
   npm run deadlinks:report
   \`\`\`

2. **Check specific routes:**
   \`\`\`bash
   npm run test:e2e -- --grep "Check links on"
   \`\`\`

3. **View detailed JSON report:**
   \`\`\`bash
   cat reports/deadlinks.json
   \`\`\`

---
*Report generated by Playwright Dead Link Audit*
`;

  return markdown;
}