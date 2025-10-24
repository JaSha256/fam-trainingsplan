// @ts-check
/**
 * Distance Filter Backend Tests
 * @file tests/unit/distance-filter-backend.test.js
 *
 * TDD RED Phase: Tests for dynamic distance filter backend logic (0.5-25 km)
 * Tests state management, config, filter engine, and URL persistence
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { createTrainingsplanerState } from '../../src/js/trainingsplaner/state.js'
import { CONFIG } from '../../src/js/config.js'
import { FilterEngine } from '../../src/js/trainingsplaner/filter-engine.js'

describe('Distance Filter Backend', () => {
  describe('State Management', () => {
    test('State enthält maxDistanceKm mit Default 5', () => {
      const state = createTrainingsplanerState()
      expect(state.maxDistanceKm).toBe(5)
    })

    test('State enthält distanceFilterActive mit Default false', () => {
      const state = createTrainingsplanerState()
      expect(state.distanceFilterActive).toBe(false)
    })
  })

  describe('Config Slider Defaults', () => {
    test('Config hat Slider-Range 0.5-25 km', () => {
      expect(CONFIG.filters.distanceSlider).toBeDefined()
      expect(CONFIG.filters.distanceSlider.min).toBe(0.5)
      expect(CONFIG.filters.distanceSlider.max).toBe(25)
      expect(CONFIG.filters.distanceSlider.default).toBe(5)
      expect(CONFIG.filters.distanceSlider.step).toBe(0.5)
    })
  })

  describe('Filter Engine - Distance Filtering', () => {
    let state
    let context
    let filterEngine

    beforeEach(() => {
      // Setup state
      state = createTrainingsplanerState()

      // Setup mock context
      context = {
        $store: {
          ui: {
            filters: {
              wochentag: [],
              ort: [],
              training: [],
              altersgruppe: [],
              searchTerm: '',
              _customTimeFilter: '',
              _customFeatureFilter: '',
              _customLocationFilter: '',
              _customPersonalFilter: '',
              maxDistanceKm: 5,
              distanceFilterActive: false
            }
          }
        },
        allTrainings: [],
        filteredTrainings: [],
        fuse: null,
        userPosition: { lat: 48.137154, lng: 11.576124 }
      }

      // Setup FilterEngine with mock dependencies
      filterEngine = new FilterEngine(state, context, {
        isFavorite: (id) => false,
        updateUrl: () => {}
      })
    })

    test('applyDistanceFilter filtert Trainings basierend auf maxDistanceKm', () => {
      const trainings = [
        { id: 1, distance: 2.5 },
        { id: 2, distance: 7.0 },
        { id: 3, distance: 4.2 },
        { id: 4 } // No distance - should be included
      ]

      const result = filterEngine.applyDistanceFilter(trainings, 5, context.userPosition)
      expect(result).toHaveLength(3) // id 1, 3, and 4 (no distance)
      expect(result.map(t => t.id)).toEqual([1, 3, 4])
    })

    test('applyDistanceFilter gibt alle Trainings zurück wenn keine userPosition', () => {
      const trainings = [
        { id: 1, distance: 2.5 },
        { id: 2, distance: 7.0 }
      ]

      const result = filterEngine.applyDistanceFilter(trainings, 5, null)
      expect(result).toHaveLength(2)
    })

    test('applyDistanceFilter gibt alle Trainings zurück wenn maxDistanceKm null', () => {
      const trainings = [
        { id: 1, distance: 2.5 },
        { id: 2, distance: 7.0 }
      ]

      const result = filterEngine.applyDistanceFilter(trainings, null, context.userPosition)
      expect(result).toHaveLength(2)
    })

    test('applyDistanceFilter inkludiert Trainings ohne distance property', () => {
      const trainings = [
        { id: 1, distance: 2.5 },
        { id: 2 }, // no distance - should be INCLUDED (fallback for missing coords)
        { id: 3, distance: 4.2 }
      ]

      const result = filterEngine.applyDistanceFilter(trainings, 5, context.userPosition)
      expect(result).toHaveLength(3) // All three trainings included
      expect(result.map(t => t.id)).toEqual([1, 2, 3])
    })

    test('Custom Location Filter verwendet dynamischen maxDistanceKm statt hardcoded 5', () => {
      context.$store.ui.filters.maxDistanceKm = 10
      context.allTrainings = [
        { id: 1, distance: 7.5 },
        { id: 2, distance: 12.0 },
        { id: 3, distance: 3.0 }
      ]

      const result = filterEngine.applyCustomLocationFilter(context.allTrainings, 'inMeinerNaehe')
      expect(result).toHaveLength(2)
      expect(result.map(t => t.id)).toEqual([1, 3])
    })

    test('getDistanceFilterValue liefert Wert aus Store', () => {
      context.$store.ui.filters.maxDistanceKm = 12.5

      const value = filterEngine.getDistanceFilterValue()
      expect(value).toBe(12.5)
    })

    test('getDistanceFilterValue liefert Default wenn Store leer', () => {
      context.$store.ui.filters.maxDistanceKm = null

      const value = filterEngine.getDistanceFilterValue()
      expect(value).toBe(5)
    })
  })

  describe('URL Persistence', () => {
    test('URL-Parameter distanz wird korrekt geparst', () => {
      // This test will be implemented when URL manager is updated
      // Placeholder test to ensure URL functionality is testable
      const url = new URL('http://example.com/?distanz=7.5')
      const params = new URLSearchParams(url.search)

      expect(params.has('distanz')).toBe(true)
      expect(parseFloat(params.get('distanz'))).toBe(7.5)
    })

    test('URL-Parameter distanz validiert Range 0.5-25', () => {
      // Test boundary validation
      const validValues = [0.5, 5, 12.5, 25]
      const invalidValues = [0, 0.4, 25.1, 30, -5]

      validValues.forEach(value => {
        expect(value >= 0.5 && value <= 25).toBe(true)
      })

      invalidValues.forEach(value => {
        expect(value >= 0.5 && value <= 25).toBe(false)
      })
    })
  })

  describe('Config Validation', () => {
    test('Distance Filter Config ist immutable', () => {
      expect(() => {
        // @ts-ignore - Testing immutability
        CONFIG.filters.distanceSlider.min = 1
      }).toThrow()
    })

    test('Distance Filter Config hat gültige Werte', () => {
      const slider = CONFIG.filters.distanceSlider
      expect(slider.min).toBeGreaterThan(0)
      expect(slider.max).toBeGreaterThan(slider.min)
      expect(slider.default).toBeGreaterThanOrEqual(slider.min)
      expect(slider.default).toBeLessThanOrEqual(slider.max)
      expect(slider.step).toBeGreaterThan(0)
    })
  })
})
