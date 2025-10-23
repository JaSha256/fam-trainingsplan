import { test, expect } from '@playwright/test'

test.describe('Clear All Filters - Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
  })

  test('CRITICAL: Clear all filters should restore all 60 trainings', async ({ page }) => {
    console.log('\n========== TESTING CLEAR FILTERS BUG FIX ==========\n')
    
    // Initial state
    const initial = await page.locator('text=von').first().locator('..').textContent()
    const initialMatch = initial.match(/(\d+)\s*von\s*(\d+)/)
    console.log('Initial: filtered=', initialMatch[1], 'total=', initialMatch[2])
    expect(initialMatch[1]).toBe(initialMatch[2])

    // Apply filter via search (easier than expanding sections)
    const searchInput = page.locator('input[placeholder*="Training"]').first()
    await searchInput.fill('Montag')
    await page.waitForTimeout(1500)

    const filtered = await page.locator('text=von').first().locator('..').textContent()
    const filteredMatch = filtered.match(/(\d+)\s*von\s*(\d+)/)
    console.log('Filtered: filtered=', filteredMatch[1], 'total=', filteredMatch[2])
    expect(filteredMatch[1]).not.toBe(filteredMatch[2])

    // Clear all filters
    await page.locator('button:has-text("Alle löschen")').first().click()
    await page.waitForTimeout(1500)

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/clear-filters-result.png',
      fullPage: true 
    })

    // CRITICAL VALIDATION
    const cleared = await page.locator('text=von').first().locator('..').textContent()
    const clearedMatch = cleared.match(/(\d+)\s*von\s*(\d+)/)
    console.log('Cleared: filtered=', clearedMatch[1], 'total=', clearedMatch[2])
    console.log('Expected: Both should be 60')

    expect(clearedMatch[1]).toBe(clearedMatch[2]) // BUG FIX VALIDATION
    expect(clearedMatch[2]).toBe('60')

    console.log('\n========== TEST PASSED - Fix validated! ==========\n')
  })

  test('should clear search filter', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Training"]').first()
    await searchInput.fill('Parkour')
    await page.waitForTimeout(1500)

    const filtered = await page.locator('text=von').first().locator('..').textContent()
    const filteredMatch = filtered.match(/(\d+)\s*von\s*(\d+)/)
    expect(filteredMatch[1]).not.toBe(filteredMatch[2])

    await page.locator('button:has-text("Alle löschen")').first().click()
    await page.waitForTimeout(1500)

    const cleared = await page.locator('text=von').first().locator('..').textContent()
    const clearedMatch = cleared.match(/(\d+)\s*von\s*(\d+)/)
    expect(clearedMatch[1]).toBe(clearedMatch[2])
    expect(clearedMatch[2]).toBe('60')

    const searchValue = await searchInput.inputValue()
    expect(searchValue).toBe('')
  })

  test('should clear filters multiple times consecutively', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Training"]').first()
    
    // First cycle
    await searchInput.fill('Parkour')
    await page.waitForTimeout(1500)
    let state1 = await page.locator('text=von').first().locator('..').textContent()
    let match1 = state1.match(/(\d+)\s*von\s*(\d+)/)
    expect(match1[1]).not.toBe(match1[2])

    await page.locator('button:has-text("Alle löschen")').first().click()
    await page.waitForTimeout(1500)
    let state2 = await page.locator('text=von').first().locator('..').textContent()
    let match2 = state2.match(/(\d+)\s*von\s*(\d+)/)
    expect(match2[1]).toBe(match2[2])

    // Second cycle
    await searchInput.fill('Trampolin')
    await page.waitForTimeout(1500)
    let state3 = await page.locator('text=von').first().locator('..').textContent()
    let match3 = state3.match(/(\d+)\s*von\s*(\d+)/)
    expect(match3[1]).not.toBe(match3[2])

    await page.locator('button:has-text("Alle löschen")').first().click()
    await page.waitForTimeout(1500)
    let state4 = await page.locator('text=von').first().locator('..').textContent()
    let match4 = state4.match(/(\d+)\s*von\s*(\d+)/)
    expect(match4[1]).toBe(match4[2])

    console.log('Multiple clear cycles: SUCCESS')
  })
})
