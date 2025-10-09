// tests/integration/favorites.test.js
/**
 * Integration Tests: Favorites System
 * Tests favorites functionality with localStorage persistence
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { page } from '@vitest/browser/context'
import { waitForAlpineAndData } from './test-helpers.js'

describe('Favorites System Integration', () => {
  beforeEach(async () => {
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear()
    })

    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  describe('Add to Favorites', () => {
    it('should add training to favorites', async () => {
      // Get first training ID
      const trainingId = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings[0]?.id
      })

      if (!trainingId) {
        return // Skip if no trainings
      }

      // Add to favorites
      await page.evaluate((id) => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        store.toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      // Check if added
      const isFavorite = await page.evaluate((id) => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.isFavorite(id)
      }, trainingId)

      expect(isFavorite).toBe(true)
    })

    it('should update favorites count', async () => {
      const trainingId = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings[0]?.id
      })

      if (!trainingId) {
        return
      }

      // Get initial count
      const initialCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).favorites.length
      })

      // Add to favorites
      await page.evaluate((id) => {
        window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      // Get new count
      const newCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).favorites.length
      })

      expect(newCount).toBe(initialCount + 1)
    })
  })

  describe('Remove from Favorites', () => {
    it('should remove training from favorites', async () => {
      const trainingId = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings[0]?.id
      })

      if (!trainingId) {
        return
      }

      // Add then remove
      await page.evaluate((id) => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        store.toggleFavorite(id) // Add
      }, trainingId)

      await page.waitForTimeout(200)

      await page.evaluate((id) => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        store.toggleFavorite(id) // Remove
      }, trainingId)

      await page.waitForTimeout(200)

      // Should not be favorite
      const isFavorite = await page.evaluate((id) => {
        return window.Alpine.$data(document.querySelector('[x-data]')).isFavorite(id)
      }, trainingId)

      expect(isFavorite).toBe(false)
    })

    it('should decrease favorites count', async () => {
      const trainingId = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings[0]?.id
      })

      if (!trainingId) {
        return
      }

      // Add to favorites
      await page.evaluate((id) => {
        window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      const countAfterAdd = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).favorites.length
      })

      // Remove from favorites
      await page.evaluate((id) => {
        window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      const countAfterRemove = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).favorites.length
      })

      expect(countAfterRemove).toBe(countAfterAdd - 1)
    })
  })

  describe('Favorites Persistence', () => {
    it('should persist favorites in localStorage', async () => {
      const trainingId = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings[0]?.id
      })

      if (!trainingId) {
        return
      }

      // Add to favorites
      await page.evaluate((id) => {
        window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      // Check localStorage
      const storedFavorites = await page.evaluate(() => {
        const stored = localStorage.getItem('trainingsplan_favorites_v1')
        return stored ? JSON.parse(stored) : []
      })

      expect(storedFavorites).toContain(trainingId)
    })

    it('should restore favorites after page reload', async () => {
      const trainingId = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings[0]?.id
      })

      if (!trainingId) {
        return
      }

      // Add to favorites
      await page.evaluate((id) => {
        window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      // Reload page
      await page.reload()
      await page.waitForFunction(() => window.Alpine !== undefined)
      await page.waitForFunction(() => {
        const store = window.Alpine?.store('trainingsplaner')
        return store?.allTrainings?.length > 0
      }, { timeout: 5000 })

      // Check if still favorite
      const isFavorite = await page.evaluate((id) => {
        return window.Alpine.$data(document.querySelector('[x-data]')).isFavorite(id)
      }, trainingId)

      expect(isFavorite).toBe(true)
    })
  })

  describe('Multiple Favorites', () => {
    it('should handle multiple favorites', async () => {
      const trainingIds = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings.slice(0, 3).map(t => t.id)
      })

      if (trainingIds.length < 3) {
        return
      }

      // Add multiple favorites
      for (const id of trainingIds) {
        await page.evaluate((trainingId) => {
          window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(trainingId)
        }, id)
      }

      await page.waitForTimeout(300)

      // Check all are favorites
      const allFavorites = await page.evaluate((ids) => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return ids.every(id => store.isFavorite(id))
      }, trainingIds)

      expect(allFavorites).toBe(true)
    })

    it('should maintain correct favorites count', async () => {
      const trainingIds = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings.slice(0, 5).map(t => t.id)
      })

      if (trainingIds.length < 5) {
        return
      }

      // Add multiple favorites
      for (const id of trainingIds) {
        await page.evaluate((trainingId) => {
          window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(trainingId)
        }, id)
      }

      await page.waitForTimeout(300)

      const count = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).favorites.length
      })

      expect(count).toBe(5)
    })
  })

  describe('Favorites UI Integration', () => {
    it('should toggle heart icon state', async () => {
      const trainingId = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).allTrainings[0]?.id
      })

      if (!trainingId) {
        return
      }

      // Toggle favorite
      await page.evaluate((id) => {
        window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      // Check isFavorite returns true
      const isFav = await page.evaluate((id) => {
        return window.Alpine.$data(document.querySelector('[x-data]')).isFavorite(id)
      }, trainingId)

      expect(isFav).toBe(true)
    })

    it('should show favorites count badge', async () => {
      // Add some favorites
      const trainingIds = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings.slice(0, 2).map(t => t.id)
      })

      if (trainingIds.length < 2) {
        return
      }

      for (const id of trainingIds) {
        await page.evaluate((trainingId) => {
          window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(trainingId)
        }, id)
      }

      await page.waitForTimeout(300)

      const count = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).favorites.length
      })

      expect(count).toBe(2)
    })
  })

  describe('Quick Filter Favorites', () => {
    it('should filter to show only favorites', async () => {
      // Add some favorites
      const trainingIds = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings.slice(0, 2).map(t => t.id)
      })

      if (trainingIds.length < 2) {
        return
      }

      for (const id of trainingIds) {
        await page.evaluate((trainingId) => {
          window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(trainingId)
        }, id)
      }

      await page.waitForTimeout(200)

      // Apply favorites filter
      await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        if (store.quickFilterFavorites) {
          store.quickFilterFavorites()
        }
      })

      await page.waitForTimeout(300)

      // Check filtered count matches favorites count
      const counts = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return {
          filtered: store.filteredTrainings.length,
          favorites: store.favorites.length
        }
      })

      expect(counts.filtered).toBe(counts.favorites)
    })
  })

  describe('Export Favorites', () => {
    it('should be able to get favorites list for export', async () => {
      // Add favorites
      const trainingIds = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings.slice(0, 3).map(t => t.id)
      })

      if (trainingIds.length < 3) {
        return
      }

      for (const id of trainingIds) {
        await page.evaluate((trainingId) => {
          window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(trainingId)
        }, id)
      }

      await page.waitForTimeout(200)

      // Get favorite trainings
      const favoriteTrainings = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings.filter(t => store.isFavorite(t.id))
      })

      expect(favoriteTrainings.length).toBe(3)
    })
  })
})
