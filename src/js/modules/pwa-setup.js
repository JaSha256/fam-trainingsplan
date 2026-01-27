// src/js/modules/pwa-setup.js
/**
 * PWA Setup
 * @description Service Worker registration, update prompts, periodic update checks
 * @module pwa-setup
 */

// @ts-check

import { CONFIG, getBrowserInfo, log } from '../config.js'
import { setupOnlineOfflineDetection } from './online-offline.js'

/**
 * Setup PWA with Service Worker (Async)
 * Non-blocking initialization
 * @param {any} Alpine - Alpine.js instance
 * @returns {Promise<void>}
 */
export async function setupPWA(Alpine) {
  if (!CONFIG.pwa?.enabled) {
    log('info', 'PWA disabled in config')
    return
  }

  const browserInfo = getBrowserInfo()
  if (!browserInfo.supportsServiceWorker) {
    log('warn', 'Service Worker not supported')
    return
  }

  // Only load PWA in production or when explicitly enabled in dev
  if (!import.meta.env.PROD) {
    log('info', 'PWA disabled in development mode (use production build to test PWA)')
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

        if (CONFIG.pwa?.updateStrategy === 'auto') {
          updateSW(true)
        } else {
          promptUserForUpdate(Alpine, updateSW)
        }
      },

      /**
       * Called when app is ready for offline use
       * @returns {void}
       */
      onOfflineReady() {
        log('info', 'App ready for offline use')
        // @ts-ignore - Alpine.store returns unknown
        Alpine.store('ui').showNotification('App bereit fuer Offline-Nutzung!', 'success', 3000)
      },

      /**
       * Called when service worker is registered
       * @param {string} swScriptUrl - Service worker script URL
       * @param {ServiceWorkerRegistration | undefined} registration - Service worker registration
       * @returns {void}
       */
      onRegisteredSW(swScriptUrl, registration) {
        log('info', 'Service Worker registered', { url: swScriptUrl })

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

    setupOnlineOfflineDetection(Alpine)
    log('info', 'PWA initialized successfully')
  } catch (error) {
    log('error', 'PWA setup failed', error)
  }
}

/**
 * Prompt User for Update
 * @param {any} Alpine - Alpine.js instance
 * @param {(reloadPage?: boolean) => Promise<void>} updateSW - Update callback
 * @returns {void}
 */
function promptUserForUpdate(Alpine, updateSW) {
  // @ts-ignore - Alpine.store returns unknown
  Alpine.store('ui').showNotification(
    'Neue Version verfuegbar! Klicken zum Aktualisieren.',
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
  }, CONFIG.pwa?.updateCheckInterval || 60000)
}
