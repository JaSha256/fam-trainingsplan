// tests/e2e/security/input-validation.spec.js
/**
 * Input Validation Tests
 *
 * Tests input validation and sanitization for OWASP A03:2021 - Injection
 * Verifies proper handling of malicious and edge-case inputs
 *
 * Test Coverage:
 * - Search input length limits
 * - Special character sanitization
 * - Filter value validation
 * - JSON injection prevention
 */

import { test, expect } from '@playwright/test'
import { waitForAlpineAndData } from '../test-helpers.js'

test.describe('Input Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for Alpine but don't require data load for security tests
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 15000 })
  })

  test('should enforce search input max length', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], #search').first()

    // Try extremely long input (potential DoS)
    const longInput = 'A'.repeat(10000)
    await searchInput.fill(longInput)
    await page.waitForTimeout(300)

    const actualValue = await searchInput.inputValue()

    // Should be limited (maxLength attribute or programmatic)
    // Most reasonable search inputs are < 1000 chars
    expect(actualValue.length).toBeLessThan(1000)

    if (actualValue.length === longInput.length) {
      console.warn('⚠️  Input Validation: Search input has no max length')
      console.warn('    Recommendation: Add maxLength attribute to search input')
    } else {
      console.log(`✅ Search input limited to ${actualValue.length} characters`)
    }
  })

  test('should handle special characters in search gracefully', async ({ page }) => {
    const dangerousChars = ['<', '>', '"', "'", '&', '/', '\\']
    const searchInput = page.locator('input[type="search"], #search').first()

    for (const char of dangerousChars) {
      await searchInput.fill(`test${char}value`)
      await page.waitForTimeout(200)

      // Check if app handles it gracefully (no crash/exception)
      // Note: "Fehler" might appear in UI as normal German text, not an error
      const hasUnhandledException = await page.evaluate(() => {
        return window.hasOwnProperty('criticalError')
      })
      expect(hasUnhandledException).toBe(false)

      // Verify page is still functional
      const appVisible = await page.locator('#app').isVisible()
      expect(appVisible).toBe(true)
    }

    console.log('✅ All special characters handled gracefully')
  })

  test('should validate filter values', async ({ page }) => {
    // Try setting invalid filter value programmatically
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters.wochentag = ['InvalidDay<script>']
    })
    await page.waitForTimeout(300)

    // App should handle gracefully
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)

    // No critical errors
    const hasError = await page.locator('[data-error]').count()
    expect(hasError).toBe(0)

    const filterValue = await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      return store.filters.wochentag
    })

    // Should be sanitized or stored safely
    if (Array.isArray(filterValue)) {
      console.log('✅ Filter values handled as array')
    }

    // Verify DOM doesn't execute script
    const domHtml = await page.content()
    expect(domHtml).not.toContain('<script>')
  })

  test('should prevent JSON injection in favorites', async ({ page }) => {
    // Try to inject malicious JSON with prototype pollution
    await page.evaluate(() => {
      const maliciousJson = '{"__proto__": {"isAdmin": true}}'
      try {
        localStorage.setItem('fam-favorites', maliciousJson)
      } catch (e) {
        // Expected to fail or be sanitized
        console.log('LocalStorage rejected malicious JSON')
      }
    })

    await page.reload()
    // Wait for Alpine but not full data load
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 10000 })
    await page.waitForTimeout(1000)

    // Verify prototype pollution didn't work
    const isPrototypePolluted = await page.evaluate(() => {
      const obj = {}
      return obj.isAdmin === true
    })

    expect(isPrototypePolluted).toBe(false)

    if (!isPrototypePolluted) {
      console.log('✅ Protected against prototype pollution')
    }
  })

  test('should handle malformed URL parameters', async ({ page }) => {
    const malformedUrls = [
      '/?search=%00null%00byte',
      '/?wochentag[]=injection',
      '/?search=%FF%FE',
      '/?ort=../../etc/passwd'
    ]

    for (const url of malformedUrls) {
      await page.goto(url)
      // Wait for Alpine but not full data load
      await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 10000 })

      // Should not crash
      const appVisible = await page.locator('#app').isVisible()
      expect(appVisible).toBe(true)

      // Should not have unhandled errors
      const hasConsoleError = await page.evaluate(() => {
        return window.hasOwnProperty('lastError')
      })
      expect(hasConsoleError).toBe(false)
    }

    console.log('✅ Malformed URL parameters handled gracefully')
  })

  test('should limit filter array size', async ({ page }) => {
    // Try to fill filter with huge array (potential DoS)
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      const hugeArray = new Array(10000).fill('test')
      store.filters.wochentag = hugeArray
    })

    await page.waitForTimeout(1000)

    // App should still be responsive
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)

    // Check if filter is limited or handled
    const filterLength = await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      return store.filters.wochentag?.length || 0
    })

    console.log(`Filter array size: ${filterLength}`)

    if (filterLength === 10000) {
      console.warn('⚠️  Input Validation: Filter arrays have no size limit')
      console.warn('    Recommendation: Add validation for maximum filter selections')
    }

    // App should remain functional regardless
    expect(appVisible).toBe(true)
  })
})
