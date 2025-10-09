// src/js/calendar-integration.js
/**
 * Google Calendar Integration Module
 * @version 1.0.0
 * @requires utils.js
 * @description
 * Provides seamless integration with Google Calendar and other calendar providers.
 * Phase 1: URL-based "Add to Calendar" (no backend required)
 * Phase 2: OAuth2 integration (future)
 */

import { getNextTrainingDate, createICalEvent } from './utils.js'
import { log } from './config.js'

// ==================== CONSTANTS ====================

const CALENDAR_PROVIDERS = Object.freeze({
  GOOGLE: 'google',
  OUTLOOK: 'outlook',
  OFFICE365: 'office365',
  YAHOO: 'yahoo',
  APPLE: 'apple', // .ics download
  ICAL: 'ical'    // Generic .ics download
})

const GOOGLE_CALENDAR_BASE_URL = 'https://calendar.google.com/calendar/render'
const OUTLOOK_CALENDAR_BASE_URL = 'https://outlook.live.com/calendar/0/deeplink/compose'
const OFFICE365_CALENDAR_BASE_URL = 'https://outlook.office.com/calendar/0/deeplink/compose'
const YAHOO_CALENDAR_BASE_URL = 'https://calendar.yahoo.com/'

// ==================== GOOGLE CALENDAR ====================

/**
 * Create Google Calendar event URL
 * @param {Object} training - Training object
 * @returns {string} Google Calendar URL
 */
export function createGoogleCalendarUrl(training) {
  try {
    const { start, end } = getEventDateTimes(training)

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: formatEventTitle(training),
      dates: formatGoogleDates(start, end),
      details: formatEventDescription(training),
      location: formatEventLocation(training),
      trp: 'true' // Show "Add to calendar" dialog
    })

    const url = `${GOOGLE_CALENDAR_BASE_URL}?${params.toString()}`

    log('debug', '[calendar] Google Calendar URL created', { training: training.id })

    return url
  } catch (error) {
    log('error', '[calendar] Failed to create Google Calendar URL', error)
    throw error
  }
}

/**
 * Format dates for Google Calendar (YYYYMMDDTHHMMSSZ format)
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {string} Formatted date range
 */
function formatGoogleDates(start, end) {
  const formatDate = (date) => {
    return date.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  }

  return `${formatDate(start)}/${formatDate(end)}`
}

// ==================== OUTLOOK & OFFICE 365 ====================

/**
 * Create Outlook.com Calendar event URL
 * @param {Object} training - Training object
 * @returns {string} Outlook Calendar URL
 */
export function createOutlookCalendarUrl(training) {
  try {
    const { start, end } = getEventDateTimes(training)

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: formatEventTitle(training),
      startdt: start.toISOString(),
      enddt: end.toISOString(),
      body: formatEventDescription(training),
      location: formatEventLocation(training)
    })

    const url = `${OUTLOOK_CALENDAR_BASE_URL}?${params.toString()}`

    log('debug', '[calendar] Outlook Calendar URL created', { training: training.id })

    return url
  } catch (error) {
    log('error', '[calendar] Failed to create Outlook Calendar URL', error)
    throw error
  }
}

/**
 * Create Office 365 Calendar event URL
 * @param {Object} training - Training object
 * @returns {string} Office 365 Calendar URL
 */
export function createOffice365CalendarUrl(training) {
  try {
    const { start, end } = getEventDateTimes(training)

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: formatEventTitle(training),
      startdt: start.toISOString(),
      enddt: end.toISOString(),
      body: formatEventDescription(training),
      location: formatEventLocation(training)
    })

    const url = `${OFFICE365_CALENDAR_BASE_URL}?${params.toString()}`

    log('debug', '[calendar] Office 365 Calendar URL created', { training: training.id })

    return url
  } catch (error) {
    log('error', '[calendar] Failed to create Office 365 Calendar URL', error)
    throw error
  }
}

// ==================== YAHOO CALENDAR ====================

/**
 * Create Yahoo Calendar event URL
 * @param {Object} training - Training object
 * @returns {string} Yahoo Calendar URL
 */
export function createYahooCalendarUrl(training) {
  try {
    const { start, end } = getEventDateTimes(training)

    const params = new URLSearchParams({
      v: '60',
      title: formatEventTitle(training),
      st: formatYahooDate(start),
      et: formatYahooDate(end),
      desc: formatEventDescription(training),
      in_loc: formatEventLocation(training)
    })

    const url = `${YAHOO_CALENDAR_BASE_URL}?${params.toString()}`

    log('debug', '[calendar] Yahoo Calendar URL created', { training: training.id })

    return url
  } catch (error) {
    log('error', '[calendar] Failed to create Yahoo Calendar URL', error)
    throw error
  }
}

/**
 * Format date for Yahoo Calendar (YYYYMMDDTHHmmssZ)
 * @param {Date} date - Date object
 * @returns {string} Formatted date
 */
function formatYahooDate(date) {
  return date.toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
}

// ==================== BULK EXPORT ====================

/**
 * Add multiple trainings to Google Calendar
 * Opens URLs sequentially with delay to prevent popup blocking
 * @param {Array<Object>} trainings - Array of training objects
 * @param {Object} options - Export options
 * @returns {Promise<Object>} Result object
 */
export async function bulkAddToGoogleCalendar(trainings, options = {}) {
  const {
    maxBulk = 10,
    delay = 600,
    onProgress = null
  } = options

  if (!Array.isArray(trainings) || trainings.length === 0) {
    return {
      success: false,
      message: 'Keine Trainings zum Exportieren',
      exported: 0,
      total: 0
    }
  }

  const toExport = trainings.slice(0, maxBulk)
  let exported = 0
  const errors = []

  try {
    for (let i = 0; i < toExport.length; i++) {
      try {
        const url = createGoogleCalendarUrl(toExport[i])

        // Open in new tab
        const newWindow = window.open(url, '_blank')

        if (!newWindow) {
          throw new Error('Popup blocked')
        }

        exported++

        // Progress callback
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: toExport.length,
            training: toExport[i]
          })
        }

        // Wait between opens to prevent popup blocking
        if (i < toExport.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      } catch (error) {
        errors.push({
          training: toExport[i],
          error: error.message
        })
        log('error', '[calendar] Bulk export error for training', {
          training: toExport[i].id,
          error
        })
      }
    }

    const result = {
      success: exported > 0,
      message: `${exported} von ${toExport.length} Trainings exportiert`,
      exported,
      total: toExport.length,
      errors: errors.length > 0 ? errors : null
    }

    log('info', '[calendar] Bulk export completed', result)

    return result
  } catch (error) {
    log('error', '[calendar] Bulk export failed', error)

    return {
      success: false,
      message: 'Export fehlgeschlagen',
      exported,
      total: toExport.length,
      errors: [error]
    }
  }
}

/**
 * Add multiple trainings to any calendar provider
 * @param {Array<Object>} trainings - Array of training objects
 * @param {string} provider - Calendar provider (google|outlook|office365|yahoo)
 * @param {Object} options - Export options
 * @returns {Promise<Object>} Result object
 */
export async function bulkAddToCalendar(trainings, provider = CALENDAR_PROVIDERS.GOOGLE, options = {}) {
  const urlCreators = {
    [CALENDAR_PROVIDERS.GOOGLE]: createGoogleCalendarUrl,
    [CALENDAR_PROVIDERS.OUTLOOK]: createOutlookCalendarUrl,
    [CALENDAR_PROVIDERS.OFFICE365]: createOffice365CalendarUrl,
    [CALENDAR_PROVIDERS.YAHOO]: createYahooCalendarUrl
  }

  const createUrl = urlCreators[provider]

  if (!createUrl) {
    throw new Error(`Unsupported calendar provider: ${provider}`)
  }

  // Similar logic to bulkAddToGoogleCalendar but uses provider-specific URL creator
  return bulkAddToGoogleCalendar(trainings, { ...options, createUrl })
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get start and end DateTime for training
 * @param {Object} training - Training object
 * @returns {Object} { start: Date, end: Date }
 */
function getEventDateTimes(training) {
  const nextDate = getNextTrainingDate(training.wochentag)

  if (!nextDate) {
    throw new Error('Invalid weekday')
  }

  const [startHour, startMin] = training.von.split(':').map(Number)
  const [endHour, endMin] = training.bis.split(':').map(Number)

  const start = new Date(nextDate)
  start.setHours(startHour, startMin, 0, 0)

  const end = new Date(nextDate)
  end.setHours(endHour, endMin, 0, 0)

  return { start, end }
}

/**
 * Format event title
 * @param {Object} training - Training object
 * @returns {string} Event title
 */
function formatEventTitle(training) {
  return `${training.training} - ${training.ort}`
}

/**
 * Format event description with all details
 * @param {Object} training - Training object
 * @returns {string} Event description
 */
function formatEventDescription(training) {
  const parts = []

  parts.push(`🏃 ${training.training} Training`)
  parts.push('')

  if (training.altersgruppe) {
    parts.push(`👥 Altersgruppe: ${training.altersgruppe}`)
  }

  if (training.trainer) {
    parts.push(`👤 Trainer: ${training.trainer}`)
  }

  if (training.anmerkung) {
    parts.push('')
    parts.push(`ℹ️ ${training.anmerkung}`)
  }

  if (training.link) {
    parts.push('')
    parts.push(`📝 Anmeldung: ${training.link}`)
  }

  parts.push('')
  parts.push('---')
  parts.push('🗓️ Erstellt mit FAM Trainingsplan')
  parts.push('🔗 https://trainingsplan.freeartsofmovement.com')

  return parts.join('\n')
}

/**
 * Format event location
 * @param {Object} training - Training object
 * @returns {string} Event location
 */
function formatEventLocation(training) {
  if (training.adresse) {
    return `${training.ort}, ${training.adresse}`
  }

  return training.ort || ''
}

// ==================== DOWNLOAD .ICS FILE ====================

/**
 * Download .ics file for training (Apple Calendar, generic)
 * @param {Object} training - Training object
 * @param {string} filename - Optional filename
 */
export function downloadICalFile(training, filename = null) {
  try {
    const icalContent = createICalEvent(training)

    if (!icalContent) {
      throw new Error('Failed to create iCal event')
    }

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename || `training-${training.id}.ics`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)

    log('debug', '[calendar] iCal file downloaded', { training: training.id })

    return { success: true, message: 'Kalenderdatei heruntergeladen' }
  } catch (error) {
    log('error', '[calendar] Failed to download iCal file', error)
    return { success: false, message: 'Download fehlgeschlagen', error }
  }
}

/**
 * Download .ics file for multiple trainings
 * @param {Array<Object>} trainings - Array of training objects
 * @param {string} filename - Optional filename
 */
export function downloadICalBundle(trainings, filename = 'trainings.ics') {
  try {
    if (!Array.isArray(trainings) || trainings.length === 0) {
      throw new Error('No trainings provided')
    }

    // Create iCal bundle
    const events = trainings
      .map(t => createICalEvent(t))
      .filter(Boolean)

    if (events.length === 0) {
      throw new Error('No valid events created')
    }

    // Combine events into single calendar file
    const calendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FAM Trainingsplan//NONSGML v1.0//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:FAM Trainingsplan',
      'X-WR-TIMEZONE:Europe/Berlin',
      ...events.map(e => e.split('\n').slice(2, -2).join('\n')), // Extract events without wrapper
      'END:VCALENDAR'
    ].join('\n')

    const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    window.URL.revokeObjectURL(url)

    log('info', '[calendar] iCal bundle downloaded', { count: trainings.length })

    return {
      success: true,
      message: `${trainings.length} Trainings heruntergeladen`,
      count: trainings.length
    }
  } catch (error) {
    log('error', '[calendar] Failed to download iCal bundle', error)
    return { success: false, message: 'Download fehlgeschlagen', error }
  }
}

// ==================== CALENDAR DETECTION ====================

/**
 * Detect user's preferred calendar provider
 * @returns {string} Detected provider or default
 */
export function detectCalendarProvider() {
  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()

  // iOS/macOS → Apple Calendar
  if (/iphone|ipad|ipod|mac/.test(userAgent) || /mac/.test(platform)) {
    return CALENDAR_PROVIDERS.APPLE
  }

  // Windows → Outlook
  if (/windows/.test(userAgent) || /win/.test(platform)) {
    return CALENDAR_PROVIDERS.OUTLOOK
  }

  // Android → Google Calendar
  if (/android/.test(userAgent)) {
    return CALENDAR_PROVIDERS.GOOGLE
  }

  // Default: Google Calendar (most universal)
  return CALENDAR_PROVIDERS.GOOGLE
}

/**
 * Get user-friendly calendar provider name
 * @param {string} provider - Provider constant
 * @returns {string} Display name
 */
export function getCalendarProviderName(provider) {
  const names = {
    [CALENDAR_PROVIDERS.GOOGLE]: 'Google Calendar',
    [CALENDAR_PROVIDERS.OUTLOOK]: 'Outlook Calendar',
    [CALENDAR_PROVIDERS.OFFICE365]: 'Office 365 Calendar',
    [CALENDAR_PROVIDERS.YAHOO]: 'Yahoo Calendar',
    [CALENDAR_PROVIDERS.APPLE]: 'Apple Calendar',
    [CALENDAR_PROVIDERS.ICAL]: 'iCal'
  }

  return names[provider] || provider
}

// ==================== EXPORTS ====================

export const calendarProviders = CALENDAR_PROVIDERS

export default {
  createGoogleCalendarUrl,
  createOutlookCalendarUrl,
  createOffice365CalendarUrl,
  createYahooCalendarUrl,
  bulkAddToGoogleCalendar,
  bulkAddToCalendar,
  downloadICalFile,
  downloadICalBundle,
  detectCalendarProvider,
  getCalendarProviderName,
  providers: CALENDAR_PROVIDERS
}
