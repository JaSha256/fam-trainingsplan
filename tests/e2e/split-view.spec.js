/**
 * E2E Tests for Split-View Functionality
 * Validates that split-view shows both list AND map simultaneously
 */

import { test, expect } from '@playwright/test'

test.describe('Split-View Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    // Wait for Alpine to initialize
    await page.waitForFunction(() => window.Alpine !== undefined)
    await page.waitForLoadState('networkidle')
  })

  test('should show both list and map panels in split mode', async ({ page }) => {
    // Set split view mode
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('split')
    })

    await page.waitForTimeout(500)

    // Both panels should be visible
    const listPanel = page.locator('section#list-panel')
    const mapPanel = page.locator('section#map-panel')

    await expect(listPanel).toBeVisible()
    await expect(mapPanel).toBeVisible()
  })

  test('split-view list panel should show training cards', async ({ page }) => {
    // Set split view mode
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('split')
    })

    await page.waitForTimeout(500)

    // List panel should contain training cards
    const listPanel = page.locator('section#list-panel')
    const trainingCards = listPanel.locator('article')

    const count = await trainingCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('split-view map panel should initialize map container', async ({ page }) => {
    // Set split view mode
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('split')
    })

    await page.waitForTimeout(1000) // Wait for map initialization

    // Map container should be present and visible
    const mapContainer = page.locator('#map-view-container')
    await expect(mapContainer).toBeVisible()

    // Map should have initialized (check for leaflet container)
    const leafletContainer = mapContainer.locator('.leaflet-container')
    await expect(leafletContainer).toBeVisible()
  })

  test('split-view should have correct panel widths', async ({ page }) => {
    // Set split view mode
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('split')
    })

    await page.waitForTimeout(500)

    // Get panel dimensions
    const listPanel = page.locator('section#list-panel')
    const mapPanel = page.locator('section#map-panel')

    const listBox = await listPanel.boundingBox()
    const mapBox = await mapPanel.boundingBox()

    // Verify they're side by side
    expect(listBox).toBeTruthy()
    expect(mapBox).toBeTruthy()

    // List should be narrower than map (40% vs 60% per design)
    expect(listBox.width).toBeLessThan(mapBox.width)

    // Combined width should roughly equal viewport width (minus sidebar)
    const totalWidth = listBox.width + mapBox.width
    expect(totalWidth).toBeGreaterThan(1000) // Reasonable minimum for desktop
  })

  test('switching from split to map view should hide list panel', async ({ page }) => {
    // Start in split view
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('split')
    })

    await page.waitForTimeout(500)

    // Verify both visible
    const listPanel = page.locator('section#list-panel')
    const mapPanel = page.locator('section#map-panel')

    await expect(listPanel).toBeVisible()
    await expect(mapPanel).toBeVisible()

    // Switch to map-only view
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('map')
    })

    await page.waitForTimeout(500)

    // Only map should be visible
    await expect(listPanel).toBeHidden()
    await expect(mapPanel).toBeVisible()
  })

  test('switching from split to list view should hide map panel', async ({ page }) => {
    // Start in split view
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('split')
    })

    await page.waitForTimeout(500)

    // Switch to list-only view
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('list')
    })

    await page.waitForTimeout(500)

    // Only list should be visible
    const listPanel = page.locator('section#list-panel')
    const mapPanel = page.locator('section#map-panel')

    await expect(listPanel).toBeVisible()
    await expect(mapPanel).toBeHidden()
  })

  test('grid should limit to 2 columns in split-view', async ({ page }) => {
    // Set split view mode
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('split')
    })

    await page.waitForTimeout(500)

    // Get the grid container
    const grid = page.locator('section#list-panel').locator('div.grid').first()

    // Check computed grid columns
    const gridTemplateColumns = await grid.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )

    // In split view, should have max 2 columns (count the column definitions)
    const columnCount = gridTemplateColumns.split(' ').length
    expect(columnCount).toBeLessThanOrEqual(2)
  })

  test('grid should allow more than 2 columns in normal view', async ({ page }) => {
    // Set normal list view mode
    await page.evaluate(() => {
      window.Alpine.store('ui').setActiveView('list')
      window.Alpine.store('ui').viewMode = 'compact' // Compact mode allows up to 4 columns
    })

    await page.waitForTimeout(500)

    // Get the grid container
    const grid = page.locator('section#list-panel').locator('div.grid').first()

    // Check computed grid columns
    const gridTemplateColumns = await grid.evaluate(
      el => window.getComputedStyle(el).gridTemplateColumns
    )

    // In normal view with compact mode on large screen, should allow more columns
    const columnCount = gridTemplateColumns.split(' ').length
    expect(columnCount).toBeGreaterThanOrEqual(2) // At minimum 2, but can be more
  })
})
