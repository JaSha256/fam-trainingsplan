// tests/unit/data-loader.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DataLoader } from '../../src/js/trainingsplaner/data-loader.js'
import { CONFIG } from '../../src/js/config.js'
import { utils } from '../../src/js/utils.js'
import Fuse from 'fuse.js'

// Mock modules
vi.mock('fuse.js')

describe('DataLoader', () => {
  let dataLoader
  let mockState
  let mockContext
  let mockDependencies
  let originalFetch

  const mockApiResponse = {
    version: '3.0.0',
    trainings: [
      { id: 1, training: 'Parkour', ort: 'LTR', wochentag: 'Montag' },
      { id: 2, training: 'Trampolin', ort: 'Balanstr.', wochentag: 'Dienstag' }
    ],
    metadata: {
      orte: ['LTR', 'Balanstr.'],
      trainingsarten: ['Parkour', 'Trampolin']
    }
  }

  beforeEach(() => {
    // Save original fetch
    originalFetch = global.fetch

    // Clear localStorage
    localStorage.clear()

    // Mock state
    mockState = {
      userPosition: null,
      updateCheckInterval: null
    }

    // Mock context
    mockContext = {
      loading: false,
      error: null,
      fromCache: false,
      allTrainings: [],
      metadata: null,
      fuse: null,
      updateAvailable: false,
      latestVersion: null
    }

    // Mock dependencies
    mockDependencies = {
      addDistanceToTrainings: vi.fn(),
      applyFilters: vi.fn(),
      startUpdateCheck: vi.fn()
    }

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    })

    // Create DataLoader instance
    dataLoader = new DataLoader(mockState, mockContext, mockDependencies)
  })

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch

    // Clear intervals
    if (mockState.updateCheckInterval) {
      clearInterval(mockState.updateCheckInterval)
    }

    vi.clearAllMocks()
  })

  // ==================== CONSTRUCTOR ====================

  describe('Constructor', () => {
    it('should initialize with provided state and context', () => {
      expect(dataLoader.state).toBe(mockState)
      expect(dataLoader.context).toBe(mockContext)
    })

    it('should store dependencies', () => {
      expect(dataLoader.addDistanceToTrainings).toBe(mockDependencies.addDistanceToTrainings)
      expect(dataLoader.applyFilters).toBe(mockDependencies.applyFilters)
      expect(dataLoader.startUpdateCheck).toBe(mockDependencies.startUpdateCheck)
    })
  })

  // ==================== INIT ====================

  describe('init()', () => {
    it('should set loading state to true at start', async () => {
      mockContext.loading = false

      const initPromise = dataLoader.init()

      expect(mockContext.loading).toBe(true)

      await initPromise
    })

    it('should fetch data from API successfully', async () => {
      await dataLoader.init()

      expect(global.fetch).toHaveBeenCalled()
      expect(mockContext.allTrainings).toEqual(mockApiResponse.trainings)
      expect(mockContext.metadata).toEqual(mockApiResponse.metadata)
      expect(mockContext.loading).toBe(false)
    })

    it.skip('should use cache-first strategy', async () => {
      // Set up cache
      const cachedData = {
        version: '2.0.0',
        trainings: [{ id: 99, training: 'Cached' }],
        metadata: { orte: ['Cached'] }
      }

      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: cachedData
      }))

      await dataLoader.init()

      // Should load cached data first
      expect(mockContext.fromCache).toBe(true)
      expect(mockContext.allTrainings).toHaveLength(2) // API data after fetch
    })

    it('should stay with cache if API fails', async () => {
      // Set up cache
      const cachedData = {
        version: '2.0.0',
        trainings: [{ id: 99, training: 'Cached' }],
        metadata: { orte: ['Cached'] }
      }

      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: cachedData
      }))

      // Make fetch fail
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      await dataLoader.init()

      // Should use cached data
      expect(mockContext.allTrainings).toEqual(cachedData.trainings)
      expect(mockContext.error).toBeNull()
    })

    it('should set error if fetch fails and no cache available', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      await dataLoader.init()

      expect(mockContext.error).toContain('404')
      expect(mockContext.loading).toBe(false)
    })

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await dataLoader.init()

      expect(mockContext.error).toBeTruthy()
      expect(mockContext.loading).toBe(false)
    })

    it('should validate API response format', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'format' })
      })

      await dataLoader.init()

      expect(mockContext.error).toContain('Invalid data format')
    })

    it('should detect data changes via hash comparison', async () => {
      // Set up cache with different data
      const cachedData = {
        version: '2.0.0',
        trainings: [{ id: 99, training: 'Old' }],
        metadata: {}
      }

      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: cachedData
      }))

      await dataLoader.init()

      // Should detect change and update
      expect(mockContext.fromCache).toBe(false)
      expect(mockContext.allTrainings).toEqual(mockApiResponse.trainings)
    })

    it('should not update if data hash is identical', async () => {
      // Set up cache with same data
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: mockApiResponse
      }))

      const setSpy = vi.spyOn(dataLoader, 'setCachedData')

      await dataLoader.init()

      // Should not write to cache again if data unchanged
      expect(setSpy).not.toHaveBeenCalled()
    })

    it.skip('should start update check if enabled', async () => {
      const originalFeature = CONFIG.features.enableUpdateCheck
      CONFIG.features.enableUpdateCheck = true

      await dataLoader.init()

      expect(mockDependencies.startUpdateCheck).toHaveBeenCalled()

      CONFIG.features.enableUpdateCheck = originalFeature
    })

    it.skip('should not start update check if disabled', async () => {
      const originalFeature = CONFIG.features.enableUpdateCheck
      CONFIG.features.enableUpdateCheck = false

      await dataLoader.init()

      expect(mockDependencies.startUpdateCheck).not.toHaveBeenCalled()

      CONFIG.features.enableUpdateCheck = originalFeature
    })

    it('should include cache-busting parameter in API URL', async () => {
      await dataLoader.init()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?_=')
      )
    })
  })

  // ==================== LOAD DATA ====================

  describe('loadData()', () => {
    it('should load trainings into context', () => {
      dataLoader.loadData(mockApiResponse)

      expect(mockContext.allTrainings).toEqual(mockApiResponse.trainings)
      expect(mockContext.metadata).toEqual(mockApiResponse.metadata)
    })

    it('should initialize Fuse.js search', () => {
      const FuseMock = vi.fn()
      Fuse.mockImplementation(FuseMock)

      dataLoader.loadData(mockApiResponse)

      expect(FuseMock).toHaveBeenCalledWith(
        mockApiResponse.trainings,
        CONFIG.search.fuseOptions
      )
    })

    it('should add distance if user position available', () => {
      mockState.userPosition = { lat: 48.1351, lng: 11.5820 }

      dataLoader.loadData(mockApiResponse)

      expect(mockDependencies.addDistanceToTrainings).toHaveBeenCalled()
    })

    it('should not add distance if user position unavailable', () => {
      mockState.userPosition = null

      dataLoader.loadData(mockApiResponse)

      expect(mockDependencies.addDistanceToTrainings).not.toHaveBeenCalled()
    })

    it('should apply filters after loading', () => {
      dataLoader.loadData(mockApiResponse)

      expect(mockDependencies.applyFilters).toHaveBeenCalled()
    })

    it('should handle empty trainings array', () => {
      const emptyResponse = {
        trainings: [],
        metadata: {}
      }

      dataLoader.loadData(emptyResponse)

      expect(mockContext.allTrainings).toEqual([])
    })

    it('should handle null metadata', () => {
      const responseWithoutMetadata = {
        trainings: mockApiResponse.trainings
      }

      dataLoader.loadData(responseWithoutMetadata)

      expect(mockContext.metadata).toBeNull()
    })
  })

  // ==================== GET CACHED DATA ====================

  describe('getCachedData()', () => {
    it.skip('should return null if caching disabled', () => {
      const originalCacheEnabled = CONFIG.cacheEnabled
      CONFIG.cacheEnabled = false

      const result = dataLoader.getCachedData()

      expect(result).toBeNull()

      CONFIG.cacheEnabled = originalCacheEnabled
    })

    it('should return null if no cache exists', () => {
      const result = dataLoader.getCachedData()

      expect(result).toBeNull()
    })

    it('should return cached data if valid', () => {
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: mockApiResponse
      }))

      const result = dataLoader.getCachedData()

      expect(result).toEqual(mockApiResponse)
    })

    it('should return null if cache expired', () => {
      const oldTimestamp = Date.now() - CONFIG.cacheDuration - 1000

      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: oldTimestamp,
        data: mockApiResponse
      }))

      const result = dataLoader.getCachedData()

      expect(result).toBeNull()
    })

    it('should remove expired cache from localStorage', () => {
      const oldTimestamp = Date.now() - CONFIG.cacheDuration - 1000

      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: oldTimestamp,
        data: mockApiResponse
      }))

      dataLoader.getCachedData()

      expect(localStorage.getItem(CONFIG.cacheKey)).toBeNull()
    })

    it('should handle corrupted cache data', () => {
      localStorage.setItem(CONFIG.cacheKey, 'invalid json')

      const result = dataLoader.getCachedData()

      expect(result).toBeNull()
    })

    it.skip('should handle missing timestamp in cache', () => {
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        data: mockApiResponse
      }))

      const result = dataLoader.getCachedData()

      expect(result).toBeNull()
    })
  })

  // ==================== SET CACHED DATA ====================

  describe('setCachedData()', () => {
    // Note: CONFIG.cacheEnabled is frozen at true
    it.skip('should not cache if caching disabled', () => {
      const originalCacheEnabled = CONFIG.cacheEnabled
      CONFIG.cacheEnabled = false

      dataLoader.setCachedData(mockApiResponse)

      expect(localStorage.getItem(CONFIG.cacheKey)).toBeNull()

      CONFIG.cacheEnabled = originalCacheEnabled
    })

    it('should store data with timestamp', () => {
      const beforeTime = Date.now()

      dataLoader.setCachedData(mockApiResponse)

      const afterTime = Date.now()
      const cached = JSON.parse(localStorage.getItem(CONFIG.cacheKey))

      expect(cached.timestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(cached.timestamp).toBeLessThanOrEqual(afterTime)
      expect(cached.data).toEqual(mockApiResponse)
    })

    it('should handle localStorage quota errors', () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw
      expect(() => {
        dataLoader.setCachedData(mockApiResponse)
      }).not.toThrow()

      Storage.prototype.setItem = originalSetItem
    })
  })

  // ==================== CHECK FOR UPDATES ====================

  describe('checkForUpdates()', () => {
    it('should fetch version.json', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: '4.0.0' })
      })

      await dataLoader.checkForUpdates()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(CONFIG.versionUrl)
      )
    })

    it.skip('should detect available update', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: '4.0.0' })
      })

      const originalVersion = CONFIG.pwa.version
      CONFIG.pwa.version = '3.0.0'

      await dataLoader.checkForUpdates()

      expect(mockContext.updateAvailable).toBe(true)
      expect(mockContext.latestVersion).toBe('4.0.0')

      CONFIG.pwa.version = originalVersion
    })

    it('should not flag update if version unchanged', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: CONFIG.pwa.version })
      })

      await dataLoader.checkForUpdates()

      expect(mockContext.updateAvailable).toBe(false)
    })

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      // Should not throw
      await expect(dataLoader.checkForUpdates()).resolves.toBeUndefined()
    })

    it('should include cache-busting parameter', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: '4.0.0' })
      })

      await dataLoader.checkForUpdates()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?_=')
      )
    })
  })

  // ==================== START UPDATE CHECK INTERNAL ====================

  describe('startUpdateCheckInternal()', () => {
    it('should start interval for update checks', () => {
      vi.useFakeTimers()

      dataLoader.startUpdateCheckInternal()

      expect(mockState.updateCheckInterval).toBeTruthy()

      vi.useRealTimers()
      clearInterval(mockState.updateCheckInterval)
    })

    it('should not start if already running', () => {
      mockState.updateCheckInterval = 12345

      dataLoader.startUpdateCheckInternal()

      expect(mockState.updateCheckInterval).toBe(12345)
    })

    it('should call checkForUpdates periodically', () => {
      vi.useFakeTimers()
      const checkSpy = vi.spyOn(dataLoader, 'checkForUpdates').mockResolvedValue()

      dataLoader.startUpdateCheckInternal()

      vi.advanceTimersByTime(CONFIG.pwa.updateCheckInterval)

      expect(checkSpy).toHaveBeenCalled()

      vi.useRealTimers()
      clearInterval(mockState.updateCheckInterval)
    })
  })

  // ==================== INTEGRATION TESTS ====================

  describe('Integration - Complete Flow', () => {
    it('should handle full init -> cache -> update flow', async () => {
      // First init - no cache
      await dataLoader.init()
      expect(mockContext.fromCache).toBe(false)

      // Second init - with cache
      const dataLoader2 = new DataLoader(mockState, mockContext, mockDependencies)
      await dataLoader2.init()
      expect(mockContext.fromCache).toBe(true)
    })

    it('should handle cache expiry correctly', async () => {
      // Set expired cache
      const oldTimestamp = Date.now() - CONFIG.cacheDuration - 1000
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        timestamp: oldTimestamp,
        data: { version: '1.0.0', trainings: [] }
      }))

      await dataLoader.init()

      // Should fetch fresh data
      expect(mockContext.fromCache).toBe(false)
    })
  })
})
