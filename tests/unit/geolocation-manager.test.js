// tests/unit/geolocation-manager.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GeolocationManager } from '../../src/js/trainingsplaner/geolocation-manager.js'
import { CONFIG } from '../../src/js/config.js'
import { utils } from '../../src/js/utils.js'

describe('GeolocationManager', () => {
  let geolocationManager
  let mockState
  let mockContext
  let mockDependencies

  const mockPosition = {
    lat: 48.1351,
    lng: 11.5820
  }

  const mockTrainings = [
    {
      id: 1,
      training: 'Parkour',
      ort: 'LTR',
      lat: 48.124155,
      lng: 11.621655
    },
    {
      id: 2,
      training: 'Trampolin',
      ort: 'Balanstr.',
      lat: 48.135124,
      lng: 11.582002
    },
    {
      id: 3,
      training: 'Tricking',
      ort: 'Online'
      // No coordinates
    }
  ]

  beforeEach(() => {
    // Mock state
    mockState = {}

    // Mock context
    mockContext = {
      geolocationLoading: false,
      geolocationError: null,
      userPosition: null,
      allTrainings: [...mockTrainings],
      $store: {
        ui: {
          showNotification: vi.fn()
        }
      }
    }

    // Mock dependencies
    mockDependencies = {
      applyFilters: vi.fn()
    }

    // Default mock for addDistanceToTrainings - returns trainings as-is
    vi.spyOn(utils, 'addDistanceToTrainings').mockImplementation((trainings) => trainings)

    // Create GeolocationManager instance
    geolocationManager = new GeolocationManager(mockState, mockContext, mockDependencies)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==================== CONSTRUCTOR ====================

  describe('Constructor', () => {
    it('should initialize with provided state and context', () => {
      expect(geolocationManager.state).toBe(mockState)
      expect(geolocationManager.context).toBe(mockContext)
    })

    it('should store applyFilters dependency', () => {
      expect(geolocationManager.applyFilters).toBe(mockDependencies.applyFilters)
    })
  })

  // ==================== REQUEST USER LOCATION ====================

  describe('requestUserLocation()', () => {
    it('should set loading state to true', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      const promise = geolocationManager.requestUserLocation()

      expect(mockContext.geolocationLoading).toBe(true)

      await promise
    })

    it('should clear previous error', async () => {
      mockContext.geolocationError = 'Previous error'
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()

      expect(mockContext.geolocationError).toBeNull()
    })

    it('should get current position from utils', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()

      expect(utils.getCurrentPosition).toHaveBeenCalled()
    })

    it('should store position in context', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()

      expect(mockContext.userPosition).toEqual(mockPosition)
    })

    it('should add distance to trainings', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)
      const addDistanceSpy = vi.spyOn(geolocationManager, 'addDistanceToTrainings')

      await geolocationManager.requestUserLocation()

      expect(addDistanceSpy).toHaveBeenCalled()
    })

    it('should apply filters after getting position', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()

      expect(mockDependencies.applyFilters).toHaveBeenCalled()
    })

    it('should show success notification', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Standort'),
        'success',
        2000
      )
    })

    it('should return true on success', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      const result = await geolocationManager.requestUserLocation()

      expect(result).toBe(true)
    })

    it('should set loading to false after success', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()

      expect(mockContext.geolocationLoading).toBe(false)
    })

    it('should handle geolocation errors', async () => {
      const error = new Error('Permission denied')
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(error)

      const result = await geolocationManager.requestUserLocation()

      expect(result).toBe(false)
      expect(mockContext.geolocationError).toBe('Permission denied')
    })

    it('should show error notification on failure', async () => {
      const error = new Error('Geolocation not available')
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(error)

      await geolocationManager.requestUserLocation()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        'Geolocation not available',
        'error',
        5000
      )
    })

    it('should handle non-Error exceptions', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue('String error')

      const result = await geolocationManager.requestUserLocation()

      expect(result).toBe(false)
      expect(mockContext.geolocationError).toBe('String error')
    })

    it('should set loading to false after error', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(new Error('Failed'))

      await geolocationManager.requestUserLocation()

      expect(mockContext.geolocationLoading).toBe(false)
    })

    it('should not set userPosition on error', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(new Error('Failed'))

      await geolocationManager.requestUserLocation()

      expect(mockContext.userPosition).toBeNull()
    })

    it('should not call addDistanceToTrainings on error', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(new Error('Failed'))
      const addDistanceSpy = vi.spyOn(geolocationManager, 'addDistanceToTrainings')

      await geolocationManager.requestUserLocation()

      expect(addDistanceSpy).not.toHaveBeenCalled()
    })

    it('should not call applyFilters on error', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(new Error('Failed'))

      await geolocationManager.requestUserLocation()

      expect(mockDependencies.applyFilters).not.toHaveBeenCalled()
    })
  })

  // ==================== ADD DISTANCE TO TRAININGS ====================

  describe('addDistanceToTrainings()', () => {
    it('should return early if no user position', () => {
      mockContext.userPosition = null

      geolocationManager.addDistanceToTrainings()

      // Should not throw, trainings should be unchanged
      expect(mockContext.allTrainings).toEqual(mockTrainings)
    })

    it('should call utils.addDistanceToTrainings', () => {
      mockContext.userPosition = mockPosition

      const trainingsWithDistance = mockTrainings.map(t => ({
        ...t,
        distance: t.lat && t.lng ? 1.5 : undefined
      }))

      // Override default mock for this specific test
      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue(trainingsWithDistance)

      geolocationManager.addDistanceToTrainings()

      // Check it was called (arguments will differ due to default mock in beforeEach)
      expect(utils.addDistanceToTrainings).toHaveBeenCalled()
    })

    it('should update trainings with distance', () => {
      mockContext.userPosition = mockPosition

      const trainingsWithDistance = [
        { ...mockTrainings[0], distance: 1.5 },
        { ...mockTrainings[1], distance: 2.3 },
        { ...mockTrainings[2] }
      ]

      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue(trainingsWithDistance)

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings).toEqual(trainingsWithDistance)
    })

    it('should add distanceText to trainings', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, training: 'Test', distance: 1.5 }
      ]

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('1.5 km')
    })

    it('should format distance with one decimal place', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, training: 'Test', distance: 2.345 }
      ]

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('2.3 km')
    })

    it('should handle trainings without distance', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, training: 'Test', distance: 1.5 },
        { id: 2, training: 'No coords' }
      ]

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('1.5 km')
      expect(mockContext.allTrainings[1].distanceText).toBeUndefined()
    })

    it('should handle zero distance', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, training: 'Test', distance: 0 }
      ]

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('0.0 km')
    })

    it('should handle large distances', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, training: 'Test', distance: 123.456 }
      ]

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('123.5 km')
    })

    it('should process all trainings', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, distance: 1.1 },
        { id: 2, distance: 2.2 },
        { id: 3, distance: 3.3 }
      ]

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('1.1 km')
      expect(mockContext.allTrainings[1].distanceText).toBe('2.2 km')
      expect(mockContext.allTrainings[2].distanceText).toBe('3.3 km')
    })
  })

  // ==================== INTEGRATION TESTS ====================

  describe('Integration', () => {
    it('should handle complete geolocation flow', async () => {
      const trainingsWithDistance = [
        { ...mockTrainings[0], distance: 1.5 },
        { ...mockTrainings[1], distance: 2.3 },
        { ...mockTrainings[2] }
      ]

      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)
      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue(trainingsWithDistance)

      const result = await geolocationManager.requestUserLocation()

      expect(result).toBe(true)
      expect(mockContext.userPosition).toEqual(mockPosition)
      expect(mockContext.allTrainings[0].distanceText).toBe('1.5 km')
      expect(mockContext.allTrainings[1].distanceText).toBe('2.3 km')
      expect(mockDependencies.applyFilters).toHaveBeenCalled()
      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Standort'),
        'success',
        2000
      )
    })

    it('should handle error flow', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(
        new Error('Permission denied')
      )

      const result = await geolocationManager.requestUserLocation()

      expect(result).toBe(false)
      expect(mockContext.userPosition).toBeNull()
      expect(mockContext.geolocationError).toBe('Permission denied')
      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        'Permission denied',
        'error',
        5000
      )
      expect(mockDependencies.applyFilters).not.toHaveBeenCalled()
    })

    // Note: CONFIG.features.enableGeolocation defaults to true and is frozen
    // Testing the disabled state would require complex mocking infrastructure
    // This scenario is better tested via E2E tests

    it('should handle multiple location requests', async () => {
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()
      const firstPosition = mockContext.userPosition

      const newPosition = { lat: 48.140, lng: 11.590 }
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(newPosition)

      await geolocationManager.requestUserLocation()

      expect(mockContext.userPosition).toEqual(newPosition)
      expect(mockContext.userPosition).not.toEqual(firstPosition)
    })

    it('should clear error on successful retry', async () => {
      // First attempt fails
      vi.spyOn(utils, 'getCurrentPosition').mockRejectedValue(
        new Error('First error')
      )

      await geolocationManager.requestUserLocation()
      expect(mockContext.geolocationError).toBe('First error')

      // Second attempt succeeds
      vi.spyOn(utils, 'getCurrentPosition').mockResolvedValue(mockPosition)

      await geolocationManager.requestUserLocation()
      expect(mockContext.geolocationError).toBeNull()
      expect(mockContext.userPosition).toEqual(mockPosition)
    })
  })

  // ==================== SET MANUAL LOCATION ====================

  describe('setManualLocation()', () => {
    beforeEach(() => {
      mockContext.$store.ui.manualLocation = null
      mockContext.$store.ui.manualLocationAddress = ''
      mockContext.$store.ui.manualLocationSet = false
      mockContext.userPosition = null
      mockContext.map = {
        removeLayer: vi.fn()
      }
    })

    it('should set userPosition to manual location', () => {
      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(mockContext.userPosition).toEqual({
        lat: 48.1351,
        lng: 11.5820
      })
    })

    it('should update Alpine store with manual location', () => {
      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(mockContext.$store.ui.manualLocation).toEqual({
        lat: 48.1351,
        lng: 11.5820
      })
      expect(mockContext.$store.ui.manualLocationAddress).toBe('Munich Center')
      expect(mockContext.$store.ui.manualLocationSet).toBe(true)
    })

    it('should save manual location to localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(setItemSpy).toHaveBeenCalledWith(
        'manualLocation',
        JSON.stringify({
          lat: 48.1351,
          lng: 11.5820,
          address: 'Munich Center'
        })
      )

      setItemSpy.mockRestore()
    })

    it('should add distance to trainings', () => {
      const addDistanceSpy = vi.spyOn(geolocationManager, 'addDistanceToTrainings')

      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(addDistanceSpy).toHaveBeenCalled()
    })

    it('should apply filters after setting location', () => {
      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(mockDependencies.applyFilters).toHaveBeenCalled()
    })

    it('should add user marker to map if map exists', () => {
      const mockMapManager = {
        addUserLocationMarker: vi.fn()
      }
      geolocationManager.mapManager = mockMapManager

      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(mockMapManager.addUserLocationMarker).toHaveBeenCalledWith([48.1351, 11.5820])
    })

    it('should not add marker if map does not exist', () => {
      mockContext.map = null
      const mockMapManager = {
        addUserLocationMarker: vi.fn()
      }
      geolocationManager.mapManager = mockMapManager

      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(mockMapManager.addUserLocationMarker).not.toHaveBeenCalled()
    })

    it('should not add marker if mapManager is not available', () => {
      geolocationManager.mapManager = null

      // Should not throw error
      expect(() => {
        geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')
      }).not.toThrow()
    })

    it('should handle address parameter as optional (default empty string)', () => {
      geolocationManager.setManualLocation(48.1351, 11.5820)

      expect(mockContext.$store.ui.manualLocationAddress).toBe('')
    })

    it('should work with negative coordinates', () => {
      geolocationManager.setManualLocation(-33.8688, 151.2093, 'Sydney')

      expect(mockContext.userPosition).toEqual({
        lat: -33.8688,
        lng: 151.2093
      })
    })

    it('should handle zero coordinates', () => {
      geolocationManager.setManualLocation(0, 0, 'Null Island')

      expect(mockContext.userPosition).toEqual({
        lat: 0,
        lng: 0
      })
    })

    it('should update trainings with distance after manual location', () => {
      const trainingsWithDistance = [
        { ...mockTrainings[0], distance: 2.5 },
        { ...mockTrainings[1], distance: 1.2 }
      ]

      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue(trainingsWithDistance)

      geolocationManager.setManualLocation(48.1351, 11.5820, 'Munich Center')

      expect(mockContext.allTrainings[0].distance).toBe(2.5)
      expect(mockContext.allTrainings[0].distanceText).toBe('2.5 km')
    })
  })

  // ==================== EDGE CASES ====================

  describe('Edge Cases', () => {
    it('should handle empty trainings array', () => {
      mockContext.userPosition = mockPosition
      mockContext.allTrainings = []

      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue([])

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings).toEqual([])
    })

    it('should handle trainings without coordinates', () => {
      mockContext.userPosition = mockPosition

      const trainingsWithoutCoords = [
        { id: 1, training: 'Online' },
        { id: 2, training: 'TBD' }
      ]

      mockContext.allTrainings = trainingsWithoutCoords

      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue(trainingsWithoutCoords)

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBeUndefined()
      expect(mockContext.allTrainings[1].distanceText).toBeUndefined()
    })

    it('should handle position at training location', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, training: 'Test', distance: 0 }
      ]

      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue(mockContext.allTrainings)

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('0.0 km')
    })

    it('should handle very small distances', () => {
      mockContext.userPosition = mockPosition

      mockContext.allTrainings = [
        { id: 1, training: 'Test', distance: 0.05 }
      ]

      vi.spyOn(utils, 'addDistanceToTrainings').mockReturnValue(mockContext.allTrainings)

      geolocationManager.addDistanceToTrainings()

      expect(mockContext.allTrainings[0].distanceText).toBe('0.1 km')
    })
  })
})
