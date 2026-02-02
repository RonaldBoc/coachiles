# E2E Testing with Playwright

This directory contains end-to-end tests for the Coachiles application using Playwright.

## Setup

Playwright has been configured with the following:

- **Config file**: `playwright.config.ts`
- **Test directory**: `e2e/`
- **Base URL**: `http://localhost:5173` (your Vite dev server)
- **Browsers**: Chromium, Firefox, WebKit

## Running Tests

### Install Dependencies (if not done yet)

```bash
npm install
```

### Run all tests

```bash
npm test
```

### Run tests in UI mode (interactive)

```bash
npm run test:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:headed
```

### Debug tests

```bash
npm run test:debug
```

### Run specific test file

```bash
npx playwright test e2e/homepage.spec.ts
```

### Run tests matching a pattern

```bash
npx playwright test --grep "Coach"
```

## Test Files

### `homepage.spec.ts`

Basic navigation tests:

- Homepage loads with correct title
- Navigation to coaches page
- Navigation to services page

### `marketplace.spec.ts`

Coach marketplace tests:

- Coaches load and display
- Search functionality
- Coach profile viewing
- Filter options

### `auth.spec.ts`

Authentication tests:

- Login/signup visibility
- Auth page navigation
- Coach signup form display
- Protected route handling

## Adding Test Data Attributes

To make tests more reliable, add `data-testid` attributes to your Vue components:

```vue
<!-- Example in CoachBrowser.vue or similar -->
<div data-testid="coach-card">
  <!-- coach card content -->
</div>
```

## Common Patterns

### Waiting for elements

```typescript
await expect(page.locator('[data-testid="element"]')).toBeVisible()
```

### Filling forms

```typescript
await page.locator('input[type="email"]').fill('test@example.com')
await page.locator('input[type="password"]').fill('password')
```

### Clicking buttons

```typescript
await page.locator('button:has-text("Submit")').click()
```

### Checking URL

```typescript
await expect(page).toHaveURL(/\/coaches/)
```

## Next Steps

1. **Add authentication tests with real data**: Create fixtures for logged-in users
2. **Test critical flows**: Booking, subscription, proposal creation
3. **Add visual regression tests**: Screenshot comparisons
4. **Set up CI/CD integration**: Run tests in GitHub Actions
5. **Performance testing**: Add Lighthouse or similar tools

## Troubleshooting

### Tests timeout

- Ensure dev server is running: `npm run dev`
- Check if selectors are correct
- Use `--debug` flag to step through tests

### Flaky tests

- Add proper waits: `waitForLoadState('networkidle')`
- Use `data-testid` attributes instead of fragile selectors
- Increase timeout for slow elements

### Tests can't find elements

- Run with `--debug` to inspect the page
- Check if elements are visible/not hidden
- Verify the baseURL is correct

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
