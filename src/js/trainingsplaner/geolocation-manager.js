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
      /** @type {import('../types.js').UserPosition} */
      const manualLocation = this.context.$store.ui.manualLocation
      // Update both state and context for proper reactivity
      this.state.userPosition = manualLocation
      this.context.userPosition = manualLocation
      log('info', 'Manual location loaded', this.context.userPosition)

      // Add distance to trainings
      this.addDistanceToTrainings()

      // Add user marker to map if map exists
      if (this.mapManager && this.context.map && this.context.userPosition) {
        const { lat, lng } = this.context.userPosition
        // @ts-expect-error - mapManager type is not fully defined
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
      this.state.geolocationError = 'Geolocation ist deaktiviert'
      return false
    }

    this.context.geolocationLoading = true
    this.state.geolocationLoading = true
    this.context.geolocationError = null
    this.state.geolocationError = null

    try {
      const position = await utils.getCurrentPosition()
      // Update both state and context for proper reactivity
      this.state.userPosition = position
      this.context.userPosition = position
      log('info', 'Position obtained', this.context.userPosition)

      this.addDistanceToTrainings()
      this.applyFilters()

      // Add user marker to map if map exists
      if (this.mapManager && this.context.map && this.context.userPosition) {
        const { lat, lng } = this.context.userPosition
        // @ts-expect-error - mapManager type is not fully defined
        this.mapManager.addUserLocationMarker([lat, lng])
      }

      this.context.$store.ui.showNotification('Standort ermittelt! 📍', 'success', 2000)

      return true
    } catch (err) {
      log('error', 'Geolocation failed', err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      this.context.geolocationError = errorMessage
      this.state.geolocationError = errorMessage
      this.context.$store.ui.showNotification(errorMessage, 'error', 5000)
      return false
    } finally {
      this.context.geolocationLoading = false
      this.state.geolocationLoading = false
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

    // Update trainings with distance in both state and context
    const trainingsWithDistance = utils.addDistanceToTrainings(
      this.context.allTrainings,
      this.context.userPosition
    )

    trainingsWithDistance.forEach((/** @type {import('./types.js').Training} */ t) => {
      if (t.distance !== undefined) {
        t.distanceText = t.distance.toFixed(1) + ' km'
      }
    })

    // Update both state and context for proper reactivity
    this.state.allTrainings = trainingsWithDistance
    this.context.allTrainings = trainingsWithDistance
  }

  /**
   * Set Manual Location
   *
   * Sets a manual user location and updates map marker.
   * Called when user manually enters coordinates in settings.
   *
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} address - Optional address string for display
   * @returns {void}
   */
  setManualLocation(lat, lng, address = '') {
    // Set userPosition in both state and context for proper reactivity
    this.state.userPosition = { lat, lng }
    this.context.userPosition = { lat, lng }

    // Update Alpine store
    this.context.$store.ui.manualLocation = { lat, lng }
    this.context.$store.ui.manualLocationAddress = address
    this.context.$store.ui.manualLocationSet = true

    // Save to localStorage for persistence
    localStorage.setItem('manualLocation', JSON.stringify({ lat, lng, address }))

    // Add distance to trainings
    this.addDistanceToTrainings()

    // Apply filters to update UI
    this.applyFilters()

    // Add user marker to map if map exists
    if (this.mapManager && this.context.map) {
      // @ts-expect-error - mapManager type is not fully defined
      this.mapManager.addUserLocationMarker([lat, lng])
    }

    log('info', 'Manual location set', { lat, lng, address })
  }

  /**
   * Reset Location
   *
   * Clears user position, removes stored location data, and resets distance-based filters.
   *
   * @returns {void}
   */
  resetLocation() {
    // Clear userPosition in both state and context for proper reactivity
    this.state.userPosition = null
    this.context.userPosition = null

    // Clear manual location from store
    this.context.$store.ui.manualLocation = null
    this.context.$store.ui.manualLocationAddress = ''
    this.context.$store.ui.manualLocationSet = false

    // Remove from localStorage
    localStorage.removeItem('manualLocation')

    // Remove distance properties from trainings
    this.context.allTrainings.forEach((/** @type {import('./types.js').Training} */ t) => {
      delete t.distance
      delete t.distanceText
    })

    // Remove map marker for user location if it exists
    if (this.context.map) {
      // Remove MapManager's marker
      if (this.context.userLocationMarker) {
        this.context.map.removeLayer(this.context.userLocationMarker)
        this.context.userLocationMarker = null
      }
      
      // CRITICAL FIX: Also remove GeolocationControl's marker
      if (this.context.geolocationControl && this.context.geolocationControl._userMarker) {
        this.context.map.removeLayer(this.context.geolocationControl._userMarker)
        this.context.geolocationControl._userMarker = null
      }
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
