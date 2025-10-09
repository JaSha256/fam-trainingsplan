// tests/puppeteer/search-filter.test.js
/**
 * Search and Filter Tests
 * @description Tests search functionality and filter combinations
 */

import puppeteer from 'puppeteer'
import config from '../../puppeteer.config.js'
import { setupTest, cleanup } from './helpers/test-helpers.js'
import { BaseTest } from './helpers/base-test.js'

describe('Search and Filter Functionality', () => {
  let browser
  let page
  let debug
  let test

  beforeAll(async () => {
    browser = await puppeteer.launch(config.launch)
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    ({ page, debug } = await setupTest(browser, 'search-filter', {
      screenshots: true,
      console: true
    }))
    test = new BaseTest(page, debug)

    // Setup: Navigate and wait for app to be ready
    await test.goto()
    await test.waitForAlpine()
    await test.waitForTrainings()
  })

  afterEach(async () => {
    await debug.printSummary()
    await cleanup(page)
  })

  test('should perform text search', async () => {
    const initialCount = await test.getTrainingCount()
    console.log(`📊 Initial training count: ${initialCount}`)

    await test.search('Parkour')
    await test.screenshot('01-search-parkour.png')

    const searchCount = await test.getTrainingCount()
    console.log(`📊 Filtered count: ${searchCount}`)

    expect(searchCount).toBeLessThanOrEqual(initialCount)
    expect(searchCount).toBeGreaterThan(0)

    await test.logState()

    console.log('✅ Search functionality works')
  })

  test('should clear search', async () => {
    // Perform search first
    await test.search('Parkour')
    const searchCount = await test.getTrainingCount()

    // Clear search
    await debug.step('Clear search', async () => {
      const searchInput = await page.$('#search-input, [data-search-input], input[type="search"]')
      await searchInput.click({ clickCount: 3 })
      await page.keyboard.press('Backspace')
      await debug.wait.sleep(500)
    })

    await test.screenshot('02-search-cleared.png')

    const clearedCount = await test.getTrainingCount()
    console.log(`📊 After clear: ${clearedCount}`)

    expect(clearedCount).toBeGreaterThan(searchCount)

    console.log('✅ Search clear works')
  })

  test('should filter by training type', async () => {
    await test.screenshot('03-before-filter.png')

    // Get available training types
    const trainingTypes = await page.evaluate(() => {
      const select = document.querySelector('#filter-training, select[name="training"]')
      if (!select) return []
      return Array.from(select.options)
        .map(opt => opt.value)
        .filter(val => val !== '' && val !== 'all')
    })

    if (trainingTypes.length > 0) {
      const firstType = trainingTypes[0]
      await test.filterByTraining(firstType)

      await test.screenshot(`04-filter-${firstType}.png`)

      const filteredCount = await test.getTrainingCount()
      console.log(`📊 Filtered by ${firstType}: ${filteredCount} trainings`)

      expect(filteredCount).toBeGreaterThan(0)

      await test.logState()

      console.log('✅ Training type filter works')
    } else {
      console.log('⚠️ No training types available to filter')
    }
  })

  test('should filter by location', async () => {
    // Get available locations
    const locations = await page.evaluate(() => {
      const select = document.querySelector('#filter-ort, select[name="ort"]')
      if (!select) return []
      return Array.from(select.options)
        .map(opt => opt.value)
        .filter(val => val !== '' && val !== 'all')
    })

    if (locations.length > 0) {
      const firstLocation = locations[0]
      await test.filterByLocation(firstLocation)

      await test.screenshot(`05-filter-location-${firstLocation}.png`)

      const filteredCount = await test.getTrainingCount()
      console.log(`📊 Filtered by ${firstLocation}: ${filteredCount} trainings`)

      expect(filteredCount).toBeGreaterThan(0)

      console.log('✅ Location filter works')
    } else {
      console.log('⚠️ No locations available to filter')
    }
  })

  test('should filter by weekday', async () => {
    // Get available weekdays
    const weekdays = await page.evaluate(() => {
      const select = document.querySelector('#filter-wochentag, select[name="wochentag"]')
      if (!select) return []
      return Array.from(select.options)
        .map(opt => opt.value)
        .filter(val => val !== '' && val !== 'all')
    })

    if (weekdays.length > 0) {
      const firstWeekday = weekdays[0]
      await test.filterByWeekday(firstWeekday)

      await test.screenshot(`06-filter-weekday-${firstWeekday}.png`)

      const filteredCount = await test.getTrainingCount()
      console.log(`📊 Filtered by ${firstWeekday}: ${filteredCount} trainings`)

      expect(filteredCount).toBeGreaterThan(0)

      console.log('✅ Weekday filter works')
    } else {
      console.log('⚠️ No weekdays available to filter')
    }
  })

  test('should combine search and filters', async () => {
    const initialCount = await test.getTrainingCount()
    console.log(`📊 Initial: ${initialCount}`)

    // Apply search
    await test.search('München')
    const afterSearch = await test.getTrainingCount()
    console.log(`📊 After search: ${afterSearch}`)

    await test.screenshot('07-search-applied.png')

    // Apply filter
    const trainingTypes = await page.evaluate(() => {
      const select = document.querySelector('#filter-training, select[name="training"]')
      if (!select) return []
      return Array.from(select.options)
        .map(opt => opt.value)
        .filter(val => val !== '' && val !== 'all')
    })

    if (trainingTypes.length > 0) {
      await test.filterByTraining(trainingTypes[0])
      const afterFilter = await test.getTrainingCount()
      console.log(`📊 After filter: ${afterFilter}`)

      await test.screenshot('08-search-and-filter.png')

      expect(afterFilter).toBeLessThanOrEqual(afterSearch)

      await test.logState()

      console.log('✅ Combined search and filter works')
    }
  })

  test('should reset filters', async () => {
    // Apply some filters
    await test.search('Parkour')

    const trainingTypes = await page.evaluate(() => {
      const select = document.querySelector('#filter-training, select[name="training"]')
      if (!select) return []
      return Array.from(select.options)
        .map(opt => opt.value)
        .filter(val => val !== '' && val !== 'all')
    })

    if (trainingTypes.length > 0) {
      await test.filterByTraining(trainingTypes[0])
    }

    const filteredCount = await test.getTrainingCount()
    console.log(`📊 With filters: ${filteredCount}`)

    await test.screenshot('09-before-reset.png')

    // Reset
    await test.resetFilters()

    await test.screenshot('10-after-reset.png')

    const resetCount = await test.getTrainingCount()
    console.log(`📊 After reset: ${resetCount}`)

    expect(resetCount).toBeGreaterThanOrEqual(filteredCount)

    console.log('✅ Reset filters works')
  })
}, 120000) // 2 minutes timeout
