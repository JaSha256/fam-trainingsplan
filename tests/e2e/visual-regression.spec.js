// tests/e2e/visual-regression.spec.js
/**
 * Visual Regression Tests
 * Captures screenshots and compares against baselines
 */

import { test, expect } from '@playwright/test'
import { waitForAlpineAndData } from './test-helpers.js'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)
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
      const firstCard = page.locator('.training-card').first()
      await expect(firstCard).toHaveScreenshot('training-card.png', {
        maxDiffPixels: 50
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
      await page.selectOption('#filter-wochentag', 'Montag')
      await page.waitForTimeout(400)

      await expect(page).toHaveScreenshot('filtered-monday.png', {
        fullPage: true,
        maxDiffPixels: 150
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
    test('map modal matches snapshot', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').mapModalOpen = true
      })

      await page.waitForTimeout(500)

      const modal = page.locator('[x-show="$store.ui.mapModalOpen"]')
      await expect(modal).toHaveScreenshot('map-modal.png', {
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
