// src/main.js
/**
 * Main Entry Point - FAM Trainingsplan
 * @version 3.1.0
 * @requires Node 20+
 * @description Orchestrator: Alpine Store + module initialization
 */

// @ts-check

import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import focus from '@alpinejs/focus'
import intersect from '@alpinejs/intersect'
import persist from '@alpinejs/persist'

import './style.css'

import { trainingsplaner } from './js/trainingsplaner.js'
import { initIframeAutoResize } from './js/iframe-resize.js'
import { CONFIG, getBrowserInfo, log } from './js/config.js'
import { initKeyboardShortcuts } from './js/keyboard-shortcuts.js'

// Extracted modules
import { migrateFilterFormat } from './js/modules/filter-migration.js'
import { initDarkMode } from './js/modules/dark-mode.js'
import { setupPerformanceMonitoring } from './js/modules/performance-monitoring.js'
import { initTouchGestures } from './js/modules/touch-gestures.js'
import { setupPWA } from './js/modules/pwa-setup.js'

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
 * Global UI Store
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
  filterSidebarOpen: Alpine.$persist(window.innerWidth >= 1024).as('filterSidebarOpen'),
  // @ts-ignore - Alpine.$persist plugin API
  sidebarCollapsed: Alpine.$persist(false).as('fam-trainingsplan-sidebar-collapsed'),
  mobileFilterOpen: false,
  locationSettingsOpen: false,
  selectedTrainingId: null,
  mapView: false,
  // @ts-ignore - Alpine.$persist plugin API
  activeView: Alpine.$persist('list').as('activeView'),
  // @ts-ignore - Alpine.$persist plugin API
  darkMode: Alpine.$persist(false).as('darkMode'),
  showScrollTop: false,
  // @ts-ignore - Alpine.$persist plugin API
  viewMode: Alpine.$persist('compact').as('viewMode'),
  // @ts-ignore - Alpine.$persist plugin API
  groupingMode: Alpine.$persist('wochentag').as('groupingMode'),
  // @ts-ignore - Alpine.$persist plugin API
  sortBy: Alpine.$persist(['wochentag', 'ort', 'uhrzeit', 'training']).as('sortBy'),
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

  /** @param {string} view */
  setActiveView(view) {
    if (!['list', 'split', 'map', 'favorites'].includes(view)) return
    // @ts-ignore - Alpine.js context properties
    this.activeView = view
  },

  /** @param {string} view @returns {boolean} */
  isActiveView(view) {
    // @ts-ignore - Alpine.js context properties
    return this.activeView === view
  },

  toggleMapView() {
    // @ts-ignore - Alpine.js context properties
    const newView = this.activeView === 'map' ? 'list' : 'map'
    // @ts-ignore - Alpine.js context properties
    this.setActiveView(newView)
    // @ts-ignore - Alpine.js context properties
    this.mapView = !this.mapView
    // @ts-ignore - Alpine.js context properties
    if (this.$nextTick) {
      // @ts-ignore - Alpine.js context properties
      this.$nextTick(() => { win.notifyParentHeight?.() })
    }
  },

  showListView() {
    // @ts-ignore - Alpine.js context properties
    this.mapView = false
    // @ts-ignore - Alpine.js context properties
    this.$nextTick(() => { win.notifyParentHeight?.() })
  },

  /**
   * @param {string} message
   * @param {NotificationType} [type='info']
   * @param {number} [duration=3000]
   */
  showNotification(message, type = 'info', duration = 3000) {
    // @ts-ignore - Alpine.js context properties
    clearTimeout(this.notificationTimeout)
    // @ts-ignore - Alpine.js context properties
    this.notification = { message, type, show: true }
    if (duration > 0) {
      // @ts-ignore - Alpine.js context properties
      this.notificationTimeout = setTimeout(() => {
        // @ts-ignore - Alpine.js context properties
        this.hideNotification()
      }, duration)
    }
  },

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

  clearAllFilters() {
    // @ts-ignore - Alpine.js context properties
    this.resetFilters()
  },

  /** @returns {boolean} */
  hasActiveFilters() {
    // @ts-ignore - Alpine.js context properties
    const filters = this.filters
    return (
      filters.wochentag.length > 0 ||
      filters.ort.length > 0 ||
      filters.training.length > 0 ||
      filters.altersgruppe.length > 0 ||
      filters._customFeatureFilter ||
      filters.searchTerm !== ''
    )
  },

  /** @returns {number} */
  getActiveFilterCount() {
    // @ts-ignore - Alpine.js context properties
    const filters = this.filters
    return (
      filters.wochentag.length +
      filters.ort.length +
      filters.training.length +
      filters.altersgruppe.length +
      (filters._customFeatureFilter ? 1 : 0) +
      (filters.searchTerm ? 1 : 0)
    )
  },

  toggleSidebar() {
    // @ts-ignore - Alpine.js context properties
    this.sidebarCollapsed = !this.sidebarCollapsed
  },

  /** @param {number} id */
  openTrainingModal(id) {
    // @ts-ignore - Alpine.js context properties
    this.selectedTrainingId = id
  },

  closeTrainingModal() {
    // @ts-ignore - Alpine.js context properties
    this.selectedTrainingId = null
  },

  updateScrollDirection() {
    const currentScrollY = window.scrollY
    // @ts-ignore - Alpine.js context properties
    this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up'
    // @ts-ignore - Alpine.js context properties
    this.lastScrollY = currentScrollY
  }
})

// ==================== FILTER OPTIONS STORE ====================

Alpine.store('filterOptions', {
  wochentage: [],
  orte: [],
  trainingsarten: [],
  altersgruppen: []
})

// ==================== PRE-ALPINE INITIALIZATION ====================

// Run migration BEFORE Alpine starts
migrateFilterFormat()

Alpine.data('trainingsplaner', trainingsplaner)
Alpine.start()

// Expose Alpine globally for debugging and testing
win.Alpine = Alpine

log('info', 'Alpine.js initialized', { version: Alpine.version })

// ==================== POST-ALPINE INITIALIZATION ====================

/**
 * Load saved maxDistanceKm from localStorage (Task 25: Distance filter)
 * @returns {void}
 */
function loadSavedDistanceFilter() {
  try {
    const savedDistance = localStorage.getItem('maxDistanceKm')
    if (savedDistance) {
      const distance = parseFloat(savedDistance)
      if (!isNaN(distance) && distance >= 0.5 && distance <= 25) {
        // @ts-ignore - Alpine.store returns unknown
        Alpine.store('ui').filters.maxDistanceKm = distance
        log('debug', 'Loaded saved distance filter', { distance })
      }
    }
  } catch (error) {
    log('warn', 'Failed to load saved distance filter', error)
  }
}

loadSavedDistanceFilter()
initDarkMode(Alpine)

/**
 * Initialize Keyboard Shortcuts wrapper
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

initKeyboardShortcutsModule()

/**
 * Initialize Iframe Auto-Resize wrapper
 * @returns {void}
 */
function initIframe() {
  if (!CONFIG.iframe?.enabled) return

  initIframeAutoResize({
    parentOrigin: CONFIG.iframe?.parentOrigin || '*',
    targetSelector: '#trainings-container'
  })

  log('info', 'Iframe auto-resize initialized')
}

// ==================== GLOBAL ERROR HANDLERS ====================

window.addEventListener('error', event => {
  log('error', 'Global Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })

  if (CONFIG.errors?.showUserFriendlyMessages) {
    // @ts-ignore - Alpine.store returns unknown
    Alpine.store('ui').showNotification(
      'Ein Fehler ist aufgetreten. Bitte Seite neu laden.',
      'error',
      5000
    )
  }
})

window.addEventListener('unhandledrejection', event => {
  log('error', 'Unhandled Promise Rejection', event.reason)

  if (CONFIG.errors?.showUserFriendlyMessages) {
    // @ts-ignore - Alpine.store returns unknown
    Alpine.store('ui').showNotification(
      'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      'error',
      5000
    )
  }
})

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
    await Promise.all([
      setupPWA(Alpine),
      Promise.resolve(initTouchGestures(Alpine)),
      Promise.resolve(initIframe())
    ])

    setupPerformanceMonitoring()

    log('info', 'App initialized', {
      version: CONFIG.pwa?.version || '1.0.0',
      env: import.meta.env?.MODE || 'production',
      browser: getBrowserInfo(),
      features: Object.entries(CONFIG.features || {})
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature)
    })
  } catch (error) {
    log('error', 'App initialization failed', error)
  }
}

initApp()

// ==================== EXPORTS ====================

export { Alpine }
