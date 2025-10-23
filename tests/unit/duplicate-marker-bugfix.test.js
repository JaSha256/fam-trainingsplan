// @ts-check
/**
 * Duplicate Marker Bug Fix Tests
 * @file tests/unit/duplicate-marker-bugfix.test.js
 *
 * Tests for the duplicate user location marker bug fix.
 * Bug: When switching from GPS → Manual location (or vice versa),
 * both markers remained visible on the map.
 *
 * Root cause: GeolocationControl and MapManager each created their own
 * user location marker without coordinating cleanup.
 *
 * Fix: MapManager.addUserLocationMarker() now removes BOTH possible markers
 * before creating a new one.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MapManager } from '../../src/js/trainingsplaner/map-manager.js'

describe('Duplicate Marker Bug Fix', () => {
  let mockState
  let mockContext
  let mockMap
  let mockGeolocationControl
  let mockMarker1
  let mockMarker2
  let mapManager

  beforeEach(() => {
    // Mock Leaflet marker
    mockMarker1 = {
      addTo: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      unbindPopup: vi.fn()
    }

    mockMarker2 = {
      addTo: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      unbindPopup: vi.fn()
    }

    // Mock Leaflet map
    mockMap = {
      removeLayer: vi.fn(),
      addLayer: vi.fn(),
      hasLayer: vi.fn().mockReturnValue(true)
    }

    // Mock GeolocationControl with its own marker
    mockGeolocationControl = {
      _userMarker: null // This is the marker created by GeolocationControl
    }

    // Mock context
    mockContext = {
      map: mockMap,
      userLocationMarker: null,
      geolocationControl: mockGeolocationControl,
      markers: [],
      $store: { ui: {} }
    }

    // Mock state
    mockState = {}

    // Create MapManager instance
    mapManager = new MapManager(mockState, mockContext)
  })

  describe('Bug Scenario: GPS → Manual Location', () => {
    it('should remove GPS marker when setting manual location', () => {
      // Simulate GPS marker creation (GeolocationControl creates this)
      mockContext.geolocationControl._userMarker = mockMarker1

      // User switches to manual location (MapManager creates new marker)
      // This should remove the GPS marker
      mapManager.addUserLocationMarker([48.1351, 11.5820])

      // Verify GPS marker was removed
      expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarker1)
      expect(mockContext.geolocationControl._userMarker).toBeNull()
    })

    it('should only show ONE marker after switching from GPS to manual', () => {
      // Initial state: GPS marker exists
      mockContext.geolocationControl._userMarker = mockMarker1

      // Switch to manual location
      mapManager.addUserLocationMarker([48.1351, 11.5820])

      // Should have removed GPS marker
      expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarker1)
      // Should have created new manual marker
      expect(mockContext.userLocationMarker).toBeTruthy()
      // GPS marker reference should be null
      expect(mockContext.geolocationControl._userMarker).toBeNull()
    })
  })

  describe('Bug Scenario: Manual → GPS', () => {
    it('should remove manual marker when switching to GPS', () => {
      // Simulate manual marker exists
      mockContext.userLocationMarker = mockMarker1

      // User switches to GPS (MapManager creates new marker)
      mapManager.addUserLocationMarker([48.1400, 11.5900])

      // Verify manual marker was removed
      expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarker1)
      expect(mockContext.userLocationMarker).toBeTruthy() // New marker created
    })
  })

  describe('Bug Scenario: Multiple Location Changes', () => {
    it('should handle rapid GPS → Manual → GPS → Manual changes', () => {
      // 1. GPS marker
      mockContext.geolocationControl._userMarker = mockMarker1
      mapManager.addUserLocationMarker([48.1351, 11.5820])
      
      expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarker1)
      
      // 2. Manual marker (simulate GPS marker created again)
      mockContext.geolocationControl._userMarker = mockMarker2
      mapManager.addUserLocationMarker([48.1400, 11.5900])
      
      expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarker2)
      
      // Final state: Only one marker should exist
      expect(mockContext.userLocationMarker).toBeTruthy()
      expect(mockContext.geolocationControl._userMarker).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle when no GPS marker exists', () => {
      // No GPS marker
      mockContext.geolocationControl._userMarker = null

      // Set manual location
      expect(() => {
        mapManager.addUserLocationMarker([48.1351, 11.5820])
      }).not.toThrow()

      expect(mockContext.userLocationMarker).toBeTruthy()
    })

    it('should handle when no manual marker exists', () => {
      // No manual marker
      mockContext.userLocationMarker = null
      // GPS marker exists
      mockContext.geolocationControl._userMarker = mockMarker1

      expect(() => {
        mapManager.addUserLocationMarker([48.1351, 11.5820])
      }).not.toThrow()

      expect(mockContext.userLocationMarker).toBeTruthy()
      expect(mockContext.geolocationControl._userMarker).toBeNull()
    })

    it('should handle when both markers exist (bug state)', () => {
      // Bug state: Both markers exist
      mockContext.userLocationMarker = mockMarker1
      mockContext.geolocationControl._userMarker = mockMarker2

      // Add new marker (should remove BOTH old markers)
      mapManager.addUserLocationMarker([48.1351, 11.5820])

      // Both old markers should be removed
      expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarker1)
      expect(mockMap.removeLayer).toHaveBeenCalledWith(mockMarker2)
      
      // References should be cleared
      expect(mockContext.geolocationControl._userMarker).toBeNull()
      
      // New marker should exist
      expect(mockContext.userLocationMarker).toBeTruthy()
    })

    it('should handle missing geolocationControl gracefully', () => {
      // GeolocationControl doesn't exist (feature disabled)
      mockContext.geolocationControl = null

      expect(() => {
        mapManager.addUserLocationMarker([48.1351, 11.5820])
      }).not.toThrow()

      expect(mockContext.userLocationMarker).toBeTruthy()
    })

    it('should handle missing map gracefully', () => {
      // Map not initialized
      mockContext.map = null

      mapManager.addUserLocationMarker([48.1351, 11.5820])

      // Should exit early without errors
      expect(mockContext.userLocationMarker).toBeFalsy()
    })
  })
})
