// @ts-check
/**
 * Quick Filters Integration Tests
 * @file tests/integration/quick-filters-integration.test.js
 *
 * Integration tests for quick filters with FilterEngine:
 * 1. Quick filter combination with standard multi-select filters
 * 2. Filter state synchronization
 * 3. FilterEngine handling of quick filter custom flags
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { FilterEngine } from '../../src/js/trainingsplaner/filter-engine.js'
import { QUICK_FILTERS } from '../../src/js/trainingsplaner/quick-filters.js'

describe('Quick Filters + FilterEngine Integration', () => {
  let state
  let context
  let filterEngine
  let mockTrainings

  beforeEach(() => {
    // Mock trainings data
    mockTrainings = [
      {
        id: 1,
        wochentag: 'Montag',
        ort: 'München',
        training: 'Parkour',
        altersgruppe: 'Jugendliche',
        probetraining: 'ja',
        lat: 48.1351,
        lng: 11.582,
        distance: 2.5
      },
      {
        id: 2,
        wochentag: 'Samstag',
        ort: 'München',
        training: 'Trampolin',
        altersgruppe: 'Kinder',
        probetraining: 'nein',
        lat: 48.1371,
        lng: 11.575,
        distance: 3.0
      },
      {
        id: 3,
        wochentag: 'Sonntag',
        ort: 'Freising',
        training: 'Parkour',
        altersgruppe: 'Erwachsene',
        probetraining: 'ja',
        lat: 48.4028,
        lng: 11.7479,
        distance: 15.0
      }
    ]

    state = {
      allTrainings: mockTrainings,
      filteredTrainings: []
    }

    context = {
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
      allTrainings: mockTrainings,
      filteredTrainings: [],
      fuse: null,
      userPosition: null
    }

    const dependencies = {
      isFavorite: () => false,
      updateUrl: () => {}
    }

    filterEngine = new FilterEngine(state, context, dependencies)
  })

  it('should filter by Wochenende quick filter (Samstag + Sonntag)', () => {
    // Apply Wochenende quick filter
    QUICK_FILTERS.wochenende.apply(context.$store.ui.filters, {
      allTrainings: mockTrainings,
      favorites: [],
      userPosition: null,
      applyFilters: () => {}
    })

    filterEngine.applyFilters()

    expect(context.filteredTrainings.length).toBe(2)
    expect(context.filteredTrainings.map(t => t.wochentag)).toEqual(['Samstag', 'Sonntag'])
  })

  it('should combine Probetraining quick filter with standard Ort filter', () => {
    // Apply Probetraining quick filter
    QUICK_FILTERS.probetraining.apply(context.$store.ui.filters, {
      allTrainings: mockTrainings,
      favorites: [],
      userPosition: null,
      applyFilters: () => {}
    })

    // Apply standard Ort filter (multi-select)
    context.$store.ui.filters.ort = ['München']

    filterEngine.applyFilters()

    // Should get only München trainings with Probetraining=ja
    expect(context.filteredTrainings.length).toBe(1)
    expect(context.filteredTrainings[0].id).toBe(1)
    expect(context.filteredTrainings[0].ort).toBe('München')
    expect(context.filteredTrainings[0].probetraining).toBe('ja')
  })

  it('should combine Heute quick filter with Training type filter', () => {
    const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    const heute = wochentage[new Date().getDay()]

    // Apply Heute quick filter
    QUICK_FILTERS.heute.apply(context.$store.ui.filters, {
      allTrainings: mockTrainings,
      favorites: [],
      userPosition: null,
      applyFilters: () => {}
    })

    // Apply standard Training filter (multi-select)
    context.$store.ui.filters.training = ['Parkour']

    filterEngine.applyFilters()

    // Should get only Parkour trainings for Heute
    const parkourTrainings = mockTrainings.filter(t =>
      t.wochentag === heute && t.training === 'Parkour'
    )
    expect(context.filteredTrainings.length).toBe(parkourTrainings.length)
    if (parkourTrainings.length > 0) {
      expect(context.filteredTrainings.every(t => t.training === 'Parkour')).toBe(true)
    }
  })

  it('should handle favoriten quick filter exclusively', () => {
    // Set some standard filters
    context.$store.ui.filters.wochentag = ['Montag']
    context.$store.ui.filters.ort = ['München']

    // Apply Favoriten quick filter (should clear all other filters)
    QUICK_FILTERS.favoriten.apply(context.$store.ui.filters, {
      allTrainings: mockTrainings,
      favorites: [1, 2],
      userPosition: null,
      applyFilters: () => {}
    })

    // Update FilterEngine to use actual favorites
    const favoriteDependencies = {
      isFavorite: (id) => [1, 2].includes(id),
      updateUrl: () => {}
    }
    filterEngine = new FilterEngine(state, context, favoriteDependencies)

    filterEngine.applyFilters()

    // Should only show favorites, ignoring previous filters
    expect(context.filteredTrainings.length).toBe(2)
    expect(context.filteredTrainings.map(t => t.id)).toEqual([1, 2])
  })

  it('should clear quick filter state when resetting filters', () => {
    // Apply quick filter
    QUICK_FILTERS.heute.apply(context.$store.ui.filters, {
      allTrainings: mockTrainings,
      favorites: [],
      userPosition: null,
      applyFilters: () => {}
    })

    expect(context.$store.ui.filters.activeQuickFilter).toBe('heute')

    // Reset filters
    context.$store.ui.filters.wochentag = []
    context.$store.ui.filters.activeQuickFilter = null
    context.$store.ui.filters._customTimeFilter = ''

    filterEngine.applyFilters()

    // Should show all trainings
    expect(context.filteredTrainings.length).toBe(mockTrainings.length)
  })
})
