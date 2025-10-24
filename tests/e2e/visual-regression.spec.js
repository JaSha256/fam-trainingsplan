// tests/e2e/visual-regression.spec.js
/**
 * Visual Regression Tests
 *
 * @version 4.1.0
 * @status FIXED - Route mocking with test fixtures
 *
 * SOLUTION IMPLEMENTED:
 * - Playwright route mocking intercepts trainingsplan.json requests
 * - Serves consistent test fixture data from tests/e2e/fixtures/
 * - Enhanced waitForAlpineAndData() properly waits for DOM rendering
 * - No external dependencies (MSW not needed)
 *
 * STRATEGY (Token-Optimized for Solo Developer):
 * - Focus on critical UI paths only
 * - Chromium-only (cross-browser visual differences are rare)
 * - Essential views: Homepage (desktop/mobile), Components, Key Filters
 * - Total: 10 essential tests instead of 40+ comprehensive tests
 *
 * Usage:
 * - pnpm run test:visual              # Run all visual regression tests
 * - pnpm run test:visual:update       # Update baseline snapshots
 */

import { test, expect } from '@playwright/test'
import {
  setupTestDataMocking,
  waitForAlpineAndData,
  waitForVisualStability
} from './test-helpers.js'

test.describe('Visual Regression Tests - Essential Views', () => {
  test.setTimeout(60000)

  test.beforeEach(async ({ page }) => {
    // Setup route mocking BEFORE navigation
    await setupTestDataMocking(page)

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
      await page.waitForTimeout(500)

      const firstCard = page.locator('.training-card, article').first()
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
      await page.waitForTimeout(500)

      // Select filter option (using first select if available)
      const selectExists = await page.locator('#filter-wochentag').count()
      if (selectExists > 0) {
        await page.selectOption('#filter-wochentag', 'Montag')
        await page.waitForTimeout(500)
      }

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

  test.describe('Theme Consistency', () => {
    test('color scheme is consistent', async ({ page }) => {
      await expect(page).toHaveScreenshot('color-scheme.png', {
        fullPage: true,
        maxDiffPixels: 100
      })
    })
  })
})
