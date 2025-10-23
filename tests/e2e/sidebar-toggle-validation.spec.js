import { test, expect } from '@playwright/test';

/**
 * E2E Test: Sidebar Toggle Functionality Validation
 * 
 * Purpose: Verify sidebar toggle works correctly after removing floating expand button
 */

test.describe('Sidebar Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173');
    await page.waitForFunction(() => window.Alpine !== undefined);
    await page.waitForSelector('[data-training-card]', { timeout: 10000 });
  });

  test('should toggle sidebar using in-header button (no floating button)', async ({ page }) => {
    console.log('=== STEP 1: Verify Initial Sidebar State ===');
    
    const initialSidebarState = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });
    
    expect(initialSidebarState).toBe(false);
    console.log('PASS: Alpine store confirms sidebar is initially open');
    
    const sidebar = page.locator('div.bg-slate-200.min-h-screen.sticky');
    await expect(sidebar).toBeVisible();
    console.log('PASS: Sidebar container is visible in DOM');
    
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/sidebar-toggle-01-initial-open.png',
      fullPage: true 
    });
    console.log('SAVED: Screenshot - sidebar-toggle-01-initial-open.png\n');
    
    console.log('=== STEP 2: Verify Floating Button Does NOT Exist ===');
    
    const floatingButton = page.locator('[data-testid="sidebar-expand-toggle"]');
    await expect(floatingButton).toHaveCount(0);
    console.log('PASS: Floating expand button not found (correctly removed)\n');
    
    console.log('=== STEP 3: Locate Sidebar Toggle Button ===');
    
    // Look for collapse button using x-on:click directive
    const collapseButton = page.locator('button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    await expect(collapseButton).toBeVisible();
    console.log('PASS: Sidebar toggle button found and visible');
    
    const buttonLocation = await collapseButton.boundingBox();
    console.log('INFO: Button location - x:' + Math.round(buttonLocation.x) + ', y:' + Math.round(buttonLocation.y) + '\n');
    
    console.log('=== STEP 4: Collapse Sidebar ===');
    
    await collapseButton.click();
    await page.waitForTimeout(500);
    
    const collapsedState = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });
    
    expect(collapsedState).toBe(true);
    console.log('PASS: Alpine store confirms sidebar is collapsed');
    
    const sidebarWidth = await sidebar.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });
    console.log('INFO: Sidebar width after collapse: ' + sidebarWidth);
    
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/sidebar-toggle-02-collapsed.png',
      fullPage: true 
    });
    console.log('SAVED: Screenshot - sidebar-toggle-02-collapsed.png\n');
    
    console.log('=== STEP 5: Re-verify Floating Button Absent ===');
    
    await expect(floatingButton).toHaveCount(0);
    console.log('PASS: Floating expand button still not present\n');
    
    console.log('=== STEP 6: Re-expand Sidebar ===');
    
    await collapseButton.click();
    await page.waitForTimeout(500);
    
    const expandedState = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });
    
    expect(expandedState).toBe(false);
    console.log('PASS: Alpine store confirms sidebar is expanded');
    
    const sidebarWidthExpanded = await sidebar.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });
    console.log('INFO: Sidebar width after expand: ' + sidebarWidthExpanded);
    
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/sidebar-toggle-03-re-expanded.png',
      fullPage: true 
    });
    console.log('SAVED: Screenshot - sidebar-toggle-03-re-expanded.png\n');
    
    console.log('=== STEP 7: Test Multiple Toggles ===');
    
    await collapseButton.click();
    await page.waitForTimeout(300);
    
    const finalCollapsedState = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });
    
    expect(finalCollapsedState).toBe(true);
    console.log('PASS: Multiple toggles work correctly');
    
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/sidebar-toggle-04-final-collapsed.png',
      fullPage: true 
    });
    console.log('SAVED: Screenshot - sidebar-toggle-04-final-collapsed.png\n');
    
    console.log('=== TEST COMPLETE: All Assertions Passed ===');
  });
});
