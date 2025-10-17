// src/js/utils.js
/**
 * Utility Functions - FAM Trainingsplan
 * @version 3.0.0
 * @requires Node 20+
 * @description Pure functions, no side effects, fully tested
 */

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').Filter} Filter
 * @typedef {import('./types.js').UserPosition} UserPosition
 */

import { CONFIG, log, getMapConfig } from './config.js'

// ==================== DEBOUNCE & THROTTLE ====================

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timeout
  // @ts-ignore - rest parameter type inference
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 100) {
  /** @type {boolean | undefined} */
  let inThrottle
  // @ts-ignore - rest parameter type inference
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

// ==================== STRING HELPERS ====================

/**
 * Generate hash from string (simple but fast)
 * @param {string} str - Input string
 * @returns {string} Hash
 */
export function generateHash(str) {
  if (typeof str !== 'string') return '0'
  
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return hash.toString()
}

/**
 * Format time range
 * @param {string} von - Start time (HH:MM)
 * @param {string} bis - End time (HH:MM)
 * @returns {string} Formatted range
 */
export function formatZeitrange(von, bis) {
  if (!von || !bis) return ''

  /**
   * @param {string} time - Time string
   * @returns {string} Formatted time
   */
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    return `${parseInt(hours, 10)}:${minutes}`
  }

  return `${formatTime(von)} - ${formatTime(bis)} Uhr`
}

/**
 * Format age group
 *
 * @param {Training} training - Training object
 * @returns {string} Formatted age group
 */
export function formatAlter(training) {
  if (!training) return ''
  
  // Text-based age group
  if (training.altersgruppe && typeof training.altersgruppe === 'string') {
    return training.altersgruppe
  }
  
  // Numeric age range
  if (training.alterVon && training.alterBis) {
    return `${training.alterVon} - ${training.alterBis} Jahre`
  }
  
  if (training.alterVon) {
    return `ab ${training.alterVon} Jahren`
  }
  
  return 'Alle Altersgruppen'
}

/**
 * Sanitize HTML
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeHtml(str) {
  if (typeof str !== 'string') return ''
  
  const temp = document.createElement('div')
  temp.textContent = str
  return temp.innerHTML
}

/**
 * Validate URL
 * @param {string} url - URL string
 * @returns {boolean}
 */
export function isValidUrl(url) {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Pluralize
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form
 * @returns {string}
 */
export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural
}

/**
 * Format number (1k, 1M)
 * @param {number} num - Number
 * @returns {string}
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || Number.isNaN(num)) return '0'
  
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

/**
 * Round to decimals
 * @param {number} num - Number
 * @param {number} decimals - Decimal places
 * @returns {number}
 */
export function roundTo(num, decimals = 2) {
  const factor = 10 ** decimals
  return Math.round(num * factor) / factor
}

// ==================== ARRAY HELPERS ====================

/**
 * Extract unique values from array
 *
 * @template T
 * @param {T[]} array - Input array
 * @param {keyof T} key - Property key
 * @returns {string[]} Unique values
 */
export function extractUnique(array, key) {
  if (!Array.isArray(array)) return []

  const values = array
    .map(item => item[key])
    .filter(val => val !== null && val !== undefined && String(val).trim() !== '')

  return [...new Set(values.map(v => String(v)))]
    .sort((a, b) => a.localeCompare(b, 'de'))
}

/**
 * Group array by key
 *
 * @template T
 * @param {T[]} array - Input array
 * @param {keyof T} key - Grouping key
 * @returns {Record<string, T[]>} Grouped object
 */
export function groupBy(array, key) {
  if (!Array.isArray(array)) return {}

  // Use native Object.groupBy if available (Node 21+)
  if (Object.groupBy) {
    // @ts-ignore - Object.groupBy exists in newer environments
    return Object.groupBy(array, item => String(item[key] || 'undefined'))
  }

  // Fallback
  /** @type {Record<string, T[]>} */
  const result = {}
  return array.reduce((result, item) => {
    const groupKey = String(item[key] || 'undefined')
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, result)
}

/**
 * Shuffle array (Fisher-Yates)
 * @template T
 * @param {T[]} array - Input array
 * @returns {T[]} Shuffled array
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return []

  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ==================== GEOLOCATION ====================

/**
 * Get current position
 *
 * @returns {Promise<UserPosition>} Position {lat, lng, accuracy}
 */
export async function getCurrentPosition() {
  const geoConfig = getMapConfig().geolocation

  if (!navigator.geolocation) {
    throw new Error('Geolocation nicht unterstützt')
  }

  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: geoConfig.enableHighAccuracy,
      timeout: geoConfig.timeout,
      maximumAge: geoConfig.maximumAge
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        const errorMessages = geoConfig.errorMessages
        let message = errorMessages.UNKNOWN

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = errorMessages.PERMISSION_DENIED
            break
          case error.POSITION_UNAVAILABLE:
            message = errorMessages.POSITION_UNAVAILABLE
            break
          case error.TIMEOUT:
            message = errorMessages.TIMEOUT
            break
        }

        reject(new Error(message))
      },
      options
    )
  })
}

/**
 * Calculate distance between coordinates (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} Distance in km
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth radius in km
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return roundTo(distance, 1)
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Add distance to trainings
 *
 * @param {Training[]} trainings - Training array
 * @param {UserPosition} userPosition - User position {lat, lng}
 * @returns {Training[]} Trainings with distance property
 */
export function addDistanceToTrainings(trainings, userPosition) {
  if (!Array.isArray(trainings) || !userPosition) return trainings

  return trainings.map(training => {
    if (training.lat && training.lng) {
      const distance = calculateDistance(
        userPosition.lat,
        userPosition.lng,
        training.lat,
        training.lng
      )
      return { ...training, distance }
    }
    return training
  })
}

// ==================== DATE & TIME ====================

/**
 * Get next training date
 * @param {string} wochentag - Weekday (German)
 * @returns {Date|null}
 */
export function getNextTrainingDate(wochentag) {
  if (!wochentag) return null

  /** @type {Record<string, number>} */
  const wochentagMap = {
    'Montag': 1,
    'Dienstag': 2,
    'Mittwoch': 3,
    'Donnerstag': 4,
    'Freitag': 5,
    'Samstag': 6,
    'Sonntag': 0
  }

  const targetDay = wochentagMap[wochentag]
  if (targetDay === undefined) return null

  const today = new Date()
  const currentDay = today.getDay()
  
  let daysToAdd = targetDay - currentDay
  if (daysToAdd < 0) {
    daysToAdd += 7
  }
  if (daysToAdd === 0 && today.getHours() >= 20) {
    daysToAdd = 7 // Next week if today is already late
  }

  const nextDate = new Date(today)
  nextDate.setDate(today.getDate() + daysToAdd)
  nextDate.setHours(0, 0, 0, 0)

  return nextDate
}

/**
 * Format date for iCal
 * @param {Date} date - Date
 * @returns {string} iCal format
 */
export function formatICalDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

/**
 * Convert time to minutes since midnight
 * @param {string} zeit - Time in format "HH:MM"
 * @returns {number} Minutes since 00:00
 */
export function zeitZuMinuten(zeit) {
  if (!zeit || typeof zeit !== 'string') return 0
  const [h, m] = zeit.split(':').map(n => parseInt(n, 10))
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

// ==================== ICAL EXPORT ====================

/**
 * Create iCal event
 *
 * @param {Training} training - Training object
 * @returns {string | null} iCal string
 */
export function createICalEvent(training) {
  const date = getNextTrainingDate(training.wochentag)
  if (!date) return null

  const vonParts = training.von.split(':')
  const bisParts = training.bis.split(':')

  const startDate = new Date(date)
  startDate.setHours(parseInt(vonParts[0], 10), parseInt(vonParts[1], 10), 0)

  const endDate = new Date(date)
  endDate.setHours(parseInt(bisParts[0], 10), parseInt(bisParts[1], 10), 0)

  const description = [
    training.training,
    'Altersgruppe: ' + formatAlter(training),
    training.trainer ? 'Trainer: ' + training.trainer : '',
    training.anmerkung ? 'Hinweis: ' + training.anmerkung : '',
    training.link ? 'Anmeldung: ' + training.link : ''
  ].filter(Boolean).join('\\n')

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FAM Trainingsplan//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${training.id}@fam-trainingsplan`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `DTSTART:${formatICalDate(startDate)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `SUMMARY:${training.training} - ${training.ort}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${training.ort}`,
    training.link ? `URL:${training.link}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')

  return ical
}

/**
 * Create iCal bundle for multiple trainings
 * NEW in v3.0: Bulk export functionality
 *
 * @param {Training[]} trainings - Array of training objects
 * @returns {string} iCal string with multiple events
 * @throws {Error} If trainings array is empty or invalid
 */
export function createICalBundle(trainings) {
  if (!Array.isArray(trainings) || trainings.length === 0) {
    throw new Error('Trainings array is empty or invalid')
  }

  /** @type {string[]} */
  const events = []

  trainings.forEach((training) => {
    const date = getNextTrainingDate(training.wochentag)
    if (!date) return // Skip invalid dates

    try {
      const vonParts = training.von.split(':')
      const bisParts = training.bis.split(':')

      const startDate = new Date(date)
      startDate.setHours(parseInt(vonParts[0], 10), parseInt(vonParts[1], 10), 0)

      const endDate = new Date(date)
      endDate.setHours(parseInt(bisParts[0], 10), parseInt(bisParts[1], 10), 0)

      const description = [
        training.training,
        'Altersgruppe: ' + formatAlter(training),
        training.trainer ? 'Trainer: ' + training.trainer : '',
        training.anmerkung ? 'Hinweis: ' + training.anmerkung : '',
        training.link ? 'Anmeldung: ' + training.link : ''
      ].filter(Boolean).join('\\n')

      /** @type {Record<string, string>} */
      const wochentagMap = {
        'Montag': 'MO',
        'Dienstag': 'TU',
        'Mittwoch': 'WE',
        'Donnerstag': 'TH',
        'Freitag': 'FR',
        'Samstag': 'SA',
        'Sonntag': 'SU'
      }
      const byday = wochentagMap[training.wochentag] || 'MO'

      const event = [
        'BEGIN:VEVENT',
        `UID:${training.id}@fam-trainingsplan`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(startDate)}`,
        `DTEND:${formatICalDate(endDate)}`,
        `SUMMARY:${training.training} - ${training.ort}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${training.ort}`,
        training.link ? `URL:${training.link}` : '',
        'STATUS:CONFIRMED',
        `RRULE:FREQ=WEEKLY;BYDAY=${byday};COUNT=52`, // Weekly for 52 weeks
        'END:VEVENT'
      ].filter(Boolean).join('\r\n')

      events.push(event)
    } catch (error) {
      log('warn', `Skipping invalid training: ${training.id}`, error)
    }
  })

  if (events.length === 0) {
    throw new Error('No valid events to export')
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FAM Trainingsplan//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FAM Trainingsplan',
    'X-WR-CALDESC:Free Arts of Movement München',
    'X-WR-TIMEZONE:Europe/Berlin',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n')
}

/**
 * Download iCal file
 * @param {string} icalContent - iCal string
 * @param {string} filename - Filename
 */
export function downloadICalFile(icalContent, filename = 'training.ics') {
  try {
    const blob = new Blob([icalContent], { 
      type: 'text/calendar;charset=utf-8' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    log('info', 'iCal file downloaded', { filename })
  } catch (error) {
    log('error', 'iCal download failed', error)
    throw error
  }
}

// ==================== URL & SHARING ====================

/**
 * Create share link
 *
 * @param {Partial<Filter>} filters - Filter object
 * @returns {string} URL
 */
export function createShareLink(filters) {
  const params = new URLSearchParams()
  // @ts-ignore - CONFIG runtime property access
  const paramMapping = CONFIG.filters.urlParams

  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== '' && value !== null && key !== 'activeQuickFilter') {
      const paramName = /** @type {Record<string, string>} */ (paramMapping)[key] || key
      params.set(paramName, String(value))
    }
  })

  const query = params.toString()
  const base = window.location.origin + window.location.pathname

  return query ? `${base}?${query}` : base
}

/**
 * Get filters from URL
 *
 * @returns {Partial<Filter>} Filter object
 */
export function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search)
  // @ts-ignore - CONFIG runtime property access
  const paramMapping = /** @type {Record<string, string>} */ (CONFIG.filters.urlParams)

  const reverseMapping = Object.fromEntries(
    Object.entries(paramMapping).map(([key, value]) => [value, key])
  )

  /** @type {any} */
  const filters = {
    wochentag: '',
    ort: '',
    training: '',
    altersgruppe: '',
    searchTerm: '',
    nearby: false
  }

  params.forEach((value, key) => {
    const filterKey = reverseMapping[key] || key
    if (filterKey in filters) {
      filters[filterKey] = value === 'true' ? true : (value === 'false' ? false : value)
    }
  })

  return /** @type {Partial<Filter>} */ (filters)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  // Modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      log('info', 'Text copied to clipboard')
      return true
    } catch (error) {
      log('warn', 'Clipboard API failed, falling back', error)
    }
  }

  // Fallback for older browsers
  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()

    const success = document.execCommand('copy')
    document.body.removeChild(textarea)

    if (success) {
      log('info', 'Text copied (fallback)')
    }
    return success
  } catch (error) {
    log('error', 'Copy to clipboard failed', error)
    return false
  }
}

// ==================== LOCALSTORAGE ====================

/**
 * LocalStorage wrapper with error handling
 */
export const storage = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      log('error', 'localStorage.get failed', error)
      return defaultValue
    }
  },

  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value
   * @returns {boolean}
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      log('error', 'localStorage.set failed', error)
      return false
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      log('error', 'localStorage.remove failed', error)
      return false
    }
  },

  /**
   * Clear localStorage
   * @returns {boolean}
   */
  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      log('error', 'localStorage.clear failed', error)
      return false
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null
  },

  /**
   * Get all keys
   * @returns {Array<string>}
   */
  keys() {
    return Object.keys(localStorage)
  }
}

// ==================== FAVORITES ====================

/**
 * Favorites management
 */
export const favorites = {
  /**
   * Load favorites
   * @returns {Array<number>}
   */
  load() {
    // @ts-ignore - CONFIG runtime property access
    return storage.get(CONFIG.favoritesKey, [])
  },

  /**
   * Save favorites
   * @param {Array<number>} favs - Training IDs
   * @returns {boolean}
   */
  save(favs) {
    // Validate and limit
    const validated = Array.isArray(favs)
      ? favs.filter(id => typeof id === 'number' || typeof id === 'string')
      : []

    // @ts-ignore - CONFIG runtime property access
    const limited = validated.slice(0, CONFIG.favorites.maxCount)

    // @ts-ignore - CONFIG runtime property access
    return storage.set(CONFIG.favoritesKey, limited)
  },

  /**
   * Add favorite
   * @param {number} trainingId - Training ID
   * @returns {boolean}
   */
  add(trainingId) {
    const favs = this.load()
    if (!favs.includes(trainingId)) {
      favs.push(trainingId)
      return this.save(favs)
    }
    return false
  },

  /**
   * Remove favorite
   * @param {number} trainingId - Training ID
   * @returns {boolean}
   */
  remove(trainingId) {
    const favs = this.load()
    const filtered = favs.filter(id => id !== trainingId)
    if (filtered.length !== favs.length) {
      return this.save(filtered)
    }
    return false
  },

  /**
   * Toggle favorite
   * @param {number} trainingId - Training ID
   * @returns {boolean} true if added, false if removed
   */
  toggle(trainingId) {
    if (this.has(trainingId)) {
      this.remove(trainingId)
      return false
    } else {
      this.add(trainingId)
      return true
    }
  },

  /**
   * Check if favorite
   * @param {number} trainingId - Training ID
   * @returns {boolean}
   */
  has(trainingId) {
    const favs = this.load()
    return favs.includes(trainingId)
  },

  /**
   * Count favorites
   * @returns {number}
   */
  count() {
    return this.load().length
  },

  /**
   * Clear all favorites
   * @returns {boolean}
   */
  clear() {
    return this.save([])
  }
}

// ==================== EXPORTS ====================

/**
 * Default export with all utilities
 */
export const utils = {
  // Debounce & Throttle
  debounce,
  throttle,
  
  // String Helpers
  generateHash,
  formatZeitrange,
  formatAlter,
  sanitizeHtml,
  isValidUrl,
  pluralize,
  formatNumber,
  roundTo,
  
  // Array Helpers
  extractUnique,
  groupBy,
  shuffle,
  
  // Geolocation
  getCurrentPosition,
  calculateDistance,
  addDistanceToTrainings,
  
  // Date & Time
  getNextTrainingDate,
  formatICalDate,
  zeitZuMinuten,
  
  // iCal Export
  createICalEvent,
  createICalBundle,
  downloadICalFile,
  
  // URL & Sharing
  createShareLink,
  getFiltersFromUrl,
  copyToClipboard,
  
  // LocalStorage
  storage,
  
  // Favorites
  favorites
}

export default utils