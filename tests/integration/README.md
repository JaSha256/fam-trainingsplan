# Integration Tests

**Alpine.js Component Integration Testing with Vitest Browser Mode**

## Overview

Integration tests verify that Alpine.js components work correctly with the DOM, testing the complete flow from store updates → Alpine reactivity → DOM changes.

## Why Integration Tests?

1. **Alpine.js is DOM-based**: Unlike React/Vue, Alpine works directly with HTML attributes
2. **Test Reactivity**: Verify `x-data`, `x-show`, `x-model` directives work correctly
3. **Store Integration**: Test Alpine store → component → DOM flow
4. **Faster than E2E**: Run in headless browser, faster than full Playwright E2E tests
5. **More Realistic than Unit**: Test real browser behavior, not jsdom simulation

## Test Coverage

### Filter System ([filter-system.test.js](filter-system.test.js))
- ✅ Desktop filter sidebar toggle
- ✅ Filter persistence across reloads
- ✅ Filter by day of week
- ✅ Filter by location
- ✅ Filter by training type
- ✅ Filter by age group
- ✅ Reset all filters
- ✅ Multiple filters combined
- ✅ Mobile filter drawer

**Total: 15 tests**

### Notifications ([notifications.test.js](notifications.test.js))
- ✅ Show notification with correct message
- ✅ Display info/success/warning/error types
- ✅ Auto-hide after duration
- ✅ Persistent notifications (duration = 0)
- ✅ Manual hide notification
- ✅ Multiple notifications (replace previous)
- ✅ Cancel previous auto-hide timer
- ✅ Online/offline notifications
- ✅ Global error handler notifications
- ✅ Promise rejection notifications
- ✅ DOM integration & accessibility

**Total: 15 tests**

### Favorites ([favorites.test.js](favorites.test.js))
- ✅ Add training to favorites
- ✅ Remove training from favorites
- ✅ Update favorites count
- ✅ Persist favorites in localStorage
- ✅ Restore favorites after reload
- ✅ Handle multiple favorites
- ✅ Toggle heart icon state
- ✅ Show favorites count badge
- ✅ Quick filter favorites
- ✅ Export favorites list

**Total: 13 tests**

### Search ([search.test.js](search.test.js))
- ✅ Basic search filtering
- ✅ Update search term in store
- ✅ Search across multiple fields
- ✅ Fuzzy matching (typos)
- ✅ Partial matches
- ✅ Search by training type
- ✅ Search by location
- ✅ Search by trainer
- ✅ Search debouncing
- ✅ Clear search
- ✅ Combine search with filters
- ✅ No results handling
- ✅ Search performance
- ✅ Mobile search
- ✅ Search persistence

**Total: 18 tests**

## Running Tests

```bash
# Run all integration tests
npm run test:integration

# Watch mode (auto-rerun on changes)
npm run test:integration:watch

# UI mode (visual test runner)
npm run test:integration:ui

# Run specific test file
npx vitest run --project integration tests/integration/search.test.js
```

## Writing Integration Tests

### Basic Structure

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'

describe('Feature Integration', () => {
  beforeEach(async () => {
    // Navigate to app
    await page.goto('/')

    // Wait for Alpine
    await page.waitForFunction(() => window.Alpine !== undefined)

    // Wait for data to load
    await page.waitForFunction(() => {
      const store = window.Alpine?.store('trainingsplaner')
      return store?.allTrainings?.length > 0
    }, { timeout: 5000 })
  })

  it('should do something', async () => {
    // Access Alpine store
    await page.evaluate(() => {
      window.Alpine.store('ui').someMethod()
    })

    // Wait for reactivity
    await page.waitForTimeout(200)

    // Assert
    const result = await page.evaluate(() => {
      return window.Alpine.store('ui').someProperty
    })

    expect(result).toBe(expected)
  })
})
```

### Common Patterns

#### 1. Set Store State
```javascript
await page.evaluate(() => {
  window.Alpine.store('ui').filters.wochentag = 'Montag'
})
```

#### 2. Call Store Methods
```javascript
await page.evaluate(() => {
  window.Alpine.store('ui').resetFilters()
})
```

#### 3. Get Store Data
```javascript
const data = await page.evaluate(() => {
  return window.Alpine.store('trainingsplaner').filteredTrainings
})
```

#### 4. Interact with DOM
```javascript
const button = page.locator('#my-button')
await button.click()
```

#### 5. Wait for Alpine Reactivity
```javascript
await page.waitForTimeout(200) // Alpine needs time to update DOM
```

#### 6. Check Visibility
```javascript
const element = page.locator('[data-notification]')
await expect.element(element).toBeVisible()
```

## Configuration

Integration tests use Vitest browser mode with Playwright provider:

```javascript
// vitest.workspace.js
{
  test: {
    name: 'integration',
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        { browser: 'chromium' }
      ]
    },
    include: ['tests/integration/**/*.test.js'],
    testTimeout: 10000
  }
}
```

## Debugging

### 1. Run in Headed Mode
```javascript
// Edit vitest.workspace.js temporarily
browser: {
  headless: false // See the browser
}
```

### 2. Add Breakpoints
```javascript
it('should debug', async () => {
  debugger // Pauses test execution
  await page.evaluate(() => {
    console.log(window.Alpine.store('ui'))
  })
})
```

### 3. Take Screenshots
```javascript
await page.screenshot({ path: 'debug.png' })
```

### 4. Check Console Logs
```javascript
page.on('console', msg => console.log('Browser:', msg.text()))
```

## Best Practices

1. **Always wait for Alpine**: Check `window.Alpine !== undefined`
2. **Wait for data**: Ensure stores are populated before testing
3. **Use page.waitForTimeout()**: Give Alpine time to update DOM (200-300ms)
4. **Test user flows**: Test complete interactions, not isolated functions
5. **Clear localStorage**: Reset state in `beforeEach` when testing persistence
6. **Use descriptive test names**: "should filter trainings by location" not "test filter"
7. **Test edge cases**: Empty results, no data, multiple items
8. **Verify both store AND DOM**: Check state updated AND UI reflects it

## Differences from Unit Tests

| Unit Tests | Integration Tests |
|------------|-------------------|
| jsdom | Real browser (Chromium) |
| Mock Alpine | Real Alpine.js |
| Fast (ms) | Slower (seconds) |
| Isolated logic | Component interactions |
| No DOM rendering | Full DOM rendering |
| No reactivity | Alpine reactivity |

## Differences from E2E Tests

| Integration Tests | E2E Tests |
|------------------|-----------|
| Component-focused | User flow-focused |
| Direct store access | UI interactions only |
| Faster | Slower |
| Single browser | Multi-browser |
| More tests | Fewer tests |
| White-box | Black-box |

## Troubleshooting

### Tests timeout
- Increase `testTimeout` in config
- Check if data is loading (add console.logs)
- Verify dev server is running

### Alpine is undefined
- Add `await page.waitForFunction(() => window.Alpine !== undefined)`
- Check if main.js is loaded

### Store is empty
- Wait for data to load before testing
- Check network requests in browser console

### Flaky tests
- Add longer waits after state changes
- Use `page.waitForFunction()` instead of `waitForTimeout()`
- Clear localStorage in `beforeEach()`

### Cannot find module '@vitest/browser'
```bash
npm install --save-dev @vitest/browser
```

## Performance

Integration tests take ~1-2 seconds per test due to browser startup and Alpine initialization.

**Tips for speed:**
- Reuse browser instance (Vitest does this automatically)
- Group related tests in same file
- Use `beforeEach` efficiently
- Don't reload page unless necessary

## Coverage

Integration tests count toward code coverage:

```bash
npm run test:coverage
```

Coverage includes:
- Alpine store methods
- Filter logic
- Search implementation
- Favorites management
- Notification system

## Future Improvements

- [ ] Add visual regression tests (screenshots)
- [ ] Test map integration
- [ ] Test calendar export flows
- [ ] Test responsive breakpoints
- [ ] Add performance benchmarks
- [ ] Test keyboard navigation
- [ ] Test touch gestures properly

---

**Last Updated:** 2025-10-09
**Maintainer:** Claude Code
**Total Tests:** 61 integration tests
