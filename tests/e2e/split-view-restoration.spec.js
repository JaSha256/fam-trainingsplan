/**
 * E2E Test: Split-View Restoration
 *
 * Validates that the split-view button is properly restored and functional
 * on desktop screens, while maintaining mobile-first responsive design.
 */

import { test, expect } from '@playwright/test';

test.describe('Split-View Restoration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show 3 view buttons on desktop (lg+)', async ({ page }) => {
    // Set viewport to desktop size (1024px+)
    await page.setViewportSize({ width: 1280, height: 800 });

    // Wait for desktop view controls to be visible (in main content, not mobile header)
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    await expect(desktopViewControls).toBeVisible();

    // Check that all 3 buttons are visible
    const listButton = desktopViewControls.locator('button').nth(0);
    const splitButton = desktopViewControls.locator('button').nth(1);
    const mapButton = desktopViewControls.locator('button').nth(2);

    await expect(listButton).toBeVisible();
    await expect(splitButton).toBeVisible();
    await expect(mapButton).toBeVisible();

    // Verify buttons count
    await expect(desktopViewControls.locator('button')).toHaveCount(3);
  });

  test('should show only 2 view buttons on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for mobile view controls to be visible (in header)
    const mobileViewControls = page.locator('header [role="group"][aria-label="Ansicht wechseln"]');
    await expect(mobileViewControls).toBeVisible();

    // Check button visibility: list and map should be visible, split should be hidden
    const listButton = mobileViewControls.locator('button').nth(0);
    const splitButton = mobileViewControls.locator('button').nth(1);
    const mapButton = mobileViewControls.locator('button').nth(2);

    await expect(listButton).toBeVisible();
    await expect(splitButton).not.toBeVisible(); // Hidden via 'hidden lg:flex'
    await expect(mapButton).toBeVisible();

    // Verify desktop view controls are hidden on mobile
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    await expect(desktopViewControls).not.toBeVisible();
  });

  test('should activate split-view when button is clicked (desktop)', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Get desktop view controls and click split-view button
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    const splitButton = desktopViewControls.locator('button').nth(1);
    await splitButton.click();

    // Wait for transition
    await page.waitForTimeout(300);

    // Check that split-view button is active (aria-pressed="true")
    await expect(splitButton).toHaveAttribute('aria-pressed', 'true');

    // Check that split-view button has active styling
    const buttonClasses = await splitButton.getAttribute('class');
    expect(buttonClasses).toContain('bg-white');
    expect(buttonClasses).toContain('shadow-sm');
    expect(buttonClasses).toContain('text-primary-600');
  });

  test('should display list and map panels in split-view', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Activate split-view using desktop view controls
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    const splitButton = desktopViewControls.locator('button').nth(1);
    await splitButton.click();
    await page.waitForTimeout(300);

    // Check that both list and map panels are visible
    const listPanel = page.locator('#list-panel');
    const mapPanel = page.locator('#map-panel');

    await expect(listPanel).toBeVisible();
    await expect(mapPanel).toBeVisible();

    // Verify layout: list panel should be 2/5 width, map panel should be 3/5 width
    const listPanelClass = await listPanel.getAttribute('class');
    expect(listPanelClass).toContain('lg:w-2/5');

    const mapPanelClass = await mapPanel.getAttribute('class');
    expect(mapPanelClass).toContain('lg:w-3/5');
  });

  test('should switch between list, split, and map views smoothly', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Get desktop view controls
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    const listButton = desktopViewControls.locator('button').nth(0);
    const splitButton = desktopViewControls.locator('button').nth(1);
    const mapButton = desktopViewControls.locator('button').nth(2);

    const listPanel = page.locator('#list-panel');
    const mapPanel = page.locator('#map-panel');

    // Start with list view (default)
    await expect(listButton).toHaveAttribute('aria-pressed', 'true');
    await expect(listPanel).toBeVisible();
    await expect(mapPanel).not.toBeVisible();

    // Switch to split view
    await splitButton.click();
    await page.waitForTimeout(300);
    await expect(splitButton).toHaveAttribute('aria-pressed', 'true');
    await expect(listPanel).toBeVisible();
    await expect(mapPanel).toBeVisible();

    // Switch to map view
    await mapButton.click();
    await page.waitForTimeout(300);
    await expect(mapButton).toHaveAttribute('aria-pressed', 'true');
    await expect(listPanel).not.toBeVisible();
    await expect(mapPanel).toBeVisible();

    // Back to list view
    await listButton.click();
    await page.waitForTimeout(300);
    await expect(listButton).toHaveAttribute('aria-pressed', 'true');
    await expect(listPanel).toBeVisible();
    await expect(mapPanel).not.toBeVisible();
  });

  test('should have proper accessibility attributes on split-view button', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Get desktop view controls and split button
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    const splitButton = desktopViewControls.locator('button').nth(1);

    // Check aria-label (case insensitive check for "geteilte" or "Geteilte")
    const ariaLabel = await splitButton.getAttribute('aria-label');
    expect(ariaLabel.toLowerCase()).toContain('geteilte');

    // Check aria-pressed
    await expect(splitButton).toHaveAttribute('aria-pressed');

    // Check button type
    await expect(splitButton).toHaveAttribute('type', 'button');
  });

  test('should maintain responsive grid in split-view', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Activate split-view using desktop view controls
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    const splitButton = desktopViewControls.locator('button').nth(1);
    await splitButton.click();

    // Wait for Alpine.js to update the classes
    await page.waitForTimeout(500);

    // Wait for training cards to load
    await page.waitForSelector('[data-training-card]', { timeout: 5000 });

    // Check that training cards container uses split-view grid layout
    // The grid should have 'grid-cols-1 md:grid-cols-2' in split view
    const trainingGrid = page.locator('#list-panel .grid').first();
    await page.waitForTimeout(200); // Allow Alpine.js reactivity to apply classes

    const gridClasses = await trainingGrid.getAttribute('class');

    // In split-view, should have max 2 columns classes
    expect(gridClasses).toContain('grid-cols-1');
    expect(gridClasses).toContain('md:grid-cols-2');
    // Should NOT have the multi-column classes from normal view
    expect(gridClasses).not.toContain('lg:grid-cols-3');
  });

  test('should have proper SVG icon for split-view button', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 800 });

    // Get desktop view controls and split button
    const desktopViewControls = page.locator('#main-content [role="group"][aria-label="Ansicht wechseln"]');
    const splitButton = desktopViewControls.locator('button').nth(1);

    // Check that button contains an SVG
    const svg = splitButton.locator('svg');
    await expect(svg).toBeVisible();

    // Verify SVG has proper attributes
    await expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    await expect(svg).toHaveAttribute('stroke', 'currentColor');
  });
});
