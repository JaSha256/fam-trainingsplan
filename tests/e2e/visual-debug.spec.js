// tests/e2e/visual-debug.spec.js
/**
 * Debug Test for Visual Regression Fix
 * Tests if route mocking and data loading work correctly
 */

import { test, expect } from '@playwright/test'
import { setupTestDataMocking } from './test-helpers.js'

test('debug: test fixture mocking works', async ({ page }) => {
  // Setup route mocking
  await setupTestDataMocking(page)

  // Navigate to app
  await page.goto('/')

  // Wait a bit for page to load
  await page.waitForTimeout(2000)

  // Check if Alpine.js exists
  const hasAlpine = await page.evaluate(() => window.Alpine !== undefined)
  console.log('Alpine.js loaded:', hasAlpine)

  // Check if x-data element exists
  const hasXData = await page.evaluate(() => {
    const el = document.querySelector('[x-data]')
    return el !== null
  })
  console.log('x-data element exists:', hasXData)

  // Check component data
  const componentData = await page.evaluate(() => {
    const el = document.querySelector('[x-data]')
    if (!el) return null
    return window.Alpine?.$data(el)
  })
  console.log('Component allTrainings length:', componentData?.allTrainings?.length || 0)
  console.log('Component loading state:', componentData?.loading)
  console.log('Component error:', componentData?.error)

  // Check DOM for training cards
  const cardCount = await page.evaluate(() => {
    return document.querySelectorAll('.training-card, article').length
  })
  console.log('Training cards in DOM:', cardCount)

  // Take a screenshot
  await page.screenshot({ path: 'test-results/debug-screenshot.png', fullPage: true })

  expect(hasAlpine).toBe(true)
  expect(hasXData).toBe(true)
})
