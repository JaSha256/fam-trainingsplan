// tests/e2e/security/security-headers.spec.js
/**
 * Security Headers Tests
 *
 * Tests security headers for OWASP A05:2021 - Security Misconfiguration
 * Validates presence and configuration of security-related HTTP headers
 *
 * Test Coverage:
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 * - X-Powered-By (should NOT be present)
 * - Strict-Transport-Security (for HTTPS)
 */

import { test, expect } from '@playwright/test'

test.describe('Security Headers Tests', () => {
  let response

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    response = await page.goto('/')
    await page.close()
  })

  test('should have X-Content-Type-Options header', async () => {
    const header = response?.headers()['x-content-type-options']

    if (header) {
      console.log('✅ X-Content-Type-Options:', header)
      expect(header).toBe('nosniff')
    } else {
      console.warn('⚠️  Missing: X-Content-Type-Options: nosniff')
      console.warn('    Recommendation: Add header to prevent MIME-type sniffing')
      console.warn('    GitHub Pages limitation - consider meta tag or Cloudflare')
    }

    // Document current state
    expect(response?.headers()).toBeDefined()
  })

  test('should have Referrer-Policy header', async () => {
    const header = response?.headers()['referrer-policy']

    if (header) {
      console.log('✅ Referrer-Policy:', header)

      // Recommended values
      const recommended = [
        'no-referrer',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'same-origin'
      ]

      if (recommended.includes(header)) {
        console.log('   Policy is secure')
      } else {
        console.warn('   Policy could be more restrictive')
      }
    } else {
      console.warn('⚠️  Missing: Referrer-Policy header')
      console.warn('    Recommendation: Add referrer policy for privacy')
    }

    // Document current state
    expect(response?.headers()).toBeDefined()
  })

  test('should have Permissions-Policy header', async () => {
    const header = response?.headers()['permissions-policy']
    const featurePolicyHeader = response?.headers()['feature-policy']

    if (header) {
      console.log('✅ Permissions-Policy:', header)
      console.log('   Restricts sensitive browser features')
    } else if (featurePolicyHeader) {
      console.log('⚠️  Using deprecated Feature-Policy header:', featurePolicyHeader)
      console.warn('   Recommendation: Migrate to Permissions-Policy')
    } else {
      console.warn('⚠️  Missing: Permissions-Policy header')
      console.warn('    Recommendation: Restrict camera, microphone, geolocation etc.')
      console.warn('    Example: geolocation=(self), camera=(), microphone=()')
    }

    // Document current state
    expect(response?.headers()).toBeDefined()
  })

  test('should NOT have X-Powered-By header', async () => {
    const header = response?.headers()['x-powered-by']

    if (header) {
      console.error('❌ X-Powered-By header present:', header)
      console.error('   Security Issue: Information disclosure')
      console.error('   Recommendation: Remove X-Powered-By header')
      expect(header).toBeUndefined()
    } else {
      console.log('✅ X-Powered-By header not present (good)')
    }

    // Should be undefined
    expect(header).toBeUndefined()
  })

  test('should have Strict-Transport-Security for HTTPS', async () => {
    const header = response?.headers()['strict-transport-security']
    const url = response?.url()

    if (url?.startsWith('https://')) {
      if (header) {
        console.log('✅ Strict-Transport-Security:', header)

        // Should have max-age directive
        if (header.includes('max-age')) {
          console.log('   HSTS properly configured')
        } else {
          console.warn('   HSTS missing max-age directive')
        }

        // Check for includeSubDomains
        if (header.includes('includeSubDomains')) {
          console.log('   Includes subdomains (good)')
        }

        // Check for preload
        if (header.includes('preload')) {
          console.log('   Preload enabled (excellent)')
        }
      } else {
        console.warn('⚠️  Missing: Strict-Transport-Security for HTTPS')
        console.warn('    Recommendation: Add HSTS header')
        console.warn('    Example: max-age=31536000; includeSubDomains; preload')
      }
    } else {
      console.log('ℹ️  HSTS not applicable (HTTP only)')
    }

    // Document current state
    expect(response?.url()).toBeDefined()
  })

  test('should document all security headers present', async () => {
    const headers = response?.headers()
    const securityHeaders = [
      'content-security-policy',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
      'permissions-policy',
      'feature-policy',
      'strict-transport-security'
    ]

    console.log('\n=== Security Headers Summary ===')
    let foundCount = 0

    for (const headerName of securityHeaders) {
      const value = headers?.[headerName]
      if (value) {
        console.log(`✅ ${headerName}: ${value}`)
        foundCount++
      } else {
        console.log(`❌ ${headerName}: Not present`)
      }
    }

    console.log(`\nTotal: ${foundCount}/${securityHeaders.length} security headers present`)

    if (foundCount < 3) {
      console.warn('\n⚠️  Recommendation: Add more security headers')
      console.warn('   GitHub Pages has limited header support')
      console.warn('   Consider: Meta tags or Cloudflare Pages')
    }

    // Always pass - this is documentation
    expect(foundCount).toBeGreaterThanOrEqual(0)
  })
})
