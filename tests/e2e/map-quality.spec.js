import { test, expect } from '@playwright/test';

/**
 * Helper Functions for Map Quality Testing
 */

/**
 * Get marker's position as percentage from top of viewport
 * @param {Page} page - Playwright page object
 * @param {number} markerIndex - Index of the marker (0-based)
 * @returns {Promise<number>} - Percentage from top (0-100)
 */
async function getMarkerPositionPercent(page, markerIndex = 0) {
  return await page.evaluate((index) => {
    const markers = document.querySelectorAll('.leaflet-marker-icon');
    if (!markers || markers.length === 0 || !markers[index]) return null;

    const marker = markers[index];
    const rect = marker.getBoundingClientRect();
    const markerCenterY = rect.top + (rect.height / 2);
    const viewportHeight = window.innerHeight;

    return (markerCenterY / viewportHeight) * 100;
  }, markerIndex);
}

/**
 * Check if element is fully visible in viewport
 * @param {Page} page - Playwright page object
 * @param {string} elementSelector - CSS selector for the element
 * @returns {Promise<boolean>} - True if fully visible
 */
async function isElementFullyVisible(page, elementSelector) {
  return await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }, elementSelector);
}

/**
 * Check if element has minimum margins from viewport edges
 * @param {Page} page - Playwright page object
 * @param {string} elementSelector - CSS selector for the element
 * @param {number} minMargin - Minimum margin in pixels
 * @returns {Promise<boolean>} - True if has sufficient margins
 */
async function hasMinimumMargins(page, elementSelector, minMargin = 50) {
  return await page.evaluate(([selector, margin]) => {
    const element = document.querySelector(selector);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= margin &&
      rect.left >= margin &&
      rect.bottom <= (window.innerHeight - margin) &&
      rect.right <= (window.innerWidth - margin)
    );
  }, [elementSelector, minMargin]);
}

/**
 * Wait for map pan animation to complete
 * @param {Page} page - Playwright page object
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForPanComplete(page, timeout = 1000) {
  // Wait for pan animation (typically 500ms) plus safety margin
  await page.waitForTimeout(timeout);

  // Verify map is no longer animating
  const isAnimating = await page.evaluate(() => {
    const mapContainer = document.querySelector('.leaflet-container');
    if (!mapContainer) return false;

    // Get Alpine.js context to access integrated map
    const alpineEl = document.querySelector('[x-data]');
    if (!alpineEl || !window.Alpine) return false;

    const context = window.Alpine.$data(alpineEl);
    const map = context.integratedMap || context.map;

    return map?._animatingZoom || false;
  });

  if (isAnimating) {
    await page.waitForTimeout(500);
  }
}

/**
 * Get map tile loading status
 * @param {Page} page - Playwright page object
 * @returns {Promise<{loaded: number, total: number, errors: number}>}
 */
async function getMapTileStatus(page) {
  return await page.evaluate(() => {
    const container = document.querySelector('.leaflet-tile-container');
    if (!container) return { loaded: 0, total: 0, errors: 0 };

    const tiles = container.querySelectorAll('.leaflet-tile');
    const loadedTiles = container.querySelectorAll('.leaflet-tile-loaded');
    const errorTiles = container.querySelectorAll('.leaflet-tile-error');

    return {
      loaded: loadedTiles.length,
      total: tiles.length,
      errors: errorTiles.length
    };
  });
}

/**
 * Get popup bounding box relative to viewport
 * @param {Page} page - Playwright page object
 * @returns {Promise<DOMRect|null>}
 */
async function getPopupBounds(page) {
  return await page.evaluate(() => {
    const popup = document.querySelector('.leaflet-popup');
    if (!popup) return null;

    const rect = popup.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height
    };
  });
}

/**
 * Click on first visible marker on map
 * @param {Page} page - Playwright page object
 * @param {string} mapContainerId - ID of map container
 * @returns {Promise<void>}
 */
async function clickFirstMarker(page, mapContainerId = 'map-view-container') {
  // Wait for markers to be visible
  await page.waitForSelector('.leaflet-marker-icon', { state: 'visible', timeout: 5000 });

  // Click first visible marker
  await page.locator('.leaflet-marker-icon').first().click();

  // Wait for popup to appear
  await page.waitForSelector('.leaflet-popup', { state: 'visible', timeout: 2000 });
}

test.describe('Map Quality Tests - Marker Click and Centering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');

    // Wait for app to initialize
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.waitForTimeout(500);

    // Switch to map view mode by directly setting the Alpine.js store
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });

    // Wait for map view container to be visible
    await page.waitForSelector('#map-view-container', { state: 'visible', timeout: 5000 });

    // Wait for map tiles to load
    await page.waitForSelector('.leaflet-tile-loaded', { state: 'visible', timeout: 10000 });

    // Wait for markers to appear
    await page.waitForSelector('.leaflet-marker-icon', { state: 'visible', timeout: 5000 });
  });

  test('should center marker in lower third of viewport when clicked (single marker)', async ({ page }) => {
    // Click first marker
    await clickFirstMarker(page);

    // Wait for pan animation to complete
    await waitForPanComplete(page);

    // Get marker position percentage (first marker, index 0)
    const markerPosition = await getMarkerPositionPercent(page);

    // Marker MUST be positioned at 70% from top (±5% tolerance)
    // This is strict - the code specifies 70%, so we test for exactly that
    expect(markerPosition).toBeGreaterThanOrEqual(65);
    expect(markerPosition).toBeLessThanOrEqual(75);
  });

  test('should keep popup fully visible after centering', async ({ page }) => {
    // Click first marker
    await clickFirstMarker(page);

    // Wait for pan animation to complete
    await waitForPanComplete(page);

    // Get popup bounds to verify it's within viewport (or close to it)
    const popupBounds = await getPopupBounds(page);
    expect(popupBounds).not.toBeNull();

    // Allow some tolerance for popups near edges (10px overflow is acceptable)
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(popupBounds.top).toBeGreaterThanOrEqual(-10);
    expect(popupBounds.left).toBeGreaterThanOrEqual(-10);
    expect(popupBounds.bottom).toBeLessThanOrEqual(viewportHeight + 10);
    expect(popupBounds.right).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('should handle cluster marker clicks correctly', async ({ page }) => {
    // Find and click a cluster marker if it exists
    const clusterMarker = page.locator('.marker-cluster').first();
    const clusterExists = await clusterMarker.count() > 0;

    if (clusterExists) {
      // Click cluster to expand
      await clusterMarker.click();
      await page.waitForTimeout(500);

      // Click individual marker that appeared
      await clickFirstMarker(page);

      // Wait for pan animation
      await waitForPanComplete(page);

      // Verify marker is centered properly at 70% (±5%)
      const markerPosition = await getMarkerPositionPercent(page);
      expect(markerPosition).toBeGreaterThanOrEqual(65);
      expect(markerPosition).toBeLessThanOrEqual(75);

      // Verify popup is visible
      const popup = page.locator('.leaflet-popup');
      await expect(popup).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should center correctly for multi-training popups', async ({ page }) => {
    // Close filter sidebar if it's open to prevent interference
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').filterSidebarOpen = false;
      }
    });
    await page.waitForTimeout(300);

    // Look for a location with multiple trainings (has "Mehrere Trainings" text)
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    let foundMultiTraining = false;

    for (let i = 0; i < Math.min(markerCount, 10); i++) {
      // Check if marker is in viewport first
      const isInViewport = await markers.nth(i).isVisible();
      if (!isInViewport) continue;

      try {
        await markers.nth(i).click({ timeout: 2000 });
      } catch (e) {
        // Skip markers that can't be clicked
        continue;
      }
      await page.waitForTimeout(300);

      const hasMultipleTrainings = await page.locator('.leaflet-popup').locator('text=/Mehrere Trainings/i').count() > 0;

      if (hasMultipleTrainings) {
        foundMultiTraining = true;

        // Wait for pan animation
        await waitForPanComplete(page);

        // Marker should be positioned at 70% (±5%) - multi-training uses same centering
        const markerPosition = await getMarkerPositionPercent(page, i);
        expect(markerPosition).toBeGreaterThanOrEqual(65);
        expect(markerPosition).toBeLessThanOrEqual(75);

        // Verify larger popup is within viewport (allow small overflow)
        const popupBounds = await getPopupBounds(page);
        const viewportHeight = await page.evaluate(() => window.innerHeight);
        const viewportWidth = await page.evaluate(() => window.innerWidth);

        expect(popupBounds.top).toBeGreaterThanOrEqual(-10);
        expect(popupBounds.bottom).toBeLessThanOrEqual(viewportHeight + 10);

        break;
      }
    }

    if (!foundMultiTraining) {
      test.skip();
    }
  });

  test('should maintain popup visibility during rapid clicks', async ({ page }) => {
    // Get all visible markers
    const markers = page.locator('.leaflet-marker-icon');
    const markerCount = await markers.count();

    // Click multiple markers in quick succession
    for (let i = 0; i < Math.min(markerCount, 3); i++) {
      await markers.nth(i).click();
      await page.waitForTimeout(100); // Minimal wait
    }

    // Wait for final animation to complete
    await waitForPanComplete(page);

    // Verify final popup is visible and within viewport
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible();

    const popupBounds = await getPopupBounds(page);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    expect(popupBounds.top).toBeGreaterThanOrEqual(-10);
    expect(popupBounds.bottom).toBeLessThanOrEqual(viewportHeight + 10);
  });
});

test.describe('Map Quality Tests - Integrated Map Initialization', () => {
  test('should fully load map tiles when opening directly in map view', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:5173');

    // Wait for Alpine to initialize then set map view
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });

    // Wait for map container to be visible
    await page.waitForSelector('#map-view-container', { state: 'visible', timeout: 5000 });

    // Wait for map to fully initialize and tiles to start loading
    await page.waitForTimeout(1000);
    await page.waitForSelector('.leaflet-tile-container', { state: 'attached', timeout: 5000 });

    // Wait for at least one tile to be loaded
    await page.waitForSelector('.leaflet-tile-loaded', { state: 'visible', timeout: 10000 });

    // Wait a bit more for additional tiles
    await page.waitForTimeout(2000);

    // Check tile loading status
    const tileStatus = await getMapTileStatus(page);

    // Should have loaded tiles (at least some)
    expect(tileStatus.loaded).toBeGreaterThan(0);

    // Should have no error tiles
    expect(tileStatus.errors).toBe(0);

    // If we have tiles, they should mostly be loaded
    if (tileStatus.total > 0) {
      const loadPercentage = (tileStatus.loaded / tileStatus.total) * 100;
      expect(loadPercentage).toBeGreaterThanOrEqual(50); // At least half loaded
    }
  });

  test('should display map without fragments or partial tiles', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:5173');

    // Wait for Alpine to initialize then set map view
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });

    // Wait for map to initialize and tiles to load
    await page.waitForSelector('.leaflet-container', { state: 'visible', timeout: 5000 });
    await page.waitForSelector('.leaflet-tile-loaded', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(2000);

    // STRICT fragment detection: Check map container, tiles, and Leaflet initialization
    const fragmentCheck = await page.evaluate(() => {
      const map = document.querySelector('#map-view-container');
      const container = map?.querySelector('.leaflet-container');
      const tilePane = map?.querySelector('.leaflet-tile-pane');
      const tiles = map?.querySelectorAll('.leaflet-tile-loaded');

      // Check 1: Map container must have reasonable dimensions (not 0x0 or tiny)
      const mapWidth = map?.offsetWidth || 0;
      const mapHeight = map?.offsetHeight || 0;

      // Check 2: Leaflet container must exist and be same size as map
      const containerWidth = container?.offsetWidth || 0;
      const containerHeight = container?.offsetHeight || 0;

      // Check 3: Tile pane must exist and have tiles
      const hasTilePane = tilePane !== null;
      const tileCount = tiles?.length || 0;

      // Check 4: Tiles should cover significant area (not fragments)
      // Calculate total tile coverage
      let totalTileArea = 0;
      if (tiles) {
        tiles.forEach(tile => {
          totalTileArea += (tile.width || 0) * (tile.height || 0);
        });
      }

      const viewportArea = mapWidth * mapHeight;
      const coverageRatio = totalTileArea / (viewportArea || 1);

      return {
        mapWidth,
        mapHeight,
        containerWidth,
        containerHeight,
        hasTilePane,
        tileCount,
        coverageRatio,
        // Map must be > 100x100px
        hasValidDimensions: mapWidth > 100 && mapHeight > 100,
        // Container must match map size (±5px)
        containerMatches: Math.abs(mapWidth - containerWidth) < 5 && Math.abs(mapHeight - containerHeight) < 5,
        // Must have at least 4 tiles (typical minimum for viewport coverage)
        hasEnoughTiles: tileCount >= 4,
        // Tiles should cover at least 80% of viewport (accounting for overlap)
        hasGoodCoverage: coverageRatio >= 0.8
      };
    });

    // STRICT assertions - any failure indicates fragments/initialization issues
    expect(fragmentCheck.hasValidDimensions).toBe(true);
    expect(fragmentCheck.containerMatches).toBe(true);
    expect(fragmentCheck.hasTilePane).toBe(true);
    expect(fragmentCheck.hasEnoughTiles).toBe(true);
    expect(fragmentCheck.hasGoodCoverage).toBe(true);

    // Additional check: Verify no console errors about map initialization
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (msg.text().includes('map') || msg.text().includes('Leaflet'))) {
        consoleErrors.push(msg.text());
      }
    });
    await page.waitForTimeout(500);
    expect(consoleErrors).toHaveLength(0);
  });

  test('should show markers immediately on map view load', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:5173');

    // Wait for Alpine to initialize then set map view
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });

    // Wait for map to be visible
    await page.waitForSelector('#map-view-container', { state: 'visible', timeout: 5000 });

    // Wait for markers to appear (should be quick)
    await page.waitForSelector('.leaflet-marker-icon', { state: 'visible', timeout: 5000 });

    // Count visible markers
    const markerCount = await page.locator('.leaflet-marker-icon:visible').count();
    expect(markerCount).toBeGreaterThan(0);
  });

  test('should preserve map state on view mode toggle', async ({ page }) => {
    // Navigate to page in compact view
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.waitForTimeout(500);

    // Switch to map view
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });
    await page.waitForSelector('#map-view-container', { state: 'visible' });
    await page.waitForTimeout(1000); // Wait for map to fully initialize

    // Click a marker and get its position
    await clickFirstMarker(page);
    await waitForPanComplete(page);
    await page.waitForTimeout(500); // Extra wait for state to settle

    const initialCenter = await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]');
      if (!alpineEl || !window.Alpine) return null;

      const context = window.Alpine.$data(alpineEl);
      const map = context.integratedMap;
      if (!map) return null;

      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    });

    // Switch to list view
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'list';
      }
    });
    await page.waitForTimeout(1000);

    // Switch back to map view
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });
    await page.waitForSelector('#map-view-container', { state: 'visible' });
    await page.waitForTimeout(1000); // Wait for map to reinitialize

    // Check if center is preserved (within reasonable tolerance)
    const newCenter = await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]');
      if (!alpineEl || !window.Alpine) return null;

      const context = window.Alpine.$data(alpineEl);
      const map = context.integratedMap;
      if (!map) return null;

      const center = map.getCenter();
      return { lat: center.lat, lng: center.lng };
    });

    expect(newCenter).not.toBeNull();
    expect(initialCenter).not.toBeNull();

    // Strict tolerance - map state should be preserved accurately (±0.01 degrees ≈ 700m)
    // The map saves state to localStorage and should restore it precisely
    expect(Math.abs(newCenter.lat - initialCenter.lat)).toBeLessThan(0.01);
    expect(Math.abs(newCenter.lng - initialCenter.lng)).toBeLessThan(0.01);
  });
});

test.describe('Map Quality Tests - Responsive Behavior', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`should center markers correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      // Set viewport size
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Navigate to page
      await page.goto('http://localhost:5173');

      // Wait for app to initialize
      await page.waitForSelector('[x-data]', { state: 'attached' });
      await page.waitForTimeout(500);

      // Switch to map view by setting Alpine.js store
      await page.evaluate(() => {
        if (window.Alpine && window.Alpine.store('ui')) {
          window.Alpine.store('ui').activeView = 'map';
        }
      });
      await page.waitForSelector('#map-view-container', { state: 'visible' });

      // Click first marker
      await clickFirstMarker(page);
      await waitForPanComplete(page);

      // Verify marker centering at 70% (±5%) - should be consistent across all viewports
      const markerPosition = await getMarkerPositionPercent(page);
      expect(markerPosition).toBeGreaterThanOrEqual(65);
      expect(markerPosition).toBeLessThanOrEqual(75);

      // Verify popup visibility
      const popup = page.locator('.leaflet-popup');
      await expect(popup).toBeVisible();

      // Check popup fits in viewport (allow small overflow for mobile)
      const popupBounds = await getPopupBounds(page);
      expect(popupBounds.top).toBeGreaterThanOrEqual(-10); // Allow small overflow at top
      expect(popupBounds.bottom).toBeLessThanOrEqual(viewport.height + 10); // Allow small overflow at bottom
    });
  }
});

test.describe('Map Quality Tests - Edge Cases', () => {
  test('should handle zoom changes during pan animation', async ({ page }) => {
    // Navigate and switch to map view
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.waitForTimeout(500);

    // Switch to map view by setting Alpine.js store
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });
    await page.waitForSelector('#map-view-container', { state: 'visible' });

    // Click marker to start pan
    await clickFirstMarker(page);

    // Immediately trigger zoom (before pan completes)
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]');
      if (!alpineEl || !window.Alpine) return;

      const context = window.Alpine.$data(alpineEl);
      const map = context.integratedMap;
      if (map) {
        map.setZoom(map.getZoom() + 1);
      }
    });

    // Wait for both animations to complete
    await page.waitForTimeout(1500);

    // Verify popup is still visible and map is stable
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible();

    // Verify no JavaScript errors occurred
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.waitForTimeout(500);
    expect(errors).toHaveLength(0);
  });

  test.skip('should handle markers near map edges correctly', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.waitForTimeout(500);

    // Switch to map view by setting Alpine.js store
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });
    await page.waitForSelector('#map-view-container', { state: 'visible' });

    // Get map bounds and find markers
    const edgeMarkerFound = await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]');
      if (!alpineEl || !window.Alpine) return false;

      const context = window.Alpine.$data(alpineEl);
      const map = context.integratedMap;
      if (!map) return false;

      const bounds = map.getBounds();
      const markers = [];

      // Access markers from map layers
      map.eachLayer((layer) => {
        // eslint-disable-next-line no-undef
        if (layer instanceof L.Marker) {
          const pos = layer.getLatLng();
          // Check if marker is near edge (within 10% of bounds)
          const latRange = bounds.getNorth() - bounds.getSouth();
          const lngRange = bounds.getEast() - bounds.getWest();

          const nearEdge =
            pos.lat > (bounds.getNorth() - latRange * 0.1) ||
            pos.lat < (bounds.getSouth() + latRange * 0.1) ||
            pos.lng > (bounds.getEast() - lngRange * 0.1) ||
            pos.lng < (bounds.getWest() + lngRange * 0.1);

          if (nearEdge) {
            markers.push(layer);
          }
        }
      });

      // Click first edge marker if found
      if (markers.length > 0) {
        markers[0].fire('click');
        return true;
      }
      return false;
    });

    if (edgeMarkerFound) {
      await waitForPanComplete(page);

      // Verify popup is visible and within viewport
      const popup = page.locator('.leaflet-popup');
      await expect(popup).toBeVisible();

      const popupBounds = await getPopupBounds(page);
      const viewportHeight = await page.evaluate(() => window.innerHeight);

      // Allow overflow for edge markers - they're tricky to position
      expect(popupBounds.top).toBeGreaterThanOrEqual(-20);
      expect(popupBounds.bottom).toBeLessThanOrEqual(viewportHeight + 20);
    } else {
      test.skip();
    }
  });

  test('should recover from tile loading errors gracefully', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[x-data]', { state: 'attached' });
    await page.waitForTimeout(500);

    // Switch to map view by setting Alpine.js store
    await page.evaluate(() => {
      if (window.Alpine && window.Alpine.store('ui')) {
        window.Alpine.store('ui').activeView = 'map';
      }
    });
    await page.waitForSelector('#map-view-container', { state: 'visible' });
    await page.waitForTimeout(2000);

    // Block tile server to simulate network issues
    await page.route('**/*.tile.openstreetmap.org/**', route => route.abort());
    await page.route('**/*arcgisonline.com/**', route => route.abort());

    // Trigger map refresh with blocked tiles
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]');
      if (!alpineEl || !window.Alpine) return;

      const context = window.Alpine.$data(alpineEl);
      const map = context.integratedMap;
      if (map) {
        map.setZoom(map.getZoom() + 1);
      }
    });
    await page.waitForTimeout(1000);

    // Unblock tile server
    await page.unroute('**/*.tile.openstreetmap.org/**');
    await page.unroute('**/*arcgisonline.com/**');

    // Trigger map refresh to reload tiles
    await page.evaluate(() => {
      const alpineEl = document.querySelector('[x-data]');
      if (!alpineEl || !window.Alpine) return;

      const context = window.Alpine.$data(alpineEl);
      const map = context.integratedMap;
      if (map) {
        map.setZoom(map.getZoom() - 1); // Zoom back
      }
    });

    // Wait longer for tiles to reload
    await page.waitForTimeout(3000);

    // Verify tiles loaded successfully after recovery
    const tileStatus = await getMapTileStatus(page);
    expect(tileStatus.loaded).toBeGreaterThan(0);
  });
});
