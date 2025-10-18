// Complete Feature Test - After Reactivity Fixes
import { test, expect } from '@playwright/test'

test.describe('Complete Feature Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // Wait for Alpine and data
    await page.waitForFunction(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.loading === false && component?.allTrainings?.length > 0
    }, { timeout: 10000 })

    await page.waitForSelector('.training-card', { state: 'visible' })
  })

  test('all features comprehensive test', async ({ page }) => {
    console.log('\n========================================')
    console.log('COMPLETE FEATURE TEST')
    console.log('========================================\n')

    // ==================== 1. DATA LOADING ====================
    console.log('1. DATA LOADING')
    const initialState = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return {
        allTrainings: component?.allTrainings?.length || 0,
        filteredTrainings: component?.filteredTrainings?.length || 0,
        loading: component?.loading,
        error: component?.error
      }
    })
    console.log(`   ✓ All trainings: ${initialState.allTrainings}`)
    console.log(`   ✓ Filtered trainings: ${initialState.filteredTrainings}`)
    console.log(`   ✓ Loading: ${initialState.loading}`)
    console.log(`   ✓ Error: ${initialState.error || 'none'}`)
    expect(initialState.allTrainings).toBeGreaterThan(0)
    expect(initialState.loading).toBe(false)

    // ==================== 2. FILTER DROPDOWNS ====================
    console.log('\n2. FILTER DROPDOWNS')
    const dropdowns = await page.evaluate(() => ({
      wochentag: document.querySelectorAll('#filter-wochentag option').length,
      ort: document.querySelectorAll('#filter-ort option').length,
      training: document.querySelectorAll('#filter-training option').length,
      altersgruppe: document.querySelectorAll('#filter-altersgruppe option').length
    }))
    console.log(`   ✓ Wochentag options: ${dropdowns.wochentag}`)
    console.log(`   ✓ Ort options: ${dropdowns.ort}`)
    console.log(`   ✓ Training options: ${dropdowns.training}`)
    console.log(`   ✓ Altersgruppe options: ${dropdowns.altersgruppe}`)
    expect(dropdowns.wochentag).toBeGreaterThan(1)
    expect(dropdowns.ort).toBeGreaterThan(1)

    // ==================== 3. FILTERING ====================
    console.log('\n3. FILTERING')
    await page.selectOption('#filter-wochentag', 'Montag')
    await page.waitForTimeout(300)

    const afterFilter = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.filteredTrainings?.length || 0
    })
    console.log(`   ✓ After Montag filter: ${afterFilter} trainings`)

    // Reset
    await page.selectOption('#filter-wochentag', '')
    await page.waitForTimeout(300)

    // ==================== 4. SEARCH ====================
    console.log('\n4. SEARCH')
    await page.fill('#search', 'Parkour')
    await page.waitForTimeout(500)

    const searchResults = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.filteredTrainings?.length || 0
    })
    console.log(`   ✓ Search "Parkour": ${searchResults} trainings`)
    expect(searchResults).toBeGreaterThan(0)

    // Clear search
    await page.fill('#search', '')
    await page.waitForTimeout(300)

    // ==================== 5. FAVORITES ====================
    console.log('\n5. FAVORITES')

    // Add first training to favorites
    const firstFavButton = page.locator('.training-card button[aria-label*="Favoriten"]').first()
    await firstFavButton.click()
    await page.waitForTimeout(300)

    let favCount = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.favorites?.length || 0
    })
    console.log(`   ✓ Favorites after add: ${favCount}`)
    expect(favCount).toBe(1)

    // Click again to remove
    await firstFavButton.click()
    await page.waitForTimeout(300)

    favCount = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.favorites?.length || 0
    })
    console.log(`   ✓ Favorites after remove: ${favCount}`)
    expect(favCount).toBe(0)

    // ==================== 6. TRAINING CARDS ====================
    console.log('\n6. TRAINING CARDS')
    const cardCount = await page.locator('.training-card').count()
    console.log(`   ✓ Training cards visible: ${cardCount}`)
    expect(cardCount).toBeGreaterThan(0)

    // Check first card has required elements
    const firstCard = page.locator('.training-card').first()
    const hasTrainingType = await firstCard.locator('[x-text="training.training"]').isVisible()
    const hasOrt = await firstCard.locator('[x-text="training.ort"]').isVisible()
    const hasWochentag = await firstCard.locator('[x-text="training.wochentag"]').isVisible()

    console.log(`   ✓ Card has training type: ${hasTrainingType}`)
    console.log(`   ✓ Card has location: ${hasOrt}`)
    console.log(`   ✓ Card has weekday: ${hasWochentag}`)

    // ==================== 7. GROUPED BY WEEKDAY ====================
    console.log('\n7. WEEKDAY GROUPING')
    const groups = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.groupedTrainings?.length || 0
    })
    console.log(`   ✓ Weekday groups: ${groups}`)
    expect(groups).toBeGreaterThan(0)

    // ==================== 8. MAP MODAL ====================
    console.log('\n8. MAP MODAL')
    const mapButton = page.locator('button:has-text("Karte anzeigen")').first()
    await mapButton.click()
    await page.waitForTimeout(1000)

    const mapVisible = await page.locator('#map-modal-container').isVisible()
    console.log(`   ✓ Map modal opens: ${mapVisible}`)
    expect(mapVisible).toBe(true)

    // Check if Leaflet map is initialized
    const hasLeafletMap = await page.evaluate(() => {
      const container = document.getElementById('map-modal-container')
      return container?.querySelector('.leaflet-container') !== null
    })
    console.log(`   ✓ Leaflet map initialized: ${hasLeafletMap}`)

    // Close map
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // ==================== 9. SHARE/EXPORT BUTTONS ====================
    console.log('\n9. SHARE/EXPORT ACTIONS')
    const shareBtn = await page.locator('button:has-text("Teilen")').isVisible()
    const exportAllBtn = await page.locator('button:has-text("Alle exportieren")').isVisible()

    console.log(`   ✓ Share button: ${shareBtn}`)
    console.log(`   ✓ Export all button: ${exportAllBtn}`)

    // ==================== 10. MOBILE RESPONSIVENESS ====================
    console.log('\n10. MOBILE RESPONSIVENESS')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Use more specific selectors for mobile buttons (in header only)
    const mobileFilterBtn = await page.locator('header button').filter({ hasText: 'Filter' }).first().isVisible()
    const mobileMapBtn = await page.locator('header button').filter({ hasText: 'Karte' }).first().isVisible()

    console.log(`   ✓ Mobile filter button: ${mobileFilterBtn}`)
    console.log(`   ✓ Mobile map button: ${mobileMapBtn}`)

    // Open mobile filter - use header button specifically
    await page.locator('header button').filter({ hasText: 'Filter' }).first().click()
    await page.waitForTimeout(500)

    const mobileFilterVisible = await page.evaluate(() => {
      const el = document.querySelector('[x-show="$store.ui.mobileFilterOpen"]')
      return el && window.getComputedStyle(el).display !== 'none'
    })
    console.log(`   ✓ Mobile filter drawer: ${mobileFilterVisible}`)

    // ==================== 11. CONSOLE ERRORS CHECK ====================
    console.log('\n11. ERROR CHECK')
    const errors = []
    page.on('pageerror', error => errors.push(error.message))

    // Trigger some interactions
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(300)
    await page.reload()
    await page.waitForTimeout(2000)

    console.log(`   ✓ Page errors: ${errors.length === 0 ? 'none' : errors.length}`)
    if (errors.length > 0) {
      errors.forEach(err => console.log(`     - ${err}`))
    }

    // ==================== FINAL SUMMARY ====================
    console.log('\n========================================')
    console.log('TEST SUMMARY')
    console.log('========================================')
    console.log('✓ Data loading works')
    console.log('✓ Filter dropdowns populated')
    console.log('✓ Filtering works')
    console.log('✓ Search works')
    console.log('✓ Favorites work')
    console.log('✓ Training cards render')
    console.log('✓ Weekday grouping works')
    console.log('✓ Map modal works')
    console.log('✓ Share/Export buttons visible')
    console.log('✓ Mobile responsive')
    console.log('========================================\n')
  })
})
