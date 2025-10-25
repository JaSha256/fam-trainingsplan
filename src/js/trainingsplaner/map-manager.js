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
import {
  createGeolocationControl,
  createResetViewControl,
  createLayerSwitcherControl
} from './map-controls.js'
import {
  getOptimalClusterRadius,
  getOptimalSpiderfyMultiplier,
  groupTrainingsByLocation,
  createMapPopupHTML,
  createLocationPopupHTML
} from './map-utils.js'
// markerClusterGroup is dynamically imported when needed to prevent production build issues

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 * @typedef {import('./types.js').AlpineContext} AlpineContext
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
   * @param {AlpineContext} context - Alpine.js context
   * @param {Object} [dependencies] - External dependencies
   * @param {import('./geolocation-manager.js').GeolocationManager} [dependencies.geolocationManager] - Geolocation manager instance
   */
  constructor(state, context, dependencies = {}) {
    this.state = state
    this.context = context
    this.geolocationManager = dependencies.geolocationManager || null
  }

  /**
   * Initialize Map
   *
   * Creates Leaflet map instance and adds tile layer.
   * Restores saved map state (zoom/center) if available.
   * Works for both modal and view-tab contexts using unified map instance.
   *
   * @returns {void}
   */
  initializeMap() {
    if (this.context.map) return

    const container = document.getElementById('map-view-container')
    if (!container) {
      log('error', 'Map container not found')
      return
    }

    try {
      // Restore saved map state or use defaults
      const savedState = this.loadMapState()
      const center = savedState?.center || CONFIG.map.defaultCenter
      const zoom = savedState?.zoom || CONFIG.map.defaultZoom

      this.context.map = L.map('map-view-container', {
        center: /** @type {L.LatLngExpression} */ (center),
        zoom: zoom,
        zoomControl: true,
        // Accessibility: Make map keyboard accessible
        keyboard: true,
        keyboardPanDelta: 80,
        // Smooth zoom animations
        zoomAnimation: true,
        zoomAnimationThreshold: 4,
        fadeAnimation: true,
        markerZoomAnimation: true,
        // Smooth panning
        inertia: true,
        inertiaDeceleration: 3000,
        inertiaMaxSpeed: 1500,
        // Smooth scrollwheel zoom
        scrollWheelZoom: true,
        // @ts-expect-error - smoothWheelZoom is a Leaflet plugin feature (leaflet.smoothwheelzoom)
        smoothWheelZoom: true,
        smoothSensitivity: 1
      })

      // Save map state on user interaction
      this.context.map.on('moveend', () => {
        this.saveMapState()
      })

      // CRITICAL FIX: Override Leaflet's _animateZoom methods to prevent race conditions
      // Problem: _latLngToNewLayerPoint is called on markers/popups after they're removed from map
      // Solution: Add null check before accessing this._map
      // Reference: https://github.com/Leaflet/Leaflet/issues/4453
      // Reference: https://stackoverflow.com/questions/44803875/leaflet-error-when-zoom-after-close-popup
      this.applyLeafletRaceConditionFix()

      // Add keyboard navigation support
      this.addKeyboardNavigation()

      // Add screen reader support
      this.addScreenReaderSupport()

      // Create multiple tile layers for layer switcher
      this.createTileLayers()

      // Add custom controls (including layer switcher)
      this.addCustomControls()

      this.addMarkersToMap()

      log('info', 'Map initialized')
    } catch (error) {
      log('error', 'Map initialization failed', error)
    }
  }

  /**
   * Apply Leaflet Race Condition Fix
   *
   * Overrides Leaflet's internal _animateZoom methods on Marker, Popup, and Tooltip prototypes
   * to add null checks before accessing this._map._latLngToNewLayerPoint().
   *
   * This prevents the "Cannot read properties of null (reading '_latLngToNewLayerPoint')" error
   * that occurs when zoom animations trigger on markers/popups that have been removed from the map.
   *
   * This is a documented solution for a known Leaflet race condition:
   * - https://github.com/Leaflet/Leaflet/issues/4453
   * - https://stackoverflow.com/questions/44803875/leaflet-error-when-zoom-after-close-popup
   *
   * @returns {void}
   */
  applyLeafletRaceConditionFix() {
    // Fix for Markers
    // Type definitions for internal APIs: src/types/leaflet-internals.d.ts
    L.Marker.prototype._animateZoom = function (
      /** @type {{zoom: number, center: L.LatLng}} */ opt
    ) {
      if (!this._map) {
        return // Map reference lost - skip animation
      }
      const pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round()
      this._setPos(pos)
    }

    // Fix for Popups
    // Type definitions for internal APIs: src/types/leaflet-internals.d.ts
    L.Popup.prototype._animateZoom = function (/** @type {{zoom: number, center: L.LatLng}} */ e) {
      if (!this._map) {
        return // Map reference lost - skip animation
      }
      const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
      const anchor = this._getAnchor()
      L.DomUtil.setPosition(this._container, pos.add(anchor))
    }

    // Fix for Tooltips (if present)
    // Type definitions for internal APIs: src/types/leaflet-internals.d.ts
    if (L.Tooltip && L.Tooltip.prototype._animateZoom) {
      L.Tooltip.prototype._animateZoom = function (
        /** @type {{zoom: number, center: L.LatLng}} */ e
      ) {
        if (!this._map) {
          return // Map reference lost - skip animation
        }
        const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
        const anchor = this._getAnchor()
        L.DomUtil.setPosition(this._container, pos.add(anchor))
      }
    }

    log(
      'info',
      'Leaflet race condition fix applied (Marker, Popup, Tooltip _animateZoom overrides)'
    )
  }

  /**
   * Add Keyboard Navigation
   *
   * Enables keyboard controls for map interaction (accessibility).
   * Arrow keys: Pan map
   * +/-: Zoom in/out
   * Home: Reset to default view
   *
   * @returns {void}
   */
  addKeyboardNavigation() {
    if (!this.context.map) return

    const map = this.context.map

    // Make map container focusable
    const container = map.getContainer()
    container.setAttribute('tabindex', '0')
    container.setAttribute('role', 'application')
    container.setAttribute(
      'aria-label',
      'Interaktive Karte mit Trainingsstandorten. Verwenden Sie die Pfeiltasten zum Verschieben, Plus und Minus zum Zoomen, und die Tab-Taste um zwischen Markern zu navigieren.'
    )

    // Add keyboard event listener
    map.on('keydown', e => {
      const key = e.originalEvent.key

      switch (key) {
        case '+':
        case '=':
          map.zoomIn()
          e.originalEvent.preventDefault()
          break
        case '-':
        case '_':
          map.zoomOut()
          e.originalEvent.preventDefault()
          break
        case 'Home':
          // Reset to default view
          map.setView(
            /** @type {[number, number]} */ (CONFIG.map.defaultCenter),
            CONFIG.map.defaultZoom,
            { animate: true }
          )
          e.originalEvent.preventDefault()
          break
        case 'End':
          // Fit all markers in view
          if (this.context.markers.length > 0) {
            const bounds = L.latLngBounds(this.context.markers.map(m => m.getLatLng()))
            map.fitBounds(bounds, { padding: [50, 50] })
          }
          e.originalEvent.preventDefault()
          break
      }
    })

    log('debug', 'Keyboard navigation enabled')
  }

  /**
   * Add Screen Reader Support
   *
   * Adds ARIA live region for announcing map state changes to screen readers.
   *
   * @returns {void}
   */
  addScreenReaderSupport() {
    if (!this.context.map) return

    const map = this.context.map

    // Create ARIA live region for announcements
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('class', 'sr-only')
    liveRegion.setAttribute('id', 'map-announcements')
    map.getContainer().appendChild(liveRegion)
    this.context.ariaLiveRegion = liveRegion

    // Announce zoom changes
    map.on('zoomend', () => {
      const zoom = map.getZoom()
      this.announceToScreenReader(`Zoom-Stufe ${zoom}`)
    })

    // Announce marker count after adding markers
    map.on('layeradd', () => {
      if (this.context.markers.length > 0) {
        const count = this.context.markers.length
        this.announceToScreenReader(`${count} Trainingsstandorte auf der Karte angezeigt`)
      }
    })

    log('debug', 'Screen reader support enabled')
  }

  /**
   * Announce Message to Screen Reader
   *
   * Updates ARIA live region to announce message.
   *
   * @param {string} message - Message to announce
   * @returns {void}
   */
  announceToScreenReader(message) {
    if (!this.context.ariaLiveRegion) return

    // Clear previous announcement
    this.context.ariaLiveRegion.textContent = ''

    // Add new announcement after short delay (ensures screen reader picks it up)
    setTimeout(() => {
      if (this.context.ariaLiveRegion) {
        this.context.ariaLiveRegion.textContent = message
      }
    }, 100)
  }

  /**
   * Create Tile Layers
   *
   * Creates multiple tile layers for different map styles (Street, Satellite, Terrain).
   * Adds the default layer to the map and stores others for layer switcher.
   *
   * @returns {void}
   */
  createTileLayers() {
    if (!this.context.map) return

    // Leaflet tile layer configuration optimized for mobile-first PWA
    // Using Leaflet defaults where appropriate for best performance
    // Reference: https://leafletjs.com/reference.html#gridlayer
    const commonOptions = {
      maxZoom: /** @type {any} */ (CONFIG.map).maxZoom || 19,
      minZoom: /** @type {any} */ (CONFIG.map).minZoom || 10,
      detectRetina: true,
      // Leaflet defaults optimized for mobile-first PWA
      updateWhenIdle: true, // Leaflet default (mobile optimized) - updates after pan/zoom complete
      updateInterval: 200, // Leaflet default (balanced performance) - throttle tile requests
      keepBuffer: 3, // Keep extra tiles cached for smoother panning
      bounds: /** @type {L.LatLngBoundsLiteral} */ ([
        [47.9, 11.3],
        [48.3, 11.9]
      ]), // Munich area bounds
      errorTileUrl: '',
      // updateWhenZooming removed - Leaflet default (false) prevents tile flickering during zoom
      noWrap: false
    }

    // Street Map (OpenStreetMap - Default)
    const streetLayer = L.tileLayer(CONFIG.map.tileLayerUrl, {
      ...commonOptions,
      attribution: CONFIG.map.attribution,
      className: 'md-map-tiles md-map-tiles-street'
    })

    // Satellite/Aerial (Esri World Imagery)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        ...commonOptions,
        attribution:
          'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        className: 'md-map-tiles md-map-tiles-satellite'
      }
    )

    // Terrain Map (OpenTopoMap)
    const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      ...commonOptions,
      maxZoom: 17, // OpenTopoMap only goes to 17
      attribution:
        'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
      className: 'md-map-tiles md-map-tiles-terrain'
    })

    // Store layers
    this.context.tileLayers = {
      street: streetLayer,
      satellite: satelliteLayer,
      terrain: terrainLayer
    }

    // Add default layer (street)
    streetLayer.addTo(this.context.map)
    this.context.tileLayer = streetLayer // Current active layer

    // Handle tile loading errors gracefully
    Object.values(this.context.tileLayers).forEach(layer => {
      layer.on('tileerror', (/** @type {any} */ error) => {
        log('warn', 'Tile loading error', { coords: error.coords })
      })
    })

    log('debug', 'Tile layers created')
  }

  /**
   * Add Custom Leaflet Controls
   *
   * Adds geolocation, reset view, and layer switcher controls to map.
   *
   * @returns {void}
   */
  addCustomControls() {
    if (!this.context.map) return

    // Layer switcher control (always enabled)
    if (this.context.tileLayers) {
      const layerControl = createLayerSwitcherControl({
        position: 'topright',
        layers: this.context.tileLayers,
        defaultLayer: 'street'
      })
      this.context.map.addControl(layerControl)
      this.context.layerControl = layerControl
    }

    // Geolocation control (if feature enabled)
    if (CONFIG.features?.enableGeolocation) {
      const geolocationControl = createGeolocationControl({
        position: 'topright',
        geolocationManager: this.geolocationManager
      })
      this.context.map.addControl(geolocationControl)
      this.context.geolocationControl = geolocationControl
    }

    // Reset view control (always enabled)
    const resetControl = createResetViewControl({
      position: 'topright',
      center: CONFIG.map.defaultCenter,
      zoom: CONFIG.map.defaultZoom
    })
    this.context.map.addControl(resetControl)
    this.context.resetControl = resetControl

    log('debug', 'Custom controls added')
  }

  /**
   * Add Markers to Map
   *
   * Adds markers for all filtered trainings to the map with clustering support.
   * Uses standard Leaflet markers and follows markercluster best practices.
   * Automatically fits bounds to show all markers.
   *
   * CRITICAL FIX: Prevents race conditions with zoom animations by:
   * 1. Stopping all animations before marker updates
   * 2. Deferring updates until current frame completes
   * 3. Preventing rapid successive calls
   *
   * @returns {void}
   */
  addMarkersToMap() {
    if (!this.context.map) return

    const map = this.context.map

    // CRITICAL: Stop all animations to prevent race conditions
    // This fixes the "_latLngToNewLayerPoint" null error during zoom
    map.stop()

    // CRITICAL: Defer marker update to next animation frame
    // This ensures any pending animations have fully stopped
    requestAnimationFrame(() => {
      if (!this.context.map) return // Map might have been cleaned up

      // Remove existing markers and cluster group
      if (this.context.markerClusterGroup) {
        // Stop cluster animations before removal
        this.context.markerClusterGroup.off() // Remove event listeners
        map.removeLayer(this.context.markerClusterGroup)
        this.context.markerClusterGroup = null
      }
      this.context.markers = []

      // Proceed with clustering (async dynamic import handles availability check)
      this.addMarkersWithClustering()
    })
  }

  /**
   * Add Markers With Clustering
   *
   * Internal method to add markers with clustering enabled.
   * Extracted for reuse by polling mechanism.
   *
   * CRITICAL: Ensures safe removal of existing cluster group
   * DEPLOYMENT FIX: Uses async dynamic import to guarantee plugin is loaded
   *
   * @returns {Promise<void>}
   */
  async addMarkersWithClustering() {
    if (!this.context.map) return
    const map = this.context.map

    // Remove existing markers if called again
    if (this.context.markerClusterGroup) {
      // CRITICAL: Remove event listeners before removing layer
      this.context.markerClusterGroup.off()
      map.removeLayer(this.context.markerClusterGroup)
      this.context.markerClusterGroup = null
    }
    this.context.markers = []

    // DEPLOYMENT FIX: Dynamically import leaflet.markercluster to ensure it's loaded
    // This prevents "L.MarkerClusterGroup is not a constructor" in production builds
    try {
      await import('leaflet.markercluster')
      await import('leaflet.markercluster/dist/MarkerCluster.css')
      await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
      log('debug', 'MarkerCluster plugin loaded dynamically')
    } catch (error) {
      log('error', 'Failed to load MarkerCluster plugin', error)
      this.addMarkersWithoutClustering()
      return
    }

    // Double-check that L.markerClusterGroup is now available
    if (typeof L.markerClusterGroup !== 'function') {
      log('error', 'L.markerClusterGroup still not available after dynamic import')
      this.addMarkersWithoutClustering()
      return
    }

    // Responsive cluster radius based on screen size (from map-utils)
    const clusterRadius = getOptimalClusterRadius()
    const spiderfyMultiplier = getOptimalSpiderfyMultiplier()

    // Create marker cluster group with optimized configuration
    // Based on Leaflet.markercluster best practices for 60+ markers
    const markers = L.markerClusterGroup({
      // Performance optimizations (critical for 50+ markers)
      chunkedLoading: true, // Split processing to prevent UI freeze
      chunkInterval: 200, // Time between processing intervals (ms)
      chunkDelay: 50, // Delay between chunk batches (ms)
      removeOutsideVisibleBounds: false, // Keep all markers in DOM for stable positioning

      // Clustering behavior
      maxClusterRadius: clusterRadius, // Responsive radius (60px mobile, 80px desktop)
      spiderfyOnMaxZoom: true, // Fan out overlapping markers
      showCoverageOnHover: false, // No polygon on hover (cleaner UX)
      zoomToBoundsOnClick: true, // Zoom into cluster on click
      disableClusteringAtZoom: 18, // Show individual markers at zoom 18+
      animateAddingMarkers: false, // Faster initial render (no animation)
      spiderfyDistanceMultiplier: spiderfyMultiplier, // Responsive spread (1.5x on mobile)

      // Positioning stability during zoom
      animate: true, // Smooth animations
      singleMarkerMode: false, // Always use cluster logic for consistency

      // Custom M3-styled cluster icon with dynamic sizing and colors
      iconCreateFunction: (/** @type {any} */ cluster) => {
        const count = cluster.getChildCount()

        // Dynamic size based on marker count
        let size = 50
        let fontSize = 16
        let className = 'md-map-cluster-small'

        if (count >= 100) {
          size = 70
          fontSize = 22
          className = 'md-map-cluster-xlarge'
        } else if (count >= 50) {
          size = 65
          fontSize = 20
          className = 'md-map-cluster-large'
        } else if (count >= 10) {
          size = 55
          fontSize = 18
          className = 'md-map-cluster-medium'
        }

        return L.divIcon({
          html: `<div class="md-map-cluster ${className}">
                   <span class="md-map-cluster-count" style="font-size: ${fontSize}px">${count}</span>
                 </div>`,
          className: 'md-map-cluster-wrapper',
          iconSize: L.point(size, size)
        })
      }
    })

    /** @type {L.Marker[]} */
    const markerArray = []
    /** @type {[number, number][]} */
    const bounds = []

    // Group trainings by exact location (prevents pin overwhelm)
    const locationGroups = groupTrainingsByLocation(this.context.filteredTrainings)

    // Create ONE marker per unique location
    locationGroups.forEach((trainings, locationKey) => {
      const [lat, lng] = locationKey.split(',').map(Number)
      const trainingCount = trainings.length
      const locationName = trainings[0].ort

      // Create custom icon with count badge and training type color
      const icon = this.createLocationIcon(trainingCount, trainings)

      // Create marker with custom icon
      const marker = L.marker([lat, lng], {
        icon: icon,
        title:
          trainingCount > 1
            ? `${locationName} (${trainingCount} Trainings)`
            : `${trainings[0].training} - ${locationName}`,
        alt: `Standort: ${locationName}`,
        riseOnHover: true
      })

      // Store location data in marker for easy lookup
      // @ts-expect-error - Adding custom properties to marker for data storage
      marker.locationTrainings = trainings
      // @ts-expect-error - Adding custom properties to marker for data storage
      marker.trainingId = trainings[0].id // For backward compatibility

      // Bind appropriate popup (single or multi-training)
      const popupHTML =
        trainingCount > 1 ? createLocationPopupHTML(trainings) : this.createMapPopup(trainings[0])

      marker.bindPopup(popupHTML, {
        maxWidth: trainingCount > 1 ? 450 : 400,
        className: 'md-map-popup-container',
        autoPan: false, // Disable - we handle centering manually
        autoClose: true, // Close popup on zoom to prevent race condition
        autoPanPadding: [50, 50]
      })

      // Add click handler for auto-centering
      // Leaflet automatically loads tiles for new viewport after panBy()
      // No manual invalidateSize() needed - per Leaflet best practices
      marker.on('click', e => {
        this.centerOnMarker(e.latlng, trainingCount > 1)
      })

      markerArray.push(marker)
      bounds.push([lat, lng])
    })

    // Add all markers at once (performance best practice)
    // Type assertion via unknown: Marker[] extends Layer[], but TypeScript strict mode requires this
    markers.addLayers(/** @type {import('leaflet').Layer[]} */ (/** @type {unknown} */ (markerArray)))
    this.context.markers = markerArray

    // Add cluster group to map
    map.addLayer(markers)
    this.context.markerClusterGroup = markers

    // Fit bounds to show all markers
    if (bounds.length > 0 && !this.context.userHasInteractedWithMap) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    map.once('movestart', () => {
      this.context.userHasInteractedWithMap = true
    })

    log('info', `Added ${markerArray.length} markers to map with clustering`)
  }

  /**
   * Add Markers Without Clustering (Fallback)
   *
   * Fallback method for when markercluster is not available.
   * Uses standard Leaflet markers without clustering.
   *
   * @returns {void}
   */
  addMarkersWithoutClustering() {
    if (!this.context.map) return

    const map = this.context.map
    /** @type {[number, number][]} */
    const bounds = []

    // Create standard markers for each training
    this.context.filteredTrainings.forEach(training => {
      if (!training.lat || !training.lng) return

      const marker = L.marker([training.lat, training.lng], {
        title: `${training.training} - ${training.ort}`,
        alt: `Standort: ${training.ort}`,
        riseOnHover: true
      })

      marker.bindPopup(this.createMapPopup(training), {
        maxWidth: 400,
        className: 'md-map-popup-container',
        autoPan: false, // Disable - we handle centering manually
        autoClose: true // Close popup on zoom to prevent race condition
      })

      marker.addTo(map)
      this.context.markers.push(marker)
      bounds.push([training.lat, training.lng])
    })

    if (bounds.length > 0 && !this.context.userHasInteractedWithMap) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    map.once('movestart', () => {
      this.context.userHasInteractedWithMap = true
    })

    log('info', `Added ${this.context.markers.length} markers without clustering`)
  }

  /**
   * Zoom to Favorites
   *
   * AUFGABE 5: Auto-Zoom zu Favoriten
   * Fits the map bounds to show all favorite training locations.
   * If user has no favorites or favorites have no coordinates, resets to default view.
   *
   * @returns {void}
   */
  zoomToFavorites() {
    if (!this.context.map) {
      log('warn', 'Map not initialized - cannot zoom to favorites')
      return
    }

    // Get favorite trainings with valid coordinates
    const favoriteTrainings = this.context.allTrainings.filter(
      t => this.context.favorites.includes(t.id) && t.lat && t.lng
    )

    if (favoriteTrainings.length === 0) {
      log('info', 'No favorites with coordinates found')
      this.announceToScreenReader('Keine Favoriten mit Standorten gefunden')
      // Reset to default view
      this.context.map.setView(
        /** @type {[number, number]} */ (CONFIG.map.defaultCenter),
        CONFIG.map.defaultZoom,
        {
          animate: true,
          duration: 1
        }
      )
      return
    }

    // Collect bounds for all favorite locations
    /** @type {[number, number][]} */
    const bounds = favoriteTrainings.map(t => [t.lat, t.lng])

    // Fit bounds with padding
    this.context.map.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 15, // Don't zoom in too close if favorites are nearby
      animate: true,
      duration: 1.2
    })

    // Mark user has interacted to prevent auto-fitting
    this.context.userHasInteractedWithMap = true

    // Announce to screen reader
    const count = favoriteTrainings.length
    this.announceToScreenReader(`Karte zeigt ${count} Favoriten-Standort${count > 1 ? 'e' : ''}`)

    log('info', `Zoomed to ${count} favorite locations`)
  }

  /**
   * Zoom and Center on Specific Training
   *
   * Switches to map view, zooms to training location, and opens its popup.
   * Perfect for "show on map" buttons in training cards.
   *
   * @param {number} trainingId - Training ID to zoom to
   * @returns {void}
   */
  zoomToTraining(trainingId) {
    // Find the training
    const training = this.context.allTrainings.find(t => t.id === trainingId)
    if (!training || !training.lat || !training.lng) {
      log('warn', `Training ${trainingId} not found or has no coordinates`)
      return
    }

    // Switch to map view if not already there
    if (this.context.$store.ui.activeView !== 'map') {
      this.context.$store.ui.activeView = 'map'
    }

    // Wait for map to initialize
    this.context.$nextTick(() => {
      if (!this.context.map) {
        this.initializeMap()
      }

      // Wait one more tick for markers to be added
      this.context.$nextTick(() => {
        const map = this.context.map
        if (!map) return

        // Find the marker for this training
        // @ts-expect-error - Custom trainingId property added to markers
        const marker = this.context.markers.find(m => m.trainingId === trainingId)

        if (marker) {
          // Smooth zoom with custom easing
          const currentZoom = map.getZoom()
          const targetZoom = 17
          const zoomDiff = Math.abs(targetZoom - currentZoom)

          // Calculate duration based on zoom difference (longer for bigger jumps)
          const duration = Math.min(1.5, 0.5 + zoomDiff * 0.1)

          // Zoom to marker location with smooth animation
          map.flyTo([training.lat, training.lng], targetZoom, {
            duration: duration,
            easeLinearity: 0.2, // Less linear = more ease
            animate: true
          })

          // Add visual feedback during zoom
          this._addZoomHighlight([training.lat, training.lng])

          // Open the marker's popup after zoom animation
          setTimeout(
            () => {
              marker.openPopup()
              this.announceToScreenReader(`Zu ${training.training} in ${training.ort} gezoomt`)
            },
            duration * 1000 + 100
          )

          log('info', `Zoomed to training ${trainingId} at ${training.ort}`)
        } else {
          // Fallback: just center on coordinates
          map.flyTo([training.lat, training.lng], 17, {
            duration: 1,
            easeLinearity: 0.2,
            animate: true
          })
          log('warn', `Marker for training ${trainingId} not found, centered on coordinates`)
        }

        // Mark as user-interacted to prevent auto-fitting
        this.context.userHasInteractedWithMap = true
      })
    })
  }

  /**
   * Create Location Icon
   *
   * AUFGABE 15: Enhanced Map Split-View - Custom Marker Icons
   * Creates custom colored marker icons based on training type.
   * Uses semantic colors from training-colors.css (WCAG AAA compliant).
   *
   * @param {number} count - Number of trainings at this location
   * @param {Training[]} trainings - Array of trainings at this location
   * @returns {L.DivIcon} Custom Leaflet icon
   */
  createLocationIcon(count, trainings = []) {
    // Determine primary training type (for color)
    const primaryTraining = trainings[0]
    const trainingType = primaryTraining?.training?.toLowerCase() || 'fam'

    // Map training types to colors (WCAG AAA compliant colors)
    const colorMap = {
      parkour: '#0d47a1', // Blue 900
      trampolin: '#194d1b', // Green 900
      tricking: '#4a148c', // Purple 900
      movement: '#8d2600', // Deep Orange 900
      fam: '#880e4f' // Pink 900
    }

    // Find matching color (fuzzy match for variants like "Parkour Training")
    let markerColor = colorMap.fam // Default to FAM pink
    for (const [type, color] of Object.entries(colorMap)) {
      if (trainingType.includes(type)) {
        markerColor = color
        break
      }
    }

    // Custom colored pin with optional count badge
    const size = count > 1 ? Math.min(50, 35 + count * 2) : 40
    const fontSize = Math.min(18, 12 + count * 0.5)
    const showBadge = count > 1

    return L.divIcon({
      html: `
        <div class="md-location-marker">
          <div class="md-location-pin">
            <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Pin shadow -->
              <ellipse cx="18" cy="46" rx="8" ry="2" fill="rgba(0,0,0,0.2)"/>
              <!-- Pin body with training type color -->
              <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 30 18 30s18-16.5 18-30c0-9.941-8.059-18-18-18z"
                    fill="${markerColor}"/>
              <!-- Pin center circle -->
              <circle cx="18" cy="18" r="10" fill="white"/>
              <!-- Training type initial/icon -->
              <text x="18" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="${markerColor}">
                ${trainingType.charAt(0).toUpperCase()}
              </text>
            </svg>
          </div>
          ${
            showBadge
              ? `<div class="md-location-badge" style="font-size: ${fontSize}px; background-color: ${markerColor};">${count}</div>`
              : ''
          }
        </div>
      `,
      className: 'md-location-marker-wrapper',
      iconSize: [size, size + 12],
      iconAnchor: [size / 2, size + 12],
      popupAnchor: [0, -(size + 12)]
    })
  }

  /**
   * Center Map on Marker
   *
   * Pans the map to center on the clicked marker with proper offset for popup visibility.
   * Uses Leaflet's panBy() which automatically loads tiles for the new viewport.
   *
   * IMPORTANT: No invalidateSize() needed after panBy() - Leaflet handles tile loading
   * automatically. invalidateSize() should ONLY be used when container dimensions change,
   * NOT for pan/zoom operations (per Leaflet documentation).
   *
   * Reference: https://leafletjs.com/reference.html#map-panby
   *
   * @param {L.LatLng} latlng - Marker coordinates
   * @param {boolean} _isMultiTraining - Whether location has multiple trainings (for future use)
   * @returns {void}
   */
  centerOnMarker(latlng, _isMultiTraining = false) {
    if (!this.context.map) return

    const map = this.context.map
    const viewportHeight = map.getSize().y
    const viewportWidth = map.getSize().x

    // Position marker in lower part of screen to give popup room at top
    // Note: Multi-training popups are taller and would need more offset if we used it
    // const verticalOffset = isMultiTraining ? 100 : 80

    // Target position: horizontally centered, vertically at 70% from top
    const targetX = viewportWidth / 2
    const targetY = viewportHeight * 0.7

    // Get current marker position in pixels
    const markerPoint = map.latLngToContainerPoint(latlng)

    // Calculate how much to pan
    const panX = markerPoint.x - targetX
    const panY = markerPoint.y - targetY

    // Pan by the offset
    map.panBy([panX, panY], {
      animate: true,
      duration: 0.5,
      easeLinearity: 0.25
    })

    log('debug', `Centered on marker at ${latlng.lat}, ${latlng.lng}`)
  }

  /**
   * Create Map Popup HTML
   *
   * Generates M3-styled HTML content for marker popup.
   * Delegates to utility function in map-utils.js.
   *
   * @param {Training} training - Training object
   * @returns {string} HTML string for popup
   */
  createMapPopup(training) {
    return createMapPopupHTML(training, utils)
  }

  /**
   * Add Zoom Highlight
   *
   * Adds a temporary visual highlight when zooming to a location.
   * Creates a pulsing circle that fades out after animation.
   *
   * @private
   * @param {[number, number]} latlng - Target coordinates
   * @returns {void}
   */
  _addZoomHighlight(latlng) {
    if (!this.context.map) return

    // Create temporary circle marker for visual feedback
    const highlight = L.circleMarker(latlng, {
      radius: 50,
      fillColor: 'var(--color-primary-500)',
      color: 'var(--color-primary-600)',
      weight: 2,
      opacity: 0.6,
      fillOpacity: 0.2,
      className: 'zoom-highlight'
    }).addTo(this.context.map)

    // Animate and remove
    let radius = 50
    let opacity = 0.6
    const interval = setInterval(() => {
      radius += 5
      opacity -= 0.05

      if (opacity <= 0) {
        clearInterval(interval)
        if (this.context.map) {
          this.context.map.removeLayer(highlight)
        }
      } else {
        highlight.setRadius(radius)
        highlight.setStyle({ opacity: opacity, fillOpacity: opacity * 0.3 })
      }
    }, 50)
  }

  /**
   * Add User Location Marker to Map
   *
   * Adds a blue pulsing marker at the user's location.
   * Called after successful geolocation or when manual location is loaded.
   *
   * CRITICAL FIX: Removes BOTH possible user location markers:
   * 1. MapManager's marker (this.context.userLocationMarker)
   * 2. GeolocationControl's marker (this.context.geolocationControl._userMarker)
   *
   * This prevents duplicate markers when switching between GPS and manual location.
   *
   * @param {[number, number]} latlng - User coordinates [lat, lng]
   * @returns {void}
   */
  addUserLocationMarker(latlng) {
    if (!this.context.map) return

    // Remove existing MapManager user marker if present
    if (this.context.userLocationMarker) {
      this.context.map.removeLayer(this.context.userLocationMarker)
      this.context.userLocationMarker = null
    }

    // CRITICAL FIX: Remove GeolocationControl's user marker if it exists
    // GeolocationControl stores marker in control._userMarker
    if (this.context.geolocationControl && this.context.geolocationControl._userMarker) {
      this.context.map.removeLayer(this.context.geolocationControl._userMarker)
      this.context.geolocationControl._userMarker = null
    }

    // Create custom user location marker with pulsing blue dot
    this.context.userLocationMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'md-user-location-marker',
        html: '<div class="pulse"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      title: 'Mein Standort',
      zIndexOffset: 1000 // Ensure user marker appears above training markers
    })

    this.context.userLocationMarker.addTo(this.context.map)
    log('info', 'User location marker added to map', latlng)
  }

  /**
   * Cleanup Map
   *
   * Properly destroys map instance and prevents memory leaks.
   * Based on Leaflet best practices for memory management.
   * Should be called when map modal is closed.
   *
   * @returns {void}
   */
  cleanupMap() {
    if (!this.context.map) return

    const map = this.context.map

    try {
      // CRITICAL: Stop all animations before cleanup to prevent race conditions
      map.stop()

      // 1. Remove all event listeners to prevent memory leaks
      map.off() // Remove ALL event listeners

      // 2. Remove tile layer and its event listeners
      if (this.context.tileLayer) {
        this.context.tileLayer.off() // Remove tile layer events
        map.removeLayer(this.context.tileLayer)
        this.context.tileLayer = null
      }

      // 3. Clean up cluster group
      if (this.context.markerClusterGroup) {
        this.context.markerClusterGroup.off() // Remove cluster events
        map.removeLayer(this.context.markerClusterGroup)
        this.context.markerClusterGroup.clearLayers() // Clear all markers
        this.context.markerClusterGroup = null
      }

      // 4. Remove and unbind individual markers
      this.context.markers.forEach(marker => {
        marker.off() // Remove marker events
        marker.unbindPopup() // Remove popup binding
        // @ts-expect-error - Marker extends Layer but TypeScript needs explicit cast
        map.removeLayer(marker)
        // Break circular reference
        // @ts-expect-error - Custom trainingId property cleanup
        marker.trainingId = null
      })
      this.context.markers = []

      // 5. Remove ARIA live region
      if (this.context.ariaLiveRegion) {
        this.context.ariaLiveRegion.remove()
        this.context.ariaLiveRegion = null
      }

      // 6. Remove custom controls
      if (this.context.layerControl) {
        map.removeControl(this.context.layerControl)
        this.context.layerControl = null
      }
      if (this.context.geolocationControl) {
        map.removeControl(this.context.geolocationControl)
        this.context.geolocationControl = null
      }
      if (this.context.resetControl) {
        map.removeControl(this.context.resetControl)
        this.context.resetControl = null
      }

      // 6a. Clean up tile layers
      if (this.context.tileLayers) {
        Object.values(this.context.tileLayers).forEach(layer => {
          layer.off()
          if (map.hasLayer(layer)) {
            map.removeLayer(layer)
          }
        })
        this.context.tileLayers = null
      }

      // 7. Remove all layers (safety net)
      map.eachLayer(layer => {
        layer.off()
        map.removeLayer(layer)
      })

      // 8. Destroy map instance (triggers internal cleanup)
      map.remove()

      // 9. Clear references
      this.context.map = null
      this.context.userHasInteractedWithMap = false

      log('info', 'Map cleaned up successfully')
    } catch (error) {
      log('error', 'Map cleanup error', error)
    }
  }

  /**
   * Save Map State to localStorage
   *
   * Persists current zoom and center for next visit.
   * Called automatically on moveend event.
   *
   * @returns {void}
   */
  saveMapState() {
    if (!this.context.map) return

    try {
      const center = this.context.map.getCenter()
      const zoom = this.context.map.getZoom()

      const state = {
        center: [center.lat, center.lng],
        zoom: zoom,
        timestamp: Date.now()
      }

      localStorage.setItem('fam_map_state', JSON.stringify(state))
      log('debug', 'Map state saved', state)
    } catch (error) {
      log('warn', 'Failed to save map state', error)
    }
  }

  /**
   * Load Map State from localStorage
   *
   * Restores saved zoom and center from previous visit.
   * Returns null if no saved state or state is expired (> 7 days).
   *
   * @returns {{center: [number, number], zoom: number} | null}
   */
  loadMapState() {
    try {
      const saved = localStorage.getItem('fam_map_state')
      if (!saved) return null

      const state = JSON.parse(saved)

      // Expire after 7 days
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
      if (Date.now() - state.timestamp > maxAge) {
        localStorage.removeItem('fam_map_state')
        return null
      }

      // Validate coordinates
      const [lat, lng] = state.center
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return null
      }

      log('debug', 'Map state loaded', state)
      return { center: state.center, zoom: state.zoom }
    } catch (error) {
      log('warn', 'Failed to load map state', error)
      return null
    }
  }
}
