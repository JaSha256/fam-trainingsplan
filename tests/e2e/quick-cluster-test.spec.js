// Quick test to capture console errors
import { test, expect } from '@playwright/test'

test('capture console errors on map load', async ({ page }) => {
  const errors = []
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  await page.goto('http://localhost:4173/fam-trainingsplan/')
  await page.waitForLoadState('networkidle')
  
  // Take initial screenshot
  await page.screenshot({ path: 'test-results/01-initial.png', fullPage: true })
  
  // Wait for Alpine
  try {
    await page.waitForSelector('[x-data]', { timeout: 5000 })
  } catch (e) {
    console.log('Alpine not loaded:', e.message)
  }
  
  // Try to switch to map view
  await page.evaluate(() => {
    console.log('Alpine available:', typeof window.Alpine !== 'undefined')
    console.log('Store available:', window.Alpine ? typeof window.Alpine.store('ui') !== 'undefined' : false)
    
    if (window.Alpine && window.Alpine.store('ui')) {
      window.Alpine.store('ui').activeView = 'map'
    }
  }).catch(e => console.log('Error switching view:', e))
  
  await page.waitForTimeout(3000)
  
  // Take map screenshot
  await page.screenshot({ path: 'test-results/02-map-attempt.png', fullPage: true })
  
  // Check map state
  const mapInfo = await page.evaluate(() => {
    const container = document.querySelector('#map-view-container')
    const map = document.querySelector('.leaflet-container')
    const markers = document.querySelectorAll('.leaflet-marker-icon, .marker-cluster')
    
    return {
      containerExists: container !== null,
      containerVisible: container ? getComputedStyle(container).display !== 'none' : false,
      mapExists: map !== null,
      markerCount: markers.length,
      leafletLoaded: typeof window.L !== 'undefined',
      clusterLoaded: window.L ? typeof window.L.MarkerClusterGroup !== 'undefined' : false
    }
  })
  
  console.log('=== CONSOLE ERRORS ===')
  errors.forEach(err => console.log('ERROR:', err))
  
  console.log('\n=== MAP INFO ===')
  console.log(JSON.stringify(mapInfo, null, 2))
  
  // Check for cluster-specific errors
  const clusterErrors = errors.filter(e => 
    e.includes('MarkerClusterGroup') || 
    e.includes('is not a constructor')
  )
  
  console.log('\n=== CLUSTER ERRORS ===')
  if (clusterErrors.length > 0) {
    console.log('FAIL: Found cluster errors:', clusterErrors)
  } else {
    console.log('PASS: No cluster constructor errors found')
  }
})
