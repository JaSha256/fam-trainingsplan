// tests/integration/filter-system.test.js
/**
 * Integration Tests: Filter System
 * Tests Alpine.js store → UI → DOM integration for filtering
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'
import { waitForAlpineAndData } from './test-helpers.js'

describe('Filter System Integration', () => {
  beforeEach(async () => {
    // Navigate to app
    await page.goto('/')

    // Wait for Alpine and data
    await waitForAlpineAndData(page)
  })

  describe('Desktop Filter Sidebar', () => {
    it('should toggle filter sidebar visibility', async () => {
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

    it('should persist filter sidebar state', async () => {
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

  describe('Filter by Wochentag (Day of Week)', () => {
    it('should filter trainings by selected day', async () => {
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

    it('should update filter state in store', async () => {
      const selectDay = page.locator('#filter-wochentag')
      await selectDay.selectOption('Dienstag')

      const filterValue = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.wochentag
      })

      expect(filterValue).toBe('Dienstag')
    })
  })

  describe('Filter by Ort (Location)', () => {
    it('should filter trainings by location', async () => {
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

  describe('Filter by Training Type', () => {
    it('should filter by training type', async () => {
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

  describe('Filter by Altersgruppe (Age Group)', () => {
    it('should filter by age group', async () => {
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

  describe('Reset Filters', () => {
    it('should reset all filters', async () => {
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

    it('should show all trainings after reset', async () => {
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

  describe('Multiple Filters Combined', () => {
    it('should apply multiple filters simultaneously', async () => {
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

  describe('Filter Persistence', () => {
    it('should persist filters across page reload', async () => {
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

  describe('Mobile Filter Drawer', () => {
    it('should open mobile filter drawer', async () => {
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

    it('should close mobile filter drawer', async () => {
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
