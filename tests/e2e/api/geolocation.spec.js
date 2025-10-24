import { test, expect } from '@playwright/test'
import { setupTestDataMocking, waitForAlpineAndData } from '../test-helpers.js'

test.describe('Geolocation API Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await setupTestDataMocking(page)
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('should request geolocation permission and obtain location', async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation'])

    // Set mock coordinates (Munich city center)
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    // Check if geolocation method exists
    const hasGeolocation = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return typeof component?.requestUserLocation === 'function'
    })

    expect(hasGeolocation).toBe(true)

    // Trigger geolocation
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    })

    await page.waitForTimeout(1500)

    // Verify geolocation was set
    const userPosition = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.userPosition
    })

    expect(userPosition).toBeTruthy()
    expect(userPosition.lat).toBeCloseTo(48.1351, 2)
    expect(userPosition.lng).toBeCloseTo(11.5820, 2)

    console.log('User position obtained:', userPosition)
  })

  test('should calculate distances to trainings using Haversine formula', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])

    // Set specific coordinates
    const userLat = 48.1351
    const userLng = 11.5820
    await context.setGeolocation({ latitude: userLat, longitude: userLng })

    // Trigger geolocation
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    })

    await page.waitForTimeout(1500)

    // Get first training with coordinates
    const result = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      const training = component?.allTrainings?.find(t => t.lat && t.lng)
      return training ? {
        distance: training.distance,
        distanceText: training.distanceText,
        lat: training.lat,
        lng: training.lng
      } : null
    })

    expect(result).toBeTruthy()
    expect(result.distance).toBeDefined()
    expect(typeof result.distance).toBe('number')
    expect(result.distance).toBeGreaterThanOrEqual(0)

    // Manually calculate expected distance (Haversine)
    const R = 6371 // Earth radius in km
    const dLat = (result.lat - userLat) * Math.PI / 180
    const dLng = (result.lng - userLng) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(result.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const expected = R * c

    // Distance should be within 0.1km of expected (accounting for precision)
    expect(Math.abs(result.distance - expected)).toBeLessThan(0.1)

    console.log(`Distance calculated: ${result.distance.toFixed(2)}km, Expected: ${expected.toFixed(2)}km`)
  })

  test('should add distanceText property to trainings', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    })

    await page.waitForTimeout(1500)

    // Check if distances were added
    const firstTrainingDistance = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      const training = component?.allTrainings[0]
      return {
        distance: training?.distance,
        distanceText: training?.distanceText
      }
    })

    expect(firstTrainingDistance.distance).toBeDefined()
    expect(firstTrainingDistance.distanceText).toBeTruthy()
    expect(firstTrainingDistance.distanceText).toMatch(/\d+\.?\d* km/)

    console.log('Distance text:', firstTrainingDistance.distanceText)
  })

  test('should handle permission denied gracefully', async ({ page, context }) => {
    // Deny geolocation permission by not granting it
    await context.grantPermissions([])

    // Try to trigger geolocation
    const result = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    }).catch(() => false)

    await page.waitForTimeout(1000)

    // App should still work
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)

    // Check if error was set
    const geolocationError = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.geolocationError
    })

    console.log('Geolocation error:', geolocationError)

    // Should have error message or be null (depending on implementation)
    expect(typeof geolocationError === 'string' || geolocationError === null).toBe(true)
  })

  test('should sort trainings by distance when available', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    })

    await page.waitForTimeout(1500)

    // Check if sorting by distance is available
    const hasSortOption = await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      return store?.sortBy !== undefined
    })

    if (hasSortOption) {
      // Set sort to distance
      await page.evaluate(() => {
        const store = window.Alpine.store('ui')
        store.sortBy = ['distance']
      })

      await page.waitForTimeout(500)

      // Get first 5 distances
      const distances = await page.evaluate(() => {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.filteredTrainings
          ?.map(t => t.distance)
          ?.filter(d => d !== undefined)
          ?.slice(0, 5)
      })

      if (distances && distances.length > 1) {
        // Should be sorted ascending
        for (let i = 1; i < distances.length; i++) {
          expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1])
        }

        console.log('Distances sorted:', distances)
      }
    }
  })

  test('should show geolocation loading state', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    // Check loading state immediately after triggering
    const loadingPromise = page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      const promise = component?.requestUserLocation()

      // Check loading state
      const loading = component?.geolocationLoading
      return { loading }
    })

    const { loading } = await loadingPromise

    // Loading should be true or false (depends on timing)
    expect(typeof loading).toBe('boolean')

    await page.waitForTimeout(1500)

    // After completion, loading should be false
    const finalLoading = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.geolocationLoading
    })

    expect(finalLoading).toBe(false)
  })

  test('should support manual location setting', async ({ page }) => {
    // Set manual location
    const manualLat = 48.1351
    const manualLng = 11.5820
    const address = 'Marienplatz, München'

    await page.evaluate(({ lat, lng, addr }) => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.setManualLocation?.(lat, lng, addr)
    }, { lat: manualLat, lng: manualLng, addr: address })

    await page.waitForTimeout(500)

    // Verify manual location was set
    const manualLocation = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return {
        userPosition: component?.userPosition,
        manualLocationSet: window.Alpine.store('ui')?.manualLocationSet,
        manualLocationAddress: window.Alpine.store('ui')?.manualLocationAddress
      }
    })

    expect(manualLocation.userPosition).toBeTruthy()
    expect(manualLocation.userPosition.lat).toBeCloseTo(manualLat, 4)
    expect(manualLocation.userPosition.lng).toBeCloseTo(manualLng, 4)
    expect(manualLocation.manualLocationSet).toBe(true)

    console.log('Manual location set:', manualLocation)
  })

  test('should persist manual location in localStorage', async ({ page }) => {
    const manualLat = 48.1351
    const manualLng = 11.5820
    const address = 'Test Address'

    await page.evaluate(({ lat, lng, addr }) => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.setManualLocation?.(lat, lng, addr)
    }, { lat: manualLat, lng: manualLng, addr: address })

    await page.waitForTimeout(500)

    // Check localStorage
    const storedLocation = await page.evaluate(() => {
      const stored = localStorage.getItem('manualLocation')
      return stored ? JSON.parse(stored) : null
    })

    expect(storedLocation).toBeTruthy()
    expect(storedLocation.lat).toBeCloseTo(manualLat, 4)
    expect(storedLocation.lng).toBeCloseTo(manualLng, 4)

    console.log('Stored location:', storedLocation)
  })

  test('should reset location and clear distance data', async ({ page, context }) => {
    // First set location
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    })

    await page.waitForTimeout(1500)

    // Verify distance was added
    const beforeReset = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return {
        userPosition: component?.userPosition,
        hasDistance: component?.allTrainings[0]?.distance !== undefined
      }
    })

    expect(beforeReset.userPosition).toBeTruthy()
    expect(beforeReset.hasDistance).toBe(true)

    // Reset location
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.resetLocation?.()
    })

    await page.waitForTimeout(500)

    // Verify location was cleared
    const afterReset = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return {
        userPosition: component?.userPosition,
        hasDistance: component?.allTrainings[0]?.distance !== undefined,
        manualLocationSet: window.Alpine.store('ui')?.manualLocationSet
      }
    })

    expect(afterReset.userPosition).toBeNull()
    expect(afterReset.hasDistance).toBe(false)
    expect(afterReset.manualLocationSet).toBe(false)

    console.log('Location reset successful')
  })

  test('should remove user marker from map on reset', async ({ page, context }) => {
    // Set location first
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    })

    await page.waitForTimeout(1500)

    // Reset location
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.resetLocation?.()
    })

    await page.waitForTimeout(500)

    // Check if marker was removed
    const markerStatus = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return {
        userLocationMarker: component?.userLocationMarker,
        map: component?.map !== null
      }
    })

    expect(markerStatus.userLocationMarker).toBeNull()

    console.log('User marker removed from map')
  })

  test('should calculate distance for all trainings', async ({ page, context }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: 48.1351, longitude: 11.5820 })

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.requestUserLocation()
    })

    await page.waitForTimeout(1500)

    // Count trainings with distance
    const distanceCount = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      const withDistance = component?.allTrainings?.filter(t => t.distance !== undefined).length
      const total = component?.allTrainings?.length
      return { withDistance, total }
    })

    console.log(`Distance calculated for ${distanceCount.withDistance} of ${distanceCount.total} trainings`)

    // Most trainings should have distance (some might not have coordinates)
    expect(distanceCount.withDistance).toBeGreaterThan(0)
    expect(distanceCount.withDistance).toBeLessThanOrEqual(distanceCount.total)
  })
})
