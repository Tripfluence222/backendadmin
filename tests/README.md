# Tripfluence Admin - E2E Test Suite

This directory contains end-to-end tests for the Tripfluence Admin application using Playwright with TypeScript.

## Quick Start

### Prerequisites
- Node.js 18+
- Application running at `http://localhost:3001`

### Running Tests Locally

```bash
# Run all tests (headless)
npm run test:e2e

# Run with UI for debugging
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Update snapshots
npm run test:e2e:update
```

## Test Structure

```
tests/e2e/
├── _utils/
│   └── test-helpers.ts          # Utility functions
├── dashboard.spec.ts            # Dashboard layout and navigation
├── listings.spec.ts             # Listing CRUD operations
├── orders.spec.ts               # Order management and refunds
├── availability.spec.ts         # Availability slot management
├── widgets.spec.ts              # Widget builder and embed codes
├── social.spec.ts               # Social media management
├── event-sync.spec.ts           # Event synchronization
├── reports.spec.ts              # Reports and analytics
├── visual.spec.ts               # Visual alignment and responsive design
└── README.md                    # This file
```

## Test Coverage

### Core Workflows
- **Dashboard**: Sidebar visibility, topbar elements, metric cards
- **Listings**: Create, publish, edit listings with image upload
- **Orders**: View details, process refunds, export CSV
- **Availability**: Add/delete slots, calendar management, ICS import
- **Widgets**: Multi-step wizard, embed code generation, preview
- **Social**: Compose posts, schedule content, analytics
- **Event Sync**: Create events, webhook integration, activity logs
- **Reports**: Date filtering, chart rendering, CSV export

### Visual & Responsive Testing
- Sidebar/topbar alignment and overlap prevention
- Dark mode contrast validation
- Mobile responsive behavior (iPhone 14)
- Consistent spacing and layout
- Table kebab menus on mobile

## Browser Support

- **Desktop**: Chromium (1440×900)
- **Mobile**: WebKit (iPhone 14 portrait)

## Configuration

### Playwright Config (`playwright.config.ts`)
- Base URL: `http://localhost:3001`
- Projects: `desktop-chromium`, `mobile-iphone14`
- Retries: 1 on CI, 0 locally
- Timeouts: 15s actions, 25s navigation, 8s assertions
- Artifacts: Screenshots on failure, videos on retry, traces on first retry

### Test Helpers (`_utils/test-helpers.ts`)
- `gotoAndWait()` - Navigate and wait for network idle
- `expectVisible()` - Convenience visibility assertion
- `fillRHFInput()` - Fill React Hook Form inputs by label
- `setDateByPlaceholder()` - Set date inputs
- `mockApi()` - Mock API endpoints
- `selectShadcnCombobox()` - Select from shadcn/ui comboboxes
- `openKebabAction()` - Open kebab menu actions
- `uploadMockFile()` - Upload mock files
- `waitForToast()` - Wait for toast notifications
- `getBoundingBox()` - Get element bounding box
- `isOverlapping()` - Check if elements overlap

## Debugging

### Failed Tests
1. **View HTML Report**: `npm run test:e2e` then open `playwright-report/index.html`
2. **Check Screenshots**: Look in `test-results/` for failure screenshots
3. **Watch Videos**: Check `test-results/` for test execution videos
4. **Use Trace Viewer**: `npx playwright show-trace test-results/trace.zip`

### Debug Mode
```bash
# Run specific test with debug info
npx playwright test dashboard.spec.ts --debug

# Run with browser visible
npx playwright test --headed

# Run single test
npx playwright test dashboard.spec.ts -g "should display sidebar"
```

### Common Issues
- **Timeout errors**: Increase wait times or check selectors
- **Element not found**: Verify page has loaded completely
- **Flaky tests**: Add proper waits and retry logic
- **Mobile issues**: Check viewport size and responsive behavior

## CI/CD Integration

### GitHub Actions
The workflow (`.github/workflows/playwright.yml`) runs:
- On push/PR to `main` and `develop` branches
- Matrix strategy: `desktop-chromium` and `mobile-iphone14`
- Caches `node_modules` for faster builds
- Uploads test results, screenshots, and videos on failure
- 30-day artifact retention

### Artifacts
- **Test Results**: HTML reports and JSON results
- **Screenshots**: Failure screenshots for debugging
- **Videos**: Test execution recordings
- **Traces**: Detailed execution traces

## Data Test IDs

The tests use `data-testid` attributes for reliable element selection:

```typescript
// Critical elements with test IDs
data-testid="sidebar"
data-testid="topbar-search"
data-testid="topbar-notifications"
data-testid="topbar-profile"
data-testid="listings-new"
data-testid="listings-table"
data-testid="orders-table"
data-testid="availability-calendar"
data-testid="add-slot"
data-testid="delete-slot"
data-testid="widgets-stepper"
data-testid="embed-script"
data-testid="embed-iframe"
data-testid="preview-pane"
data-testid="social-compose"
data-testid="social-calendar"
data-testid="eventsync-publish"
data-testid="eventsync-status"
data-testid="reports-chart"
```

## Best Practices

### Test Organization
- Use `test.step()` for readable test logs
- Group related tests with `test.describe()`
- Use `beforeEach()` for common setup
- Keep tests focused and atomic

### Selectors
- Prefer `data-testid` attributes
- Use semantic selectors (`getByRole`, `getByLabel`, `getByText`)
- Avoid brittle CSS selectors
- Use accessible names when possible

### Assertions
- Use Playwright's built-in assertions
- Check both visibility and content
- Verify URL changes after navigation
- Test both success and error scenarios

### Performance
- Wait for `networkidle` state
- Use specific timeouts
- Avoid unnecessary waits
- Mock external API calls

## Maintenance

### Adding New Tests
1. Create test file in `tests/e2e/`
2. Follow existing naming conventions
3. Use test helpers for common operations
4. Add appropriate assertions
5. Update this README if needed

### Updating Tests
- Update selectors when UI changes
- Keep mock data realistic
- Remove obsolete tests
- Add tests for new features

### Performance Monitoring
- Keep test suite under 3 minutes locally
- Monitor CI execution time
- Optimize slow tests
- Use parallel execution effectively

## Troubleshooting

### Application Not Running
```bash
# Start the application
npm run dev

# Verify it's running
curl http://localhost:3001
```

### Browser Issues
```bash
# Reinstall browsers
npx playwright install

# Install with system dependencies
npx playwright install --with-deps
```

### Test Failures
1. Check application is running
2. Verify test data exists
3. Check for UI changes
4. Review error messages
5. Use debug mode for investigation

## Contributing

When adding new tests:
1. Follow the existing patterns
2. Use the test helpers
3. Add appropriate data-testid attributes
4. Keep tests deterministic
5. Update documentation

For questions or issues, check the Playwright documentation or create an issue in the repository.