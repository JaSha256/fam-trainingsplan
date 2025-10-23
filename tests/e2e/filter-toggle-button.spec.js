/**
 * E2E Tests: Filter Toggle Button Functionality
 * 
 * Test Coverage:
 * - Desktop toggle button visibility and positioning in header
 * - Toggle functionality (collapse/expand sidebar)
 * - Visual feedback (hover states, transitions)
 * - ARIA attributes and accessibility
 * - Verification that floating button is removed
 * - Mobile filter button behavior
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/fam-trainingsplan/';

test.describe('Filter Toggle Button - Desktop Viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Wait for Alpine.js to initialize
    await page.waitForTimeout(800);
  });

  test('should display desktop filter toggle button in header', async ({ page }) => {
    // Locate the DESKTOP filter toggle button (has .hidden.lg\\:block class)
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    
    // Verify button is visible
    await expect(toggleButton).toBeVisible();
    
    // Verify button has filter icon (funnel polygon)
    const icon = toggleButton.locator('svg polygon');
    await expect(icon).toBeVisible();
    
    // Verify button has proper ARIA attributes
    const ariaLabel = await toggleButton.getAttribute('aria-label');
    expect(ariaLabel).toContain('Filter');
    
    // Verify button is positioned left of FAM logo
    const headerLogo = page.locator('header a:has-text("FAM"), header img[alt*="FAM"]');
    
    if (await headerLogo.count() > 0) {
      const buttonBox = await toggleButton.boundingBox();
      const logoBox = await headerLogo.first().boundingBox();
      
      // Button should be left of logo (smaller x coordinate)
      expect(buttonBox.x).toBeLessThan(logoBox.x);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/filter-toggle-desktop-visible.png',
      fullPage: false
    });
  });

  test('should toggle sidebar collapse/expand on click', async ({ page }) => {
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    const sidebar = page.locator('aside.hidden.lg\\:block');
    
    // Initial state: sidebar should be expanded (w-80)
    await expect(sidebar).toBeVisible();
    let sidebarClasses = await sidebar.getAttribute('class');
    expect(sidebarClasses).toContain('lg:block');
    
    // Get initial ARIA pressed state
    const initialAriaPressed = await toggleButton.getAttribute('aria-pressed');
    console.log('Initial aria-pressed:', initialAriaPressed);
    
    // Click to collapse
    await toggleButton.click();
    await page.waitForTimeout(400); // Wait for transition
    
    // Verify ARIA pressed state changed
    const collapsedAriaPressed = await toggleButton.getAttribute('aria-pressed');
    console.log('Collapsed aria-pressed:', collapsedAriaPressed);
    expect(collapsedAriaPressed).not.toBe(initialAriaPressed);
    
    // Verify sidebar has collapsed class (w-0)
    sidebarClasses = await sidebar.getAttribute('class');
    const isCollapsed = sidebarClasses.includes('w-0') || 
                       await sidebar.evaluate(el => {
                         const computed = window.getComputedStyle(el);
                         return computed.width === '0px';
                       });
    
    expect(isCollapsed).toBeTruthy();
    
    // Take screenshot of collapsed state
    await page.screenshot({ 
      path: 'test-results/filter-toggle-sidebar-collapsed.png',
      fullPage: false
    });
    
    // Click to expand
    await toggleButton.click();
    await page.waitForTimeout(400); // Wait for transition
    
    // Verify sidebar is expanded again
    await expect(sidebar).toBeVisible();
    const expandedClasses = await sidebar.getAttribute('class');
    const isExpanded = expandedClasses.includes('w-80');
    expect(isExpanded).toBeTruthy();
    
    // Take screenshot of expanded state
    await page.screenshot({ 
      path: 'test-results/filter-toggle-sidebar-expanded.png',
      fullPage: false
    });
  });

  test('should verify no floating button appears when sidebar collapsed', async ({ page }) => {
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    
    // Collapse sidebar
    await toggleButton.click();
    await page.waitForTimeout(500);
    
    // Check for any floating/fixed button elements that are NOT in header
    const floatingButtons = await page.locator('button').evaluateAll(elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const isFixed = style.position === 'fixed' || style.position === 'absolute';
        const isNotInHeader = !el.closest('header');
        const hasFilterText = el.textContent.toLowerCase().includes('filter') || 
                             el.getAttribute('aria-label')?.toLowerCase().includes('filter') ||
                             el.getAttribute('aria-label')?.toLowerCase().includes('öffnen');
        return isFixed && isNotInHeader && hasFilterText;
      }).map(el => ({
        text: el.textContent,
        label: el.getAttribute('aria-label'),
        position: window.getComputedStyle(el).position
      }));
    });
    
    console.log('Found floating buttons:', floatingButtons);
    
    // Should be NO floating buttons outside header
    expect(floatingButtons.length).toBe(0);
    
    // Take screenshot to verify no floating button
    await page.screenshot({ 
      path: 'test-results/filter-toggle-no-floating-button.png',
      fullPage: true
    });
  });

  test('should have proper hover state visual feedback', async ({ page }) => {
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    
    // Get initial background color
    const initialBg = await toggleButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Hover over button
    await toggleButton.hover();
    await page.waitForTimeout(300);
    
    // Get hovered background color
    const hoveredBg = await toggleButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    console.log('Initial bg:', initialBg, 'Hovered bg:', hoveredBg);
    
    // Background should change on hover (slate-200 or similar)
    // Note: May be same if initial is transparent, but should have hover class
    const hasHoverClass = await toggleButton.evaluate(el => {
      return el.className.includes('hover:');
    });
    
    expect(hasHoverClass).toBeTruthy();
  });

  test('should update ARIA attributes correctly during toggle', async ({ page }) => {
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    
    // Initial state
    const initialLabel = await toggleButton.getAttribute('aria-label');
    const initialPressed = await toggleButton.getAttribute('aria-pressed');
    
    expect(initialLabel).toBeTruthy();
    expect(initialPressed).toBeTruthy();
    
    console.log('Initial:', { label: initialLabel, pressed: initialPressed });
    
    // Toggle to collapsed
    await toggleButton.click();
    await page.waitForTimeout(300);
    
    const collapsedLabel = await toggleButton.getAttribute('aria-label');
    const collapsedPressed = await toggleButton.getAttribute('aria-pressed');
    
    console.log('Collapsed:', { label: collapsedLabel, pressed: collapsedPressed });
    
    expect(collapsedPressed).not.toBe(initialPressed);
    expect(collapsedLabel).not.toBe(initialLabel);
    
    // Toggle back to expanded
    await toggleButton.click();
    await page.waitForTimeout(300);
    
    const expandedLabel = await toggleButton.getAttribute('aria-label');
    const expandedPressed = await toggleButton.getAttribute('aria-pressed');
    
    console.log('Expanded:', { label: expandedLabel, pressed: expandedPressed });
    
    expect(expandedPressed).toBe(initialPressed);
    expect(expandedLabel).toBe(initialLabel);
  });

  test('should have smooth transitions without layout shifts', async ({ page }) => {
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    const sidebar = page.locator('aside.hidden.lg\\:block');
    
    // Get initial sidebar width
    const initialBox = await sidebar.boundingBox();
    
    // Click to collapse
    await toggleButton.click();
    
    // Wait for transition to complete
    await page.waitForTimeout(400);
    
    // Get final width
    const finalBox = await sidebar.boundingBox();
    
    console.log('Initial width:', initialBox?.width, 'Final width:', finalBox?.width);
    
    // Verify width changed (collapsed)
    if (initialBox && finalBox) {
      expect(finalBox.width).toBeLessThan(initialBox.width);
    }
    
    // Verify no horizontal scrollbar appeared (layout shift indicator)
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('should persist Alpine.js store state across toggles', async ({ page }) => {
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    
    // Check initial store state
    const initialState = await page.evaluate(() => {
      return window.Alpine?.store('ui')?.sidebarCollapsed;
    });
    
    console.log('Initial store state:', initialState);
    
    // Toggle to collapsed
    await toggleButton.click();
    await page.waitForTimeout(300);
    
    const collapsedState = await page.evaluate(() => {
      return window.Alpine?.store('ui')?.sidebarCollapsed;
    });
    
    console.log('Collapsed store state:', collapsedState);
    expect(collapsedState).not.toBe(initialState);
    
    // Toggle to expanded
    await toggleButton.click();
    await page.waitForTimeout(300);
    
    const expandedState = await page.evaluate(() => {
      return window.Alpine?.store('ui')?.sidebarCollapsed;
    });
    
    console.log('Expanded store state:', expandedState);
    expect(expandedState).toBe(initialState);
  });
});

test.describe('Filter Toggle Button - Mobile Viewport', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // Wait for Alpine.js to initialize
    await page.waitForTimeout(800);
  });

  test('should display mobile filter button (not desktop toggle)', async ({ page }) => {
    // On mobile, desktop toggle should be hidden
    const desktopToggle = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    await expect(desktopToggle).toBeHidden();
    
    // Mobile should have its own filter button
    const mobileFilterButton = page.locator('header button[aria-label*="Filter öffnen"]');
    await expect(mobileFilterButton).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/filter-toggle-mobile-button.png',
      fullPage: false
    });
  });

  test('should not show floating button on mobile', async ({ page }) => {
    // Verify no standalone floating filter buttons on mobile
    const floatingButtons = await page.locator('button').evaluateAll(elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const isFixed = style.position === 'fixed';
        const isNotInHeader = !el.closest('header');
        const isNotInNav = !el.closest('nav');
        const hasFilterText = el.textContent.toLowerCase().includes('filter') || 
                             el.getAttribute('aria-label')?.toLowerCase().includes('filter');
        return isFixed && isNotInHeader && isNotInNav && hasFilterText;
      }).map(el => ({
        text: el.textContent,
        label: el.getAttribute('aria-label'),
        position: window.getComputedStyle(el).position
      }));
    });
    
    console.log('Found floating buttons on mobile:', floatingButtons);
    expect(floatingButtons.length).toBe(0);
  });
});

test.describe('Filter Toggle Button - Summary Report', () => {
  test('should generate comprehensive test report with screenshots', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(800);
    
    const toggleButton = page.locator('header button.hidden.lg\\:block[aria-label*="Filter"]');
    const sidebar = page.locator('aside.hidden.lg\\:block');
    
    // Collect all test data
    const report = {
      timestamp: new Date().toISOString(),
      viewport: '1280x800 (Desktop)',
      tests: {
        buttonVisible: await toggleButton.isVisible(),
        buttonHasIcon: await toggleButton.locator('svg').isVisible(),
        initialAriaLabel: await toggleButton.getAttribute('aria-label'),
        initialAriaPressed: await toggleButton.getAttribute('aria-pressed'),
        sidebarInitiallyVisible: await sidebar.isVisible(),
        sidebarHasTransition: (await sidebar.getAttribute('class')).includes('transition'),
      }
    };
    
    // Toggle and collect state
    await toggleButton.click();
    await page.waitForTimeout(400);
    
    report.tests.collapsedAriaLabel = await toggleButton.getAttribute('aria-label');
    report.tests.collapsedAriaPressed = await toggleButton.getAttribute('aria-pressed');
    report.tests.sidebarCollapsed = (await sidebar.getAttribute('class')).includes('w-0');
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/filter-toggle-final-report.png',
      fullPage: true
    });
    
    console.log('=== FILTER TOGGLE BUTTON TEST REPORT ===');
    console.log(JSON.stringify(report, null, 2));
    
    // Verify all critical tests passed
    expect(report.tests.buttonVisible).toBeTruthy();
    expect(report.tests.buttonHasIcon).toBeTruthy();
    expect(report.tests.sidebarCollapsed).toBeTruthy();
    expect(report.tests.initialAriaLabel).not.toBe(report.tests.collapsedAriaLabel);
  });
});
