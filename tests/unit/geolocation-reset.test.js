// @ts-check
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GeolocationManager } from '../../src/js/trainingsplaner/geolocation-manager.js'

describe('GeolocationManager - Reset Location', () => {
  let state
  let context
  let applyFiltersMock
  let geolocationManager

  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    }

    // Setup state
    state = {
      allTrainings: [
        { id: 1, training: 'Parkour', distance: 5.2, distanceText: '5.2 km' },
        { id: 2, training: 'Trampolin', distance: 3.1, distanceText: '3.1 km' }
      ],
      userPosition: { lat: 48.1351, lng: 11.582 }
    }

    // Mock apply filters
    applyFiltersMock = vi.fn()

    // Mock Alpine context
    context = {
      ...state,
      $store: {
        ui: {
          manualLocation: { lat: 48.1351, lng: 11.582 },
          manualLocationAddress: 'München, Deutschland',
          manualLocationSet: true,
          filters: {
            activeQuickFilter: 'nearby'
          }
        }
      },
      map: {
        removeLayer: vi.fn()
      },
      userLocationMarker: { /* mock marker */ }
    }

    // Create manager
    geolocationManager = new GeolocationManager(state, context, {
      applyFilters: applyFiltersMock
    })
  })

  it('should clear userPosition', () => {
    geolocationManager.resetLocation()

    expect(context.userPosition).toBeNull()
  })

  it('should clear manual location from store', () => {
    geolocationManager.resetLocation()

    expect(context.$store.ui.manualLocation).toBeNull()
    expect(context.$store.ui.manualLocationAddress).toBe('')
    expect(context.$store.ui.manualLocationSet).toBe(false)
  })

  it('should remove from localStorage', () => {
    geolocationManager.resetLocation()

    expect(localStorage.removeItem).toHaveBeenCalledWith('manualLocation')
  })

  it('should remove distance properties from trainings', () => {
    geolocationManager.resetLocation()

    expect(context.allTrainings[0].distance).toBeUndefined()
    expect(context.allTrainings[0].distanceText).toBeUndefined()
    expect(context.allTrainings[1].distance).toBeUndefined()
    expect(context.allTrainings[1].distanceText).toBeUndefined()
  })

  it('should remove user location marker from map', () => {
    const markerRef = context.userLocationMarker

    geolocationManager.resetLocation()

    expect(context.map.removeLayer).toHaveBeenCalledWith(markerRef)
    expect(context.userLocationMarker).toBeNull()
  })

  it('should deactivate nearby quick filter if active', () => {
    geolocationManager.resetLocation()

    expect(context.$store.ui.filters.activeQuickFilter).toBeNull()
  })

  it('should not change quick filter if it was not nearby', () => {
    context.$store.ui.filters.activeQuickFilter = 'favoriten'

    geolocationManager.resetLocation()

    expect(context.$store.ui.filters.activeQuickFilter).toBe('favoriten')
  })

  it('should reapply filters after reset', () => {
    geolocationManager.resetLocation()

    expect(applyFiltersMock).toHaveBeenCalled()
  })

  it('should handle missing map gracefully', () => {
    context.map = null
    context.userLocationMarker = null

    expect(() => geolocationManager.resetLocation()).not.toThrow()
  })

  it('should handle missing user location marker gracefully', () => {
    context.userLocationMarker = null

    expect(() => geolocationManager.resetLocation()).not.toThrow()
  })
})
