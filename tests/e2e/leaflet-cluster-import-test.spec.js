// Test to verify Leaflet MarkerClusterGroup is properly loaded
import { test, expect } from '@playwright/test'

test('verify Leaflet.markercluster import and function availability', async ({ page }) => {
  const consoleMessages = []
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() })
  })
  
  await page.goto('http://localhost:4173/fam-trainingsplan/')
  await page.waitForLoadState('networkidle')
  
  // Check what's available in the L namespace
  const leafletInfo = await page.evaluate(() => {
    const info = {
      leafletExists: typeof window.L !== 'undefined',
      markerClusterGroupLower: typeof window.L?.markerClusterGroup,
      markerClusterGroupUpper: typeof window.L?.MarkerClusterGroup,
      allLKeys: window.L ? Object.keys(window.L).filter(k => k.toLowerCase().includes('cluster')) : []
    }
    
    console.log('=== LEAFLET CLUSTER INFO ===')
    console.log('Leaflet exists:', info.leafletExists)
    console.log('L.markerClusterGroup type:', info.markerClusterGroupLower)
    console.log('L.MarkerClusterGroup type:', info.markerClusterGroupUpper)
    console.log('Cluster-related keys:', info.allLKeys)
    
    return info
  })
  
  console.log('\n=== TEST RESULTS ===')
  console.log(JSON.stringify(leafletInfo, null, 2))
  
  // Now switch to map view and see what error occurs
  await page.evaluate(() => {
    if (window.Alpine && window.Alpine.store('ui')) {
      window.Alpine.store('ui').activeView = 'map'
    }
  })
  
  await page.waitForTimeout(3000)
  
  // Check for error messages
  const errors = consoleMessages.filter(m => m.type === 'error')
  const clusterErrors = errors.filter(e => 
    e.text.includes('markerClusterGroup') || 
    e.text.includes('MarkerClusterGroup')
  )
  
  console.log('\n=== CONSOLE ERRORS ===')
  errors.forEach(e => console.log('ERROR:', e.text))
  
  console.log('\n=== DIAGNOSIS ===')
  if (leafletInfo.markerClusterGroupLower === 'undefined' && 
      leafletInfo.markerClusterGroupUpper === 'undefined') {
    console.log('ISSUE: Neither L.markerClusterGroup nor L.MarkerClusterGroup is defined')
    console.log('LIKELY CAUSE: leaflet.markercluster plugin not loaded')
  } else if (leafletInfo.markerClusterGroupLower === 'function') {
    console.log('OK: L.markerClusterGroup (lowercase) is available as a function')
  } else if (leafletInfo.markerClusterGroupUpper === 'function') {
    console.log('ISSUE: L.MarkerClusterGroup (uppercase) is available, but code checks for lowercase')
    console.log('FIX NEEDED: Change code to use L.MarkerClusterGroup instead of L.markerClusterGroup')
  }
})
