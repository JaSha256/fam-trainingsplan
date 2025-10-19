// @ts-check
/**
 * Computed Properties Module
 * @file src/js/trainingsplaner/computed-properties.js
 * @version 3.0.0
 *
 * Provides reactive computed properties (getters) for the trainingsplaner component.
 * These properties are derived from state and automatically update when dependencies change.
 */

import { utils } from '../utils.js'

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 * @typedef {import('./types.js').AlpineContext} AlpineContext
 * @typedef {import('./types.js').GroupedTraining} GroupedTraining
 */

/**
 * Computed Properties Return Type
 * @typedef {Object} ComputedProperties
 * @property {string[]} wochentage - Weekdays
 * @property {string[]} orte - Locations
 * @property {string[]} trainingsarten - Training types
 * @property {string[]} altersgruppen - Age groups
 * @property {GroupedTraining[]} groupedTrainings - Grouped trainings
 * @property {Training[]} favoriteTrainings - Favorite trainings
 * @property {boolean} hasActiveFilters - Has active filters
 * @property {number} filteredTrainingsCount - Count of filtered trainings
 */

/**
 * Create Computed Properties
 *
 * Factory function that creates all computed property getters.
 * These getters will be added to the Alpine.js component.
 *
 * @param {TrainingsplanerState} state - Component state
 * @param {AlpineContext} context - Alpine.js context
 * @returns {ComputedProperties} Object with getter methods
 */
export function createComputedProperties(state, context) {
  return {
    /**
     * Get Wochentage (Weekdays)
     *
     * Returns weekdays from metadata or default list
     *
     * @returns {string[]} Array of weekday names
     */
    get wochentage() {
      return state.metadata?.wochentage || [
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
        'Sonntag'
      ]
    },

    /**
     * Get Orte (Locations)
     *
     * Returns unique locations from metadata or trainings
     *
     * @returns {string[]} Array of unique location names
     */
    get orte() {
      return (
        state.metadata?.orte || utils.extractUnique(state.allTrainings, 'ort')
      )
    },

    /**
     * Get Trainingsarten (Training Types)
     *
     * Returns unique training types from metadata or trainings
     *
     * @returns {string[]} Array of unique training types
     */
    get trainingsarten() {
      return (
        state.metadata?.trainingsarten ||
        utils.extractUnique(state.allTrainings, 'training')
      )
    },

    /**
     * Get Altersgruppen (Age Groups)
     *
     * Returns unique age groups from metadata or trainings.
     * Handles comma-separated values in training.altersgruppe field.
     *
     * @returns {string[]} Array of unique age group names (sorted)
     */
    get altersgruppen() {
      if (state.metadata?.altersgruppen) {
        return state.metadata.altersgruppen
      }

      const values = state.allTrainings
        .map((t) => t.altersgruppe)
        .filter((v) => v && String(v).trim() !== '')

      /** @type {string[]} */
      const allGroups = []
      values.forEach((val) => {
        String(val)
          .split(',')
          .forEach((group) => {
            const cleaned = group.trim()
            if (cleaned && !allGroups.includes(cleaned)) {
              allGroups.push(cleaned)
            }
          })
      })

      return allGroups.sort()
    },

    /**
     * Get Grouped Trainings
     *
     * Groups filtered trainings by weekday and sorts them by time.
     * Returns array of {key, items} objects for Alpine.js x-for loops.
     *
     * @returns {GroupedTraining[]} Array of grouped trainings
     */
    get groupedTrainings() {
      /** @type {Record<string, Training[]>} */
      const grouped = {}

      state.filteredTrainings.forEach((training) => {
        const key = training.wochentag || 'Ohne Tag'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(training)
      })

      const groupKeys = Object.keys(grouped).sort((a, b) => {
        return (state.wochentagOrder[a] || 999) - (state.wochentagOrder[b] || 999)
      })

      return groupKeys.map((key) => ({
        key: key,
        items: sortTrainings(state, grouped[key])
      }))
    },

    /**
     * Get Favorite Trainings
     *
     * Returns all trainings that are marked as favorites
     *
     * @returns {Training[]} Array of favorite trainings
     */
    get favoriteTrainings() {
      return state.allTrainings.filter((t) => state.favorites.includes(t.id))
    },

    /**
     * Has Active Filters
     *
     * Checks if any filter is currently active (excluding empty values)
     *
     * @returns {boolean} True if any filter is active
     */
    get hasActiveFilters() {
      const f = context.$store.ui.filters
      return /** @type {Array<keyof typeof f>} */ (['wochentag', 'ort', 'training', 'altersgruppe', 'searchTerm'])
        .reduce((count, key) => (f[key] ? count + 1 : count), 0) > 0
    },

    /**
     * Filtered Trainings Count
     *
     * Returns the number of currently filtered trainings
     *
     * @returns {number} Count of filtered trainings
     */
    get filteredTrainingsCount() {
      return state.filteredTrainings.length
    }
  }
}

/**
 * Sort Trainings by Time
 *
 * Helper function that sorts trainings by start time (von field)
 *
 * @param {TrainingsplanerState} state - Component state
 * @param {Training[]} trainings - Array of trainings to sort
 * @returns {Training[]} Sorted trainings
 */
function sortTrainings(state, trainings) {
  return trainings.sort((a, b) => {
    const aMin = utils.zeitZuMinuten(a.von)
    const bMin = utils.zeitZuMinuten(b.von)
    return aMin - bMin
  })
}
