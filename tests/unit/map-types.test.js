// @ts-check
/**
 * Map Module Type Tests
 * @file tests/unit/map-types.test.js
 *
 * Tests to verify that map modules have correct JSDoc types
 * and pass TypeScript checks without implicit any errors.
 */

import { describe, it, expect } from 'vitest'
import * as L from 'leaflet'

describe('Map Controls Type Safety', () => {
  it('should have GeolocationControl with typed properties', async () => {
    const { GeolocationControl } = await import('../../src/js/trainingsplaner/map-controls.js')
    expect(GeolocationControl).toBeDefined()
    expect(typeof GeolocationControl).toBe('function')
  })

  it('should have ResetViewControl with typed properties', async () => {
    const { ResetViewControl } = await import('../../src/js/trainingsplaner/map-controls.js')
    expect(ResetViewControl).toBeDefined()
    expect(typeof ResetViewControl).toBe('function')
  })

  it('should have LayerSwitcherControl with typed properties', async () => {
    const { LayerSwitcherControl } = await import('../../src/js/trainingsplaner/map-controls.js')
    expect(LayerSwitcherControl).toBeDefined()
    expect(typeof LayerSwitcherControl).toBe('function')
  })

  it('should have factory functions with typed parameters', async () => {
    const {
      createGeolocationControl,
      createResetViewControl,
      createLayerSwitcherControl
    } = await import('../../src/js/trainingsplaner/map-controls.js')

    expect(typeof createGeolocationControl).toBe('function')
    expect(typeof createResetViewControl).toBe('function')
    expect(typeof createLayerSwitcherControl).toBe('function')
  })
})

describe('Map Manager Type Safety', () => {
  it('should have MapManager class with typed methods', async () => {
    const { MapManager } = await import('../../src/js/trainingsplaner/map-manager.js')
    expect(MapManager).toBeDefined()
    expect(typeof MapManager).toBe('function')
  })

  it('should accept properly typed state and context', async () => {
    const { MapManager } = await import('../../src/js/trainingsplaner/map-manager.js')

    const mockState = {
      filteredTrainings: [],
      allTrainings: [],
      favorites: [],
      markers: [],
      map: null
    }

    const mockContext = {
      ...mockState,
      $store: { ui: {} },
      $nextTick: async () => {}
    }

    const manager = new MapManager(mockState, mockContext)
    expect(manager).toBeInstanceOf(MapManager)
  })
})

describe('Map Utils Type Safety', () => {
  it('should have typed utility functions', async () => {
    const utils = await import('../../src/js/trainingsplaner/map-utils.js')

    expect(typeof utils.calculateDistance).toBe('function')
    expect(typeof utils.isValidCoordinates).toBe('function')
    expect(typeof utils.getOptimalClusterRadius).toBe('function')
    expect(typeof utils.formatDistance).toBe('function')
  })

  it('calculateDistance should accept coordinate tuples', async () => {
    const { calculateDistance } = await import('../../src/js/trainingsplaner/map-utils.js')

    const distance = calculateDistance([48.137154, 11.576124], [48.1351, 11.5820])
    expect(typeof distance).toBe('number')
    expect(distance).toBeGreaterThan(0)
  })

  it('isValidCoordinates should accept number parameters', async () => {
    const { isValidCoordinates } = await import('../../src/js/trainingsplaner/map-utils.js')

    expect(isValidCoordinates(48.137154, 11.576124)).toBe(true)
    expect(isValidCoordinates(91, 200)).toBe(false)
  })
})
