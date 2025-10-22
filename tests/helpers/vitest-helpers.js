/**
 * Vitest Test Helpers
 * Common functions for unit and integration tests
 */

/**
 * Create mock Alpine.js context
 */
export function createMockAlpineContext(overrides = {}) {
  return {
    allTrainings: [],
    filteredTrainings: [],
    favorites: [],
    filters: {
      suchbegriff: '',
      kategorie: [],
      wochentag: [],
      altersgruppe: [],
      ort: [],
      nurFavoriten: false,
      nurHeute: false
    },
    loading: false,
    error: null,
    ...overrides
  }
}

/**
 * Create mock DOM element
 */
export function createMockElement(tag = 'div', attributes = {}) {
  const element = document.createElement(tag)
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  return element
}

/**
 * Create mock Leaflet map
 */
export function createMockLeafletMap() {
  return {
    setView: vi.fn().mockReturnThis(),
    addLayer: vi.fn().mockReturnThis(),
    removeLayer: vi.fn().mockReturnThis(),
    fitBounds: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    off: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
    getBounds: vi.fn(() => ({
      contains: vi.fn(() => true)
    })),
    getCenter: vi.fn(() => ({ lat: 48.1351, lng: 11.582 })),
    getZoom: vi.fn(() => 13)
  }
}

/**
 * Create mock Leaflet marker
 */
export function createMockMarker() {
  return {
    bindPopup: vi.fn().mockReturnThis(),
    addTo: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    getLatLng: vi.fn(() => ({ lat: 48.1351, lng: 11.582 })),
    setLatLng: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis()
  }
}

/**
 * Create mock fetch response
 */
export function createMockFetchResponse(data, options = {}) {
  return {
    ok: options.ok !== undefined ? options.ok : true,
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    headers: new Headers(options.headers || {}),
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
    ...options
  }
}

/**
 * Wait for condition to be true
 */
export async function waitFor(condition, timeout = 5000, interval = 50) {
  const startTime = Date.now()
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error(`Timeout waiting for condition after ${timeout}ms`)
}

/**
 * Flush all promises
 */
export async function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Create mock localStorage
 */
export function createMockLocalStorage() {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value)
    }),
    removeItem: vi.fn(key => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn(index => Object.keys(store)[index] || null)
  }
}

/**
 * Setup DOM for tests
 */
export function setupTestDOM(html = '') {
  document.body.innerHTML = html
  return document.body
}

/**
 * Cleanup DOM after tests
 */
export function cleanupTestDOM() {
  document.body.innerHTML = ''
}

/**
 * Mock console methods
 */
export function mockConsole() {
  const originalConsole = { ...console }
  const mocks = {
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }

  Object.assign(console, mocks)

  return {
    mocks,
    restore: () => {
      Object.assign(console, originalConsole)
    }
  }
}

/**
 * Create spy that tracks all calls
 */
export function createCallSpy() {
  const calls = []
  const spy = vi.fn((...args) => {
    calls.push(args)
  })
  spy.getCalls = () => calls
  spy.getCall = index => calls[index]
  spy.clearCalls = () => (calls.length = 0)
  return spy
}
