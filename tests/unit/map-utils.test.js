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
  formatDistance
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

