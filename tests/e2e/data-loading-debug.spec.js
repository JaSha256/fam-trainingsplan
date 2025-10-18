// DEBUG: Why doesn't the JSON load?
import { test, expect } from '@playwright/test'

test('debug - check if data loads at all', async ({ page }) => {
  // Log ALL console messages
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type()}]`, msg.text())
  })

  // Log page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]', error.message)
  })

  // Navigate
  await page.goto('/')
  console.log('✓ Page loaded')

  // Wait for Alpine
  await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
  console.log('✓ Alpine.js loaded')

  // Track loading state changes over time
  console.log('\n===== TRACKING LOADING STATE =====')

  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(200)

    const snapshot = await page.evaluate((iteration) => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      const loadingDiv = document.querySelector('[x-show="loading"]')
      const cardsDiv = document.querySelector('[x-show="!loading && !error && filteredTrainings.length > 0"]')

      return {
        time: `${iteration * 200}ms`,
        loading: component?.loading,
        error: component?.error,
        allTrainings: component?.allTrainings?.length || 0,
        filteredTrainings: component?.filteredTrainings?.length || 0,
        groupedTrainings: component?.groupedTrainings?.length || 0,
        loadingDivVisible: loadingDiv ? window.getComputedStyle(loadingDiv).display !== 'none' : false,
        cardsDivVisible: cardsDiv ? window.getComputedStyle(cardsDiv).display !== 'none' : false,
        cardsInDOM: document.querySelectorAll('.training-card').length
      }
    }, i)

    console.log(JSON.stringify(snapshot, null, 2))

    // Break if we found cards
    if (snapshot.cardsInDOM > 0) {
      console.log('✓ Cards found!')
      break
    }
  }

  console.log('=====================================\n')

  // Final state check
  const state = await page.evaluate(() => {
    const component = window.Alpine?.$data(document.querySelector('[x-data]'))
    return {
      allTrainings: component?.allTrainings?.length || 0,
      filteredTrainings: component?.filteredTrainings?.length || 0,
      metadata: component?.metadata ? Object.keys(component.metadata) : null,
      loading: component?.loading,
      error: component?.error,
      fromCache: component?.fromCache,
      groupedTrainings: component?.groupedTrainings?.length || 0
    }
  })

  console.log('\n===== FINAL ALPINE STATE =====')
  console.log(JSON.stringify(state, null, 2))
  console.log('==============================\n')

  // Check DOM
  const cardCount = await page.locator('.training-card').count()
  console.log(`Training cards in DOM: ${cardCount}`)

  // Take screenshot for visual inspection
  await page.screenshot({ path: 'debug-data-loading.png', fullPage: true })
  console.log('✓ Screenshot saved: debug-data-loading.png')
})
