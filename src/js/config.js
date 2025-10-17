// src/js/config.js
/**
 * Central Configuration - FAM Trainingsplan
 * @version 3.0.0
 * @requires Node 20+
 * @description Immutable, validated, type-safe configuration
 */

/// <reference path="./env.d.js" />

// ==================== CONSTANTS ====================

/**
 * Environment Detection
 *
 * @type {boolean}
 */
// @ts-ignore - Vite import.meta.env
export const isDev = import.meta.env.MODE === 'development'

/**
 * @type {boolean}
 */
// @ts-ignore - Vite import.meta.env
export const isProd = import.meta.env.MODE === 'production'

/**
 * @type {boolean}
 */
// @ts-ignore - Vite import.meta.env
export const isTest = import.meta.env.MODE === 'test'

/**
 * Time Constants (in milliseconds)
 */
const TIME = Object.freeze({
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
})

// ==================== MAIN CONFIG ====================

/**
 * Application Configuration
 * @type {Readonly<Object>}
 */
export const CONFIG = Object.freeze({
  // ==================== DATA ====================
  // @ts-ignore - Vite import.meta.env
  jsonUrl: import.meta.env.VITE_API_URL || 'https://jasha256.github.io/fam-trainingsplan/trainingsplan.json',
  // @ts-ignore - Vite import.meta.env
  versionUrl: import.meta.env.VITE_VERSION_URL || 'https://jasha256.github.io/fam-trainingsplan/version.json',

  // ==================== CACHE ====================
  cacheEnabled: true,
  cacheKey: 'trainingsplan_cache_v3',
  cacheDuration: TIME.HOUR, // 1 hour
  
  // ==================== FAVORITES ====================
  favoritesKey: 'trainingsplan_favorites_v1',
  
  // ==================== SEARCH ====================
  search: Object.freeze({
    debounceDelay: 300,
    minQueryLength: 2,
    maxResults: 100,
    
    fuseOptions: Object.freeze({
      keys: Object.freeze([
        { name: 'training', weight: 2.0 },
        { name: 'ort', weight: 1.5 },
        { name: 'trainer', weight: 1.0 },
        { name: 'wochentag', weight: 0.8 },
        { name: 'altersgruppe', weight: 0.5 }
      ]),
      threshold: 0.3,
      distance: 100,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
      ignoreLocation: true,
      useExtendedSearch: false
    })
  }),
  
  // ==================== FILTERS ====================
  filters: Object.freeze({
    persistInUrl: true,
    debounceDelay: 100,
    
    urlParams: Object.freeze({
      wochentag: 'tag',
      ort: 'ort',
      training: 'art',
      altersgruppe: 'alter',
      searchTerm: 'suche',
      nearby: 'naehe'
    })
  }),
  
  // ==================== MAP ====================
  map: Object.freeze({
    // Leaflet Config
    defaultCenter: Object.freeze([48.137154, 11.576124]), // München
    defaultZoom: 12,
    maxZoom: 19,
    minZoom: 10,
    
    tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    
    // Geolocation
    geolocation: Object.freeze({
      enableHighAccuracy: true,
      timeout: 10 * TIME.SECOND,
      maximumAge: 5 * TIME.MINUTE,
      maxDistance: 50, // km
      
      errorMessages: Object.freeze({
        PERMISSION_DENIED: 'Standort-Berechtigung verweigert',
        POSITION_UNAVAILABLE: 'Standort nicht verfügbar',
        TIMEOUT: 'Standort-Anfrage Timeout',
        UNKNOWN: 'Unbekannter Standort-Fehler'
      })
    }),
    
    // Marker Clustering
    clustering: Object.freeze({
      enabled: true,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true
    })
  }),
  
  // ==================== UI ====================
  ui: Object.freeze({
    mobileBreakpoint: 768, // px
    filterDebounce: 100, // ms
    notificationDuration: 3000, // ms
    animationDuration: 300, // ms
    
    // Touch Gestures
    touch: Object.freeze({
      swipeThreshold: 100, // px
      swipeVelocity: 0.3, // px/ms
      swipeMaxTime: 1000, // ms
      swipeMaxVertical: 100 // px
    }),
    
    // Lazy Loading
    lazyLoadThreshold: '50px',
    lazyLoadRootMargin: '100px'
  }),
  
  // ==================== PERFORMANCE ====================
  performance: Object.freeze({
    enableVirtualScroll: false,
    lazyLoadImages: true,
    prefetchData: true,
    useRequestIdleCallback: typeof requestIdleCallback !== 'undefined'
  }),
  
  // ==================== FEATURE FLAGS ====================
  features: Object.freeze({
    enableMap: true,
    enableSearch: true,
    enableQuickFilters: true,
    enablePersistence: true,
    enableLazyLoading: true,
    enableAnalytics: false,
    enableShareLinks: true,
    enablePrintView: true,
    enableDarkMode: false,
    enableNotifications: true,
    enableOfflineMode: true,
    enableFavorites: true,
    enableGeolocation: true,
    enableUpdateCheck: true,
    enableCalendarExport: true,
    enableTouchGestures: true,
    enableBulkExport: true // NEW in v3.0
  }),
  
  // ==================== FAVORITES ====================
  favorites: Object.freeze({
    maxCount: 100,
    syncAcrossDevices: false
  }),
  
  // ==================== ERROR HANDLING ====================
  errors: Object.freeze({
    maxRetries: 3,
    retryDelay: TIME.SECOND,
    retryBackoff: 2,
    showUserFriendlyMessages: true,
    logToConsole: true
  }),
  
  // ==================== LOGGING ====================
  logging: Object.freeze({
    enabled: isDev,
    level: isDev ? 'debug' : 'error', // debug|info|warn|error
    logToConsole: true,
    logToServer: false,
    
    levels: Object.freeze({
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    })
  }),
  
  // ==================== IFRAME INTEGRATION ====================
  iframe: Object.freeze({
    enabled: true,
    parentOrigin: 'https://www.freeartsofmovement.com',
    allowedOrigins: Object.freeze([
      'https://www.freeartsofmovement.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ]),
    debounceDelay: 50,
    minHeight: 400,
    maxHeight: 10000,
    autoResize: true
  }),
  
  // ==================== PWA ====================
  pwa: Object.freeze({
    enabled: true,
    name: 'FAM Trainingsplan',
    shortName: 'FAM',
    description: 'Trainingsplan für Free Arts of Movement',
    version: '3.0.0',
    themeColor: '#005892',
    backgroundColor: '#005892',
    display: 'standalone',
    orientation: 'portrait-primary',
    scope: '/',
    startUrl: '/',
    
    // Update Strategy
    updateStrategy: 'prompt', // 'prompt' | 'auto'
    updateCheckInterval: TIME.HOUR, // 1 hour
    
    // Offline Pages
    offlinePages: Object.freeze([
      '/',
      '/offline.html'
    ])
  })
})

// ==================== VALIDATION ====================

/**
 * Validate Configuration at Runtime
 * @throws {Error} If configuration is invalid
 */
function validateConfig() {
  const errors = []
  
  // Validate URLs
  try {
    // @ts-ignore - CONFIG properties exist at runtime
    new URL(CONFIG.jsonUrl)
  } catch {
    errors.push('Invalid jsonUrl')
  }

  try {
    // @ts-ignore - CONFIG properties exist at runtime
    new URL(CONFIG.versionUrl)
  } catch {
    errors.push('Invalid versionUrl')
  }

  // Validate Numbers
  // @ts-ignore - CONFIG properties exist at runtime
  if (CONFIG.cacheDuration < 0) {
    errors.push('cacheDuration must be >= 0')
  }

  // @ts-ignore - CONFIG properties exist at runtime
  if (CONFIG.ui.mobileBreakpoint < 320) {
    errors.push('mobileBreakpoint too small (min: 320px)')
  }

  // @ts-ignore - CONFIG properties exist at runtime
  if (CONFIG.map.geolocation.timeout < 1000) {
    errors.push('geolocation.timeout too small (min: 1000ms)')
  }

  // Validate Feature Flags
  // @ts-ignore - CONFIG properties exist at runtime
  const features = CONFIG.features
  if (typeof features !== 'object') {
    errors.push('features must be an object')
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }
}

// Run validation in development
if (isDev) {
  try {
    validateConfig()
    console.info('[config] ✅ Configuration validated successfully')
  } catch (error) {
    console.error('[config] ❌ Configuration validation failed:', error)
    throw error
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
export function isFeatureEnabled(feature) {
  // @ts-ignore - CONFIG properties exist at runtime
  return CONFIG.features[feature] ?? false
}

/**
 * Check if log level should be logged
 * @param {string} level - Log level (debug|info|warn|error)
 * @returns {boolean}
 */
export function shouldLog(level) {
  // @ts-ignore - CONFIG properties exist at runtime
  if (!CONFIG.logging.enabled) return false

  // @ts-ignore - CONFIG properties exist at runtime
  const currentLevel = CONFIG.logging.levels[CONFIG.logging.level] ?? 3
  // @ts-ignore - CONFIG properties exist at runtime
  const requestedLevel = CONFIG.logging.levels[level] ?? 0

  return requestedLevel >= currentLevel
}

/**
 * Logger with level support
 * @param {string} level - Log level
 * @param {string} message - Message
 * @param {...any} args - Additional arguments
 */
export function log(level, message, ...args) {
  if (!shouldLog(level)) return
  
  const prefix = `[trainingsplan:${level}]`
  const timestamp = new Date().toISOString()
  const logData = args.length > 0 ? args : []
  
  const logFn = {
    debug: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  }[level] || console.log
  
  logFn(prefix, timestamp, message, ...logData)
}

/**
 * @typedef {import('./types.js').BrowserInfo} BrowserInfo
 */

/**
 * Cached browser info
 * @type {BrowserInfo | null}
 */
let browserInfoCache = null

/**
 * Get browser information (cached)
 *
 * @returns {BrowserInfo} Browser capabilities and info
 */
export function getBrowserInfo() {
  if (browserInfoCache) return browserInfoCache
  
  const testLocalStorage = () => {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
  
  browserInfoCache = Object.freeze({
    // @ts-ignore - CONFIG properties exist at runtime
    isMobile: window.innerWidth < CONFIG.ui.mobileBreakpoint,
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

    // Feature Detection
    supportsLocalStorage: testLocalStorage(),
    supportsGeolocation: 'geolocation' in navigator,
    supportsIntersectionObserver: 'IntersectionObserver' in window,
    supportsResizeObserver: 'ResizeObserver' in window,
    supportsMutationObserver: 'MutationObserver' in window,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsShareAPI: 'share' in navigator,
    supportsClipboardAPI: 'clipboard' in navigator,

    // PWA Detection
    // @ts-ignore - standalone is a PWA property
    isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                  // @ts-ignore - standalone is iOS Safari PWA property
                  window.navigator.standalone === true,

    // Connection Info
    // @ts-ignore - connection is experimental API
    connection: navigator.connection ? Object.freeze({
      // @ts-ignore - connection properties
      effectiveType: navigator.connection.effectiveType,
      // @ts-ignore - connection properties
      downlink: navigator.connection.downlink,
      // @ts-ignore - connection properties
      rtt: navigator.connection.rtt,
      // @ts-ignore - connection properties
      saveData: navigator.connection.saveData
    }) : null
  })
  
  return browserInfoCache
}

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean}
 */
export function isValidCoordinates(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  )
}

/**
 * Validate cache key
 * @param {string} key - Cache key
 * @returns {boolean}
 */
export function isValidCacheKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length < 256
}

/**
 * Check if development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return isDev
}

/**
 * Check if production mode
 * @returns {boolean}
 */
export function isProduction() {
  return isProd
}

// ==================== TYPED GETTERS (with memoization) ====================

const configCache = new Map()

/**
 * Get configuration with memoization (faster than structuredClone)
 * @param {string} key - Config key
 * @returns {any}
 */
function getCachedConfig(key) {
  if (!configCache.has(key)) {
    // @ts-ignore - CONFIG properties exist at runtime
    configCache.set(key, structuredClone(CONFIG[key]))
  }
  return configCache.get(key)
}

export function getMapConfig() {
  return getCachedConfig('map')
}

export function getUIConfig() {
  return getCachedConfig('ui')
}

export function getGeolocationConfig() {
  return getCachedConfig('map').geolocation
}

export function getPWAConfig() {
  return getCachedConfig('pwa')
}

export function getTouchConfig() {
  return getCachedConfig('ui').touch
}

export function getErrorConfig() {
  return getCachedConfig('errors')
}

export function getIframeConfig() {
  return getCachedConfig('iframe')
}

export function getCacheDuration() {
  // @ts-ignore - CONFIG properties exist at runtime
  return CONFIG.cacheDuration
}

/**
 * Get complete config (immutable)
 * @returns {Readonly<Object>}
 */
export function getConfig() {
  return CONFIG
}

// Default Export
export default CONFIG
