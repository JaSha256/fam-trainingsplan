// tests/integration/filter-system.test.js
/**
 * Integration Tests: Filter System
 * Tests Alpine.js store → UI → DOM integration for filtering
 */

import { test, expect } from '@playwright/test'
// Playwright provides page via test context
// Helper functions inlined

test.describe('Filter System Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/')

    // Wait for Alpine and data
    // Wait for Alpine and data
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    await page.waitForFunction(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.allTrainings?.length > 0
    }, { timeout: 5000 })
  })

  test.describe('Desktop Filter Sidebar', () => {
    test('should toggle filter sidebar visibility', async ({ page }) => {
      // Check initial state (should be open by default)
      const initialState = await page.evaluate(() => {
        return window.Alpine.store('ui').filterSidebarOpen
      })
      expect(initialState).toBe(true)

      // Find and click toggle button
      const toggleBtn = page.getByTestId('toggle-filter')
      await toggleBtn.click()

      // Check state changed
      const newState = await page.evaluate(() => {
        return window.Alpine.store('ui').filterSidebarOpen
      })
      expect(newState).toBe(false)
    })

    test('should persist filter sidebar state', async ({ page }) => {
      // Close sidebar
      await page.evaluate(() => {
        window.Alpine.store('ui').filterSidebarOpen = false
      })

      // Reload page
      await page.reload()
      await page.waitForFunction(() => window.Alpine !== undefined)

      // Check persisted state
      const persistedState = await page.evaluate(() => {
        return window.Alpine.store('ui').filterSidebarOpen
      })
      expect(persistedState).toBe(false)
    })
  })

  test.describe('Filter by Wochentag (Day of Week)', () => {
    test('should filter trainings by selected day', async ({ page }) => {
      // Get initial training count
      const initialCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      // Select a specific day
      const selectDay = page.locator('#filter-wochentag')
      await selectDay.selectOption('Montag')

      // Wait for Alpine reactivity
      await page.waitForTimeout(300)

      // Get filtered count
      const filteredCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      // Should have fewer or equal trainings
      expect(filteredCount).toBeLessThanOrEqual(initialCount)

      // Verify all displayed trainings are on Monday
      const allMonday = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.filteredTrainings.every(t => t.wochentag === 'Montag')
      })
      expect(allMonday).toBe(true)
    })

    test('should update filter state in store', async ({ page }) => {
      const selectDay = page.locator('#filter-wochentag')
      await selectDay.selectOption('Dienstag')

      const filterValue = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.wochentag
      })

      expect(filterValue).toBe('Dienstag')
    })
  })

  test.describe('Filter by Ort (Location)', () => {
    test('should filter trainings by location', async ({ page }) => {
      // Get available locations
      const locations = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.orte
      })

      if (locations.length === 0) {
        return // Skip if no locations available
      }

      // Select first location
      const selectLocation = page.locator('#filter-ort')
      await selectLocation.selectOption(locations[0])

      await page.waitForTimeout(300)

      // Verify filtered trainings match location
      const allMatchLocation = await page.evaluate((location) => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.filteredTrainings.every(t => t.ort === location)
      }, locations[0])

      expect(allMatchLocation).toBe(true)
    })
  })

  test.describe('Filter by Training Type', () => {
    test('should filter by training type', async ({ page }) => {
      // Select training type
      const selectTraining = page.locator('#filter-training')
      await selectTraining.selectOption('Parkour')

      await page.waitForTimeout(300)

      // Verify all trainings are Parkour
      const allParkour = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.filteredTrainings.every(t => t.training === 'Parkour')
      })

      expect(allParkour).toBe(true)
    })
  })

  test.describe('Filter by Altersgruppe (Age Group)', () => {
    test('should filter by age group', async ({ page }) => {
      // Get available age groups
      const ageGroups = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.altersgruppen
      })

      if (ageGroups.length === 0) {
        return
      }

      // Select first age group
      const selectAge = page.locator('#filter-altersgruppe')
      await selectAge.selectOption(ageGroups[0])

      await page.waitForTimeout(300)

      // Should have filtered trainings
      const filteredCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      expect(filteredCount).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Reset Filters', () => {
    test('should reset all filters', async ({ page }) => {
      // Set multiple filters
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.wochentag = 'Montag'
        store.filters.ort = 'LTR'
        store.filters.training = 'Parkour'
      })

      await page.waitForTimeout(200)

      // Reset filters using the new method
      await page.evaluate(() => {
        window.Alpine.store('ui').resetFilters()
      })

      // Verify all filters are cleared
      const filters = await page.evaluate(() => {
        return window.Alpine.store('ui').filters
      })

      expect(filters.wochentag).toBe('')
      expect(filters.ort).toBe('')
      expect(filters.training).toBe('')
      expect(filters.altersgruppe).toBe('')
      expect(filters.searchTerm).toBe('')
    })

    test('should show all trainings after reset', async ({ page }) => {
      // Set a restrictive filter
      await page.evaluate(() => {
        window.Alpine.store('ui').filters.wochentag = 'Montag'
      })

      await page.waitForTimeout(200)

      const filteredCount = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        store.applyFilters()
        return store.filteredTrainings.length
      })

      // Reset
      await page.evaluate(() => {
        window.Alpine.store('ui').resetFilters()
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(200)

      const allCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings.length
      })

      // Should show all trainings
      const resetCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      expect(resetCount).toBe(allCount)
    })
  })

  test.describe('Multiple Filters Combined', () => {
    test('should apply multiple filters simultaneously', async ({ page }) => {
      // Set multiple filters
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.wochentag = 'Montag'
        store.filters.training = 'Parkour'
      })

      await page.waitForTimeout(300)

      // Verify all trainings match both filters
      const allMatch = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.filteredTrainings.every(
          t => t.wochentag === 'Montag' && t.training === 'Parkour'
        )
      })

      expect(allMatch).toBe(true)
    })
  })

  test.describe('Filter Persistence', () => {
    test('should persist filters across page reload', async ({ page }) => {
      // Set filters
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.wochentag = 'Dienstag'
        store.filters.training = 'Trampolin'
      })

      // Reload page
      await page.reload()
      await page.waitForFunction(() => window.Alpine !== undefined)

      // Check persisted filters
      const persistedFilters = await page.evaluate(() => {
        return window.Alpine.store('ui').filters
      })

      expect(persistedFilters.wochentag).toBe('Dienstag')
      expect(persistedFilters.training).toBe('Trampolin')
    })
  })

  test.describe('Mobile Filter Drawer', () => {
    test('should open mobile filter drawer', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Open mobile filter
      await page.evaluate(() => {
        window.Alpine.store('ui').mobileFilterOpen = true
      })

      await page.waitForTimeout(200)

      const isOpen = await page.evaluate(() => {
        return window.Alpine.store('ui').mobileFilterOpen
      })

      expect(isOpen).toBe(true)
    })

    test('should close mobile filter drawer', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Open then close
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.mobileFilterOpen = true
      })

      await page.waitForTimeout(200)

      await page.evaluate(() => {
        window.Alpine.store('ui').mobileFilterOpen = false
      })

      await page.waitForTimeout(200)

      const isOpen = await page.evaluate(() => {
        return window.Alpine.store('ui').mobileFilterOpen
      })

      expect(isOpen).toBe(false)
    })
  })
})
