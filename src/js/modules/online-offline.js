// src/js/modules/online-offline.js
/**
 * Online/Offline Detection
 * @description Shows notifications when network connectivity changes
 * @module online-offline
 */

// @ts-check

import { log } from '../config.js'

/**
 * Setup Online/Offline Detection
 * @param {any} Alpine - Alpine.js instance
 * @returns {void}
 */
export function setupOnlineOfflineDetection(Alpine) {
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
      Alpine.store('ui').showNotification('Wieder online!', 'success', 2000)
      log('info', 'Online mode')
    }
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  if (!navigator.onLine) {
    updateOnlineStatus()
  }
}
