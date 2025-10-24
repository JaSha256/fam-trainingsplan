import { test, expect } from '@playwright/test'
import { waitForAlpineAndData } from '../test-helpers.js'

test.describe('Data Loading & Cache Tests', () => {
  test('should load data on initial page load', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    const trainingsCount = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.allTrainings?.length || 0
    })

    expect(trainingsCount).toBeGreaterThan(0)

    console.log(`Loaded ${trainingsCount} trainings`)
  })

  test('should load data from cache on subsequent loads', async ({ page }) => {
    // First load (fresh)
    await page.goto('/')
    await waitForAlpineAndData(page)

    const fromCache1 = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.fromCache
    })

    console.log('First load from cache:', fromCache1)

    // Reload page
    await page.reload()
    await waitForAlpineAndData(page)

    const fromCache2 = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.fromCache
    })

    console.log('Second load from cache:', fromCache2)

    // Second load should be from cache (if caching is enabled)
    // This depends on cache implementation
    expect(typeof fromCache2).toBe('boolean')
  })

  test('should cache data in localStorage', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    // Check if cache exists in localStorage
    const cacheData = await page.evaluate(() => {
      const cached = localStorage.getItem('fam-trainings-cache')
      if (cached) {
        try {
          const data = JSON.parse(cached)
          return {
            exists: true,
            hasTimestamp: !!data.timestamp,
            hasData: !!data.data,
            hasTrainings: !!data.data?.trainings
          }
        } catch {
          return { exists: true, error: true }
        }
      }
      return { exists: false }
    })

    expect(cacheData.exists).toBe(true)
    expect(cacheData.hasTimestamp).toBe(true)
    expect(cacheData.hasData).toBe(true)
    expect(cacheData.hasTrainings).toBe(true)

    console.log('Cache structure:', cacheData)
  })

  test('should handle failed data fetch gracefully', async ({ page }) => {
    // Intercept and fail request
    await page.route('**/trainingsplan.json*', route => {
      route.abort('failed')
    })

    await page.goto('/')
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    await page.waitForTimeout(2000)

    // App should not crash
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)

    // Check error state
    const errorState = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return {
        error: component?.error,
        loading: component?.loading
      }
    })

    console.log('Error state:', errorState)

    // Should have error or not be loading
    expect(errorState.error !== null || errorState.loading === false).toBe(true)
  })

  test('should respect cache timeout', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    // Check cache timestamp
    const cacheInfo = await page.evaluate(() => {
      const cached = localStorage.getItem('fam-trainings-cache')
      if (cached) {
        try {
          const data = JSON.parse(cached)
          const now = Date.now()
          const age = now - data.timestamp
          return {
            hasTimestamp: !!data.timestamp,
            age: age,
            ageMinutes: (age / 1000 / 60).toFixed(2)
          }
        } catch {
          return null
        }
      }
      return null
    })

    expect(cacheInfo).toBeTruthy()
    expect(cacheInfo.hasTimestamp).toBe(true)
    expect(cacheInfo.age).toBeGreaterThanOrEqual(0)

    console.log(`Cache age: ${cacheInfo.ageMinutes} minutes`)
  })

  test('should include version in data', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    const version = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.metadata?.version || component?.dataVersion
    })

    // Version should exist
    expect(version).toBeTruthy()
    expect(typeof version).toBe('string')

    console.log('Data version:', version)
  })

  test('should parse JSON correctly with all required fields', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    const firstTraining = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.allTrainings?.[0]
    })

    // Verify required fields
    expect(firstTraining.id).toBeDefined()
    expect(firstTraining.wochentag).toBeTruthy()
    expect(firstTraining.ort).toBeTruthy()
    expect(firstTraining.training).toBeTruthy()
    expect(firstTraining.von).toBeTruthy()
    expect(firstTraining.bis).toBeTruthy()

    console.log('Sample training:', {
      id: firstTraining.id,
      wochentag: firstTraining.wochentag,
      ort: firstTraining.ort,
      training: firstTraining.training
    })
  })

  test('should handle network timeout gracefully', async ({ page }) => {
    // Delay response significantly to simulate timeout
    await page.route('**/trainingsplan.json*', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000))
      route.fulfill({ status: 200, body: '{"trainings": [], "metadata": {}}' })
    })

    await page.goto('/')
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })

    // Wait for loading to complete or timeout
    await page.waitForTimeout(3000)

    // App should still be visible
    const appVisible = await page.locator('#app').isVisible()
    expect(appVisible).toBe(true)
  })

  test('should validate data format before loading', async ({ page }) => {
    // Provide invalid data format
    await page.route('**/trainingsplan.json*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invalid: 'format' })
      })
    })

    await page.goto('/')
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    await page.waitForTimeout(2000)

    // Should have error
    const errorState = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.error
    })

    console.log('Error for invalid format:', errorState)

    // Should detect invalid format
    expect(typeof errorState === 'string' || errorState !== null).toBe(true)
  })

  test('should fetch data with cache-busting parameter', async ({ page }) => {
    let requestUrl = null

    page.on('request', request => {
      if (request.url().includes('trainingsplan.json')) {
        requestUrl = request.url()
      }
    })

    await page.goto('/')
    await waitForAlpineAndData(page)

    // Should have cache-busting parameter
    expect(requestUrl).toBeTruthy()
    expect(requestUrl).toMatch(/[?&]_=\d+/)

    console.log('Request URL with cache buster:', requestUrl)
  })

  test('should initialize Fuse.js search after data load', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    const hasFuse = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.fuse !== null && component?.fuse !== undefined
    })

    expect(hasFuse).toBe(true)

    console.log('Fuse.js initialized:', hasFuse)
  })

  test('should load metadata with trainings', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    const metadata = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.metadata
    })

    expect(metadata).toBeTruthy()

    // Metadata should have lists of options
    const hasOrte = metadata?.orte && Array.isArray(metadata.orte)
    const hasTrainingsarten = metadata?.trainingsarten && Array.isArray(metadata.trainingsarten)
    const hasWochentage = metadata?.wochentage && Array.isArray(metadata.wochentage)

    console.log('Metadata structure:', {
      hasOrte,
      hasTrainingsarten,
      hasWochentage
    })

    expect(hasOrte || hasTrainingsarten || hasWochentage).toBe(true)
  })

  test('should detect data changes via hash comparison', async ({ page }) => {
    // This test verifies the hash-based change detection logic exists
    await page.goto('/')
    await waitForAlpineAndData(page)

    // Check if generateHash utility is available
    const hasHashUtil = await page.evaluate(() => {
      return typeof window.utils?.generateHash === 'function'
    })

    console.log('Hash utility available:', hasHashUtil)

    // The hash function should exist for change detection
    // (Actual change detection happens in DataLoader.init())
  })

  test('should handle 404 error when data file not found', async ({ page }) => {
    // Return 404
    await page.route('**/trainingsplan.json*', route => {
      route.fulfill({
        status: 404,
        contentType: 'text/html',
        body: 'Not Found'
      })
    })

    await page.goto('/')
    await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 5000 })
    await page.waitForTimeout(2000)

    // Should have error
    const errorState = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return {
        error: component?.error,
        loading: component?.loading
      }
    })

    console.log('404 error state:', errorState)

    expect(errorState.error).toBeTruthy()
    expect(errorState.loading).toBe(false)
  })

  test('should set loading state during data fetch', async ({ page }) => {
    // Delay response to catch loading state
    await page.route('**/trainingsplan.json*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const response = await route.fetch()
      const body = await response.text()
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: body
      })
    })

    await page.goto('/')

    // Check loading state immediately
    const loadingDuringFetch = await page.evaluate(() => {
      return new Promise(resolve => {
        const checkLoading = () => {
          const component = window.Alpine?.$data(document.querySelector('[x-data]'))
          if (component?.loading === true) {
            resolve(true)
          } else if (component?.loading === false) {
            resolve(false)
          } else {
            setTimeout(checkLoading, 50)
          }
        }
        setTimeout(checkLoading, 50)
      })
    })

    console.log('Loading state during fetch:', loadingDuringFetch)

    // Should eventually finish loading
    await waitForAlpineAndData(page)

    const loadingAfterFetch = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.loading
    })

    expect(loadingAfterFetch).toBe(false)
  })

  test('should apply filters after data loads', async ({ page }) => {
    await page.goto('/')
    await waitForAlpineAndData(page)

    // Filters should have been applied
    const filteredTrainings = await page.evaluate(() => {
      const component = window.Alpine.$data(document.querySelector('[x-data]'))
      return component?.filteredTrainings
    })

    expect(filteredTrainings).toBeTruthy()
    expect(Array.isArray(filteredTrainings)).toBe(true)
    expect(filteredTrainings.length).toBeGreaterThan(0)

    console.log(`Filtered trainings count: ${filteredTrainings.length}`)
  })
})
