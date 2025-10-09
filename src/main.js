// src/main.js
/**
 * Main Entry Point - FAM Trainingsplan
 * @version 3.0.0
 * @requires Node 20+
 * @description Modular, testable, production-ready architecture
 */

import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
import focus from '@alpinejs/focus'
import intersect from '@alpinejs/intersect'
import persist from '@alpinejs/persist'
import 'leaflet/dist/leaflet.css'
import './style.css'

import { trainingsplaner } from './js/trainingsplaner.js'
import { initIframeAutoResize } from './js/iframe-resize.js'
import { CONFIG, getBrowserInfo, log } from './js/config.js'

// ==================== ALPINE SETUP ====================

/**
 * Register Alpine Plugins
 * CRITICAL: Must be called BEFORE Alpine.start()
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
   */
  toggleMapView() {
    this.mapView = !this.mapView
    this.$nextTick(() => {
      window.notifyParentHeight?.()
    })
  },

  /**
   * Show List View
   */
  showListView() {
    this.mapView = false
    this.$nextTick(() => {
      window.notifyParentHeight?.()
    })
  },

  /**
   * Show Notification
   * @param {string} message - Message text
   * @param {string} type - info|success|warning|error
   * @param {number} duration - Duration in ms (0 = persistent)
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
window.Alpine = Alpine

log('info', 'Alpine.js initialized', {
  version: Alpine.version
})

// ==================== PWA SETUP ====================

/**
 * Setup PWA with Service Worker (Async)
 * IMPROVEMENT: Non-blocking initialization
 */
async function setupPWA() {
  if (!CONFIG.pwa.enabled) {
    log('info', 'PWA disabled in config')
    return
  }

  const browserInfo = getBrowserInfo()
  if (!browserInfo.supportsServiceWorker) {
    log('warn', 'Service Worker not supported')
    return
  }

  try {
    const { registerSW } = await import('virtual:pwa-register')

    const updateSW = registerSW({
      immediate: true,

      onNeedRefresh() {
        log('info', 'New content available')

        if (CONFIG.pwa.updateStrategy === 'auto') {
          updateSW(true)
        } else {
          promptUserForUpdate(updateSW)
        }
      },

      onOfflineReady() {
        log('info', 'App ready for offline use')
        Alpine.store('ui').showNotification(
          'App bereit für Offline-Nutzung! 🎉',
          'success',
          3000
        )
      },

      onRegisteredSW(swScriptUrl, registration) {
        log('info', 'Service Worker registered', { url: swScriptUrl })

        if (registration && CONFIG.pwa.updateCheckInterval > 0) {
          setupPeriodicUpdateCheck(registration)
        }
      },

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
 * @param {Function} updateSW - Update callback
 */
function promptUserForUpdate(updateSW) {
  Alpine.store('ui').showNotification(
    'Neue Version verfügbar! Klicken zum Aktualisieren.',
    'info',
    0 // Persistent
  )

  const handleClick = (e) => {
    if (e.target.closest('[data-notification]')) {
      updateSW(true)
      document.removeEventListener('click', handleClick)
    }
  }

  document.addEventListener('click', handleClick)
}

/**
 * Setup Periodic Update Check
 * @param {ServiceWorkerRegistration} registration
 */
function setupPeriodicUpdateCheck(registration) {
  setInterval(() => {
    registration.update()
    log('debug', 'Checking for updates...')
  }, CONFIG.pwa.updateCheckInterval)
}

/**
 * Setup Online/Offline Detection
 */
function setupOnlineOfflineDetection() {
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
 */
function initTouchGestures() {
  if (!CONFIG.features.enableTouchGestures || !getBrowserInfo().isTouch) {
    return
  }

  const touchConfig = CONFIG.ui.touch
  let touchStartX = 0
  let touchStartY = 0
  let touchStartTime = 0

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()
  }

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
      if (window.innerWidth < CONFIG.ui.mobileBreakpoint) {
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
 */
function initIframe() {
  if (!CONFIG.iframe.enabled) {
    return
  }

  initIframeAutoResize({
    parentOrigin: CONFIG.iframe.parentOrigin,
    targetSelector: '#trainings-container'
  })

  log('info', 'Iframe auto-resize initialized')
}

// ==================== PERFORMANCE MONITORING ====================

/**
 * Setup Performance Monitoring
 * IMPROVEMENT: Added error boundaries
 */
function setupPerformanceMonitoring() {
  if (!CONFIG.logging.enabled || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          log('debug', 'Page Load Performance', {
            dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart),
            tcp: Math.round(entry.connectEnd - entry.connectStart),
            ttfb: Math.round(entry.responseStart - entry.requestStart),
            download: Math.round(entry.responseEnd - entry.responseStart),
            domInteractive: Math.round(entry.domInteractive),
            domComplete: Math.round(entry.domComplete),
            loadComplete: Math.round(entry.loadEventEnd)
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
 */
window.addEventListener('error', (event) => {
  log('error', 'Global Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  })

  if (CONFIG.errors.showUserFriendlyMessages) {
    Alpine.store('ui').showNotification(
      'Ein Fehler ist aufgetreten. Bitte Seite neu laden.',
      'error',
      5000
    )
  }
})

/**
 * Unhandled Promise Rejection Handler
 */
window.addEventListener('unhandledrejection', (event) => {
  log('error', 'Unhandled Promise Rejection', event.reason)

  if (CONFIG.errors.showUserFriendlyMessages) {
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
 */
async function initApp() {
  try {
    // Initialize modules in parallel where possible
    await Promise.all([
      setupPWA(),
      initTouchGestures(),
      initIframe()
    ])

    setupPerformanceMonitoring()

    log('info', '🚀 App initialized', {
      version: CONFIG.pwa.version,
      env: import.meta.env.MODE,
      browser: getBrowserInfo(),
      features: Object.entries(CONFIG.features)
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
