// src/main.js
/**
 * Main Entry Point - FAM Trainingsplan
 * @version 3.0.0
 * @requires Node 20+
 * @description Modular, testable, production-ready architecture
 */

// @ts-check

// @ts-ignore - No type declarations available
import Alpine from 'alpinejs'
// @ts-ignore - No type declarations available
import collapse from '@alpinejs/collapse'
// @ts-ignore - No type declarations available
import focus from '@alpinejs/focus'
// @ts-ignore - No type declarations available
import intersect from '@alpinejs/intersect'
// @ts-ignore - No type declarations available
import persist from '@alpinejs/persist'

// IMPORTANT: Import Leaflet first and expose globally before markercluster
import * as L from 'leaflet'
window.L = L

// Now import Leaflet CSS and markercluster (depends on window.L)
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import './style.css'

import { trainingsplaner } from './js/trainingsplaner.js'
import { initIframeAutoResize } from './js/iframe-resize.js'
import { CONFIG, getBrowserInfo, log } from './js/config.js'
import { initKeyboardShortcuts } from './js/keyboard-shortcuts.js'

/**
 * @typedef {import('./js/types.js').Filter} Filter
 * @typedef {import('./js/types.js').Notification} Notification
 * @typedef {import('./js/types.js').NotificationType} NotificationType
 */

// Extend window interface for custom properties
/**
 * @typedef {Object} ExtendedWindow
 * @property {typeof Alpine} Alpine - Alpine.js instance
 * @property {(() => void) | undefined} notifyParentHeight - Iframe height notification callback
 */

/** @type {Window & ExtendedWindow} */
// @ts-ignore - Extended window type
const win = window

// ==================== ALPINE SETUP ====================

/**
 * Register Alpine Plugins
 * CRITICAL: Must be called BEFORE Alpine.start()
 * @returns {void}
 */
function registerAlpinePlugins() {
  Alpine.plugin(collapse)
  Alpine.plugin(focus)
  Alpine.plugin(intersect)
  Alpine.plugin(persist)

  log('debug', 'Alpine plugins registered', {
    plugins: ['collapse', 'focus', 'intersect', 'persist']
  })
}

// ==================== ALPINE INITIALIZATION ====================

registerAlpinePlugins()

// ==================== SHARED STORE ====================

/**
 * Global UI Store (Session 3: Updated)
 * IMPROVEMENT: Centralized state management instead of scattered component state
 * IMPORTANT: Must be defined AFTER registerAlpinePlugins() to use Alpine.$persist
 * @type {{
 *   filterSidebarOpen: boolean,
 *   mobileFilterOpen: boolean,
 *   mapView: boolean,
 *   activeView: 'list' | 'split' | 'map' | 'favorites',
 *   notification: Notification | null,
 *   notificationTimeout: number | null,
 *   filters: Filter,
 *   groupingMode: 'wochentag' | 'ort',
 *   sortBy: string[],
 *   setActiveView: (view: 'list' | 'split' | 'map' | 'favorites') => void,
 *   isActiveView: (view: string) => boolean,
 *   toggleMapView: () => void,
 *   showListView: () => void,
 *   showNotification: (message: string, type?: NotificationType, duration?: number) => void,
 *   hideNotification: () => void,
 *   resetFilters: () => void
 * }}
 */
// @ts-ignore - Alpine.store returns unknown, but we know the structure
Alpine.store('ui', {
  // View States
  // @ts-ignore - Alpine.$persist plugin API
  // QW1: Responsive default - OPEN on desktop (≥1024px), CLOSED on mobile
  filterSidebarOpen: Alpine.$persist(window.innerWidth >= 1024).as('filterSidebarOpen'),
  // @ts-ignore - Alpine.$persist plugin API
  // Task 12: Sidebar collapse/expand state - persisted in localStorage
  // Default: false (sidebar expanded/open for better UX)
  sidebarCollapsed: Alpine.$persist(false).as('fam-trainingsplan-sidebar-collapsed'),
  mobileFilterOpen: false,
  locationSettingsOpen: false,
  mapView: false,
  // @ts-ignore - Alpine.$persist plugin API
  // Task #11: New view switcher state - 'list' | 'map' | 'favorites'
  activeView: Alpine.$persist('list').as('activeView'),
  // @ts-ignore - Alpine.$persist plugin API
  darkMode: Alpine.$persist(false).as('darkMode'), // M3 Dark Mode toggle
  // QW9: Scroll to top button visibility
  showScrollTop: false,
  // Phase 2.1/2.2: View Mode Toggle (compact/detailed/list)
  // @ts-ignore - Alpine.$persist plugin API
  viewMode: Alpine.$persist('compact').as('viewMode'), // 'compact' | 'detailed' | 'list'
  // AUFGABE 5: List view grouping mode
  // @ts-ignore - Alpine.$persist plugin API
  groupingMode: Alpine.$persist('wochentag').as('groupingMode'), // 'wochentag' | 'ort'
  // NEW: Multi-level sorting (Session 3)
  // @ts-ignore - Alpine.$persist plugin API
  sortBy: Alpine.$persist(['wochentag', 'ort', 'uhrzeit', 'training']).as('sortBy'),
  // Task 19: Mobile bottom navigation scroll tracking
  scrollDirection: 'up',
  lastScrollY: 0,

  // Location Settings
  // @ts-ignore - Alpine.$persist plugin API
  manualLocationSet: Alpine.$persist(false).as('manualLocationSet'),
  // @ts-ignore - Alpine.$persist plugin API
  manualLocation: Alpine.$persist(null).as('manualLocation'),
  // @ts-ignore - Alpine.$persist plugin API
  manualLocationAddress: Alpine.$persist('').as('manualLocationAddress'),

  // Notifications
  notification: null,
  notificationTimeout: null,

  // Filters (Persisted)
  // @ts-ignore - Alpine.$persist plugin API
  // Task 13: Multi-select filters using arrays instead of strings
  filters: Alpine.$persist({
    wochentag: [],
    ort: [],
    training: [],
    altersgruppe: [],
    searchTerm: '',
    activeQuickFilter: null,
    _customTimeFilter: '',
    _customFeatureFilter: '',
    _customLocationFilter: '',
    _customPersonalFilter: ''
  }).as('trainingFilters'),

  // ==================== VIEW METHODS ====================

  /**
   * Set Active View (Session 3: Updated)
   * @param {string} view - View name: 'list' | 'split' | 'map' | 'favorites'
   * @returns {void}
   */
  setActiveView(view) {
    // Validate view value - only accept valid views
    if (!['list', 'split', 'map', 'favorites'].includes(view)) {
      return // Silently reject invalid values
    }

    // @ts-ignore - Alpine.js context properties
    this.activeView = view
  },

  /**
   * Check if View is Active (Task 11.3)
   * @param {string} view - View name to check
   * @returns {boolean}
   */
  isActiveView(view) {
    // @ts-ignore - Alpine.js context properties
    return this.activeView === view
  },

  /**
   * Toggle Map View - Backward Compatibility (Task 11.3)
   * Toggles between current view and map view
   * @returns {void}
   */
  toggleMapView() {
    // @ts-ignore - Alpine.js context properties
    const newView = this.activeView === 'map' ? 'list' : 'map'
    // @ts-ignore - Alpine.js context properties
    this.setActiveView(newView)

    // Keep legacy mapView toggle for existing code
    // @ts-ignore - Alpine.js context properties
    this.mapView = !this.mapView

    // Call $nextTick if available (not in test environment)
    // @ts-ignore - Alpine.js context properties
    if (this.$nextTick) {
      // @ts-ignore - Alpine.js context properties
      this.$nextTick(() => {
        win.notifyParentHeight?.()
      })
    }
  },

  /**
   * Show List View
   * @returns {void}
   */
  showListView() {
    // @ts-ignore - Alpine.js context properties
    this.mapView = false
    // @ts-ignore - Alpine.js context properties
    this.$nextTick(() => {
      win.notifyParentHeight?.()
    })
  },

  /**
   * Show Notification
   * @param {string} message - Message text
   * @param {NotificationType} [type='info'] - info|success|warning|error
   * @param {number} [duration=3000] - Duration in ms (0 = persistent)
   * @returns {void}
   */
  showNotification(message, type = 'info', duration = 3000) {
    // @ts-ignore - Alpine.js context properties
    clearTimeout(this.notificationTimeout)

    // @ts-ignore - Alpine.js context properties
    this.notification = {
      message,
      type,
      show: true
    }

    if (duration > 0) {
      // @ts-ignore - Alpine.js context properties
      this.notificationTimeout = setTimeout(() => {
        // @ts-ignore - Alpine.js context properties
        this.hideNotification()
      }, duration)
    }
  },

  /**
   * Hide Notification
   * @returns {void}
   */
  hideNotification() {
    // @ts-ignore - Alpine.js context properties
    if (this.notification) {
      // @ts-ignore - Alpine.js context properties
      this.notification.show = false
      setTimeout(() => {
        // @ts-ignore - Alpine.js context properties
        this.notification = null
      }, 300)
    }
  },

  /**
   * Reset All Filters
   * Task 13: Multi-select arrays
   * @returns {void}
   */
  resetFilters() {
    // @ts-ignore - Alpine.js context properties
    this.filters = {
      wochentag: [],
      ort: [],
      training: [],
      altersgruppe: [],
      searchTerm: '',
      activeQuickFilter: null,
      _customTimeFilter: '',
      _customFeatureFilter: '',
      _customLocationFilter: '',
      _customPersonalFilter: ''
    }
  },

  /**
   * Clear All Filters (Alias for resetFilters)
   * AUFGABE 0.3: Multi-Filter System
   * @returns {void}
   */
  clearAllFilters() {
    // @ts-ignore - Alpine.js context properties
    this.resetFilters()
  },

  /**
   * Check if Any Filters Are Active
   * AUFGABE 0.3: Multi-Filter System
   * @returns {boolean} True if any filter is active
   */
  hasActiveFilters() {
    // @ts-ignore - Alpine.js context properties
    const filters = this.filters
    return (
      filters.wochentag.length > 0 ||
      filters.ort.length > 0 ||
      filters.training.length > 0 ||
      filters.altersgruppe.length > 0 ||
      filters.probetraining ||
      filters.searchTerm !== ''
    )
  },

  /**
   * Get Active Filter Count
   * AUFGABE 0.3: Multi-Filter System
   * @returns {number} Number of active filters
   */
  getActiveFilterCount() {
    // @ts-ignore - Alpine.js context properties
    const filters = this.filters
    return (
      filters.wochentag.length +
      filters.ort.length +
      filters.training.length +
      filters.altersgruppe.length +
      (filters.probetraining ? 1 : 0) +
      (filters.searchTerm ? 1 : 0)
    )
  },

  /**
   * Toggle Sidebar Collapse/Expand (Task 12)
   * @returns {void}
   */
  toggleSidebar() {
    // @ts-ignore - Alpine.js context properties
    this.sidebarCollapsed = !this.sidebarCollapsed
  },

  /**
   * Update Scroll Direction (Task 19)
   * Tracks scroll direction for mobile bottom nav show/hide
   * @returns {void}
   */
  updateScrollDirection() {
    const currentScrollY = window.scrollY

    // Determine scroll direction
    // @ts-ignore - Alpine.js context properties
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up'

    // Update last scroll position
    // @ts-ignore - Alpine.js context properties
    this.lastScrollY = currentScrollY
  }
})

// ==================== FILTER OPTIONS STORE ====================

/**
 * Filter Options Store
 * Holds the available filter options populated from trainingsdata metadata
 * Used by filter dropdowns to avoid scope issues with nested x-data
 */
Alpine.store('filterOptions', {
  wochentage: [],
  orte: [],
  trainingsarten: [],
  altersgruppen: []
})

// ==================== LOCALSTORAGE MIGRATION ====================

/**
 * Migrate Old Filter Format to New Array Format
 * AUFGABE 0.3: Backward compatibility for users with old string-based filters
 * @returns {void}
 */
function migrateFilterFormat() {
  try {
    const storedFilters = localStorage.getItem('trainingFilters')
    if (!storedFilters) {
      log('debug', 'No stored filters found, skipping migration')
      return
    }

    const filters = JSON.parse(storedFilters)

    // Check if old format (strings instead of arrays)
    const needsMigration =
      typeof filters.wochentag === 'string' ||
      typeof filters.ort === 'string' ||
      typeof filters.training === 'string' ||
      typeof filters.altersgruppe === 'string'

    if (!needsMigration) {
      log('debug', 'Filters already in array format, skipping migration')
      return
    }

    // Migrate to new array format
    const migratedFilters = {
      wochentag: filters.wochentag ? [filters.wochentag] : [],
      ort: filters.ort ? [filters.ort] : [],
      training: filters.training ? [filters.training] : [],
      altersgruppe: filters.altersgruppe ? [filters.altersgruppe] : [],
      searchTerm: filters.searchTerm || '',
      activeQuickFilter: filters.activeQuickFilter || null,
      _customTimeFilter: filters._customTimeFilter || '',
      _customFeatureFilter: filters._customFeatureFilter || '',
      _customLocationFilter: filters._customLocationFilter || '',
      _customPersonalFilter: filters._customPersonalFilter || ''
    }

    localStorage.setItem('trainingFilters', JSON.stringify(migratedFilters))
    log('info', 'Successfully migrated filter format from strings to arrays', {
      before: {
        wochentag: typeof filters.wochentag,
        ort: typeof filters.ort,
        training: typeof filters.training,
        altersgruppe: typeof filters.altersgruppe
      },
      after: {
        wochentag: Array.isArray(migratedFilters.wochentag),
        ort: Array.isArray(migratedFilters.ort),
        training: Array.isArray(migratedFilters.training),
        altersgruppe: Array.isArray(migratedFilters.altersgruppe)
      }
    })
  } catch (error) {
    log('error', 'Failed to migrate filter format', error)
    // Don't throw - allow app to continue with default filters
  }
}

// Run migration BEFORE Alpine starts
migrateFilterFormat()

Alpine.data('trainingsplaner', trainingsplaner)
Alpine.start()

// Expose Alpine globally for debugging and testing
win.Alpine = Alpine

log('info', 'Alpine.js initialized', {
  version: Alpine.version
})

// ==================== M3 DARK MODE INITIALIZATION ====================

/**
 * Initialize Dark Mode based on stored preference
 * IMPORTANT: Must run after Alpine.start() to access stores
 * @returns {void}
 */
function initDarkMode() {
  // @ts-ignore - Alpine.store returns unknown
  const darkMode = Alpine.store('ui').darkMode

  // Apply dark mode on initial load
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
    log('info', 'Dark mode activated from stored preference')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    log('info', 'Light mode activated')
  }
}

// Initialize dark mode after Alpine is ready
initDarkMode()

// ==================== KEYBOARD SHORTCUTS ====================

/**
 * Initialize Keyboard Shortcuts for Desktop Power Users
 * AUFGABE 12: Desktop keyboard navigation
 * IMPORTANT: Must run after Alpine.start() to access stores
 * @returns {void}
 */
function initKeyboardShortcutsModule() {
  // @ts-ignore - Alpine.store returns unknown
  const alpineStore = Alpine.store('ui')

  if (!alpineStore) {
    log('error', 'Alpine UI store not available for keyboard shortcuts')
    return
  }

  initKeyboardShortcuts(alpineStore)
}

// Initialize keyboard shortcuts after Alpine is ready
initKeyboardShortcutsModule()

// ==================== PWA SETUP ====================

/**
 * Setup PWA with Service Worker (Async)
 * IMPROVEMENT: Non-blocking initialization
 * @returns {Promise<void>}
 */
async function setupPWA() {
  // @ts-ignore - CONFIG has dynamic properties
  if (!CONFIG.pwa?.enabled) {
    log('info', 'PWA disabled in config')
    return
  }

  const browserInfo = getBrowserInfo()
  if (!browserInfo.supportsServiceWorker) {
    log('warn', 'Service Worker not supported')
    return
  }

  try {
    // @ts-ignore - Virtual module from Vite PWA plugin
    const { registerSW } = await import('virtual:pwa-register')

    const updateSW = registerSW({
      immediate: true,

      /**
       * Called when new content is available
       * @returns {void}
       */
      onNeedRefresh() {
        log('info', 'New content available')

        // @ts-ignore - CONFIG has dynamic properties
        if (CONFIG.pwa?.updateStrategy === 'auto') {
          updateSW(true)
        } else {
          promptUserForUpdate(updateSW)
        }
      },

      /**
       * Called when app is ready for offline use
       * @returns {void}
       */
      onOfflineReady() {
        log('info', 'App ready for offline use')
        // @ts-ignore - Alpine.store returns unknown
        Alpine.store('ui').showNotification('App bereit für Offline-Nutzung! 🎉', 'success', 3000)
      },

      /**
       * Called when service worker is registered
       * @param {string} swScriptUrl - Service worker script URL
       * @param {ServiceWorkerRegistration | undefined} registration - Service worker registration
       * @returns {void}
       */
      onRegisteredSW(swScriptUrl, registration) {
        log('info', 'Service Worker registered', { url: swScriptUrl })

        // @ts-ignore - CONFIG has dynamic properties
        if (registration && CONFIG.pwa?.updateCheckInterval > 0) {
          setupPeriodicUpdateCheck(registration)
        }
      },

      /**
       * Called when service worker registration fails
       * @param {Error} error - Registration error
       * @returns {void}
       */
      onRegisterError(error) {
        log('error', 'Service Worker registration failed', error)
      }
    })

    setupOnlineOfflineDetection()
    log('info', 'PWA initialized successfully')
  } catch (error) {
    log('error', 'PWA setup failed', error)
  }
}

/**
 * Prompt User for Update
 * @param {(reloadPage?: boolean) => Promise<void>} updateSW - Update callback
 * @returns {void}
 */
function promptUserForUpdate(updateSW) {
  // @ts-ignore - Alpine.store returns unknown
  Alpine.store('ui').showNotification(
    'Neue Version verfügbar! Klicken zum Aktualisieren.',
    'info',
    0 // Persistent
  )

  /**
   * Handle click on notification
   * @param {MouseEvent} e - Click event
   * @returns {void}
   */
  const handleClick = e => {
    if (e.target && /** @type {HTMLElement} */ (e.target).closest('[data-notification]')) {
      updateSW(true)
      document.removeEventListener('click', handleClick)
    }
  }

  document.addEventListener('click', handleClick)
}

/**
 * Setup Periodic Update Check
 * @param {ServiceWorkerRegistration} registration - Service worker registration
 * @returns {void}
 */
function setupPeriodicUpdateCheck(registration) {
  setInterval(() => {
    registration.update()
    log('debug', 'Checking for updates...')
    // @ts-ignore - CONFIG has dynamic properties
  }, CONFIG.pwa?.updateCheckInterval || 60000)
}

/**
 * Setup Online/Offline Detection
 * @returns {void}
 */
function setupOnlineOfflineDetection() {
  /**
   * Update online status and show notification
   * @returns {void}
   */
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine

    if (!isOnline) {
      // @ts-ignore - Alpine.store returns unknown
      Alpine.store('ui').showNotification(
        'Keine Internetverbindung - Offline-Modus aktiv',
        'warning',
        5000
      )
      log('warn', 'Offline mode')
    } else {
      // @ts-ignore - Alpine.store returns unknown
      Alpine.store('ui').showNotification('Wieder online! 🌐', 'success', 2000)
      log('info', 'Online mode')
    }
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  if (!navigator.onLine) {
    updateOnlineStatus()
  }
}

// ==================== TOUCH GESTURES ====================

/**
 * Initialize Touch Gestures (Mobile)
 * AUFGABE 10: Enhanced touch gestures for mobile UX
 * - Swipe Left/Right: View switching (List ↔ Map)
 * - Pull-to-Refresh: Refresh training data
 * - Swipe Left/Right on edges: Open/close filter sidebar
 * @returns {void}
 */
function initTouchGestures() {
  // @ts-ignore - CONFIG has dynamic properties
  if (!CONFIG.features?.enableTouchGestures || !getBrowserInfo().isTouch) {
    return
  }

  // @ts-ignore - CONFIG has dynamic properties
  const touchConfig = CONFIG.ui?.touch || {}
  let touchStartX = 0
  let touchStartY = 0
  let touchStartTime = 0
  let isPullingDown = false

  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchStart = e => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()

    // Check if pull-to-refresh is possible (scrolled to top)
    if (window.scrollY === 0 && touchStartY < 100) {
      isPullingDown = true
    }
  }

  /**
   * Handle touch move event for pull-to-refresh indicator
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchMove = e => {
    if (!isPullingDown) return

    const touchCurrentY = e.touches[0].clientY
    const pullDistance = touchCurrentY - touchStartY

    // Show pull-to-refresh indicator if pulling down
    if (pullDistance > 0) {
      const refreshIndicator = document.getElementById('pull-refresh-indicator')
      if (refreshIndicator) {
        refreshIndicator.style.opacity = Math.min(pullDistance / 100, 1).toString()
        refreshIndicator.style.transform = `translateY(${Math.min(pullDistance / 2, 50)}px)`
      }
    }
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchEnd = e => {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()

    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY
    const deltaTime = touchEndTime - touchStartTime

    // @ts-ignore - Alpine.store returns unknown
    const store = Alpine.store('ui')

    // AUFGABE 10.2: Pull-to-Refresh
    if (isPullingDown && deltaY > 100 && deltaTime < 1000) {
      log('info', 'Pull-to-refresh triggered')
      // @ts-ignore - store properties
      store.showNotification('Aktualisiere Trainings...', 'info', 2000)

      // Reload page to refresh data
      setTimeout(() => {
        window.location.reload()
      }, 500)

      // Reset indicator
      const refreshIndicator = document.getElementById('pull-refresh-indicator')
      if (refreshIndicator) {
        refreshIndicator.style.opacity = '0'
        refreshIndicator.style.transform = 'translateY(0)'
      }
      isPullingDown = false
      return
    }

    // Reset pull-to-refresh indicator
    if (isPullingDown) {
      const refreshIndicator = document.getElementById('pull-refresh-indicator')
      if (refreshIndicator) {
        refreshIndicator.style.opacity = '0'
        refreshIndicator.style.transform = 'translateY(0)'
      }
      isPullingDown = false
    }

    // HORIZONTAL SWIPES (must be fast and mostly horizontal)
    const isHorizontalSwipe =
      Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < touchConfig.swipeMaxTime
    const velocity = Math.abs(deltaX) / deltaTime

    if (!isHorizontalSwipe || velocity < touchConfig.swipeVelocity) {
      return
    }

    // AUFGABE 10.1: View Switching (Swipe in middle of screen, not edges)
    const isMiddleSwipe = touchStartX > 80 && touchStartX < window.innerWidth - 80

    if (isMiddleSwipe && Math.abs(deltaX) > touchConfig.swipeThreshold) {
      // @ts-ignore - store properties
      const currentView = store.activeView

      // Swipe Left: Next view (list → map → favorites → list)
      if (deltaX < -touchConfig.swipeThreshold) {
        const viewCycle = { list: 'map', map: 'favorites', favorites: 'list' }
        // @ts-ignore - store properties
        const nextView = viewCycle[currentView] || 'list'
        // @ts-ignore - store properties
        store.setActiveView(nextView)
        log('info', `Swipe left - switching to ${nextView} view`)
        return
      }

      // Swipe Right: Previous view (list → favorites → map → list)
      if (deltaX > touchConfig.swipeThreshold) {
        const viewCycle = { list: 'favorites', map: 'list', favorites: 'map' }
        // @ts-ignore - store properties
        const prevView = viewCycle[currentView] || 'list'
        // @ts-ignore - store properties
        store.setActiveView(prevView)
        log('info', `Swipe right - switching to ${prevView} view`)
        return
      }
    }

    // Edge Swipes: Open/Close Filter Sidebar
    // Swipe Left from right edge (close filter if open)
    if (deltaX < -touchConfig.swipeThreshold && touchStartX > window.innerWidth - 50) {
      // @ts-ignore - store properties
      if (store.filterSidebarOpen || store.mobileFilterOpen) {
        // @ts-ignore - store properties
        store.filterSidebarOpen = false
        // @ts-ignore - store properties
        store.mobileFilterOpen = false
        log('debug', 'Swipe left from edge - closing filter')
      }
      return
    }

    // Swipe Right from left edge (open filter)
    if (deltaX > touchConfig.swipeThreshold && touchStartX < 50) {
      // @ts-ignore - CONFIG has dynamic properties
      if (window.innerWidth < (CONFIG.ui?.mobileBreakpoint || 768)) {
        // @ts-ignore - store properties
        store.mobileFilterOpen = true
      } else {
        // @ts-ignore - store properties
        store.filterSidebarOpen = true
      }
      log('debug', 'Swipe right from edge - opening filter')
      return
    }
  }

  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })

  log('info', 'Touch gestures initialized (AUFGABE 10: View switching + Pull-to-refresh)')
}

// ==================== IFRAME RESIZE ====================

/**
 * Initialize Iframe Auto-Resize
 * @returns {void}
 */
function initIframe() {
  // @ts-ignore - CONFIG has dynamic properties
  if (!CONFIG.iframe?.enabled) {
    return
  }

  initIframeAutoResize({
    // @ts-ignore - CONFIG has dynamic properties
    parentOrigin: CONFIG.iframe?.parentOrigin || '*',
    targetSelector: '#trainings-container'
  })

  log('info', 'Iframe auto-resize initialized')
}

// ==================== PERFORMANCE MONITORING ====================

/**
 * Setup Performance Monitoring
 * IMPROVEMENT: Added error boundaries
 * @returns {void}
 */
function setupPerformanceMonitoring() {
  // @ts-ignore - CONFIG has dynamic properties
  if (!CONFIG.logging?.enabled || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'navigation') {
          // Cast to PerformanceNavigationTiming for type safety
          const navEntry = /** @type {PerformanceNavigationTiming} */ (entry)
          log('debug', 'Page Load Performance', {
            dns: Math.round(navEntry.domainLookupEnd - navEntry.domainLookupStart),
            tcp: Math.round(navEntry.connectEnd - navEntry.connectStart),
            ttfb: Math.round(navEntry.responseStart - navEntry.requestStart),
            download: Math.round(navEntry.responseEnd - navEntry.responseStart),
            domInteractive: Math.round(navEntry.domInteractive),
            domComplete: Math.round(navEntry.domComplete),
            loadComplete: Math.round(navEntry.loadEventEnd)
          })
        }
      })
    })

    observer.observe({ entryTypes: ['navigation'] })
  } catch (error) {
    log('warn', 'Performance monitoring failed', error)
  }
}

// ==================== GLOBAL ERROR HANDLERS ====================

/**
 * Global Error Handler
 * @param {ErrorEvent} event - Error event
 * @returns {void}
 */
window.addEventListener('error', event => {
  log('error', 'Global Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })

  // @ts-ignore - CONFIG has dynamic properties
  if (CONFIG.errors?.showUserFriendlyMessages) {
    // @ts-ignore - Alpine.store returns unknown
    Alpine.store('ui').showNotification(
      'Ein Fehler ist aufgetreten. Bitte Seite neu laden.',
      'error',
      5000
    )
  }
})

/**
 * Unhandled Promise Rejection Handler
 * @param {PromiseRejectionEvent} event - Promise rejection event
 * @returns {void}
 */
window.addEventListener('unhandledrejection', event => {
  log('error', 'Unhandled Promise Rejection', event.reason)

  // @ts-ignore - CONFIG has dynamic properties
  if (CONFIG.errors?.showUserFriendlyMessages) {
    // @ts-ignore - Alpine.store returns unknown
    Alpine.store('ui').showNotification(
      'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      'error',
      5000
    )
  }
})

/**
 * Visibility Change Handler
 * IMPROVEMENT: Better resource management when tab hidden
 * @returns {void}
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    log('debug', 'Page hidden - pausing updates')
  } else {
    log('debug', 'Page visible - resuming updates')
  }
})

// ==================== INITIALIZATION ====================

/**
 * Initialize Application
 * @returns {Promise<void>}
 */
async function initApp() {
  try {
    // Initialize modules in parallel where possible
    await Promise.all([
      setupPWA(),
      Promise.resolve(initTouchGestures()),
      Promise.resolve(initIframe())
    ])

    setupPerformanceMonitoring()

    log('info', '🚀 App initialized', {
      // @ts-ignore - CONFIG has dynamic properties
      version: CONFIG.pwa?.version || '1.0.0',
      // @ts-ignore - Vite import.meta.env
      env: import.meta.env?.MODE || 'production',
      browser: getBrowserInfo(),
      // @ts-ignore - CONFIG has dynamic properties
      features: Object.entries(CONFIG.features || {})
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature)
    })
  } catch (error) {
    log('error', 'App initialization failed', error)
  }
}

// Start initialization
initApp()

// ==================== EXPORTS ====================

export { Alpine }
