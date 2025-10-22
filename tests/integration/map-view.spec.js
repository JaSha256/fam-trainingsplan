// @ts-check
/**
 * Integration Tests - Map View (Task 11.5)
 * @file tests/integration/map-view.spec.js
 *
 * Tests for standalone map view component (not modal).
 * Verifies map initializes in 'map-view-container' and persists across view switches.
 */

import { test, expect } from '@playwright/test'

test.describe('Map View Initialization', () => {
  test('should initialize map in map-view-container when switching to map view', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch to map view (mobile)
    const mapTab = page.locator('[data-testid="view-tab-map"]')
    await mapTab.click()

    // Wait for map container to be visible
    await page.waitForSelector('#map-view-container', { timeout: 5000 })

    // Verify map-view-container exists (not map-modal-container)
    const mapViewContainer = page.locator('#map-view-container')
    await expect(mapViewContainer).toBeVisible()

    // Verify Leaflet initialized inside map-view-container
    const leafletContainer = page.locator('#map-view-container .leaflet-container')
    await expect(leafletContainer).toBeVisible()

    // Verify old modal container doesn't exist or isn't used
    const modalContainer = page.locator('#map-modal-container .leaflet-container')
    await expect(modalContainer).not.toBeVisible()
  })

  test('should load tiles in map view', async ({ page }) => {
    await page.goto('/')

    // Switch to map view
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForSelector('#map-view-container .leaflet-container')

    // Wait for tiles to load
    await page.waitForTimeout(2000)

    // Verify tile layer loaded
    const tiles = page.locator('#map-view-container .leaflet-tile')
    await expect(tiles.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display markers in map view', async ({ page }) => {
    await page.goto('/')

    // Switch to map view
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForSelector('#map-view-container .leaflet-container')

    // Wait for markers to load
    await page.waitForTimeout(2000)

    // Verify cluster icons or markers exist
    const clusters = page.locator('#map-view-container .md-map-cluster')
    const clusterCount = await clusters.count()

    expect(clusterCount).toBeGreaterThan(0)
  })
})

test.describe('Map View Persistence', () => {
  test('should preserve map instance when switching away from map view', async ({ page }) => {
    await page.goto('/')

    // Switch to map view
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForSelector('#map-view-container .leaflet-container')
    await page.waitForTimeout(1000)

    // Get map instance reference
    const mapExists1 = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      if (!mapEl) return false
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.integratedMap !== null && context.integratedMap !== undefined
    })
    expect(mapExists1).toBe(true)

    // Switch to list view
    await page.click('[data-testid="view-tab-list"]')
    await page.waitForTimeout(500)

    // Map instance should still exist (not destroyed)
    const mapStillExists = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      if (!mapEl) return false
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.integratedMap !== null && context.integratedMap !== undefined
    })
    expect(mapStillExists).toBe(true)

    // Switch back to map view
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForTimeout(500)

    // Map should be visible again (same instance)
    const mapViewContainer = page.locator('#map-view-container')
    await expect(mapViewContainer).toBeVisible()

    const leafletContainer = page.locator('#map-view-container .leaflet-container')
    await expect(leafletContainer).toBeVisible()
  })

  test('should preserve map zoom level across view switches', async ({ page }) => {
    await page.goto('/')

    // Switch to map view
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForSelector('#map-view-container .leaflet-container')
    await page.waitForTimeout(1000)

    // Zoom in twice
    await page.click('#map-view-container .leaflet-control-zoom-in')
    await page.waitForTimeout(300)
    await page.click('#map-view-container .leaflet-control-zoom-in')
    await page.waitForTimeout(300)

    // Get zoom level
    const zoomBefore = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.integratedMap ? context.integratedMap.getZoom() : null
    })

    // Switch away and back
    await page.click('[data-testid="view-tab-list"]')
    await page.waitForTimeout(500)
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForTimeout(500)

    // Verify zoom preserved
    const zoomAfter = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.integratedMap ? context.integratedMap.getZoom() : null
    })

    expect(zoomAfter).toBe(zoomBefore)
    expect(zoomAfter).toBeGreaterThan(12) // Should be 14 (12 + 2)
  })

  test('should preserve map center position across view switches', async ({ page }) => {
    await page.goto('/')

    // Switch to map view
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForSelector('#map-view-container .leaflet-container')
    await page.waitForTimeout(1000)

    // Pan map by clicking
    const mapContainer = page.locator('#map-view-container .leaflet-container')
    await mapContainer.click({ position: { x: 200, y: 200 } })
    await page.waitForTimeout(500)

    // Get center position
    const centerBefore = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      if (!context.integratedMap) return null
      const center = context.integratedMap.getCenter()
      return { lat: center.lat, lng: center.lng }
    })

    // Switch away and back
    await page.click('[data-testid="view-tab-favorites"]')
    await page.waitForTimeout(500)
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForTimeout(500)

    // Verify center preserved
    const centerAfter = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      if (!context.integratedMap) return null
      const center = context.integratedMap.getCenter()
      return { lat: center.lat, lng: center.lng }
    })

    expect(centerAfter).not.toBeNull()
    expect(centerAfter.lat).toBeCloseTo(centerBefore.lat, 4)
    expect(centerAfter.lng).toBeCloseTo(centerBefore.lng, 4)
  })

  test('should preserve markers across view switches', async ({ page }) => {
    await page.goto('/')

    // Switch to map view
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForSelector('#map-view-container .leaflet-container')
    await page.waitForTimeout(1000)

    // Count markers
    const markersBefore = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.integratedMarkers ? context.integratedMarkers.length : 0
    })

    expect(markersBefore).toBeGreaterThan(0)

    // Switch away and back
    await page.click('[data-testid="view-tab-list"]')
    await page.waitForTimeout(500)
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForTimeout(500)

    // Verify markers still exist
    const markersAfter = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.integratedMarkers ? context.integratedMarkers.length : 0
    })

    expect(markersAfter).toBe(markersBefore)
  })
})

test.describe('Map View vs Modal', () => {
  test('should not initialize map modal when using view tabs', async ({ page }) => {
    await page.goto('/')

    // Switch to map view via tabs
    await page.click('[data-testid="view-tab-map"]')
    await page.waitForSelector('#map-view-container .leaflet-container')

    // Verify modal map is NOT initialized
    const modalMapExists = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      if (!mapEl) return false
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map !== null && context.map !== undefined
    })

    expect(modalMapExists).toBe(false)

    // Only integratedMap should exist
    const viewMapExists = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      if (!mapEl) return false
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.integratedMap !== null && context.integratedMap !== undefined
    })

    expect(viewMapExists).toBe(true)
  })
})

test.describe('Console Errors', () => {
  test('should not log errors when switching views', async ({ page }) => {
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Switch views multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="view-tab-map"]')
      await page.waitForTimeout(500)
      await page.click('[data-testid="view-tab-list"]')
      await page.waitForTimeout(500)
    }

    // Filter out expected errors (if any)
    const relevantErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('manifest')
    )

    expect(relevantErrors).toHaveLength(0)
  })
})
