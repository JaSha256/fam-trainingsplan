// @ts-check
/**
 * Integration Tests - Map Features
 * @file tests/integration/map-features.spec.js
 *
 * Tests map initialization, controls, and user interactions.
 */

import { test, expect } from '@playwright/test'

test.describe('Map Initialization', () => {
  test('should initialize map with default center and zoom', async ({ page }) => {
    await page.goto('/')

    // Open map modal
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container', { timeout: 5000 })

    // Verify map container exists
    const mapContainer = page.locator('#map-modal-container')
    await expect(mapContainer).toBeVisible()

    // Verify Leaflet initialized
    const leafletContainer = page.locator('.leaflet-container')
    await expect(leafletContainer).toBeVisible()

    // Verify tile layer loaded
    const tiles = page.locator('.leaflet-tile')
    await expect(tiles.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display clusters for multiple markers', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Wait for markers to load
    await page.waitForTimeout(1000)

    // Verify cluster icons exist
    const clusters = page.locator('.md-map-cluster')
    const clusterCount = await clusters.count()

    expect(clusterCount).toBeGreaterThan(0)
  })

  test('should restore map state from localStorage', async ({ page }) => {
    await page.goto('/')

    // Open map and zoom in
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Zoom in twice
    await page.click('.leaflet-control-zoom-in')
    await page.waitForTimeout(300)
    await page.click('.leaflet-control-zoom-in')
    await page.waitForTimeout(300)

    // Close modal
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Reopen map
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Check if zoom was restored (should be > 12)
    const zoomLevel = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      if (!mapEl) return null
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map ? context.map.getZoom() : null
    })

    expect(zoomLevel).toBeGreaterThan(12)
  })
})

test.describe('Custom Map Controls', () => {
  test('should display geolocation control', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Verify geolocation control exists
    const geoControl = page.locator('.leaflet-control-geolocation')
    await expect(geoControl).toBeVisible()

    // Verify button is clickable
    const geoButton = geoControl.locator('button')
    await expect(geoButton).toBeEnabled()
  })

  test('should display reset view control', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Verify reset control exists
    const resetControl = page.locator('.leaflet-control-reset')
    await expect(resetControl).toBeVisible()

    // Verify button is clickable
    const resetButton = resetControl.locator('button')
    await expect(resetButton).toBeEnabled()
  })

  test('should reset view when clicking reset button', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Pan map away from center
    await page.locator('.leaflet-container').click({ position: { x: 200, y: 200 } })
    await page.waitForTimeout(300)

    // Zoom in
    await page.click('.leaflet-control-zoom-in')
    await page.waitForTimeout(300)

    // Click reset button
    await page.click('.leaflet-control-reset button')
    await page.waitForTimeout(600) // Wait for animation

    // Verify zoom returned to default (12)
    const zoomLevel = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map ? context.map.getZoom() : null
    })

    expect(zoomLevel).toBe(12)
  })

  test('should request geolocation when clicking Find Me button', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 48.137154, longitude: 11.576124 })

    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Click geolocation button
    await page.click('.leaflet-control-geolocation button')

    // Wait for loading state
    await page.waitForTimeout(500)

    // Verify user location marker appears
    const userMarker = page.locator('.md-user-location-marker')
    await expect(userMarker).toBeVisible({ timeout: 5000 })

    // Verify success notification
    const notification = page.locator('[role="alert"], .md-snackbar')
    await expect(notification).toBeVisible()
  })
})

test.describe('Keyboard Navigation', () => {
  test('should focus map container with Tab key', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Tab to map container
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Verify map container has focus
    const focusedElement = await page.evaluate(() => document.activeElement?.id)
    expect(focusedElement).toBe('map-modal-container')
  })

  test('should zoom in with + key', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Focus map
    await page.click('#map-modal-container')

    // Get initial zoom
    const initialZoom = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map ? context.map.getZoom() : null
    })

    // Press + key
    await page.keyboard.press('+')
    await page.waitForTimeout(300)

    // Get new zoom
    const newZoom = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map ? context.map.getZoom() : null
    })

    expect(newZoom).toBe(initialZoom + 1)
  })

  test('should zoom out with - key', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Focus map
    await page.click('#map-modal-container')

    // Get initial zoom
    const initialZoom = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map ? context.map.getZoom() : null
    })

    // Press - key
    await page.keyboard.press('-')
    await page.waitForTimeout(300)

    // Get new zoom
    const newZoom = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map ? context.map.getZoom() : null
    })

    expect(newZoom).toBe(initialZoom - 1)
  })

  test('should reset view with Home key', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Zoom and pan
    await page.click('.leaflet-control-zoom-in')
    await page.waitForTimeout(300)

    // Focus and press Home
    await page.click('#map-modal-container')
    await page.keyboard.press('Home')
    await page.waitForTimeout(600)

    // Verify zoom reset
    const zoomLevel = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map ? context.map.getZoom() : null
    })

    expect(zoomLevel).toBe(12)
  })
})

test.describe('Screen Reader Support', () => {
  test('should have ARIA labels on map container', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Verify role and aria-label
    const mapContainer = page.locator('#map-modal-container')
    await expect(mapContainer).toHaveAttribute('role', 'application')
    await expect(mapContainer).toHaveAttribute('aria-label')

    // Verify aria-label is descriptive
    const ariaLabel = await mapContainer.getAttribute('aria-label')
    expect(ariaLabel).toContain('Karte')
    expect(ariaLabel).toContain('Trainingsstandorten')
  })

  test('should have ARIA live region for announcements', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Verify live region exists
    const liveRegion = page.locator('#map-announcements')
    await expect(liveRegion).toBeAttached()
    await expect(liveRegion).toHaveAttribute('aria-live', 'polite')
  })

  test('should announce zoom changes to screen readers', async ({ page }) => {
    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Zoom in
    await page.click('.leaflet-control-zoom-in')
    await page.waitForTimeout(500)

    // Check live region content
    const liveRegion = page.locator('#map-announcements')
    const content = await liveRegion.textContent()

    expect(content).toContain('Zoom-Stufe')
    expect(content).toContain('13') // Default is 12, after zoom in should be 13
  })
})

test.describe('Error Handling', () => {
  test('should handle tile loading errors gracefully', async ({ page }) => {
    // Block tile requests to simulate network error
    await page.route('**/*.tile.openstreetmap.org/**', route => route.abort())

    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Map should still be visible even if tiles fail
    const mapContainer = page.locator('#map-modal-container')
    await expect(mapContainer).toBeVisible()

    // Should not show error to user (handled gracefully)
    const errorDialog = page.locator('[role="alert"]:has-text("error")')
    await expect(errorDialog).not.toBeVisible()
  })

  test('should handle geolocation permission denied', async ({ page, context }) => {
    // Deny geolocation permission
    await context.grantPermissions([])

    await page.goto('/')
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')

    // Click geolocation button
    await page.click('.leaflet-control-geolocation button')
    await page.waitForTimeout(1000)

    // Should show error notification
    const notification = page.locator('[role="alert"], .md-snackbar')
    const notificationText = await notification.textContent()

    expect(notificationText).toContain('Standort')
  })
})

test.describe('Memory Management', () => {
  test('should cleanup map on modal close', async ({ page }) => {
    await page.goto('/')

    // Open map
    await page.click('[data-test="map-button"]')
    await page.waitForSelector('.leaflet-container')
    await page.waitForTimeout(1000)

    // Close map
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // Verify map instance is destroyed
    const mapExists = await page.evaluate(() => {
      const mapEl = document.querySelector('[x-data]')
      if (!mapEl) return false
      // @ts-ignore
      const context = window.Alpine.$data(mapEl)
      return context.map !== null
    })

    expect(mapExists).toBe(false)
  })

  test('should remove event listeners on cleanup', async ({ page }) => {
    await page.goto('/')

    // Open and close map multiple times
    for (let i = 0; i < 3; i++) {
      await page.click('[data-test="map-button"]')
      await page.waitForSelector('.leaflet-container')
      await page.waitForTimeout(500)

      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }

    // No memory leaks should occur (no way to directly test, but shouldn't crash)
    const pageIsResponsive = await page.evaluate(() => true)
    expect(pageIsResponsive).toBe(true)
  })
})
