// tests/e2e/map-view-component.spec.js
// Test for Task 11.4: Map view component in main content area

import { test, expect } from '@playwright/test'

test.describe('Map View Component (Task 11.4)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Set desktop viewport for desktop view tabs
    await page.setViewportSize({ width: 1280, height: 720 })
    // Wait for Alpine to initialize
    await page.waitForFunction(() => window.Alpine !== undefined)
  })

  test('should have map view container in DOM with correct ID', async ({ page }) => {
    // Verify the map view container exists with the correct ID
    const mapViewContainer = page.locator('#map-view-container')
    await expect(mapViewContainer).toHaveCount(1)

    // Verify it's inside a section with map-view class
    const mapViewSection = page.locator('section.map-view')
    await expect(mapViewSection).toHaveCount(1)

    // Verify the container is a child of the section
    const containerInSection = mapViewSection.locator('#map-view-container')
    await expect(containerInSection).toHaveCount(1)
  })

  test('should toggle between list and map views correctly', async ({ page }) => {
    // Wait for app to load
    await page.waitForLoadState('networkidle')

    // Initially should show list view (default)
    const listView = page
      .locator('section')
      .filter({ has: page.locator('article') })
      .first()
    await expect(listView).toBeVisible()

    // Map view should be hidden initially
    const mapView = page.locator('section.map-view')
    await expect(mapView).toBeHidden()

    // Click map tab to switch view (desktop tabs use desktop-view-tab prefix)
    const mapTab = page.locator('[data-testid="desktop-view-tab-map"]')
    await mapTab.click()

    // Wait for Alpine reactivity
    await page.waitForTimeout(500)

    // Now map view should be visible
    await expect(mapView).toBeVisible()

    // List view should be hidden
    const trainingCards = page.locator('article').first()
    await expect(trainingCards).toBeHidden()
  })

  test('should have correct dimensions for map container', async ({ page }) => {
    // Switch to map view (desktop tabs use desktop-view-tab prefix)
    const mapTab = page.locator('[data-testid="desktop-view-tab-map"]')
    await mapTab.click()
    await page.waitForTimeout(500)

    // Get map container
    const mapContainer = page.locator('#map-view-container')
    await expect(mapContainer).toBeVisible()

    // Check that it has full width
    const containerBox = await mapContainer.boundingBox()
    const viewportSize = page.viewportSize()

    expect(containerBox.width).toBeGreaterThan(300) // Minimum reasonable width

    // Check height is close to viewport height minus header (64px)
    // Allow some variance for borders/padding
    const expectedMinHeight = viewportSize.height - 100
    expect(containerBox.height).toBeGreaterThan(expectedMinHeight)
  })

  test('should display all three view sections (list, map, favorites)', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle')

    // All three view tabs should exist (desktop tabs use desktop-view-tab prefix)
    const listTab = page.locator('[data-testid="desktop-view-tab-list"]')
    const mapTab = page.locator('[data-testid="desktop-view-tab-map"]')
    const favoritesTab = page.locator('[data-testid="desktop-view-tab-favorites"]')

    await expect(listTab).toBeVisible()
    await expect(mapTab).toBeVisible()
    await expect(favoritesTab).toBeVisible()

    // Test each view activates correctly
    await listTab.click()
    await page.waitForTimeout(300)
    expect(await listTab.getAttribute('class')).toContain('bg-white')

    await mapTab.click()
    await page.waitForTimeout(300)
    expect(await mapTab.getAttribute('class')).toContain('bg-white')

    await favoritesTab.click()
    await page.waitForTimeout(300)
    expect(await favoritesTab.getAttribute('class')).toContain('bg-white')
  })

  test('should maintain map view state when switching between views', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Switch to map view (desktop tabs use desktop-view-tab prefix)
    const mapTab = page.locator('[data-testid="desktop-view-tab-map"]')
    await mapTab.click()
    await page.waitForTimeout(500)

    // Verify map view is visible
    const mapView = page.locator('section.map-view')
    await expect(mapView).toBeVisible()

    // Switch to list view (desktop tabs use desktop-view-tab prefix)
    const listTab = page.locator('[data-testid="desktop-view-tab-list"]')
    await listTab.click()
    await page.waitForTimeout(500)

    // Map view should be hidden
    await expect(mapView).toBeHidden()

    // Switch back to map view
    await mapTab.click()
    await page.waitForTimeout(500)

    // Map view should be visible again
    await expect(mapView).toBeVisible()

    // Map container should still exist (not destroyed)
    const mapContainer = page.locator('#map-view-container')
    await expect(mapContainer).toHaveCount(1)
  })
})
