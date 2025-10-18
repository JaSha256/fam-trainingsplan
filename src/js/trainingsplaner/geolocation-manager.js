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
   */
  constructor(state, context, dependencies) {
    this.state = state
    this.context = context
    this.applyFilters = dependencies.applyFilters
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

      this.context.$store.ui.showNotification(
        'Standort ermittelt! 📍',
        'success',
        2000
      )

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

    this.context.allTrainings.forEach((t) => {
      if (t.distance !== undefined) {
        t.distanceText = t.distance.toFixed(1) + ' km'
      }
    })
  }
}
