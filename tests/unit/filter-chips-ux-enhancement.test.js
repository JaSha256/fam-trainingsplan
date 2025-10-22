/**
 * Unit Tests: Filter Chips UX Enhancement
 *
 * TDD RED PHASE: Tests for enhanced filter chips UX
 * - Prominent visual styling
 * - Tooltips
 * - Better hover states
 * - Clear "Alle loschen" button visibility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { trainingsplaner } from '../../src/js/trainingsplaner.js'

describe('Filter Chips UX Enhancement', () => {
  let component
  let mockStore

  beforeEach(() => {
    // Mock Alpine store
    mockStore = {
      ui: {
        filters: {
          wochentag: ['Montag', 'Mittwoch'],
          ort: ['Munchen'],
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
    component.filteredTrainings = Array.from({ length: 15 }, (_, i) => ({ id: i }))

    // Mock applyFilters
    component.applyFilters = vi.fn()
  })

  describe('RED PHASE: Enhanced Chip Data', () => {
    it('should include tooltip text in chip data', () => {
      const chips = component.getActiveFilterChips?.() || []

      expect(chips.length).toBeGreaterThan(0)
      chips.forEach(chip => {
        expect(chip).toHaveProperty('tooltip')
        expect(typeof chip.tooltip).toBe('string')
        expect(chip.tooltip).toContain('Klicken zum Entfernen')
      })
    })

    it('should format tooltip with category and value', () => {
      const chips = component.getActiveFilterChips?.() || []
      const chip = chips[0]

      expect(chip.tooltip).toMatch(/Wochentag|Ort|Training|Altersgruppe/)
      expect(chip.tooltip).toContain(chip.value)
    })

    it('should include aria-label for accessibility', () => {
      const chips = component.getActiveFilterChips?.() || []

      chips.forEach(chip => {
        expect(chip).toHaveProperty('ariaLabel')
        expect(typeof chip.ariaLabel).toBe('string')
        expect(chip.ariaLabel).toContain('entfernen')
      })
    })

    it('should provide prominent display flag for important filters', () => {
      const chips = component.getActiveFilterChips?.() || []

      // All chips should have visual prominence indicator
      chips.forEach(chip => {
        expect(chip).toHaveProperty('prominent')
        expect(typeof chip.prominent).toBe('boolean')
      })
    })
  })

  describe('RED PHASE: Chip Visibility Helper', () => {
    it('should determine if clear all button should be prominent', () => {
      // With 3+ filters, button should be prominent
      const shouldBeProminent = component.shouldClearButtonBeProminent?.()
      expect(typeof shouldBeProminent).toBe('boolean')
    })

    it('should return true when 3 or more filters active', () => {
      mockStore.ui.filters.wochentag = ['Montag', 'Mittwoch']
      mockStore.ui.filters.ort = ['Munchen']

      const shouldBeProminent = component.shouldClearButtonBeProminent?.()
      expect(shouldBeProminent).toBe(true)
    })

    it('should return false when less than 3 filters active', () => {
      mockStore.ui.filters.wochentag = ['Montag']
      mockStore.ui.filters.ort = []

      const shouldBeProminent = component.shouldClearButtonBeProminent?.()
      expect(shouldBeProminent).toBe(false)
    })
  })

  describe('RED PHASE: Touch Target Validation', () => {
    it('should provide minimum touch target size data', () => {
      const chips = component.getActiveFilterChips?.() || []

      // Chips should indicate they meet minimum touch target requirements
      chips.forEach(chip => {
        expect(chip).toHaveProperty('minTouchTarget')
        expect(chip.minTouchTarget).toBeGreaterThanOrEqual(44)
      })
    })
  })

  describe('RED PHASE: Enhanced Tooltip Text', () => {
    it('should provide different tooltip for search filters', () => {
      mockStore.ui.filters.searchTerm = 'Parkour'

      const chips = component.getActiveFilterChips?.() || []
      const searchChip = chips.find(c => c.category === 'search')

      if (searchChip) {
        expect(searchChip.tooltip).toContain('Suche')
      }
    })

    it('should provide different tooltip for quick filters', () => {
      mockStore.ui.filters.activeQuickFilter = 'heute'

      const chips = component.getActiveFilterChips?.() || []
      const quickFilterChip = chips.find(c => c.category === 'quickFilter')

      if (quickFilterChip) {
        expect(quickFilterChip.tooltip).toContain('Quick-Filter')
      }
    })
  })

  describe('RED PHASE: Contrast and Prominence', () => {
    it('should provide CSS class suggestions for prominence', () => {
      const chips = component.getActiveFilterChips?.() || []

      chips.forEach(chip => {
        expect(chip).toHaveProperty('styleClass')
        expect(typeof chip.styleClass).toBe('string')
      })
    })

    it('should suggest higher contrast for selected filters', () => {
      const chips = component.getActiveFilterChips?.() || []

      // Wochentag and Ort filters should be marked as active/selected
      const wochentagChip = chips.find(c => c.category === 'wochentag')
      if (wochentagChip) {
        expect(wochentagChip.styleClass).toContain('primary')
      }
    })
  })
})
