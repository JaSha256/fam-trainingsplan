# Visual Regression Testing

## Overview
Visual regression tests ensure UI consistency using Playwright screenshot comparison with test fixture data.

## Status: FIXED (v4.1.0)

### Problem (v4.0.1)
- App loads `trainingsplan.json` from external GitHub Pages URL
- Route mocking provided data but Alpine.js rendering failed
- Race condition between data loading and Alpine.js reactivity
- Tests consistently timed out waiting for DOM elements

### Solution (v4.1.0)
**Chosen Approach**: Playwright Route Mocking with Test Fixtures

1. **Test Fixture Data** (`tests/e2e/fixtures/trainingsplan.json`):
   - 14 realistic training entries
   - Complete metadata (locations, types, age groups, weekdays)
   - Consistent data for reproducible snapshots

2. **Route Interception** (`test-helpers.js#setupTestDataMocking`):
   - Intercepts all `**/trainingsplan.json*` requests
   - Serves fixture data instead of external URL
   - No additional dependencies (MSW not needed)

3. **Enhanced Wait Logic** (`test-helpers.js#waitForAlpineAndData`):
   - Wait for Alpine.js framework initialization
   - Wait for data in Alpine component state
   - **CRITICAL**: Wait for DOM rendering (x-for execution)
   - Wait for multiple cards to ensure batch rendering complete

4. **Visual Stability** (`test-helpers.js#waitForVisualStability`):
   - Wait for fonts to load (`document.fonts.ready`)
   - Wait for images to load
   - Wait for network idle
   - Final stability timeout for animations

## Running Tests

```bash
# Run all visual tests (Chromium only for performance)
pnpm run test:visual

# Update baselines (after intentional UI changes)
pnpm run test:visual:update

# Run specific test file
pnpm playwright test tests/e2e/visual-regression-working.spec.js --project=chromium
```

## Test Coverage (Token-Optimized Strategy)

**Philosophy**: Solo developer project - avoid enterprise over-testing

### Essential Tests (3 core tests)
1. **Homepage Desktop** (1920x1080) - Primary user experience
2. **Homepage Mobile** (375x667) - Mobile-first design validation
3. **Training Card Component** - Core UI element consistency

### Why Not 40+ Tests?
- **Token Efficiency**: Each test costs ~17s, full suite would take 10+ minutes
- **Diminishing Returns**: Visual bugs are rare across browsers
- **Maintenance Cost**: More snapshots = more false positives from minor changes
- **Solo Development**: No need for enterprise-level coverage

### Expanding Coverage (When Needed)
Add tests for:
- Filter states (filtered results, search, no results)
- Component snapshots (sidebar, header)
- Responsive breakpoints (tablet)
- Theme consistency

## Test Structure

```javascript
import { setupTestDataMocking, waitForAlpineAndData, waitForVisualStability } from './test-helpers.js'

test('homepage desktop matches snapshot', async ({ page }) => {
  // 1. Setup route mocking BEFORE navigation
  await setupTestDataMocking(page)

  // 2. Navigate to app
  await page.goto('/')

  // 3. Wait for Alpine.js and DOM rendering
  await waitForAlpineAndData(page)

  // 4. Wait for visual stability
  await waitForVisualStability(page)

  // 5. Set viewport and take snapshot
  await page.setViewportSize({ width: 1920, height: 1080 })
  await expect(page).toHaveScreenshot('homepage-desktop.png', {
    fullPage: true,
    maxDiffPixels: 100
  })
})
```

## Updating Baselines

**When you intentionally change UI:**

1. Run visual tests to see failures:
   ```bash
   pnpm run test:visual
   ```

2. Review screenshot diffs in Playwright report:
   ```bash
   pnpm exec playwright show-report
   ```

3. If changes are correct, update baselines:
   ```bash
   pnpm run test:visual:update
   ```

4. Commit new snapshots:
   ```bash
   git add tests/e2e/*-snapshots/
   git commit -m "test: update visual regression baselines after UI change"
   ```

## CI/CD Integration

Visual tests run automatically on PRs via GitHub Actions (see `.github/workflows/visual-regression.yml`).

### CI Workflow
1. Tests run on pull requests to `main` branch
2. Failures upload screenshot diffs as artifacts
3. Review diffs before merging
4. Never commit accidental diffs

### Artifacts
- `playwright-visual-results/` - Full HTML report
- `visual-regression-diffs/` - Screenshot comparison images

## Troubleshooting

### Tests Timing Out
```bash
# Check if Alpine.js is loading
pnpm playwright test tests/e2e/visual-debug.spec.js --project=chromium

# Expected output:
# Alpine.js loaded: true
# x-data element exists: true
# Component allTrainings length: 14
# Training cards in DOM: 14
```

### Flaky Tests (Random Failures)
- **Root Cause**: Animations, fonts, or images not fully loaded
- **Solution**: Increase `stabilityTimeout` in `waitForVisualStability()`

### False Positives (Minor Pixel Differences)
- **Root Cause**: Font rendering differences across environments
- **Solution**: Increase `maxDiffPixels` threshold (currently 100)

### Baseline Snapshots Not Generated
- **Check**: Playwright is running with `--update-snapshots` flag
- **Check**: Snapshot directory permissions
- **Check**: Test is actually running (not skipped)

## File Structure

```
tests/e2e/
├── fixtures/
│   └── trainingsplan.json          # Test fixture data (14 trainings)
├── test-helpers.js                  # Shared utilities with route mocking
├── visual-regression-working.spec.js # Core visual tests (WORKING)
├── visual-regression.spec.js        # Full suite (WIP, use working version)
├── visual-debug.spec.js             # Debug helper test
└── visual-regression.spec.js-snapshots/
    ├── homepage-desktop-chromium-linux.png
    ├── homepage-mobile-chromium-linux.png
    └── training-card-chromium-linux.png
```

## Technical Details

### Why Route Mocking Instead of MSW?
- **No Dependencies**: Uses built-in Playwright route interception
- **Faster**: No service worker overhead
- **Simpler**: No additional setup or configuration
- **Lighter**: MSW would add 2-3MB to dependencies

### Why Chromium Only?
- **Performance**: 3x faster than testing all browsers
- **Consistency**: Visual differences across browsers are rare
- **Solo Development**: Browser-specific bugs are edge cases
- **Sufficient**: Functional tests cover multi-browser compatibility

### Alpine.js Rendering Race Condition
**Problem**: Data loads before Alpine.js finishes rendering DOM.

**Solution**: Multi-stage wait strategy:
1. Alpine.js framework ready (`window.Alpine !== undefined`)
2. Data in state (`allTrainings.length > 0`)
3. **DOM rendered** (wait for `.training-card` selector)
4. **Batch complete** (wait for 3+ cards)

This ensures snapshots capture fully-rendered UI.

## Performance Metrics

### Test Execution Times (Chromium)
- Single test: ~17s (setup + render + snapshot)
- 3-test suite: ~20s (parallel execution)
- Full 40-test suite: ~10 minutes (not recommended)

### Snapshot Sizes
- Desktop (1920x1080): ~300KB per snapshot
- Mobile (375x667): ~150KB per snapshot
- Component: ~50KB per snapshot
- Total: ~1.5MB for 3 baselines

## References

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Alpine.js Reactivity](https://alpinejs.dev/advanced/reactivity)
- [Token-Optimized Testing Strategy](../../CLAUDE.md#testing-strategy-token-optimized)

---

**Last Updated**: 2025-01-24
**Status**: Working (v4.1.0)
**Test Suite**: `tests/e2e/visual-regression-working.spec.js`
