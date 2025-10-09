// src/js/iframe-resize.js
/**
 * Iframe Auto-Resize System
 * @version 3.0.0
 * @requires Node 20+
 * @description
 * Communicates with parent window for dynamic height adjustments.
 * Optimized for performance with debouncing, throttling, and smart observers.
 */

import { CONFIG, log } from './config.js'
import { throttle } from './utils.js'

// ==================== CONSTANTS ====================

const CONSTANTS = Object.freeze({
  DEBOUNCE_DELAY: 50,           // ms - Delay before notifying parent
  MINIMUM_HEIGHT_CHANGE: 5,     // px - Don't notify for small changes
  MINIMUM_HEIGHT: 400,          // px - Minimum iframe height
  MAXIMUM_HEIGHT: 10000,        // px - Maximum iframe height
  EXTRA_PADDING: 40,            // px - Extra space below content
  SCROLL_THROTTLE: 250,         // ms - Throttle scroll events heavily
  RESIZE_THROTTLE: 100          // ms - Throttle resize notifications
})

// ==================== STATE ====================

let state = {
  notifyTimeout: null,
  lastSentHeight: 0,
  parentOrigin: null,
  resizeObserver: null,
  mutationObserver: null,
  isInitialized: false,
  targetElement: null,
  eventListeners: []
}

// ==================== ORIGIN DETECTION ====================

/**
 * Detect parent origin automatically
 * @returns {string} Parent origin
 */
function detectParentOrigin() {
  if (state.parentOrigin) {
    return state.parentOrigin
  }

  try {
    // Try to read parent origin
    if (window.parent !== window) {
      if (document.referrer) {
        const url = new URL(document.referrer)
        state.parentOrigin = url.origin
      } else {
        // Fallback to config
        state.parentOrigin = CONFIG.iframe.parentOrigin
      }
    }
  } catch (error) {
    log('warn', '[iframe-resize] Could not detect parent origin, using fallback', error)
    state.parentOrigin = CONFIG.iframe.parentOrigin
  }

  // Validate origin
  if (!isOriginAllowed(state.parentOrigin)) {
    log('warn', '[iframe-resize] Parent origin not in allowed list', { origin: state.parentOrigin })
  }

  return state.parentOrigin
}

/**
 * Check if origin is allowed
 * @param {string} origin - Origin to check
 * @returns {boolean}
 */
function isOriginAllowed(origin) {
  if (!CONFIG.iframe.allowedOrigins) {
    return true // No restrictions
  }
  
  return CONFIG.iframe.allowedOrigins.includes(origin)
}

// ==================== HEIGHT CALCULATION ====================

/**
 * Calculate required height
 * @returns {number} Height in pixels
 */
function calculateRequiredHeight() {
  // Map view: Use viewport height
  if (isMapViewActive()) {
    return window.innerHeight
  }

  // List view: Calculate content height
  return calculateListViewHeight()
}

/**
 * Check if map view is active
 * @returns {boolean}
 */
function isMapViewActive() {
  // Check Alpine store (primary method)
  if (window.Alpine?.store) {
    try {
      return window.Alpine.store('ui').mapView === true
    } catch (error) {
      // Fallback to DOM check
    }
  }

  // DOM fallback
  const mapContainer = document.querySelector('[x-show="$store.ui.mapView"]')
  if (mapContainer) {
    const isVisible = window.getComputedStyle(mapContainer).display !== 'none'
    return isVisible
  }

  return false
}

/**
 * Calculate height for list view
 * @returns {number} Height in pixels
 */
function calculateListViewHeight() {
  const docEl = document.documentElement
  const body = document.body

  // Strategy 1: Last training card
  const cards = document.querySelectorAll('.training-card, [data-training-card]')
  if (cards.length > 0) {
    const lastCard = cards[cards.length - 1]
    const rect = lastCard.getBoundingClientRect()
    const cardBottom = Math.ceil(rect.bottom + window.scrollY)

    return Math.max(
      cardBottom + CONSTANTS.EXTRA_PADDING,
      docEl.scrollHeight,
      body.scrollHeight,
      CONSTANTS.MINIMUM_HEIGHT
    )
  }

  // Strategy 2: Main container
  const main = document.querySelector('main, #app, [x-data], #trainings-container')
  if (main) {
    const rect = main.getBoundingClientRect()
    return Math.max(
      Math.ceil(rect.bottom + window.scrollY + CONSTANTS.EXTRA_PADDING),
      CONSTANTS.MINIMUM_HEIGHT
    )
  }

  // Strategy 3: Document height (fallback)
  return Math.max(
    docEl.scrollHeight,
    body.scrollHeight,
    docEl.offsetHeight,
    body.offsetHeight,
    docEl.clientHeight,
    body.clientHeight,
    CONSTANTS.MINIMUM_HEIGHT
  )
}

// ==================== MESSAGE SENDING ====================

/**
 * Notify parent of height change (debounced)
 * @param {string} [origin] - Optional custom origin
 */
export function notifyParentHeight(origin = null) {
  if (window.parent === window) return
  if (!CONFIG.iframe.enabled) return

  clearTimeout(state.notifyTimeout)

  state.notifyTimeout = setTimeout(() => {
    requestAnimationFrame(() => {
      sendHeightToParent(origin)
    })
  }, CONSTANTS.DEBOUNCE_DELAY)
}

/**
 * Send height to parent immediately (no debounce)
 * @param {string} [origin] - Optional custom origin
 */
function sendHeightToParent(origin = null) {
  const height = calculateRequiredHeight()
  const targetOrigin = origin || detectParentOrigin()

  // Only send if significant change
  if (Math.abs(height - state.lastSentHeight) < CONSTANTS.MINIMUM_HEIGHT_CHANGE) {
    return
  }

  // Clamp height to limits
  const clampedHeight = Math.max(
    CONSTANTS.MINIMUM_HEIGHT,
    Math.min(height, CONSTANTS.MAXIMUM_HEIGHT)
  )

  try {
    const message = {
      type: 'resize',
      height: Math.round(clampedHeight),
      timestamp: Date.now(),
      view: isMapViewActive() ? 'map' : 'list',
      source: 'fam-trainingsplan'
    }

    window.parent.postMessage(message, targetOrigin)

    state.lastSentHeight = clampedHeight

    log('debug', `[iframe-resize] → ${clampedHeight}px (${message.view})`, { origin: targetOrigin })
  } catch (error) {
    log('error', '[iframe-resize] postMessage error', error)
  }
}

// ==================== EVENT HANDLERS ====================

/**
 * Handle messages from parent
 * @param {MessageEvent} event - Message event
 */
function handleParentMessage(event) {
  // Validate origin
  if (!isOriginAllowed(event.origin)) {
    log('warn', '[iframe-resize] Message from unknown origin', { origin: event.origin })
    return
  }

  // Handle init request
  if (event.data?.type === 'init') {
    log('debug', '[iframe-resize] Received init request')
    setTimeout(() => notifyParentHeight(), 100)
  }

  // Handle height request
  if (event.data?.type === 'requestHeight') {
    log('debug', '[iframe-resize] Received height request')
    forceResize()
  }
}

/**
 * Setup all event listeners
 * @param {HTMLElement} target - Target element to observe
 * @param {Function} notify - Notification function (throttled)
 */
function setupEventListeners(target, notify) {
  const listeners = []

  // Helper to track listeners
  const addListener = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options)
    listeners.push({ element, event, handler })
  }

  // Window events
  addListener(window, 'load', notify)
  addListener(window, 'resize', notify, { passive: true })
  addListener(window, 'orientationchange', notify, { passive: true })

  // Font loading
  if (document.fonts?.ready) {
    document.fonts.ready.then(notify)
  }

  // Alpine.js events
  if (window.Alpine) {
    addListener(document, 'alpine:init', notify)
    addListener(document, 'alpine:initialized', notify)
    addListener(document, 'alpine:updated', notify)
  }

  // Scroll (heavily throttled)
  const scrollNotify = throttle(notify, CONSTANTS.SCROLL_THROTTLE)
  addListener(window, 'scroll', scrollNotify, { passive: true })

  // Parent message listener
  addListener(window, 'message', handleParentMessage)

  // Store listeners for cleanup
  state.eventListeners = listeners

  log('debug', '[iframe-resize] Event listeners attached', { count: listeners.length })
}

// ==================== OBSERVERS ====================

/**
 * Setup ResizeObserver
 * @param {HTMLElement} target - Target element
 * @param {Function} notify - Notification function
 */
function setupResizeObserver(target, notify) {
  if (!window.ResizeObserver) {
    log('warn', '[iframe-resize] ResizeObserver not supported')
    return
  }

  try {
    state.resizeObserver = new ResizeObserver(notify)
    state.resizeObserver.observe(target)
    state.resizeObserver.observe(document.body)
    log('debug', '[iframe-resize] ResizeObserver attached')
  } catch (error) {
    log('error', '[iframe-resize] ResizeObserver setup failed', error)
  }
}

/**
 * Setup MutationObserver
 * @param {HTMLElement} target - Target element
 * @param {Function} notify - Notification function
 */
function setupMutationObserver(target, notify) {
  if (!window.MutationObserver) {
    log('warn', '[iframe-resize] MutationObserver not supported')
    return
  }

  try {
    state.mutationObserver = new MutationObserver(notify)
    state.mutationObserver.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'x-show', 'x-if', 'hidden']
    })
    log('debug', '[iframe-resize] MutationObserver attached')
  } catch (error) {
    log('error', '[iframe-resize] MutationObserver setup failed', error)
  }
}

// ==================== INITIALIZATION ====================

/**
 * Initialize iframe auto-resize
 * @param {Object} options - Configuration options
 * @param {string} [options.parentOrigin] - Parent origin
 * @param {string} [options.targetSelector] - Target selector
 * @returns {boolean} Success status
 */
export function initIframeAutoResize(options = {}) {
  if (state.isInitialized) {
    log('warn', '[iframe-resize] Already initialized')
    return false
  }

  const {
    parentOrigin: configOrigin = null,
    targetSelector = '#trainings-container'
  } = options

  // Set parent origin
  if (configOrigin) {
    state.parentOrigin = configOrigin
  }

  // Find target element
  const target = 
    document.querySelector(targetSelector) ||
    document.querySelector('[x-data]') ||
    document.querySelector('#app') ||
    document.body

  if (!target) {
    log('error', '[iframe-resize] Target element not found')
    return false
  }

  state.targetElement = target

  // Create throttled notify function
  const notify = throttle(() => notifyParentHeight(), CONSTANTS.RESIZE_THROTTLE)

  // Setup observers
  setupResizeObserver(target, notify)
  setupMutationObserver(target, notify)

  // Setup event listeners
  setupEventListeners(target, notify)

  // Initial notification (delayed)
  setTimeout(notify, 100)

  // Mark as initialized
  state.isInitialized = true

  // Expose global functions (for Alpine compatibility)
  window.notifyParentHeight = notifyParentHeight
  window.forceIframeResize = forceResize

  log('info', '[iframe-resize] ✓ Initialized', {
    target: targetSelector,
    origin: state.parentOrigin
  })

  return true
}

// ==================== PUBLIC API ====================

/**
 * Force immediate resize (no debounce)
 */
export function forceResize() {
  state.lastSentHeight = 0 // Reset to force send
  sendHeightToParent()
  log('debug', '[iframe-resize] Force resize triggered')
}

/**
 * Get current state (for debugging)
 * @returns {Object} Current state
 */
export function getState() {
  return {
    isInitialized: state.isInitialized,
    lastSentHeight: state.lastSentHeight,
    parentOrigin: state.parentOrigin,
    hasResizeObserver: state.resizeObserver !== null,
    hasMutationObserver: state.mutationObserver !== null,
    eventListenerCount: state.eventListeners.length
  }
}

/**
 * Cleanup and deinitialize
 */
export function destroyIframeAutoResize() {
  if (!state.isInitialized) {
    return
  }

  // Cleanup observers
  if (state.resizeObserver) {
    state.resizeObserver.disconnect()
    state.resizeObserver = null
  }

  if (state.mutationObserver) {
    state.mutationObserver.disconnect()
    state.mutationObserver = null
  }

  // Clear timeout
  clearTimeout(state.notifyTimeout)

  // Remove event listeners
  state.eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler)
  })
  state.eventListeners = []

  // Remove global functions
  delete window.notifyParentHeight
  delete window.forceIframeResize

  // Reset state
  state = {
    notifyTimeout: null,
    lastSentHeight: 0,
    parentOrigin: null,
    resizeObserver: null,
    mutationObserver: null,
    isInitialized: false,
    targetElement: null,
    eventListeners: []
  }

  log('info', '[iframe-resize] Destroyed')
}

// ==================== AUTO-INIT ====================

/**
 * Auto-initialize if in iframe
 */
function autoInit() {
  // Check if we're in an iframe
  if (window.self === window.top) {
    return
  }

  // Check if enabled
  if (!CONFIG.iframe.enabled || !CONFIG.iframe.autoResize) {
    return
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initIframeAutoResize()
    })
  } else {
    initIframeAutoResize()
  }
}

// Run auto-init
autoInit()

// ==================== EXPORTS ====================

export default {
  init: initIframeAutoResize,
  destroy: destroyIframeAutoResize,
  notify: notifyParentHeight,
  force: forceResize,
  getState
}
