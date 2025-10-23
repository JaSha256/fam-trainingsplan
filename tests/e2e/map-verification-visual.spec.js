/**
 * E2E Test: Map Verification (Visual Check)
 * 
 * Purpose: Verify map is rendering and capture visual evidence
 */

import { test, expect } from '@playwright/test';

test.describe('Map Visual Verification', () => {
  test('should capture map view state', async ({ page }) => {
    const consoleErrors = [];
    const consoleWarnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    await page.goto('http://localhost:4173/fam-trainingsplan/');
    await page.waitForLoadState('networkidle');

    // Take screenshot of initial state
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/01-initial-state.png',
      fullPage: true 
    });

    // Find map button - try multiple selectors
    const mapButton = page.locator('button:has-text("Karte")').or(
      page.locator('button:has-text("Map")')
    ).or(
      page.locator('button[aria-label*="Karte"]')
    ).first();

    await expect(mapButton).toBeVisible({ timeout: 10000 });
    console.log('Map button found and visible');

    await mapButton.click();
    console.log('Map button clicked');

    // Wait for map to render
    await page.waitForTimeout(5000);

    // Take screenshot after clicking map button
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/02-map-view.png',
      fullPage: true 
    });

    // Check for Leaflet elements
    const hasLeafletContainer = await page.locator('.leaflet-container').count() > 0;
    const hasLeafletMap = await page.locator('.leaflet-map-pane').count() > 0;
    const hasLeafletTiles = await page.locator('.leaflet-tile-pane').count() > 0;
    const hasMarkers = await page.locator('.leaflet-marker-icon').count() > 0;

    console.log('Leaflet container found:', hasLeafletContainer);
    console.log('Leaflet map pane found:', hasLeafletMap);
    console.log('Leaflet tile pane found:', hasLeafletTiles);
    console.log('Markers found:', hasMarkers);

    // Check for MarkerClusterGroup errors
    const clusterErrors = consoleErrors.filter(err => 
      err.includes('MarkerClusterGroup') ||
      err.includes('markercluster') ||
      err.toLowerCase().includes('cluster')
    );

    console.log('Total console errors:', consoleErrors.length);
    console.log('Cluster-related errors:', clusterErrors.length);
    
    if (consoleErrors.length > 0) {
      console.log('All errors:', JSON.stringify(consoleErrors, null, 2));
    }

    if (clusterErrors.length > 0) {
      console.log('Cluster errors:', JSON.stringify(clusterErrors, null, 2));
    }

    // Verify Leaflet is loaded
    const leafletCheck = await page.evaluate(() => {
      return {
        leafletDefined: typeof window.L !== 'undefined',
        markerClusterDefined: typeof window.L?.MarkerClusterGroup !== 'undefined',
        mapExists: document.querySelector('.leaflet-container') !== null
      };
    });

    console.log('Leaflet check results:', JSON.stringify(leafletCheck, null, 2));

    // Test assertions
    expect(hasLeafletContainer, 'Leaflet container should be present').toBeTruthy();
    expect(clusterErrors.length, 'Should have no cluster-related errors').toBe(0);

    // Final screenshot
    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/03-final-state.png',
      fullPage: true 
    });
  });

  test('should verify map interaction', async ({ page }) => {
    await page.goto('http://localhost:4173/fam-trainingsplan/');
    await page.waitForLoadState('networkidle');

    const mapButton = page.locator('button:has-text("Karte")').first();
    await mapButton.click();
    await page.waitForTimeout(3000);

    // Try to interact with zoom controls
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    if (await zoomIn.count() > 0) {
      await zoomIn.click();
      await page.waitForTimeout(1000);
      console.log('Zoom in successful');
    }

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/04-after-zoom.png',
      fullPage: true 
    });
  });
});
