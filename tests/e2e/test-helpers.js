// tests/e2e/test-helpers.js
/**
 * Shared Test Utilities for E2E Tests
 * Reusable patterns for Alpine.js component testing
 *
 * Visual Regression Fix:
 * Enhanced helpers with route mocking and improved Alpine.js rendering detection
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Setup Route Mocking for Test Fixture Data
 *
 * Intercepts trainingsplan.json requests and serves test fixture instead.
 * Critical for visual regression tests to have consistent, predictable data.
 *
 * @param {Page} page - Playwright page object
 * @returns {Promise<void>}
 */
export async function setupTestDataMocking(page) {
  // Load test fixture
  const fixtureData = JSON.parse(
    readFileSync(join(__dirname, 'fixtures', 'trainingsplan.json'), 'utf-8')
  )

  // Intercept all trainingsplan.json requests
  await page.route('**/trainingsplan.json*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fixtureData)
    })
  })
}

/**
 * Wait for Alpine and trainings data to load with GUARANTEED DOM rendering
 *
 * Enhanced version that properly waits for:
 * 1. Alpine.js framework initialization
 * 2. Data loaded into Alpine state
 * 3. DOM actually rendered (x-for templates executed)
 * 4. Multiple cards rendered (batch rendering complete)
 *
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForAlpineAndData(page, timeout = 15000) {
  // 1. Wait for Alpine.js framework
  await page.waitForFunction(() => window.Alpine !== undefined, { timeout })

  // 2. Wait for component and data in Alpine state
  await page.waitForFunction(
    () => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.allTrainings?.length > 0
    },
    { timeout }
  )

  // 3. CRITICAL: Wait for DOM to actually render (Alpine's x-for takes time)
  // Try multiple selectors in case HTML structure varies
  const cardSelectors = [
    '.training-card',
    'article[data-training-id]',
    '[x-for] > *',
    'article'
  ]

  let cardFound = false
  for (const selector of cardSelectors) {
    try {
      await page.waitForSelector(selector, {
        state: 'visible',
        timeout: 5000
      })
      cardFound = true
      break
    } catch (e) {
      // Try next selector
      continue
    }
  }

  if (!cardFound) {
    throw new Error('No training cards rendered after data load')
  }

  // 4. Wait for at least 3 cards to ensure batch rendering is complete
  await page.waitForFunction(
    () => {
      const cards = document.querySelectorAll('.training-card, article')
      return cards.length >= 3
    },
    { timeout: 3000 }
  )
}

/**
 * Wait for visual stability before capturing screenshots
 *
 * Ensures fonts, images, and animations are complete for consistent snapshots.
 *
 * @param {Page} page - Playwright page object
 * @param {Object} options - Stability options
 * @param {boolean} options.waitForFonts - Wait for fonts to load (default: true)
 * @param {boolean} options.waitForImages - Wait for images to load (default: true)
 * @param {number} options.stabilityTimeout - Final stability wait in ms (default: 500)
 */
export async function waitForVisualStability(page, options = {}) {
  const {
    waitForFonts = true,
    waitForImages = true,
    stabilityTimeout = 500
  } = options

  // Wait for fonts to load
  if (waitForFonts) {
    await page.evaluate(() => document.fonts.ready)
  }

  // Wait for images to load
  if (waitForImages) {
    await page.evaluate(() => {
      return Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = img.onerror = resolve
              })
          )
      )
    })
  }

  // Wait for network to be idle
  await page.waitForLoadState('networkidle')

  // Final stability wait for animations
  await page.waitForTimeout(stabilityTimeout)
}

/**
 * Get Alpine component data from x-data element
 * Use this for accessing the trainingsplaner component
 * @param {Page} page - Playwright page object
 * @returns {Promise<Object>} Component data
 */
export async function getAlpineComponent(page) {
  return await page.evaluate(() => {
    const el = document.querySelector('[x-data]')
    return window.Alpine?.$data(el)
  })
}

/**
 * Get Alpine store data (for actual stores like 'ui')
 * @param {Page} page - Playwright page object
 * @param {string} storeName - Name of the store
 * @returns {Promise<Object>} Store data
 */
export async function getAlpineStore(page, storeName) {
  return await page.evaluate((name) => {
    return window.Alpine?.store(name)
  }, storeName)
}

/**
 * Get correct selector based on viewport size
 * Handles mobile vs desktop selector differences
 * @param {Page} page - Playwright page object
 * @param {string} desktop - Desktop selector
 * @param {string} mobile - Mobile selector
 * @returns {string} Appropriate selector
 */
export function getSelector(page, desktop, mobile) {
  const viewportSize = page.viewportSize()
  const isMobile = viewportSize && viewportSize.width < 768
  return isMobile ? mobile : desktop
}

/**
 * Open mobile filter drawer if on mobile viewport
 * @param {Page} page - Playwright page object
 */
export async function prepareMobileFilters(page) {
  const viewportSize = page.viewportSize()
  const isMobile = viewportSize && viewportSize.width < 768

  if (isMobile) {
    await page.evaluate(() => {
      window.Alpine.store('ui').mobileFilterOpen = true
    })
    await page.waitForTimeout(300)
  }
}

/**
 * Check if service worker is available
 * @param {Page} page - Playwright page object
 * @returns {Promise<boolean>} True if service worker registered
 */
export async function isServiceWorkerAvailable(page) {
  return await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      return registration !== undefined
    } catch {
      return false
    }
  })
}

/**
 * Execute Alpine component method
 * @param {Page} page - Playwright page object
 * @param {string} methodName - Method name to call
 * @param  {...any} args - Arguments to pass to method
 */
export async function callComponentMethod(page, methodName, ...args) {
  return await page.evaluate(
    ({ method, arguments: methodArgs }) => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      if (component && typeof component[method] === 'function') {
        return component[method](...methodArgs)
      }
    },
    { method: methodName, arguments: args }
  )
}

/**
 * Get component property value
 * @param {Page} page - Playwright page object
 * @param {string} propertyName - Property name to get
 */
export async function getComponentProperty(page, propertyName) {
  return await page.evaluate((prop) => {
    const component = window.Alpine.$data(document.querySelector('[x-data]'))
    return component?.[prop]
  }, propertyName)
}
