/**
 * Playwright Test Helpers
 * Common functions for E2E and integration tests
 */

/**
 * Wait for page to be fully loaded including hydration
 */
export async function waitForPageReady(page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')

  // Wait for Alpine.js to initialize
  await page.waitForFunction(() => window.Alpine !== undefined)
  await page.waitForTimeout(100) // Small delay for Alpine hydration
}

/**
 * Mock fetch responses for testing without backend
 */
export async function mockTrainingsData(page, data = null) {
  const defaultData = data || {
    trainings: [
      {
        id: 1,
        name: 'Test Training',
        wochentag: 'Montag',
        zeit: '18:00 - 19:30',
        ort: 'Test Ort',
        kategorie: 'Parkour'
      }
    ],
    metadata: {
      version: '2.4.0',
      lastUpdate: new Date().toISOString()
    }
  }

  await page.route('**/trainingsplan.json', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(defaultData)
    })
  })
}

/**
 * Get Alpine.js store data
 */
export async function getAlpineStore(page, storeName = 'trainingsplaner') {
  return await page.evaluate(name => {
    return window.Alpine?.store(name)
  }, storeName)
}

/**
 * Set Alpine.js store data
 */
export async function setAlpineStore(page, storeName, data) {
  await page.evaluate(
    ({ name, value }) => {
      const store = window.Alpine?.store(name)
      if (store) {
        Object.assign(store, value)
      }
    },
    { name: storeName, value: data }
  )
}

/**
 * Wait for Alpine.js component to be ready
 */
export async function waitForAlpineComponent(page, selector) {
  await page.waitForSelector(selector)
  await page.waitForFunction(
    sel => {
      const el = document.querySelector(sel)
      return el && el._x_dataStack && el._x_dataStack.length > 0
    },
    selector
  )
}

/**
 * Trigger Alpine.js method
 */
export async function triggerAlpineMethod(page, selector, method, ...args) {
  return await page.evaluate(
    ({ sel, methodName, methodArgs }) => {
      const el = document.querySelector(sel)
      if (!el || !el._x_dataStack) return null

      const component = el._x_dataStack[0]
      if (typeof component[methodName] === 'function') {
        return component[methodName](...methodArgs)
      }
      return null
    },
    { sel: selector, methodName: method, methodArgs: args }
  )
}

/**
 * Take accessibility snapshot (simpler than full axe scan)
 */
export async function takeA11ySnapshot(page) {
  const snapshot = await page.accessibility.snapshot()
  return snapshot
}

/**
 * Check if element is visible in viewport
 */
export async function isInViewport(page, selector) {
  return await page.evaluate(sel => {
    const element = document.querySelector(sel)
    if (!element) return false

    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }, selector)
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page, selector) {
  await page.evaluate(sel => {
    const element = document.querySelector(sel)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, selector)
}

/**
 * Get local storage item
 */
export async function getLocalStorage(page, key) {
  return await page.evaluate(k => localStorage.getItem(k), key)
}

/**
 * Set local storage item
 */
export async function setLocalStorage(page, key, value) {
  await page.evaluate(
    ({ k, v }) => localStorage.setItem(k, v),
    { k: key, v: value }
  )
}

/**
 * Clear all local storage
 */
export async function clearLocalStorage(page) {
  await page.evaluate(() => localStorage.clear())
}

/**
 * Wait for network to be idle
 */
export async function waitForNetwork(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout })
}

/**
 * Mock geolocation
 */
export async function mockGeolocation(page, latitude, longitude) {
  await page.context().setGeolocation({
    latitude,
    longitude
  })
  await page.context().grantPermissions(['geolocation'])
}

/**
 * Take screenshot with name based on test
 */
export async function takeTestScreenshot(page, testInfo, name) {
  const screenshot = await page.screenshot({
    fullPage: true
  })
  await testInfo.attach(name, {
    body: screenshot,
    contentType: 'image/png'
  })
}
