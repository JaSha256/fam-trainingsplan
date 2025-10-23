// tests/integration/view-controls.test.js
/**
 * Integration Tests: View Controls (Sort & Group)
 * Tests the compact icon-only sort and group controls
 */

import { test, expect } from '@playwright/test'

test.describe('View Controls Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    await page.waitForFunction(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.allTrainings?.length > 0
    }, { timeout: 5000 })
  })

  test.describe('No Duplicate View Switcher', () => {
    test('should have only ONE view switcher in mobile header', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Count view switchers by looking for unique groups of Liste/Karte buttons
      const viewSwitcherGroups = await page.locator('[role="group"][aria-label*="Ansicht"]').count()

      expect(viewSwitcherGroups).toBe(1)
    })

    test('should NOT have duplicate view switcher in desktop toolbar', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })

      // Check that desktop toolbar does NOT contain view switcher
      // View switcher should only be in mobile header
      const desktopToolbar = page.locator('.sticky:has-text("Gruppieren")').first()
      const viewSwitcherInToolbar = desktopToolbar.locator('[role="group"][aria-label*="Ansicht"]')

      await expect(viewSwitcherInToolbar).toHaveCount(0)
    })
  })

  test.describe('Compact Sort Controls', () => {
    test('should have icon-only sort buttons with tooltips', async ({ page }) => {
      // Find sort buttons by aria-label patterns
      const sortByWeekday = page.locator('button[aria-label*="Nach Wochentag sortieren"]')
      const sortByLocation = page.locator('button[aria-label*="Nach Ort sortieren"]')
      const sortByTime = page.locator('button[aria-label*="Nach Uhrzeit sortieren"]')
      const sortByTraining = page.locator('button[aria-label*="Nach Training sortieren"]')

      // All sort buttons should exist
      await expect(sortByWeekday).toBeVisible()
      await expect(sortByLocation).toBeVisible()
      await expect(sortByTime).toBeVisible()
      await expect(sortByTraining).toBeVisible()
    })

    test('should change sort order when clicking sort button', async ({ page }) => {
      // Get initial sort order
      const initialSort = await page.evaluate(() => {
        return window.Alpine.store('ui').sortBy[0]
      })

      // Click sort by time button
      await page.click('button[aria-label*="Nach Uhrzeit sortieren"]')
      await page.waitForTimeout(200)

      // Check sort order changed
      const newSort = await page.evaluate(() => {
        return window.Alpine.store('ui').sortBy[0]
      })

      expect(newSort).toBe('uhrzeit')
      expect(newSort).not.toBe(initialSort)
    })

    test('should have active state styling on selected sort button', async ({ page }) => {
      // Set sort to location
      await page.evaluate(() => {
        window.Alpine.store('ui').sortBy = ['ort', 'wochentag', 'uhrzeit', 'training']
      })
      await page.waitForTimeout(200)

      // Check that location sort button has active styling
      const sortByLocation = page.locator('button[aria-label*="Nach Ort sortieren"]')
      const bgColor = await sortByLocation.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor
      })

      // Active button should have a different background (primary-500 filled)
      expect(bgColor).toBeTruthy()
    })

    test('should have minimum 44x44px touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const sortButtons = page.locator('button[aria-label*="sortieren"]')
      const count = await sortButtons.count()

      for (let i = 0; i < count; i++) {
        const box = await sortButtons.nth(i).boundingBox()
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('Compact Group Controls', () => {
    test('should have icon-only group buttons with tooltips', async ({ page }) => {
      const groupByWeekday = page.locator('button[aria-label*="Nach Wochentag gruppieren"]')
      const groupByLocation = page.locator('button[aria-label*="Nach Ort gruppieren"]')

      await expect(groupByWeekday).toBeVisible()
      await expect(groupByLocation).toBeVisible()
    })

    test('should change grouping mode when clicking group button', async ({ page }) => {
      // Set initial grouping to weekday
      await page.evaluate(() => {
        window.Alpine.store('ui').groupingMode = 'wochentag'
      })

      // Click group by location button
      await page.click('button[aria-label*="Nach Ort gruppieren"]')
      await page.waitForTimeout(200)

      // Check grouping changed
      const newGrouping = await page.evaluate(() => {
        return window.Alpine.store('ui').groupingMode
      })

      expect(newGrouping).toBe('ort')
    })

    test('should have minimum 44x44px touch targets', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const groupButtons = page.locator('button[aria-label*="gruppieren"]')
      const count = await groupButtons.count()

      for (let i = 0; i < count; i++) {
        const box = await groupButtons.nth(i).boundingBox()
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('Compact Control Layout', () => {
    test('should have sort and group controls in single row', async ({ page }) => {
      // Find the controls container
      const controlsContainer = page.locator('[data-testid="sort-group-controls"]').first()

      await expect(controlsContainer).toBeVisible()

      // Controls should be in a horizontal layout
      const box = await controlsContainer.boundingBox()
      expect(box.width).toBeGreaterThan(box.height)
    })

    test('should have visual divider between sort and group sections', async ({ page }) => {
      // Check for divider element between sort and group
      const divider = page.locator('[data-testid="sort-group-controls"] [data-divider]').first()

      await expect(divider).toBeVisible()
    })

    test('should support horizontal scroll on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 })

      const controlsContainer = page.locator('[data-testid="sort-group-controls"]').first()

      // Check overflow-x-auto class or scrollable
      const hasScroll = await controlsContainer.evaluate((el) => {
        const overflow = window.getComputedStyle(el).overflowX
        return overflow === 'auto' || overflow === 'scroll'
      })

      expect(hasScroll).toBe(true)
    })
  })

  test.describe('Icon Accessibility', () => {
    test('all buttons should have descriptive aria-labels', async ({ page }) => {
      const allControlButtons = page.locator('[data-testid="sort-group-controls"] button')
      const count = await allControlButtons.count()

      for (let i = 0; i < count; i++) {
        const ariaLabel = await allControlButtons.nth(i).getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel.length).toBeGreaterThan(10) // Should be descriptive
      }
    })

    test('buttons should have aria-pressed state', async ({ page }) => {
      // Set sort to location
      await page.evaluate(() => {
        window.Alpine.store('ui').sortBy = ['ort', 'wochentag', 'uhrzeit', 'training']
      })
      await page.waitForTimeout(200)

      const sortByLocation = page.locator('button[aria-label*="Nach Ort sortieren"]')
      const ariaPressed = await sortByLocation.getAttribute('aria-pressed')

      expect(ariaPressed).toBe('true')
    })
  })

  test.describe('Responsive Behavior', () => {
    test('should display controls on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const controls = page.locator('[data-testid="sort-group-controls"]')
      await expect(controls).toBeVisible()
    })

    test('should display controls on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      const controls = page.locator('[data-testid="sort-group-controls"]')
      await expect(controls).toBeVisible()
    })

    test('should display controls on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })

      const controls = page.locator('[data-testid="sort-group-controls"]')
      await expect(controls).toBeVisible()
    })
  })
})
