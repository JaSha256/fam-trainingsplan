// tests/e2e/marker-cluster-validation.spec.js
// E2E Test to verify Leaflet MarkerClusterGroup error is fixed
// Expected: No "L.MarkerClusterGroup is not a constructor" errors

import { test, expect } from '@playwright/test'

test.describe('MarkerClusterGroup Error Validation', () => {
  test('should load map view without MarkerClusterGroup constructor errors', async ({ page }) => {
    const consoleErrors = []
    const consoleWarnings = []
    
    // Capture all console messages
    page.on('console', msg => {
      const text = msg.text()
      if (msg.type() === 'error') {
        consoleErrors.push(text)
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text)
      }
    })

    // Navigate to app
    await page.goto('http://localhost:4173/fam-trainingsplan/')
    
    // Take screenshot of initial state
    await page.waitForLoadState('networkidle')
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/01-initial-load.png',
      fullPage: true 
    })
    
    // Wait for Alpine.js to initialize
    await page.waitForSelector('[x-data]', { state: 'attached', timeout: 5000 })
    
    // Switch to map view
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map'
      }
    })
    
    // Wait for map container to be visible
    await page.waitForSelector('#map-view-container', { state: 'visible', timeout: 5000 })
    
    // Wait for map to initialize
    await page.waitForTimeout(2000)
    
    // Wait for tiles to load
    await page.waitForSelector('.leaflet-tile-loaded', { state: 'visible', timeout: 10000 })
    
    // Wait for markers to appear
    await page.waitForSelector('.leaflet-marker-icon, .marker-cluster', { timeout: 10000 })
    
    // Take screenshot of map view
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/02-map-view.png',
      fullPage: true 
    })
    
    // Check for specific MarkerClusterGroup error
    const clusterErrors = consoleErrors.filter(err => 
      err.includes('MarkerClusterGroup') || 
      err.includes('is not a constructor')
    )
    
    // Verify map elements are present
    const mapState = await page.evaluate(() => {
      const map = document.querySelector('.leaflet-container')
      const tiles = document.querySelectorAll('.leaflet-tile-loaded')
      const markers = document.querySelectorAll('.leaflet-marker-icon, .marker-cluster')
      
      return {
        mapExists: map !== null,
        tileCount: tiles.length,
        markerCount: markers.length,
        mapClasses: map ? map.className : ''
      }
    })
    
    // Log results
    console.log('Console Errors:', consoleErrors)
    console.log('Console Warnings:', consoleWarnings)
    console.log('Map State:', mapState)
    
    // Assertions
    expect(clusterErrors.length).toBe(0)
    expect(mapState.mapExists).toBe(true)
    expect(mapState.tileCount).toBeGreaterThan(0)
    expect(mapState.markerCount).toBeGreaterThan(0)
    
    // Log success message
    if (clusterErrors.length === 0) {
      console.log('✓ SUCCESS: No MarkerClusterGroup errors detected')
    }
  })
  
  test('should handle marker clicks without errors', async ({ page }) => {
    const consoleErrors = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Navigate and switch to map view
    await page.goto('http://localhost:4173/fam-trainingsplan/')
    await page.waitForSelector('[x-data]', { state: 'attached' })
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map'
      }
    })
    
    // Wait for map to load
    await page.waitForSelector('.leaflet-marker-icon, .marker-cluster', { timeout: 10000 })
    await page.waitForTimeout(1000)
    
    // Click first marker or cluster
    const marker = page.locator('.leaflet-marker-icon, .marker-cluster').first()
    await marker.click()
    
    // Wait for interaction to complete
    await page.waitForTimeout(1000)
    
    // Take screenshot after click
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/03-marker-click.png',
      fullPage: true 
    })
    
    // Check for errors
    const clusterErrors = consoleErrors.filter(err => 
      err.includes('MarkerClusterGroup') || 
      err.includes('is not a constructor')
    )
    
    expect(clusterErrors.length).toBe(0)
    console.log('✓ SUCCESS: Marker click handled without errors')
  })
})
