// tests/e2e/test-helpers.js
/**
 * Shared Test Utilities for E2E Tests
 * Reusable patterns for Alpine.js component testing
 */

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
 * Wait for Alpine and trainings data to load
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
export async function waitForAlpineAndData(page, timeout = 5000) {
  await page.waitForFunction(() => window.Alpine !== undefined, { timeout })
  await page.waitForFunction(() => {
    const component = window.Alpine?.$data(document.querySelector('[x-data]'))
    return component?.allTrainings?.length > 0
  }, { timeout })
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
  return await page.evaluate(({ method, arguments: methodArgs }) => {
    const component = window.Alpine.$data(document.querySelector('[x-data]'))
    if (component && typeof component[method] === 'function') {
      return component[method](...methodArgs)
    }
  }, { method: methodName, arguments: args })
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
