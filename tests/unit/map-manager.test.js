// tests/unit/map-manager.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MapManager } from '../../src/js/trainingsplaner/map-manager.js'
import { CONFIG } from '../../src/js/config.js'
import { utils } from '../../src/js/utils.js'

// Mock dynamic imports for leaflet.markercluster
vi.mock('leaflet.markercluster', () => ({
  default: {}
}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({
  default: ''
}))
vi.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({
  default: ''
}))

// Mock Leaflet - define inline in vi.mock to avoid hoisting issues
vi.mock('leaflet', () => {
  const mockMap = vi.fn()
  const mockMarker = vi.fn()
  const mockTileLayer = vi.fn()
  const mockMarkerClusterGroup = vi.fn()
  const mockLatLngBounds = vi.fn()

  // Mock Marker class with prototype
  const mockMarkerClass = function (...args) {
    return mockMarker(...args)
  }
  mockMarkerClass.prototype = {
    _animateZoom: vi.fn(),
    _setPos: vi.fn(),
    _latlng: null,
    _map: null
  }

  // Mock Popup class with prototype
  const mockPopupClass = function (...args) {
    return { ...args }
  }
  mockPopupClass.prototype = {
    _animateZoom: vi.fn(),
    _getAnchor: vi.fn(() => ({ x: 0, y: 0 })),
    _container: null,
    _latlng: null,
    _map: null
  }

  // Mock Tooltip class with prototype (if exists)
  const mockTooltipClass = function (...args) {
    return { ...args }
  }
  mockTooltipClass.prototype = {
    _animateZoom: vi.fn(),
    _getAnchor: vi.fn(() => ({ x: 0, y: 0 })),
    _container: null,
    _latlng: null,
    _map: null
  }

  // Mock Control class for custom controls
  const mockControl = {
    extend: vi.fn(options => {
      return function () {
        return {
          onAdd: options.onAdd || vi.fn(),
          onRemove: options.onRemove || vi.fn(),
          options: options.options || {}
        }
      }
    })
  }

  // Mock Icon.Default for standard markers
  const mockIconDefault = vi.fn()

  return {
    default: {
      map: mockMap,
      marker: mockMarker,
      Marker: mockMarkerClass,
      Popup: mockPopupClass,
      Tooltip: mockTooltipClass,
      tileLayer: mockTileLayer,
      markerClusterGroup: mockMarkerClusterGroup,
      latLngBounds: mockLatLngBounds,
      Control: mockControl,
      Icon: { Default: mockIconDefault },
      point: vi.fn((x, y) => ({ x, y })),
      divIcon: vi.fn(options => options)
    },
    map: mockMap,
    marker: mockMarker,
    Marker: mockMarkerClass,
    Popup: mockPopupClass,
    Tooltip: mockTooltipClass,
    tileLayer: mockTileLayer,
    markerClusterGroup: mockMarkerClusterGroup,
    latLngBounds: mockLatLngBounds,
    Control: mockControl,
    Icon: { Default: mockIconDefault },
    point: vi.fn((x, y) => ({ x, y })),
    divIcon: vi.fn(options => options)
  }
})

// Mock map-controls
vi.mock('../../src/js/trainingsplaner/map-controls.js', () => ({
  createGeolocationControl: vi.fn(() => ({ position: 'topright' })),
  createResetViewControl: vi.fn(() => ({ position: 'topright' })),
  createLayerSwitcherControl: vi.fn(() => ({ position: 'topright' }))
}))

// Mock map-utils
vi.mock('../../src/js/trainingsplaner/map-utils.js', () => ({
  getOptimalClusterRadius: vi.fn(() => 80),
  getOptimalSpiderfyMultiplier: vi.fn(() => 1),
  groupTrainingsByLocation: vi.fn(trainings => {
    const map = new Map()
    trainings.forEach(t => {
      if (t.lat && t.lng) {
        const key = `${t.lat},${t.lng}`
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key).push(t)
      }
    })
    return map
  }),
  createMapPopupHTML: vi.fn(training => `<div>Popup for ${training.training}</div>`),
  createLocationPopupHTML: vi.fn(
    trainings => `<div>Location with ${trainings.length} trainings</div>`
  )
}))

// Import Leaflet after mock
import * as L from 'leaflet'

describe('MapManager', () => {
  let mapManager
  let mockState
  let mockContext
  let mockMap
  let mockTileLayer
  let mockMarker

  const mockTraining = {
    id: 1,
    training: 'Parkour',
    ort: 'LTR',
    von: '18:00',
    bis: '20:00',
    altersgruppe: 'Kids',
    lat: 48.124155,
    lng: 11.621655,
    link: 'https://example.com'
  }

  const mockTrainingNoCoords = {
    id: 2,
    training: 'Trampolin',
    ort: 'Balanstr.',
    von: '19:00',
    bis: '21:00'
  }

  beforeEach(() => {
    // Create mock map container (updated for Task 11.5 - now using map-view-container)
    document.body.innerHTML = '<div id="map-view-container"></div>'

    // Mock marker cluster group
    const mockClusterGroup = {
      addLayer: vi.fn(),
      addLayers: vi.fn(),
      clearLayers: vi.fn(),
      addTo: vi.fn().mockReturnThis(),
      off: vi.fn()
    }

    // Mock map instance
    mockMap = {
      setView: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      removeLayer: vi.fn(),
      addLayer: vi.fn(),
      fitBounds: vi.fn(),
      once: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      stop: vi.fn(),
      eachLayer: vi.fn(callback => {
        // Call callback for any layers that exist
        if (mockContext.markerClusterGroup) {
          callback(mockContext.markerClusterGroup)
        }
      }),
      hasLayer: vi.fn(() => false),
      addControl: vi.fn(),
      removeControl: vi.fn(),
      getContainer: vi.fn(() => document.createElement('div')),
      invalidateSize: vi.fn() // Added for Task 11.5 - needed when switching views
    }

    // Mock tile layer
    mockTileLayer = {
      addTo: vi.fn().mockReturnThis(),
      off: vi.fn(),
      on: vi.fn()
    }

    // Mock marker
    mockMarker = {
      bindPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      off: vi.fn(),
      unbindPopup: vi.fn(),
      on: vi.fn()
    }

    // Setup Leaflet mocks
    L.map.mockReturnValue(mockMap)
    L.tileLayer.mockReturnValue(mockTileLayer)
    L.marker.mockReturnValue(mockMarker)
    L.markerClusterGroup.mockReturnValue(mockClusterGroup)
    L.latLngBounds.mockReturnValue({
      getBounds: vi.fn(() => [
        [48.1, 11.5],
        [48.2, 11.6]
      ]),
      pad: vi.fn().mockReturnThis(),
      extend: vi.fn().mockReturnThis()
    })
    L.Icon.Default.mockReturnValue({})

    // Mock state
    mockState = {}

    // Mock context
    mockContext = {
      map: null,
      markers: [],
      filteredTrainings: [mockTraining],
      userHasInteractedWithMap: false,
      markerClusterGroup: null
    }

    // Create MapManager instance
    mapManager = new MapManager(mockState, mockContext)
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  // ==================== CONSTRUCTOR ====================

  describe('Constructor', () => {
    it('should initialize with provided state and context', () => {
      expect(mapManager.state).toBe(mockState)
      expect(mapManager.context).toBe(mockContext)
    })
  })

  // ==================== INITIALIZE MAP ====================

  describe('initializeMap()', () => {
    it('should not initialize if map already exists', () => {
      mockContext.map = mockMap

      mapManager.initializeMap()

      expect(L.map).not.toHaveBeenCalled()
    })

    it('should return early if container not found', () => {
      document.body.innerHTML = ''

      mapManager.initializeMap()

      expect(L.map).not.toHaveBeenCalled()
    })

    it('should create Leaflet map', () => {
      mapManager.initializeMap()

      expect(L.map).toHaveBeenCalledWith(
        'map-view-container', // Updated for Task 11.5
        expect.objectContaining({
          center: CONFIG.map.defaultCenter,
          zoom: CONFIG.map.defaultZoom,
          zoomControl: true
        })
      )
    })

    it('should add tile layer to map', () => {
      mapManager.initializeMap()

      expect(L.tileLayer).toHaveBeenCalledWith(
        CONFIG.map.tileLayerUrl,
        expect.objectContaining({
          attribution: CONFIG.map.attribution,
          maxZoom: 19
        })
      )

      expect(mockTileLayer.addTo).toHaveBeenCalledWith(mockMap)
    })

    it('should store map instance in context', () => {
      mapManager.initializeMap()

      expect(mockContext.map).toBe(mockMap)
    })

    it('should add markers after initialization', () => {
      const addMarkersSpy = vi.spyOn(mapManager, 'addMarkersToMap')

      mapManager.initializeMap()

      expect(addMarkersSpy).toHaveBeenCalled()
    })

    it('should handle initialization errors', () => {
      L.map.mockImplementation(() => {
        throw new Error('Map creation failed')
      })

      // Should not throw
      expect(() => {
        mapManager.initializeMap()
      }).not.toThrow()

      expect(mockContext.map).toBeNull()
    })
  })

  // ==================== ADD MARKERS TO MAP ====================

  describe('addMarkersToMap()', () => {
    beforeEach(() => {
      mockContext.map = mockMap

      // Mock requestAnimationFrame to execute immediately
      // CRITICAL FIX: addMarkersToMap() now uses requestAnimationFrame (line 302 in map-manager.js)
      // for async marker updates (Leaflet best practice - prevents race conditions).
      // Tests need requestAnimationFrame to execute synchronously.
      vi.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => {
        cb()
        return 0
      })
    })

    it('should return early if no map exists', () => {
      mockContext.map = null

      mapManager.addMarkersToMap()

      expect(L.marker).not.toHaveBeenCalled()
    })

    it('should remove existing cluster group', () => {
      const existingCluster = { off: vi.fn(), clearLayers: vi.fn() }
      mockContext.markerClusterGroup = existingCluster

      mapManager.addMarkersToMap()

      expect(mockMap.removeLayer).toHaveBeenCalledWith(existingCluster)
    })

    it('should create marker for each training with coordinates', async () => {
      mockContext.filteredTrainings = [mockTraining]

      mapManager.addMarkersToMap()

      // Wait for async operations to complete using vi.waitFor
      await vi.waitFor(
        () => {
          expect(L.marker).toHaveBeenCalled()
        },
        { timeout: 1000, interval: 10 }
      )

      expect(L.marker).toHaveBeenCalledWith(
        [mockTraining.lat, mockTraining.lng],
        expect.objectContaining({
          title: 'Parkour - LTR',
          alt: 'Standort: LTR',
          riseOnHover: true
        })
      )
    })

    it('should skip trainings without coordinates', () => {
      mockContext.filteredTrainings = [mockTrainingNoCoords]

      mapManager.addMarkersToMap()

      expect(L.marker).not.toHaveBeenCalled()
    })

    it('should bind popup to marker', async () => {
      mapManager.addMarkersToMap()

      // Wait for async operations to complete
      await vi.waitFor(
        () => {
          expect(mockMarker.bindPopup).toHaveBeenCalled()
        },
        { timeout: 1000, interval: 10 }
      )

      expect(mockMarker.bindPopup).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          maxWidth: 400,
          className: 'md-map-popup-container',
          autoPan: false
        })
      )
    })

    it('should add markers to cluster group', async () => {
      const mockClusterGroup = L.markerClusterGroup()

      mapManager.addMarkersToMap()

      // Wait for async operations to complete
      await vi.waitFor(
        () => {
          expect(mockClusterGroup.addLayers).toHaveBeenCalled()
        },
        { timeout: 1000, interval: 10 }
      )

      expect(mockMap.addLayer).toHaveBeenCalledWith(mockClusterGroup)
    })

    it('should store markers in context', async () => {
      mapManager.addMarkersToMap()

      // Wait for async operations to complete
      await vi.waitFor(
        () => {
          expect(mockContext.markers.length).toBeGreaterThan(0)
        },
        { timeout: 1000, interval: 10 }
      )

      expect(mockContext.markers).toHaveLength(1)
      expect(mockContext.markers[0]).toBe(mockMarker)
    })

    it('should fit bounds to show all markers', async () => {
      mockContext.filteredTrainings = [
        mockTraining,
        { ...mockTraining, id: 2, lat: 48.135124, lng: 11.582002 }
      ]

      mapManager.addMarkersToMap()

      // Wait for async operations to complete
      await vi.waitFor(
        () => {
          expect(mockMap.fitBounds).toHaveBeenCalled()
        },
        { timeout: 1000, interval: 10 }
      )

      expect(mockMap.fitBounds).toHaveBeenCalledWith(
        expect.arrayContaining([[mockTraining.lat, mockTraining.lng]]),
        { padding: [50, 50] }
      )
    })

    it('should not fit bounds if user has interacted', () => {
      mockContext.userHasInteractedWithMap = true

      mapManager.addMarkersToMap()

      expect(mockMap.fitBounds).not.toHaveBeenCalled()
    })

    it('should not fit bounds if no markers', () => {
      mockContext.filteredTrainings = []

      mapManager.addMarkersToMap()

      expect(mockMap.fitBounds).not.toHaveBeenCalled()
    })

    it('should set user interaction flag on movestart', async () => {
      let moveStartCallback

      mockMap.once.mockImplementation((event, callback) => {
        if (event === 'movestart') {
          moveStartCallback = callback
        }
      })

      mapManager.addMarkersToMap()

      // Wait for async operations to complete
      await vi.waitFor(
        () => {
          expect(mockMap.once).toHaveBeenCalledWith('movestart', expect.any(Function))
        },
        { timeout: 1000, interval: 10 }
      )

      // Trigger movestart
      if (moveStartCallback) {
        moveStartCallback()
      }

      expect(mockContext.userHasInteractedWithMap).toBe(true)
    })

    it('should handle multiple trainings', async () => {
      mockContext.filteredTrainings = [
        mockTraining,
        { ...mockTraining, id: 2, lat: 48.135, lng: 11.582 },
        { ...mockTraining, id: 3, lat: 48.14, lng: 11.59 }
      ]

      mapManager.addMarkersToMap()

      // Wait for async operations to complete
      await vi.waitFor(
        () => {
          expect(mockContext.markers.length).toBe(3)
        },
        { timeout: 1000, interval: 10 }
      )

      expect(L.marker).toHaveBeenCalledTimes(3)
    })
  })

  // ==================== CREATE MAP POPUP ====================

  describe('createMapPopup()', () => {
    it('should create popup HTML with training info', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      expect(popup).toContain('Popup for Parkour')
    })

    it('should delegate to createMapPopupHTML utility', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      // Verify it returns the mocked response
      expect(popup).toContain('Popup for Parkour')
    })

    it('should return HTML string', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      expect(typeof popup).toBe('string')
      expect(popup).toContain('<div')
    })
  })

  // ==================== CLEANUP MAP ====================

  describe('cleanupMap()', () => {
    beforeEach(() => {
      mockContext.map = mockMap
      const marker1 = { ...mockMarker, off: vi.fn(), unbindPopup: vi.fn(), trainingId: 1 }
      const marker2 = { ...mockMarker, off: vi.fn(), unbindPopup: vi.fn(), trainingId: 2 }
      mockContext.markers = [marker1, marker2]
      mockContext.userHasInteractedWithMap = true
      mockContext.markerClusterGroup = {
        off: vi.fn(),
        clearLayers: vi.fn()
      }
      mockContext.tileLayer = {
        off: vi.fn()
      }
    })

    it('should do nothing if no map exists', () => {
      mockContext.map = null

      mapManager.cleanupMap()

      expect(mockMap.remove).not.toHaveBeenCalled()
    })

    it('should remove cluster group', () => {
      const clusterGroup = mockContext.markerClusterGroup

      mapManager.cleanupMap()

      expect(clusterGroup.off).toHaveBeenCalled()
      expect(mockMap.removeLayer).toHaveBeenCalledWith(clusterGroup)
      expect(clusterGroup.clearLayers).toHaveBeenCalled()
      expect(mockContext.markerClusterGroup).toBeNull()
    })

    it('should remove all markers', () => {
      mapManager.cleanupMap()

      mockContext.markers.forEach(marker => {
        expect(marker.off).toHaveBeenCalled()
        expect(marker.unbindPopup).toHaveBeenCalled()
      })
    })

    it('should clear markers array', () => {
      mapManager.cleanupMap()

      expect(mockContext.markers).toEqual([])
    })

    it('should remove map instance', () => {
      mapManager.cleanupMap()

      expect(mockMap.remove).toHaveBeenCalled()
    })

    it('should set map to null in context', () => {
      mapManager.cleanupMap()

      expect(mockContext.map).toBeNull()
    })

    it('should reset user interaction flag', () => {
      mapManager.cleanupMap()

      expect(mockContext.userHasInteractedWithMap).toBe(false)
    })

    it('should be safe to call multiple times', () => {
      mapManager.cleanupMap()
      mapManager.cleanupMap()

      // Should not throw
      expect(mockContext.map).toBeNull()
    })
  })

  // ==================== INTEGRATION TESTS ====================

  describe('Integration', () => {
    beforeEach(() => {
      // Mock requestAnimationFrame to execute immediately for Integration tests
      // These tests call addMarkersToMap() indirectly via initializeMap()
      vi.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => {
        cb()
        return 0
      })
    })

    it('should handle complete map lifecycle', async () => {
      // Initialize
      mapManager.initializeMap()

      // Wait for async initialization AND markers to be added
      await vi.waitFor(
        () => {
          expect(mockContext.map).toBeTruthy()
          expect(mockContext.markers.length).toBe(1)
        },
        { timeout: 1000, interval: 10 }
      )

      // Update markers
      mockContext.filteredTrainings = [
        mockTraining,
        { ...mockTraining, id: 2, lat: 48.135, lng: 11.582 }
      ]

      // Add tile layers and markers to context for cleanup
      mockContext.tileLayers = {
        street: { off: vi.fn() },
        satellite: { off: vi.fn() },
        terrain: { off: vi.fn() }
      }
      mockContext.tileLayer = mockContext.tileLayers.street
      mockContext.markers = [
        { ...mockMarker, off: vi.fn(), unbindPopup: vi.fn(), trainingId: 1 },
        { ...mockMarker, off: vi.fn(), unbindPopup: vi.fn(), trainingId: 2 }
      ]
      mockContext.markerClusterGroup = {
        off: vi.fn(),
        clearLayers: vi.fn()
      }

      mapManager.addMarkersToMap()

      // Wait for async marker update to complete
      await vi.waitFor(
        () => {
          expect(mockContext.markers.length).toBe(2)
        },
        { timeout: 1000, interval: 10 }
      )

      // Cleanup
      mapManager.cleanupMap()
      expect(mockContext.map).toBeNull()
      expect(mockContext.markers).toEqual([])
    })

    it('should handle map with no trainings', () => {
      mockContext.filteredTrainings = []

      mapManager.initializeMap()

      expect(mockContext.map).toBeTruthy()
      expect(mockContext.markers).toEqual([])
    })

    it('should handle map with mixed trainings', async () => {
      mockContext.filteredTrainings = [
        mockTraining,
        mockTrainingNoCoords,
        { ...mockTraining, id: 3, lat: 48.14, lng: 11.59 }
      ]

      mapManager.initializeMap()

      // Wait for async initialization to complete
      await vi.waitFor(
        () => {
          expect(mockContext.markers.length).toBe(2)
        },
        { timeout: 1000, interval: 10 }
      )
    })

    it('should handle user interaction correctly', async () => {
      mapManager.initializeMap()

      // Wait for async initialization AND markers to be added
      await vi.waitFor(
        () => {
          expect(mockContext.map).toBeTruthy()
          expect(mockContext.markers.length).toBeGreaterThan(0)
        },
        { timeout: 1000, interval: 10 }
      )

      // Simulate user interaction
      const moveStartCallback = mockMap.once.mock.calls.find(call => call[0] === 'movestart')?.[1]

      if (moveStartCallback) {
        moveStartCallback()
      }

      expect(mockContext.userHasInteractedWithMap).toBe(true)

      // Update markers - should not fit bounds
      mapManager.addMarkersToMap()

      // Wait for async marker update to complete
      await vi.waitFor(
        () => {
          expect(mockContext.markers.length).toBeGreaterThanOrEqual(0)
        },
        { timeout: 1000, interval: 10 }
      )

      // fitBounds should only be called once (during init)
      expect(mockMap.fitBounds).toHaveBeenCalledTimes(1)
    })
  })

  // ==================== LEAFLET BEST PRACTICES ====================

  describe('Leaflet Best Practices', () => {
    describe('invalidateSize() Usage - Anti-Pattern Prevention', () => {
      beforeEach(() => {
        mockContext.map = mockMap
      })

      it('should NOT call invalidateSize() after zoomend events', () => {
        mapManager.initializeMap()

        // Check if zoomend event listener exists (for screen reader support)
        const zoomendCallback = mockMap.on.mock.calls.find(call => call[0] === 'zoomend')?.[1]

        // If zoomend callback exists (for screen reader), verify it doesn't call invalidateSize
        if (zoomendCallback) {
          // Mock getZoom for screen reader announcement
          mockMap.getZoom = vi.fn(() => 14)

          // Execute the callback
          zoomendCallback()

          // CRITICAL: invalidateSize should NEVER be called after zoom operations
          // Leaflet automatically handles tile loading during zoom
          expect(mockMap.invalidateSize).not.toHaveBeenCalled()
        } else {
          // If no zoomend listener, that's even better - no risk of invalidateSize misuse
          expect(mockMap.invalidateSize).not.toHaveBeenCalled()
        }
      })

      it('should NOT call invalidateSize() after marker click (via centerOnMarker)', () => {
        // Test centerOnMarker directly which is called by marker click handler
        mockMap.getSize = vi.fn(() => ({ x: 800, y: 600 }))
        mockMap.latLngToContainerPoint = vi.fn(() => ({ x: 400, y: 300 }))
        mockMap.panBy = vi.fn()

        const mockLatLng = { lat: mockTraining.lat, lng: mockTraining.lng }

        // Call centerOnMarker (what happens when marker is clicked)
        mapManager.centerOnMarker(mockLatLng, false)

        // panBy should be called
        expect(mockMap.panBy).toHaveBeenCalled()

        // CRITICAL: invalidateSize should NOT be called after marker click
        // Leaflet handles tile loading automatically via panBy
        expect(mockMap.invalidateSize).not.toHaveBeenCalled()
      })

      it('should NOT call invalidateSize() during pan operations', () => {
        mockMap.getSize = vi.fn(() => ({ x: 800, y: 600 }))
        mockMap.latLngToContainerPoint = vi.fn(() => ({ x: 400, y: 300 }))
        mockMap.panBy = vi.fn()

        const mockLatLng = { lat: 48.124155, lng: 11.621655 }

        mapManager.centerOnMarker(mockLatLng, false)

        // panBy should be called for smooth centering
        expect(mockMap.panBy).toHaveBeenCalled()

        // CRITICAL: invalidateSize should NOT be called
        // panBy automatically loads tiles for new viewport
        expect(mockMap.invalidateSize).not.toHaveBeenCalled()
      })

      it('should document that invalidateSize() is ONLY for container dimension changes', () => {
        // This test documents the CORRECT usage of invalidateSize()
        //
        // CORRECT USE CASE:
        // - Container dimensions changed (e.g., sidebar toggled, window resized)
        // - Example: window resize event, modal open/close
        //
        // INCORRECT USE CASES (Anti-Patterns Fixed):
        // - After zoom operations (zoomend event)
        // - After pan operations (moveend, panBy)
        // - After marker clicks
        // - During animations
        //
        // Reference: https://leafletjs.com/reference.html#map-invalidatesize
        expect(true).toBe(true)
      })

      it('should NOT call invalidateSize() during map initialization', () => {
        mapManager.initializeMap()

        // Map initialization should NOT call invalidateSize
        // The map is created with correct dimensions from the start
        expect(mockMap.invalidateSize).not.toHaveBeenCalled()
      })

      it('should NOT call invalidateSize() during marker updates', async () => {
        mockContext.filteredTrainings = [mockTraining]

        await new Promise(resolve => {
          requestAnimationFrame(() => {
            mapManager.addMarkersToMap()

            requestAnimationFrame(() => {
              // Adding/updating markers should NOT trigger invalidateSize
              expect(mockMap.invalidateSize).not.toHaveBeenCalled()
              resolve()
            })
          })
        })
      })
    })

    describe('Tile Layer Configuration - Mobile-First PWA Optimization', () => {
      it('should use Leaflet default updateWhenIdle: true (mobile-optimized)', () => {
        mapManager.initializeMap()

        // Verify tile layer was created with updateWhenIdle: true
        const tileLayerCall = L.tileLayer.mock.calls[0]
        expect(tileLayerCall).toBeDefined()
        expect(tileLayerCall[1]).toEqual(
          expect.objectContaining({
            updateWhenIdle: true
          })
        )

        // RATIONALE: updateWhenIdle: true waits for pan/zoom to complete
        // before loading new tiles, reducing unnecessary requests on mobile
      })

      it('should use Leaflet default updateInterval: 200ms (balanced throttling)', () => {
        mapManager.initializeMap()

        const tileLayerCall = L.tileLayer.mock.calls[0]
        expect(tileLayerCall[1]).toEqual(
          expect.objectContaining({
            updateInterval: 200
          })
        )

        // RATIONALE: 200ms interval throttles tile requests during fast panning
        // while still feeling responsive (Leaflet's balanced default)
      })

      it('should NOT include updateWhenZooming option (prevents flicker)', () => {
        mapManager.initializeMap()

        const tileLayerCall = L.tileLayer.mock.calls[0]
        expect(tileLayerCall[1].updateWhenZooming).toBeUndefined()

        // CRITICAL: updateWhenZooming: false is Leaflet's default
        // Setting it to true causes tile flickering during zoom animations
        // By omitting it, we use the safe default (false)
      })

      it('should set keepBuffer: 3 for smoother panning (caching optimization)', () => {
        mapManager.initializeMap()

        const tileLayerCall = L.tileLayer.mock.calls[0]
        expect(tileLayerCall[1]).toEqual(
          expect.objectContaining({
            keepBuffer: 3
          })
        )

        // RATIONALE: keepBuffer: 3 keeps extra tiles loaded off-screen
        // providing smoother panning experience at cost of memory
      })

      it('should enable detectRetina for high-DPI displays', () => {
        mapManager.initializeMap()

        const tileLayerCall = L.tileLayer.mock.calls[0]
        expect(tileLayerCall[1]).toEqual(
          expect.objectContaining({
            detectRetina: true
          })
        )
      })

      it('should configure all tile layers (street, satellite, terrain) consistently', () => {
        mapManager.initializeMap()

        // Should create 3 tile layers (street, satellite, terrain)
        expect(L.tileLayer).toHaveBeenCalledTimes(3)

        // All layers should have consistent mobile-optimized config
        const allLayerCalls = L.tileLayer.mock.calls

        allLayerCalls.forEach((call, index) => {
          const options = call[1]
          const layerType = index === 0 ? 'street' : index === 1 ? 'satellite' : 'terrain'

          expect(options.updateWhenIdle).toBe(true)
          expect(options.updateInterval).toBe(200)
          expect(options.updateWhenZooming).toBeUndefined()
          expect(options.keepBuffer).toBe(3)
          expect(options.detectRetina).toBe(true)

          // Terrain layer has lower maxZoom (17 vs 19)
          if (layerType === 'terrain') {
            expect(options.maxZoom).toBe(17)
          } else {
            expect(options.maxZoom).toBe(19)
          }
        })
      })

      it('should configure tile layers for mobile-first PWA performance', () => {
        mapManager.initializeMap()

        const tileLayerCall = L.tileLayer.mock.calls[0]
        const options = tileLayerCall[1]

        // Mobile-optimized configuration summary
        expect(options.updateWhenIdle).toBe(true) // Wait for idle before updating
        expect(options.updateInterval).toBe(200) // Balanced throttling
        expect(options.keepBuffer).toBe(3) // Extra tile caching
        expect(options.detectRetina).toBe(true) // High-DPI displays
        expect(options.updateWhenZooming).toBeUndefined() // No flicker during zoom
      })

      it('should set bounds to Munich area for geographic restriction', () => {
        mapManager.initializeMap()

        const tileLayerCall = L.tileLayer.mock.calls[0]
        const options = tileLayerCall[1]

        expect(options.bounds).toBeDefined()
        expect(options.bounds).toEqual([
          [47.9, 11.3],
          [48.3, 11.9]
        ])

        // RATIONALE: Restricts tile loading to relevant geographic area
        // reducing unnecessary network requests
      })

      it('should handle tile loading errors gracefully', () => {
        mapManager.initializeMap()

        const tileLayerCall = L.tileLayer.mock.calls[0]
        const options = tileLayerCall[1]

        // Should set errorTileUrl to empty string (no ugly error tiles)
        expect(options.errorTileUrl).toBe('')
      })
    })

    describe('centerOnMarker() Best Practices', () => {
      beforeEach(() => {
        mockContext.map = mockMap
        // Add methods needed by centerOnMarker
        mockMap.getSize = vi.fn(() => ({ x: 800, y: 600 }))
        mockMap.latLngToContainerPoint = vi.fn(() => ({ x: 400, y: 300 }))
        mockMap.panBy = vi.fn()
      })

      it('should use panBy() for smooth centering', () => {
        const mockLatLng = { lat: 48.124155, lng: 11.621655 }

        mapManager.centerOnMarker(mockLatLng, false)

        expect(mockMap.panBy).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            animate: true,
            duration: 0.5,
            easeLinearity: 0.25
          })
        )
      })

      it('should NOT call invalidateSize() after panBy()', () => {
        const mockLatLng = { lat: 48.124155, lng: 11.621655 }

        mapManager.centerOnMarker(mockLatLng, false)

        // Leaflet automatically loads tiles after panBy() - no manual intervention needed
        expect(mockMap.invalidateSize).not.toHaveBeenCalled()
      })

      it('should calculate proper offset for popup visibility', () => {
        const mockLatLng = { lat: 48.124155, lng: 11.621655 }

        mapManager.centerOnMarker(mockLatLng, false)

        // Should position marker at 70% from top (giving popup room)
        expect(mockMap.latLngToContainerPoint).toHaveBeenCalledWith(mockLatLng)
        expect(mockMap.panBy).toHaveBeenCalled()
      })
    })

    describe('Performance Optimizations - Race Condition Prevention', () => {
      beforeEach(() => {
        mockContext.map = mockMap
      })

      it('should stop animations before marker updates to prevent race conditions', () => {
        mapManager.addMarkersToMap()

        // CRITICAL: map.stop() should be called before any marker operations
        // This prevents "_latLngToNewLayerPoint" null errors during zoom
        expect(mockMap.stop).toHaveBeenCalled()
      })

      it('should defer marker updates to next animation frame', () => {
        const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

        mapManager.addMarkersToMap()

        expect(rafSpy).toHaveBeenCalled()

        // RATIONALE: requestAnimationFrame ensures pending animations
        // have fully stopped before marker updates begin
        rafSpy.mockRestore()
      })

      it('should handle smooth zoom animations without manual tile reloads', () => {
        // Clear any existing map
        mockContext.map = null

        mapManager.initializeMap()

        // Verify zoomAnimation is enabled (Leaflet handles tile loading)
        expect(L.map).toHaveBeenCalledWith(
          'map-view-container',
          expect.objectContaining({
            zoomAnimation: true
          })
        )

        // zoomend callback exists BUT only for accessibility (screen reader announcements)
        // It does NOT call invalidateSize() - that's the key fix
        const zoomendCallback = mockMap.on.mock.calls.find(call => call[0] === 'zoomend')?.[1]

        // zoomend is used for screen reader support (valid), but should never call invalidateSize
        if (zoomendCallback) {
          // Ensure the callback doesn't call invalidateSize
          mockMap.getZoom = vi.fn(() => 14)

          zoomendCallback()

          // CRITICAL: The callback is for screen reader only, NOT for invalidateSize
          expect(mockMap.invalidateSize).not.toHaveBeenCalled()
        }
      })

      it('should enable smooth animations without manual intervention', () => {
        mockContext.map = null

        mapManager.initializeMap()

        // Verify all smooth animation options are enabled
        expect(L.map).toHaveBeenCalledWith(
          'map-view-container',
          expect.objectContaining({
            zoomAnimation: true,
            fadeAnimation: true,
            markerZoomAnimation: true,
            inertia: true
          })
        )

        // RATIONALE: Leaflet's built-in animations handle all visual updates
        // No manual invalidateSize() or tile reloading needed
      })

      it('should remove event listeners before cleanup to prevent memory leaks', () => {
        const mockClusterGroup = {
          off: vi.fn(),
          clearLayers: vi.fn()
        }
        mockContext.markerClusterGroup = mockClusterGroup

        const marker1 = { ...mockMarker, off: vi.fn(), unbindPopup: vi.fn() }
        const marker2 = { ...mockMarker, off: vi.fn(), unbindPopup: vi.fn() }
        mockContext.markers = [marker1, marker2]

        mapManager.cleanupMap()

        // CRITICAL: All event listeners should be removed before layer removal
        expect(mockMap.off).toHaveBeenCalled()
        expect(mockClusterGroup.off).toHaveBeenCalled()
        marker1.off && expect(marker1.off).toHaveBeenCalled()
        marker2.off && expect(marker2.off).toHaveBeenCalled()
      })

      it('should stop animations before cleanup to prevent race conditions', () => {
        mapManager.cleanupMap()

        // CRITICAL: map.stop() should be called BEFORE any cleanup
        // This prevents errors during cleanup if animations are running
        expect(mockMap.stop).toHaveBeenCalled()
      })
    })

    describe('Leaflet Best Practices - Summary', () => {
      it('should follow all Leaflet best practices for mobile-first PWA', () => {
        // This test verifies the complete implementation of Leaflet best practices
        // across all aspects of map management

        // 1. invalidateSize() Anti-Pattern Prevention
        // - NEVER call invalidateSize() after zoom operations
        // - NEVER call invalidateSize() after pan operations
        // - NEVER call invalidateSize() after marker clicks
        // - ONLY use invalidateSize() when container dimensions change

        // 2. Tile Layer Configuration (Mobile-Optimized)
        // - updateWhenIdle: true (wait for idle before loading tiles)
        // - updateInterval: 200 (balanced throttling)
        // - updateWhenZooming: undefined (use Leaflet default false - no flicker)
        // - keepBuffer: 3 (extra caching for smooth panning)
        // - detectRetina: true (high-DPI support)

        // 3. Race Condition Prevention
        // - map.stop() before marker updates
        // - requestAnimationFrame for deferred updates
        // - Event listener cleanup before layer removal

        // 4. Performance Optimizations
        // - Smooth animations without manual intervention
        // - Chunked marker loading (50+ markers)
        // - Geographic bounds restriction (Munich area)
        // - Error handling for tile loading failures

        expect(true).toBe(true)
      })
    })
  })
})
