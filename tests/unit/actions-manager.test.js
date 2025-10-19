// tests/unit/actions-manager.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ActionsManager } from '../../src/js/trainingsplaner/actions-manager.js'
import { utils } from '../../src/js/utils.js'
import calendar from '../../src/js/calendar-integration.js'

describe('ActionsManager', () => {
  let actionsManager
  let mockState
  let mockContext
  let mockDependencies
  let originalWindowOpen

  const mockTraining = {
    id: 1,
    wochentag: 'Montag',
    von: '18:00',
    bis: '20:00',
    training: 'Parkour',
    ort: 'LTR',
    altersgruppe: 'Kids',
    link: 'https://example.com/register'
  }

  beforeEach(() => {
    // Save original window.open
    originalWindowOpen = window.open

    // Mock state
    mockState = {}

    // Mock context
    mockContext = {
      allTrainings: [mockTraining],
      filteredTrainings: [mockTraining],
      favorites: [],
      $store: {
        ui: {
          showNotification: vi.fn(),
          filters: {
            wochentag: '',
            ort: '',
            training: ''
          }
        }
      }
    }

    // Mock dependencies
    mockDependencies = {
      hasActiveFilters: false,
      filteredTrainingsCount: 1
    }

    // Mock window.open
    window.open = vi.fn()

    // Create ActionsManager instance
    actionsManager = new ActionsManager(mockState, mockContext, mockDependencies)
  })

  afterEach(() => {
    // Restore window.open
    window.open = originalWindowOpen

    vi.clearAllMocks()
  })

  // ==================== CONSTRUCTOR ====================

  describe('Constructor', () => {
    it('should initialize with provided state and context', () => {
      expect(actionsManager.state).toBe(mockState)
      expect(actionsManager.context).toBe(mockContext)
      expect(actionsManager.dependencies).toBe(mockDependencies)
    })

    it('should expose hasActiveFilters getter', () => {
      expect(actionsManager.hasActiveFilters).toBe(false)

      mockDependencies.hasActiveFilters = true
      expect(actionsManager.hasActiveFilters).toBe(true)
    })

    it('should expose filteredTrainingsCount getter', () => {
      expect(actionsManager.filteredTrainingsCount).toBe(1)

      mockDependencies.filteredTrainingsCount = 5
      expect(actionsManager.filteredTrainingsCount).toBe(5)
    })
  })

  // ==================== ADD TO GOOGLE CALENDAR ====================

  describe('addToGoogleCalendar()', () => {
    it('should create Google Calendar URL', () => {
      const mockUrl = 'https://calendar.google.com/...'
      vi.spyOn(calendar, 'createGoogleCalendarUrl').mockReturnValue(mockUrl)

      actionsManager.addToGoogleCalendar(mockTraining)

      expect(calendar.createGoogleCalendarUrl).toHaveBeenCalledWith(mockTraining)
      expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank')
    })

    it('should show success notification', () => {
      vi.spyOn(calendar, 'createGoogleCalendarUrl').mockReturnValue('https://calendar.google.com')

      actionsManager.addToGoogleCalendar(mockTraining)

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Parkour'),
        'success',
        3000
      )
    })

    it('should handle errors gracefully', () => {
      vi.spyOn(calendar, 'createGoogleCalendarUrl').mockImplementation(() => {
        throw new Error('Calendar error')
      })

      actionsManager.addToGoogleCalendar(mockTraining)

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Fehler'),
        'error',
        3000
      )
    })
  })

  // ==================== ADD TO CALENDAR ====================

  describe('addToCalendar()', () => {
    it('should detect calendar provider automatically', () => {
      vi.spyOn(calendar, 'detectCalendarProvider').mockReturnValue('google')
      vi.spyOn(calendar, 'createGoogleCalendarUrl').mockReturnValue('https://google.com')

      actionsManager.addToCalendar(mockTraining)

      expect(calendar.detectCalendarProvider).toHaveBeenCalled()
    })

    it('should use provider override if provided', () => {
      vi.spyOn(calendar, 'detectCalendarProvider').mockReturnValue('google')
      vi.spyOn(calendar, 'createOutlookCalendarUrl').mockReturnValue('https://outlook.com')

      actionsManager.addToCalendar(mockTraining, 'outlook')

      expect(calendar.detectCalendarProvider).not.toHaveBeenCalled()
      expect(calendar.createOutlookCalendarUrl).toHaveBeenCalled()
    })

    it('should handle Google Calendar provider', () => {
      const mockUrl = 'https://calendar.google.com'
      vi.spyOn(calendar, 'createGoogleCalendarUrl').mockReturnValue(mockUrl)

      actionsManager.addToCalendar(mockTraining, 'google')

      expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank')
    })

    it('should handle Outlook provider', () => {
      const mockUrl = 'https://outlook.live.com'
      vi.spyOn(calendar, 'createOutlookCalendarUrl').mockReturnValue(mockUrl)

      actionsManager.addToCalendar(mockTraining, 'outlook')

      expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank')
    })

    it('should handle Office365 provider', () => {
      const mockUrl = 'https://outlook.office.com'
      vi.spyOn(calendar, 'createOffice365CalendarUrl').mockReturnValue(mockUrl)

      actionsManager.addToCalendar(mockTraining, 'office365')

      expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank')
    })

    it('should handle Yahoo provider', () => {
      const mockUrl = 'https://calendar.yahoo.com'
      vi.spyOn(calendar, 'createYahooCalendarUrl').mockReturnValue(mockUrl)

      actionsManager.addToCalendar(mockTraining, 'yahoo')

      expect(window.open).toHaveBeenCalledWith(mockUrl, '_blank')
    })

    it('should handle Apple/iCal provider with download', () => {
      vi.spyOn(calendar, 'downloadICalFile').mockImplementation(() => {})

      actionsManager.addToCalendar(mockTraining, 'apple')

      expect(calendar.downloadICalFile).toHaveBeenCalledWith(mockTraining)
      expect(window.open).not.toHaveBeenCalled()
      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        'Kalenderdatei heruntergeladen',
        'success',
        3000
      )
    })

    it('should handle iCal provider with download', () => {
      vi.spyOn(calendar, 'downloadICalFile').mockImplementation(() => {})

      actionsManager.addToCalendar(mockTraining, 'ical')

      expect(calendar.downloadICalFile).toHaveBeenCalledWith(mockTraining)
    })

    it('should show provider name in notification', () => {
      vi.spyOn(calendar, 'createGoogleCalendarUrl').mockReturnValue('https://google.com')
      vi.spyOn(calendar, 'getCalendarProviderName').mockReturnValue('Google Calendar')

      actionsManager.addToCalendar(mockTraining, 'google')

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Google Calendar'),
        'success',
        3000
      )
    })

    it('should handle unknown provider', () => {
      actionsManager.addToCalendar(mockTraining, 'unknown')

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Fehler'),
        'error',
        3000
      )
    })

    it('should handle errors during URL creation', () => {
      vi.spyOn(calendar, 'createGoogleCalendarUrl').mockImplementation(() => {
        throw new Error('URL error')
      })

      actionsManager.addToCalendar(mockTraining, 'google')

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Fehler'),
        'error',
        3000
      )
    })
  })

  // ==================== BULK ADD TO GOOGLE CALENDAR ====================

  describe('bulkAddToGoogleCalendar()', () => {
    beforeEach(() => {
      mockContext.filteredTrainings = [
        mockTraining,
        { ...mockTraining, id: 2 },
        { ...mockTraining, id: 3 }
      ]
    })

    it('should show warning if no trainings to export', async () => {
      mockContext.filteredTrainings = []

      await actionsManager.bulkAddToGoogleCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        'Keine Trainings zum Exportieren',
        'warning',
        3000
      )
    })

    it('should show loading notification', async () => {
      vi.spyOn(calendar, 'bulkAddToGoogleCalendar').mockResolvedValue({
        success: true,
        exported: 3,
        total: 3
      })

      await actionsManager.bulkAddToGoogleCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Exportiere'),
        'info',
        2000
      )
    })

    it('should call calendar.bulkAddToGoogleCalendar', async () => {
      vi.spyOn(calendar, 'bulkAddToGoogleCalendar').mockResolvedValue({
        success: true,
        exported: 3,
        total: 3
      })

      await actionsManager.bulkAddToGoogleCalendar()

      expect(calendar.bulkAddToGoogleCalendar).toHaveBeenCalledWith(
        mockContext.filteredTrainings,
        expect.objectContaining({
          maxBulk: 10,
          delay: 600
        })
      )
    })

    it('should show success notification on completion', async () => {
      vi.spyOn(calendar, 'bulkAddToGoogleCalendar').mockResolvedValue({
        success: true,
        exported: 3,
        total: 3
      })

      await actionsManager.bulkAddToGoogleCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('3 von 3'),
        'success',
        5000
      )
    })

    it('should show error notification on failure', async () => {
      vi.spyOn(calendar, 'bulkAddToGoogleCalendar').mockResolvedValue({
        success: false,
        message: 'Export failed'
      })

      await actionsManager.bulkAddToGoogleCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        'Export failed',
        'error',
        5000
      )
    })

    it('should handle exceptions during export', async () => {
      vi.spyOn(calendar, 'bulkAddToGoogleCalendar').mockRejectedValue(new Error('Network error'))

      await actionsManager.bulkAddToGoogleCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('Bulk-Export'),
        'error',
        5000
      )
    })
  })

  // ==================== EXPORT ALL TO CALENDAR ====================

  describe('exportAllToCalendar()', () => {
    it('should show warning if no trainings to export', async () => {
      mockContext.filteredTrainings = []

      await actionsManager.exportAllToCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        'Keine Trainings zum Exportieren',
        'warning',
        3000
      )
    })

    it('should create iCal bundle', async () => {
      vi.spyOn(utils, 'createICalBundle').mockReturnValue('BEGIN:VCALENDAR...')
      vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

      await actionsManager.exportAllToCalendar()

      expect(utils.createICalBundle).toHaveBeenCalledWith(mockContext.filteredTrainings)
    })

    it('should download iCal file with timestamp', async () => {
      vi.spyOn(utils, 'createICalBundle').mockReturnValue('BEGIN:VCALENDAR...')
      vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

      await actionsManager.exportAllToCalendar()

      expect(utils.downloadICalFile).toHaveBeenCalledWith(
        'BEGIN:VCALENDAR...',
        expect.stringMatching(/fam-trainings-\d+\.ics/)
      )
    })

    it('should show success notification with count', async () => {
      mockContext.filteredTrainings = [mockTraining, { ...mockTraining, id: 2 }]
      vi.spyOn(utils, 'createICalBundle').mockReturnValue('BEGIN:VCALENDAR...')
      vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

      await actionsManager.exportAllToCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('2 Trainings'),
        'success',
        3000
      )
    })

    it('should handle export errors', async () => {
      vi.spyOn(utils, 'createICalBundle').mockImplementation(() => {
        throw new Error('Export error')
      })

      await actionsManager.exportAllToCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('fehlgeschlagen'),
        'error',
        5000
      )
    })
  })

  // ==================== EXPORT FAVORITES TO CALENDAR ====================

  describe('exportFavoritesToCalendar()', () => {
    it('should show warning if no favorites', async () => {
      mockContext.favorites = []

      await actionsManager.exportFavoritesToCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        'Keine Favoriten zum Exportieren',
        'warning',
        3000
      )
    })

    it('should filter trainings by favorites', async () => {
      mockContext.allTrainings = [
        { ...mockTraining, id: 1 },
        { ...mockTraining, id: 2 },
        { ...mockTraining, id: 3 }
      ]
      mockContext.favorites = [1, 3]

      vi.spyOn(utils, 'createICalBundle').mockReturnValue('BEGIN:VCALENDAR...')
      vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

      await actionsManager.exportFavoritesToCalendar()

      expect(utils.createICalBundle).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({ id: 3 })
        ])
      )
    })

    it('should download iCal file with "favoriten" in filename', async () => {
      mockContext.favorites = [1]
      vi.spyOn(utils, 'createICalBundle').mockReturnValue('BEGIN:VCALENDAR...')
      vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

      await actionsManager.exportFavoritesToCalendar()

      expect(utils.downloadICalFile).toHaveBeenCalledWith(
        'BEGIN:VCALENDAR...',
        expect.stringMatching(/fam-favoriten-\d+\.ics/)
      )
    })

    it('should show success notification with count', async () => {
      mockContext.allTrainings = [
        { ...mockTraining, id: 1 },
        { ...mockTraining, id: 2 }
      ]
      mockContext.favorites = [1, 2]

      vi.spyOn(utils, 'createICalBundle').mockReturnValue('BEGIN:VCALENDAR...')
      vi.spyOn(utils, 'downloadICalFile').mockImplementation(() => {})

      await actionsManager.exportFavoritesToCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('2 Favoriten'),
        'success',
        3000
      )
    })

    it('should handle export errors', async () => {
      mockContext.favorites = [1]
      vi.spyOn(utils, 'createICalBundle').mockImplementation(() => {
        throw new Error('Export error')
      })

      await actionsManager.exportFavoritesToCalendar()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('fehlgeschlagen'),
        'error',
        5000
      )
    })
  })

  // ==================== SHARE CURRENT VIEW ====================

  describe('shareCurrentView()', () => {
    beforeEach(() => {
      vi.spyOn(utils, 'createShareLink').mockReturnValue('https://example.com/?filters')
    })

    it('should create share link with filters', async () => {
      await actionsManager.shareCurrentView()

      expect(utils.createShareLink).toHaveBeenCalledWith(
        mockContext.$store.ui.filters
      )
    })

    it('should use Web Share API if available', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined)
      const mockCanShare = vi.fn().mockReturnValue(true)

      global.navigator.share = mockShare
      global.navigator.canShare = mockCanShare

      await actionsManager.shareCurrentView()

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'FAM Trainingsplan',
          url: 'https://example.com/?filters'
        })
      )
    })

    it('should include filter count in share text when filters active', async () => {
      mockDependencies.hasActiveFilters = true
      mockDependencies.filteredTrainingsCount = 5

      const mockShare = vi.fn().mockResolvedValue(undefined)
      const mockCanShare = vi.fn().mockReturnValue(true)

      global.navigator.share = mockShare
      global.navigator.canShare = mockCanShare

      await actionsManager.shareCurrentView()

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('5 Trainings')
        })
      )
    })

    it('should use generic text when no filters active', async () => {
      mockDependencies.hasActiveFilters = false

      const mockShare = vi.fn().mockResolvedValue(undefined)
      const mockCanShare = vi.fn().mockReturnValue(true)

      global.navigator.share = mockShare
      global.navigator.canShare = mockCanShare

      await actionsManager.shareCurrentView()

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Entdecke alle')
        })
      )
    })

    it('should fallback to clipboard if Web Share not available', async () => {
      global.navigator.share = undefined
      global.navigator.canShare = undefined

      vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(true)

      await actionsManager.shareCurrentView()

      expect(utils.copyToClipboard).toHaveBeenCalledWith('https://example.com/?filters')
    })

    it('should show clipboard success notification', async () => {
      global.navigator.share = undefined
      vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(true)

      await actionsManager.shareCurrentView()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('kopiert'),
        'success',
        3000
      )
    })

    it('should handle clipboard failure', async () => {
      global.navigator.share = undefined
      vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(false)

      await actionsManager.shareCurrentView()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('fehlgeschlagen'),
        'error',
        3000
      )
    })

    it('should ignore AbortError from share cancellation', async () => {
      const mockShare = vi.fn().mockRejectedValue(Object.assign(new Error('Abort'), { name: 'AbortError' }))
      const mockCanShare = vi.fn().mockReturnValue(true)

      global.navigator.share = mockShare
      global.navigator.canShare = mockCanShare

      await actionsManager.shareCurrentView()

      // Should not show error notification for AbortError
      expect(mockContext.$store.ui.showNotification).not.toHaveBeenCalledWith(
        expect.anything(),
        'error',
        expect.anything()
      )
    })

    it('should handle other share errors', async () => {
      const mockShare = vi.fn().mockRejectedValue(new Error('Share failed'))
      const mockCanShare = vi.fn().mockReturnValue(true)

      global.navigator.share = mockShare
      global.navigator.canShare = mockCanShare

      await actionsManager.shareCurrentView()

      expect(mockContext.$store.ui.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('fehlgeschlagen'),
        'error',
        3000
      )
    })
  })
})
