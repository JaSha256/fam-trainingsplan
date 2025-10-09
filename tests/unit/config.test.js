// tests/unit/config.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  CONFIG,
  isFeatureEnabled,
  isValidCoordinates,
  isValidCacheKey,
  getBrowserInfo,
  shouldLog,
  log,
  getMapConfig,
  getUIConfig,
  isDevelopment
} from '../../src/js/config.js'

describe('config.js', () => {
  describe('CONFIG object', () => {
    it('should be immutable', () => {
      expect(() => {
        CONFIG.cacheEnabled = false
      }).toThrow()
    })

    it('should have all required keys', () => {
      expect(CONFIG).toHaveProperty('jsonUrl')
      expect(CONFIG).toHaveProperty('cacheEnabled')
      expect(CONFIG).toHaveProperty('features')
      expect(CONFIG).toHaveProperty('map')
      expect(CONFIG).toHaveProperty('pwa')
    })

    it('should have valid URLs', () => {
      expect(CONFIG.jsonUrl).toMatch(/^https?:\/\//)
      expect(CONFIG.versionUrl).toMatch(/^https?:\/\//)
    })
  })

  describe('isFeatureEnabled()', () => {
    it('should return boolean for existing features', () => {
      expect(isFeatureEnabled('enableMap')).toBe(true)
      expect(isFeatureEnabled('enableAnalytics')).toBe(false)
    })

    it('should return false for non-existing features', () => {
      expect(isFeatureEnabled('nonExistingFeature')).toBe(false)
    })
  })

  describe('isValidCoordinates()', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinates(48.1351, 11.5820)).toBe(true)
      expect(isValidCoordinates(0, 0)).toBe(true)
      expect(isValidCoordinates(-90, -180)).toBe(true)
      expect(isValidCoordinates(90, 180)).toBe(true)
    })

    it('should reject invalid coordinates', () => {
      expect(isValidCoordinates(91, 11)).toBe(false)
      expect(isValidCoordinates(48, 181)).toBe(false)
      expect(isValidCoordinates('48', 11)).toBe(false)
      expect(isValidCoordinates(NaN, 11)).toBe(false)
    })
  })

  describe('isValidCacheKey()', () => {
    it('should validate correct cache keys', () => {
      expect(isValidCacheKey('trainingsplan_cache')).toBe(true)
      expect(isValidCacheKey('a')).toBe(true)
    })

    it('should reject invalid cache keys', () => {
      expect(isValidCacheKey('')).toBe(false)
      expect(isValidCacheKey('a'.repeat(300))).toBe(false)
      expect(isValidCacheKey(null)).toBe(false)
      expect(isValidCacheKey(123)).toBe(false)
    })
  })

  describe('getBrowserInfo()', () => {
    beforeEach(() => {
      // Mock window.matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
    })

    it('should return browser capabilities', () => {
      const info = getBrowserInfo()

      expect(info).toHaveProperty('isMobile')
      expect(info).toHaveProperty('isTouch')
      expect(info).toHaveProperty('supportsLocalStorage')
      expect(info).toHaveProperty('supportsGeolocation')
      expect(typeof info.isMobile).toBe('boolean')
    })

    it('should detect localStorage support', () => {
      const info = getBrowserInfo()
      expect(typeof info.supportsLocalStorage).toBe('boolean')
    })
  })

  describe('shouldLog()', () => {
    it('should respect log levels', () => {
      // In dev mode, all levels should be true
      if (isDevelopment()) {
        expect(shouldLog('debug')).toBe(true)
        expect(shouldLog('info')).toBe(true)
        expect(shouldLog('warn')).toBe(true)
        expect(shouldLog('error')).toBe(true)
      }
    })

    it('should return false for invalid levels', () => {
      expect(shouldLog('invalid')).toBe(false)
    })
  })

  describe('log()', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
      vi.spyOn(console, 'info').mockImplementation(() => {})
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should not log when disabled', () => {
      if (!isDevelopment()) {
        log('debug', 'test message')
        expect(console.log).not.toHaveBeenCalled()
      }
    })

    it('should use correct console methods', () => {
      if (isDevelopment()) {
        log('error', 'error message')
        expect(console.error).toHaveBeenCalled()
        
        log('warn', 'warn message')
        expect(console.warn).toHaveBeenCalled()
      }
    })
  })

  describe('getMapConfig()', () => {
    it('should return map config with memoization', () => {
      const config1 = getMapConfig()
      const config2 = getMapConfig()

      expect(config1).toEqual(config2)
      // Memoization returns same reference for performance
      expect(config1).toBe(config2)
    })

    it('should have valid map configuration', () => {
      const mapConfig = getMapConfig()

      expect(mapConfig.defaultCenter).toHaveLength(2)
      expect(mapConfig.defaultZoom).toBeGreaterThan(0)
      expect(mapConfig.tileLayerUrl).toMatch(/^https?:\/\//)
    })
  })

  describe('getUIConfig()', () => {
    it('should return UI configuration', () => {
      const uiConfig = getUIConfig()
      
      expect(uiConfig).toHaveProperty('mobileBreakpoint')
      expect(uiConfig).toHaveProperty('animationDuration')
      expect(uiConfig).toHaveProperty('touch')
    })
  })

  describe('Feature Flags', () => {
    it('should have immutable feature flags', () => {
      expect(() => {
        CONFIG.features.enableMap = false
      }).toThrow()
    })

    it('should have boolean values', () => {
      Object.values(CONFIG.features).forEach(value => {
        expect(typeof value).toBe('boolean')
      })
    })
  })
})