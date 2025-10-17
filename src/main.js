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
import 'leaflet/dist/leaflet.css'
import './style.css'

import { trainingsplaner } from './js/trainingsplaner.js'
import { initIframeAutoResize } from './js/iframe-resize.js'
import { CONFIG, getBrowserInfo, log } from './js/config.js'

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
 * IMPROVEMENT: Centralized state management instead of scattered component state
 * IMPORTANT: Must be defined AFTER registerAlpinePlugins() to use Alpine.$persist
 * @type {{
 *   filterSidebarOpen: boolean,
 *   mapModalOpen: boolean,
 *   mobileFilterOpen: boolean,
 *   mapView: boolean,
 *   notification: Notification | null,
 *   notificationTimeout: number | null,
 *   filters: Filter,
 *   toggleMapView: () => void,
 *   showListView: () => void,
 *   showNotification: (message: string, type?: NotificationType, duration?: number) => void,
 *   hideNotification: () => void,
 *   resetFilters: () => void
 * }}
 */
Alpine.store('ui', {
  // View States
  filterSidebarOpen: Alpine.$persist(true).as('filterSidebarOpen'),
  mapModalOpen: false,
  mobileFilterOpen: false,
  mapView: false,

  // Notifications
  notification: null,
  notificationTimeout: null,

  // Filters (Persisted)
  filters: Alpine.$persist({
    wochentag: '',
    ort: '',
    training: '',
    altersgruppe: '',
    searchTerm: '',
    activeQuickFilter: null
  }).as('trainingFilters'),

  // ==================== VIEW METHODS ====================

  /**
   * Toggle Map View
   * @returns {void}
   */
  toggleMapView() {
    this.mapView = !this.mapView
    this.$nextTick(() => {
      win.notifyParentHeight?.()
    })
  },

  /**
   * Show List View
   * @returns {void}
   */
  showListView() {
    this.mapView = false
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
    clearTimeout(this.notificationTimeout)

    this.notification = {
      message,
      type,
      show: true
    }

    if (duration > 0) {
      this.notificationTimeout = setTimeout(() => {
        this.hideNotification()
      }, duration)
    }
  },

  /**
   * Hide Notification
   * @returns {void}
   */
  hideNotification() {
    if (this.notification) {
      this.notification.show = false
      setTimeout(() => {
        this.notification = null
      }, 300)
    }
  },

  /**
   * Reset All Filters
   * @returns {void}
   */
  resetFilters() {
    this.filters = {
      wochentag: '',
      ort: '',
      training: '',
      altersgruppe: '',
      searchTerm: '',
      activeQuickFilter: null
    }
  }
})
Alpine.data('trainingsplaner', trainingsplaner)
Alpine.start()

// Expose Alpine globally for debugging and testing
win.Alpine = Alpine

log('info', 'Alpine.js initialized', {
  version: Alpine.version
})

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
        Alpine.store('ui').showNotification(
          'App bereit für Offline-Nutzung! 🎉',
          'success',
          3000
        )
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
  const handleClick = (e) => {
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
      Alpine.store('ui').showNotification(
        'Keine Internetverbindung - Offline-Modus aktiv',
        'warning',
        5000
      )
      log('warn', 'Offline mode')
    } else {
      Alpine.store('ui').showNotification(
        'Wieder online! 🌐',
        'success',
        2000
      )
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
 * IMPROVEMENT: Extracted to separate, testable function
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

  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()

    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY
    const deltaTime = touchEndTime - touchStartTime

    // Ignore slow swipes or vertical movement
    if (
      deltaTime > touchConfig.swipeMaxTime ||
      Math.abs(deltaY) > touchConfig.swipeMaxVertical
    ) {
      return
    }

    const velocity = Math.abs(deltaX) / deltaTime

    if (velocity < touchConfig.swipeVelocity) {
      return
    }

    const store = Alpine.store('ui')

    // Swipe Left (close filter)
    if (deltaX < -touchConfig.swipeThreshold) {
      if (store.filterSidebarOpen || store.mobileFilterOpen) {
        store.filterSidebarOpen = false
        store.mobileFilterOpen = false
        log('debug', 'Swipe left - closing filter')
      }
    }

    // Swipe Right (open filter)
    if (deltaX > touchConfig.swipeThreshold && touchStartX < 50) {
      // @ts-ignore - CONFIG has dynamic properties
      if (window.innerWidth < (CONFIG.ui?.mobileBreakpoint || 768)) {
        store.mobileFilterOpen = true
      } else {
        store.filterSidebarOpen = true
      }
      log('debug', 'Swipe right - opening filter')
    }
  }

  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })

  log('info', 'Touch gestures initialized')
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
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
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
window.addEventListener('error', (event) => {
  log('error', 'Global Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })

  // @ts-ignore - CONFIG has dynamic properties
  if (CONFIG.errors?.showUserFriendlyMessages) {
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
window.addEventListener('unhandledrejection', (event) => {
  log('error', 'Unhandled Promise Rejection', event.reason)

  // @ts-ignore - CONFIG has dynamic properties
  if (CONFIG.errors?.showUserFriendlyMessages) {
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
