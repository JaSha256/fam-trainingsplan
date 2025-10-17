// @ts-check
/**
 * Map Manager Module
 * @file src/js/trainingsplaner/map-manager.js
 * @version 3.0.0
 *
 * Manages Leaflet map instance, markers, and interactions.
 */

import { CONFIG, log } from '../config.js'
import { utils } from '../utils.js'
import * as L from 'leaflet'

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 */

/**
 * Map Manager
 *
 * Manages Leaflet map creation, marker placement, and cleanup.
 */
export class MapManager {
  /**
   * Create Map Manager
   *
   * @param {TrainingsplanerState} state - Component state
   */
  constructor(state) {
    this.state = state
  }

  /**
   * Initialize Map
   *
   * Creates Leaflet map instance and adds tile layer.
   * Should be called when map modal is opened.
   *
   * @returns {void}
   */
  initializeMap() {
    if (this.state.map) return

    const container = document.getElementById('map-modal-container')
    if (!container) {
      log('error', 'Map container not found')
      return
    }

    try {
      this.state.map = L.map('map-modal-container', {
        center: /** @type {L.LatLngExpression} */ (CONFIG.map.defaultCenter),
        zoom: CONFIG.map.defaultZoom,
        zoomControl: true
      })

      L.tileLayer(CONFIG.map.tileLayerUrl, {
        attribution: CONFIG.map.attribution,
        maxZoom: 19
      }).addTo(this.state.map)

      this.addMarkersToMap()

      log('info', 'Map initialized')
    } catch (error) {
      log('error', 'Map initialization failed', error)
    }
  }

  /**
   * Add Markers to Map
   *
   * Adds markers for all filtered trainings to the map.
   * Automatically fits bounds to show all markers.
   *
   * @returns {void}
   */
  addMarkersToMap() {
    if (!this.state.map) return

    const map = this.state.map
    this.state.markers.forEach((m) => map.removeLayer(m))
    this.state.markers = []

    /** @type {[number, number][]} */
    const bounds = []

    this.state.filteredTrainings.forEach((training) => {
      if (!training.lat || !training.lng) return

      const marker = L.marker([training.lat, training.lng])
      marker.bindPopup(this.createMapPopup(training))
      marker.addTo(map)

      this.state.markers.push(marker)
      bounds.push([training.lat, training.lng])
    })

    if (bounds.length > 0 && !this.state.userHasInteractedWithMap) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    map.once('movestart', () => {
      this.state.userHasInteractedWithMap = true
    })
  }

  /**
   * Create Map Popup HTML
   *
   * Generates HTML content for marker popup.
   *
   * @param {Training} training - Training object
   * @returns {string} HTML string for popup
   */
  createMapPopup(training) {
    return `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${training.training}</h3>
        <p class="text-sm mb-1"><strong>Ort:</strong> ${training.ort}</p>
        <p class="text-sm mb-1"><strong>Zeit:</strong> ${utils.formatZeitrange(
          training.von,
          training.bis
        )}</p>
        <p class="text-sm mb-1"><strong>Alter:</strong> ${utils.formatAlter(
          training
        )}</p>
        ${
          training.distanceText
            ? `<p class="text-sm text-primary-600 font-bold mt-2">=� ${training.distanceText} entfernt</p>`
            : ''
        }
        ${
          training.link
            ? `<a href="${training.link}" target="_blank" class="inline-block mt-2 px-3 py-1 bg-primary-500 text-white rounded text-xs font-bold hover:bg-primary-600">Anmelden �</a>`
            : ''
        }
      </div>
    `
  }

  /**
   * Cleanup Map
   *
   * Removes all markers and destroys map instance.
   * Should be called when map modal is closed.
   *
   * @returns {void}
   */
  cleanupMap() {
    if (this.state.map) {
      const map = this.state.map
      this.state.markers.forEach((m) => map.removeLayer(m))
      this.state.markers = []
      map.remove()
      this.state.map = null
      this.state.userHasInteractedWithMap = false
    }
  }
}
