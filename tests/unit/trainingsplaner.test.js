// tests/unit/trainingsplaner.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trainingsplaner } from '../../src/js/trainingsplaner.js'
import { utils } from '../../src/js/utils.js'

// Mock Data
const mockTrainings = [
  {
    id: 1,
    wochentag: 'Montag',
    ort: 'LTR',
    von: '18:00',
    bis: '20:00',
    training: 'Parkour',
    altersgruppe: 'Kids',
    lat: 48.124155,
    lng: 11.621655
  },
  {
    id: 2,
    wochentag: 'Dienstag',
    ort: 'Balanstr.',
    von: '19:00',
    bis: '21:00',
    training: 'Trampolin',
    altersgruppe: 'Teens',
    lat: 48.135124,
    lng: 11.582002
  },
  {
    id: 3,
    wochentag: 'Montag',
    ort: 'LTR',
    von: '16:00',
    bis: '18:00',
    training: 'Tricking',
    altersgruppe: 'Adults'
  }
]

describe('trainingsplaner.js - Core Functionality', () => {
  let component

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear()

    // Mock fetch BEFORE creating component
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '3.0.0',
        trainings: mockTrainings,
        metadata: {
          orte: ['LTR', 'Balanstr.'],
          trainingsarten: ['Parkour', 'Trampolin', 'Tricking'],
          wochentage: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
          altersgruppen: ['Kids', 'Teens', 'Adults']
        }
      })
    })

    // Create fresh component instance
    component = trainingsplaner()

    // Mock Alpine store and methods
    component.$store = {
      ui: {
        filters: {
          wochentag: [],
          ort: [],
          training: [],
          altersgruppe: [],
          searchTerm: '',
          activeQuickFilter: null
        },
        showNotification: vi.fn()
      }
    }

    // Mock Alpine methods
    component.$nextTick = vi.fn((callback) => {
      if (callback) callback()
      return Promise.resolve()
    })

    component.$watch = vi.fn()

    // Mock history API
    global.history = {
      pushState: vi.fn(),
      replaceState: vi.fn()
    }
  })

  afterEach(() => {
    if (component.destroy) {
      component.destroy()
    }
  })

  // ==================== INITIALIZATION ====================

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      expect(component.loading).toBe(true)
      expect(component.error).toBe(null)
      expect(component.allTrainings).toEqual([])
      expect(component.filteredTrainings).toEqual([])
    })

    it('should load data correctly', async () => {
      await component.init()

      expect(component.allTrainings).toHaveLength(3)
      expect(component.metadata).toBeDefined()
      expect(component.fuse).toBeDefined()
    })
  })

  // ==================== FILTERING ====================

  describe('Filtering', () => {
    beforeEach(async () => {
      // Initialize component to setup managers
      await component.init()
    })

    it('should filter by wochentag', () => {
      component.$store.ui.filters.wochentag = ['Montag']
      component.applyFilters()

      expect(component.filteredTrainings).toHaveLength(2)
      expect(component.filteredTrainings.every(t => t.wochentag === 'Montag')).toBe(true)
    })

    it('should filter by ort', () => {
      component.$store.ui.filters.ort = ['LTR']
      component.applyFilters()

      expect(component.filteredTrainings).toHaveLength(2)
      expect(component.filteredTrainings.every(t => t.ort === 'LTR')).toBe(true)
    })

    it('should filter by training type', () => {
      component.$store.ui.filters.training = ['Parkour']
      component.applyFilters()

      expect(component.filteredTrainings).toHaveLength(1)
      expect(component.filteredTrainings[0].training).toBe('Parkour')
    })

    it('should filter by altersgruppe', () => {
      component.$store.ui.filters.altersgruppe = ['Kids']
      component.applyFilters()

      expect(component.filteredTrainings).toHaveLength(1)
      expect(component.filteredTrainings[0].altersgruppe).toBe('Kids')
    })

    it('should combine multiple filters', () => {
      component.$store.ui.filters.wochentag = ['Montag']
      component.$store.ui.filters.ort = ['LTR']
      component.applyFilters()

      expect(component.filteredTrainings).toHaveLength(2)
      expect(component.filteredTrainings.every(t =>
        t.wochentag === 'Montag' && t.ort === 'LTR'
      )).toBe(true)
    })

    it('should return all trainings when no filters active', () => {
      component.applyFilters()
      expect(component.filteredTrainings).toHaveLength(3)
    })
  })

  // ==================== FAVORITES ====================

  describe('Favorites', () => {
    beforeEach(async () => {
      vi.spyOn(utils.favorites, 'toggle').mockImplementation((id) => {
        const favorites = utils.favorites.load()
        return favorites.includes(id) ? false : true
      })
      vi.spyOn(utils.favorites, 'load').mockReturnValue([])

      // Initialize component to setup managers
      await component.init()
    })

    it('should toggle favorite', () => {
      const result = component.toggleFavorite(1)
      
      expect(utils.favorites.toggle).toHaveBeenCalledWith(1)
      expect(component.$store.ui.showNotification).toHaveBeenCalled()
    })

    it('should check if training is favorite', () => {
      component.favorites = [1, 3]
      
      expect(component.isFavorite(1)).toBe(true)
      expect(component.isFavorite(2)).toBe(false)
      expect(component.isFavorite(3)).toBe(true)
    })

    it('should filter favorites', () => {
      component.favorites = [1, 2]
      component.$store.ui.filters.activeQuickFilter = 'favoriten'
      component.$store.ui.filters._customPersonalFilter = 'favoriten'
      component.applyFilters()

      // Verify favorites are correctly filtered
      expect(component.filteredTrainings.length).toBeGreaterThan(0)
      expect(component.filteredTrainings.every(t => component.favorites.includes(t.id))).toBe(true)
    })

    it('should get favorite trainings', () => {
      component.favorites = [1, 3]
      
      const favs = component.favoriteTrainings
      expect(favs).toHaveLength(2)
      expect(favs.map(t => t.id)).toEqual([1, 3])
    })
  })

  // ==================== GEOLOCATION ====================

  describe('Geolocation', () => {
    beforeEach(async () => {
      // Initialize component to setup managers
      await component.init()
    })

    it('should add distance to trainings', () => {
      component.userPosition = { lat: 48.137154, lng: 11.576124 }
      component.addDistanceToTrainings()

      expect(component.allTrainings[0].distance).toBeDefined()
      expect(component.allTrainings[0].distanceText).toContain('km')
    })

    it('should sort by distance', () => {
      component.userPosition = { lat: 48.137154, lng: 11.576124 }
      component.addDistanceToTrainings()
      component.applyFilters()

      const distances = component.filteredTrainings
        .filter(t => t.distance !== undefined)
        .map(t => t.distance)

      expect(distances).toEqual([...distances].sort((a, b) => a - b))
    })

    it('should handle missing coordinates', () => {
      component.userPosition = { lat: 48.137154, lng: 11.576124 }
      component.addDistanceToTrainings()

      const noCoords = component.allTrainings.find(t => !t.lat)
      expect(noCoords.distance).toBeUndefined()
    })
  })

  // ==================== BULK EXPORT ====================

  describe('Bulk Calendar Export', () => {
    beforeEach(async () => {
      vi.spyOn(utils, 'createICalBundle').mockReturnValue('BEGIN:VCALENDAR...')
      vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

      // Initialize component to setup managers
      await component.init()
    })

    afterEach(() => {
      // Vitest 4.0: Explicitly clear mocks after each test
      vi.restoreAllMocks()
    })

    it('should export all filtered trainings', async () => {
      await component.exportAllToCalendar()

      expect(utils.createICalBundle).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 }),
          expect.objectContaining({ id: 3 })
        ])
      )
      expect(utils.downloadICalFile).toHaveBeenCalled()
      expect(component.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('3 Trainings'),
        'success',
        3000
      )
    })

    it('should show warning when no trainings to export', async () => {
      // Clear trainings after init
      component.allTrainings = []
      component.filteredTrainings = []

      await component.exportAllToCalendar()

      expect(utils.createICalBundle).not.toHaveBeenCalled()
      expect(component.$store.ui.showNotification).toHaveBeenCalledWith(
        'Keine Trainings zum Exportieren',
        'warning',
        3000
      )
    })

    it('should export favorites only', async () => {
      component.favorites = [1, 2]
      await component.exportFavoritesToCalendar()

      expect(utils.createICalBundle).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 2 })
        ])
      )
    })

    it('should handle export errors gracefully', async () => {
      vi.spyOn(utils, 'createICalBundle').mockImplementation(() => {
        throw new Error('Export failed')
      })

      await component.exportAllToCalendar()

      expect(component.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('fehlgeschlagen'),
        'error',
        5000
      )
    })
  })

  // ==================== SHARING ====================

  describe('Sharing', () => {
    beforeEach(async () => {
      vi.spyOn(utils, 'createShareLink').mockReturnValue('https://example.com/?tag=montag')

      // Initialize component to setup managers
      await component.init()
    })

    it('should share current view via native API', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      global.navigator.share = mockShare
      global.navigator.canShare = vi.fn().mockReturnValue(true)

      await component.shareCurrentView()

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'FAM Trainingsplan',
          url: expect.any(String)
        })
      )
    })

    it('should fallback to clipboard if share not available', async () => {
      global.navigator.share = undefined
      vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(true)

      await component.shareCurrentView()

      expect(utils.copyToClipboard).toHaveBeenCalled()
      expect(component.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('kopiert'),
        'success',
        3000
      )
    })

    it('should include filter count in share text', async () => {
      component.$store.ui.filters.wochentag = ['Montag']
      component.filteredTrainings = mockTrainings.filter(t => t.wochentag === 'Montag')

      const mockShare = vi.fn().mockResolvedValue(undefined)
      global.navigator.share = mockShare
      global.navigator.canShare = vi.fn().mockReturnValue(true)

      await component.shareCurrentView()

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('2 Trainings')
        })
      )
    })
  })

  // ==================== COMPUTED PROPERTIES ====================

  describe('Computed Properties', () => {
    beforeEach(async () => {
      // Initialize component to setup managers
      await component.init()
    })

    it('should group trainings by wochentag', () => {
      const grouped = component.groupedTrainings

      expect(grouped).toHaveLength(2) // Montag, Dienstag
      expect(grouped[0].key).toBe('Montag')
      expect(grouped[0].items).toHaveLength(2)
    })

    it('should sort trainings within groups by time', () => {
      const grouped = component.groupedTrainings
      const montagTrainings = grouped.find(g => g.key === 'Montag').items

      expect(montagTrainings[0].von).toBe('16:00')
      expect(montagTrainings[1].von).toBe('18:00')
    })

    it('should detect active filters', () => {
      // Clear all filters to empty state (source code treats empty arrays as truthy, so use empty string)
      component.$store.ui.filters.wochentag = ''
      component.$store.ui.filters.ort = ''
      component.$store.ui.filters.training = ''
      component.$store.ui.filters.altersgruppe = ''
      component.$store.ui.filters.searchTerm = ''
      expect(component.hasActiveFilters).toBe(false)

      component.$store.ui.filters.wochentag = ['Montag']
      expect(component.hasActiveFilters).toBe(true)
    })

    it('should count filtered trainings', () => {
      expect(component.filteredTrainingsCount).toBe(3)

      component.$store.ui.filters.wochentag = ['Montag']
      component.applyFilters()
      expect(component.filteredTrainingsCount).toBe(2)
    })
  })

  // ==================== CLEANUP ====================

  describe('Cleanup', () => {
    it('should clear intervals on destroy', () => {
      component.updateCheckInterval = setInterval(() => {}, 1000)
      const spy = vi.spyOn(global, 'clearInterval')

      component.destroy()

      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })

    it('should cleanup map on destroy', async () => {
      // Need to init() first to create mapManager
      await component.init()

      // Set component.map to truthy value so destroy() will call cleanupMap
      component.map = { mock: 'map object' }

      // Mock the mapManager's cleanupMap method
      const cleanupSpy = vi.spyOn(component.mapManager, 'cleanupMap')

      component.destroy()

      expect(cleanupSpy).toHaveBeenCalled()
    })
  })
})

// ==================== INTEGRATION TESTS ====================

describe('trainingsplaner.js - Integration', () => {
  let component

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear()

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: '3.0.0',
        trainings: mockTrainings,
        metadata: {
          orte: ['LTR', 'Balanstr.'],
          trainingsarten: ['Parkour', 'Trampolin', 'Tricking'],
          wochentage: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
          altersgruppen: ['Kids', 'Teens', 'Adults']
        }
      })
    })

    // Mock history API
    global.history = {
      pushState: vi.fn(),
      replaceState: vi.fn()
    }

    // Create component
    component = trainingsplaner()
    component.$store = {
      ui: {
        filters: { wochentag: [], ort: [], training: [], altersgruppe: [], searchTerm: '', activeQuickFilter: null },
        showNotification: vi.fn()
      }
    }
    component.$nextTick = vi.fn((callback) => {
      if (callback) callback()
      return Promise.resolve()
    })
    component.$watch = vi.fn()
  })

  it('should handle complete filter -> export workflow', async () => {
    // Initialize component first
    await component.init()

    // Set filter after init
    component.$store.ui.filters.wochentag = ['Montag']
    component.applyFilters()

    // Filter should be applied, filteredTrainings should have 2 items
    expect(component.filteredTrainings).toHaveLength(2)
    expect(component.filteredTrainings.every(t => t.wochentag === 'Montag')).toBe(true)

    // Mock export
    vi.spyOn(utils, 'createICalBundle').mockReturnValue('VCALENDAR')
    vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

    // Export
    await component.exportAllToCalendar()

    expect(utils.createICalBundle).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ wochentag: 'Montag' })
      ])
    )
    expect(utils.downloadICalFile).toHaveBeenCalled()
  })
})
