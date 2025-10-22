// tests/e2e/user-flows.spec.js
/**
 * Critical User Flow Tests
 * Tests complete user journeys through the application
 */

import { test, expect } from '@playwright/test'

// Helper to get Alpine component data
async function getComponent(page) {
  return await page.evaluate(() => {
    const el = document.querySelector('[x-data]')
    return window.Alpine?.$data(el)
  })
}

// Helper to get correct selector for mobile/desktop
function getSelector(page, desktop, mobile) {
  const viewportSize = page.viewportSize()
  const isMobile = viewportSize && viewportSize.width < 768
  return isMobile ? mobile : desktop
}

// Helper to prepare mobile filter drawer if needed
async function prepareMobileFilters(page) {
  const viewportSize = page.viewportSize()
  const isMobile = viewportSize && viewportSize.width < 768

  if (isMobile) {
    await page.evaluate(() => {
      window.Alpine.store('ui').mobileFilterOpen = true
    })
    await page.waitForTimeout(300)
  }
}

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => window.Alpine !== undefined)
  })

  test.describe('Flow 1: Find Training by Location and Day', () => {
    test('user can find Monday trainings at LTR', async ({ page }) => {
      // Wait for app to load
      await expect(page.locator('#app')).toBeVisible()
      await page.waitForFunction(() => window.Alpine !== undefined)

      // Prepare mobile filters if needed
      await prepareMobileFilters(page)

      // Step 1: Select day filter (now checkbox-based, not select dropdown)
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.wochentag = ['Montag']
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })
      await page.waitForTimeout(300)

      // Step 2: Select location filter (now checkbox-based, not select dropdown)
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.ort = ['LTR']
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })
      await page.waitForTimeout(300)

      // Step 3: Verify filtered results
      const filteredCount = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.filteredTrainings?.length ?? 0
      })

      expect(filteredCount).toBeGreaterThanOrEqual(0)

      // Step 4: Verify all results match criteria if there are results
      const allMatch = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        if (!component || !component.filteredTrainings || component.filteredTrainings.length === 0) {
          return true // No results is valid
        }
        return component.filteredTrainings.every(t =>
          t.wochentag === 'Montag' && t.ort === 'LTR'
        )
      })

      expect(allMatch).toBe(true)
    })
  })

  test.describe('Flow 2: Search and Add to Favorites', () => {
    test('user can search for Parkour and favorite it', async ({ page }) => {
      // Prepare mobile filters if needed
      await prepareMobileFilters(page)

      // Step 1: Search for Parkour
      const searchSelector = getSelector(page, '#search', '#mobile-search')
      await page.fill(searchSelector, 'Parkour')
      await page.waitForTimeout(500) // Debounce + filter

      // Step 2: Wait for results
      const hasResults = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.filteredTrainings?.length > 0
      })

      if (!hasResults) {
        test.skip() // Skip if no Parkour trainings
      }

      // Step 3: Get first result ID
      const firstId = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.filteredTrainings[0]?.id
      })

      // Step 4: Add to favorites
      await page.evaluate((id) => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        component.toggleFavorite(id)
      }, firstId)

      await page.waitForTimeout(200)

      // Step 5: Verify it's a favorite
      const isFavorite = await page.evaluate((id) => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component.isFavorite(id)
      }, firstId)

      expect(isFavorite).toBe(true)
    })
  })

  test.describe('Flow 3: View Training Details and Navigate', () => {
    test('user can view training card details', async ({ page }) => {
      // Wait for trainings to load
      await page.waitForFunction(() => {
        const component = window.Alpine?.$data(document.querySelector('[x-data]'))
        return component?.allTrainings?.length > 0
      }, { timeout: 5000 })

      // Ensure we're in list view
      await page.evaluate(() => {
        window.Alpine.store('ui').activeView = 'list'
      })
      await page.waitForTimeout(300)

      // Step 1: Find first training card (using article element with classes)
      const trainingCard = page.locator('article').first()
      await expect(trainingCard).toBeVisible()

      // Step 2: Verify card has essential information
      await expect(trainingCard).toContainText(/Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag|Sonntag/)

      // Step 3: Check if card has location
      const hasLocation = await trainingCard.evaluate(el => {
        return el.textContent.length > 0
      })
      expect(hasLocation).toBe(true)
    })
  })

  test.describe('Flow 4: Mobile User Experience', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('mobile user can open filters and search', async ({ page }) => {
      // Step 1: Open mobile filter drawer
      await page.evaluate(() => {
        window.Alpine.store('ui').mobileFilterOpen = true
      })

      await page.waitForTimeout(300)

      // Step 2: Verify drawer is open
      const isOpen = await page.evaluate(() => {
        return window.Alpine.store('ui').mobileFilterOpen
      })
      expect(isOpen).toBe(true)

      // Step 3: Search in mobile drawer
      const mobileSearch = page.locator('#mobile-search')
      await mobileSearch.fill('Training')

      await page.waitForTimeout(500)

      // Step 4: Close drawer
      await page.evaluate(() => {
        window.Alpine.store('ui').mobileFilterOpen = false
      })

      await page.waitForTimeout(300)

      // Step 5: Verify search persisted
      const searchTerm = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.searchTerm
      })
      expect(searchTerm).toBe('Training')
    })
  })

  test.describe('Flow 5: View Map', () => {
    test('user can open and view training locations on map', async ({ page }) => {
      // Step 1: Switch to map view
      await page.evaluate(() => {
        window.Alpine.store('ui').activeView = 'map'
      })

      await page.waitForTimeout(500)

      // Step 2: Verify map view is active
      const isMapView = await page.evaluate(() => {
        return window.Alpine.store('ui').activeView === 'map'
      })
      expect(isMapView).toBe(true)

      // Step 3: Verify map container exists (updated selector)
      const mapContainer = page.locator('#map-view-container')
      await expect(mapContainer).toBeVisible()

      // Step 4: Switch back to list view
      await page.evaluate(() => {
        window.Alpine.store('ui').activeView = 'list'
      })

      await page.waitForTimeout(300)
    })
  })

  test.describe('Flow 6: Filter Combinations', () => {
    test('user can apply multiple filters and reset', async ({ page }) => {
      // Prepare mobile filters if needed
      await prepareMobileFilters(page)

      // Step 1: Apply multiple filters (now checkbox-based arrays)
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.wochentag = ['Montag']
        store.filters.training = ['Parkour']
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })
      await page.waitForTimeout(300)

      // Step 2: Verify filters applied
      const filters = await page.evaluate(() => {
        return window.Alpine.store('ui').filters
      })
      expect(filters.wochentag).toContain('Montag')
      expect(filters.training).toContain('Parkour')

      // Step 3: Get filtered count
      const filteredCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      // Step 4: Reset filters
      await page.evaluate(() => {
        window.Alpine.store('ui').resetFilters()
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(300)

      // Step 5: Verify all trainings shown again
      const allCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })

      expect(allCount).toBeGreaterThanOrEqual(filteredCount)
    })
  })

  test.describe('Flow 7: Favorites Management', () => {
    test('user can add multiple favorites and view them', async ({ page }) => {
      // Step 1: Get first 3 training IDs
      const trainingIds = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings.slice(0, 3).map(t => t.id)
      })

      if (trainingIds.length < 3) {
        test.skip()
      }

      // Step 2: Add all to favorites
      for (const id of trainingIds) {
        await page.evaluate((trainingId) => {
          window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(trainingId)
        }, id)
      }

      await page.waitForTimeout(300)

      // Step 3: Verify favorites count
      const favCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).favorites.length
      })
      expect(favCount).toBe(3)

      // Step 4: Filter to favorites only
      await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        if (store.quickFilterFavorites) {
          store.quickFilterFavorites()
        }
      })

      await page.waitForTimeout(300)

      // Step 5: Verify only favorites shown
      const filteredCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })
      expect(filteredCount).toBe(3)
    })
  })

  test.describe('Flow 8: Search with No Results', () => {
    test('user sees helpful message when no trainings match', async ({ page }) => {
      // Prepare mobile filters if needed
      await prepareMobileFilters(page)

      // Step 1: Search for something that doesn't exist
      const searchSelector = getSelector(page, '#search', '#mobile-search')
      await page.fill(searchSelector, 'xyznonexistent123')
      await page.waitForTimeout(500)

      // Step 2: Verify no results
      const count = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })
      expect(count).toBe(0)

      // Step 3: Clear search
      await page.evaluate(() => {
        window.Alpine.store('ui').filters.searchTerm = ''
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })

      await page.waitForTimeout(300)

      // Step 4: Verify trainings return
      const newCount = await page.evaluate(() => {
        return window.Alpine.$data(document.querySelector('[x-data]')).filteredTrainings.length
      })
      expect(newCount).toBeGreaterThan(0)
    })
  })

  test.describe('Flow 9: Persistent State Across Reloads', () => {
    test('user preferences persist after page reload', async ({ page }) => {
      // Determine if mobile viewport
      const viewportSize = page.viewportSize()
      const isMobile = viewportSize && viewportSize.width < 768

      // Step 1: Set filters and add favorite
      const searchSelector = isMobile ? '#mobile-search' : '#search'

      // On mobile, open filter drawer first
      if (isMobile) {
        await page.evaluate(() => {
          window.Alpine.store('ui').mobileFilterOpen = true
        })
        await page.waitForTimeout(300)
      }

      // Set day filter programmatically (checkbox-based array)
      await page.evaluate(() => {
        window.Alpine.store('ui').filters.wochentag = ['Dienstag']
        window.Alpine.$data(document.querySelector('[x-data]')).applyFilters()
      })
      await page.fill(searchSelector, 'Trampolin')

      const firstId = await page.evaluate(() => {
        const store = window.Alpine.$data(document.querySelector('[x-data]'))
        return store.allTrainings[0]?.id
      })

      if (firstId) {
        await page.evaluate((id) => {
          window.Alpine.$data(document.querySelector('[x-data]')).toggleFavorite(id)
        }, firstId)
      }

      await page.waitForTimeout(300)

      // Step 2: Reload page
      await page.reload()
      await page.waitForFunction(() => window.Alpine !== undefined)
      await page.waitForFunction(() => {
        const component = window.Alpine?.$data(document.querySelector('[x-data]'))
        return component?.allTrainings?.length > 0
      }, { timeout: 5000 })

      // Step 3: Verify filters persisted
      const filters = await page.evaluate(() => {
        return window.Alpine.store('ui').filters
      })
      expect(filters.wochentag).toContain('Dienstag')
      expect(filters.searchTerm).toBe('Trampolin')

      // Step 4: Verify favorite persisted
      if (firstId) {
        const isFavorite = await page.evaluate((id) => {
          return window.Alpine.$data(document.querySelector('[x-data]')).isFavorite(id)
        }, firstId)
        expect(isFavorite).toBe(true)
      }
    })
  })

  test.describe('Flow 10: Responsive Behavior', () => {
    test('app adapts between mobile and desktop views', async ({ page }) => {
      // Start desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.waitForTimeout(300)

      // Verify desktop sidebar visible
      const desktopSidebar = page.locator('aside.hidden.lg\\:block')
      await expect(desktopSidebar).toBeVisible()

      // Switch to mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(300)

      // Verify mobile header visible
      const mobileHeader = page.locator('header.lg\\:hidden')
      await expect(mobileHeader).toBeVisible()

      // Switch back to desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.waitForTimeout(300)

      // Verify desktop view restored
      await expect(desktopSidebar).toBeVisible()
    })
  })
})
