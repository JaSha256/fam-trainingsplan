// tests/unit/calendar-integration.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  createOffice365CalendarUrl,
  createYahooCalendarUrl,
  detectCalendarProvider,
  getCalendarProviderName,
  bulkAddToGoogleCalendar,
  downloadICalFile,
  calendarProviders
} from '../../src/js/calendar-integration.js'

describe('calendar-integration.js', () => {
  // Mock Training Data
  const mockTraining = {
    id: 1,
    wochentag: 'Montag',
    von: '18:00',
    bis: '20:00',
    training: 'Parkour',
    ort: 'LTR',
    altersgruppe: 'Kids',
    trainer: 'Max Mustermann',
    anmerkung: 'Bitte pünktlich sein',
    link: 'https://example.com/anmeldung',
    adresse: 'Musterstraße 123, München'
  }

  describe('createGoogleCalendarUrl()', () => {
    it('should generate valid Google Calendar URL', () => {
      const url = createGoogleCalendarUrl(mockTraining)

      expect(url).toContain('calendar.google.com/calendar/render')
      expect(url).toContain('action=TEMPLATE')
      expect(url).toContain('text=Parkour')
      // URLSearchParams encodes spaces as + or %20 (both valid)
      expect(url).toMatch(/text=Parkour(\+|%20)-(\+|%20)LTR/)
    })

    it('should include event details', () => {
      const url = createGoogleCalendarUrl(mockTraining)

      expect(url).toContain('details=')
      expect(url).toContain('Parkour')
      expect(url).toContain('Kids')
    })

    it('should include location', () => {
      const url = createGoogleCalendarUrl(mockTraining)

      expect(url).toContain('location=')
      expect(url).toContain('LTR')
    })

    it('should handle training without address', () => {
      const trainingNoAddress = { ...mockTraining, adresse: null }
      const url = createGoogleCalendarUrl(trainingNoAddress)

      expect(url).toContain('location=LTR')
    })

    it('should include dates parameter', () => {
      const url = createGoogleCalendarUrl(mockTraining)

      expect(url).toContain('dates=')
      // Format should be: YYYYMMDDTHHmmssZ/YYYYMMDDTHHmmssZ
      expect(url).toMatch(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/)
    })
  })

  describe('createOutlookCalendarUrl()', () => {
    it('should generate valid Outlook Calendar URL', () => {
      const url = createOutlookCalendarUrl(mockTraining)

      expect(url).toContain('outlook.live.com')
      expect(url).toContain('subject=')
      expect(url).toContain('Parkour')
    })

    it('should include start and end dates in ISO format', () => {
      const url = createOutlookCalendarUrl(mockTraining)

      expect(url).toContain('startdt=')
      expect(url).toContain('enddt=')
      // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(url).toMatch(/startdt=\d{4}-\d{2}-\d{2}T/)
    })
  })

  describe('createOffice365CalendarUrl()', () => {
    it('should generate valid Office 365 Calendar URL', () => {
      const url = createOffice365CalendarUrl(mockTraining)

      expect(url).toContain('outlook.office.com')
      expect(url).toContain('subject=')
    })
  })

  describe('createYahooCalendarUrl()', () => {
    it('should generate valid Yahoo Calendar URL', () => {
      const url = createYahooCalendarUrl(mockTraining)

      expect(url).toContain('calendar.yahoo.com')
      expect(url).toContain('title=')
      expect(url).toContain('Parkour')
    })

    it('should include Yahoo-specific parameters', () => {
      const url = createYahooCalendarUrl(mockTraining)

      expect(url).toContain('v=60') // Yahoo Calendar version
      expect(url).toContain('st=') // Start time
      expect(url).toContain('et=') // End time
    })
  })

  describe('bulkAddToGoogleCalendar()', () => {
    beforeEach(() => {
      // Mock window.open
      global.window.open = vi.fn(() => ({ closed: false }))
    })

    it('should handle empty trainings array', async () => {
      const result = await bulkAddToGoogleCalendar([])

      expect(result.success).toBe(false)
      expect(result.message).toContain('Keine Trainings')
      expect(result.exported).toBe(0)
    })

    it('should export single training', async () => {
      const result = await bulkAddToGoogleCalendar([mockTraining])

      expect(result.success).toBe(true)
      expect(result.exported).toBe(1)
      expect(result.total).toBe(1)
      expect(window.open).toHaveBeenCalledTimes(1)
    })

    it('should respect maxBulk limit', async () => {
      const trainings = Array(15).fill(mockTraining).map((t, i) => ({
        ...t,
        id: i + 1
      }))

      const result = await bulkAddToGoogleCalendar(trainings, { maxBulk: 5 })

      expect(result.total).toBe(5)
      expect(window.open).toHaveBeenCalledTimes(5)
    })

    it('should call onProgress callback', async () => {
      const onProgress = vi.fn()
      const trainings = [mockTraining, { ...mockTraining, id: 2 }]

      await bulkAddToGoogleCalendar(trainings, {
        onProgress,
        delay: 10
      })

      expect(onProgress).toHaveBeenCalledTimes(2)
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          current: 1,
          total: 2
        })
      )
    })

    it('should handle popup blocking', async () => {
      // Mock blocked popup
      global.window.open = vi.fn(() => null)

      const result = await bulkAddToGoogleCalendar([mockTraining])

      expect(result.exported).toBe(0)
      expect(result.errors).toBeDefined()
      expect(result.errors).toHaveLength(1)
    })

    it('should use custom delay', async () => {
      vi.useFakeTimers()

      const promise = bulkAddToGoogleCalendar(
        [mockTraining, { ...mockTraining, id: 2 }],
        { delay: 100 }
      )

      // First opens immediately
      expect(window.open).toHaveBeenCalledTimes(1)

      // Advance time
      await vi.advanceTimersByTimeAsync(100)

      // Second should open after delay
      expect(window.open).toHaveBeenCalledTimes(2)

      await promise

      vi.useRealTimers()
    })
  })

  describe('downloadICalFile()', () => {
    beforeEach(() => {
      // Mock DOM methods
      document.createElement = vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn(),
        remove: vi.fn()
      }))
      document.body.appendChild = vi.fn()
      document.body.removeChild = vi.fn()
      global.window.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      global.window.URL.revokeObjectURL = vi.fn()
      global.Blob = vi.fn()
    })

    it('should create and download .ics file', () => {
      const result = downloadICalFile(mockTraining)

      expect(result.success).toBe(true)
      expect(result.message).toContain('heruntergeladen')
      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(global.Blob).toHaveBeenCalled()
    })

    it('should use custom filename', () => {
      const link = { href: '', download: '', click: vi.fn() }
      document.createElement = vi.fn(() => link)

      downloadICalFile(mockTraining, 'custom-training.ics')

      expect(link.download).toBe('custom-training.ics')
    })

    it('should use default filename pattern', () => {
      const link = { href: '', download: '', click: vi.fn() }
      document.createElement = vi.fn(() => link)

      downloadICalFile(mockTraining)

      expect(link.download).toMatch(/training-\d+\.ics/)
    })
  })

  describe('detectCalendarProvider()', () => {
    it('should detect iOS/macOS', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'iPhone',
        configurable: true
      })

      const provider = detectCalendarProvider()

      expect(provider).toBe(calendarProviders.APPLE)
    })

    it('should detect Windows', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Windows NT 10.0',
        configurable: true
      })

      const provider = detectCalendarProvider()

      expect(provider).toBe(calendarProviders.OUTLOOK)
    })

    it('should detect Android', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Android 13',
        configurable: true
      })

      const provider = detectCalendarProvider()

      expect(provider).toBe(calendarProviders.GOOGLE)
    })

    it('should default to Google Calendar', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Unknown Device',
        configurable: true
      })

      const provider = detectCalendarProvider()

      expect(provider).toBe(calendarProviders.GOOGLE)
    })
  })

  describe('getCalendarProviderName()', () => {
    it('should return user-friendly name for Google', () => {
      expect(getCalendarProviderName(calendarProviders.GOOGLE))
        .toBe('Google Calendar')
    })

    it('should return user-friendly name for Apple', () => {
      expect(getCalendarProviderName(calendarProviders.APPLE))
        .toBe('Apple Calendar')
    })

    it('should return provider value for unknown provider', () => {
      expect(getCalendarProviderName('unknown'))
        .toBe('unknown')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid weekday', () => {
      const invalidTraining = {
        ...mockTraining,
        wochentag: 'InvalidDay'
      }

      expect(() => {
        createGoogleCalendarUrl(invalidTraining)
      }).toThrow()
    })

    it('should handle missing required fields', () => {
      const incompleteTraining = {
        wochentag: 'Montag'
        // Missing von, bis, training, ort
      }

      expect(() => {
        createGoogleCalendarUrl(incompleteTraining)
      }).toThrow()
    })
  })

  describe('calendarProviders constant', () => {
    it('should export all calendar providers', () => {
      expect(calendarProviders).toHaveProperty('GOOGLE')
      expect(calendarProviders).toHaveProperty('OUTLOOK')
      expect(calendarProviders).toHaveProperty('OFFICE365')
      expect(calendarProviders).toHaveProperty('YAHOO')
      expect(calendarProviders).toHaveProperty('APPLE')
      expect(calendarProviders).toHaveProperty('ICAL')
    })

    it('should be frozen (immutable)', () => {
      expect(() => {
        calendarProviders.NEW_PROVIDER = 'new'
      }).toThrow()
    })
  })
})
