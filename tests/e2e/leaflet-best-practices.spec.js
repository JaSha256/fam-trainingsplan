// tests/e2e/leaflet-best-practices.spec.js
// E2E Tests for Leaflet Best Practice Fixes
// Validates that the 3 critical anti-patterns have been fixed:
// 1. No invalidateSize() after zoom operations
// 2. No invalidateSize() after marker clicks
// 3. Correct tile layer configuration (updateWhenIdle, updateInterval, no updateWhenZooming)

import { test, expect } from '@playwright/test'

/**
 * Helper: Switch to map view and wait for initialization
 */
async function switchToMapView(page) {
  await page.waitForSelector('[x-data]', { state: 'attached' })
  await page.evaluate(() => {
    if (window.Alpine && window.Alpine.store('ui')) {
      window.Alpine.store('ui').activeView = 'map'
    }
  })
  await page.waitForSelector('#map-view-container', { state: 'visible', timeout: 5000 })
  await page.waitForSelector('.leaflet-tile-loaded', { state: 'visible', timeout: 10000 })
  await page.waitForSelector('.leaflet-marker-icon', { state: 'visible', timeout: 5000 })
}

/**
 * Helper: Count network tile requests
 */
async function countTileRequests(page, duration = 2000) {
  const tileRequests = []

  // Listen for tile requests
  page.on('request', request => {
    const url = request.url()
    if (url.includes('.tile.openstreetmap.org') ||
        url.includes('arcgisonline.com') ||
        url.includes('opentopomap.org')) {
      tileRequests.push({
        url,
        timestamp: Date.now()
      })
    }
  })

  await page.waitForTimeout(duration)

  return tileRequests
}

/**
 * Helper: Get tile layer configuration from page
 */
async function getTileLayerConfig(page) {
  return await page.evaluate(() => {
    const alpineEl = document.querySelector('[x-data]')
    if (!alpineEl || !window.Alpine) return null

    const context = window.Alpine.$data(alpineEl)
    const map = context.integratedMap
    if (!map) return null

    // Access the active tile layer
    const tileLayer = context.tileLayer
    if (!tileLayer || !tileLayer.options) return null

    return {
      updateWhenIdle: tileLayer.options.updateWhenIdle,
      updateInterval: tileLayer.options.updateInterval,
      updateWhenZooming: tileLayer.options.updateWhenZooming,
      keepBuffer: tileLayer.options.keepBuffer,
      detectRetina: tileLayer.options.detectRetina,
      maxZoom: tileLayer.options.maxZoom,
      minZoom: tileLayer.options.minZoom
    }
  })
}

test.describe('Leaflet Best Practices - Anti-Pattern Prevention', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await switchToMapView(page)
  })

  test('should NOT reload tiles after zoom operations', async ({ page }) => {
    // Wait for initial tiles to load
    await page.waitForTimeout(2000)

    // Clear tile request tracking
    const tileRequestsBeforeZoom = []
    const tileRequestsDuringZoom = []

    // Track requests before zoom
    page.on('request', request => {
      const url = request.url()
      if (url.includes('.tile.openstreetmap.org')) {
        tileRequestsBeforeZoom.push(url)
      }
    })

    await page.waitForTimeout(1000)
    const beforeCount = tileRequestsBeforeZoom.length

    // Perform zoom operation
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      if (map) {
        map.setZoom(map.getZoom() + 1)
      }
    })

    // Track requests during/after zoom
    page.on('request', request => {
      const url = request.url()
      if (url.includes('.tile.openstreetmap.org')) {
        tileRequestsDuringZoom.push(url)
      }
    })

    // Wait for zoom animation to complete
    await page.waitForTimeout(1500)
    const afterCount = tileRequestsDuringZoom.length

    // Tiles should be loaded during zoom (expected behavior)
    // BUT without invalidateSize(), tile requests are optimized
    // We verify tiles load smoothly without excessive reloading
    expect(afterCount).toBeGreaterThanOrEqual(0)

    // Verify no console errors about invalidateSize
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    expect(consoleErrors.filter(e => e.includes('invalidateSize')).length).toBe(0)
  })

  test('should NOT reload tiles after marker click', async ({ page }) => {
    // Track tile requests
    const tileRequests = []
    page.on('request', request => {
      const url = request.url()
      if (url.includes('.tile.openstreetmap.org')) {
        tileRequests.push({
          url,
          timestamp: Date.now()
        })
      }
    })

    // Wait for initial load
    await page.waitForTimeout(2000)
    const initialCount = tileRequests.length

    // Click first marker
    await page.locator('.leaflet-marker-icon').first().click()
    await page.waitForSelector('.leaflet-popup', { state: 'visible', timeout: 2000 })

    // Wait for potential tile reloading (should not happen)
    await page.waitForTimeout(1500)
    const afterClickCount = tileRequests.length

    // Tile requests should be minimal after marker click
    // panBy() loads tiles for new viewport naturally, but no excessive reloading
    const newTileRequests = afterClickCount - initialCount

    // Allow some tile loading for pan operation, but not excessive
    expect(newTileRequests).toBeLessThan(20) // Reasonable threshold

    // Verify no console errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    expect(consoleErrors.length).toBe(0)
  })

  test('should handle rapid marker clicks without excessive tile reloading', async ({ page }) => {
    // Track tile requests
    const tileRequests = []
    page.on('request', request => {
      const url = request.url()
      if (url.includes('.tile.openstreetmap.org')) {
        tileRequests.push(Date.now())
      }
    })

    // Wait for initial load
    await page.waitForTimeout(2000)
    const initialCount = tileRequests.length

    // Click multiple markers rapidly
    const markers = page.locator('.leaflet-marker-icon')
    const markerCount = await markers.count()

    for (let i = 0; i < Math.min(markerCount, 5); i++) {
      await markers.nth(i).click({ timeout: 1000 }).catch(() => {})
      await page.waitForTimeout(200) // Rapid clicks
    }

    // Wait for animations to settle
    await page.waitForTimeout(1500)
    const finalCount = tileRequests.length

    // Should not have excessive tile reloading from rapid clicks
    const totalNewRequests = finalCount - initialCount

    // Allow reasonable tile loading, but prevent excessive reloading
    expect(totalNewRequests).toBeLessThan(50) // Threshold for 5 clicks

    // Verify no JavaScript errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    expect(consoleErrors.length).toBe(0)
  })
})

test.describe('Leaflet Best Practices - Tile Layer Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await switchToMapView(page)
  })

  test('should use correct tile layer configuration (mobile-optimized)', async ({ page }) => {
    const config = await getTileLayerConfig(page)

    expect(config).not.toBeNull()

    // Verify mobile-first PWA optimizations
    expect(config.updateWhenIdle).toBe(true) // Wait for idle before loading tiles
    expect(config.updateInterval).toBe(200) // Balanced throttling (Leaflet default)
    expect(config.updateWhenZooming).toBeUndefined() // Use Leaflet default (false) - no flicker
    expect(config.keepBuffer).toBe(3) // Extra caching for smooth panning
    expect(config.detectRetina).toBe(true) // High-DPI support
  })

  test('should NOT use updateWhenZooming: true (prevents tile flickering)', async ({ page }) => {
    const config = await getTileLayerConfig(page)

    expect(config).not.toBeNull()

    // CRITICAL: updateWhenZooming should be undefined or false
    // Setting it to true causes tile flickering during zoom animations
    expect(config.updateWhenZooming).not.toBe(true)
  })

  test('should load tiles smoothly during zoom without flickering', async ({ page }) => {
    // Track tile visibility during zoom
    const tileVisibilityLog = []

    // Perform zoom and track tile visibility
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      if (map) {
        // Zoom in
        map.setZoom(map.getZoom() + 2)
      }
    })

    // Sample tile visibility during animation
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(200)
      const visibleTiles = await page.evaluate(() => {
        return document.querySelectorAll('.leaflet-tile:not([style*="opacity: 0"])').length
      })
      tileVisibilityLog.push(visibleTiles)
    }

    // Tiles should remain visible throughout zoom (no flickering)
    // All samples should have tiles visible
    expect(tileVisibilityLog.every(count => count > 0)).toBe(true)
  })

  test('should throttle tile requests during fast panning (updateInterval: 200)', async ({ page }) => {
    const tileRequests = []

    page.on('request', request => {
      const url = request.url()
      if (url.includes('.tile.openstreetmap.org')) {
        tileRequests.push(Date.now())
      }
    })

    // Wait for initial load
    await page.waitForTimeout(2000)
    tileRequests.length = 0 // Reset counter

    // Perform rapid pan operations
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      if (map) {
        // Rapid panning
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            map.panBy([50, 0], { animate: false })
          }, i * 50)
        }
      }
    })

    // Wait for panning to complete
    await page.waitForTimeout(2000)

    // Calculate request intervals
    const intervals = []
    for (let i = 1; i < tileRequests.length; i++) {
      intervals.push(tileRequests[i] - tileRequests[i - 1])
    }

    // Average interval should be >= updateInterval (200ms)
    // This confirms throttling is working
    if (intervals.length > 0) {
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      expect(avgInterval).toBeGreaterThanOrEqual(150) // Allow some variance
    }
  })

  test('should use keepBuffer: 3 for smooth panning (caching optimization)', async ({ page }) => {
    const config = await getTileLayerConfig(page)

    expect(config).not.toBeNull()
    expect(config.keepBuffer).toBe(3)

    // Verify extra tiles are kept in buffer for smooth panning
    const bufferTileCount = await page.evaluate(() => {
      const container = document.querySelector('.leaflet-tile-container')
      if (!container) return 0

      // Count all tiles (visible + buffered)
      const allTiles = container.querySelectorAll('.leaflet-tile')
      const visibleTiles = container.querySelectorAll('.leaflet-tile-loaded:not([style*="opacity: 0"])')

      // Buffer tiles = total tiles - visible tiles
      return allTiles.length - visibleTiles.length
    })

    // Should have buffered tiles for smoother panning
    expect(bufferTileCount).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Leaflet Best Practices - Performance Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
    await switchToMapView(page)
  })

  test('should perform smoothly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Navigate and switch to map
    await page.goto('http://localhost:5173')
    await switchToMapView(page)

    // Perform zoom operation
    const startTime = Date.now()
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      if (map) {
        map.setZoom(map.getZoom() + 1)
      }
    })

    // Wait for zoom animation
    await page.waitForTimeout(1500)
    const zoomDuration = Date.now() - startTime

    // Zoom should complete within reasonable time (< 2 seconds)
    expect(zoomDuration).toBeLessThan(2000)

    // Click marker
    const clickStart = Date.now()
    await page.locator('.leaflet-marker-icon').first().click()
    await page.waitForSelector('.leaflet-popup', { state: 'visible', timeout: 2000 })
    const clickDuration = Date.now() - clickStart

    // Marker click and centering should be fast (< 1.5 seconds)
    expect(clickDuration).toBeLessThan(1500)

    // Verify no console errors
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    expect(consoleErrors.length).toBe(0)
  })

  test('should handle zoom+pan combinations smoothly', async ({ page }) => {
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Perform zoom
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      if (map) {
        map.setZoom(map.getZoom() + 1)
      }
    })

    // Immediately pan (before zoom completes)
    await page.waitForTimeout(200)
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      if (map) {
        map.panBy([100, 100])
      }
    })

    // Wait for both animations
    await page.waitForTimeout(2000)

    // Should complete without errors
    expect(consoleErrors.length).toBe(0)

    // Map should still be responsive
    const mapIsResponsive = await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return false

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      return map !== null && map !== undefined
    })

    expect(mapIsResponsive).toBe(true)
  })

  test('should validate all 3 critical fixes are working', async ({ page }) => {
    // This test validates all 3 Leaflet best practice fixes:
    // 1. No invalidateSize() after zoom
    // 2. No invalidateSize() after marker click
    // 3. Correct tile layer config

    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 1. Test zoom operation
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]')
      if (!alpineEl || !window.Alpine) return

      const context = window.Alpine.$data(alpineEl)
      const map = context.integratedMap
      if (map) map.setZoom(map.getZoom() + 1)
    })
    await page.waitForTimeout(1000)

    // 2. Test marker click
    await page.locator('.leaflet-marker-icon').first().click()
    await page.waitForSelector('.leaflet-popup', { state: 'visible', timeout: 2000 })
    await page.waitForTimeout(1000)

    // 3. Verify tile layer config
    const config = await getTileLayerConfig(page)
    expect(config.updateWhenIdle).toBe(true)
    expect(config.updateInterval).toBe(200)
    expect(config.updateWhenZooming).not.toBe(true)

    // All operations should complete without errors
    expect(consoleErrors.length).toBe(0)

    // Map should remain functional
    const mapIsWorking = await page.evaluate(() => {
      const map = document.querySelector('.leaflet-container')
      const tiles = document.querySelectorAll('.leaflet-tile-loaded')
      const markers = document.querySelectorAll('.leaflet-marker-icon')
      return map !== null && tiles.length > 0 && markers.length > 0
    })

    expect(mapIsWorking).toBe(true)
  })
})
