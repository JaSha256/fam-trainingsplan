/**
 * Unit Tests: Active Filter Chips Bar (Task 15)
 *
 * TDD RED PHASE: Tests written first (MUST FAIL)
 * Tests the sticky filter chips bar with removal functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { trainingsplaner } from '../../src/js/trainingsplaner.js'

describe('Task 15: Active Filter Chips Bar', () => {
  let component
  let mockStore

  beforeEach(() => {
    // Mock Alpine store
    mockStore = {
      ui: {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          searchTerm: '',
          activeQuickFilter: null
        }
      }
    }

    // Create component instance with mocked Alpine context
    component = trainingsplaner()
    component.$store = mockStore
    component.filteredTrainings = []

    // Mock applyFilters to avoid filterEngine dependency in tests
    component.applyFilters = vi.fn()
  })

  describe('RED PHASE: Active Filter Detection', () => {
    it('should detect when no filters are active', () => {
      // Clear all filters
      mockStore.ui.filters = {
        wochentag: [],
        ort: [],
        training: [],
        altersgruppe: [],
        searchTerm: '',
        activeQuickFilter: null
      }

      const activeFilters = component.getActiveFilterChips?.() || []
      expect(activeFilters.length).toBe(0)
    })

    it('should detect active wochentag filter', () => {
      mockStore.ui.filters.wochentag = ['Montag', 'Mittwoch']

      const activeFilters = component.getActiveFilterChips?.() || []
      expect(activeFilters.length).toBeGreaterThan(0)
      expect(activeFilters.some(chip => chip.category === 'wochentag')).toBe(true)
    })

    it('should detect active ort filter', () => {
      mockStore.ui.filters.ort = ['München']

      const activeFilters = component.getActiveFilterChips?.() || []
      expect(activeFilters.some(chip => chip.category === 'ort')).toBe(true)
    })

    it('should detect active training filter', () => {
      mockStore.ui.filters.training = ['Parkour']

      const activeFilters = component.getActiveFilterChips?.() || []
      expect(activeFilters.some(chip => chip.category === 'training')).toBe(true)
    })

    it('should detect active altersgruppe filter', () => {
      mockStore.ui.filters.altersgruppe = ['Kids']

      const activeFilters = component.getActiveFilterChips?.() || []
      expect(activeFilters.some(chip => chip.category === 'altersgruppe')).toBe(true)
    })

    it('should detect active search term', () => {
      mockStore.ui.filters.searchTerm = 'test search'

      const activeFilters = component.getActiveFilterChips?.() || []
      expect(activeFilters.some(chip => chip.category === 'search')).toBe(true)
    })

    it('should detect active quick filter', () => {
      mockStore.ui.filters.activeQuickFilter = 'heute'

      const activeFilters = component.getActiveFilterChips?.() || []
      expect(activeFilters.some(chip => chip.category === 'quickFilter')).toBe(true)
    })

    it('should count total active filters correctly', () => {
      mockStore.ui.filters = {
        wochentag: ['Montag'],
        ort: ['München'],
        training: ['Parkour'],
        altersgruppe: [],
        searchTerm: '',
        activeQuickFilter: null
      }

      const count = component.getActiveFilterCount?.() || 0
      expect(count).toBe(3) // wochentag + ort + training
    })
  })

  describe('RED PHASE: Chip Generation Logic', () => {
    it('should generate chip data with label and value', () => {
      mockStore.ui.filters.wochentag = ['Montag']

      const chips = component.getActiveFilterChips?.() || []
      const chip = chips.find(c => c.category === 'wochentag')

      expect(chip).toBeDefined()
      expect(chip.label).toBe('Wochentag')
      expect(chip.value).toBe('Montag')
    })

    it('should generate separate chips for multi-value filters', () => {
      mockStore.ui.filters.wochentag = ['Montag', 'Mittwoch', 'Freitag']

      const chips = component.getActiveFilterChips?.() || []
      const wochentagChips = chips.filter(c => c.category === 'wochentag')

      expect(wochentagChips.length).toBe(3)
    })

    it('should limit displayed chips to 3', () => {
      mockStore.ui.filters = {
        wochentag: ['Montag', 'Mittwoch'],
        ort: ['München'],
        training: ['Parkour'],
        altersgruppe: ['Kids'],
        searchTerm: '',
        activeQuickFilter: null
      }

      const displayedChips = component.getDisplayedFilterChips?.() || []
      expect(displayedChips.length).toBeLessThanOrEqual(3)
    })

    it('should calculate overflow count when more than 3 chips', () => {
      mockStore.ui.filters = {
        wochentag: ['Montag', 'Mittwoch'],
        ort: ['München'],
        training: ['Parkour'],
        altersgruppe: ['Kids'],
        searchTerm: '',
        activeQuickFilter: null
      }

      const overflowCount = component.getOverflowFilterCount?.() || 0
      expect(overflowCount).toBeGreaterThan(0)
    })

    it('should include removal function in chip data', () => {
      mockStore.ui.filters.wochentag = ['Montag']

      const chips = component.getActiveFilterChips?.() || []
      const chip = chips[0]

      expect(chip).toBeDefined()
      expect(typeof chip.remove).toBe('function')
    })
  })

  describe('RED PHASE: Chip Removal Logic', () => {
    it('should remove specific wochentag chip', () => {
      mockStore.ui.filters.wochentag = ['Montag', 'Mittwoch']

      component.removeFilterChip?.('wochentag', 'Montag')

      expect(mockStore.ui.filters.wochentag).toEqual(['Mittwoch'])
    })

    it('should remove specific ort chip', () => {
      mockStore.ui.filters.ort = ['München', 'Berlin']

      component.removeFilterChip?.('ort', 'München')

      expect(mockStore.ui.filters.ort).toEqual(['Berlin'])
    })

    it('should clear search term when removing search chip', () => {
      mockStore.ui.filters.searchTerm = 'test'

      component.removeFilterChip?.('search', 'test')

      expect(mockStore.ui.filters.searchTerm).toBe('')
    })

    it('should clear quick filter when removing quick filter chip', () => {
      mockStore.ui.filters.activeQuickFilter = 'heute'

      component.removeFilterChip?.('quickFilter', 'heute')

      expect(mockStore.ui.filters.activeQuickFilter).toBe(null)
    })

    it('should trigger applyFilters after chip removal', () => {
      const applyFiltersSpy = vi.fn()
      component.applyFilters = applyFiltersSpy

      mockStore.ui.filters.wochentag = ['Montag']
      component.removeFilterChip?.('wochentag', 'Montag')

      expect(applyFiltersSpy).toHaveBeenCalled()
    })
  })

  describe('RED PHASE: Results Count Display', () => {
    it('should return filtered trainings count', () => {
      component.filteredTrainings = [
        { id: 1, training: 'Parkour' },
        { id: 2, training: 'Trampolin' },
        { id: 3, training: 'Parkour' }
      ]

      const count = component.getResultsCount?.()
      expect(count).toBe(3)
    })

    it('should format results count text in German', () => {
      component.filteredTrainings = [
        { id: 1 },
        { id: 2 }
      ]

      const text = component.getResultsCountText?.()
      expect(text).toContain('2')
      expect(text).toMatch(/Trainings?/) // "Training" or "Trainings"
    })

    it('should use singular for 1 training', () => {
      component.filteredTrainings = [{ id: 1 }]

      const text = component.getResultsCountText?.()
      expect(text).toMatch(/1.*Training[^s]/) // "1 Training" not "Trainings"
    })

    it('should use plural for multiple trainings', () => {
      component.filteredTrainings = [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]

      const text = component.getResultsCountText?.()
      expect(text).toMatch(/3.*Trainings/) // "3 Trainings"
    })
  })

  describe('RED PHASE: Visibility Logic', () => {
    it('should show chips bar when filters are active', () => {
      mockStore.ui.filters.wochentag = ['Montag']

      const shouldShow = component.shouldShowFilterChips?.()
      expect(shouldShow).toBe(true)
    })

    it('should hide chips bar when no filters are active', () => {
      mockStore.ui.filters = {
        wochentag: [],
        ort: [],
        training: [],
        altersgruppe: [],
        searchTerm: '',
        activeQuickFilter: null
      }

      const shouldShow = component.shouldShowFilterChips?.()
      expect(shouldShow).toBe(false)
    })

    it('should show chips bar when search term exists', () => {
      mockStore.ui.filters.searchTerm = 'test'

      const shouldShow = component.shouldShowFilterChips?.()
      expect(shouldShow).toBe(true)
    })

    it('should show chips bar when quick filter is active', () => {
      mockStore.ui.filters.activeQuickFilter = 'heute'

      const shouldShow = component.shouldShowFilterChips?.()
      expect(shouldShow).toBe(true)
    })
  })
})
