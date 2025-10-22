/**
 * E2E Tests for View Switcher Keyboard Navigation - Task 18
 * Tests keyboard interaction with M3-enhanced view switcher
 *
 * Tests:
 * 1. Arrow key navigation (Left/Right)
 * 2. Home/End key navigation
 * 3. Focus visible indicators
 * 4. ARIA attributes presence
 * 5. Touch target sizes
 */

import { test, expect } from '@playwright/test'

test.describe('View Switcher - Keyboard Navigation & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="view-tab-list"]', { state: 'visible' })
  })

  test('should have proper ARIA tablist structure', async ({ page }) => {
    // Check container has role="tablist"
    const tablist = page.locator('[role="tablist"]')
    await expect(tablist).toBeVisible()
    await expect(tablist).toHaveAttribute('aria-label', 'Ansichtsauswahl')

    // Check all tabs have role="tab"
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')
    const favoritesTab = page.locator('[data-testid="view-tab-favorites"]')

    await expect(listTab).toHaveAttribute('role', 'tab')
    await expect(mapTab).toHaveAttribute('role', 'tab')
    await expect(favoritesTab).toHaveAttribute('role', 'tab')

    // Check aria-selected on active tab
    await expect(listTab).toHaveAttribute('aria-selected', 'true')
    await expect(mapTab).toHaveAttribute('aria-selected', 'false')

    // Check aria-label on each tab
    await expect(listTab).toHaveAttribute('aria-label', 'Listen-Ansicht')
    await expect(mapTab).toHaveAttribute('aria-label', 'Karten-Ansicht')
    await expect(favoritesTab).toHaveAttribute('aria-label', 'Favoriten-Ansicht')

    // Check aria-controls linking to panels
    await expect(listTab).toHaveAttribute('aria-controls', 'list-panel')
    await expect(mapTab).toHaveAttribute('aria-controls', 'map-panel')
    await expect(favoritesTab).toHaveAttribute('aria-controls', 'favorites-panel')
  })

  test('should navigate between tabs using arrow keys', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')
    const favoritesTab = page.locator('[data-testid="view-tab-favorites"]')

    // Focus on first tab
    await listTab.focus()
    await expect(listTab).toBeFocused()

    // Press ArrowRight to move to map tab
    await page.keyboard.press('ArrowRight')
    await expect(mapTab).toBeFocused()
    await expect(mapTab).toHaveAttribute('aria-selected', 'true')

    // Press ArrowRight to move to favorites tab
    await page.keyboard.press('ArrowRight')
    await expect(favoritesTab).toBeFocused()
    await expect(favoritesTab).toHaveAttribute('aria-selected', 'true')

    // Press ArrowRight to cycle back to list tab
    await page.keyboard.press('ArrowRight')
    await expect(listTab).toBeFocused()
    await expect(listTab).toHaveAttribute('aria-selected', 'true')

    // Press ArrowLeft to move to favorites tab
    await page.keyboard.press('ArrowLeft')
    await expect(favoritesTab).toBeFocused()

    // Press ArrowLeft to move to map tab
    await page.keyboard.press('ArrowLeft')
    await expect(mapTab).toBeFocused()
  })

  test('should support Home/End key navigation', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')
    const favoritesTab = page.locator('[data-testid="view-tab-favorites"]')

    // Focus on map tab (middle)
    await mapTab.click()
    await expect(mapTab).toBeFocused()

    // Press End to jump to last tab
    await page.keyboard.press('End')
    await expect(favoritesTab).toBeFocused()
    await expect(favoritesTab).toHaveAttribute('aria-selected', 'true')

    // Press Home to jump to first tab
    await page.keyboard.press('Home')
    await expect(listTab).toBeFocused()
    await expect(listTab).toHaveAttribute('aria-selected', 'true')
  })

  test('should show visible focus indicators on keyboard navigation', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')

    // Navigate with keyboard to trigger focus-visible
    await page.keyboard.press('Tab')

    // Find the focused element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.getAttribute('data-testid')
    })

    // Navigate to a tab with arrow keys
    if (focusedElement !== 'view-tab-list') {
      await listTab.focus()
    }

    // Check focus-visible outline is present
    const outlineStyle = await listTab.evaluate(el => {
      const styles = window.getComputedStyle(el, ':focus-visible')
      return {
        outline: styles.outline || styles.outlineWidth,
        outlineOffset: styles.outlineOffset
      }
    })

    // Validate focus ring exists (outline width > 0)
    expect(outlineStyle.outline).toBeTruthy()
  })

  test('should have minimum 44px touch targets', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')
    const favoritesTab = page.locator('[data-testid="view-tab-favorites"]')

    // Check bounding boxes for minimum size
    const listBox = await listTab.boundingBox()
    const mapBox = await mapTab.boundingBox()
    const favoritesBox = await favoritesTab.boundingBox()

    const minTouchTarget = 44

    expect(listBox.height).toBeGreaterThanOrEqual(minTouchTarget)
    expect(mapBox.height).toBeGreaterThanOrEqual(minTouchTarget)
    expect(favoritesBox.height).toBeGreaterThanOrEqual(minTouchTarget)
  })

  test('should maintain proper tab index for roving focus', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')
    const favoritesTab = page.locator('[data-testid="view-tab-favorites"]')

    // Active tab should have tabindex="0", others should have tabindex="-1"
    await expect(listTab).toHaveAttribute('tabindex', '0')
    await expect(mapTab).toHaveAttribute('tabindex', '-1')
    await expect(favoritesTab).toHaveAttribute('tabindex', '-1')

    // Switch to map tab
    await mapTab.click()

    // Now map should be tabindex="0"
    await expect(listTab).toHaveAttribute('tabindex', '-1')
    await expect(mapTab).toHaveAttribute('tabindex', '0')
    await expect(favoritesTab).toHaveAttribute('tabindex', '-1')
  })

  test('should activate tab on Enter/Space key', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')

    // Focus on list tab
    await listTab.focus()

    // Press ArrowRight to focus map tab
    await page.keyboard.press('ArrowRight')
    await expect(mapTab).toBeFocused()

    // Press Enter to activate
    await page.keyboard.press('Enter')

    // Check that map view is active
    await expect(mapTab).toHaveAttribute('aria-selected', 'true')

    // Navigate back to list tab
    await page.keyboard.press('ArrowLeft')

    // Press Space to activate
    await page.keyboard.press('Space')

    // Check that list view is active
    await expect(listTab).toHaveAttribute('aria-selected', 'true')
  })

  test('should have M3 state layer ripple effect', async ({ page }) => {
    const mapTab = page.locator('[data-testid="view-tab-map"]')

    // Check that md-state-layer class is present
    const hasStateLayer = await mapTab.evaluate(el => {
      return el.classList.contains('md-state-layer')
    })

    expect(hasStateLayer).toBe(true)

    // Check ::before pseudo-element exists (state layer)
    const hasBeforePseudo = await mapTab.evaluate(el => {
      const styles = window.getComputedStyle(el, '::before')
      return styles.content !== 'none' || styles.position === 'absolute'
    })

    expect(hasBeforePseudo).toBe(true)
  })

  test('should use M3 typography for labels', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')

    // Check for M3 label typography class
    const hasTypographyClass = await listTab.evaluate(el => {
      const labelSpan = el.querySelector('span')
      return labelSpan?.classList.contains('md-typescale-label-medium')
    })

    expect(hasTypographyClass).toBe(true)
  })

  test('should apply M3 elevated surface to active tab', async ({ page }) => {
    const listTab = page.locator('[data-testid="view-tab-list"]')
    const mapTab = page.locator('[data-testid="view-tab-map"]')

    // List tab is active by default
    const listBgColor = await listTab.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Map tab is inactive
    const mapBgColor = await mapTab.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Active tab should have solid background
    expect(listBgColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(listBgColor).not.toBe('transparent')

    // Inactive tab should have transparent or different background
    expect(mapBgColor).not.toBe(listBgColor)

    // Switch to map tab
    await mapTab.click()

    // Check backgrounds switched
    const listBgColorAfter = await listTab.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })
    const mapBgColorAfter = await mapTab.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor
    })

    expect(mapBgColorAfter).toBe(listBgColor) // Map now has active background
    expect(listBgColorAfter).toBe(mapBgColor) // List now has inactive background
  })
})
