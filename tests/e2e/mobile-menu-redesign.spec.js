// tests/e2e/mobile-menu-redesign.spec.js
/**
 * Mobile Menu Redesign Tests
 * Tests for new mobile header structure with improved visual hierarchy
 *
 * RED PHASE: These tests describe the desired behavior before implementation
 */

import { test, expect } from '@playwright/test'
import { waitForAlpineAndData } from './test-helpers.js'

test.describe('Mobile Menu Redesign - Visual Hierarchy', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('mobile header is compact (48px height)', async ({ page }) => {
    const header = page.locator('header.lg\\:hidden')
    const box = await header.boundingBox()

    expect(box?.height).toBeLessThanOrEqual(48)
  })

  test('primary actions (Filter button) are immediately visible', async ({ page }) => {
    const filterButton = page.locator('button[aria-label*="Filter"]').first()

    await expect(filterButton).toBeVisible()
    const box = await filterButton.boundingBox()

    // Touch target size validation
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
  })

  test('filter button shows active filter count badge', async ({ page }) => {
    // Apply a filter via Alpine store directly and trigger filter application
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters.wochentag = ['Montag']
      // Call global applyFilters function
      if (typeof window.applyFilters === 'function') {
        window.applyFilters()
      }
    })
    await page.waitForTimeout(500)

    // Filter badge should be visible
    const badge = page.locator('button[aria-label*="Filter"] span').filter({ hasText: /^[0-9]+$/ })
    await expect(badge).toBeVisible()

    const badgeText = await badge.textContent()
    expect(parseInt(badgeText)).toBeGreaterThan(0)
  })

  test('overflow menu replaced with Material Design action sheet', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await expect(actionSheetTrigger).toBeVisible()

    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    // Action sheet should appear (dropdown/menu)
    const actionSheet = page.locator('[role="menu"]')
    await expect(actionSheet).toBeVisible()

    // Should have proper M3 styling
    const hasM3Styling = await actionSheet.evaluate(el => {
      const styles = window.getComputedStyle(el)
      return styles.backgroundColor !== 'rgba(0, 0, 0, 0)' // Has background
    })

    expect(hasM3Styling).toBe(true)
  })
})

test.describe('Mobile Menu - Action Grouping', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('export actions are grouped together in action sheet', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    // Check for Export section header
    const exportSection = page.locator('text=Export').first()
    await expect(exportSection).toBeVisible()

    // Check for export actions
    const icsExport = page.locator('[role="menuitem"]', { hasText: /ICS|Kalender/ })
    const printAction = page.locator('[role="menuitem"]', { hasText: /Drucken/ })

    await expect(icsExport).toBeVisible()
    await expect(printAction).toBeVisible()
  })

  test('share actions are grouped together in action sheet', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    // Check for Share section header
    const shareSection = page.locator('text=Teilen').first()
    await expect(shareSection).toBeVisible()

    // Check for share actions
    const shareLink = page.locator('[role="menuitem"]', { hasText: /Link|kopieren/ })
    await expect(shareLink).toBeVisible()
  })

  test('settings actions are grouped together in action sheet', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    // Check for Settings section header
    const settingsSection = page.locator('text=Einstellungen').first()
    await expect(settingsSection).toBeVisible()

    // Check for settings actions
    const darkModeToggle = page.locator('[role="menuitem"]', { hasText: /Dark Mode/ })
    const locationSettings = page.locator('[role="menuitem"]', { hasText: /Standort/ })

    await expect(darkModeToggle).toBeVisible()
    await expect(locationSettings).toBeVisible()
  })
})

test.describe('Mobile Menu - Touch Targets', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 428, height: 926 }) // iPhone 14 Pro Max
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('all interactive elements meet 44px minimum touch target', async ({ page }) => {
    const interactiveElements = [
      'button[aria-label*="Filter"]',
      'button[aria-label*="Weitere Optionen"]',
    ]

    for (const selector of interactiveElements) {
      const element = page.locator(selector).first()
      const box = await element.boundingBox()

      if (box) {
        expect(box.width, `${selector} width`).toBeGreaterThanOrEqual(44)
        expect(box.height, `${selector} height`).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('action sheet menu items have adequate touch targets', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    const menuItems = await page.locator('[role="menuitem"]').all()

    for (const item of menuItems.slice(0, 5)) {
      const box = await item.boundingBox()

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })
})

test.describe('Mobile Menu - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('filter button has proper ARIA attributes', async ({ page }) => {
    const filterButton = page.locator('button[aria-label*="Filter"]').first()

    const ariaLabel = await filterButton.getAttribute('aria-label')
    expect(ariaLabel).toBeTruthy()
    expect(ariaLabel).toContain('Filter')
  })

  test('action sheet has proper ARIA attributes', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')

    const ariaLabel = await actionSheetTrigger.getAttribute('aria-label')
    const ariaExpanded = await actionSheetTrigger.getAttribute('aria-expanded')

    expect(ariaLabel).toBeTruthy()
    expect(ariaExpanded).toBe('false')

    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    const ariaExpandedAfter = await actionSheetTrigger.getAttribute('aria-expanded')
    expect(ariaExpandedAfter).toBe('true')
  })

  test('action sheet menu has proper role and orientation', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible()

    const ariaOrientation = await menu.getAttribute('aria-orientation')
    expect(ariaOrientation).toBe('vertical')
  })

  test('keyboard navigation works for action sheet', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.focus()

    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible()

    // Escape should close menu
    await page.keyboard.press('Escape')
    await page.waitForTimeout(200)

    await expect(menu).not.toBeVisible()
  })
})

test.describe('Mobile Menu - Visual Separation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('action sheet has M3 elevation and surface styling', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    const menu = page.locator('[role="menu"]')
    const classes = await menu.getAttribute('class')

    // Should have proper styling classes
    expect(classes).toBeTruthy()
    expect(classes).toMatch(/shadow|rounded|bg-white/)
  })

  test('action groups have visual dividers', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    // Check for divider elements between sections
    const dividers = await page.locator('[role="menu"] .border-t').count()
    expect(dividers).toBeGreaterThanOrEqual(2) // At least 2 dividers for 3 sections
  })
})

test.describe('Mobile Menu - Integration with Existing Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('filter button integrates with active filter chips bar', async ({ page }) => {
    // Apply filter via Alpine store directly
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters.wochentag = ['Montag']
      // Call global applyFilters function
      if (typeof window.applyFilters === 'function') {
        window.applyFilters()
      }
    })
    await page.waitForTimeout(500)

    // Active filter chips bar should appear
    const filterChipsBar = page.locator('text=Aktive Filter').first()
    await expect(filterChipsBar).toBeVisible()

    // Filter button badge should show count
    const badge = page.locator('button[aria-label*="Filter"] span').filter({ hasText: /^[0-9]+$/ })
    await expect(badge).toBeVisible()

    const badgeText = await badge.textContent()
    expect(parseInt(badgeText)).toBeGreaterThan(0)
  })

  test('action sheet closes when clicking outside', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible()

    // Click outside (on header logo - use first() to avoid strict mode violation)
    await page.locator('img[alt*="Free Arts"]').first().click()
    await page.waitForTimeout(200)

    await expect(menu).not.toBeVisible()
  })

  test('action sheet actions work correctly', async ({ page }) => {
    const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
    await actionSheetTrigger.click()
    await page.waitForTimeout(200)

    // Click dark mode toggle
    const darkModeToggle = page.locator('[role="menuitem"]', { hasText: /Dark Mode/ })
    await darkModeToggle.click()

    await page.waitForTimeout(300)

    // Dark mode should be applied
    const darkModeState = await page.evaluate(() => {
      return window.Alpine.store('ui').darkMode
    })

    expect(darkModeState).toBeTruthy()
  })
})

test.describe('Mobile Menu - Responsive Behavior', () => {
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 390, height: 844, name: 'iPhone 12' },
    { width: 428, height: 926, name: 'iPhone 14 Pro Max' }
  ]

  for (const viewport of viewports) {
    test(`mobile menu works correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/')
      await waitForAlpineAndData(page)

      // Header should be visible
      const header = page.locator('header.lg\\:hidden')
      await expect(header).toBeVisible()

      // Filter button should be accessible
      const filterButton = page.locator('button[aria-label*="Filter"]').first()
      await expect(filterButton).toBeVisible()

      // Action sheet trigger should be accessible
      const actionSheetTrigger = page.locator('button[aria-label*="Weitere Optionen"]')
      await expect(actionSheetTrigger).toBeVisible()
    })
  }
})
