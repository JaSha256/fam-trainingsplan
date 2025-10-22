// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Filter Sidebar Bugfix Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176/')
    await page.waitForLoadState('networkidle')

    // Wait for Alpine to initialize
    await page.waitForFunction(() => window.Alpine && window.Alpine.version)
    await page.waitForTimeout(500)
  })

  test('BUGFIX 1: Reset button should show all trainings', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 })

    // Apply a filter first
    const wochentagSection = page.locator('text=Wochentag').first().locator('..')
    const expandButton = wochentagSection.locator('button[aria-label*="umschalten"]').first()
    const isExpanded = await expandButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await expandButton.click()
      await page.waitForTimeout(200)
    }

    await page
      .locator('text=Montag')
      .locator('..')
      .locator('input[type="checkbox"]')
      .first()
      .click()
    await page.waitForTimeout(300)

    // Get filtered count
    const filteredText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const filteredCount = parseInt(filteredText.match(/\d+/)[0])

    // Click "Alle löschen" button
    await page.locator('button:has-text("Alle löschen")').first().click()
    await page.waitForTimeout(300)

    // Get reset count
    const resetText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const resetCount = parseInt(resetText.match(/\d+/)[0])

    // After reset, count should be higher
    expect(resetCount).toBeGreaterThan(filteredCount)

    // Verify filters are cleared
    const filters = await page.evaluate(() => window.Alpine.store('ui').filters)
    expect(filters.wochentag).toEqual([])
  })

  test('BUGFIX 2: Wochentag "Alle anzeigen" triggers filter update', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    // Expand Wochentag filter
    const wochentagSection = page.locator('text=Wochentag').first().locator('..')
    const expandButton = wochentagSection.locator('button[aria-label*="umschalten"]').first()
    const isExpanded = await expandButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await expandButton.click()
      await page.waitForTimeout(200)
    }

    // Get initial count
    const initialText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const initialCount = parseInt(initialText.match(/\d+/)[0])

    // Click "Alle anzeigen"
    const alleCheckbox = wochentagSection
      .locator('text=Alle anzeigen')
      .locator('..')
      .locator('input[type="checkbox"]')
      .first()
    await alleCheckbox.click()
    await page.waitForTimeout(400)

    // Get filtered count
    const filteredText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const filteredCount = parseInt(filteredText.match(/\d+/)[0])

    // Count should be different (filtered)
    expect(filteredCount).not.toBe(initialCount)

    // Verify weekdays are selected
    const filters = await page.evaluate(() => window.Alpine.store('ui').filters)
    expect(filters.wochentag.length).toBeGreaterThan(0)
  })

  test('Individual filter checkboxes work correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    // Expand Wochentag
    const wochentagSection = page.locator('text=Wochentag').first().locator('..')
    const expandButton = wochentagSection.locator('button[aria-label*="umschalten"]').first()
    const isExpanded = await expandButton.getAttribute('aria-expanded')
    if (isExpanded === 'false') {
      await expandButton.click()
      await page.waitForTimeout(200)
    }

    // Get initial count
    const initialText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const initialCount = parseInt(initialText.match(/\d+/)[0])

    // Click Montag
    const montagCheckbox = wochentagSection
      .locator('text=Montag')
      .locator('..')
      .locator('input[type="checkbox"]')
      .first()
    await montagCheckbox.click()
    await page.waitForTimeout(400)

    // Get filtered count
    const filteredText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const filteredCount = parseInt(filteredText.match(/\d+/)[0])

    // Should be filtered
    expect(filteredCount).toBeLessThan(initialCount)

    // Verify filter state
    const filters = await page.evaluate(() => window.Alpine.store('ui').filters)
    expect(filters.wochentag).toContain('Montag')
  })

  test('$watch triggers applyFilters automatically', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })

    // Get initial count
    const initialText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const initialCount = parseInt(initialText.match(/\d+/)[0])

    // Manually change filter (simulates toggleAll)
    await page.evaluate(() => {
      window.Alpine.store('ui').filters.wochentag = ['Montag']
    })

    // Wait for $watch (100ms debounce + processing)
    await page.waitForTimeout(400)

    // Verify filtering happened
    const filteredText = await page.locator('text=/\\d+ Trainings? gefunden/').first().textContent()
    const filteredCount = parseInt(filteredText.match(/\d+/)[0])

    expect(filteredCount).toBeLessThan(initialCount)
  })
})
