// @ts-check
/**
 * FilterEngine Multi-Select Tests
 * @file tests/unit/filter-engine-multiselect.test.js
 * @version 1.0.0
 *
 * TDD Tests for Task 13: Multi-select filter functionality
 * Tests array-based filtering with AND/OR logic
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FilterEngine } from '../../src/js/trainingsplaner/filter-engine.js'

/**
 * Create mock Alpine context for testing
 */
function createMockContext(overrides = {}) {
  return {
    allTrainings: [],
    filteredTrainings: [],
    fuse: null,
    userPosition: null,
    $store: {
      ui: {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          searchTerm: '',
          activeQuickFilter: null,
          _customTimeFilter: '',
          _customFeatureFilter: '',
          _customLocationFilter: '',
          _customPersonalFilter: ''
        }
      }
    },
    ...overrides
  }
}

/**
 * Create sample training data
 */
function createTraining(id, wochentag, ort, training, altersgruppe) {
  return {
    id,
    wochentag,
    ort,
    training,
    altersgruppe,
    von: '10:00',
    bis: '11:00',
    trainer: 'Test Trainer',
    lat: 48.1351,
    lng: 11.5820,
    link: 'https://test.com',
    probetraining: 'nein'
  }
}

describe('FilterEngine - Multi-Select Array Filtering', () => {
  let state, context, filterEngine

  beforeEach(() => {
    // Reset state for each test
    state = {
      allTrainings: [
        createTraining(1, 'Montag', 'München', 'Parkour', 'Kids'),
        createTraining(2, 'Montag', 'Berlin', 'Trampolin', 'Teens'),
        createTraining(3, 'Mittwoch', 'München', 'Parkour', 'Kids'),
        createTraining(4, 'Mittwoch', 'Hamburg', 'Tricking', 'Adults'),
        createTraining(5, 'Freitag', 'München', 'Movement', 'Kids, Teens'),
        createTraining(6, 'Samstag', 'Berlin', 'Parkour', 'Adults')
      ],
      filteredTrainings: []
    }

    context = createMockContext({
      allTrainings: state.allTrainings,
      filteredTrainings: state.filteredTrainings
    })

    const dependencies = {
      isFavorite: () => false,
      updateUrl: () => {}
    }

    filterEngine = new FilterEngine(state, context, dependencies)
  })

  describe('Array-based Weekday Filtering (OR logic within category)', () => {
    it('should filter by single weekday in array', () => {
      context.$store.ui.filters.wochentag = ['Montag']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(2)
      expect(context.filteredTrainings.every(t => t.wochentag === 'Montag')).toBe(true)
    })

    it('should filter by multiple weekdays (OR logic)', () => {
      context.$store.ui.filters.wochentag = ['Montag', 'Mittwoch']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(4)
      expect(context.filteredTrainings.every(t =>
        t.wochentag === 'Montag' || t.wochentag === 'Mittwoch'
      )).toBe(true)
    })

    it('should show all trainings when weekday array is empty', () => {
      context.$store.ui.filters.wochentag = []
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(6)
    })
  })

  describe('Array-based Location Filtering (OR logic within category)', () => {
    it('should filter by single location in array', () => {
      context.$store.ui.filters.ort = ['München']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(3)
      expect(context.filteredTrainings.every(t => t.ort === 'München')).toBe(true)
    })

    it('should filter by multiple locations (OR logic)', () => {
      context.$store.ui.filters.ort = ['München', 'Berlin']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(5)
      expect(context.filteredTrainings.every(t =>
        t.ort === 'München' || t.ort === 'Berlin'
      )).toBe(true)
    })

    it('should show all trainings when location array is empty', () => {
      context.$store.ui.filters.ort = []
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(6)
    })
  })

  describe('Array-based Training Type Filtering (OR logic within category)', () => {
    it('should filter by single training type in array', () => {
      context.$store.ui.filters.training = ['Parkour']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(3)
      expect(context.filteredTrainings.every(t => t.training === 'Parkour')).toBe(true)
    })

    it('should filter by multiple training types (OR logic)', () => {
      context.$store.ui.filters.training = ['Parkour', 'Trampolin']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(4)
      expect(context.filteredTrainings.every(t =>
        t.training === 'Parkour' || t.training === 'Trampolin'
      )).toBe(true)
    })

    it('should show all trainings when training type array is empty', () => {
      context.$store.ui.filters.training = []
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(6)
    })
  })

  describe('Array-based Age Group Filtering (OR logic within category)', () => {
    it('should filter by single age group in array', () => {
      context.$store.ui.filters.altersgruppe = ['Kids']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(3)
      expect(context.filteredTrainings.every(t =>
        t.altersgruppe && t.altersgruppe.includes('Kids')
      )).toBe(true)
    })

    it('should filter by multiple age groups (OR logic)', () => {
      context.$store.ui.filters.altersgruppe = ['Kids', 'Adults']
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(5)
    })

    it('should show all trainings when age group array is empty', () => {
      context.$store.ui.filters.altersgruppe = []
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(6)
    })
  })

  describe('Combined Multi-Select Filters (AND logic between categories)', () => {
    it('should combine weekday AND location filters', () => {
      context.$store.ui.filters.wochentag = ['Montag', 'Mittwoch']
      context.$store.ui.filters.ort = ['München']
      filterEngine.applyFilters()

      // Should get: Montag München (1) + Mittwoch München (1) = 2
      expect(context.filteredTrainings).toHaveLength(2)
      expect(context.filteredTrainings.every(t =>
        (t.wochentag === 'Montag' || t.wochentag === 'Mittwoch') &&
        t.ort === 'München'
      )).toBe(true)
    })

    it('should combine weekday AND training type filters', () => {
      context.$store.ui.filters.wochentag = ['Montag']
      context.$store.ui.filters.training = ['Parkour', 'Trampolin']
      filterEngine.applyFilters()

      // Should get: Montag Parkour (1) + Montag Trampolin (1) = 2
      expect(context.filteredTrainings).toHaveLength(2)
      expect(context.filteredTrainings.every(t =>
        t.wochentag === 'Montag' &&
        (t.training === 'Parkour' || t.training === 'Trampolin')
      )).toBe(true)
    })

    it('should combine all four filter categories', () => {
      context.$store.ui.filters.wochentag = ['Montag', 'Mittwoch']
      context.$store.ui.filters.ort = ['München']
      context.$store.ui.filters.training = ['Parkour']
      context.$store.ui.filters.altersgruppe = ['Kids']
      filterEngine.applyFilters()

      // Should get: (Montag OR Mittwoch) AND München AND Parkour AND Kids = 2
      expect(context.filteredTrainings).toHaveLength(2)
      expect(context.filteredTrainings.every(t =>
        (t.wochentag === 'Montag' || t.wochentag === 'Mittwoch') &&
        t.ort === 'München' &&
        t.training === 'Parkour' &&
        t.altersgruppe && t.altersgruppe.includes('Kids')
      )).toBe(true)
    })

    it('should return empty array when no matches found', () => {
      context.$store.ui.filters.wochentag = ['Montag']
      context.$store.ui.filters.ort = ['Hamburg']
      filterEngine.applyFilters()

      // No Montag trainings in Hamburg
      expect(context.filteredTrainings).toHaveLength(0)
    })
  })

  describe('Backward Compatibility with String Filters', () => {
    it('should handle string filter as single-item array', () => {
      // Test that old string-based filters still work
      context.$store.ui.filters.wochentag = 'Montag'
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(2)
      expect(context.filteredTrainings.every(t => t.wochentag === 'Montag')).toBe(true)
    })

    it('should handle empty string as empty array', () => {
      context.$store.ui.filters.wochentag = ''
      filterEngine.applyFilters()

      expect(context.filteredTrainings).toHaveLength(6)
    })
  })
})
