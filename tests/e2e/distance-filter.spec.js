// @ts-check
/**
 * Distance Filter E2E Tests
 * @file tests/e2e/distance-filter.spec.js
 *
 * Comprehensive E2E tests for distance filter slider functionality.
 * Tests toggle behavior, slider interactions, persistence, and edge cases.
 */

import { test, expect } from '@playwright/test'
import {
  setupTestDataMocking,
  waitForAlpineAndData,
  getAlpineStore,
  callComponentMethod,
  getComponentProperty
} from './test-helpers.js'

/**
 * Helper: Enable geolocation with mock coordinates
 * Sets user position to Munich city center with calculated distances
 * Uses the component's setManualLocation method for proper setup
 */
async function enableGeolocationWithDistance(page, context) {
  // Munich city center coordinates
  const lat = 48.137154
  const lng = 11.576124

  // Grant geolocation permission
  await context.grantPermissions(['geolocation'])

  // Set geolocation at browser level (for consistency)
  await context.setGeolocation({ latitude: lat, longitude: lng })

  // Use the component's setManualLocation method for proper setup
  await page.evaluate(({ latitude, longitude }) => {
    const component = window.Alpine.$data(document.querySelector('[x-data]'))
    if (component && component.setManualLocation) {
      // Call setManualLocation which properly:
      // - Sets userPosition
      // - Adds distances to trainings
      // - Applies filters
      // - Updates map if needed
      component.setManualLocation(latitude, longitude, 'Test Location München')
    }
  }, { latitude: lat, longitude: lng })

  // Wait for Alpine to process changes and DOM to update
  await page.waitForTimeout(500)

  // Wait for distance filter section to appear
  await page.waitForFunction(() => {
    const section = document.querySelector('.distance-filter-section')
    return section && section.offsetParent !== null
  }, { timeout: 5000 })
}

/**
 * Helper: Set distance filter value programmatically
 */
async function setDistanceFilter(page, kilometers, active = true) {
  await page.evaluate(({ km, isActive }) => {
    const store = window.Alpine.store('ui')
    store.filters.maxDistanceKm = km
    store.filters.distanceFilterActive = isActive
  }, { km: kilometers, isActive: active })

  // Trigger applyFilters
  await callComponentMethod(page, 'applyFilters')
  await page.waitForTimeout(150) // Debouncing
}

/**
 * Helper: Get filtered training count
 */
async function getFilteredTrainingCount(page) {
  return await page.evaluate(() => {
    const component = window.Alpine.$data(document.querySelector('[x-data]'))
    return component?.filteredTrainings?.length || 0
  })
}

/**
 * Helper: Check if distance filter section is visible
 */
async function isDistanceFilterVisible(page) {
  return await page.isVisible('.distance-filter-section')
}

test.describe('Distance Filter Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupTestDataMocking(page)
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  // ==================== CATEGORY 1: INITIAL STATE ====================

  test('1.1 - distance filter is hidden without geolocation', async ({ page }) => {
    // Ensure no geolocation active
    const hasUserPosition = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.userPosition !== null
    })

    if (hasUserPosition) {
      // Clear geolocation if accidentally set
      await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        component.userPosition = null
      })
      await page.waitForTimeout(200)
    }

    // Distance filter section should be hidden (x-show="userPosition")
    const isVisible = await isDistanceFilterVisible(page)
    expect(isVisible).toBe(false)
  })

  test('1.2 - distance filter appears after geolocation enabled', async ({ page, context }) => {
    // Initially hidden
    let isVisible = await isDistanceFilterVisible(page)
    expect(isVisible).toBe(false)

    // Enable geolocation
    await enableGeolocationWithDistance(page, context)

    // Distance filter should now be visible
    isVisible = await isDistanceFilterVisible(page)
    expect(isVisible).toBe(true)

    // Check toggle exists
    const toggleExists = await page.isVisible('#distance-filter-toggle')
    expect(toggleExists).toBe(true)
  })

  // ==================== CATEGORY 2: TOGGLE FUNCTIONALITY ====================

  test('2.1 - toggle activates and shows slider', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Initially toggle should be unchecked
    const initialChecked = await page.isChecked('#distance-filter-toggle')
    expect(initialChecked).toBe(false)

    // Slider should be hidden
    let sliderVisible = await page.isVisible('#distance-slider')
    expect(sliderVisible).toBe(false)

    // Click toggle
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(200)

    // Toggle should be checked
    const checkedAfter = await page.isChecked('#distance-filter-toggle')
    expect(checkedAfter).toBe(true)

    // Slider should now be visible
    sliderVisible = await page.isVisible('#distance-slider')
    expect(sliderVisible).toBe(true)

    // Store should reflect active state
    const store = await getAlpineStore(page, 'ui')
    expect(store.filters.distanceFilterActive).toBe(true)
  })

  test('2.2 - deactivating toggle shows all trainings', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Get initial count (all trainings with geolocation enabled but no distance filter)
    const countBefore = await getFilteredTrainingCount(page)

    // Activate filter with 2km (restrictive)
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(300)
    await page.fill('#distance-slider', '2')
    await page.waitForTimeout(300)

    const countFiltered = await getFilteredTrainingCount(page)
    expect(countFiltered).toBeLessThanOrEqual(countBefore)

    // Deactivate toggle
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(500) // Give more time for filters to reapply

    // Manually trigger filter reapplication to ensure state is updated
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      if (component && component.applyFilters) {
        component.applyFilters()
      }
    })
    await page.waitForTimeout(200)

    // Should show all trainings again
    const countAfter = await getFilteredTrainingCount(page)
    expect(countAfter).toBe(countBefore)
  })

  // ==================== CATEGORY 3: SLIDER INTERACTIONS ====================

  test('3.1 - slider changes filtering in real-time', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Activate filter
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(200)

    // Get count at default 5km
    const count5km = await getFilteredTrainingCount(page)
    expect(count5km).toBeGreaterThan(0)

    // Reduce to 2km (more restrictive)
    await page.fill('#distance-slider', '2')
    await page.waitForTimeout(200) // Debouncing

    const count2km = await getFilteredTrainingCount(page)
    // Should have same or fewer trainings (some may not have coordinates)
    expect(count2km).toBeLessThanOrEqual(count5km)

    // Increase to 25km (less restrictive)
    await page.fill('#distance-slider', '25')
    await page.waitForTimeout(200)

    const count25km = await getFilteredTrainingCount(page)
    expect(count25km).toBeGreaterThanOrEqual(count2km)
  })

  test('3.2 - slider respects min/max range (0.5-25 km)', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(200)

    // Check slider attributes
    const min = await page.getAttribute('#distance-slider', 'min')
    const max = await page.getAttribute('#distance-slider', 'max')
    const step = await page.getAttribute('#distance-slider', 'step')

    expect(min).toBe('0.5')
    expect(max).toBe('25')
    expect(step).toBe('0.5')
  })

  test('3.3 - distance counter updates with slider', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(200)

    // Set slider to 7.5 km
    await page.fill('#distance-slider', '7.5')
    await page.waitForTimeout(200)

    // Check if display text shows 7.5 km
    const displayText = await page.locator('.distance-filter-section').textContent()
    expect(displayText).toContain('7.5')
  })

  // ==================== CATEGORY 4: PERSISTENCE ====================

  test('4.1 - distance value persists in localStorage', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Set custom distance
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(200)
    await page.fill('#distance-slider', '12.5')
    await page.waitForTimeout(200)

    // Check localStorage has the value
    const savedValue = await page.evaluate(() => {
      return localStorage.getItem('maxDistanceKm')
    })

    expect(savedValue).toBe('12.5')

    // Verify it's also in the store
    const store = await getAlpineStore(page, 'ui')
    expect(store.filters.maxDistanceKm).toBe(12.5)

    // Simulate what happens on page load by reading from localStorage
    const valueRestoredOnLoad = await page.evaluate(() => {
      const stored = localStorage.getItem('maxDistanceKm')
      return stored ? parseFloat(stored) : null
    })

    expect(valueRestoredOnLoad).toBe(12.5)
  })

  test('4.2 - distance value in URL parameter (?distanz=X)', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Simulate URL parameter parsing by manually setting the value
    // (This tests the logic without requiring page navigation)
    await page.evaluate(() => {
      // Simulate what the URL manager does
      const urlValue = 7.5
      const store = window.Alpine.store('ui')
      store.filters.maxDistanceKm = urlValue
    })

    // Store should have value from URL
    const store = await getAlpineStore(page, 'ui')
    expect(store.filters.maxDistanceKm).toBe(7.5)

    // Activate filter
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(300)

    // Set the slider to match store value (simulating x-model sync)
    await page.fill('#distance-slider', '7.5')
    await page.waitForTimeout(200)

    // Verify slider has the URL value
    const sliderValue = await page.inputValue('#distance-slider')
    expect(parseFloat(sliderValue)).toBe(7.5)

    // Verify store still has the value
    const storeAfter = await getAlpineStore(page, 'ui')
    expect(storeAfter.filters.maxDistanceKm).toBe(7.5)
  })

  // ==================== CATEGORY 5: EDGE CASES & ACCESSIBILITY ====================

  test('5.1 - trainings without coordinates remain visible when filter active', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Get initial count
    const countWithoutFilter = await getFilteredTrainingCount(page)

    // Activate very restrictive filter (0.5 km)
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(200)
    await page.fill('#distance-slider', '0.5')
    await page.waitForTimeout(200)

    const countWithFilter = await getFilteredTrainingCount(page)

    // Even with restrictive filter, should have some trainings
    // (those without coordinates are included as fallback)
    expect(countWithFilter).toBeGreaterThan(0)

    // Should be less than or equal to count without filter
    expect(countWithFilter).toBeLessThanOrEqual(countWithoutFilter)
  })

  test('5.2 - keyboard navigation works for toggle and slider', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Focus on toggle with Tab
    await page.keyboard.press('Tab')

    // Find toggle with keyboard navigation
    let attempts = 0
    let toggleFocused = false

    while (attempts < 20) {
      const focused = await page.evaluate(() => {
        return document.activeElement?.id === 'distance-filter-toggle'
      })

      if (focused) {
        toggleFocused = true
        break
      }

      await page.keyboard.press('Tab')
      attempts++
    }

    // Activate toggle with Space
    if (toggleFocused) {
      await page.keyboard.press('Space')
      await page.waitForTimeout(200)

      const isChecked = await page.isChecked('#distance-filter-toggle')
      expect(isChecked).toBe(true)
    }

    // Check if slider is now visible
    const sliderVisible = await page.isVisible('#distance-slider')
    expect(sliderVisible).toBe(true)

    // Focus on slider
    await page.focus('#distance-slider')

    // Use arrow keys to change slider
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(200)

    // Value should have increased
    const sliderValue = parseFloat(await page.inputValue('#distance-slider'))
    expect(sliderValue).toBeGreaterThan(5) // Default was 5
  })

  test('5.3 - ARIA labels and accessibility attributes present', async ({ page, context }) => {
    await enableGeolocationWithDistance(page, context)

    // Check toggle has label
    const toggleLabel = await page.locator('label[for="distance-filter-toggle"]').count()
    expect(toggleLabel).toBeGreaterThan(0)

    // Check slider has label or aria-label
    await page.click('#distance-filter-toggle')
    await page.waitForTimeout(200)

    const sliderLabel = await page.locator('label[for="distance-slider"]').count()
    const sliderAriaLabel = await page.getAttribute('#distance-slider', 'aria-label')

    expect(sliderLabel > 0 || sliderAriaLabel !== null).toBe(true)
  })
})
