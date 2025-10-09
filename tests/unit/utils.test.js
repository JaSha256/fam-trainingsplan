// tests/unit/utils.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { utils } from '../../src/js/utils.js'

describe('utils.js', () => {
  describe('debounce()', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn()
      const debounced = utils.debounce(mockFn, 100)

      debounced()
      debounced()
      debounced()

      expect(mockFn).not.toHaveBeenCalled()

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle()', () => {
    it('should throttle function calls', async () => {
      const mockFn = vi.fn()
      const throttled = utils.throttle(mockFn, 100)

      throttled()
      throttled()
      throttled()

      expect(mockFn).toHaveBeenCalledTimes(1)

      await new Promise(resolve => setTimeout(resolve, 150))
      throttled()
      expect(mockFn).toHaveBeenCalledTimes(2)
    })
  })

  describe('generateHash()', () => {
    it('should generate consistent hash', () => {
      const hash1 = utils.generateHash('test')
      const hash2 = utils.generateHash('test')
      expect(hash1).toBe(hash2)
    })

    it('should generate different hashes', () => {
      const hash1 = utils.generateHash('test1')
      const hash2 = utils.generateHash('test2')
      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty string', () => {
      const hash = utils.generateHash('')
      expect(hash).toBe('0')
    })
  })

  describe('formatZeitrange()', () => {
    it('should format time range', () => {
      expect(utils.formatZeitrange('09:00', '10:30')).toBe('9:00 - 10:30 Uhr')
      expect(utils.formatZeitrange('18:00', '20:00')).toBe('18:00 - 20:00 Uhr')
    })

    it('should handle missing values', () => {
      expect(utils.formatZeitrange(null, '10:00')).toBe('')
      expect(utils.formatZeitrange('09:00', null)).toBe('')
    })
  })

  describe('formatAlter()', () => {
    it('should format age range', () => {
      const training = { alterVon: 6, alterBis: 11 }
      expect(utils.formatAlter(training)).toBe('6 - 11 Jahre')
    })

    it('should format age from', () => {
      const training = { alterVon: 18 }
      expect(utils.formatAlter(training)).toBe('ab 18 Jahren')
    })

    it('should use altersgruppe text', () => {
      const training = { altersgruppe: 'Kids' }
      expect(utils.formatAlter(training)).toBe('Kids')
    })

    it('should handle empty training', () => {
      expect(utils.formatAlter({})).toBe('Alle Altersgruppen')
    })
  })

  describe('sanitizeHtml()', () => {
    it('should sanitize HTML', () => {
      expect(utils.sanitizeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
    })

    it('should handle non-string input', () => {
      expect(utils.sanitizeHtml(null)).toBe('')
      expect(utils.sanitizeHtml(123)).toBe('')
    })
  })

  describe('isValidUrl()', () => {
    it('should validate URLs', () => {
      expect(utils.isValidUrl('https://example.com')).toBe(true)
      expect(utils.isValidUrl('http://example.com')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(utils.isValidUrl('not-a-url')).toBe(false)
      expect(utils.isValidUrl('ftp://example.com')).toBe(false)
      expect(utils.isValidUrl('')).toBe(false)
    })
  })

  describe('extractUnique()', () => {
    it('should extract unique values', () => {
      const array = [
        { name: 'A' },
        { name: 'B' },
        { name: 'A' }
      ]
      expect(utils.extractUnique(array, 'name')).toEqual(['A', 'B'])
    })

    it('should handle empty array', () => {
      expect(utils.extractUnique([], 'name')).toEqual([])
    })

    it('should handle invalid input', () => {
      expect(utils.extractUnique(null, 'name')).toEqual([])
    })
  })

  describe('groupBy()', () => {
    it('should group array by key', () => {
      const array = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 }
      ]
      const grouped = utils.groupBy(array, 'type')
      
      expect(grouped.A).toHaveLength(2)
      expect(grouped.B).toHaveLength(1)
    })

    it('should handle empty array', () => {
      expect(utils.groupBy([], 'type')).toEqual({})
    })
  })

  describe('shuffle()', () => {
    it('should shuffle array', () => {
      const array = [1, 2, 3, 4, 5]
      const shuffled = utils.shuffle(array)
      
      expect(shuffled).toHaveLength(5)
      expect(shuffled).toContain(1)
      expect(shuffled).toContain(5)
    })

    it('should not modify original', () => {
      const original = [1, 2, 3]
      const shuffled = utils.shuffle(original)
      
      expect(original).toEqual([1, 2, 3])
    })
  })

  describe('pluralize()', () => {
    it('should pluralize correctly', () => {
      expect(utils.pluralize(1, 'Training', 'Trainings')).toBe('Training')
      expect(utils.pluralize(2, 'Training', 'Trainings')).toBe('Trainings')
      expect(utils.pluralize(0, 'Training', 'Trainings')).toBe('Trainings')
    })
  })

  describe('formatNumber()', () => {
    it('should format large numbers', () => {
      expect(utils.formatNumber(1500)).toBe('1.5k')
      expect(utils.formatNumber(1500000)).toBe('1.5M')
      expect(utils.formatNumber(500)).toBe('500')
    })

    it('should handle invalid input', () => {
      expect(utils.formatNumber(NaN)).toBe('0')
      expect(utils.formatNumber('abc')).toBe('0')
    })
  })

  describe('roundTo()', () => {
    it('should round to decimals', () => {
      expect(utils.roundTo(1.2345, 2)).toBe(1.23)
      expect(utils.roundTo(1.2345, 0)).toBe(1)
      expect(utils.roundTo(1.2, 2)).toBe(1.2)
    })
  })

  describe('calculateDistance()', () => {
    it('should calculate distance', () => {
      // München -> Berlin (ca. 504km)
      const distance = utils.calculateDistance(
        48.1351, 11.5820,
        52.5200, 13.4050
      )
      
      expect(distance).toBeGreaterThan(500)
      expect(distance).toBeLessThan(510)
    })

    it('should return 0 for same coordinates', () => {
      const distance = utils.calculateDistance(
        48.1351, 11.5820,
        48.1351, 11.5820
      )
      
      expect(distance).toBe(0)
    })
  })

  // toRadians is an internal helper function, not exported

  describe('addDistanceToTrainings()', () => {
    it('should add distance to trainings', () => {
      const trainings = [
        { id: 1, lat: 48.1, lng: 11.5 },
        { id: 2, lat: 48.2, lng: 11.6 }
      ]
      const userPos = { lat: 48.1351, lng: 11.5820 }
      
      const result = utils.addDistanceToTrainings(trainings, userPos)
      
      expect(result[0]).toHaveProperty('distance')
      expect(typeof result[0].distance).toBe('number')
    })

    it('should handle trainings without coordinates', () => {
      const trainings = [{ id: 1 }]
      const userPos = { lat: 48.1351, lng: 11.5820 }
      
      const result = utils.addDistanceToTrainings(trainings, userPos)
      
      expect(result[0]).not.toHaveProperty('distance')
    })
  })

  describe('getNextTrainingDate()', () => {
    it('should calculate next training date', () => {
      const nextMonday = utils.getNextTrainingDate('Montag')
      
      expect(nextMonday).toBeInstanceOf(Date)
      expect(nextMonday.getDay()).toBe(1) // Monday
    })

    it('should handle invalid weekday', () => {
      expect(utils.getNextTrainingDate('InvalidDay')).toBeNull()
      expect(utils.getNextTrainingDate('')).toBeNull()
    })
  })

  describe('createICalEvent()', () => {
    it('should create iCal event', () => {
      const training = {
        id: 1,
        wochentag: 'Montag',
        von: '18:00',
        bis: '20:00',
        training: 'Parkour',
        ort: 'LTR',
        altersgruppe: 'Kids'
      }
      
      const ical = utils.createICalEvent(training)
      
      expect(ical).toContain('BEGIN:VCALENDAR')
      expect(ical).toContain('BEGIN:VEVENT')
      expect(ical).toContain('SUMMARY:Parkour - LTR')
      expect(ical).toContain('END:VEVENT')
      expect(ical).toContain('END:VCALENDAR')
    })

    it('should handle training without weekday', () => {
      const training = { id: 1, von: '18:00', bis: '20:00' }
      expect(utils.createICalEvent(training)).toBeNull()
    })
  })

  describe('createShareLink()', () => {
    it('should create share link with filters', () => {
      const filters = {
        wochentag: 'Montag',
        ort: 'LTR',
        training: '',
        activeQuickFilter: null
      }
      
      const link = utils.createShareLink(filters)
      
      expect(link).toContain('?')
      expect(link).toContain('tag=Montag')
      expect(link).toContain('ort=LTR')
      expect(link).not.toContain('art=')
    })

    it('should create base URL without filters', () => {
      const filters = {}
      const link = utils.createShareLink(filters)
      
      expect(link).not.toContain('?')
    })
  })

  describe('storage', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should set and get values', () => {
      expect(utils.storage.set('test', { value: 123 })).toBe(true)
      expect(utils.storage.get('test')).toEqual({ value: 123 })
    })

    it('should return default value', () => {
      expect(utils.storage.get('nonexistent', 'default')).toBe('default')
    })

    it('should remove values', () => {
      utils.storage.set('test', 'value')
      expect(utils.storage.remove('test')).toBe(true)
      expect(utils.storage.has('test')).toBe(false)
    })

    it('should check existence', () => {
      utils.storage.set('test', 'value')
      expect(utils.storage.has('test')).toBe(true)
      expect(utils.storage.has('nonexistent')).toBe(false)
    })

    it('should get all keys', () => {
      utils.storage.set('key1', 'value1')
      utils.storage.set('key2', 'value2')
      
      const keys = utils.storage.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })

    it('should clear all', () => {
      utils.storage.set('key1', 'value1')
      utils.storage.set('key2', 'value2')
      
      expect(utils.storage.clear()).toBe(true)
      expect(utils.storage.keys()).toHaveLength(0)
    })
  })

  describe('favorites', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should add and remove favorites', () => {
      expect(utils.favorites.add(1)).toBe(true)
      expect(utils.favorites.has(1)).toBe(true)
      
      expect(utils.favorites.remove(1)).toBe(true)
      expect(utils.favorites.has(1)).toBe(false)
    })

    it('should toggle favorites', () => {
      expect(utils.favorites.toggle(1)).toBe(true) // Added
      expect(utils.favorites.has(1)).toBe(true)
      
      expect(utils.favorites.toggle(1)).toBe(false) // Removed
      expect(utils.favorites.has(1)).toBe(false)
    })

    it('should count favorites', () => {
      utils.favorites.add(1)
      utils.favorites.add(2)
      utils.favorites.add(3)
      
      expect(utils.favorites.count()).toBe(3)
    })

    it('should clear favorites', () => {
      utils.favorites.add(1)
      utils.favorites.add(2)
      
      expect(utils.favorites.clear()).toBe(true)
      expect(utils.favorites.count()).toBe(0)
    })

    it('should not add duplicate', () => {
      utils.favorites.add(1)
      expect(utils.favorites.add(1)).toBe(false)
      expect(utils.favorites.count()).toBe(1)
    })
  })

  describe('copyToClipboard()', () => {
    it('should copy text', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(true)
        }
      })

      const result = await utils.copyToClipboard('test text')
      expect(result).toBe(true)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
    })
  })
})