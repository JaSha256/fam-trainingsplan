// Feature Testing - Comprehensive check
import { test, expect } from '@playwright/test'

test.describe('Feature Testing', () => {
  test('comprehensive feature check', async ({ page }) => {
    // Collect all console messages
    const consoleMessages = []
    const errors = []

    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`)
    })

    page.on('pageerror', error => {
      errors.push(error.message)
    })

    // Navigate
    await page.goto('/')
    console.log('✓ Page loaded')

    // Wait for Alpine
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    console.log('✓ Alpine.js loaded')

    // Wait for data to load
    await page.waitForFunction(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.loading === false && component?.allTrainings?.length > 0
    }, { timeout: 10000 })
    console.log('✓ Data loaded')

    // Wait for cards to render
    await page.waitForSelector('.training-card', { state: 'visible', timeout: 5000 })

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-initial-load.png', fullPage: true })
    console.log('✓ Screenshot: Initial load')

    // ==================== TEST 1: Filter Dropdowns ====================
    console.log('\n===== TEST 1: Filter Dropdowns =====')

    const wochentagOptions = await page.locator('#filter-wochentag option').count()
    const ortOptions = await page.locator('#filter-ort option').count()
    const trainingOptions = await page.locator('#filter-training option').count()
    const altersgruppeOptions = await page.locator('#filter-altersgruppe option').count()

    console.log(`Wochentag options: ${wochentagOptions}`)
    console.log(`Ort options: ${ortOptions}`)
    console.log(`Training options: ${trainingOptions}`)
    console.log(`Altersgruppe options: ${altersgruppeOptions}`)

    // ==================== TEST 2: Filtering ====================
    console.log('\n===== TEST 2: Filtering =====')

    await page.selectOption('#filter-wochentag', 'Montag')
    await page.waitForTimeout(500)

    const mondayCards = await page.locator('.training-card').count()
    console.log(`Cards after Montag filter: ${mondayCards}`)

    await page.screenshot({ path: 'test-results/02-filter-monday.png', fullPage: true })
    console.log('✓ Screenshot: Monday filter')

    // Reset filter
    await page.selectOption('#filter-wochentag', '')
    await page.waitForTimeout(500)

    // ==================== TEST 3: Search ====================
    console.log('\n===== TEST 3: Search =====')

    await page.fill('#search', 'Parkour')
    await page.waitForTimeout(500)

    const searchResults = await page.locator('.training-card').count()
    console.log(`Cards after "Parkour" search: ${searchResults}`)

    await page.screenshot({ path: 'test-results/03-search-parkour.png', fullPage: true })
    console.log('✓ Screenshot: Search parkour')

    // Clear search
    await page.fill('#search', '')
    await page.waitForTimeout(500)

    // ==================== TEST 4: Favorites ====================
    console.log('\n===== TEST 4: Favorites =====')

    // Click first favorite button
    const firstFavButton = page.locator('.training-card button[aria-label*="Favoriten"]').first()
    await firstFavButton.click()
    await page.waitForTimeout(300)

    const favoritesCount = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return component?.favorites?.length || 0
    })
    console.log(`Favorites count: ${favoritesCount}`)

    await page.screenshot({ path: 'test-results/04-favorites.png', fullPage: true })
    console.log('✓ Screenshot: Favorites')

    // ==================== TEST 5: Map Modal ====================
    console.log('\n===== TEST 5: Map Modal =====')

    // Open map on desktop
    const mapButton = page.locator('button:has-text("Karte anzeigen")').first()
    await mapButton.click()
    await page.waitForTimeout(1000)

    const mapVisible = await page.locator('#map-modal-container').isVisible()
    console.log(`Map modal visible: ${mapVisible}`)

    await page.screenshot({ path: 'test-results/05-map-modal.png', fullPage: false })
    console.log('✓ Screenshot: Map modal')

    // Close map
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)

    // ==================== TEST 6: Mobile Filter ====================
    console.log('\n===== TEST 6: Mobile View =====')

    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    await page.screenshot({ path: 'test-results/06-mobile-view.png', fullPage: true })
    console.log('✓ Screenshot: Mobile view')

    // Open mobile filter
    const mobileFilterButton = page.locator('button:has-text("Filter")').first()
    await mobileFilterButton.click()
    await page.waitForTimeout(500)

    await page.screenshot({ path: 'test-results/07-mobile-filter.png', fullPage: true })
    console.log('✓ Screenshot: Mobile filter')

    // ==================== TEST 7: Export Buttons ====================
    console.log('\n===== TEST 7: Export/Share Actions =====')

    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    const shareButton = await page.locator('button:has-text("Teilen")').isVisible()
    const exportButton = await page.locator('button:has-text("Alle exportieren")').isVisible()

    console.log(`Share button visible: ${shareButton}`)
    console.log(`Export button visible: ${exportButton}`)

    // ==================== TEST 8: Training Card Details ====================
    console.log('\n===== TEST 8: Training Card Details =====')

    const firstCard = page.locator('.training-card').first()
    const cardDetails = await firstCard.evaluate(el => {
      const training = el.querySelector('[x-text="training.training"]')?.textContent
      const ort = el.querySelector('[x-text="training.ort"]')?.textContent
      const wochentag = el.querySelector('[x-text="training.wochentag"]')?.textContent
      const anmeldenButton = el.querySelector('a:has-text("Anmelden")')

      return {
        training,
        ort,
        wochentag,
        hasAnmeldenButton: !!anmeldenButton
      }
    })

    console.log('First card details:', cardDetails)

    // ==================== Final State ====================
    console.log('\n===== Final Alpine State =====')

    const finalState = await page.evaluate(() => {
      const component = window.Alpine?.$data(document.querySelector('[x-data]'))
      return {
        allTrainings: component?.allTrainings?.length || 0,
        filteredTrainings: component?.filteredTrainings?.length || 0,
        favorites: component?.favorites?.length || 0,
        metadata: component?.metadata ? Object.keys(component.metadata) : null,
        loading: component?.loading,
        error: component?.error,
        hasActiveFilters: component?.hasActiveFilters,
        groupedTrainings: component?.groupedTrainings?.length || 0
      }
    })

    console.log(JSON.stringify(finalState, null, 2))

    // ==================== Console Errors ====================
    console.log('\n===== Console Errors =====')
    const errorMessages = consoleMessages.filter(msg => msg.includes('[error]'))
    if (errorMessages.length > 0) {
      console.log('ERRORS FOUND:')
      errorMessages.forEach(err => console.log(err))
    } else {
      console.log('No errors found ✓')
    }

    if (errors.length > 0) {
      console.log('\nPAGE ERRORS:')
      errors.forEach(err => console.log(err))
    }

    // ==================== Missing Features Check ====================
    console.log('\n===== Missing Features Check =====')

    const featureChecks = await page.evaluate(() => {
      return {
        hasQuickFilterFavorites: !!document.querySelector('button:has-text("Favoriten")'),
        hasShareButton: !!document.querySelector('button:has-text("Teilen")'),
        hasExportAllButton: !!document.querySelector('button:has-text("Alle exportieren")'),
        hasMapButton: !!document.querySelector('button:has-text("Karte")'),
        hasFilterResetButton: !!document.querySelector('button:has-text("Filter zurücksetzen")'),
        hasSearchField: !!document.querySelector('#search'),
        hasUpdateNotification: !!document.querySelector('[x-show="updateAvailable"]'),
        hasNotificationToast: !!document.querySelector('[data-notification]')
      }
    })

    console.log(JSON.stringify(featureChecks, null, 2))
  })
})
