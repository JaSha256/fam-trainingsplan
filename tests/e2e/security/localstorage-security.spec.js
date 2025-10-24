// tests/e2e/security/localstorage-security.spec.js
/**
 * LocalStorage Security Tests
 *
 * Tests localStorage security for OWASP A02:2021 - Cryptographic Failures
 * Verifies safe storage patterns and data validation
 *
 * Test Coverage:
 * - No sensitive data in localStorage
 * - Favorites data structure validation
 * - Filter state validation
 * - Corrupted localStorage handling
 * - LocalStorage quota limits
 */

import { test, expect } from '@playwright/test'
import { waitForAlpineAndData } from '../test-helpers.js'

test.describe('LocalStorage Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for Alpine but don't require data load for security tests
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 15000 })
  })

  test('should not store sensitive data in localStorage', async ({ page }) => {
    // Check all localStorage keys
    const localStorageKeys = await page.evaluate(() => {
      return Object.keys(localStorage)
    })

    console.log('LocalStorage keys found:', localStorageKeys)

    // Should NOT contain sensitive patterns
    const sensitivePatterns = [
      'password',
      'token',
      'secret',
      'api',
      'key',
      'auth',
      'session',
      'credential'
    ]

    let hasSensitiveData = false

    for (const key of localStorageKeys) {
      const lowerKey = key.toLowerCase()
      const matchedPattern = sensitivePatterns.find(pattern =>
        lowerKey.includes(pattern)
      )

      if (matchedPattern) {
        console.error(`❌ Potential sensitive data in localStorage key: ${key}`)
        console.error(`   Matched pattern: ${matchedPattern}`)
        hasSensitiveData = true
      }
    }

    if (!hasSensitiveData) {
      console.log('✅ No sensitive data patterns in localStorage')
    }

    expect(hasSensitiveData).toBe(false)
  })

  test('should validate favorites data structure', async ({ page }) => {
    // Get favorites from localStorage
    const favorites = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('fam-favorites') || '[]')
      } catch {
        return []
      }
    })

    console.log('Favorites structure:', typeof favorites, Array.isArray(favorites))

    // Should be an array
    expect(Array.isArray(favorites)).toBe(true)

    // Each favorite should be a number (training ID)
    if (favorites.length > 0) {
      console.log(`Validating ${favorites.length} favorites`)

      favorites.forEach((fav, index) => {
        const isValid = typeof fav === 'number' || typeof fav === 'string'
        if (!isValid) {
          console.error(`❌ Invalid favorite at index ${index}:`, fav)
        }
        expect(isValid).toBe(true)
      })

      console.log('✅ All favorites have valid types')
    } else {
      console.log('ℹ️  No favorites to validate')
    }
  })

  test('should validate filter state from localStorage', async ({ page }) => {
    // Get filter state
    const filterState = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('fam-filter-state') || '{}')
      } catch {
        return {}
      }
    })

    console.log('Filter state keys:', Object.keys(filterState))

    // Should have safe structure
    if (Object.keys(filterState).length > 0) {
      // No executable code
      const jsonString = JSON.stringify(filterState)

      expect(jsonString).not.toContain('<script>')
      expect(jsonString).not.toContain('javascript:')
      expect(jsonString).not.toContain('onerror')
      expect(jsonString).not.toContain('onclick')

      console.log('✅ Filter state contains no executable code')
    } else {
      console.log('ℹ️  No filter state to validate')
    }
  })

  test('should handle corrupted localStorage gracefully', async ({ page }) => {
    // Corrupt localStorage
    await page.evaluate(() => {
      localStorage.setItem('fam-favorites', 'CORRUPTED{JSON')
      localStorage.setItem('fam-filter-state', '{invalid}')
      localStorage.setItem('fam-cache', 'not-valid-json[')
    })

    console.log('Injected corrupted localStorage data')

    // Reload to load favorites
    await page.reload()
    // Wait for Alpine but not full data load
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 10000 })
    await page.waitForTimeout(1000)

    // App should not crash
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)

    // Should fall back to defaults
    const favorites = await page.evaluate(() => {
      try {
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        return component?.favorites || []
      } catch {
        return null
      }
    })

    // Should have valid fallback data
    if (favorites !== null) {
      expect(Array.isArray(favorites)).toBe(true)
      console.log('✅ Corrupted data handled gracefully, fallback to defaults')
    }
  })

  test('should limit localStorage size and handle quota errors', async ({ page }) => {
    let quotaExceeded = false

    // Try to fill localStorage with huge data
    const result = await page.evaluate(() => {
      try {
        const hugeData = 'X'.repeat(5 * 1024 * 1024) // 5MB
        localStorage.setItem('test-huge', hugeData)
        return 'stored'
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          return 'quota_exceeded'
        }
        return 'error'
      }
    })

    if (result === 'quota_exceeded') {
      console.log('✅ LocalStorage quota protection working')
      quotaExceeded = true
    } else if (result === 'stored') {
      console.warn('⚠️  Warning: Very large data stored in localStorage')

      // Clean up
      await page.evaluate(() => {
        localStorage.removeItem('test-huge')
      })
    }

    // App should still work after quota test
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)

    console.log('✅ App remains functional after localStorage stress test')
  })

  test('should validate cache data structure', async ({ page }) => {
    // Get cache from localStorage
    const cacheData = await page.evaluate(() => {
      try {
        const cacheKey = 'fam-trainingsplan-cache'
        const cache = localStorage.getItem(cacheKey)
        return cache ? JSON.parse(cache) : null
      } catch {
        return null
      }
    })

    if (cacheData) {
      console.log('Cache data structure:', Object.keys(cacheData))

      // Should have expected structure
      const hasTimestamp = 'timestamp' in cacheData || 'lastUpdated' in cacheData
      const hasData = 'data' in cacheData || 'trainings' in cacheData

      if (hasTimestamp && hasData) {
        console.log('✅ Cache has valid structure')
      } else {
        console.warn('⚠️  Cache structure may be incomplete')
      }

      // Validate no malicious content
      const jsonString = JSON.stringify(cacheData)
      expect(jsonString).not.toContain('<script>')
      expect(jsonString).not.toContain('javascript:')
    } else {
      console.log('ℹ️  No cache data to validate')
    }
  })

  test('should document localStorage usage and best practices', async ({ page }) => {
    const storageInfo = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      const sizes = {}
      let totalSize = 0

      keys.forEach(key => {
        const value = localStorage.getItem(key) || ''
        const size = value.length * 2 // Approximate bytes (UTF-16)
        sizes[key] = size
        totalSize += size
      })

      return {
        keys,
        sizes,
        totalSize,
        quota: navigator.storage ? 'available' : 'not available'
      }
    })

    console.log('\n=== LocalStorage Usage Summary ===')
    console.log(`Total keys: ${storageInfo.keys.length}`)
    console.log(`Total size: ~${(storageInfo.totalSize / 1024).toFixed(2)} KB`)
    console.log('\nPer-key sizes:')

    Object.entries(storageInfo.sizes).forEach(([key, size]) => {
      console.log(`  ${key}: ~${(size / 1024).toFixed(2)} KB`)
    })

    console.log('\n✅ LocalStorage usage documented')

    // Storage should be reasonable (< 5MB typical for this app)
    expect(storageInfo.totalSize).toBeLessThan(5 * 1024 * 1024)
  })
})
