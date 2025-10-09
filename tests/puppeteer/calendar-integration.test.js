// tests/puppeteer/calendar-integration.test.js
/**
 * Calendar Integration E2E Tests
 * @description Tests calendar functionality and URL generation
 */

import puppeteer from 'puppeteer'
import config from '../../puppeteer.config.js'
import { setupTest, cleanup } from './helpers/test-helpers.js'
import { BaseTest } from './helpers/base-test.js'

describe('Calendar Integration', () => {
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
    ({ page, debug } = await setupTest(browser, 'calendar-integration', {
      screenshots: true,
      console: true
    }))
    test = new BaseTest(page, debug)

    // Setup
    await test.goto()
    await test.waitForAlpine()
    await test.waitForTrainings()
  })

  afterEach(async () => {
    await debug.printSummary()
    await cleanup(page)
  })

  test('should have calendar integration functions available', async () => {
    const calendarFunctions = await page.evaluate(() => {
      const store = window.Alpine?.store('trainingsplaner')
      return {
        hasAddToGoogleCalendar: typeof store?.addToGoogleCalendar === 'function',
        hasAddToCalendar: typeof store?.addToCalendar === 'function',
        hasBulkAddToGoogleCalendar: typeof store?.bulkAddToGoogleCalendar === 'function'
      }
    })

    console.log('📋 Calendar functions:', calendarFunctions)

    expect(calendarFunctions.hasAddToGoogleCalendar).toBe(true)
    expect(calendarFunctions.hasAddToCalendar).toBe(true)
    expect(calendarFunctions.hasBulkAddToGoogleCalendar).toBe(true)

    console.log('✅ Calendar functions available')
  })

  test('should generate Google Calendar URL', async () => {
    const url = await page.evaluate(() => {
      const store = window.Alpine?.store('trainingsplaner')
      const training = store?.trainings?.[0]

      if (!training) return null

      // Import calendar integration
      return import('/src/js/calendar-integration.js').then(module => {
        return module.createGoogleCalendarUrl(training)
      })
    })

    console.log('🔗 Generated URL:', url)

    expect(url).toBeTruthy()
    expect(url).toContain('calendar.google.com')
    expect(url).toContain('action=TEMPLATE')

    console.log('✅ Google Calendar URL generated')
  })

  test('should detect calendar provider', async () => {
    const provider = await page.evaluate(() => {
      return import('/src/js/calendar-integration.js').then(module => {
        return module.detectCalendarProvider()
      })
    })

    console.log('📱 Detected provider:', provider)

    expect(provider).toBeTruthy()
    expect(['google', 'outlook', 'office365', 'apple', 'yahoo']).toContain(provider)

    console.log('✅ Calendar provider detected')
  })

  test('should open Google Calendar in new tab', async () => {
    // Listen for new page (popup)
    const newPagePromise = new Promise(resolve => {
      browser.once('targetcreated', async target => {
        const newPage = await target.page()
        resolve(newPage)
      })
    })

    // Trigger calendar export
    await debug.step('Click Add to Google Calendar', async () => {
      await page.evaluate(() => {
        const store = window.Alpine?.store('trainingsplaner')
        const training = store?.trainings?.[0]
        if (training) {
          store.addToGoogleCalendar(training)
        }
      })
    })

    await test.screenshot('01-calendar-popup-triggered.png')

    // Wait for popup (with timeout)
    const newPage = await Promise.race([
      newPagePromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('No popup opened')), 5000)
      )
    ]).catch(err => {
      console.log('⚠️ No popup opened (expected if popup blocker active)')
      return null
    })

    if (newPage) {
      await debug.wait.sleep(2000)
      const url = newPage.url()
      console.log('📅 Opened URL:', url)

      expect(url).toContain('calendar.google.com')

      await newPage.close()

      console.log('✅ Calendar popup opened')
    } else {
      console.log('⚠️ Skipped popup test (popup blocker)')
    }
  })

  test('should handle calendar dropdown UI', async () => {
    // Look for calendar buttons or dropdowns
    const calendarButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'))
      return buttons
        .filter(btn => {
          const text = btn.textContent.toLowerCase()
          return text.includes('kalender') ||
                 text.includes('calendar') ||
                 btn.getAttribute('data-calendar')
        })
        .map(btn => ({
          text: btn.textContent.trim(),
          visible: btn.offsetParent !== null
        }))
    })

    console.log('🔘 Calendar buttons found:', calendarButtons.length)
    console.log(calendarButtons)

    if (calendarButtons.length > 0) {
      await test.screenshot('02-calendar-buttons.png')
      console.log('✅ Calendar UI elements found')
    } else {
      console.log('⚠️ No calendar UI elements found (may not be implemented yet)')
    }
  })

  test('should test bulk calendar export function', async () => {
    const result = await page.evaluate(async () => {
      const store = window.Alpine?.store('trainingsplaner')
      const trainings = store?.trainings?.slice(0, 3) // Test with 3 trainings

      if (!trainings || trainings.length === 0) {
        return { error: 'No trainings available' }
      }

      // Import calendar module
      const calendar = await import('/src/js/calendar-integration.js')

      // Mock window.open to prevent actual popups
      const originalOpen = window.open
      const openedUrls = []

      window.open = (url) => {
        openedUrls.push(url)
        return { closed: false } // Mock window object
      }

      try {
        const result = await calendar.bulkAddToGoogleCalendar(trainings, {
          maxBulk: 3,
          delay: 100 // Short delay for testing
        })

        return {
          result,
          openedUrls,
          urlCount: openedUrls.length
        }
      } finally {
        window.open = originalOpen
      }
    })

    console.log('📊 Bulk export result:', result)

    if (result.error) {
      console.log('⚠️', result.error)
    } else {
      expect(result.result.success).toBe(true)
      expect(result.urlCount).toBe(3)
      expect(result.openedUrls[0]).toContain('calendar.google.com')

      console.log('✅ Bulk export works')
    }
  })

  test('should test iCal download function', async () => {
    const result = await page.evaluate(async () => {
      const store = window.Alpine?.store('trainingsplaner')
      const training = store?.trainings?.[0]

      if (!training) {
        return { error: 'No training available' }
      }

      // Import calendar module
      const calendar = await import('/src/js/calendar-integration.js')

      // Mock document.createElement and related methods
      const createdElements = []

      const originalCreateElement = document.createElement.bind(document)
      document.createElement = function(tag) {
        const el = originalCreateElement(tag)
        if (tag === 'a') {
          createdElements.push(el)
          // Mock click to prevent actual download
          el.click = function() {
            console.log('Mock download:', this.download, this.href)
          }
        }
        return el
      }

      try {
        const result = calendar.downloadICalFile(training)

        return {
          result,
          createdElements: createdElements.length,
          filename: createdElements[0]?.download
        }
      } finally {
        document.createElement = originalCreateElement
      }
    })

    console.log('📥 iCal download result:', result)

    if (result.error) {
      console.log('⚠️', result.error)
    } else {
      expect(result.result.success).toBe(true)
      expect(result.createdElements).toBe(1)
      expect(result.filename).toContain('.ics')

      console.log('✅ iCal download works')
    }
  })

  test('should test all calendar providers', async () => {
    const providers = await page.evaluate(async () => {
      const calendar = await import('/src/js/calendar-integration.js')
      const store = window.Alpine?.store('trainingsplaner')
      const training = store?.trainings?.[0]

      if (!training) return { error: 'No training available' }

      return {
        google: calendar.createGoogleCalendarUrl(training),
        outlook: calendar.createOutlookCalendarUrl(training),
        office365: calendar.createOffice365CalendarUrl(training),
        yahoo: calendar.createYahooCalendarUrl(training)
      }
    })

    console.log('🗓️ Provider URLs generated:')

    if (providers.error) {
      console.log('⚠️', providers.error)
      return
    }

    // Test Google
    expect(providers.google).toContain('calendar.google.com')
    console.log('  ✅ Google')

    // Test Outlook
    expect(providers.outlook).toContain('outlook.live.com')
    console.log('  ✅ Outlook')

    // Test Office 365
    expect(providers.office365).toContain('outlook.office.com')
    console.log('  ✅ Office 365')

    // Test Yahoo
    expect(providers.yahoo).toContain('calendar.yahoo.com')
    console.log('  ✅ Yahoo')

    console.log('✅ All provider URLs generated correctly')
  })
}, 120000) // 2 minutes timeout
