// @ts-check
/**
 * Quick Filters Unit Tests
 * @file tests/unit/quick-filters.test.js
 *
 * TDD tests for quick filter functionality:
 * 1. Quick filter button application
 * 2. Filter combination with standard filters
 * 3. Quick filter state management
 * 4. Active filter state tracking
 * 5. Filter reset behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QUICK_FILTERS, getQuickFilterColorClasses, getFiltersByCategory } from '../../src/js/trainingsplaner/quick-filters.js'

describe('Quick Filters Configuration', () => {
  it('should have all required quick filters defined', () => {
    expect(QUICK_FILTERS.heute).toBeDefined()
    expect(QUICK_FILTERS.morgen).toBeDefined()
    expect(QUICK_FILTERS.wochenende).toBeDefined()
    expect(QUICK_FILTERS.probetraining).toBeDefined()
    expect(QUICK_FILTERS.favoriten).toBeDefined()
  })

  it('should correctly categorize quick filters', () => {
    const zeitFilters = getFiltersByCategory('zeit')
    expect(zeitFilters.length).toBeGreaterThan(0)
    expect(zeitFilters.map(([name]) => name)).toContain('heute')
    expect(zeitFilters.map(([name]) => name)).toContain('morgen')
    expect(zeitFilters.map(([name]) => name)).toContain('wochenende')

    const featureFilters = getFiltersByCategory('feature')
    expect(featureFilters.map(([name]) => name)).toContain('probetraining')

    const personalFilters = getFiltersByCategory('persoenlich')
    expect(personalFilters.map(([name]) => name)).toContain('favoriten')
  })
})

describe('Quick Filter Application Logic', () => {
  let filters
  let context

  beforeEach(() => {
    filters = {
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

    context = {
      allTrainings: [],
      favorites: [],
      userPosition: null,
      applyFilters: vi.fn()
    }
  })

  it('should apply Heute filter correctly', () => {
    const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    const heute = wochentage[new Date().getDay()]

    QUICK_FILTERS.heute.apply(filters, context)

    expect(filters.wochentag).toBe(heute)
    expect(filters.activeQuickFilter).toBe('heute')
    expect(filters._customTimeFilter).toBe('')
  })

  it('should apply Morgen filter correctly', () => {
    const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    const morgen = wochentage[(new Date().getDay() + 1) % 7]

    QUICK_FILTERS.morgen.apply(filters, context)

    expect(filters.wochentag).toBe(morgen)
    expect(filters.activeQuickFilter).toBe('morgen')
    expect(filters._customTimeFilter).toBe('')
  })

  it('should apply Wochenende filter correctly', () => {
    QUICK_FILTERS.wochenende.apply(filters, context)

    expect(filters.wochentag).toBe('')
    expect(filters.activeQuickFilter).toBe('wochenende')
    expect(filters._customTimeFilter).toBe('wochenende')
  })

  it('should apply Probetraining filter without clearing other filters', () => {
    // Set existing filters
    filters.wochentag = 'Montag'
    filters.ort = ['München']

    QUICK_FILTERS.probetraining.apply(filters, context)

    // Should NOT clear wochentag and ort
    expect(filters.wochentag).toBe('Montag')
    expect(filters.ort).toEqual(['München'])
    expect(filters.activeQuickFilter).toBe('probetraining')
    expect(filters._customFeatureFilter).toBe('probetraining')
  })

  it('should apply Favoriten filter and clear all other filters', () => {
    // Set existing filters
    filters.wochentag = 'Montag'
    filters.ort = ['München']
    filters.training = ['Parkour']
    filters.searchTerm = 'test'

    QUICK_FILTERS.favoriten.apply(filters, context)

    // Should clear ALL filters
    expect(filters.wochentag).toBe('')
    expect(filters.ort).toBe('')
    expect(filters.training).toBe('')
    expect(filters.searchTerm).toBe('')
    expect(filters.activeQuickFilter).toBe('favoriten')
    expect(filters._customPersonalFilter).toBe('favoriten')
  })
})

describe('Quick Filter Color Classes', () => {
  it('should return active state classes when filter is active', () => {
    const classes = getQuickFilterColorClasses('heute', true)
    expect(classes).toContain('bg-primary-500')
    expect(classes).toContain('text-white')
  })

  it('should return primary color classes for default filters', () => {
    const classes = getQuickFilterColorClasses('heute', false)
    expect(classes).toContain('bg-primary-50')
    expect(classes).toContain('text-primary-700')
  })

  it('should return yellow color classes for favoriten', () => {
    const classes = getQuickFilterColorClasses('favoriten', false)
    expect(classes).toContain('bg-yellow-50')
    expect(classes).toContain('text-yellow-700')
  })

  it('should return green color classes for probetraining', () => {
    const classes = getQuickFilterColorClasses('probetraining', false)
    expect(classes).toContain('bg-green-50')
    expect(classes).toContain('text-green-700')
  })
})
