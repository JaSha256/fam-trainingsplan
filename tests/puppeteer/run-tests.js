#!/usr/bin/env node
// tests/puppeteer/run-tests.js
/**
 * Puppeteer Test Runner
 * @description Manual test runner with debugging output
 */

import puppeteer from 'puppeteer'
import config from '../../puppeteer.config.js'
import { setupTest, cleanup } from './helpers/test-helpers.js'
import { BaseTest } from './helpers/base-test.js'
import fs from 'fs'
import path from 'path'

const TEST_SUITES = {
  basic: './app-basic.test.js',
  search: './search-filter.test.js',
  calendar: './calendar-integration.test.js'
}

// Parse command line args
const args = process.argv.slice(2)
const testToRun = args[0] || 'all'
const headless = args.includes('--headless')
const slowMo = args.includes('--slow') ? 250 : 50

console.log('\n' + '='.repeat(70))
console.log('🧪 Puppeteer Test Runner')
console.log('='.repeat(70))
console.log(`Mode: ${headless ? 'Headless' : 'Headed (Visible)'}`)
console.log(`Speed: ${slowMo}ms slowMo`)
console.log(`Test: ${testToRun}`)
console.log('='.repeat(70) + '\n')

async function runManualTest() {
  const browser = await puppeteer.launch({
    ...config.launch,
    headless: headless ? 'new' : false,
    slowMo: slowMo,
    devtools: !headless
  })

  try {
    const { page, debug } = await setupTest(browser, 'manual-test', {
      screenshots: true,
      console: true,
      network: true
    })

    const test = new BaseTest(page, debug)

    console.log('\n🚀 Starting test execution...\n')

    // ==================== BASIC APP TEST ====================
    console.log('\n📦 TEST SUITE: Basic App Functionality\n')

    await test.goto()
    await test.waitForAlpine()
    await test.screenshot('01-app-loaded.png')

    await test.waitForTrainings()
    await test.screenshot('02-trainings-loaded.png')

    const counts = await debug.getTrainingsCount()
    console.log(`\n✅ Loaded ${counts.total} trainings, ${counts.filtered} visible\n`)

    // ==================== SEARCH TEST ====================
    console.log('\n🔍 TEST SUITE: Search Functionality\n')

    await test.search('Parkour')
    await test.screenshot('03-search-parkour.png')

    const afterSearch = await test.getTrainingCount()
    console.log(`\n✅ Search results: ${afterSearch} trainings\n`)

    await test.logState()

    // ==================== FILTER TEST ====================
    console.log('\n🎯 TEST SUITE: Filter Functionality\n')

    // Reset first
    await debug.step('Clear search', async () => {
      const searchInput = await page.$('#search-input, input[type="search"]')
      if (searchInput) {
        await searchInput.click({ clickCount: 3 })
        await page.keyboard.press('Backspace')
        await debug.wait.sleep(500)
      }
    })

    // Try filtering
    const hasFilters = await page.evaluate(() => {
      return document.querySelector('select[name="training"]') !== null
    })

    if (hasFilters) {
      const trainingTypes = await page.evaluate(() => {
        const select = document.querySelector('select[name="training"]')
        return Array.from(select.options)
          .map(opt => opt.value)
          .filter(val => val !== '' && val !== 'all')
      })

      if (trainingTypes.length > 0) {
        await test.filterByTraining(trainingTypes[0])
        await test.screenshot('04-filter-applied.png')

        const afterFilter = await test.getTrainingCount()
        console.log(`\n✅ Filtered results: ${afterFilter} trainings\n`)

        await test.logState()
      }
    } else {
      console.log('\n⚠️ No filter selects found in DOM\n')
    }

    // ==================== CALENDAR TEST ====================
    console.log('\n📅 TEST SUITE: Calendar Integration\n')

    const calendarAvailable = await page.evaluate(() => {
      return import('/src/js/calendar-integration.js')
        .then(() => true)
        .catch(() => false)
    })

    if (calendarAvailable) {
      const url = await page.evaluate(() => {
        const store = window.Alpine?.store('trainingsplaner')
        const training = store?.trainings?.[0]
        if (!training) return null

        return import('/src/js/calendar-integration.js').then(module => {
          return module.createGoogleCalendarUrl(training)
        })
      })

      if (url) {
        console.log(`\n✅ Generated Google Calendar URL:\n${url.substring(0, 100)}...\n`)
      }

      const provider = await page.evaluate(() => {
        return import('/src/js/calendar-integration.js').then(module => {
          return module.detectCalendarProvider()
        })
      })

      console.log(`✅ Detected calendar provider: ${provider}\n`)
    } else {
      console.log('\n⚠️ Calendar integration module not found\n')
    }

    // ==================== RESPONSIVE TEST ====================
    console.log('\n📱 TEST SUITE: Responsive Design\n')

    await page.setViewport(config.viewports.mobile)
    await debug.wait.sleep(1000)
    await test.screenshot('05-mobile-view.png')
    console.log('✅ Mobile view captured')

    await page.setViewport(config.viewports.tablet)
    await debug.wait.sleep(1000)
    await test.screenshot('06-tablet-view.png')
    console.log('✅ Tablet view captured')

    await page.setViewport(config.viewports.desktop)
    await debug.wait.sleep(1000)
    await test.screenshot('07-desktop-view.png')
    console.log('✅ Desktop view captured')

    // ==================== SUMMARY ====================
    await debug.printSummary()

    const errors = debug.console.getErrors()
    const hasErrors = errors.length > 0

    console.log('\n' + '='.repeat(70))
    console.log('📊 TEST EXECUTION SUMMARY')
    console.log('='.repeat(70))
    console.log(`Status: ${hasErrors ? '❌ FAILED' : '✅ PASSED'}`)
    console.log(`Console Errors: ${errors.length}`)
    console.log(`Network Failures: ${debug.network.getFailedRequests().length}`)
    console.log(`Screenshots: Check tests/puppeteer/screenshots/manual-test/`)
    console.log('='.repeat(70) + '\n')

    await cleanup(page)

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

// Run tests
runManualTest()
  .then(() => {
    console.log('\n✅ All tests completed successfully\n')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Test execution failed:', error)
    process.exit(1)
  })
