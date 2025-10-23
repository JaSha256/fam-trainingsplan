/**
 * E2E Test: Map Cluster Verification
 * 
 * Purpose: Verify that the Leaflet MarkerClusterGroup fix is working correctly
 */

import { test, expect } from '@playwright/test';

test.describe('Map Cluster Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/fam-trainingsplan/');
    await page.waitForLoadState('networkidle');
  });

  test('should load map view without L.MarkerClusterGroup errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const mapButton = page.locator('button', { hasText: /karte|map/i }).first();
    await expect(mapButton).toBeVisible({ timeout: 10000 });
    
    console.log('Clicking map view button...');
    await mapButton.click();
    await page.waitForTimeout(3000);

    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible({ timeout: 10000 });

    const clusterErrors = consoleErrors.filter(err => 
      err.includes('L.MarkerClusterGroup') || 
      err.includes('markercluster') ||
      err.includes('Cannot read properties of undefined')
    );

    expect(clusterErrors).toHaveLength(0);

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/map-cluster-verification.png',
      fullPage: true 
    });

    console.log('Total console errors:', consoleErrors.length);
  });

  test('should render marker clusters on map', async ({ page }) => {
    const mapButton = page.locator('button', { hasText: /karte|map/i }).first();
    await mapButton.click();
    await page.waitForTimeout(3000);

    const individualMarkers = page.locator('.leaflet-marker-icon');
    const markerCount = await individualMarkers.count();
    expect(markerCount).toBeGreaterThan(0);

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/map-markers-visible.png',
      fullPage: true 
    });
  });

  test('should have functional Leaflet controls', async ({ page }) => {
    const mapButton = page.locator('button', { hasText: /karte|map/i }).first();
    await mapButton.click();
    await page.waitForTimeout(3000);

    const zoomIn = page.locator('.leaflet-control-zoom-in');
    const zoomOut = page.locator('.leaflet-control-zoom-out');

    await expect(zoomIn).toBeVisible();
    await expect(zoomOut).toBeVisible();

    await zoomIn.click();
    await page.waitForTimeout(500);
    await zoomOut.click();
    await page.waitForTimeout(500);

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/map-zoom-controls.png',
      fullPage: true 
    });
  });

  test('should check Leaflet and MarkerCluster library loading', async ({ page }) => {
    const mapButton = page.locator('button', { hasText: /karte|map/i }).first();
    await mapButton.click();
    await page.waitForTimeout(3000);

    const leafletDefined = await page.evaluate(() => {
      return typeof window.L !== 'undefined';
    });
    expect(leafletDefined).toBeTruthy();

    const markerClusterDefined = await page.evaluate(() => {
      return typeof window.L?.MarkerClusterGroup !== 'undefined';
    });
    expect(markerClusterDefined).toBeTruthy();

    console.log('Leaflet defined:', leafletDefined);
    console.log('MarkerClusterGroup defined:', markerClusterDefined);
  });
});
