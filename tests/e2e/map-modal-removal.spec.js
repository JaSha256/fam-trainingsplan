// tests/e2e/map-modal-removal.spec.js
// Test for Task 11.1: Verify map modal has been removed from index.html

import { test, expect } from '@playwright/test'

test.describe('Map Modal Removal (Task 11.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for Alpine to initialize
    await page.waitForFunction(() => window.Alpine !== undefined)
  })

  test('should not have map modal container in DOM', async ({ page }) => {
    // Verify the old modal container doesn't exist
    const modalContainer = page.locator('#map-modal-container')
    await expect(modalContainer).toHaveCount(0)
  })

  test('should not have map modal overlay/backdrop', async ({ page }) => {
    // Check that the modal overlay with specific transition classes doesn't exist
    const modalOverlay = page.locator('.fixed.inset-0.bg-black\\/80.z-50')
      .filter({ has: page.locator('#map-modal-container') })
    await expect(modalOverlay).toHaveCount(0)
  })

  test('should not throw errors when app loads', async ({ page }) => {
    // Capture console errors
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // All console errors should be considered critical
    expect(errors).toHaveLength(0)
  })

  test('should still display training list correctly', async ({ page }) => {
    // Wait for data to load
    await page.waitForFunction(() => {
      const store = window.Alpine?.store('ui')
      return store && store.allTrainings && store.allTrainings.length > 0
    }, { timeout: 10000 })

    // Check that training cards are displayed
    const trainingCards = page.locator('article')
    const count = await trainingCards.count()

    expect(count).toBeGreaterThan(0)
  })

  test('should not have modal header with map title', async ({ page }) => {
    // The modal header contained "Trainings auf Karte" text
    const modalHeader = page.locator('.text-xl.font-bold')
      .filter({ hasText: 'Trainings auf Karte' })

    await expect(modalHeader).toHaveCount(0)
  })

  test('map modal buttons should still exist (for future refactoring)', async ({ page }) => {
    // Map buttons in mobile header and sidebar should still exist
    // They will be refactored in later tasks to work with the new view system

    // Check that at least one map button exists in the DOM (may not be visible depending on viewport)
    const mapButtons = page.locator('button').filter({ hasText: 'Karte' })
    const buttonCount = await mapButtons.count()

    expect(buttonCount).toBeGreaterThan(0)
  })
})
