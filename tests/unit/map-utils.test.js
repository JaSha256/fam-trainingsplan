// @ts-check
/**
 * Unit Tests - Map Utilities
 * @file tests/unit/map-utils.test.js
 */

import { describe, it, expect } from 'vitest'
import {
  calculateDistance,
  isValidCoordinates,
  getOptimalClusterRadius,
  getOptimalSpiderfyMultiplier,
  formatDistance,
  sortTrainingsByDistance,
  filterTrainingsByDistance,
  getBoundsForCoordinates,
  isWithinMunich
} from '../../src/js/trainingsplaner/map-utils.js'

describe('calculateDistance', () => {
  it('should calculate distance between two coordinates', () => {
    // Munich center to Marienplatz (approx. 0.5 km)
    const munich = [48.137154, 11.576124]
    const marienplatz = [48.137430, 11.575490]
    const distance = calculateDistance(munich, marienplatz)

    expect(distance).toBeGreaterThan(0)
    expect(distance).toBeLessThan(1) // Should be less than 1 km
  })

  it('should return 0 for identical coordinates', () => {
    const coord = [48.137154, 11.576124]
    const distance = calculateDistance(coord, coord)

    expect(distance).toBe(0)
  })

  it('should calculate long distances correctly', () => {
    // Munich to Berlin (approx. 504 km)
    const munich = [48.137154, 11.576124]
    const berlin = [52.520008, 13.404954]
    const distance = calculateDistance(munich, berlin)

    expect(distance).toBeGreaterThan(500)
    expect(distance).toBeLessThan(510)
  })

  it('should handle negative coordinates', () => {
    const coord1 = [-33.8688, 151.2093] // Sydney
    const coord2 = [51.5074, -0.1278]   // London
    const distance = calculateDistance(coord1, coord2)

    expect(distance).toBeGreaterThan(0)
  })
})

describe('isValidCoordinates', () => {
  it('should validate valid coordinates', () => {
    expect(isValidCoordinates(48.137154, 11.576124)).toBe(true)
    expect(isValidCoordinates(0, 0)).toBe(true)
    expect(isValidCoordinates(90, 180)).toBe(true)
    expect(isValidCoordinates(-90, -180)).toBe(true)
  })

  it('should invalidate out-of-range coordinates', () => {
    expect(isValidCoordinates(91, 0)).toBe(false)
    expect(isValidCoordinates(-91, 0)).toBe(false)
    expect(isValidCoordinates(0, 181)).toBe(false)
    expect(isValidCoordinates(0, -181)).toBe(false)
  })

  it('should invalidate non-number coordinates', () => {
    expect(isValidCoordinates(NaN, 0)).toBe(false)
    expect(isValidCoordinates(0, NaN)).toBe(false)
    // @ts-ignore - Testing invalid input
    expect(isValidCoordinates('48', '11')).toBe(false)
    // @ts-ignore - Testing invalid input
    expect(isValidCoordinates(null, undefined)).toBe(false)
  })
})

describe('getOptimalClusterRadius', () => {
  it('should return 60 for mobile breakpoint', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })

    expect(getOptimalClusterRadius()).toBe(60)
  })

  it('should return 80 for desktop breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    expect(getOptimalClusterRadius()).toBe(80)
  })

  it('should respect custom breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 900
    })

    expect(getOptimalClusterRadius(1000)).toBe(60)
    expect(getOptimalClusterRadius(800)).toBe(80)
  })
})

describe('getOptimalSpiderfyMultiplier', () => {
  it('should return 1.5 for mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    })

    expect(getOptimalSpiderfyMultiplier()).toBe(1.5)
  })

  it('should return 1 for desktop', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    })

    expect(getOptimalSpiderfyMultiplier()).toBe(1)
  })
})

describe('formatDistance', () => {
  it('should format distances under 1km in meters', () => {
    expect(formatDistance(0.5)).toBe('500 m')
    expect(formatDistance(0.123)).toBe('123 m')
    expect(formatDistance(0.999)).toBe('999 m')
  })

  it('should format distances over 1km in kilometers', () => {
    expect(formatDistance(1.2)).toBe('1.2 km')
    expect(formatDistance(5.678)).toBe('5.7 km')
    expect(formatDistance(12.345)).toBe('12.3 km')
  })

  it('should handle edge cases', () => {
    expect(formatDistance(0)).toBe('0 m')
    expect(formatDistance(1.0)).toBe('1.0 km')
  })
})

describe('sortTrainingsByDistance', () => {
  const trainings = [
    { id: 1, training: 'Parkour', lat: 48.2, lng: 11.6 },
    { id: 2, training: 'Trampolin', lat: 48.1, lng: 11.5 },
    { id: 3, training: 'Tricking', lat: 48.15, lng: 11.55 },
    { id: 4, training: 'No coords', lat: null, lng: null }
  ]

  it('should sort trainings by distance from user location', () => {
    const userLocation = [48.137154, 11.576124]
    const sorted = sortTrainingsByDistance(trainings, userLocation)

    expect(sorted[0].id).toBe(3) // Closest
    expect(sorted[sorted.length - 1].id).toBe(4) // No coords = Infinity
  })

  it('should add distance and distanceText properties', () => {
    const userLocation = [48.137154, 11.576124]
    const sorted = sortTrainingsByDistance(trainings, userLocation)

    expect(sorted[0]).toHaveProperty('distance')
    expect(sorted[0]).toHaveProperty('distanceText')
    expect(typeof sorted[0].distance).toBe('number')
    expect(typeof sorted[0].distanceText).toBe('string')
  })

  it('should handle trainings without coordinates', () => {
    const noCoords = [{ id: 1, training: 'Test', lat: null, lng: null }]
    const userLocation = [48.137154, 11.576124]
    const sorted = sortTrainingsByDistance(noCoords, userLocation)

    expect(sorted[0].distance).toBe(Infinity)
    expect(sorted[0].distanceText).toBe('Unbekannt')
  })
})

describe('filterTrainingsByDistance', () => {
  const trainings = [
    { id: 1, training: 'Parkour', lat: 48.2, lng: 11.6 },      // ~10 km away
    { id: 2, training: 'Trampolin', lat: 48.137, lng: 11.576 }, // ~0 km away
    { id: 3, training: 'Tricking', lat: 48.15, lng: 11.55 },    // ~3 km away
    { id: 4, training: 'No coords', lat: null, lng: null }
  ]

  it('should filter trainings within max distance', () => {
    const userLocation = [48.137154, 11.576124]
    const nearby = filterTrainingsByDistance(trainings, userLocation, 5)

    expect(nearby.length).toBe(2) // Only 2 within 5km
    expect(nearby.find(t => t.id === 2)).toBeDefined()
    expect(nearby.find(t => t.id === 3)).toBeDefined()
  })

  it('should exclude trainings without coordinates', () => {
    const userLocation = [48.137154, 11.576124]
    const nearby = filterTrainingsByDistance(trainings, userLocation, 100)

    expect(nearby.find(t => t.id === 4)).toBeUndefined()
  })

  it('should return empty array if no trainings within distance', () => {
    const userLocation = [48.137154, 11.576124]
    const nearby = filterTrainingsByDistance(trainings, userLocation, 0.001)

    expect(nearby.length).toBe(0) // 0.001 km is too small, all trainings excluded
  })
})

describe('getBoundsForCoordinates', () => {
  it('should calculate bounds for multiple coordinates', () => {
    const coords = [
      [48.1, 11.5],
      [48.2, 11.6],
      [48.15, 11.55]
    ]

    const bounds = getBoundsForCoordinates(coords)

    expect(bounds).toEqual([
      [48.1, 11.5],  // [minLat, minLng]
      [48.2, 11.6]   // [maxLat, maxLng]
    ])
  })

  it('should handle single coordinate', () => {
    const coords = [[48.137154, 11.576124]]
    const bounds = getBoundsForCoordinates(coords)

    expect(bounds).toEqual([
      [48.137154, 11.576124],
      [48.137154, 11.576124]
    ])
  })

  it('should return null for empty array', () => {
    expect(getBoundsForCoordinates([])).toBeNull()
    expect(getBoundsForCoordinates(null)).toBeNull()
  })
})

describe('isWithinMunich', () => {
  it('should return true for Munich center', () => {
    expect(isWithinMunich(48.137154, 11.576124)).toBe(true)
  })

  it('should return true for coordinates within Munich bounds', () => {
    expect(isWithinMunich(48.1, 11.5)).toBe(true)
    expect(isWithinMunich(48.2, 11.7)).toBe(true)
  })

  it('should return false for coordinates outside Munich', () => {
    expect(isWithinMunich(52.520008, 13.404954)).toBe(false) // Berlin
    expect(isWithinMunich(40.7128, -74.0060)).toBe(false)    // New York
  })

  it('should return false for coordinates at boundary edges', () => {
    expect(isWithinMunich(47.8, 11.5)).toBe(false) // South of Munich
    expect(isWithinMunich(48.4, 11.5)).toBe(false) // North of Munich
  })
})
