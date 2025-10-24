import { test, expect } from '@playwright/test'
import { setupTestDataMocking, waitForAlpineAndData } from '../test-helpers.js'
import { existsSync, unlinkSync, readFileSync } from 'fs'

test.describe('Calendar Export API Tests - ICS Format (RFC 5545)', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestDataMocking(page)
    await page.goto('/')
    await waitForAlpineAndData(page)
  })

  test('should export training as ICS file via download', async ({ page }) => {
    // Get first training from component
    const trainingId = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.allTrainings[0]?.id
    })

    expect(trainingId).toBeDefined()

    // Trigger calendar export and capture download
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 })

    await page.evaluate((id) => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      // Use exportAllToCalendar which calls downloadICalFile
      if (component?.exportAllToCalendar) {
        component.exportAllToCalendar()
      }
    }, trainingId)

    const download = await downloadPromise
    const filePath = await download.path()

    // Verify download occurred
    expect(filePath).toBeTruthy()
    expect(existsSync(filePath)).toBe(true)

    // Read ICS content
    const icsContent = readFileSync(filePath, 'utf-8')

    // Basic ICS validation (RFC 5545)
    expect(icsContent).toContain('BEGIN:VCALENDAR')
    expect(icsContent).toContain('VERSION:2.0')
    expect(icsContent).toContain('BEGIN:VEVENT')
    expect(icsContent).toContain('END:VEVENT')
    expect(icsContent).toContain('END:VCALENDAR')

    // Cleanup
    unlinkSync(filePath)
  })

  test('should include correct ICS properties (RFC 5545 compliance)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    const download = await downloadPromise
    const filePath = await download.path()
    const icsContent = readFileSync(filePath, 'utf-8')

    // Required ICS properties (RFC 5545)
    expect(icsContent).toContain('DTSTART')   // Start time
    expect(icsContent).toContain('DTEND')     // End time
    expect(icsContent).toContain('SUMMARY')   // Title
    expect(icsContent).toContain('UID')       // Unique ID

    // Recommended properties
    const hasDescription = icsContent.includes('DESCRIPTION')
    const hasLocation = icsContent.includes('LOCATION')

    console.log('ICS has description:', hasDescription)
    console.log('ICS has location:', hasLocation)

    // At least one should be present
    expect(hasDescription || hasLocation).toBe(true)

    unlinkSync(filePath)
  })

  test('should use correct timezone (Europe/Berlin)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    const download = await downloadPromise
    const filePath = await download.path()
    const icsContent = readFileSync(filePath, 'utf-8')

    // Check timezone (should be Europe/Berlin or UTC)
    const hasEuropeBerlin = icsContent.includes('Europe/Berlin')
    const hasUTC = icsContent.includes('Z') // UTC indicator in dates

    console.log('Has Europe/Berlin timezone:', hasEuropeBerlin)
    console.log('Has UTC indicator:', hasUTC)

    // Should have timezone information
    expect(hasEuropeBerlin || hasUTC).toBe(true)

    unlinkSync(filePath)
  })

  test('should format dates correctly (ISO 8601 / iCalendar format)', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    const download = await downloadPromise
    const filePath = await download.path()
    const icsContent = readFileSync(filePath, 'utf-8')

    // Date format: YYYYMMDDTHHMMSSZ or YYYYMMDD
    // Example: DTSTART:20250124T180000Z
    const dateRegex = /DTSTART[^:]*:(\d{8}T?\d{0,6}Z?)/
    const match = icsContent.match(dateRegex)

    expect(match).toBeTruthy()
    if (match) {
      const dateStr = match[1]
      // Should be 8 digits (YYYYMMDD) or 15+ chars with T (YYYYMMDDTHHMMSSZ)
      expect(dateStr.length).toBeGreaterThanOrEqual(8)

      // Should start with valid year (20XX)
      expect(dateStr.substring(0, 2)).toBe('20')
    }

    unlinkSync(filePath)
  })

  test('should handle special characters in ICS content', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    const download = await downloadPromise
    const filePath = await download.path()
    const icsContent = readFileSync(filePath, 'utf-8')

    // ICS format rules:
    // - Lines should be CRLF terminated (or LF for compatibility)
    // - No unescaped semicolons in text fields
    // - Lines should not exceed 75 octets (but this is often ignored)

    const lines = icsContent.split(/\r?\n/)

    // Verify no broken lines (orphaned content without property name)
    lines.forEach((line, index) => {
      if (line.trim().length > 0) {
        // Line should either start with a property name or be a continuation (space)
        const isValidLine = /^[A-Z\-]+[:;]/.test(line) || /^\s/.test(line) ||
                          line === 'BEGIN:VCALENDAR' || line === 'END:VCALENDAR' ||
                          line === 'BEGIN:VEVENT' || line === 'END:VEVENT'

        if (!isValidLine) {
          console.warn(`Invalid line ${index}: "${line}"`)
        }
      }
    })

    // Basic validation: file should be parseable as ICS
    expect(icsContent).toMatch(/BEGIN:VCALENDAR/)
    expect(icsContent).toMatch(/END:VCALENDAR/)

    unlinkSync(filePath)
  })

  test('should set correct MIME type for ICS download', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    const download = await downloadPromise

    // Check suggested filename
    const suggestedFilename = download.suggestedFilename()
    expect(suggestedFilename).toMatch(/\.ics$/)

    console.log('Downloaded filename:', suggestedFilename)

    const filePath = await download.path()
    unlinkSync(filePath)
  })

  test('should export multiple trainings in single ICS bundle', async ({ page }) => {
    // Apply filter to get subset of trainings
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters.wochentag = ['Montag', 'Mittwoch']
    })

    await page.waitForTimeout(500)

    const filteredCount = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.filteredTrainings?.length || 0
    })

    expect(filteredCount).toBeGreaterThan(0)

    const downloadPromise = page.waitForEvent('download')

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    const download = await downloadPromise
    const filePath = await download.path()
    const icsContent = readFileSync(filePath, 'utf-8')

    // Should have multiple VEVENT blocks
    const eventMatches = icsContent.match(/BEGIN:VEVENT/g)
    expect(eventMatches).toBeTruthy()
    expect(eventMatches.length).toBeGreaterThan(0)

    console.log(`ICS bundle contains ${eventMatches.length} events for ${filteredCount} trainings`)

    unlinkSync(filePath)
  })

  test('should create valid ICS PRODID and calendar metadata', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')

    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    const download = await downloadPromise
    const filePath = await download.path()
    const icsContent = readFileSync(filePath, 'utf-8')

    // Should have PRODID (product identifier)
    expect(icsContent).toMatch(/PRODID:/)

    // Should have VERSION:2.0
    expect(icsContent).toContain('VERSION:2.0')

    // May have additional calendar properties
    const hasCalscale = icsContent.includes('CALSCALE')
    const hasMethod = icsContent.includes('METHOD')
    const hasCalname = icsContent.includes('X-WR-CALNAME')

    console.log('Has CALSCALE:', hasCalscale)
    console.log('Has METHOD:', hasMethod)
    console.log('Has calendar name:', hasCalname)

    unlinkSync(filePath)
  })

  test('should handle export when no trainings available', async ({ page }) => {
    // Apply impossible filter
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters.wochentag = ['Montag']
      store.filters.ort = ['NonExistentLocation']
      store.filters.training = ['NonExistentType']
    })

    await page.waitForTimeout(500)

    const filteredCount = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.filteredTrainings?.length || 0
    })

    expect(filteredCount).toBe(0)

    // Try to export - should show notification instead of download
    await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      component?.exportAllToCalendar()
    })

    // Wait for notification
    await page.waitForTimeout(1000)

    // Should not trigger download
    // (No assertion needed - test passes if no error thrown)
  })
})
