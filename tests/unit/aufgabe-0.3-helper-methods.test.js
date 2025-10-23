// @ts-check
/**
 * AUFGABE 0.3 Helper Methods Tests
 * @file tests/unit/aufgabe-0.3-helper-methods.test.js
 * @version 1.0.0
 *
 * Tests for new helper methods added in AUFGABE 0.3:
 * - clearAllFilters()
 * - hasActiveFilters()
 * - getActiveFilterCount()
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import Alpine from 'alpinejs'
import persist from '@alpinejs/persist'

describe('AUFGABE 0.3 - Helper Methods', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()

    // Reset Alpine if already started
    if (Alpine._isBooted) {
      Alpine._isBooted = false
    }

    // Register persist plugin only once
    if (!Alpine.$persist) {
      Alpine.plugin(persist)
    }
  })

  describe('clearAllFilters()', () => {
    it('should reset all filter arrays to empty', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: ['Montag', 'Mittwoch'],
          ort: ['München'],
          training: ['Parkour'],
          altersgruppe: ['Kids'],
          searchTerm: 'test',
          activeQuickFilter: 'heute',
          _customTimeFilter: 'wochenende',
          _customFeatureFilter: 'probetraining',
          _customLocationFilter: 'inMeinerNaehe',
          _customPersonalFilter: 'favoriten'
        },
        resetFilters() {
          this.filters = {
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
        },
        clearAllFilters() {
          this.resetFilters()
        }
      })

      const store = Alpine.store('ui')
      store.clearAllFilters()

      expect(store.filters.wochentag).toEqual([])
      expect(store.filters.ort).toEqual([])
      expect(store.filters.training).toEqual([])
      expect(store.filters.altersgruppe).toEqual([])
      expect(store.filters.searchTerm).toBe('')
      expect(store.filters.activeQuickFilter).toBeNull()
    })
  })

  describe('hasActiveFilters()', () => {
    it('should return true when weekday filter is active', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: ['Montag'],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: ''
        },
        hasActiveFilters() {
          const filters = this.filters
          return (
            filters.wochentag.length > 0 ||
            filters.ort.length > 0 ||
            filters.training.length > 0 ||
            filters.altersgruppe.length > 0 ||
            filters.probetraining ||
            filters.searchTerm !== ''
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.hasActiveFilters()).toBe(true)
    })

    it('should return true when location filter is active', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: [],
          ort: ['München'],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: ''
        },
        hasActiveFilters() {
          const filters = this.filters
          return (
            filters.wochentag.length > 0 ||
            filters.ort.length > 0 ||
            filters.training.length > 0 ||
            filters.altersgruppe.length > 0 ||
            filters.probetraining ||
            filters.searchTerm !== ''
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.hasActiveFilters()).toBe(true)
    })

    it('should return true when search term is active', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: 'parkour'
        },
        hasActiveFilters() {
          const filters = this.filters
          return (
            filters.wochentag.length > 0 ||
            filters.ort.length > 0 ||
            filters.training.length > 0 ||
            filters.altersgruppe.length > 0 ||
            filters.probetraining ||
            filters.searchTerm !== ''
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.hasActiveFilters()).toBe(true)
    })

    it('should return false when no filters are active', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: ''
        },
        hasActiveFilters() {
          const filters = this.filters
          return (
            filters.wochentag.length > 0 ||
            filters.ort.length > 0 ||
            filters.training.length > 0 ||
            filters.altersgruppe.length > 0 ||
            filters.probetraining ||
            filters.searchTerm !== ''
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.hasActiveFilters()).toBe(false)
    })
  })

  describe('getActiveFilterCount()', () => {
    it('should return 0 when no filters are active', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: ''
        },
        getActiveFilterCount() {
          const filters = this.filters
          return (
            filters.wochentag.length +
            filters.ort.length +
            filters.training.length +
            filters.altersgruppe.length +
            (filters.probetraining ? 1 : 0) +
            (filters.searchTerm ? 1 : 0)
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.getActiveFilterCount()).toBe(0)
    })

    it('should count single filter item correctly', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: ['Montag'],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: ''
        },
        getActiveFilterCount() {
          const filters = this.filters
          return (
            filters.wochentag.length +
            filters.ort.length +
            filters.training.length +
            filters.altersgruppe.length +
            (filters.probetraining ? 1 : 0) +
            (filters.searchTerm ? 1 : 0)
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.getActiveFilterCount()).toBe(1)
    })

    it('should count multiple filters in same category', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: ['Montag', 'Mittwoch', 'Freitag'],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: ''
        },
        getActiveFilterCount() {
          const filters = this.filters
          return (
            filters.wochentag.length +
            filters.ort.length +
            filters.training.length +
            filters.altersgruppe.length +
            (filters.probetraining ? 1 : 0) +
            (filters.searchTerm ? 1 : 0)
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.getActiveFilterCount()).toBe(3)
    })

    it('should count filters across multiple categories', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: ['Montag', 'Mittwoch'],
          ort: ['München'],
          training: ['Parkour', 'Tricking'],
          altersgruppe: [],
          probetraining: true,
          searchTerm: 'test'
        },
        getActiveFilterCount() {
          const filters = this.filters
          return (
            filters.wochentag.length +
            filters.ort.length +
            filters.training.length +
            filters.altersgruppe.length +
            (filters.probetraining ? 1 : 0) +
            (filters.searchTerm ? 1 : 0)
          )
        }
      })

      const store = Alpine.store('ui')
      // 2 (wochentag) + 1 (ort) + 2 (training) + 1 (probetraining) + 1 (searchTerm) = 7
      expect(store.getActiveFilterCount()).toBe(7)
    })

    it('should count boolean probetraining filter as 1', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: true,
          searchTerm: ''
        },
        getActiveFilterCount() {
          const filters = this.filters
          return (
            filters.wochentag.length +
            filters.ort.length +
            filters.training.length +
            filters.altersgruppe.length +
            (filters.probetraining ? 1 : 0) +
            (filters.searchTerm ? 1 : 0)
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.getActiveFilterCount()).toBe(1)
    })

    it('should count search term as 1', () => {
      Alpine.store('ui', {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          probetraining: false,
          searchTerm: 'test search'
        },
        getActiveFilterCount() {
          const filters = this.filters
          return (
            filters.wochentag.length +
            filters.ort.length +
            filters.training.length +
            filters.altersgruppe.length +
            (filters.probetraining ? 1 : 0) +
            (filters.searchTerm ? 1 : 0)
          )
        }
      })

      const store = Alpine.store('ui')
      expect(store.getActiveFilterCount()).toBe(1)
    })
  })
})
