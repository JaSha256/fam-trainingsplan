// @ts-check
/**
 * DEBUG TEST: Filter Clearing Issue Investigation
 * 
 * PURPOSE: Investigate why NO trainings are displayed when all filters are cleared
 */

import { test, expect } from '@playwright/test'

test.describe('DEBUG: Filter Clearing Issue', () => {
  test.beforeEach(async ({ page }) => {
    // Capture console logs and errors
    page.on('console', msg => {
      console.log('[BROWSER]:', msg.text())
    })

    page.on('pageerror', error => {
      console.error('[ERROR]:', error.message)
    })

    await page.goto('http://localhost:5173/fam-trainingsplan/')
  })

  test('01 - Initial State Investigation', async ({ page }) => {
    console.log('\n=== STEP 1: WAIT FOR DATA TO LOAD ===')
    await page.waitForTimeout(2000)

    console.log('\n=== STEP 2: CHECK ALPINE INITIALIZATION ===')
    const alpineExists = await page.evaluate(() => {
      return typeof window.Alpine !== 'undefined'
    })
    console.log('Alpine.js loaded:', alpineExists)
    expect(alpineExists).toBe(true)

    console.log('\n=== STEP 3: INSPECT ALPINE STORE STATE ===')
    const storeState = await page.evaluate(() => {
      try {
        const store = window.Alpine.store('ui')
        return {
          filters: store.filters,
          activeView: store.activeView
        }
      } catch (e) {
        return { error: e.message }
      }
    })
    console.log('Store state:', JSON.stringify(storeState, null, 2))

    console.log('\n=== STEP 4: INSPECT COMPONENT DATA ===')
    const componentData = await page.evaluate(() => {
      try {
        const appElement = document.querySelector('[x-data="trainingsplaner()"]')
        if (!appElement) return { error: 'App element not found' }
        
        const alpineData = window.Alpine.$data(appElement)
        
        return {
          allTrainingsLength: alpineData.allTrainings?.length || 0,
          filteredTrainingsLength: alpineData.filteredTrainings?.length || 0,
          loading: alpineData.loading,
          error: alpineData.error,
          hasFilterEngine: typeof alpineData.filterEngine !== 'undefined'
        }
      } catch (e) {
        return { error: e.message }
      }
    })
    console.log('Component data:', JSON.stringify(componentData, null, 2))

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/debug-initial-state.png',
      fullPage: true 
    })

    console.log('\n=== STEP 5: CHECK DOM FOR TRAINING CARDS ===')
    const trainingCardsCount = await page.locator('[data-training-card]').count()
    console.log('Training cards in DOM:', trainingCardsCount)
  })

  test('02 - Filter Clearing Behavior', async ({ page }) => {
    await page.waitForTimeout(2000)

    console.log('\n=== STEP 1: GET INITIAL STATE ===')
    const initialData = await page.evaluate(() => {
      const appElement = document.querySelector('[x-data="trainingsplaner()"]')
      if (!appElement) return {}
      const alpineData = window.Alpine.$data(appElement)
      return {
        allTrainingsLength: alpineData.allTrainings?.length || 0,
        filteredTrainingsLength: alpineData.filteredTrainings?.length || 0,
        filters: window.Alpine.store('ui').filters
      }
    })
    console.log('Initial state:', JSON.stringify(initialData, null, 2))

    console.log('\n=== STEP 2: CLEAR ALL FILTERS PROGRAMMATICALLY ===')
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

    console.log('\n=== STEP 3: INSPECT STATE AFTER CLEARING ===')
    const afterClearData = await page.evaluate(() => {
      const appElement = document.querySelector('[x-data="trainingsplaner()"]')
      if (!appElement) return {}
      const alpineData = window.Alpine.$data(appElement)
      return {
        allTrainingsLength: alpineData.allTrainings?.length || 0,
        filteredTrainingsLength: alpineData.filteredTrainings?.length || 0,
        filters: window.Alpine.store('ui').filters
      }
    })
    console.log('After clearing:', JSON.stringify(afterClearData, null, 2))

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/debug-after-clear.png',
      fullPage: true 
    })

    const trainingCardsCount = await page.locator('[data-training-card]').count()
    console.log('Training cards after clear:', trainingCardsCount)

    console.log('\n=== VALIDATION ===')
    if (afterClearData.filteredTrainingsLength === 0 && afterClearData.allTrainingsLength > 0) {
      console.error('BUG CONFIRMED: filteredTrainings is empty but allTrainings has data!')
      console.error('  allTrainings:', afterClearData.allTrainingsLength)
      console.error('  filteredTrainings:', afterClearData.filteredTrainingsLength)
    } else if (afterClearData.filteredTrainingsLength === afterClearData.allTrainingsLength) {
      console.log('EXPECTED: filteredTrainings equals allTrainings')
    }
  })
})
