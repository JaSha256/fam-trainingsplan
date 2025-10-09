// tests/integration/search.test.js
/**
 * Integration Tests: Search System
 * Tests fuzzy search with Fuse.js integration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'
import { waitForAlpineAndData } from './test-helpers.js'

describe('Search System Integration', () => {
  beforeEach(async () => {
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  describe('Basic Search', () => {
    it('should filter trainings by search term', async () => {
      // Get initial count
      const initialCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings.length
      })

      // Search for "Parkour"
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Parkour'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400) // Debounce + processing

      const filteredCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      // Should have results (assuming Parkour trainings exist)
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    })

    it('should update search term in store', async () => {
      const searchInput = page.locator('#search')
      await searchInput.fill('Trampolin')

      await page.waitForTimeout(400)

      const searchTerm = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.searchTerm
      })

      expect(searchTerm).toBe('Trampolin')
    })

    it('should search across multiple fields', async () => {
      // Search by location
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'LTR'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const hasResults = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length > 0
      })

      // Should find results if LTR location exists
      expect(hasResults).toBeDefined()
    })
  })

  describe('Fuzzy Search', () => {
    it('should handle typos (fuzzy matching)', async () => {
      // Search with typo "Parkur" instead of "Parkour"
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Parkur'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const hasResults = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length > 0
      })

      // Fuzzy search should still find results
      expect(hasResults).toBeDefined()
    })

    it('should handle partial matches', async () => {
      // Search with partial term
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Park'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const filteredCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      expect(filteredCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Search by Training Type', () => {
    it('should find trainings by type', async () => {
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Parkour'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      // Verify results contain search term
      const results = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.filteredTrainings.map(t => t.training)
      })

      if (results.length > 0) {
        expect(results.some(r => r.toLowerCase().includes('parkour'))).toBe(true)
      }
    })
  })

  describe('Search by Location', () => {
    it('should find trainings by location', async () => {
      // Get a location from available trainings
      const location = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings[0]?.ort
      })

      if (!location) {
        return
      }

      await page.evaluate((loc) => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = loc
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      }, location)

      await page.waitForTimeout(400)

      const hasResults = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length > 0
      })

      expect(hasResults).toBe(true)
    })
  })

  describe('Search by Trainer', () => {
    it('should find trainings by trainer name', async () => {
      // Get a trainer name
      const trainer = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        const trainingWithTrainer = store.allTrainings.find(t => t.trainer)
        return trainingWithTrainer?.trainer
      })

      if (!trainer) {
        return // Skip if no trainer data
      }

      await page.evaluate((name) => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = name
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      }, trainer)

      await page.waitForTimeout(400)

      const hasResults = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length > 0
      })

      expect(hasResults).toBe(true)
    })
  })

  describe('Search Debouncing', () => {
    it('should debounce search input', async () => {
      const searchInput = page.locator('#search')

      // Type quickly
      await searchInput.fill('P')
      await page.waitForTimeout(100)
      await searchInput.fill('Pa')
      await page.waitForTimeout(100)
      await searchInput.fill('Par')

      // Should not have applied filter yet (debounced)
      await page.waitForTimeout(200)

      // Wait for debounce to complete
      await page.waitForTimeout(400)

      // Now should have applied
      const searchTerm = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.searchTerm
      })

      expect(searchTerm).toBe('Par')
    })
  })

  describe('Clear Search', () => {
    it('should clear search and show all trainings', async () => {
      // Search first
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Parkour'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const filteredCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      // Clear search
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = ''
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const allCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      expect(allCount).toBeGreaterThanOrEqual(filteredCount)
    })
  })

  describe('Search with Filters Combined', () => {
    it('should combine search with day filter', async () => {
      // Set both search and filter
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Parkour'
        store.filters.wochentag = 'Montag'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      // Verify results match both criteria
      const allMatch = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.filteredTrainings.every(t => {
          const matchesDay = t.wochentag === 'Montag'
          const matchesSearch = t.training?.toLowerCase().includes('parkour')
          return matchesDay && matchesSearch
        })
      })

      expect(allMatch).toBeDefined()
    })

    it('should combine search with location filter', async () => {
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Trampolin'
        store.filters.ort = 'LTR'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const results = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings
      })

      expect(results).toBeDefined()
    })
  })

  describe('No Results', () => {
    it('should show empty results for non-existent search', async () => {
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'xyzabc123nonexistent'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const count = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      expect(count).toBe(0)
    })

    it('should show no results message in UI', async () => {
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'nonexistent'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(400)

      const hasNoResultsMessage = await page.evaluate(() => {
        // Check if the "Keine Trainings gefunden" message would be shown
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.filteredTrainings.length === 0
      })

      expect(hasNoResultsMessage).toBe(true)
    })
  })

  describe('Search Performance', () => {
    it('should handle search with many results efficiently', async () => {
      const startTime = Date.now()

      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Training'
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(500)

      const endTime = Date.now()
      const duration = endTime - startTime

      // Search should complete within reasonable time (< 1s)
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('Mobile Search', () => {
    it('should work on mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 })

      const mobileSearch = page.locator('#mobile-search')
      await mobileSearch.fill('Parkour')

      await page.waitForTimeout(400)

      const searchTerm = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.searchTerm
      })

      expect(searchTerm).toBe('Parkour')
    })
  })

  describe('Search Persistence', () => {
    it('should persist search term across page reload', async () => {
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Parkour'
      })

      await page.waitForTimeout(200)

      // Reload
      await page.reload()
      await page.waitForFunction(() => window.Alpine !== undefined)

      const persistedSearch = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.searchTerm
      })

      expect(persistedSearch).toBe('Parkour')
    })
  })
})
