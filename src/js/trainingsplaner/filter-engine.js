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
   * Filter Hierarchy:
   * 1. CUSTOM FILTERS (Quick Filters) - Applied first with special logic
   *    a. Personal Filter: Favoriten (EXCLUSIVE - overrides all other filters)
   *    b. Time Filter: Wochenende/Wochentags (mutually exclusive with standard weekday)
   *    c. Feature Filter: Probetraining (combinable)
   *    d. Location Filter: In meiner Nähe (mutually exclusive with standard location)
   * 2. STANDARD FILTERS - Applied after custom filters
   *    a. Training Type (array-based OR logic)
   *    b. Age Group (array-based OR logic)
   *    c. Search Term (Fuse.js fuzzy search)
   * 3. POST-PROCESSING
   *    a. Distance Filter (if geolocation enabled)
   *    b. Distance Sorting
   *
   * Multi-select logic:
   * - Within filter category: OR logic (e.g., Montag OR Mittwoch)
   * - Between filter categories: AND logic (e.g., (Montag OR Mittwoch) AND München)
   *
   * @returns {void}
   */
  applyFilters() {
    const filters = this.context.$store.ui.filters
    let result = [...this.context.allTrainings]

    // ==================== CUSTOM FILTERS (Quick Filters) ====================
    // Custom filters are applied first and may be mutually exclusive with standard filters

    // 1. Personal Filter: Favoriten (EXCLUSIVE - overrides ALL other filters)
    if (this.matchesCustomPersonalFilter(filters._customPersonalFilter)) {
      result = result.filter((t) => this.isFavorite(t.id))
      this._finalizeFiltering(result)
      return
    }

    // 2. Time Filter: Wochenende/Wochentags (mutually exclusive with standard weekday filter)
    if (this.hasCustomTimeFilter(filters._customTimeFilter)) {
      result = this.applyCustomTimeFilter(result, filters._customTimeFilter)
    } else {
      // Standard Weekday Filter: array-based with OR logic
      result = this.applyStandardWeekdayFilter(result, filters.wochentag)
    }

    // 3. Feature Filter: Probetraining (combinable with other filters)
    if (this.hasCustomFeatureFilter(filters._customFeatureFilter)) {
      result = this.applyCustomFeatureFilter(result, filters._customFeatureFilter)
    }

    // 4. Location Filter: In meiner Nähe (mutually exclusive with standard location filter)
    if (this.hasCustomLocationFilter(filters._customLocationFilter)) {
      result = this.applyCustomLocationFilter(result, filters._customLocationFilter)
    } else {
      // Standard Location Filter: array-based with OR logic
      result = this.applyStandardLocationFilter(result, filters.ort)
    }

    // ==================== STANDARD FILTERS ====================
    // Standard filters are always combinable and use array-based OR logic within category

    // Training Type Filter: array-based with OR logic
    result = this.applyTrainingTypeFilter(result, filters.training)

    // Age Group Filter: array-based with OR logic
    result = this.applyAgeGroupFilter(result, filters.altersgruppe)

    // Search Term Filter: Fuse.js fuzzy search
    result = this.applySearchFilter(result, filters.searchTerm)

    // ==================== POST-PROCESSING ====================

    // Distance Filter: only if user position exists and NOT using custom location filter
    if (!filters._customLocationFilter && this.context.userPosition && CONFIG.map.geolocation.maxDistance > 0) {
      result = result.filter((t) => t.distance && t.distance <= CONFIG.map.geolocation.maxDistance)
    }

    // Distance Sorting: sort by proximity if user position available
    if (this.context.userPosition) {
      result.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    }

    this._finalizeFiltering(result)
  }

  // ==================== CUSTOM FILTER HELPERS ====================

  /**
   * Check Custom Personal Filter
   *
   * Determines if custom personal filter (e.g., 'favoriten') is active.
   *
   * @param {string} filterValue - Custom personal filter value
   * @returns {boolean} True if custom personal filter is active
   */
  matchesCustomPersonalFilter(filterValue) {
    return filterValue === 'favoriten'
  }

  /**
   * Check Custom Time Filter
   *
   * Determines if custom time filter (e.g., 'wochenende', 'wochentags') is active.
   *
   * @param {string} filterValue - Custom time filter value
   * @returns {boolean} True if custom time filter is active
   */
  hasCustomTimeFilter(filterValue) {
    return filterValue === 'wochenende' || filterValue === 'wochentags'
  }

  /**
   * Apply Custom Time Filter
   *
   * Filters trainings by custom time criteria (weekend or weekdays).
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string} filterValue - Custom time filter value ('wochenende' or 'wochentags')
   * @returns {Training[]} Filtered trainings
   */
  applyCustomTimeFilter(trainings, filterValue) {
    if (filterValue === 'wochenende') {
      return trainings.filter((t) => t.wochentag === 'Samstag' || t.wochentag === 'Sonntag')
    }
    if (filterValue === 'wochentags') {
      return trainings.filter((t) => t.wochentag && t.wochentag !== 'Samstag' && t.wochentag !== 'Sonntag')
    }
    return trainings
  }

  /**
   * Check Custom Feature Filter
   *
   * Determines if custom feature filter (e.g., 'probetraining') is active.
   *
   * @param {string} filterValue - Custom feature filter value
   * @returns {boolean} True if custom feature filter is active
   */
  hasCustomFeatureFilter(filterValue) {
    return filterValue === 'probetraining'
  }

  /**
   * Apply Custom Feature Filter
   *
   * Filters trainings by custom feature criteria (e.g., trial training availability).
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string} filterValue - Custom feature filter value ('probetraining')
   * @returns {Training[]} Filtered trainings
   */
  applyCustomFeatureFilter(trainings, filterValue) {
    if (filterValue === 'probetraining') {
      return trainings.filter((t) => t.probetraining?.toLowerCase() === 'ja')
    }
    return trainings
  }

  /**
   * Check Custom Location Filter
   *
   * Determines if custom location filter (e.g., 'inMeinerNaehe') is active.
   *
   * @param {string} filterValue - Custom location filter value
   * @returns {boolean} True if custom location filter is active
   */
  hasCustomLocationFilter(filterValue) {
    return filterValue === 'inMeinerNaehe'
  }

  /**
   * Apply Custom Location Filter
   *
   * Filters trainings by custom location criteria (e.g., within 5km).
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string} filterValue - Custom location filter value ('inMeinerNaehe')
   * @returns {Training[]} Filtered trainings
   */
  applyCustomLocationFilter(trainings, filterValue) {
    if (filterValue === 'inMeinerNaehe') {
      return trainings.filter((t) => {
        if (!t.distance) return false
        const distance = parseFloat(t.distance)
        return !isNaN(distance) && distance <= 5.0
      })
    }
    return trainings
  }

  // ==================== STANDARD FILTER HELPERS ====================

  /**
   * Apply Standard Weekday Filter
   *
   * Filters trainings by weekday using array-based OR logic.
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string | string[] | null | undefined} filterValue - Weekday filter value(s)
   * @returns {Training[]} Filtered trainings
   */
  applyStandardWeekdayFilter(trainings, filterValue) {
    if (!this.hasFilterValue(filterValue)) return trainings

    const wochentagArray = this.normalizeToArray(filterValue)
    return trainings.filter((t) =>
      t.wochentag && wochentagArray.some(
        (day) => t.wochentag.toLowerCase() === day.toLowerCase()
      )
    )
  }

  /**
   * Apply Standard Location Filter
   *
   * Filters trainings by location using array-based OR logic.
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string | string[] | null | undefined} filterValue - Location filter value(s)
   * @returns {Training[]} Filtered trainings
   */
  applyStandardLocationFilter(trainings, filterValue) {
    if (!this.hasFilterValue(filterValue)) return trainings

    const ortArray = this.normalizeToArray(filterValue)
    return trainings.filter((t) =>
      t.ort && ortArray.some(
        (ort) => t.ort.toLowerCase() === ort.toLowerCase()
      )
    )
  }

  /**
   * Apply Training Type Filter
   *
   * Filters trainings by training type using array-based OR logic.
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string | string[] | null | undefined} filterValue - Training type filter value(s)
   * @returns {Training[]} Filtered trainings
   */
  applyTrainingTypeFilter(trainings, filterValue) {
    if (!this.hasFilterValue(filterValue)) return trainings

    const trainingArray = this.normalizeToArray(filterValue)
    return trainings.filter((t) =>
      t.training && trainingArray.some(
        (training) => t.training.toLowerCase().includes(training.toLowerCase())
      )
    )
  }

  /**
   * Apply Age Group Filter
   *
   * Filters trainings by age group using array-based OR logic.
   * Handles comma-separated age groups in training data.
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string | string[] | null | undefined} filterValue - Age group filter value(s)
   * @returns {Training[]} Filtered trainings
   */
  applyAgeGroupFilter(trainings, filterValue) {
    if (!this.hasFilterValue(filterValue)) return trainings

    const altersgruppeArray = this.normalizeToArray(filterValue)
    return trainings.filter((t) =>
      altersgruppeArray.some((gruppe) =>
        this.matchesAltersgruppe(t, gruppe)
      )
    )
  }

  /**
   * Apply Search Filter
   *
   * Filters trainings using Fuse.js fuzzy search.
   *
   * @param {Training[]} trainings - Trainings to filter
   * @param {string | null | undefined} searchTerm - Search term
   * @returns {Training[]} Filtered trainings
   */
  applySearchFilter(trainings, searchTerm) {
    if (!searchTerm || !searchTerm.trim() || !this.context.fuse) return trainings

    const fuseResults = this.context.fuse.search(searchTerm.trim())
    const searchIds = new Set(fuseResults.map((r) => r.item.id))
    return trainings.filter((t) => searchIds.has(t.id))
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Finalize Filtering
   *
   * Updates context with filtered results, updates URL, and logs results.
   * Extracted to reduce code duplication.
   *
   * @private
   * @param {Training[]} result - Filtered trainings
   * @returns {void}
   */
  _finalizeFiltering(result) {
    this.context.filteredTrainings = result

    if (CONFIG.filters.persistInUrl) {
      this.updateUrl()
    }

    log('debug', 'Filters applied', {
      total: this.context.allTrainings.length,
      filtered: result.length
    })
  }

  /**
   * Check if Filter Has Value
   *
   * Checks if a filter value is considered "active" (not empty).
   * Handles both string and array filter values.
   *
   * @param {string | string[] | null | undefined} filterValue - Filter value to check
   * @returns {boolean} True if filter has active value
   */
  hasFilterValue(filterValue) {
    if (!filterValue) return false
    if (Array.isArray(filterValue)) return filterValue.length > 0
    if (typeof filterValue === 'string') return filterValue.trim() !== ''
    return false
  }

  /**
   * Normalize Filter to Array
   *
   * Converts filter value to array for consistent processing.
   * Supports both legacy string filters and new array filters.
   *
   * @param {string | string[]} filterValue - Filter value (string or array)
   * @returns {string[]} Normalized array of filter values
   */
  normalizeToArray(filterValue) {
    if (Array.isArray(filterValue)) {
      return filterValue.filter(v => v && v.trim() !== '')
    }
    if (typeof filterValue === 'string' && filterValue.trim() !== '') {
      return [filterValue.trim()]
    }
    return []
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
