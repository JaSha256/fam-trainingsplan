// @ts-check
/**
 * Favorites Manager Module
 * @file src/js/trainingsplaner/favorites-manager.js
 * @version 3.0.0
 *
 * Manages favorite trainings using LocalStorage persistence.
 * Provides methods to load, check, toggle, and filter favorites.
 */

import { log } from '../config.js'
import { utils } from '../utils.js'

/**
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 * @typedef {import('./types.js').AlpineContext} AlpineContext
 */

/**
 * Favorites Manager
 *
 * Class responsible for managing favorite trainings.
 * Uses LocalStorage for persistence across sessions.
 */
export class FavoritesManager {
  /**
   * Create Favorites Manager
   *
   * @param {TrainingsplanerState} state - Component state
   * @param {AlpineContext} context - Alpine.js context
   * @param {Object} dependencies - External dependencies
   * @param {() => void} dependencies.applyFilters - Apply filters function
   */
  constructor(state, context, dependencies) {
    this.state = state
    this.context = context
    this.applyFilters = dependencies.applyFilters
  }

  /**
   * Load Favorites from LocalStorage
   *
   * Reads favorites from LocalStorage and updates state.
   *
   * @returns {void}
   */
  loadFavorites() {
    this.state.favorites = utils.favorites.load()
    log('debug', 'Favorites loaded', { count: this.state.favorites.length })
  }

  /**
   * Check if Training is Favorite
   *
   * @param {number} trainingId - Training ID to check
   * @returns {boolean} True if training is in favorites
   */
  isFavorite(trainingId) {
    return this.state.favorites.includes(trainingId)
  }

  /**
   * Toggle Favorite Status
   *
   * Adds or removes training from favorites and updates state.
   * If favorites quick filter is active, re-applies filters.
   *
   * @param {number} trainingId - Training ID to toggle
   * @returns {boolean} New favorite status (true = added, false = removed)
   */
  toggleFavorite(trainingId) {
    const isNowFavorite = utils.favorites.toggle(trainingId)
    this.loadFavorites()

    this.context.$nextTick(() => {
      if (this.context.$store.ui.filters.activeQuickFilter === 'favoriten') {
        this.applyFilters()
      }
    })

    this.context.$store.ui.showNotification(
      isNowFavorite ? 'Zu Favoriten hinzugefügt P' : 'Von Favoriten entfernt',
      'info',
      2000
    )

    return isNowFavorite
  }

  /**
   * Quick Filter Favorites
   *
   * Clears all filters and sets quick filter to show only favorites.
   * Useful for "View Favorites" button functionality.
   *
   * @returns {void}
   */
  quickFilterFavorites() {
    this.context.$store.ui.filters = {
      wochentag: '',
      ort: '',
      training: '',
      altersgruppe: '',
      searchTerm: '',
      activeQuickFilter: 'favoriten'
    }
    this.applyFilters()
  }
}
