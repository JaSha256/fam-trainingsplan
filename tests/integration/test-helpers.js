// tests/integration/test-helpers.js
/**
 * Shared Test Utilities for Integration Tests (Vitest Browser Mode)
 * Similar to E2E helpers but for @vitest/browser
 */

/**
 * Wait for Alpine and trainings data to load
 * @param {Page} page - Vitest browser page object
 */
export async function waitForAlpineAndData(page, timeout = 5000) {
  await page.waitForFunction(() => window.Alpine !== undefined, { timeout })
  await page.waitForFunction(() => {
    const component = window.Alpine?.$data(document.querySelector('[x-data]'))
    return component?.allTrainings?.length > 0
  }, { timeout })
}

/**
 * Get Alpine component data from x-data element
 * @param {Page} page - Vitest browser page object
 * @returns {Promise<Object>} Component data
 */
export async function getAlpineComponent(page) {
  return await page.evaluate(() => {
    const el = document.querySelector('[x-data]')
    return window.Alpine?.$data(el)
  })
}

/**
 * Get component property value
 * @param {Page} page - Vitest browser page object
 * @param {string} propertyName - Property name to get
 */
export async function getComponentProperty(page, propertyName) {
  return await page.evaluate((prop) => {
    const component = window.Alpine.$data(document.querySelector('[x-data]'))
    return component?.[prop]
  }, propertyName)
}
