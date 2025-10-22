// @ts-check
/**
 * Geolocation Manager Module
 * @file src/js/trainingsplaner/geolocation-manager.js
 * @version 3.0.0
 *
 * Manages user geolocation and distance calculations to training locations.
 */

import { CONFIG, log } from '../config.js'
import { utils } from '../utils.js'

/**
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 * @typedef {import('./types.js').AlpineContext} AlpineContext
 */

/**
 * Geolocation Manager
 *
 * Handles user location requests and distance calculations.
 */
export class GeolocationManager {
  /**
   * Create Geolocation Manager
   *
   * @param {TrainingsplanerState} state - Component state
   * @param {AlpineContext} context - Alpine.js context
   * @param {Object} dependencies - External dependencies
   * @param {() => void} dependencies.applyFilters - Apply filters function
   * @param {Object} [dependencies.mapManager] - Map manager instance for adding user marker
   */
  constructor(state, context, dependencies) {
    this.state = state
    this.context = context
    this.applyFilters = dependencies.applyFilters
    this.mapManager = dependencies.mapManager || null

    // Load manual location from store if available
    this.loadManualLocation()
  }

  /**
   * Load Manual Location from Store
   *
   * Loads manual location from Alpine store if set.
   *
   * @returns {void}
   */
  loadManualLocation() {
    if (this.context.$store.ui.manualLocationSet && this.context.$store.ui.manualLocation) {
      this.context.userPosition = this.context.$store.ui.manualLocation
      log('info', 'Manual location loaded', this.context.userPosition)

      // Add distance to trainings
      this.addDistanceToTrainings()

      // Add user marker to map if map exists
      if (this.mapManager && this.context.map) {
        const { lat, lng } = this.context.userPosition
        this.mapManager.addUserLocationMarker([lat, lng])
      }
    }
  }

  /**
   * Request User Location
   *
   * Requests geolocation permission and adds distance to trainings.
   *
   * @returns {Promise<boolean>} True if location was obtained
   */
  async requestUserLocation() {
    if (!CONFIG.features.enableGeolocation) {
      this.context.geolocationError = 'Geolocation ist deaktiviert'
      return false
    }

    this.context.geolocationLoading = true
    this.context.geolocationError = null

    try {
      this.context.userPosition = await utils.getCurrentPosition()
      log('info', 'Position obtained', this.context.userPosition)

      this.addDistanceToTrainings()
      this.applyFilters()

      // Add user marker to map if map exists
      if (this.mapManager && this.context.map) {
        const { lat, lng } = this.context.userPosition
        this.mapManager.addUserLocationMarker([lat, lng])
      }

      this.context.$store.ui.showNotification('Standort ermittelt! 📍', 'success', 2000)

      return true
    } catch (err) {
      log('error', 'Geolocation failed', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.context.geolocationError = errorMessage
      this.context.$store.ui.showNotification(errorMessage, 'error', 5000)
      return false
    } finally {
      this.context.geolocationLoading = false
    }
  }

  /**
   * Add Distance to Trainings
   *
   * Calculates distance from user position to each training location.
   * Adds distance and distanceText properties to training objects.
   *
   * @returns {void}
   */
  addDistanceToTrainings() {
    if (!this.context.userPosition) return

    this.context.allTrainings = utils.addDistanceToTrainings(
      this.context.allTrainings,
      this.context.userPosition
    )

    this.context.allTrainings.forEach(t => {
      if (t.distance !== undefined) {
        t.distanceText = t.distance.toFixed(1) + ' km'
      }
    })
  }

  /**
   * Reset Location
   *
   * Clears user position, removes stored location data, and resets distance-based filters.
   *
   * @returns {void}
   */
  resetLocation() {
    // Clear userPosition
    this.context.userPosition = null

    // Clear manual location from store
    this.context.$store.ui.manualLocation = null
    this.context.$store.ui.manualLocationAddress = ''
    this.context.$store.ui.manualLocationSet = false

    // Remove from localStorage
    localStorage.removeItem('manualLocation')

    // Remove distance properties from trainings
    this.context.allTrainings.forEach(t => {
      delete t.distance
      delete t.distanceText
    })

    // Remove map marker for user location if it exists
    if (this.context.map && this.context.userLocationMarker) {
      this.context.map.removeLayer(this.context.userLocationMarker)
      this.context.userLocationMarker = null
    }

    // Deactivate distance-based quick filter if active
    if (this.context.$store.ui.filters.activeQuickFilter === 'nearby') {
      this.context.$store.ui.filters.activeQuickFilter = null
    }

    // Reapply filters to update UI
    this.applyFilters()

    log('info', 'Location reset successfully')
  }
}
