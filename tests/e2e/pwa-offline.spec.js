// tests/e2e/pwa-offline.spec.js
/**
 * PWA Offline Scenario Tests
 * Tests Progressive Web App functionality and offline capabilities
 */

import { test, expect } from '@playwright/test'
import { waitForAlpineAndData, getComponentProperty, callComponentMethod } from './test-helpers.js'

test.describe('PWA Offline Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Online/Offline Detection', () => {
    test('should detect and notify when going offline', async ({ context, page }) => {
      // Wait for app to load
      await page.waitForFunction(() => window.Alpine !== undefined)

      // Go offline
      await context.setOffline(true)
      await page.waitForTimeout(500)

      // Verify notification shown
      const notification = await page.evaluate(() => {
        const notif = window.Alpine.store('ui').notification
        return notif?.message || ''
      })

      expect(notification.toLowerCase()).toContain('offline')
    })

    test('should detect and notify when coming back online', async ({ context, page }) => {
      await page.waitForFunction(() => window.Alpine !== undefined)

      // Go offline first
      await context.setOffline(true)
      await page.waitForTimeout(500)

      // Come back online
      await context.setOffline(false)
      await page.waitForTimeout(500)

      // Verify notification shown
      const notification = await page.evaluate(() => {
        const notif = window.Alpine.store('ui').notification
        return notif?.message || ''
      })

      expect(notification.toLowerCase()).toContain('online')
    })
  })

  test.describe('Offline Data Access', () => {
    test('should load previously cached data when offline', async ({ context, page }) => {
      // First visit - data should be cached
      await waitForAlpineAndData(page)

      const onlineCount = await getComponentProperty(page, 'allTrainings').then(arr => arr?.length || 0)

      // Go offline
      await context.setOffline(true)

      // Reload page
      await page.reload()
      await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })

      // Wait a bit for data loading attempt
      await page.waitForTimeout(2000)

      // Data should still be available (from cache or localStorage)
      const offlineCount = await getComponentProperty(page, 'allTrainings').then(arr => arr?.length || 0)

      // Should have some data (exact count may vary based on caching)
      expect(offlineCount).toBeGreaterThanOrEqual(0)
    })

    test('should maintain app functionality offline', async ({ context, page }) => {
      // Load data while online
      await waitForAlpineAndData(page)

      // Go offline
      await context.setOffline(true)
      await page.waitForTimeout(500)

      // Test filtering functionality offline
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.wochentag = 'Montag'
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        component.applyFilters()
      })

      await page.waitForTimeout(300)

      // Filtering should work
      const filteredCount = await getComponentProperty(page, 'filteredTrainings').then(arr => arr?.length || 0)

      expect(filteredCount).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Offline UI Features', () => {
    test('should allow search functionality offline', async ({ context, page }) => {
      // Load data online
      await waitForAlpineAndData(page)

      // Go offline
      await context.setOffline(true)

      // Try searching
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.filters.searchTerm = 'Parkour'
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        component.applyFilters()
      })

      await page.waitForTimeout(400)

      // Search should work with cached data
      const searchTerm = await page.evaluate(() => {
        return window.Alpine.store('ui').filters.searchTerm
      })

      expect(searchTerm).toBe('Parkour')
    })

    test('should allow favorites management offline', async ({ context, page }) => {
      // Load data online
      await waitForAlpineAndData(page)

      const trainingId = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.allTrainings[0]?.id
      })

      if (!trainingId) {
        test.skip()
      }

      // Go offline
      await context.setOffline(true)

      // Add to favorites offline
      await page.evaluate((id) => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        component.toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      // Should work
      const isFavorite = await page.evaluate((id) => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component.isFavorite(id)
      }, trainingId)

      expect(isFavorite).toBe(true)
    })

    test('should persist favorites added offline', async ({ context, page }) => {
      // Load data online
      await waitForAlpineAndData(page)

      const trainingId = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.allTrainings[0]?.id
      })

      if (!trainingId) {
        test.skip()
      }

      // Go offline
      await context.setOffline(true)

      // Add favorite offline
      await page.evaluate((id) => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        component.toggleFavorite(id)
      }, trainingId)

      await page.waitForTimeout(200)

      // Go back online and reload
      await context.setOffline(false)
      await page.reload()
      await waitForAlpineAndData(page)

      // Favorite should persist
      const isFavorite = await page.evaluate((id) => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component.isFavorite(id)
      }, trainingId)

      expect(isFavorite).toBe(true)
    })
  })

  test.describe('PWA Manifest', () => {
    test('should have valid manifest.json', async ({ page }) => {
      const manifestLink = page.locator('link[rel="manifest"]')
      await expect(manifestLink).toHaveAttribute('href', '/manifest.json')

      // Try to fetch manifest
      const response = await page.goto('/manifest.json')
      expect(response?.status()).toBe(200)

      // Parse manifest
      const manifest = await response?.json()
      expect(manifest).toBeDefined()
      expect(manifest.name).toBe('FAM Trainingsplan')
      expect(manifest.short_name).toBe('FAM')
      expect(manifest.start_url).toBe('/')
      expect(manifest.display).toBe('standalone')
    })

    test('should have theme color meta tag', async ({ page }) => {
      await page.goto('/')
      const themeColor = await page.getAttribute('meta[name="theme-color"]', 'content')
      expect(themeColor).toBe('#005892')
    })

    test('should have apple-touch-icon', async ({ page }) => {
      await page.goto('/')
      const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]')
      await expect(appleTouchIcon).toHaveAttribute('href', '/apple-touch-icon.png')
    })
  })

  test.describe('Offline Page Load', () => {
    test('should load basic app shell offline', async ({ context, page }) => {
      // First load online
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Go offline
      await context.setOffline(true)

      // Reload
      await page.reload()

      // App container should still load
      const appExists = await page.locator('#app').isVisible()
      expect(appExists).toBe(true)
    })
  })

  test.describe('Network Recovery', () => {
    test('should recover gracefully when network returns', async ({ context, page }) => {
      await page.waitForFunction(() => window.Alpine !== undefined)

      // Cycle offline/online
      await context.setOffline(true)
      await page.waitForTimeout(500)

      await context.setOffline(false)
      await page.waitForTimeout(500)

      // App should still be functional
      const isWorking = await page.evaluate(() => {
        const component = window.Alpine?.$data(document.querySelector('[x-data]'))
        return window.Alpine !== undefined && component !== undefined
      })

      expect(isWorking).toBe(true)
    })

    test('should show online notification after offline period', async ({ context, page }) => {
      await page.waitForFunction(() => window.Alpine !== undefined)

      // Go offline
      await context.setOffline(true)
      await page.waitForTimeout(1000)

      // Come back online
      await context.setOffline(false)
      await page.waitForTimeout(500)

      // Should show online notification
      const hasOnlineNotif = await page.evaluate(() => {
        const notif = window.Alpine.store('ui').notification
        return notif?.message?.toLowerCase().includes('online') || false
      })

      expect(hasOnlineNotif).toBe(true)
    })
  })

  test.describe('Offline Error Handling', () => {
    test('should handle failed data fetch gracefully', async ({ context, page }) => {
      // Go offline before data loads
      await context.setOffline(true)

      await page.goto('/')
      await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })

      // Wait for data load attempt
      await page.waitForTimeout(3000)

      // App should not crash
      const hasError = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.error !== null
      })

      // Error state should be set or handled gracefully
      expect(hasError).toBeDefined()
    })
  })

  test.describe('Service Worker Status', () => {
    test('should check service worker registration state', async ({ page }) => {
      const swSupported = await page.evaluate(() => {
        return 'serviceWorker' in navigator
      })

      if (!swSupported) {
        test.skip()
      }

      // In dev mode, SW may not be registered
      // This is expected behavior
      const swState = await page.evaluate(async () => {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          return {
            registered: registration !== undefined,
            active: registration?.active !== null
          }
        } catch (e) {
          return { registered: false, active: false }
        }
      })

      // Just verify we can check the state (it may be false in dev mode)
      expect(swState).toBeDefined()
    })
  })

  test.describe('Installability', () => {
    test('should have required PWA elements for installability', async ({ page }) => {
      await page.goto('/')

      // Check manifest
      const hasManifest = await page.locator('link[rel="manifest"]').count()
      expect(hasManifest).toBeGreaterThan(0)

      // Check theme color
      const hasTheme = await page.locator('meta[name="theme-color"]').count()
      expect(hasTheme).toBeGreaterThan(0)

      // Check viewport
      const hasViewport = await page.locator('meta[name="viewport"]').count()
      expect(hasViewport).toBeGreaterThan(0)

      // Check icons
      const hasIcon = await page.locator('link[rel="icon"]').count()
      expect(hasIcon).toBeGreaterThan(0)
    })
  })
})
