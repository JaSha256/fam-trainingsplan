// tests/unit/map-manager.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MapManager } from '../../src/js/trainingsplaner/map-manager.js'
import { CONFIG } from '../../src/js/config.js'
import { utils } from '../../src/js/utils.js'

// Mock Leaflet - define inline in vi.mock to avoid hoisting issues
vi.mock('leaflet', () => {
  const mockMap = vi.fn()
  const mockMarker = vi.fn()
  const mockTileLayer = vi.fn()
  const mockMarkerClusterGroup = vi.fn()

  // Mock Control class for custom controls
  const mockControl = {
    extend: vi.fn((options) => {
      return function() {
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
      tileLayer: mockTileLayer,
      markerClusterGroup: mockMarkerClusterGroup,
      Control: mockControl,
      Icon: { Default: mockIconDefault },
      point: vi.fn((x, y) => ({ x, y })),
      divIcon: vi.fn((options) => options)
    },
    map: mockMap,
    marker: mockMarker,
    tileLayer: mockTileLayer,
    markerClusterGroup: mockMarkerClusterGroup,
    Control: mockControl,
    Icon: { Default: mockIconDefault },
    point: vi.fn((x, y) => ({ x, y })),
    divIcon: vi.fn((options) => options)
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
  groupTrainingsByLocation: vi.fn((trainings) => {
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
  createMapPopupHTML: vi.fn((training) => `<div>Popup for ${training.training}</div>`),
  createLocationPopupHTML: vi.fn((trainings) => `<div>Location with ${trainings.length} trainings</div>`)
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
      eachLayer: vi.fn((callback) => {
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

    it('should create marker for each training with coordinates', () => {
      mockContext.filteredTrainings = [mockTraining]

      mapManager.addMarkersToMap()

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

    it('should bind popup to marker', () => {
      mapManager.addMarkersToMap()

      expect(mockMarker.bindPopup).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          maxWidth: 400,
          className: 'md-map-popup-container',
          autoPan: false
        })
      )
    })

    it('should add markers to cluster group', () => {
      const mockClusterGroup = L.markerClusterGroup()

      mapManager.addMarkersToMap()

      expect(mockClusterGroup.addLayers).toHaveBeenCalled()
      expect(mockMap.addLayer).toHaveBeenCalledWith(mockClusterGroup)
    })

    it('should store markers in context', () => {
      mapManager.addMarkersToMap()

      expect(mockContext.markers).toHaveLength(1)
      expect(mockContext.markers[0]).toBe(mockMarker)
    })

    it('should fit bounds to show all markers', () => {
      mockContext.filteredTrainings = [
        mockTraining,
        { ...mockTraining, id: 2, lat: 48.135124, lng: 11.582002 }
      ]

      mapManager.addMarkersToMap()

      expect(mockMap.fitBounds).toHaveBeenCalledWith(
        expect.arrayContaining([
          [mockTraining.lat, mockTraining.lng]
        ]),
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

    it('should set user interaction flag on movestart', () => {
      let moveStartCallback

      mockMap.once.mockImplementation((event, callback) => {
        if (event === 'movestart') {
          moveStartCallback = callback
        }
      })

      mapManager.addMarkersToMap()

      expect(mockMap.once).toHaveBeenCalledWith('movestart', expect.any(Function))

      // Trigger movestart
      if (moveStartCallback) {
        moveStartCallback()
      }

      expect(mockContext.userHasInteractedWithMap).toBe(true)
    })

    it('should handle multiple trainings', () => {
      mockContext.filteredTrainings = [
        mockTraining,
        { ...mockTraining, id: 2, lat: 48.135, lng: 11.582 },
        { ...mockTraining, id: 3, lat: 48.140, lng: 11.590 }
      ]

      mapManager.addMarkersToMap()

      expect(L.marker).toHaveBeenCalledTimes(3)
      expect(mockContext.markers).toHaveLength(3)
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
    it('should handle complete map lifecycle', () => {
      // Initialize
      mapManager.initializeMap()
      expect(mockContext.map).toBeTruthy()
      expect(mockContext.markers).toHaveLength(1)

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
      expect(mockContext.markers).toHaveLength(2)

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

    it('should handle map with mixed trainings', () => {
      mockContext.filteredTrainings = [
        mockTraining,
        mockTrainingNoCoords,
        { ...mockTraining, id: 3, lat: 48.140, lng: 11.590 }
      ]

      mapManager.initializeMap()

      // Should only create markers for trainings with coordinates
      expect(mockContext.markers).toHaveLength(2)
    })

    it('should handle user interaction correctly', () => {
      mapManager.initializeMap()

      // Simulate user interaction
      const moveStartCallback = mockMap.once.mock.calls.find(
        call => call[0] === 'movestart'
      )?.[1]

      if (moveStartCallback) {
        moveStartCallback()
      }

      expect(mockContext.userHasInteractedWithMap).toBe(true)

      // Update markers - should not fit bounds
      mapManager.addMarkersToMap()

      // fitBounds should only be called once (during init)
      expect(mockMap.fitBounds).toHaveBeenCalledTimes(1)
    })
  })
})
