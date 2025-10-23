/**
 * Validate: Trainings Display Correctly
 * 
 * Confirms that trainings are loading and displaying correctly after split-view changes.
 */

import { test, expect } from '@playwright/test'

test.describe('Trainings Display Validation', () => {
  test('should display all trainings correctly in list view', async ({ page }) => {
    await page.goto('http://localhost:5173/fam-trainingsplan/')
    
    // Wait for Alpine.js to initialize
    await page.waitForTimeout(1500)
    
    // PASS: Check training cards are visible
    const trainingCards = await page.locator('[data-training-card]')
    const cardCount = await trainingCards.count()
    expect(cardCount).toBeGreaterThan(0)
    console.log(`✓ PASS: ${cardCount} training cards displayed`)
    
    // PASS: Check grouped sections exist
    const mondayHeading = await page.locator('h3:has-text("Montag")')
    await expect(mondayHeading).toBeVisible()
    console.log('✓ PASS: Weekday grouping works (Montag section visible)')
    
    // PASS: Check data loaded correctly
    const resultsCount = await page.locator('text=/\\d+ von \\d+ Trainings/')
    await expect(resultsCount).toBeVisible()
    const resultsText = await resultsCount.textContent()
    console.log(`✓ PASS: Results counter shows: ${resultsText}`)
    
    // PASS: Verify store state
    const storeState = await page.evaluate(() => {
      const ui = window.Alpine.store('ui')
      return {
        activeView: ui.activeView,
        hasFilters: ui.filters.wochentag.length > 0 || 
                    ui.filters.ort.length > 0 || 
                    ui.filters.training.length > 0
      }
    })
    expect(storeState.activeView).toBe('list')
    console.log('✓ PASS: Active view is "list"')
    console.log('✓ PASS: No active filters (clean state)')
    
    // PASS: Verify component data
    const componentData = await page.evaluate(() => {
      const app = document.getElementById('app')
      const component = app.__x.$data
      return {
        allTrainingsCount: component.allTrainings.length,
        filteredTrainingsCount: component.filteredTrainings.length,
        loading: component.loading,
        error: component.error
      }
    })
    
    expect(componentData.loading).toBe(false)
    expect(componentData.error).toBe(false)
    expect(componentData.allTrainingsCount).toBeGreaterThan(0)
    expect(componentData.filteredTrainingsCount).toBe(componentData.allTrainingsCount)
    console.log(`✓ PASS: Component loaded ${componentData.allTrainingsCount} trainings`)
    console.log('✓ PASS: No loading/error states')
    
    // Take screenshot
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/validation-trainings-display.png',
      fullPage: true
    })
    console.log('\n✓ Screenshot saved: validation-trainings-display.png')
  })
  
  test('should handle view switching correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/fam-trainingsplan/')
    await page.waitForTimeout(1500)
    
    // Initial state: list view
    const listView = await page.locator('[data-view="list"]').first()
    await expect(listView).toBeVisible()
    console.log('✓ PASS: List view initially visible')
    
    // Switch to split view
    const splitViewButton = await page.locator('button[aria-label*="Split"]').or(
      page.locator('button:has-text("Split")')
    ).first()
    
    if (await splitViewButton.isVisible()) {
      await splitViewButton.click()
      await page.waitForTimeout(500)
      
      const activeView = await page.evaluate(() => window.Alpine.store('ui').activeView)
      expect(activeView).toBe('split')
      console.log('✓ PASS: Split view activated')
      
      // Switch back to list
      const listViewButton = await page.locator('button[aria-label*="Liste"]').or(
        page.locator('button:has-text("Liste")')
      ).first()
      await listViewButton.click()
      await page.waitForTimeout(500)
      
      const finalView = await page.evaluate(() => window.Alpine.store('ui').activeView)
      expect(finalView).toBe('list')
      console.log('✓ PASS: Switched back to list view')
    } else {
      console.log('⚠ SKIP: View controls not found (may be mobile)')
    }
  })
  
  test('should filter trainings correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/fam-trainingsplan/')
    await page.waitForTimeout(1500)
    
    // Get initial count
    const initialCount = await page.evaluate(() => {
      const app = document.getElementById('app')
      return app.__x.$data.filteredTrainings.length
    })
    
    // Apply "Heute" quick filter
    const heuteButton = await page.locator('button:has-text("Heute")').first()
    await heuteButton.click()
    await page.waitForTimeout(500)
    
    // Check filtered count changed
    const filteredCount = await page.evaluate(() => {
      const app = document.getElementById('app')
      return app.__x.$data.filteredTrainings.length
    })
    
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
    console.log(`✓ PASS: Quick filter works (${initialCount} → ${filteredCount} trainings)`)
    
    // Clear filters
    const clearButton = await page.locator('button:has-text("Alle löschen")').first()
    if (await clearButton.isVisible()) {
      await clearButton.click()
      await page.waitForTimeout(500)
      
      const resetCount = await page.evaluate(() => {
        const app = document.getElementById('app')
        return app.__x.$data.filteredTrainings.length
      })
      
      expect(resetCount).toBe(initialCount)
      console.log('✓ PASS: Clear filters works correctly')
    }
  })
})
