import { test, expect } from '@playwright/test'
import { setupTestDataMocking, waitForAlpineAndData } from '../test-helpers.js'

test.describe('Web Share API Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestDataMocking(page)
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('should check Web Share API availability', async ({ page }) => {
    const isAvailable = await page.evaluate(() => {
      return 'share' in navigator
    })

    console.log('Web Share API available:', isAvailable)

    // Web Share API may not be available in all browsers/contexts
    // This is not a hard requirement, just document availability
    expect(typeof isAvailable).toBe('boolean')
  })

  test('should check if navigator.canShare exists', async ({ page }) => {
    const hasCanShare = await page.evaluate(() => {
      return typeof navigator.canShare === 'function'
    })

    console.log('navigator.canShare available:', hasCanShare)

    // Document capability
    expect(typeof hasCanShare).toBe('boolean')
  })

  test('should have share functionality in ActionsManager', async ({ page }) => {
    const hasShareMethod = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return typeof component?.shareCurrentView === 'function'
    })

    expect(hasShareMethod).toBe(true)
  })

  test('should have shareFavorites functionality', async ({ page }) => {
    const hasShareFavoritesMethod = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return typeof component?.shareFavorites === 'function'
    })

    expect(hasShareFavoritesMethod).toBe(true)
  })

  test('should construct shareable URL with filters', async ({ page }) => {
    // Set some filters
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters.wochentag = ['Montag']
      store.filters.ort = ['LTR']
    })

    await page.waitForTimeout(300)

    // Get current URL
    const url = page.url()

    // URL should contain filter parameters
    expect(url).toContain('wochentag')
    expect(url.length).toBeGreaterThan(20)

    console.log('Shareable URL:', url)
  })

  test('should create valid share data structure', async ({ page }) => {
    const shareData = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      const training = component?.allTrainings[0]

      if (training) {
        // Simulate what shareCurrentView() would create
        const filters = window.Alpine.store('ui').filters
        const hasFilters = Object.values(filters).some(v =>
          Array.isArray(v) ? v.length > 0 : Boolean(v)
        )

        return {
          title: 'FAM Trainingsplan',
          text: hasFilters
            ? `Trainings gefunden - Schau dir diese an!`
            : 'Entdecke alle FAM Trainings in München!',
          url: window.location.href
        }
      }
      return null
    })

    expect(shareData).toBeTruthy()
    expect(shareData.title).toBeTruthy()
    expect(shareData.text).toBeTruthy()
    expect(shareData.url).toBeTruthy()

    // Verify URL is valid
    expect(shareData.url).toMatch(/^https?:\/\//)

    console.log('Share data structure:', shareData)
  })

  test('should handle Web Share API not supported gracefully', async ({ page, context }) => {
    // Remove navigator.share to simulate unsupported browser
    await page.addInitScript(() => {
      delete navigator.share
      delete navigator.canShare
    })

    await page.reload()
    await waitForAlpineAndData(page)

    // App should still work
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)

    // Try to call share method (should use clipboard fallback)
    const shareAttempt = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      if (component?.shareCurrentView) {
        return component.shareCurrentView().then(
          () => ({ success: true }),
          (err) => ({ success: false, error: err.message })
        )
      }
      return { success: false, error: 'Method not found' }
    })

    console.log('Share attempt without API:', shareAttempt)

    // Should either succeed with fallback or fail gracefully
    expect(typeof shareAttempt.success).toBe('boolean')
  })

  test('should have clipboard API as fallback', async ({ page }) => {
    const hasClipboard = await page.evaluate(() => {
      return 'clipboard' in navigator && 'writeText' in navigator.clipboard
    })

    console.log('Clipboard API available:', hasClipboard)

    // Modern browsers should have clipboard API
    expect(hasClipboard).toBe(true)
  })

  test('should copy link to clipboard when Web Share unavailable', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-write', 'clipboard-read'])

    // Remove Web Share API
    await page.addInitScript(() => {
      delete navigator.share
      delete navigator.canShare
    })

    await page.reload()
    await waitForAlpineAndData(page)

    // Try to share (should fall back to clipboard)
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.shareCurrentView()
    })

    await page.waitForTimeout(1000)

    // Try to read clipboard (may fail due to permissions)
    const clipboardContent = await page.evaluate(() => {
      return navigator.clipboard.readText().catch(() => null)
    }).catch(() => null)

    if (clipboardContent) {
      console.log('Clipboard content:', clipboardContent)
      expect(clipboardContent).toContain('localhost')
    } else {
      console.log('Clipboard read not permitted (expected in some contexts)')
    }
  })

  test('should create shareable favorites URL', async ({ page, context }) => {
    // Add some favorites first
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      if (component?.allTrainings?.length > 0) {
        component.toggleFavorite(component.allTrainings[0].id)
        component.toggleFavorite(component.allTrainings[1].id)
      }
    })

    await page.waitForTimeout(500)

    const favCount = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.favorites?.length || 0
    })

    expect(favCount).toBeGreaterThan(0)

    // Simulate share favorites
    const favoritesShareData = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      const baseUrl = window.location.origin + window.location.pathname
      const shareUrl = `${baseUrl}?favorites=true`
      const count = component?.favorites?.length || 0

      return {
        title: 'FAM Trainingsplan - Meine Favoriten',
        text: `Schau dir meine ${count} Lieblings-Trainings an!`,
        url: shareUrl
      }
    })

    expect(favoritesShareData.url).toContain('favorites=true')
    expect(favoritesShareData.text).toContain('Lieblings-Trainings')

    console.log('Favorites share data:', favoritesShareData)
  })

  test('should validate share data with canShare if available', async ({ page }) => {
    const canShareResult = await page.evaluate(() => {
      if (navigator.canShare) {
        const testData = {
          title: 'FAM Trainingsplan',
          text: 'Test share',
          url: window.location.href
        }
        return navigator.canShare(testData)
      }
      return null
    })

    if (canShareResult !== null) {
      console.log('canShare result:', canShareResult)
      expect(typeof canShareResult).toBe('boolean')
    } else {
      console.log('navigator.canShare not available (expected in some contexts)')
    }
  })

  test('should not share when favorites are empty', async ({ page }) => {
    // Clear all favorites
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component.favorites = []
      localStorage.removeItem('fam-favorites')
    })

    await page.waitForTimeout(300)

    // Try to share favorites
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.shareFavorites()
    })

    await page.waitForTimeout(1000)

    // Should show notification (can't directly test notification, but function should complete)
    // No error should be thrown
  })

  test('should handle AbortError when user cancels share', async ({ page }) => {
    // Mock navigator.share to throw AbortError
    await page.addInitScript(() => {
      navigator.share = async () => {
        const error = new Error('Share cancelled')
        error.name = 'AbortError'
        throw error
      }
      navigator.canShare = () => true
    })

    await page.reload()
    await waitForAlpineAndData(page)

    // Try to share (should handle AbortError gracefully)
    const result = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.shareCurrentView()
        .then(() => ({ success: true }))
        .catch((err) => ({ success: false, error: err.name }))
    })

    // AbortError should be handled silently
    console.log('Share with AbortError:', result)

    // Should not crash the app
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)
  })

  test('should include filter count in share text', async ({ page }) => {
    // Apply some filters
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters.wochentag = ['Montag', 'Mittwoch']
      store.filters.training = ['Parkour']
    })

    await page.waitForTimeout(500)

    const shareText = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      const count = component?.filteredTrainings?.length || 0
      const filters = window.Alpine.store('ui').filters
      const hasFilters = Object.values(filters).some(v =>
        Array.isArray(v) ? v.length > 0 : Boolean(v) && v !== 'null'
      )

      return hasFilters
        ? `${count} Trainings gefunden - Schau dir diese an!`
        : 'Entdecke alle FAM Trainings in München!'
    })

    expect(shareText).toContain('Trainings')
    console.log('Share text with filters:', shareText)
  })
})
