/**
 * E2E Tests for Task 12: Sticky Filter Sidebar for Desktop
 * TDD RED PHASE - These tests define expected behavior before implementation
 */

import { test, expect } from '@playwright/test';

test.describe('Task 12: Sticky Filter Sidebar - Desktop Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Wait for Alpine.js to initialize
    await page.waitForFunction(() => window.Alpine !== undefined);
  });

  test('sidebar is always visible on desktop (>= 1024px)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    // Sidebar should be visible
    const sidebar = page.locator('aside').filter({ hasText: 'Trainingsplan' });
    await expect(sidebar).toBeVisible();

    // Check it has lg:block class
    await expect(sidebar).toHaveClass(/lg:block/);
  });

  test('sidebar has sticky positioning on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const sidebar = page.locator('aside').filter({ hasText: 'Trainingsplan' });

    // Check for sticky positioning classes
    await expect(sidebar).toHaveClass(/sticky/);
    await expect(sidebar).toHaveClass(/top-0/);
  });

  test('sidebar maintains 280px (w-70) fixed width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const sidebar = page.locator('aside').filter({ hasText: 'Trainingsplan' });

    // w-80 in Tailwind is 320px (80 * 4px = 320px), but task specifies 280px
    // We'll check the actual computed width
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(280);
    expect(box?.width).toBeLessThanOrEqual(320);
  });

  test('sidebar has internal collapse/expand toggle button', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    // Toggle button should be INSIDE the sidebar
    const sidebar = page.locator('aside').filter({ hasText: 'Trainingsplan' });

    // In expanded state, collapse toggle should be visible
    const collapseToggle = sidebar.locator('button[data-testid="sidebar-collapse-toggle"]');
    await expect(collapseToggle).toBeVisible();

    // Expand toggle should not be visible
    const expandToggle = sidebar.locator('button[data-testid="sidebar-expand-toggle"]');
    await expect(expandToggle).not.toBeVisible();
  });

  test('sidebar remains visible on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    const sidebar = page.locator('aside').filter({ hasText: 'Trainingsplan' });

    // Get initial position
    const initialBox = await sidebar.boundingBox();

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);

    // Sidebar should still be at top (sticky behavior)
    const afterScrollBox = await sidebar.boundingBox();
    expect(afterScrollBox?.y).toBe(0); // Should stick to top

    // Should still be visible
    await expect(sidebar).toBeVisible();
  });
});

test.describe('Task 12: Sidebar Collapse/Expand State', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.Alpine !== undefined);
  });

  test('sidebar starts in expanded state by default', async ({ page }) => {
    // Check Alpine store state
    const sidebarCollapsed = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });

    expect(sidebarCollapsed).toBe(false);

    // Sidebar should show full content
    const sidebar = page.locator('aside').filter({ hasText: 'Trainingsplan' });
    await expect(sidebar.locator('input[type="text"]#search')).toBeVisible();
  });

  test('clicking toggle button collapses sidebar', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const collapseToggle = sidebar.locator('button[data-testid="sidebar-collapse-toggle"]');

    // Click to collapse
    await collapseToggle.click();
    await page.waitForTimeout(350); // Wait for animation

    // Check Alpine store
    const collapsed = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });
    expect(collapsed).toBe(true);

    // Sidebar should show collapsed state (narrower width)
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeLessThan(100); // Collapsed should be ~64px
  });

  test('collapsed sidebar shows active filter summary', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const collapseToggle = sidebar.locator('button[data-testid="sidebar-collapse-toggle"]');

    // Apply a filter first
    await page.evaluate(() => {
      window.Alpine.store('ui').filters.wochentag = ['Montag'];
    });
    await page.waitForTimeout(100);

    // Collapse sidebar
    await collapseToggle.click();
    await page.waitForTimeout(350);

    // Should show filter badge/indicator in collapsed state
    const filterIndicator = sidebar.locator('[data-testid="collapsed-filter-indicator"]');
    await expect(filterIndicator).toBeVisible();
  });

  test('clicking toggle button again expands sidebar', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const collapseToggle = sidebar.locator('button[data-testid="sidebar-collapse-toggle"]');

    // Collapse first
    await collapseToggle.click();
    await page.waitForTimeout(350);

    // Expand again - now need expand toggle
    const expandToggle = sidebar.locator('button[data-testid="sidebar-expand-toggle"]');
    await expandToggle.click();
    await page.waitForTimeout(350);

    // Check Alpine store
    const collapsed = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });
    expect(collapsed).toBe(false);

    // Sidebar should be wide again
    const box = await sidebar.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(280);
  });

  test('sidebar collapse state persists on page reload', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    const collapseToggle = sidebar.locator('button[data-testid="sidebar-collapse-toggle"]');

    // Collapse sidebar
    await collapseToggle.click();
    await page.waitForTimeout(350);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.Alpine !== undefined);

    // Should still be collapsed
    const collapsed = await page.evaluate(() => {
      return window.Alpine.store('ui').sidebarCollapsed;
    });
    expect(collapsed).toBe(true);
  });
});

test.describe('Task 12: Mobile Behavior Unchanged', () => {
  test('sidebar uses mobile drawer pattern on mobile (<1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Desktop sidebar should be hidden on mobile
    const desktopSidebar = page.locator('aside').filter({ hasText: 'Trainingsplan' }).first();
    await expect(desktopSidebar).not.toBeVisible();

    // Mobile filter button should be present
    const mobileFilterButton = page.locator('button').filter({ hasText: 'Filter' });
    await expect(mobileFilterButton).toBeVisible();
  });

  test('mobile filter drawer opens on button click', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const mobileFilterButton = page.locator('button').filter({ hasText: 'Filter' });
    await mobileFilterButton.click();

    // Mobile drawer should open
    const mobileDrawer = page.locator('div.lg\\:hidden').filter({ hasText: 'Filter' }).nth(1);
    await expect(mobileDrawer).toBeVisible();
  });
});
