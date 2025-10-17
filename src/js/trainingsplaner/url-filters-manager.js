// @ts-check
/**
 * URL Filters Manager Module
 * @file src/js/trainingsplaner/url-filters-manager.js
 * @version 3.0.0
 *
 * Manages synchronization between URL parameters and filter state.
 * Allows deep-linking to specific filter configurations.
 */

import { CONFIG, log } from '../config.js'
import { utils } from '../utils.js'

/**
 * @typedef {import('./types.js').AlpineContext} AlpineContext
 */

/**
 * URL Filters Manager
 *
 * Class that manages URL parameter synchronization with filter state.
 */
export class UrlFiltersManager {
  /**
   * Create URL Filters Manager
   *
   * @param {AlpineContext} context - Alpine.js context
   */
  constructor(context) {
    this.context = context
  }

  /**
   * Load Filters from URL
   *
   * Parses URL parameters and sets filters accordingly.
   * This enables deep-linking to specific filter configurations.
   *
   * @returns {void}
   */
  loadFiltersFromUrl() {
    const urlFilters = utils.getFiltersFromUrl()
    Object.assign(this.context.$store.ui.filters, urlFilters)
    log('debug', 'URL filters loaded', urlFilters)
  }

  /**
   * Update URL with Filters
   *
   * Updates the browser URL with current filter state (without page reload).
   * Uses History API to update URL without triggering navigation.
   *
   * @returns {void}
   */
  updateUrlWithFilters() {
    if (!CONFIG.filters.persistInUrl) return

    const url = utils.createShareLink(this.context.$store.ui.filters)
    window.history.replaceState({}, '', url)
  }
}
