// src/js/types.js
/**
 * Type Definitions - FAM Trainingsplan
 * @fileoverview Central type definitions for TypeScript/JSDoc type-checking
 * @version 1.0.0
 */

/**
 * Training Entry
 *
 * Represents a single training session with all metadata
 *
 * @typedef {Object} Training
 * @property {number} id - Unique training ID
 * @property {string} wochentag - Day of week (Montag, Dienstag, ...)
 * @property {string} ort - Location name
 * @property {string} von - Start time (HH:MM format)
 * @property {string} bis - End time (HH:MM format)
 * @property {string} training - Training type (Parkour, Trampolin, Tricking, ...)
 * @property {string} altersgruppe - Age group (Kids, Teens, Adults, ...)
 * @property {number} alterVon - Minimum age
 * @property {number} alterBis - Maximum age
 * @property {number} [vonalter] - Alias for alterVon (backward compatibility)
 * @property {string} trainer - Trainer name
 * @property {string} probetraining - Trial training allowed ("ja" or "nein")
 * @property {string} [anmerkung] - Optional notes/remarks
 * @property {string} link - Registration link (URL)
 * @property {number} lat - Latitude coordinate
 * @property {number} lng - Longitude coordinate
 * @property {string} [adresse] - Optional full address
 * @property {string} [distanceText] - Optional distance text (e.g. "2.3 km")
 * @property {number} [distance] - Optional distance in kilometers
 */

/**
 * Filter State
 *
 * Represents the current filter state in the UI
 *
 * @typedef {Object} Filter
 * @property {string | string[]} wochentag - Selected day filter (empty = all)
 * @property {string | string[]} ort - Selected location filter (empty = all)
 * @property {string | string[]} training - Selected training type filter (empty = all)
 * @property {string | string[]} altersgruppe - Selected age group filter (empty = all)
 * @property {string} searchTerm - Search query string
 * @property {string | null} activeQuickFilter - Active quick filter name
 * @property {boolean} [distanceFilterActive] - Distance filter active state
 * @property {number} [maxDistanceKm] - Maximum distance in kilometers (for distance filter)
 * @property {((training: Training) => boolean) | string | null} [_customTimeFilter] - Custom time filter function (or empty string to clear)
 * @property {((training: Training) => boolean) | string | null} [_customFeatureFilter] - Custom feature filter function (or empty string to clear)
 * @property {((training: Training) => boolean) | string | null} [_customLocationFilter] - Custom location filter function (or empty string to clear)
 * @property {((training: Training) => boolean) | string | null} [_customPersonalFilter] - Custom personal filter function (or empty string to clear)
 */

/**
 * Metadata
 *
 * Available filter options extracted from training data
 *
 * @typedef {Object} Metadata
 * @property {string[]} orte - All available locations
 * @property {string[]} trainingsarten - All training types
 * @property {string[]} altersgruppen - All age groups
 * @property {string[]} wochentage - All weekdays
 */

/**
 * API Response
 *
 * Response from trainingsplan.json API
 *
 * @typedef {Object} ApiResponse
 * @property {string} version - Data version
 * @property {string} generated - Generation timestamp (ISO 8601)
 * @property {Metadata} metadata - Filter metadata
 * @property {Training[]} trainings - Array of trainings
 */

/**
 * Notification
 *
 * UI notification/toast message
 *
 * @typedef {Object} Notification
 * @property {string} message - Notification message text
 * @property {NotificationType} type - Notification type
 * @property {boolean} show - Visibility state
 */

/**
 * Notification Type
 *
 * @typedef {'info' | 'success' | 'warning' | 'error'} NotificationType
 */

/**
 * Geolocation Position
 *
 * User's geographic position
 *
 * @typedef {Object} UserPosition
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {number} [accuracy] - Position accuracy in meters
 */

/**
 * Calendar Event
 *
 * Calendar export event data
 *
 * @typedef {Object} CalendarEvent
 * @property {Date} start - Event start date/time
 * @property {Date} end - Event end date/time
 * @property {string} summary - Event title
 * @property {string} description - Event description
 * @property {string} location - Event location
 * @property {string} url - Event URL
 * @property {string} uid - Unique event ID
 */

/**
 * Calendar Provider
 *
 * Supported calendar providers
 *
 * @typedef {'google' | 'outlook' | 'office365' | 'yahoo' | 'apple' | 'ical'} CalendarProvider
 */

/**
 * Bulk Export Options
 *
 * Options for bulk calendar export
 *
 * @typedef {Object} BulkExportOptions
 * @property {number} [maxBulk=10] - Max events to open simultaneously
 * @property {number} [delay=600] - Delay between exports (ms)
 * @property {Function} [onProgress] - Progress callback (current, total)
 */

/**
 * Cache Entry
 *
 * Cached data with timestamp
 *
 * @typedef {Object} CacheEntry
 * @property {number} timestamp - Cache timestamp (Unix ms)
 * @property {any} data - Cached data
 */

/**
 * Browser Info
 *
 * Detected browser capabilities
 *
 * @typedef {Object} BrowserInfo
 * @property {boolean} isMobile - Is mobile device
 * @property {boolean} isTouch - Has touch support
 * @property {boolean} supportsLocalStorage - LocalStorage available
 * @property {boolean} supportsGeolocation - Geolocation API available
 * @property {boolean} supportsIntersectionObserver - IntersectionObserver available
 * @property {boolean} supportsResizeObserver - ResizeObserver available
 * @property {boolean} supportsMutationObserver - MutationObserver available
 * @property {boolean} supportsServiceWorker - Service Worker available
 * @property {boolean} supportsShareAPI - Web Share API available
 * @property {boolean} supportsClipboardAPI - Clipboard API available
 * @property {boolean} isStandalone - Running as PWA
 * @property {Object | null} connection - Network connection info
 */

// Export types for imports
// (This is just for IDE - doesn't affect runtime)
export {}
