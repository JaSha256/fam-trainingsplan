// @ts-check
/**
 * Filter Engine Module
 * @file src/js/trainingsplaner/filter-engine.js
 * @version 3.0.0
 *
 * Handles all training filtering logic including search, location-based filtering,
 * and multi-criteria filtering. Works with Fuse.js for fuzzy search.
 */

import { CONFIG, log } from '../config.js'

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 * @typedef {import('./types.js').AlpineContext} AlpineContext
 * @typedef {import('./types.js').Filter} Filter
 */

/**
 * Filter Engine
 *
 * Class responsible for filtering trainings based on multiple criteria.
 * Supports favorites, weekday, location, training type, age group, search, and distance filters.
 */
export class FilterEngine {
  /**
   * Create Filter Engine
   *
   * @param {TrainingsplanerState} state - Component state
   * @param {AlpineContext} context - Alpine.js context
   * @param {Object} dependencies - External dependencies
   * @param {(trainingId: number) => boolean} dependencies.isFavorite - Check if training is favorite
   * @param {() => void} dependencies.updateUrl - Update URL with filters
   */
  constructor(state, context, dependencies) {
    this.state = state
    this.context = context
    this.isFavorite = dependencies.isFavorite
    this.updateUrl = dependencies.updateUrl
  }

  /**
   * Apply All Filters
   *
   * Filters trainings based on all active filter criteria and updates state.
   * This is the main filtering method that applies all filters in sequence.
   *
   * Filter order:
   * 1. Favorites quick filter
   * 2. Weekday filter
   * 3. Location filter
   * 4. Training type filter
   * 5. Age group filter
   * 6. Search term (Fuse.js)
   * 7. Distance filter
   * 8. Distance sorting
   *
   * @returns {void}
   */
  applyFilters() {
    const filters = this.context.$store.ui.filters
    let result = [...this.context.allTrainings]

    // Quick Filter: Favoriten
    if (filters.activeQuickFilter === 'favoriten') {
      result = result.filter((t) => this.isFavorite(t.id))
    }

    // Wochentag Filter
    if (filters.wochentag) {
      result = result.filter(
        (t) =>
          t.wochentag &&
          t.wochentag.toLowerCase() === filters.wochentag.toLowerCase()
      )
    }

    // Ort Filter
    if (filters.ort) {
      result = result.filter(
        (t) => t.ort && t.ort.toLowerCase() === filters.ort.toLowerCase()
      )
    }

    // Training Filter
    if (filters.training) {
      result = result.filter(
        (t) =>
          t.training &&
          t.training.toLowerCase().includes(filters.training.toLowerCase())
      )
    }

    // Altersgruppe Filter
    if (filters.altersgruppe) {
      result = result.filter((t) =>
        this.matchesAltersgruppe(t, filters.altersgruppe)
      )
    }

    // Search Term (Fuse.js)
    if (filters.searchTerm && filters.searchTerm.trim() && this.context.fuse) {
      const fuseResults = this.context.fuse.search(filters.searchTerm.trim())
      const searchIds = new Set(fuseResults.map((r) => r.item.id))
      result = result.filter((t) => searchIds.has(t.id))
    }

    // Distance Filter (if user position)
    if (this.context.userPosition && CONFIG.map.geolocation.maxDistance > 0) {
      result = result.filter((t) => {
        if (!t.distance) return false
        return t.distance <= CONFIG.map.geolocation.maxDistance
      })
    }

    // Sort by distance if available
    if (this.context.userPosition) {
      result.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    }

    this.context.filteredTrainings = result

    // Update URL
    if (CONFIG.filters.persistInUrl) {
      this.updateUrl()
    }

    log('debug', 'Filters applied', {
      total: this.context.allTrainings.length,
      filtered: result.length
    })
  }

  /**
   * Match Altersgruppe Filter
   *
   * Checks if a training matches the age group filter.
   * Handles comma-separated age groups in training data.
   *
   * @param {Training} training - Training object
   * @param {string} filterValue - Filter value to match
   * @returns {boolean} True if training matches filter
   */
  matchesAltersgruppe(training, filterValue) {
    if (!training.altersgruppe) return false

    const groups = String(training.altersgruppe)
      .split(',')
      .map((g) => g.trim().toLowerCase())

    return groups.some((g) => g === filterValue.toLowerCase())
  }
}
