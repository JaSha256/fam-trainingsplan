// tests/puppeteer/helpers/base-test.js
/**
 * Base Test Class
 * @description Provides common test patterns and utilities
 */

import config from '../../../puppeteer.config.js'

export class BaseTest {
  constructor(page, debug) {
    this.page = page
    this.debug = debug
    this.baseUrl = config.env.baseUrl
  }

  /**
   * Navigate to the app
   */
  async goto(path = '') {
    const url = `${this.baseUrl}${path}`
    await this.debug.step(`Navigate to ${url}`, async () => {
      await this.page.goto(url, { waitUntil: 'networkidle2' })
    })
  }

  /**
   * Wait for Alpine.js to be ready
   */
  async waitForAlpine() {
    await this.debug.step('Wait for Alpine.js', async () => {
      await this.page.waitForFunction(
        () => window.Alpine !== undefined && typeof window.Alpine.store === 'function',
        { timeout: 10000 }
      )
    })
  }

  /**
   * Wait for trainings to load
   */
  async waitForTrainings() {
    await this.debug.step('Wait for trainings to load', async () => {
      // Wait for trainings to be loaded in the Alpine component
      await this.page.waitForFunction(
        () => {
          // Check if trainingsplaner component exists and is initialized
          const app = document.querySelector('[x-data*="trainingsplaner"]')
          if (!app) return false

          // Check if Alpine component has loaded data
          const component = window.Alpine?.$data(app)
          return component?.trainings?.length > 0 ||
                 component?.filteredTrainings?.length > 0
        },
        { timeout: 15000 }
      )
    })
  }

  /**
   * Get Alpine store data
   */
  async getStoreData(storeName) {
    return await this.page.evaluate((name) => {
      return window.Alpine?.store(name)
    }, storeName)
  }

  /**
   * Click element with debugging
   */
  async click(selector, description = null) {
    await this.debug.step(description || `Click ${selector}`, async () => {
      await this.page.waitForSelector(selector, { visible: true })
      await this.page.click(selector)
      await this.debug.wait.sleep(300) // Wait for animations
    })
  }

  /**
   * Type text with debugging
   */
  async type(selector, text, description = null) {
    await this.debug.step(description || `Type "${text}" in ${selector}`, async () => {
      await this.page.waitForSelector(selector, { visible: true })
      await this.page.click(selector, { clickCount: 3 }) // Select all
      await this.page.keyboard.press('Backspace')
      await this.page.type(selector, text, { delay: 50 })
    })
  }

  /**
   * Select option from dropdown
   */
  async select(selector, value, description = null) {
    await this.debug.step(description || `Select "${value}" in ${selector}`, async () => {
      await this.page.waitForSelector(selector, { visible: true })
      await this.page.select(selector, value)
      await this.debug.wait.sleep(300)
    })
  }

  /**
   * Get element text
   */
  async getText(selector) {
    return await this.page.$eval(selector, el => el.textContent.trim())
  }

  /**
   * Check if element exists
   */
  async exists(selector) {
    return await this.page.$(selector) !== null
  }

  /**
   * Count elements
   */
  async count(selector) {
    return await this.page.$$eval(selector, elements => elements.length)
  }

  /**
   * Scroll to element
   */
  async scrollTo(selector) {
    await this.page.evaluate((sel) => {
      const element = document.querySelector(sel)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, selector)
    await this.debug.wait.sleep(500)
  }

  /**
   * Take screenshot
   */
  async screenshot(name) {
    if (this.debug.screenshots) {
      await this.debug.screenshots.takeScreenshot(name)
    }
  }

  /**
   * Assert element exists
   */
  async assertExists(selector, message = null) {
    const exists = await this.exists(selector)
    if (!exists) {
      throw new Error(message || `Element not found: ${selector}`)
    }
  }

  /**
   * Assert text content
   */
  async assertText(selector, expectedText, message = null) {
    const text = await this.getText(selector)
    if (!text.includes(expectedText)) {
      throw new Error(
        message || `Expected text "${expectedText}", got "${text}"`
      )
    }
  }

  /**
   * Assert element count
   */
  async assertCount(selector, expectedCount, message = null) {
    const count = await this.count(selector)
    if (count !== expectedCount) {
      throw new Error(
        message || `Expected ${expectedCount} elements, found ${count}`
      )
    }
  }

  /**
   * Get training cards
   */
  async getTrainingCards() {
    return await this.page.$$('[data-training-card]')
  }

  /**
   * Get training count from UI
   */
  async getTrainingCount() {
    const cards = await this.getTrainingCards()
    return cards.length
  }

  /**
   * Perform search
   */
  async search(query) {
    await this.debug.step(`Search for "${query}"`, async () => {
      const searchSelector = '#search, #mobile-search'
      await this.type(searchSelector, query)
      await this.debug.wait.sleep(500) // Wait for search to apply
    })
  }

  /**
   * Filter by training type
   */
  async filterByTraining(trainingType) {
    await this.debug.step(`Filter by training: ${trainingType}`, async () => {
      const selector = '#filter-training, [data-filter-training], select[name="training"]'
      await this.select(selector, trainingType)
      await this.debug.wait.sleep(500)
    })
  }

  /**
   * Filter by location
   */
  async filterByLocation(location) {
    await this.debug.step(`Filter by location: ${location}`, async () => {
      const selector = '#filter-ort, [data-filter-ort], select[name="ort"]'
      await this.select(selector, location)
      await this.debug.wait.sleep(500)
    })
  }

  /**
   * Filter by weekday
   */
  async filterByWeekday(weekday) {
    await this.debug.step(`Filter by weekday: ${weekday}`, async () => {
      const selector = '#filter-wochentag, [data-filter-wochentag], select[name="wochentag"]'
      await this.select(selector, weekday)
      await this.debug.wait.sleep(500)
    })
  }

  /**
   * Reset all filters
   */
  async resetFilters() {
    await this.debug.step('Reset all filters', async () => {
      const resetButton = 'button[data-reset-filters], .reset-filters, button:has-text("Zurücksetzen")'
      const exists = await this.exists(resetButton)
      if (exists) {
        await this.click(resetButton)
      } else {
        // Manually reset each filter
        const selects = await this.page.$$('select')
        for (const select of selects) {
          await select.evaluate(el => el.selectedIndex = 0)
        }
      }
      await this.debug.wait.sleep(500)
    })
  }

  /**
   * Open first training card
   */
  async openFirstTrainingCard() {
    await this.debug.step('Open first training card', async () => {
      const cards = await this.getTrainingCards()
      if (cards.length === 0) {
        throw new Error('No training cards found')
      }
      await cards[0].click()
      await this.debug.wait.sleep(500)
    })
  }

  /**
   * Log current state
   */
  async logState() {
    const state = await this.page.evaluate(() => {
      const store = window.Alpine?.store('trainingsplaner')
      return {
        totalTrainings: store?.trainings?.length || 0,
        filteredTrainings: store?.filteredTrainings?.length || 0,
        searchQuery: store?.searchQuery || '',
        filters: store?.filters || {}
      }
    })

    console.log('\n📊 Current State:')
    console.log(`  Total Trainings: ${state.totalTrainings}`)
    console.log(`  Filtered Trainings: ${state.filteredTrainings}`)
    console.log(`  Search Query: "${state.searchQuery}"`)
    console.log(`  Filters:`, state.filters)

    return state
  }
}
