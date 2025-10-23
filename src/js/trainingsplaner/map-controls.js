// @ts-check
/**
 * Custom Leaflet Controls
 * @file src/js/trainingsplaner/map-controls.js
 * @version 1.0.0
 *
 * Custom controls for Leaflet map following official extension patterns.
 * @see https://leafletjs.com/examples/extending/extending-2-layers.html
 */

import * as L from 'leaflet'
import { CONFIG, log } from '../config.js'

/**
 * @typedef {Object} GeolocationControlOptions
 * @property {'topleft' | 'topright' | 'bottomleft' | 'bottomright'} [position] - Control position
 * @property {Object} [strings] - UI strings
 * @property {string} [strings.title] - Button title
 * @property {string} [strings.locating] - Locating message
 * @property {string} [strings.found] - Success message
 * @property {string} [strings.error] - Error message
 */

/**
 * @typedef {Object} GeolocationControlMethods
 * @property {L.Map} _map - Leaflet map instance
 * @property {HTMLButtonElement} _button - Control button element
 * @property {L.Marker} [_userMarker] - User location marker
 * @property {GeolocationControlOptions} options - Control options
 */

/**
 * Geolocation Control
 *
 * Custom Leaflet control with "Find Me" button for user geolocation.
 * Follows Leaflet.Control extension pattern.
 *
 * @example
 * const locateControl = new GeolocationControl({ position: 'topright' })
 * map.addControl(locateControl)
 */
export const GeolocationControl = L.Control.extend({
  /**
   * Control options
   * @type {GeolocationControlOptions}
   */
  options: {
    position: 'topright',
    strings: {
      title: 'Mein Standort',
      locating: 'Standort wird ermittelt...',
      found: 'Standort gefunden!',
      error: 'Standort konnte nicht ermittelt werden'
    }
  },

  /**
   * Create control UI
   * @param {L.Map} map - Leaflet map instance
   * @returns {HTMLElement}
   */
  onAdd(map) {
    // @ts-expect-error - Leaflet Control extend pattern adds properties dynamically
    this._map = map

    // Create container
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-geolocation')

    // Create button with M3 styling
    // @ts-expect-error - Leaflet Control extend pattern adds properties dynamically
    this._button = /** @type {HTMLButtonElement} */ (L.DomUtil.create('button', 'md-icon-button', container))
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.title = this.options.strings?.title || 'Mein Standort'
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.setAttribute('aria-label', this.options.strings?.title || 'Mein Standort')

    // Prevent map interaction when clicking button
    L.DomEvent.disableClickPropagation(container)
    L.DomEvent.disableScrollPropagation(container)

    // Handle button click
    // @ts-expect-error - Leaflet Control extend pattern
    L.DomEvent.on(this._button, 'click', this._handleClick, this)

    return container
  },

  /**
   * Remove control
   * @param {L.Map} _map - Leaflet map instance (unused but required by Leaflet API)
   * @returns {void}
   */
  onRemove(_map) {
    // @ts-expect-error - Leaflet Control extend pattern
    L.DomEvent.off(this._button, 'click', this._handleClick, this)
  },

  /**
   * Handle click on geolocation button
   * @private
   * @returns {void}
   */
  _handleClick() {
    if (!navigator.geolocation) {
      this._showError('Geolocation wird von diesem Browser nicht unterstützt')
      return
    }

    this._setLoading(true)

    // Use Leaflet's built-in locate method
    // @ts-expect-error - Leaflet Control extend pattern
    this._map.locate({
      setView: true,
      maxZoom: 16,
      // @ts-expect-error - CONFIG types incomplete
      enableHighAccuracy: CONFIG.map.geolocation.enableHighAccuracy,
      // @ts-expect-error - CONFIG types incomplete
      timeout: CONFIG.map.geolocation.timeout,
      // @ts-expect-error - CONFIG types incomplete
      maximumAge: CONFIG.map.geolocation.maximumAge
    })

    // Handle success
    // @ts-expect-error - Leaflet Control extend pattern
    this._map.once('locationfound', (/** @type {L.LocationEvent} */ e) => {
      this._setLoading(false)
      this._showSuccess(e.latlng)
      log('info', 'Geolocation found', { lat: e.latlng.lat, lng: e.latlng.lng, accuracy: e.accuracy })
    })

    // Handle error
    // @ts-expect-error - Leaflet Control extend pattern
    this._map.once('locationerror', (/** @type {L.ErrorEvent} */ e) => {
      this._setLoading(false)
      let message = this.options.strings?.error || 'Fehler'

      switch (e.code) {
        case 1: // PERMISSION_DENIED
          message = 'Standort-Berechtigung verweigert. Bitte in den Browser-Einstellungen erlauben.'
          break
        case 2: // POSITION_UNAVAILABLE
          message = 'Standort nicht verfügbar. GPS aktivieren?'
          break
        case 3: // TIMEOUT
          message = 'Standort-Anfrage Timeout. Bitte erneut versuchen.'
          break
      }

      this._showError(message)
      log('warn', 'Geolocation error', { code: e.code, message: e.message })
    })
  },

  /**
   * Set loading state
   * @private
   * @param {boolean} loading - Is loading
   * @returns {void}
   */
  _setLoading(loading) {
    if (loading) {
      // @ts-expect-error - Leaflet Control extend pattern
      this._button.classList.add('loading')
      // @ts-expect-error - Leaflet Control extend pattern
      this._button.disabled = true
      // @ts-expect-error - Leaflet Control extend pattern
      this._button.title = this.options.strings?.locating || 'Wird ermittelt...'
    } else {
      // @ts-expect-error - Leaflet Control extend pattern
      this._button.classList.remove('loading')
      // @ts-expect-error - Leaflet Control extend pattern
      this._button.disabled = false
      // @ts-expect-error - Leaflet Control extend pattern
      this._button.title = this.options.strings?.title || 'Mein Standort'
    }
  },

  /**
   * Show success notification and add marker
   * @private
   * @param {L.LatLng} latlng - User location
   * @returns {void}
   */
  _showSuccess(latlng) {
    // Add user location marker (if not already added)
    // @ts-expect-error - Leaflet Control extend pattern
    if (this._userMarker) {
      // @ts-expect-error - Leaflet Control extend pattern
      this._map.removeLayer(this._userMarker)
    }

    // @ts-expect-error - Leaflet Control extend pattern
    this._userMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'md-user-location-marker',
        html: '<div class="pulse"></div>',
        iconSize: [20, 20]
      }),
      title: 'Mein Standort'
      // @ts-expect-error - Leaflet Control extend pattern
    }).addTo(this._map)

    // Show notification via Alpine.js is loaded globally
    // @ts-expect-error - Alpine.js is loaded globally
    if (window.Alpine && window.Alpine.store) {
      // @ts-expect-error - Alpine.js is loaded globally
      window.Alpine.store('ui').showNotification(this.options.strings?.found || 'Standort gefunden', 'success', 3000)
    }
  },

  /**
   * Show error notification
   * @private
   * @param {string} message - Error message
   * @returns {void}
   */
  _showError(message) {
    // Show notification via Alpine.js store
    // @ts-expect-error - Alpine.js is loaded globally
    if (window.Alpine && window.Alpine.store) {
      // @ts-expect-error - Alpine.js is loaded globally
      window.Alpine.store('ui').showNotification(message, 'error', 5000)
    }
  }
})

/**
 * @typedef {Object} ResetViewControlOptions
 * @property {'topleft' | 'topright' | 'bottomleft' | 'bottomright'} [position] - Control position
 * @property {string} [title] - Button title
 * @property {L.LatLngBoundsExpression | null} [bounds] - Bounds to reset to
 * @property {L.LatLngExpression | null} [center] - Center to reset to
 * @property {number | null} [zoom] - Zoom level to reset to
 */

/**
 * Reset View Control
 *
 * Custom Leaflet control to reset map to default bounds/zoom.
 *
 * @example
 * const resetControl = new ResetViewControl({ position: 'topright', bounds: initialBounds })
 * map.addControl(resetControl)
 */
export const ResetViewControl = L.Control.extend({
  /**
   * Control options
   * @type {ResetViewControlOptions}
   */
  options: {
    position: 'topright',
    title: 'Ansicht zurücksetzen',
    bounds: null,  // Optional: specific bounds to reset to
    center: null,  // Optional: specific center to reset to
    zoom: null     // Optional: specific zoom to reset to
  },

  /**
   * Create control UI
   * @param {L.Map} map - Leaflet map instance
   * @returns {HTMLElement}
   */
  onAdd(map) {
    // @ts-expect-error - Leaflet Control extend pattern
    this._map = map

    // Store initial view if not provided
    if (!this.options.bounds && !this.options.center) {
      // @ts-expect-error - Leaflet Control extend pattern
      this._initialCenter = map.getCenter()
      // @ts-expect-error - Leaflet Control extend pattern
      this._initialZoom = map.getZoom()
    }

    // Create container
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-reset')

    // Create button
    // @ts-expect-error - Leaflet Control extend pattern
    this._button = /** @type {HTMLButtonElement} */ (L.DomUtil.create('button', 'md-icon-button', container))
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
      </svg>
    `
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.title = this.options.title || 'Ansicht zurücksetzen'
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.setAttribute('aria-label', this.options.title || 'Ansicht zurücksetzen')

    // Prevent map interaction
    L.DomEvent.disableClickPropagation(container)
    L.DomEvent.disableScrollPropagation(container)

    // Handle click
    // @ts-expect-error - Leaflet Control extend pattern
    L.DomEvent.on(this._button, 'click', this._handleClick, this)

    return container
  },

  /**
   * Remove control
   * @param {L.Map} _map - Leaflet map instance (unused but required by Leaflet API)
   * @returns {void}
   */
  onRemove(_map) {
    // @ts-expect-error - Leaflet Control extend pattern
    L.DomEvent.off(this._button, 'click', this._handleClick, this)
  },

  /**
   * Handle click - reset view
   * @private
   * @returns {void}
   */
  _handleClick() {
    if (this.options.bounds) {
      // Reset to specific bounds
      // @ts-expect-error - Leaflet Control extend pattern
      this._map.fitBounds(this.options.bounds, { padding: [50, 50], animate: true })
    } else if (this.options.center && this.options.zoom) {
      // Reset to specific center/zoom
      // @ts-expect-error - Leaflet Control extend pattern
      this._map.setView(this.options.center, this.options.zoom, { animate: true })
    } else {
      // Reset to initial view
      // @ts-expect-error - Leaflet Control extend pattern
      this._map.setView(this._initialCenter, this._initialZoom, { animate: true })
    }

    log('info', 'Map view reset')
  }
})

/**
 * @typedef {Object} LayerSwitcherControlOptions
 * @property {'topleft' | 'topright' | 'bottomleft' | 'bottomright'} [position] - Control position
 * @property {string} [title] - Button title
 * @property {Record<string, L.TileLayer>} [layers] - Map of layer names to tile layers
 * @property {string} [defaultLayer] - Default layer name
 */

/**
 * Layer Switcher Control
 *
 * Custom Leaflet control to switch between different map tile layers.
 * Provides quick access to Street, Satellite, and Terrain views.
 *
 * @example
 * const layerControl = new LayerSwitcherControl({
 *   position: 'topright',
 *   layers: { street: streetLayer, satellite: satelliteLayer }
 * })
 * map.addControl(layerControl)
 */
export const LayerSwitcherControl = L.Control.extend({
  /**
   * Control options
   * @type {LayerSwitcherControlOptions}
   */
  options: {
    position: 'topright',
    title: 'Kartenstil wechseln',
    layers: {}, // { name: layer } pairs
    defaultLayer: 'street'
  },

  /**
   * Create control UI
   * @param {L.Map} map - Leaflet map instance
   * @returns {HTMLElement}
   */
  onAdd(map) {
    // @ts-expect-error - Leaflet Control extend pattern
    this._map = map
    // @ts-expect-error - Leaflet Control extend pattern
    this._currentLayer = this.options.defaultLayer || 'street'

    // Create container
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-layers-switcher')

    // Create button
    // @ts-expect-error - Leaflet Control extend pattern
    this._button = /** @type {HTMLButtonElement} */ (L.DomUtil.create('button', 'md-icon-button', container))
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M12 18v-4"></path>
        <path d="M8 16h8"></path>
      </svg>
    `
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.title = this.options.title || 'Kartenstil wechseln'
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.setAttribute('aria-label', this.options.title || 'Kartenstil wechseln')
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.setAttribute('aria-expanded', 'false')

    // Create dropdown menu
    // @ts-expect-error - Leaflet Control extend pattern
    this._menu = /** @type {HTMLDivElement} */ (L.DomUtil.create('div', 'layer-switcher-menu', container))
    // @ts-expect-error - Leaflet Control extend pattern
    this._menu.style.display = 'none'

    // Add layer options
    const layerNames = Object.keys(this.options.layers || {})
    layerNames.forEach((name) => {
      // @ts-expect-error - Leaflet Control extend pattern
      const option = /** @type {HTMLButtonElement} */ (L.DomUtil.create('button', 'layer-option', this._menu))
      option.textContent = this._getLayerLabel(name)
      option.setAttribute('data-layer', name)
      option.setAttribute('role', 'menuitem')

      // @ts-expect-error - Leaflet Control extend pattern
      if (name === this._currentLayer) {
        option.classList.add('active')
        option.setAttribute('aria-current', 'true')
      }

      L.DomEvent.on(option, 'click', () => {
        this._switchLayer(name)
      })
    })

    // Prevent map interaction
    L.DomEvent.disableClickPropagation(container)
    L.DomEvent.disableScrollPropagation(container)

    // Toggle menu on button click
    // @ts-expect-error - Leaflet Control extend pattern
    L.DomEvent.on(this._button, 'click', /** @param {Event} _e */ (_e) => {
      // @ts-expect-error - Leaflet Control extend pattern
      const isOpen = this._menu.style.display !== 'none'
      // @ts-expect-error - Leaflet Control extend pattern
      this._menu.style.display = isOpen ? 'none' : 'block'
      // @ts-expect-error - Leaflet Control extend pattern
      this._button.setAttribute('aria-expanded', isOpen ? 'false' : 'true')
    })

    // Close menu when clicking outside
    // @ts-expect-error - Leaflet DomEvent allows document as target
    L.DomEvent.on(document, 'click', (/** @type {MouseEvent} */ e) => {
      if (!container.contains(/** @type {Node} */ (e.target))) {
        // @ts-expect-error - Leaflet Control extend pattern
        this._menu.style.display = 'none'
        // @ts-expect-error - Leaflet Control extend pattern
        this._button.setAttribute('aria-expanded', 'false')
      }
    })

    return container
  },

  /**
   * Remove control
   * @param {L.Map} _map - Leaflet map instance (unused but required by Leaflet API)
   * @returns {void}
   */
  onRemove(_map) {
    // @ts-expect-error - Leaflet Control extend pattern
    L.DomEvent.off(this._button, 'click')
    // @ts-expect-error - Leaflet DomEvent allows document as target
    L.DomEvent.off(document, 'click')
  },

  /**
   * Switch to different layer
   * @private
   * @param {string} layerName - Name of layer to switch to
   * @returns {void}
   */
  _switchLayer(layerName) {
    // @ts-expect-error - Leaflet Control extend pattern
    if (layerName === this._currentLayer) return

    // @ts-expect-error - Leaflet Control extend pattern
    const oldLayer = this.options.layers?.[this._currentLayer]
    const newLayer = this.options.layers?.[layerName]

    if (!newLayer) return

    // Remove old layer and add new layer
    // @ts-expect-error - Leaflet Control extend pattern
    if (oldLayer && this._map.hasLayer(oldLayer)) {
      // @ts-expect-error - Leaflet Control extend pattern
      this._map.removeLayer(oldLayer)
    }
    // @ts-expect-error - Leaflet Control extend pattern
    this._map.addLayer(newLayer)

    // Update UI
    // @ts-expect-error - Leaflet Control extend pattern
    this._currentLayer = layerName
    this._updateMenuUI()

    // Close menu
    // @ts-expect-error - Leaflet Control extend pattern
    this._menu.style.display = 'none'
    // @ts-expect-error - Leaflet Control extend pattern
    this._button.setAttribute('aria-expanded', 'false')

    log('info', `Switched to ${layerName} layer`)
  },

  /**
   * Update menu UI to reflect current layer
   * @private
   * @returns {void}
   */
  _updateMenuUI() {
    // @ts-expect-error - Leaflet Control extend pattern
    const options = this._menu.querySelectorAll('.layer-option')
    options.forEach((/** @type {Element} */ option) => {
      const layerName = option.getAttribute('data-layer')
      // @ts-expect-error - Leaflet Control extend pattern
      if (layerName === this._currentLayer) {
        option.classList.add('active')
        option.setAttribute('aria-current', 'true')
      } else {
        option.classList.remove('active')
        option.removeAttribute('aria-current')
      }
    })
  },

  /**
   * Get human-readable label for layer
   * @private
   * @param {string} name - Layer name
   * @returns {string}
   */
  _getLayerLabel(name) {
    /** @type {Record<string, string>} */
    const labels = {
      street: '🗺️ Straßenkarte',
      satellite: '🛰️ Satellit',
      terrain: '⛰️ Gelände',
      dark: '🌙 Dunkel'
    }
    return labels[name] || name
  }
})

/**
 * Factory functions for easier usage
 */

/**
 * Create geolocation control
 * @param {Object} options - Control options
 * @returns {L.Control}
 */
export function createGeolocationControl(options = {}) {
  return new GeolocationControl(options)
}

/**
 * Create reset view control
 * @param {Object} options - Control options
 * @returns {L.Control}
 */
export function createResetViewControl(options = {}) {
  return new ResetViewControl(options)
}

/**
 * Create layer switcher control
 * @param {Object} options - Control options
 * @returns {L.Control}
 */
export function createLayerSwitcherControl(options = {}) {
  return new LayerSwitcherControl(options)
}
