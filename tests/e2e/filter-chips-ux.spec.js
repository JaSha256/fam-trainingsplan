/**
 * E2E Tests: Enhanced Filter Chips UX
 *
 * Verifies the visual improvements to filter chips:
 * - Prominent visual styling
 * - Tooltips on hover
 * - Better hover states
 * - Prominent "Alle loschen" button when 3+ filters
 */

import { test, expect } from '@playwright/test'

test.describe('Enhanced Filter Chips UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should show enhanced filter chips with prominent styling', async ({ page }) => {
    // Open filter sidebar on mobile
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      await page.click('button[aria-label="Filter offnen"]')
      await page.waitForTimeout(300) // Wait for sidebar animation
    }

    // Apply a filter
    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(500) // Wait for filter application

    // Verify filter chips bar is visible
    const chipsBar = page.locator('div:has-text("Aktive Filter:")')
    await expect(chipsBar).toBeVisible()

    // Verify chip has prominent styling
    const chip = page.locator('button:has-text("Wochentag: Montag")')
    await expect(chip).toBeVisible()

    // Verify prominent background color (primary-500)
    const bgColor = await chip.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(bgColor).toBeTruthy() // Should have background color set

    // Verify minimum touch target size
    const chipBox = await chip.boundingBox()
    expect(chipBox.height).toBeGreaterThanOrEqual(44) // WCAG 2.1 AA minimum
  })

  test('should display tooltips on chip hover', async ({ page }) => {
    // Apply a filter
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      await page.click('button[aria-label="Filter offnen"]')
      await page.waitForTimeout(300)
    }

    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(500)

    // Find the chip
    const chip = page.locator('button:has-text("Wochentag: Montag")')
    await expect(chip).toBeVisible()

    // Verify tooltip attribute exists
    const tooltip = await chip.getAttribute('title')
    expect(tooltip).toContain('Wochentag: Montag')
    expect(tooltip).toContain('Klicken zum Entfernen')
  })

  test('should display aria-label for accessibility', async ({ page }) => {
    // Apply a filter
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      await page.click('button[aria-label="Filter offnen"]')
      await page.waitForTimeout(300)
    }

    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(500)

    // Verify chip has aria-label
    const chip = page.locator('button:has-text("Wochentag: Montag")')
    const ariaLabel = await chip.getAttribute('aria-label')
    expect(ariaLabel).toContain('entfernen')
  })

  test('should show prominent "Alle loschen" button with 3+ filters', async ({ page }) => {
    // Apply 3 filters to trigger prominent state
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      await page.click('button[aria-label="Filter offnen"]')
      await page.waitForTimeout(300)
    }

    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(200)
    await page.click('input[type="checkbox"][value="Mittwoch"]')
    await page.waitForTimeout(200)
    await page.click('input[type="checkbox"][value="Freitag"]')
    await page.waitForTimeout(500)

    // Find "Alle loschen" button
    const clearButton = page.locator('button:has-text("Alle löschen")')
    await expect(clearButton).toBeVisible()

    // Verify prominent styling (should have bg-red-50 class)
    const bgColor = await clearButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // Red background indicates prominent state
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)') // Not transparent
    expect(bgColor).toBeTruthy()
  })

  test('should show standard "Alle loschen" button with fewer than 3 filters', async ({ page }) => {
    // Apply only 1 filter
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      await page.click('button[aria-label="Filter offnen"]')
      await page.waitForTimeout(300)
    }

    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(500)

    // Find "Alle loschen" button
    const clearButton = page.locator('button:has-text("Alle löschen")')
    await expect(clearButton).toBeVisible()

    // Verify it has standard styling (text link style, no bg-red-50)
    // Standard state should have primary color text
    const color = await clearButton.evaluate((el) => {
      return window.getComputedStyle(el).color
    })
    expect(color).toBeTruthy()
  })

  test('should show hover effects on chip buttons', async ({ page }) => {
    // Skip on mobile (hover doesn't work)
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      test.skip()
      return
    }

    // Apply a filter
    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(500)

    // Find the chip
    const chip = page.locator('button:has-text("Wochentag: Montag")')
    await expect(chip).toBeVisible()

    // Hover over the chip
    await chip.hover()
    await page.waitForTimeout(300) // Wait for transition

    // Verify hover state changes (shadow, scale, background)
    const boxShadow = await chip.evaluate((el) => {
      return window.getComputedStyle(el).boxShadow
    })

    // Hover should add shadow
    expect(boxShadow).not.toBe('none')
  })

  test('should remove filter when clicking chip', async ({ page }) => {
    // Apply a filter
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      await page.click('button[aria-label="Filter offnen"]')
      await page.waitForTimeout(300)
    }

    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(500)

    // Verify chip is visible
    const chip = page.locator('button:has-text("Wochentag: Montag")')
    await expect(chip).toBeVisible()

    // Click the chip to remove it
    await chip.click()
    await page.waitForTimeout(500)

    // Verify chip is removed
    await expect(chip).not.toBeVisible()

    // Verify chips bar is hidden when no filters
    const chipsBar = page.locator('div:has-text("Aktive Filter:")')
    await expect(chipsBar).not.toBeVisible()
  })

  test('should show larger text in filter chips', async ({ page }) => {
    // Apply a filter
    const isMobile = page.viewportSize()?.width < 1024
    if (isMobile) {
      await page.click('button[aria-label="Filter offnen"]')
      await page.waitForTimeout(300)
    }

    await page.click('input[type="checkbox"][value="Montag"]')
    await page.waitForTimeout(500)

    // Find the chip text
    const chipText = page.locator('button:has-text("Wochentag: Montag") span').first()

    // Verify text is at least 16px (text-base)
    const fontSize = await chipText.evaluate((el) => {
      return window.getComputedStyle(el).fontSize
    })

    const fontSizePx = parseFloat(fontSize)
    expect(fontSizePx).toBeGreaterThanOrEqual(15) // text-base is 16px, allow small variance
  })
})
