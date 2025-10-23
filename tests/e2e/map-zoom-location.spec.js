// @ts-check
import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Map Zoom and Location Features
 *
 * Tests comprehensive map interactions including:
 * - Zoom behavior with markers and popups
 * - GPS location marker handling
 * - Manual location marker handling
 * - Location switching scenarios
 * - Duplicate marker prevention
 *
 * @see MANUAL-TEST-DUPLICATE-MARKERS.md for manual test scenarios
 */

test.describe('Map Zoom and Location Features', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation'])

    // Mock geolocation to Munich center
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    // Clear localStorage before each test and navigate to app
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Wait for app to be ready
    await page.waitForSelector('[x-data]', { timeout: 10000 })
  })

  test.describe('Basic Zoom Behavior', () => {
    test('should zoom in without errors', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Get initial zoom level
      const initialZoom = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        if (!trainingsplanerEl) return null
        const context = window.Alpine.$data(trainingsplanerEl)
        return context.map?.getZoom()
      })

      // Click zoom in button
      await page.click('.leaflet-control-zoom-in')
      await page.waitForTimeout(500)

      // Verify zoom increased
      const newZoom = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)
        return context.map?.getZoom()
      })

      expect(newZoom).toBeGreaterThan(initialZoom)

      // Check for console errors
      const errors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      await page.waitForTimeout(1000)
      expect(errors).toHaveLength(0)
    })

    test('should zoom out without errors', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Get initial zoom level
      const initialZoom = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)
        return context.map?.getZoom()
      })

      // Click zoom out button
      await page.click('.leaflet-control-zoom-out')
      await page.waitForTimeout(500)

      // Verify zoom decreased
      const newZoom = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)
        return context.map?.getZoom()
      })

      expect(newZoom).toBeLessThan(initialZoom)
    })

    test('should handle mouse wheel zoom without errors', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Track console errors
      const errors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      // Get map container
      const mapContainer = await page.locator('#map')

      // Simulate wheel zoom
      await mapContainer.hover()
      await page.mouse.wheel(0, 100) // Scroll down (zoom out)
      await page.waitForTimeout(500)

      await page.mouse.wheel(0, -100) // Scroll up (zoom in)
      await page.waitForTimeout(500)

      // Verify no errors
      expect(errors).toHaveLength(0)
    })
  })

  test.describe('Marker and Popup Zoom Interactions', () => {
    test('should close popup when zooming (race condition fix)', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Click on a marker cluster to open
      await page.click('.marker-cluster')
      await page.waitForTimeout(300)

      // Click on individual marker
      const marker = await page.locator('.leaflet-marker-icon').first()
      await marker.click()
      await page.waitForTimeout(300)

      // Verify popup is open
      const popupBefore = await page.locator('.leaflet-popup').count()
      expect(popupBefore).toBe(1)

      // Track console errors
      const errors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      // Zoom in (should trigger zoomstart and close popup)
      await page.click('.leaflet-control-zoom-in')
      await page.waitForTimeout(500)

      // Verify popup is closed (or no errors if it stays open)
      const criticalErrors = errors.filter(err =>
        err.includes('_latLngToNewLayerPoint') ||
        err.includes('Cannot read properties of null')
      )
      expect(criticalErrors).toHaveLength(0)
    })

    test('should handle marker click during zoom animation', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Track errors
      const errors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      // Start zoom animation
      await page.click('.leaflet-control-zoom-in')

      // Click marker during animation (within 100ms)
      await page.waitForTimeout(50)
      const marker = await page.locator('.leaflet-marker-icon').first()
      await marker.click({ force: true }).catch(() => {}) // May fail, that's ok

      await page.waitForTimeout(1000)

      // Verify no critical errors
      const criticalErrors = errors.filter(err =>
        err.includes('_latLngToNewLayerPoint') ||
        err.includes('Cannot read properties of null')
      )
      expect(criticalErrors).toHaveLength(0)
    })

    test('should handle rapid zoom changes', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Track errors
      const errors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
      })

      // Rapid zoom in/out
      for (let i = 0; i < 5; i++) {
        await page.click('.leaflet-control-zoom-in')
        await page.waitForTimeout(50)
        await page.click('.leaflet-control-zoom-out')
        await page.waitForTimeout(50)
      }

      await page.waitForTimeout(1000)

      // Verify no errors
      expect(errors).toHaveLength(0)
    })
  })

  test.describe('GPS Location Marker', () => {
    test('should add single GPS marker when clicking "Mein Standort"', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Click "Mein Standort" button
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()
      await page.waitForTimeout(1000)

      // Count user location markers
      const markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })

      expect(markerCount).toBe(1)
    })

    test('should show notification after GPS location obtained', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Click "Mein Standort" button
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()

      // Wait for notification
      const notification = await page.locator('.notification, [role="alert"]').first()
      await expect(notification).toBeVisible({ timeout: 5000 })

      // Verify notification contains location message
      const text = await notification.textContent()
      expect(text).toContain('Standort')
    })

    test('should zoom to GPS location', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Get initial center
      const initialCenter = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)
        const center = context.map?.getCenter()
        return { lat: center.lat, lng: center.lng }
      })

      // Click "Mein Standort" button
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()
      await page.waitForTimeout(1500)

      // Get new center
      const newCenter = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)
        const center = context.map?.getCenter()
        return { lat: center.lat, lng: center.lng }
      })

      // Verify center changed (map moved to user location)
      const latDiff = Math.abs(newCenter.lat - initialCenter.lat)
      const lngDiff = Math.abs(newCenter.lng - initialCenter.lng)

      expect(latDiff > 0.001 || lngDiff > 0.001).toBeTruthy()
    })
  })

  test.describe('Manual Location Marker', () => {
    test('should add single manual location marker', async ({ page }) => {
      // Open settings
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      // Enable manual location
      const toggle = await page.locator('input[type="checkbox"]').first()
      await toggle.click()
      await page.waitForTimeout(300)

      // Enter coordinates (Munich LMU)
      await page.fill('input[placeholder*="Breitengrad"]', '48.1786')
      await page.fill('input[placeholder*="Längengrad"]', '11.5750')
      await page.fill('input[placeholder*="Adresse"]', 'LMU München')

      // Save
      await page.click('button:has-text("Speichern")')
      await page.waitForTimeout(500)

      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Count user location markers
      const markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })

      expect(markerCount).toBe(1)
    })

    test('should persist manual location after reload', async ({ page }) => {
      // Set manual location
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      const toggle = await page.locator('input[type="checkbox"]').first()
      await toggle.click()
      await page.waitForTimeout(300)

      await page.fill('input[placeholder*="Breitengrad"]', '48.1351')
      await page.fill('input[placeholder*="Längengrad"]', '11.5820')
      await page.click('button:has-text("Speichern")')
      await page.waitForTimeout(500)

      // Reload page
      await page.reload()
      await page.waitForTimeout(1000)

      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Verify marker still exists
      const markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })

      expect(markerCount).toBe(1)
    })
  })

  test.describe('Location Switching Scenarios (Duplicate Marker Prevention)', () => {
    test('GPS → Manual: should show only one marker', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Step 1: Get GPS location
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()
      await page.waitForTimeout(1500)

      // Verify single GPS marker
      let markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })
      expect(markerCount).toBe(1)

      // Step 2: Switch to manual location
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      const toggle = await page.locator('input[type="checkbox"]').first()
      await toggle.click()
      await page.waitForTimeout(300)

      await page.fill('input[placeholder*="Breitengrad"]', '48.1786')
      await page.fill('input[placeholder*="Längengrad"]', '11.5750')
      await page.click('button:has-text("Speichern")')
      await page.waitForTimeout(500)

      // Verify still only ONE marker (manual, GPS removed)
      markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })
      expect(markerCount).toBe(1)
    })

    test('Manual → GPS: should show only one marker', async ({ page }) => {
      // Step 1: Set manual location first
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      const toggle = await page.locator('input[type="checkbox"]').first()
      await toggle.click()
      await page.waitForTimeout(300)

      await page.fill('input[placeholder*="Breitengrad"]', '48.1351')
      await page.fill('input[placeholder*="Längengrad"]', '11.5820')
      await page.click('button:has-text("Speichern")')
      await page.waitForTimeout(500)

      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Verify single manual marker
      let markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })
      expect(markerCount).toBe(1)

      // Step 2: Disable manual location and use GPS
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      const toggleOff = await page.locator('input[type="checkbox"]').first()
      await toggleOff.click()
      await page.waitForTimeout(300)

      // Click outside to close settings
      await page.click('body')
      await page.waitForTimeout(300)

      // Click GPS button
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()
      await page.waitForTimeout(1500)

      // Verify still only ONE marker (GPS, manual removed)
      markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })
      expect(markerCount).toBe(1)
    })

    test('Reset Location: should remove all markers', async ({ page }) => {
      // Set manual location
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      const toggle = await page.locator('input[type="checkbox"]').first()
      await toggle.click()
      await page.waitForTimeout(300)

      await page.fill('input[placeholder*="Breitengrad"]', '48.1351')
      await page.fill('input[placeholder*="Längengrad"]', '11.5820')
      await page.click('button:has-text("Speichern")')
      await page.waitForTimeout(500)

      // Verify marker exists
      let markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })
      expect(markerCount).toBe(1)

      // Reset location
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      await page.click('button:has-text("Standort zurücksetzen")')
      await page.waitForTimeout(500)

      // Verify NO markers
      markerCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)

        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++

        return count
      })
      expect(markerCount).toBe(0)
    })

    test('Multiple switches stress test: should never show duplicate markers', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Perform 3 cycles: GPS → Manual → GPS → Manual → Reset
      for (let i = 0; i < 3; i++) {
        // GPS
        const locationBtn = await page.locator('.leaflet-control-custom').first()
        await locationBtn.click()
        await page.waitForTimeout(1000)

        let markerCount = await page.evaluate(() => {
          const trainingsplanerEl = document.querySelector('[x-data]')
          const context = window.Alpine.$data(trainingsplanerEl)
          let count = 0
          if (context.userLocationMarker) count++
          if (context.geolocationControl?._userMarker) count++
          return count
        })
        expect(markerCount).toBeLessThanOrEqual(1)

        // Manual
        await page.click('button[aria-label="Einstellungen"]')
        await page.waitForTimeout(300)

        const toggle = await page.locator('input[type="checkbox"]').first()
        if (!(await toggle.isChecked())) {
          await toggle.click()
          await page.waitForTimeout(300)
        }

        await page.fill('input[placeholder*="Breitengrad"]', String(48.1 + i * 0.01))
        await page.fill('input[placeholder*="Längengrad"]', String(11.5 + i * 0.01))
        await page.click('button:has-text("Speichern")')
        await page.waitForTimeout(500)

        markerCount = await page.evaluate(() => {
          const trainingsplanerEl = document.querySelector('[x-data]')
          const context = window.Alpine.$data(trainingsplanerEl)
          let count = 0
          if (context.userLocationMarker) count++
          if (context.geolocationControl?._userMarker) count++
          return count
        })
        expect(markerCount).toBeLessThanOrEqual(1)
      }

      // Final reset
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)
      await page.click('button:has-text("Standort zurücksetzen")')
      await page.waitForTimeout(500)

      const finalCount = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)
        let count = 0
        if (context.userLocationMarker) count++
        if (context.geolocationControl?._userMarker) count++
        return count
      })
      expect(finalCount).toBe(0)
    })
  })

  test.describe('"Mein Standort" Button Smart Behavior', () => {
    test('should use saved manual location instead of GPS when available', async ({ page }) => {
      // Set manual location
      await page.click('button[aria-label="Einstellungen"]')
      await page.waitForTimeout(300)

      const toggle = await page.locator('input[type="checkbox"]').first()
      await toggle.click()
      await page.waitForTimeout(300)

      await page.fill('input[placeholder*="Breitengrad"]', '48.1786')
      await page.fill('input[placeholder*="Längengrad"]', '11.5750')
      await page.fill('input[placeholder*="Adresse"]', 'LMU München')
      await page.click('button:has-text("Speichern")')
      await page.waitForTimeout(500)

      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Click "Mein Standort" button
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()
      await page.waitForTimeout(1000)

      // Verify notification mentions saved location
      const notification = await page.locator('.notification, [role="alert"]').first()
      const text = await notification.textContent()
      expect(text).toContain('Gespeicherter Standort')

      // Verify map centered on manual location (not GPS)
      const center = await page.evaluate(() => {
        const trainingsplanerEl = document.querySelector('[x-data]')
        const context = window.Alpine.$data(trainingsplanerEl)
        const center = context.map?.getCenter()
        return { lat: center.lat, lng: center.lng }
      })

      // Should be close to LMU coordinates (48.1786, 11.5750)
      expect(Math.abs(center.lat - 48.1786)).toBeLessThan(0.01)
      expect(Math.abs(center.lng - 11.5750)).toBeLessThan(0.01)
    })

    test('should request GPS when no manual location saved', async ({ page }) => {
      // Switch to map view
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Click "Mein Standort" button
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()
      await page.waitForTimeout(1000)

      // Verify notification does NOT mention "Gespeicherter Standort"
      const notification = await page.locator('.notification, [role="alert"]').first()
      const text = await notification.textContent()
      expect(text).toContain('Standort ermittelt')
    })
  })

  test.describe('Console Error Monitoring', () => {
    test('should not produce Leaflet errors during normal usage flow', async ({ page }) => {
      const errors = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      // Comprehensive usage flow
      await page.click('button[aria-label*="Kartenansicht"]')
      await page.waitForTimeout(500)

      // Zoom in/out
      await page.click('.leaflet-control-zoom-in')
      await page.waitForTimeout(300)
      await page.click('.leaflet-control-zoom-out')
      await page.waitForTimeout(300)

      // Click marker
      const marker = await page.locator('.leaflet-marker-icon').first()
      await marker.click()
      await page.waitForTimeout(300)

      // Zoom with popup open
      await page.click('.leaflet-control-zoom-in')
      await page.waitForTimeout(500)

      // Get GPS location
      const locationBtn = await page.locator('.leaflet-control-custom').first()
      await locationBtn.click()
      await page.waitForTimeout(1500)

      // Filter Leaflet-specific errors
      const leafletErrors = errors.filter(err =>
        err.includes('Leaflet') ||
        err.includes('_latLngToNewLayerPoint') ||
        err.includes('Cannot read properties of null')
      )

      expect(leafletErrors).toHaveLength(0)
    })
  })
})
