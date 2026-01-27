// src/js/modules/dark-mode.js
/**
 * Dark Mode Initialization
 * @description Applies dark/light theme based on stored Alpine preference
 * @module dark-mode
 */

// @ts-check

import { log } from '../config.js'

/**
 * Initialize Dark Mode based on stored preference
 * IMPORTANT: Must run after Alpine.start() to access stores
 * @param {any} Alpine - Alpine.js instance
 * @returns {void}
 */
export function initDarkMode(Alpine) {
  /** @type {{ darkMode: boolean }} */
  // @ts-ignore - Alpine.store returns unknown
  const store = Alpine.store('ui')
  const darkMode = store.darkMode

  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
    log('info', 'Dark mode activated from stored preference')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    log('info', 'Light mode activated')
  }
}
