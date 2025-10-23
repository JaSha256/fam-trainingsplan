import { test, expect } from '@playwright/test';

test.describe('Map Final Validation - MarkerClusterGroup Fix', () => {
  test('COMPREHENSIVE: Validate map with cluster markers and console errors', async ({ page }) => {
    const consoleMessages = {
      errors: [],
      warnings: [],
      logs: []
    };
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleMessages.errors.push(text);
      } else if (msg.type() === 'warning') {
        consoleMessages.warnings.push(text);
      }
    });

    console.log('Step 1: Navigate to application');
    await page.goto('http://localhost:4173/fam-trainingsplan/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/validation-01-initial.png',
      fullPage: true 
    });

    console.log('Step 2: Find and click map view button');
    const mapButton = page.locator('button[aria-label*="Karte"]').first();
    await mapButton.waitFor({ state: 'attached', timeout: 10000 });
    await mapButton.click({ force: true });

    console.log('Step 3: Wait for map to initialize');
    await page.waitForTimeout(5000);

    const jsCheck = await page.evaluate(() => {
      return {
        leafletDefined: typeof window.L !== 'undefined',
        markerClusterGroupDefined: typeof window.L?.MarkerClusterGroup !== 'undefined',
        markerClusterGroupIsFunction: typeof window.L?.MarkerClusterGroup === 'function',
        leafletVersion: window.L?.version || 'unknown',
        hasMap: document.querySelector('.leaflet-container') !== null,
        mapElementsCount: document.querySelectorAll('.leaflet-marker-icon').length,
        clusterElementsCount: document.querySelectorAll('.marker-cluster').length
      };
    });

    console.log('JavaScript check:', JSON.stringify(jsCheck, null, 2));

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/validation-02-map-view.png',
      fullPage: true 
    });

    const clusterErrors = consoleMessages.errors.filter(err => 
      err.includes('MarkerClusterGroup') ||
      err.includes('markercluster') ||
      err.includes('Cannot read properties of undefined')
    );

    console.log('Total errors:', consoleMessages.errors.length);
    console.log('Cluster errors:', clusterErrors.length);
    
    if (consoleMessages.errors.length > 0) {
      console.log('Errors:', consoleMessages.errors);
    }

    expect(jsCheck.leafletDefined).toBeTruthy();
    expect(jsCheck.markerClusterGroupDefined).toBeTruthy();
    expect(jsCheck.hasMap).toBeTruthy();
    expect(clusterErrors.length).toBe(0);

    await page.screenshot({ 
      path: '/home/pseudo/workspace/FAM/fam-trainingsplan/test-results/validation-final.png',
      fullPage: true 
    });
  });
});
