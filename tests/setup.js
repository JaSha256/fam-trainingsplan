// Test setup file for Vitest
// Mocks for browser APIs not available in jsdom

// Mock localStorage (jsdom 27+ changed Storage implementation)
// Items are stored directly on the object so Object.keys(localStorage) works
function createLocalStorageMock() {
  const mock = Object.create(null)
  Object.defineProperties(mock, {
    getItem: {
      value: vi.fn((key) => {
        return Object.prototype.hasOwnProperty.call(mock, key) ? mock[key] : null
      }),
      enumerable: false, writable: true, configurable: true
    },
    setItem: {
      value: vi.fn((key, val) => { mock[key] = String(val) }),
      enumerable: false, writable: true, configurable: true
    },
    removeItem: {
      value: vi.fn((key) => { delete mock[key] }),
      enumerable: false, writable: true, configurable: true
    },
    clear: {
      value: vi.fn(() => {
        Object.keys(mock).forEach(k => delete mock[k])
      }),
      enumerable: false, writable: true, configurable: true
    },
    length: {
      get() { return Object.keys(mock).length },
      enumerable: false, configurable: true
    },
    key: {
      value: vi.fn((i) => Object.keys(mock)[i] ?? null),
      enumerable: false, writable: true, configurable: true
    }
  })
  return mock
}
Object.defineProperty(window, 'localStorage', {
  value: createLocalStorageMock(),
  writable: true
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
