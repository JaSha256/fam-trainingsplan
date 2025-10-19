// tests/unit/url-filters-manager.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UrlFiltersManager } from '../../src/js/trainingsplaner/url-filters-manager.js'
import { CONFIG } from '../../src/js/config.js'
import { utils } from '../../src/js/utils.js'

describe('UrlFiltersManager', () => {
  let urlFiltersManager
  let mockContext
  let originalReplaceState
  let originalLocation

  beforeEach(() => {
    // Mock context
    mockContext = {
      $store: {
        ui: {
          filters: {
            wochentag: '',
            ort: '',
            training: '',
            altersgruppe: '',
            search: ''
          }
        }
      }
    }

    // Save originals
    originalReplaceState = window.history.replaceState
    originalLocation = window.location

    // Mock history API
    window.history.replaceState = vi.fn()

    // Mock window.location
    delete window.location
    window.location = {
      href: 'http://localhost:3000/',
      search: '',
      pathname: '/',
      origin: 'http://localhost:3000'
    }

    // Create UrlFiltersManager instance
    urlFiltersManager = new UrlFiltersManager(mockContext)
  })

  afterEach(() => {
    // Restore originals
    window.history.replaceState = originalReplaceState
    window.location = originalLocation

    vi.clearAllMocks()
  })

  // ==================== CONSTRUCTOR ====================

  describe('Constructor', () => {
    it('should initialize with provided context', () => {
      expect(urlFiltersManager.context).toBe(mockContext)
    })
  })

  // ==================== LOAD FILTERS FROM URL ====================

  describe('loadFiltersFromUrl()', () => {
    it('should parse URL parameters', () => {
      const mockFilters = {
        wochentag: 'Montag',
        ort: 'LTR',
        training: 'Parkour'
      }

      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue(mockFilters)

      urlFiltersManager.loadFiltersFromUrl()

      expect(utils.getFiltersFromUrl).toHaveBeenCalled()
    })

    it('should update context filters', () => {
      const mockFilters = {
        wochentag: 'Montag',
        ort: 'LTR'
      }

      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue(mockFilters)

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBe('Montag')
      expect(mockContext.$store.ui.filters.ort).toBe('LTR')
    })

    it('should handle empty URL parameters', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({})

      const originalFilters = { ...mockContext.$store.ui.filters }

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters).toEqual(originalFilters)
    })

    it('should handle single filter', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: 'Dienstag'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBe('Dienstag')
    })

    it('should handle multiple filters', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: 'Montag',
        ort: 'Balanstr.',
        training: 'Trampolin',
        altersgruppe: 'Kids'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBe('Montag')
      expect(mockContext.$store.ui.filters.ort).toBe('Balanstr.')
      expect(mockContext.$store.ui.filters.training).toBe('Trampolin')
      expect(mockContext.$store.ui.filters.altersgruppe).toBe('Kids')
    })

    it('should handle search filter', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        search: 'parkour'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.search).toBe('parkour')
    })

    it('should override existing filters', () => {
      mockContext.$store.ui.filters.wochentag = 'Mittwoch'
      mockContext.$store.ui.filters.ort = 'Old'

      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: 'Montag',
        ort: 'New'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBe('Montag')
      expect(mockContext.$store.ui.filters.ort).toBe('New')
    })

    it('should handle URL-encoded values', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        ort: 'LTR München',
        training: 'Parkour & Trampolin'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.ort).toBe('LTR München')
      expect(mockContext.$store.ui.filters.training).toBe('Parkour & Trampolin')
    })

    it('should not modify other filter properties', () => {
      mockContext.$store.ui.filters.altersgruppe = 'Teens'

      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: 'Montag'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.altersgruppe).toBe('Teens')
    })
  })

  // ==================== UPDATE URL WITH FILTERS ====================

  describe('updateUrlWithFilters()', () => {
    // Note: CONFIG.filters.persistInUrl defaults to true and is frozen
    // Tests for disabled state omitted

    it('should create share link with current filters', () => {

      vi.spyOn(utils, 'createShareLink').mockReturnValue('http://localhost:3000/?wochentag=Montag')

      urlFiltersManager.updateUrlWithFilters()

      expect(utils.createShareLink).toHaveBeenCalledWith(
        mockContext.$store.ui.filters
      )

    })

    it('should update URL using replaceState', () => {

      const mockUrl = 'http://localhost:3000/?wochentag=Montag'
      vi.spyOn(utils, 'createShareLink').mockReturnValue(mockUrl)

      urlFiltersManager.updateUrlWithFilters()

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        mockUrl
      )

    })

    it('should not trigger page reload', () => {

      vi.spyOn(utils, 'createShareLink').mockReturnValue('http://localhost:3000/?filter')

      urlFiltersManager.updateUrlWithFilters()

      // replaceState should be used (not pushState or assign)
      expect(window.history.replaceState).toHaveBeenCalled()

    })

    it('should handle empty filters', () => {

      vi.spyOn(utils, 'createShareLink').mockReturnValue('http://localhost:3000/')

      urlFiltersManager.updateUrlWithFilters()

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/'
      )

    })

    it('should handle multiple filters', () => {

      mockContext.$store.ui.filters = {
        wochentag: 'Montag',
        ort: 'LTR',
        training: 'Parkour'
      }

      vi.spyOn(utils, 'createShareLink').mockReturnValue(
        'http://localhost:3000/?wochentag=Montag&ort=LTR&training=Parkour'
      )

      urlFiltersManager.updateUrlWithFilters()

      expect(utils.createShareLink).toHaveBeenCalledWith(
        mockContext.$store.ui.filters
      )

    })

    it('should handle special characters in filters', () => {

      mockContext.$store.ui.filters = {
        ort: 'Balanstr. & Co.'
      }

      vi.spyOn(utils, 'createShareLink').mockReturnValue(
        'http://localhost:3000/?ort=Balanstr.%20%26%20Co.'
      )

      urlFiltersManager.updateUrlWithFilters()

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/?ort=Balanstr.%20%26%20Co.'
      )

    })
  })

  // ==================== INTEGRATION TESTS ====================

  describe('Integration', () => {
    it('should handle load -> update cycle', () => {

      // Load from URL
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: 'Montag',
        ort: 'LTR'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBe('Montag')

      // Update URL
      vi.spyOn(utils, 'createShareLink').mockReturnValue(
        'http://localhost:3000/?wochentag=Montag&ort=LTR'
      )

      urlFiltersManager.updateUrlWithFilters()

      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        'http://localhost:3000/?wochentag=Montag&ort=LTR'
      )

    })

    it('should handle filter changes', () => {

      // Initial filters
      vi.spyOn(utils, 'createShareLink').mockReturnValue('http://localhost:3000/?wochentag=Montag')
      urlFiltersManager.updateUrlWithFilters()

      expect(window.history.replaceState).toHaveBeenCalledTimes(1)

      // Update filters
      mockContext.$store.ui.filters.ort = 'LTR'
      vi.spyOn(utils, 'createShareLink').mockReturnValue('http://localhost:3000/?wochentag=Montag&ort=LTR')
      urlFiltersManager.updateUrlWithFilters()

      expect(window.history.replaceState).toHaveBeenCalledTimes(2)

    })

    it('should handle clearing filters', () => {

      // Set filters
      mockContext.$store.ui.filters.wochentag = 'Montag'
      vi.spyOn(utils, 'createShareLink').mockReturnValue('http://localhost:3000/?wochentag=Montag')
      urlFiltersManager.updateUrlWithFilters()

      // Clear filters
      mockContext.$store.ui.filters.wochentag = ''
      vi.spyOn(utils, 'createShareLink').mockReturnValue('http://localhost:3000/')
      urlFiltersManager.updateUrlWithFilters()

      expect(window.history.replaceState).toHaveBeenLastCalledWith(
        {},
        '',
        'http://localhost:3000/'
      )

    })
  })

  // ==================== EDGE CASES ====================

  describe('Edge Cases', () => {
    it('should handle null filters', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: null
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBeNull()
    })

    it('should handle undefined filters', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: undefined
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBeUndefined()
    })

    it('should handle empty string filters', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        wochentag: ''
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.wochentag).toBe('')
    })

    it('should handle very long filter values', () => {
      const longValue = 'a'.repeat(1000)

      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        search: longValue
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.search).toBe(longValue)
    })

    it('should handle filters with numbers', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        altersgruppe: '12-16'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.altersgruppe).toBe('12-16')
    })

    it('should handle filters with special unicode characters', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue({
        ort: 'München 🏃'
      })

      urlFiltersManager.loadFiltersFromUrl()

      expect(mockContext.$store.ui.filters.ort).toBe('München 🏃')
    })

    it('should handle malformed filters object', () => {
      vi.spyOn(utils, 'getFiltersFromUrl').mockReturnValue(null)

      // Should not throw
      expect(() => {
        urlFiltersManager.loadFiltersFromUrl()
      }).not.toThrow()
    })

    it('should handle missing $store', () => {
      const brokenContext = {}

      const manager = new UrlFiltersManager(brokenContext)

      // Should not throw, but will fail silently
      expect(() => {
        manager.loadFiltersFromUrl()
      }).toThrow()
    })
  })

  // ==================== CONFIG HANDLING ====================

  // Config Handling tests omitted - CONFIG.filters.persistInUrl is frozen at true
})
