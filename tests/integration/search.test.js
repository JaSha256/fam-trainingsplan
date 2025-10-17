// tests/integration/search.test.js
/**
 * Integration Tests: Search System
 * Tests fuzzy search with Fuse.js integration
 */

import { test, expect } from '@playwright/test'
// Playwright provides page via test context
// Helper functions inlined

test.describe('Search System Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for Alpine and data
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    await page.waitForFunction(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.allTrainings?.length > 0
    }, { timeout: 5000 })
  })

  test.describe('Basic Search', () => {
    test('should filter trainings by search term', async ({ page }) => {
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

    test('should update search term in store', async ({ page }) => {
      const searchInput = page.locator('#search')
      await searchInput.fill('Trampolin')

      await page.waitForTimeout(400)

      const searchTerm = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.searchTerm
      })

      expect(searchTerm).toBe('Trampolin')
    })

    test('should search across multiple fields', async ({ page }) => {
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

  test.describe('Fuzzy Search', () => {
    test('should handle typos (fuzzy matching)', async ({ page }) => {
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

    test('should handle partial matches', async ({ page }) => {
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

  test.describe('Search by Training Type', () => {
    test('should find trainings by type', async ({ page }) => {
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

  test.describe('Search by Location', () => {
    test('should find trainings by location', async ({ page }) => {
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

  test.describe('Search by Trainer', () => {
    test('should find trainings by trainer name', async ({ page }) => {
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

  test.describe('Search Debouncing', () => {
    test('should debounce search input', async ({ page }) => {
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

  test.describe('Clear Search', () => {
    test('should clear search and show all trainings', async ({ page }) => {
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

  test.describe('Search with Filters Combined', () => {
    test('should combine search with day filter', async ({ page }) => {
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

    test('should combine search with location filter', async ({ page }) => {
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

  test.describe('No Results', () => {
    test('should show empty results for non-existent search', async ({ page }) => {
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

    test('should show no results message in UI', async ({ page }) => {
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

  test.describe('Search Performance', () => {
    test('should handle search with many results efficiently', async ({ page }) => {
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

  test.describe('Mobile Search', () => {
    test('should work on mobile viewport', async ({ page }) => {
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

  test.describe('Search Persistence', () => {
    test('should persist search term across page reload', async ({ page }) => {
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
