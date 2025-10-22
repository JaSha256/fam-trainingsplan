// tests/e2e/visual-regression.spec.js
/**
 * Visual Regression Tests - TODO v4.1
 *
 * @version 4.0.1
 * @status SKIPPED - Fundamental data loading issue
 *
 * PROBLEM DISCOVERED:
 * - App loads data from external GitHub Pages URL, not local dev server
 * - Route mocking works (data arrives) but Alpine.js rendering fails
 * - Metadata properties undefined despite successful API response
 * - .env.local approach breaks app entirely (blank screen)
 *
 * DEBUGGING DONE (2+ hours):
 * 1. Tried Playwright route mocking → Data loads but Alpine fails
 * 2. Tried local fixture in /public → App ignores it, uses external URL
 * 3. Tried .env.local with VITE_API_URL → Breaks app completely
 * 4. Analyzed data-loader.js → Double-loading race condition suspected
 *
 * ROOT CAUSE:
 * Alpine.js state remains empty (allTrainings: 0, metadata: null) despite
 * successful data fetch. Likely timing/race condition in Alpine reactivity.
 *
 * NEXT STEPS for v4.1:
 * - Consider MSW (Mock Service Worker) for API mocking
 * - Or: Setup local API proxy server
 * - Or: Fix Alpine timing issue (needs deeper investigation)
 * - Generate baseline snapshots once data loading is fixed
 *
 * Usage:
 * - npm run test:visual              # Currently all skipped
 * - npm run test:visual:update       # Won't work until fixed
 */

import { test, expect } from '@playwright/test'

/**
 * Wait for Alpine.js and training data to load
 * CRITICAL: Wait for DOM rendering, not just state
 */
async function waitForAlpineAndData(page, timeout = 15000) {
  // Wait for Alpine.js to initialize
  await page.waitForFunction(() => window.Alpine !== undefined, { timeout })

  // Wait for training data to load from dev server
  await page.waitForFunction(() => {
    const component = window.Alpine?.$data(document.querySelector('[x-data]'))
    return component?.allTrainings?.length > 0
  }, { timeout })

  // CRITICAL: Wait for training cards to actually render in DOM
  // Alpine's x-for takes time to render elements after data loads
  await page.waitForSelector('.training-card', { state: 'visible', timeout })

  // Wait for at least a few cards to ensure rendering is complete
  await page.waitForFunction(() => {
    return document.querySelectorAll('.training-card').length >= 3
  }, { timeout: 5000 })
}

/**
 * Wait for visual stability before capturing screenshots
 * Ensures fonts, images, and animations are complete
 */
async function waitForVisualStability(page, options = {}) {
  const {
    waitForFonts = true,
    waitForImages = true,
    stabilityTimeout = 500
  } = options

  // Wait for fonts to load
  if (waitForFonts) {
    await page.evaluate(() => document.fonts.ready)
  }

  // Wait for images to load
  if (waitForImages) {
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter(img => !img.complete)
          .map(img => new Promise(resolve => {
            img.onload = img.onerror = resolve
          }))
      )
    })
  }

  // Wait for network to be idle
  await page.waitForLoadState('networkidle')

  // Final stability wait for animations
  await page.waitForTimeout(stabilityTimeout)
}

test.describe('Visual Regression Tests - Design Upgrade v4.1', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/')

    // Wait for Alpine.js and data to load
    await waitForAlpineAndData(page)

    // Wait for visual stability
    await waitForVisualStability(page)
  })

  test.describe('Homepage Views', () => {
    test('homepage desktop view matches snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })

    test('homepage mobile view matches snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })

    test('homepage tablet view matches snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })
  })

  test.describe('Component Snapshots', () => {
    test('filter sidebar matches snapshot', async ({ page }) => {
      const sidebar = page.locator('aside.hidden.lg\\:block')
      await expect(sidebar).toHaveScreenshot('filter-sidebar.png', {
        maxDiffPixels: 50
      })
    })

    test('training card matches snapshot', async ({ page }) => {
      // Cards are already loaded by beforeEach, just wait a bit for rendering
      await page.waitForTimeout(500)

      const firstCard = page.locator('.training-card').first()
      await expect(firstCard).toHaveScreenshot('training-card.png', {
        maxDiffPixels: 50,
        timeout: 10000
      })
    })

    test('mobile header matches snapshot', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(300)

      const header = page.locator('header.lg\\:hidden')
      await expect(header).toHaveScreenshot('mobile-header.png', {
        maxDiffPixels: 30
      })
    })
  })

  test.describe('Filter States', () => {
    test('filtered results view matches snapshot', async ({ page }) => {
      // Data and filters already loaded by beforeEach, just wait for rendering
      await page.waitForTimeout(500)

      // Select filter option
      await page.selectOption('#filter-wochentag', 'Montag')

      // Wait for filter to apply
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('filtered-monday.png', {
        fullPage: true,
        maxDiffPixels: 150,
        timeout: 10000
      })
    })

    test('search results view matches snapshot', async ({ page }) => {
      await page.fill('#search', 'Parkour')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('search-parkour.png', {
        fullPage: true,
        maxDiffPixels: 150
      })
    })

    test('no results view matches snapshot', async ({ page }) => {
      await page.fill('#search', 'nonexistent')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('no-results.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })
  })

  test.describe('Modal States', () => {
    test('map view matches snapshot', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').activeView = 'map'
      })

      await page.waitForTimeout(500)

      const mapView = page.locator('[x-show="$store.ui.activeView === \'map\'"]')
      await expect(mapView).toHaveScreenshot('map-view.png', {
        maxDiffPixels: 100
      })
    })

    test('notification toast matches snapshot', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Test message', 'info', 0)
      })

      await page.waitForTimeout(200)

      const notification = page.locator('[data-notification]')
      await expect(notification).toHaveScreenshot('notification-info.png', {
        maxDiffPixels: 30
      })
    })

    test('error notification matches snapshot', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Error occurred', 'error', 0)
      })

      await page.waitForTimeout(200)

      const notification = page.locator('[data-notification]')
      await expect(notification).toHaveScreenshot('notification-error.png', {
        maxDiffPixels: 30
      })
    })

    test('success notification matches snapshot', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Success!', 'success', 0)
      })

      await page.waitForTimeout(200)

      const notification = page.locator('[data-notification]')
      await expect(notification).toHaveScreenshot('notification-success.png', {
        maxDiffPixels: 30
      })
    })
  })

  test.describe('Mobile Specific', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('mobile filter drawer open matches snapshot', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').mobileFilterOpen = true
      })

      await page.waitForTimeout(400)

      await expect(page).toHaveScreenshot('mobile-filter-open.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })
  })

  test.describe('Theme Consistency', () => {
    test('color scheme is consistent', async ({ page }) => {
      // Capture full page to verify color consistency
      await expect(page).toHaveScreenshot('color-scheme.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })

    test('typography is consistent', async ({ page }) => {
      const mainContent = page.locator('#main-content')
      await expect(mainContent).toHaveScreenshot('typography.png', {
        maxDiffPixels: 50
      })
    })
  })

  test.describe('Loading States', () => {
    test('loading state matches snapshot', async ({ page }) => {
      // Navigate to page and capture before data loads
      await page.goto('/', { waitUntil: 'domcontentloaded' })

      // Wait a bit for potential loading indicator
      await page.waitForTimeout(100)

      // Try to capture loading state (if visible)
      const loadingIndicator = page.locator('[x-show="loading"]')
      const isVisible = await loadingIndicator.isVisible().catch(() => false)

      if (isVisible) {
        await expect(loadingIndicator).toHaveScreenshot('loading-state.png', {
          maxDiffPixels: 30
        })
      } else {
        // Loading too fast, skip test
        test.skip()
      }
    })
  })

  test.describe('Responsive Breakpoints', () => {
    const breakpoints = [
      { name: 'mobile-small', width: 320, height: 568 },
      { name: 'mobile', width: 375, height: 667 },
      { name: 'mobile-large', width: 425, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'laptop', width: 1366, height: 768 },
      { name: 'desktop', width: 1920, height: 1080 }
    ]

    for (const breakpoint of breakpoints) {
      test(`${breakpoint.name} (${breakpoint.width}x${breakpoint.height}) matches snapshot`, async ({ page }) => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
        await page.waitForTimeout(500)

        await expect(page).toHaveScreenshot(`breakpoint-${breakpoint.name}.png`, {
          fullPage: false, // Just above-fold
          maxDiffPixels: 100
        })
      })
    }
  })

  test.describe('Dark Mode Ready', () => {
    test('page structure supports future dark mode', async ({ page }) => {
      // Capture current light mode as baseline
      await expect(page).toHaveScreenshot('light-mode-baseline.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })
  })
})
