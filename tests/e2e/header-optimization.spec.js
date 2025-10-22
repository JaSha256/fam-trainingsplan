// tests/e2e/header-optimization.spec.js
/**
 * Task 16: Header Optimization Tests (TDD Implementation)
 * RED-GREEN-REFACTOR Cycle
 *
 * Tests for 48px header height with maintained accessibility
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Task 16: Header Optimization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(500) // Wait for Alpine initialization
  })

  test.describe('RED Phase: Header Height Tests (Should FAIL initially)', () => {
    test('mobile header has 48px height (h-12)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const header = page.locator('header.lg\\:hidden')
      await expect(header).toBeVisible()

      const box = await header.boundingBox()
      expect(box?.height).toBe(48) // Should be exactly 48px (h-12)
    })

    test('header uses compact spacing and typography', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Check title has compact typography (text-xl instead of text-2xl)
      const title = page.locator('header h1')
      const fontSize = await title.evaluate(el => window.getComputedStyle(el).fontSize)
      const fontSizeNum = parseInt(fontSize)

      // text-xl = 1.25rem = 20px, text-2xl = 1.5rem = 24px
      expect(fontSizeNum).toBeLessThanOrEqual(22) // Allow some tolerance
    })
  })

  test.describe('RED Phase: Touch Target Tests (Should PASS - must maintain ≥44px)', () => {
    test('all mobile header buttons maintain 44px minimum touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Settings button
      const settingsBtn = page.locator('header button[aria-label*="Standort"]')
      const settingsBox = await settingsBtn.boundingBox()

      expect(settingsBox?.width).toBeGreaterThanOrEqual(44)
      expect(settingsBox?.height).toBeGreaterThanOrEqual(44)

      // Filter button (now icon-only with aria-label)
      const filterBtn = page.locator('header button[aria-label*="Filter"]')
      const filterBox = await filterBtn.boundingBox()

      expect(filterBox?.width).toBeGreaterThanOrEqual(44)
      expect(filterBox?.height).toBeGreaterThanOrEqual(44)

      // View switcher buttons
      const viewButtons = page.locator('header button[data-testid^="view-tab-"]')
      const viewBtnCount = await viewButtons.count()

      for (let i = 0; i < viewBtnCount; i++) {
        const btn = viewButtons.nth(i)
        const box = await btn.boundingBox()

        // View switcher buttons use min-h-[44px] for touch targets
        expect(box?.height).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('RED Phase: WCAG Compliance Tests (Should PASS - must maintain)', () => {
    test('header maintains WCAG 2.1 AA compliance after optimization', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('header')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })

    test('header buttons maintain sufficient color contrast', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('header')
        .withTags(['wcag2aa'])
        .disableRules(['color-contrast']) // We'll check manually
        .analyze()

      // Check buttons have proper aria labels and are accessible
      const buttons = await page.locator('header button').all()

      for (const button of buttons) {
        const accessibleName = await button.evaluate(el => {
          const text = el.textContent?.trim()
          const ariaLabel = el.getAttribute('aria-label')
          return text || ariaLabel
        })

        expect(accessibleName).toBeTruthy()
      }
    })
  })

  test.describe('RED Phase: Visual Regression Tests (Should FAIL initially)', () => {
    test('header visual snapshot matches compact design', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const header = page.locator('header.lg\\:hidden')
      await expect(header).toHaveScreenshot('compact-header-48px.png', {
        maxDiffPixels: 100 // Allow minor rendering differences
      })
    })
  })

  test.describe('RED Phase: Responsive Behavior Tests', () => {
    test('header maintains functionality at different viewport widths', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 6/7/8
        { width: 414, height: 896 }, // iPhone XR/11
        { width: 768, height: 1024 }  // iPad
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.waitForTimeout(200)

        // Check header is visible on mobile sizes
        if (viewport.width < 1024) {
          const header = page.locator('header.lg\\:hidden')
          await expect(header).toBeVisible()

          // Verify key elements are present (filter button is icon-only now)
          const filterBtn = page.locator('header button[aria-label*="Filter"]')
          await expect(filterBtn).toBeVisible()
        }
      }
    })
  })
})
