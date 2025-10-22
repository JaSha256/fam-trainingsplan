/**
 * Keyboard Shortcuts Module
 * AUFGABE 12: Desktop Power User Keyboard Navigation
 *
 * Shortcuts:
 * - Cmd/Ctrl + K: Quick Search (Spotlight-Style)
 * - M: Toggle Map View
 * - /: Focus Search Input
 * - 1-7: Wochentag-Filter (1=Montag, 7=Sonntag)
 * - H: "Heute"-Filter
 * - F: Toggle Filter Sidebar (already implemented)
 * - Escape: Close Modals (already implemented)
 *
 * @module keyboard-shortcuts
 */

// @ts-check

import { log } from './config.js'

/**
 * Check if user is currently typing in an input field
 * @returns {boolean} True if focus is in input/textarea/select
 */
function isInputFocused() {
  const activeElement = document.activeElement
  if (!activeElement) return false

  const tagName = activeElement.tagName
  return (
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName) ||
    // Check for contenteditable
    activeElement.hasAttribute('contenteditable')
  )
}

/**
 * Focus the search input field
 * @returns {void}
 */
function focusSearchInput() {
  const searchInput = document.querySelector('input[type="search"], input[placeholder*="Suche"]')
  if (searchInput && searchInput instanceof HTMLInputElement) {
    searchInput.focus()
    log('debug', 'Search input focused via keyboard shortcut')
  } else {
    log('warn', 'Search input not found')
  }
}

/**
 * Apply "Heute" (Today) filter
 * Adds today's weekday to the wochentag filter array
 * @param {any} alpineStore - Alpine.js store instance
 * @returns {void}
 */
function applyTodayFilter(alpineStore) {
  const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const today = weekdays[new Date().getDay()]

  // Add today to wochentag filter if not already there
  if (!alpineStore.filters.wochentag.includes(today)) {
    alpineStore.filters.wochentag.push(today)
    alpineStore.showNotification(`Filter: ${today}`, 'success', 2000)
    log('info', `Today filter applied: ${today}`)
  } else {
    alpineStore.showNotification(`${today} bereits gefiltert`, 'info', 2000)
  }
}

/**
 * Apply weekday filter by number (1=Montag, 7=Sonntag)
 * @param {number} dayNumber - Day number (1-7)
 * @param {any} alpineStore - Alpine.js store instance
 * @returns {void}
 */
function applyWeekdayFilter(dayNumber, alpineStore) {
  // Map 1-7 to Monday-Sunday (German weekdays)
  const weekdayMap = {
    1: 'Montag',
    2: 'Dienstag',
    3: 'Mittwoch',
    4: 'Donnerstag',
    5: 'Freitag',
    6: 'Samstag',
    7: 'Sonntag'
  }

  const weekday = weekdayMap[dayNumber]
  if (!weekday) {
    log('warn', `Invalid weekday number: ${dayNumber}`)
    return
  }

  // Toggle weekday in filter array
  const filters = alpineStore.filters.wochentag
  const index = filters.indexOf(weekday)

  if (index === -1) {
    // Add weekday
    filters.push(weekday)
    alpineStore.showNotification(`Filter: ${weekday}`, 'success', 2000)
    log('info', `Weekday filter added: ${weekday}`)
  } else {
    // Remove weekday
    filters.splice(index, 1)
    alpineStore.showNotification(`${weekday} entfernt`, 'info', 2000)
    log('info', `Weekday filter removed: ${weekday}`)
  }
}

/**
 * Initialize Keyboard Shortcuts
 * Registers global keydown event listener
 * @param {any} alpineStore - Alpine.js store instance (window.Alpine.store('ui'))
 * @returns {void}
 */
export function initKeyboardShortcuts(alpineStore) {
  if (!alpineStore) {
    log('error', 'Alpine store not provided to keyboard shortcuts')
    return
  }

  /**
   * Handle keydown events
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {void}
   */
  const handleKeydown = e => {
    // ==================== GLOBAL SHORTCUTS (with Cmd/Ctrl) ====================

    // Cmd/Ctrl + K: Quick Search (Spotlight-Style)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      focusSearchInput()
      return
    }

    // ==================== SINGLE KEY SHORTCUTS (only when not typing) ====================

    // Ignore single-key shortcuts if user is typing
    if (isInputFocused()) {
      return
    }

    // M: Toggle Map View
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault()
      alpineStore.toggleMapView()
      log('info', 'Map view toggled via keyboard shortcut (M)')
      return
    }

    // /: Focus Search Input
    if (e.key === '/') {
      e.preventDefault()
      focusSearchInput()
      return
    }

    // H: "Heute"-Filter
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault()
      applyTodayFilter(alpineStore)
      return
    }

    // 1-7: Wochentag-Filter (1=Montag, 7=Sonntag)
    if (e.key >= '1' && e.key <= '7') {
      e.preventDefault()
      const dayNumber = parseInt(e.key, 10)
      applyWeekdayFilter(dayNumber, alpineStore)
      return
    }
  }

  // Register event listener
  document.addEventListener('keydown', handleKeydown)

  log('info', 'Keyboard shortcuts initialized (AUFGABE 12)', {
    shortcuts: [
      'Cmd/Ctrl + K: Quick Search',
      'M: Toggle Map',
      '/: Focus Search',
      'H: Today Filter',
      '1-7: Weekday Filters'
    ]
  })

  // Return cleanup function for testing
  return () => {
    document.removeEventListener('keydown', handleKeydown)
    log('debug', 'Keyboard shortcuts cleaned up')
  }
}
