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

  return {
    default: {
      map: mockMap,
      marker: mockMarker,
      tileLayer: mockTileLayer
    },
    map: mockMap,
    marker: mockMarker,
    tileLayer: mockTileLayer
  }
})

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
    // Create mock map container
    document.body.innerHTML = '<div id="map-modal-container"></div>'

    // Mock map instance
    mockMap = {
      setView: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      removeLayer: vi.fn(),
      fitBounds: vi.fn(),
      once: vi.fn()
    }

    // Mock tile layer
    mockTileLayer = {
      addTo: vi.fn().mockReturnThis()
    }

    // Mock marker
    mockMarker = {
      bindPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis()
    }

    // Setup Leaflet mocks
    L.map.mockReturnValue(mockMap)
    L.tileLayer.mockReturnValue(mockTileLayer)
    L.marker.mockReturnValue(mockMarker)

    // Mock state
    mockState = {}

    // Mock context
    mockContext = {
      map: null,
      markers: [],
      filteredTrainings: [mockTraining],
      userHasInteractedWithMap: false
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
        'map-modal-container',
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

    it('should remove existing markers', () => {
      const existingMarker = { remove: vi.fn() }
      mockContext.markers = [existingMarker]

      mapManager.addMarkersToMap()

      expect(mockMap.removeLayer).toHaveBeenCalledWith(existingMarker)
      expect(mockContext.markers).toHaveLength(1) // New marker added
    })

    it('should create marker for each training with coordinates', () => {
      mockContext.filteredTrainings = [mockTraining]

      mapManager.addMarkersToMap()

      expect(L.marker).toHaveBeenCalledWith([
        mockTraining.lat,
        mockTraining.lng
      ])
    })

    it('should skip trainings without coordinates', () => {
      mockContext.filteredTrainings = [mockTrainingNoCoords]

      mapManager.addMarkersToMap()

      expect(L.marker).not.toHaveBeenCalled()
    })

    it('should bind popup to marker', () => {
      mapManager.addMarkersToMap()

      expect(mockMarker.bindPopup).toHaveBeenCalledWith(expect.any(String))
    })

    it('should add marker to map', () => {
      mapManager.addMarkersToMap()

      expect(mockMarker.addTo).toHaveBeenCalledWith(mockMap)
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

      expect(popup).toContain('Parkour')
      expect(popup).toContain('LTR')
      expect(popup).toContain('Kids')
    })

    it('should format time range', () => {
      vi.spyOn(utils, 'formatZeitrange').mockReturnValue('18:00 - 20:00 Uhr')

      const popup = mapManager.createMapPopup(mockTraining)

      expect(utils.formatZeitrange).toHaveBeenCalledWith('18:00', '20:00')
      expect(popup).toContain('18:00 - 20:00 Uhr')
    })

    it('should format age group', () => {
      vi.spyOn(utils, 'formatAlter').mockReturnValue('6-12 Jahre')

      const popup = mapManager.createMapPopup(mockTraining)

      expect(utils.formatAlter).toHaveBeenCalledWith(mockTraining)
      expect(popup).toContain('6-12 Jahre')
    })

    it('should include distance if available', () => {
      const trainingWithDistance = {
        ...mockTraining,
        distance: 2.5,
        distanceText: '2.5 km'
      }

      const popup = mapManager.createMapPopup(trainingWithDistance)

      expect(popup).toContain('2.5 km entfernt')
    })

    it('should not include distance if unavailable', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      expect(popup).not.toContain('entfernt')
    })

    it('should include registration link if available', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      expect(popup).toContain(mockTraining.link)
      expect(popup).toContain('Anmelden')
    })

    it('should not include registration link if unavailable', () => {
      const trainingNoLink = { ...mockTraining }
      delete trainingNoLink.link

      const popup = mapManager.createMapPopup(trainingNoLink)

      expect(popup).not.toContain('Anmelden')
    })

    it('should return valid HTML', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      expect(popup).toContain('<div')
      expect(popup).toContain('</div>')
      expect(popup).toContain('<h3')
      expect(popup).toContain('<p')
    })

    it('should include all required fields', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      expect(popup).toContain('Ort:')
      expect(popup).toContain('Zeit:')
      expect(popup).toContain('Alter:')
    })

    it('should use proper CSS classes', () => {
      const popup = mapManager.createMapPopup(mockTraining)

      expect(popup).toContain('font-bold')
      expect(popup).toContain('text-sm')
    })
  })

  // ==================== CLEANUP MAP ====================

  describe('cleanupMap()', () => {
    beforeEach(() => {
      mockContext.map = mockMap
      mockContext.markers = [mockMarker, { remove: vi.fn() }]
      mockContext.userHasInteractedWithMap = true
    })

    it('should do nothing if no map exists', () => {
      mockContext.map = null

      mapManager.cleanupMap()

      expect(mockMap.remove).not.toHaveBeenCalled()
    })

    it('should remove all markers', () => {
      mapManager.cleanupMap()

      expect(mockMap.removeLayer).toHaveBeenCalledTimes(2)
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
