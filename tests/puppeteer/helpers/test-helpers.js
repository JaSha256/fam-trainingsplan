// tests/puppeteer/helpers/test-helpers.js
/**
 * Puppeteer Test Helpers
 * @description Utility functions for debugging and testing
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Screenshot Helper
 */
export class ScreenshotHelper {
  constructor(page, testName) {
    this.page = page
    this.testName = testName
    this.screenshotDir = path.join(__dirname, '../screenshots', testName)
    this.stepCounter = 0

    // Ensure directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true })
    }
  }

  async takeScreenshot(name = null) {
    const fileName = name || `step-${String(this.stepCounter++).padStart(3, '0')}.png`
    const filePath = path.join(this.screenshotDir, fileName)

    await this.page.screenshot({
      path: filePath,
      fullPage: true
    })

    console.log(`📸 Screenshot saved: ${fileName}`)
    return filePath
  }

  async takeStepScreenshot(stepName) {
    const fileName = `${String(this.stepCounter++).padStart(3, '0')}-${stepName}.png`
    return this.takeScreenshot(fileName)
  }

  async onFailure() {
    await this.takeScreenshot('FAILURE.png')
  }
}

/**
 * Console Logger
 */
export class ConsoleLogger {
  constructor(page, options = {}) {
    this.page = page
    this.logs = []
    this.options = {
      logToConsole: true,
      logErrors: true,
      logWarnings: true,
      logInfo: false,
      ...options
    }

    this.setupListeners()
  }

  setupListeners() {
    this.page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()

      this.logs.push({ type, text, timestamp: new Date() })

      if (this.options.logToConsole) {
        const icon = this.getIcon(type)
        console.log(`${icon} [Browser ${type.toUpperCase()}]:`, text)
      }
    })

    this.page.on('pageerror', error => {
      this.logs.push({ type: 'error', text: error.message, timestamp: new Date() })
      if (this.options.logErrors) {
        console.error('❌ [Browser Error]:', error)
      }
    })
  }

  getIcon(type) {
    const icons = {
      log: 'ℹ️',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛'
    }
    return icons[type] || '📝'
  }

  getLogs(type = null) {
    if (!type) return this.logs
    return this.logs.filter(log => log.type === type)
  }

  getErrors() {
    return this.getLogs('error')
  }

  hasErrors() {
    return this.getErrors().length > 0
  }

  clear() {
    this.logs = []
  }
}

/**
 * Network Monitor
 */
export class NetworkMonitor {
  constructor(page) {
    this.page = page
    this.requests = []
    this.responses = []
    this.failedRequests = []

    this.setupListeners()
  }

  setupListeners() {
    this.page.on('request', request => {
      this.requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date()
      })
    })

    this.page.on('response', response => {
      this.responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date()
      })
    })

    this.page.on('requestfailed', request => {
      this.failedRequests.push({
        url: request.url(),
        errorText: request.failure().errorText,
        timestamp: new Date()
      })
    })
  }

  getRequestsByUrl(urlPattern) {
    return this.requests.filter(req => req.url.includes(urlPattern))
  }

  getFailedRequests() {
    return this.failedRequests
  }

  hasFailedRequests() {
    return this.failedRequests.length > 0
  }

  clear() {
    this.requests = []
    this.responses = []
    this.failedRequests = []
  }

  printSummary() {
    console.log('\n📊 Network Summary:')
    console.log(`  Total Requests: ${this.requests.length}`)
    console.log(`  Total Responses: ${this.responses.length}`)
    console.log(`  Failed Requests: ${this.failedRequests.length}`)

    if (this.failedRequests.length > 0) {
      console.log('\n❌ Failed Requests:')
      this.failedRequests.forEach(req => {
        console.log(`  - ${req.url}: ${req.errorText}`)
      })
    }
  }
}

/**
 * Wait Helpers
 */
export class WaitHelpers {
  constructor(page) {
    this.page = page
  }

  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout })
      return true
    } catch (error) {
      console.error(`⏱️ Timeout waiting for selector: ${selector}`)
      return false
    }
  }

  async waitForText(text, timeout = 10000) {
    try {
      await this.page.waitForFunction(
        (searchText) => document.body.innerText.includes(searchText),
        { timeout },
        text
      )
      return true
    } catch (error) {
      console.error(`⏱️ Timeout waiting for text: ${text}`)
      return false
    }
  }

  async waitForNavigation(timeout = 30000) {
    await this.page.waitForNavigation({ timeout, waitUntil: 'networkidle2' })
  }

  async waitForAlpine(timeout = 5000) {
    await this.page.waitForFunction(
      () => window.Alpine !== undefined,
      { timeout }
    )
  }

  async sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Debug Helper - Main utility class
 */
export class DebugHelper {
  constructor(page, testName, options = {}) {
    this.page = page
    this.testName = testName
    this.options = {
      screenshots: true,
      console: true,
      network: false,
      ...options
    }

    // Initialize helpers
    if (this.options.screenshots) {
      this.screenshots = new ScreenshotHelper(page, testName)
    }

    if (this.options.console) {
      this.console = new ConsoleLogger(page)
    }

    if (this.options.network) {
      this.network = new NetworkMonitor(page)
    }

    this.wait = new WaitHelpers(page)
  }

  async step(name, fn) {
    console.log(`\n🔹 Step: ${name}`)

    try {
      await fn()

      if (this.screenshots?.options?.screenshotOnStep) {
        await this.screenshots.takeStepScreenshot(name.replace(/\s+/g, '-'))
      }
    } catch (error) {
      console.error(`❌ Step failed: ${name}`)

      if (this.screenshots) {
        await this.screenshots.onFailure()
      }

      throw error
    }
  }

  async logPageInfo() {
    const title = await this.page.title()
    const url = this.page.url()

    console.log('\n📄 Page Info:')
    console.log(`  Title: ${title}`)
    console.log(`  URL: ${url}`)
  }

  async logAlpineData(storeName = null) {
    const data = await this.page.evaluate((store) => {
      if (!window.Alpine) return null

      if (store) {
        return window.Alpine.store(store)
      }

      // Get all stores
      return {
        trainingsplaner: window.Alpine.store('trainingsplaner'),
        ui: window.Alpine.store('ui'),
        favorites: window.Alpine.store('favorites')
      }
    }, storeName)

    console.log('\n🗂️ Alpine.js Data:')
    console.log(JSON.stringify(data, null, 2))

    return data
  }

  async getTrainingsCount() {
    return await this.page.evaluate(() => {
      const store = window.Alpine?.store('trainingsplaner')
      return {
        total: store?.trainings?.length || 0,
        filtered: store?.filteredTrainings?.length || 0
      }
    })
  }

  async printSummary() {
    console.log('\n' + '='.repeat(60))
    console.log(`📊 Test Summary: ${this.testName}`)
    console.log('='.repeat(60))

    await this.logPageInfo()

    if (this.console) {
      const errors = this.console.getErrors()
      if (errors.length > 0) {
        console.log(`\n❌ Console Errors: ${errors.length}`)
        errors.forEach(err => console.log(`  - ${err.text}`))
      } else {
        console.log('\n✅ No console errors')
      }
    }

    if (this.network) {
      this.network.printSummary()
    }

    console.log('\n' + '='.repeat(60))
  }
}

/**
 * Test Setup Helper
 */
export async function setupTest(browser, testName, options = {}) {
  const page = await browser.newPage()

  // Set viewport if specified
  if (options.viewport) {
    await page.setViewport(options.viewport)
  }

  // Set user agent if specified
  if (options.userAgent) {
    await page.setUserAgent(options.userAgent)
  }

  // Create debug helper
  const debug = new DebugHelper(page, testName, options)

  return { page, debug }
}

/**
 * Cleanup Helper
 */
export async function cleanup(page) {
  if (page) {
    await page.close()
  }
}
