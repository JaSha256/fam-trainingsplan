// tests/e2e/visual-simple.spec.js
/**
 * Simple Visual Regression Test
 * Tests core homepage views to generate initial baselines
 */

import { test, expect } from '@playwright/test'
import {
  setupTestDataMocking,
  waitForAlpineAndData,
  waitForVisualStability
} from './test-helpers.js'

test.describe('Visual Regression - Core Views', () => {
  test.setTimeout(60000)

  test.beforeEach(async ({ page }) => {
    await setupTestDataMocking(page)
    await page.goto('/')
    await waitForAlpineAndData(page)
    await waitForVisualStability(page)
  })

  test('homepage desktop matches snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixels: 100
    })
  })

  test('homepage mobile matches snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixels: 100
    })
  })

  test('training card matches snapshot', async ({ page }) => {
    await page.waitForTimeout(500)

    const firstCard = page.locator('.training-card, article').first()
    await expect(firstCard).toHaveScreenshot('training-card.png', {
      maxDiffPixels: 50
    })
  })
})
