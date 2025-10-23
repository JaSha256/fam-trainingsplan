// @ts-check
/**
 * User Workflow Test: Filter Clearing Edge Cases
 * 
 * Tests the exact user workflow to reproduce the "no trainings displayed" bug
 */

import { test, expect } from '@playwright/test'

test.describe('Filter Clearing User Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/fam-trainingsplan/')
    await page.waitForTimeout(2000) // Wait for data load
  })

  test('Scenario 1: Clear filters using "Alle löschen" button', async ({ page }) => {
    console.log('\n=== TEST: Clear filters using UI button ===')
    
    // Apply multiple filters
    console.log('Step 1: Apply weekday filter (Montag)')
    const montagCheckbox = page.locator('input[type="checkbox"][value="Montag"], label:has-text("Montag")').first()
    await montagCheckbox.click()
    await page.waitForTimeout(500)
    
    // Verify filters applied
    let state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      return {
        filtered: data.filteredTrainings.length,
        filters: window.Alpine.store('ui').filters
      }
    })
    console.log('After applying Montag filter:', state)
    expect(state.filtered).toBeGreaterThan(0)
    expect(state.filtered).toBeLessThan(60)
    
    // Find and click "Alle löschen" button
    console.log('Step 2: Click "Alle löschen" button')
    const clearButton = page.locator('button:has-text("Alle löschen")').first()
    const clearExists = await clearButton.count() > 0
    console.log('Clear button exists:', clearExists)
    
    if (clearExists) {
      await clearButton.click()
      await page.waitForTimeout(500)
      
      // Verify all filters cleared
      state = await page.evaluate(() => {
        const app = document.querySelector('[x-data="trainingsplaner()"]')
        const data = window.Alpine.$data(app)
        return {
          all: data.allTrainings.length,
          filtered: data.filteredTrainings.length,
          filters: window.Alpine.store('ui').filters
        }
      })
      console.log('After clearing filters:', state)
      
      // CRITICAL: filteredTrainings should equal allTrainings
      expect(state.filtered).toBe(state.all)
      expect(state.filtered).toBe(60)
      
      // Take screenshot
      await page.screenshot({ 
        path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-scenario1-result.png',
        fullPage: true 
      })
    }
  })

  test('Scenario 2: Apply and remove filter chips', async ({ page }) => {
    console.log('\n=== TEST: Remove individual filter chips ===')
    
    // Apply multiple filters
    console.log('Step 1: Apply multiple filters')
    await page.locator('label:has-text("Montag")').first().click()
    await page.waitForTimeout(300)
    await page.locator('label:has-text("Dienstag")').first().click()
    await page.waitForTimeout(300)
    
    let state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      return {
        filtered: data.filteredTrainings.length,
        chipCount: data.getActiveFilterCount()
      }
    })
    console.log('After applying 2 weekday filters:', state)
    expect(state.chipCount).toBeGreaterThan(0)
    
    // Remove filter chips one by one
    console.log('Step 2: Remove filter chips')
    const removeButtons = page.locator('button[aria-label*="entfernen"]')
    const count = await removeButtons.count()
    console.log('Filter chip remove buttons:', count)
    
    // Remove all chips
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click()
      await page.waitForTimeout(200)
    }
    
    // Verify all filters cleared
    state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      return {
        all: data.allTrainings.length,
        filtered: data.filteredTrainings.length,
        chipCount: data.getActiveFilterCount()
      }
    })
    console.log('After removing all chips:', state)
    
    expect(state.chipCount).toBe(0)
    expect(state.filtered).toBe(state.all)
  })

  test('Scenario 3: Quick filter toggle behavior', async ({ page }) => {
    console.log('\n=== TEST: Quick filter toggle clearing ===')
    
    // Apply quick filter (Heute)
    console.log('Step 1: Apply "Heute" quick filter')
    await page.locator('button:has-text("Heute")').click()
    await page.waitForTimeout(500)
    
    let state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      const filters = window.Alpine.store('ui').filters
      return {
        filtered: data.filteredTrainings.length,
        activeQuickFilter: filters.activeQuickFilter,
        weekdayFilter: filters.wochentag
      }
    })
    console.log('After applying Heute filter:', state)
    expect(state.activeQuickFilter).toBe('heute')
    
    // Toggle off by clicking again
    console.log('Step 2: Toggle off quick filter')
    await page.locator('button:has-text("Heute")').click()
    await page.waitForTimeout(500)
    
    state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      const filters = window.Alpine.store('ui').filters
      return {
        all: data.allTrainings.length,
        filtered: data.filteredTrainings.length,
        activeQuickFilter: filters.activeQuickFilter,
        weekdayFilter: filters.wochentag
      }
    })
    console.log('After toggling off:', state)
    
    expect(state.activeQuickFilter).toBeNull()
    expect(state.filtered).toBe(state.all)
  })

  test('Scenario 4: Combination of filters then clear all', async ({ page }) => {
    console.log('\n=== TEST: Complex filter combination then clear ===')
    
    // Apply multiple types of filters
    console.log('Step 1: Apply weekday, location, and training type filters')
    await page.locator('label:has-text("Montag")').first().click()
    await page.waitForTimeout(200)
    
    // Open location dropdown
    await page.locator('text=Ort').click()
    await page.waitForTimeout(200)
    await page.locator('label:has-text("LTR")').first().click()
    await page.waitForTimeout(200)
    
    // Open training type dropdown
    await page.locator('text=Trainingsart').click()
    await page.waitForTimeout(200)
    await page.locator('label:has-text("Parkour")').first().click()
    await page.waitForTimeout(500)
    
    let state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      return {
        filtered: data.filteredTrainings.length,
        chipCount: data.getActiveFilterCount(),
        filters: window.Alpine.store('ui').filters
      }
    })
    console.log('After applying 3 different filter types:', state)
    expect(state.chipCount).toBeGreaterThanOrEqual(3)
    
    // Clear all
    console.log('Step 2: Clear all filters')
    const clearButton = page.locator('button:has-text("Alle löschen")').first()
    if (await clearButton.count() > 0) {
      await clearButton.click()
      await page.waitForTimeout(500)
    }
    
    state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      return {
        all: data.allTrainings.length,
        filtered: data.filteredTrainings.length,
        chipCount: data.getActiveFilterCount()
      }
    })
    console.log('After clearing all filters:', state)
    
    expect(state.chipCount).toBe(0)
    expect(state.filtered).toBe(state.all)
    expect(state.filtered).toBe(60)
    
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-scenario4-result.png',
      fullPage: true 
    })
  })

  test('Scenario 5: Edge case - Empty array filters', async ({ page }) => {
    console.log('\n=== TEST: Edge case with empty array filters ===')
    
    // Programmatically set filters to empty arrays (simulate edge case)
    await page.evaluate(() => {
      const store = window.Alpine.store('ui')
      store.filters = {
        wochentag: [],
        ort: [],
        training: [],
        altersgruppe: [],
        searchTerm: '',
        activeQuickFilter: null,
        _customTimeFilter: '',
        _customFeatureFilter: '',
        _customLocationFilter: '',
        _customPersonalFilter: ''
      }
    })
    
    await page.waitForTimeout(500)
    
    const state = await page.evaluate(() => {
      const app = document.querySelector('[x-data="trainingsplaner()"]')
      const data = window.Alpine.$data(app)
      return {
        all: data.allTrainings.length,
        filtered: data.filteredTrainings.length,
        hasActiveFilters: data.hasActiveFilters
      }
    })
    console.log('With all empty array filters:', state)
    
    expect(state.hasActiveFilters).toBe(false)
    expect(state.filtered).toBe(state.all)
    expect(state.filtered).toBe(60)
  })
})
