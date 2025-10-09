// tests/puppeteer/app-basic.test.js
/**
 * Basic App Functionality Tests
 * @description Tests core app loading and basic interactions
 */

import puppeteer from 'puppeteer'
import config from '../../puppeteer.config.js'
import { setupTest, cleanup } from './helpers/test-helpers.js'
import { BaseTest } from './helpers/base-test.js'

describe('App Basic Functionality', () => {
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
    ({ page, debug } = await setupTest(browser, 'app-basic', {
      screenshots: true,
      console: true,
      network: false
    }))
    test = new BaseTest(page, debug)
  })

  afterEach(async () => {
    if (debug.console?.hasErrors()) {
      console.warn('⚠️ Test completed with console errors')
    }
    await debug.printSummary()
    await cleanup(page)
  })

  test('should load the app successfully', async () => {
    await test.goto()
    await test.waitForAlpine()

    await test.screenshot('01-app-loaded.png')

    // Check title
    const title = await page.title()
    expect(title).toContain('Trainingsplan')

    // Check Alpine is loaded
    const alpineLoaded = await page.evaluate(() => window.Alpine !== undefined)
    expect(alpineLoaded).toBe(true)

    console.log('✅ App loaded successfully')
  })

  test('should load trainings data', async () => {
    await test.goto()
    await test.waitForAlpine()
    await test.waitForTrainings()

    await test.screenshot('02-trainings-loaded.png')

    const counts = await debug.getTrainingsCount()
    console.log(`📊 Loaded ${counts.total} trainings, ${counts.filtered} visible`)

    expect(counts.total).toBeGreaterThan(0)
    expect(counts.filtered).toBeGreaterThan(0)

    console.log('✅ Trainings loaded successfully')
  })

  test('should display training cards', async () => {
    await test.goto()
    await test.waitForAlpine()
    await test.waitForTrainings()

    await test.screenshot('03-training-cards.png')

    const cardCount = await test.getTrainingCount()
    console.log(`📊 Found ${cardCount} training cards in UI`)

    expect(cardCount).toBeGreaterThan(0)

    console.log('✅ Training cards displayed')
  })

  test('should have responsive viewport', async () => {
    // Desktop
    await page.setViewport(config.viewports.desktop)
    await test.goto()
    await test.waitForAlpine()
    await test.screenshot('04-desktop.png')

    // Tablet
    await page.setViewport(config.viewports.tablet)
    await test.screenshot('05-tablet.png')

    // Mobile
    await page.setViewport(config.viewports.mobile)
    await test.screenshot('06-mobile.png')

    console.log('✅ Responsive design tested')
  })

  test('should not have console errors on load', async () => {
    await test.goto()
    await test.waitForAlpine()
    await test.waitForTrainings()

    const errors = debug.console.getErrors()

    if (errors.length > 0) {
      console.error('❌ Console errors found:')
      errors.forEach(err => console.error(`  - ${err.text}`))
    }

    expect(errors.length).toBe(0)

    console.log('✅ No console errors')
  })
}, 60000) // 60s timeout for entire suite
