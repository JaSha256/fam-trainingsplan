/**
 * TDD Test Suite: Mobile Header Restructuring
 *
 * Tests the restructured mobile header layout with:
 * - Export/Share icons in header (not bottom nav)
 * - Dark mode icon toggle in header
 * - No redundant settings button in header
 * - View switcher remains in header
 */

import { test, expect } from '@playwright/test';

test.describe('Mobile Header Restructure', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display export and share icons in mobile header', async ({ page }) => {
    // Mobile header should be visible
    const header = page.locator('header.lg\\:hidden');
    await expect(header).toBeVisible();

    // Export button should be in header
    const exportBtn = header.locator('[aria-label*="Export"]');
    await expect(exportBtn).toBeVisible();

    // Share button should be in header
    const shareBtn = header.locator('[aria-label*="Teilen"]');
    await expect(shareBtn).toBeVisible();
  });

  test('should have compact dark mode toggle in header', async ({ page }) => {
    const header = page.locator('header.lg\\:hidden');

    // Dark mode toggle should be icon-only (no text)
    const darkModeBtn = header.locator('[aria-label*="Dark Mode"]');
    await expect(darkModeBtn).toBeVisible();

    // Should be compact (icon button, not slider)
    const boundingBox = await darkModeBtn.boundingBox();
    expect(boundingBox?.width).toBeLessThan(60); // Compact icon button
  });

  test('should NOT have settings button in mobile header', async ({ page }) => {
    const header = page.locator('header.lg\\:hidden');

    // Settings button should NOT be in header
    const settingsInHeader = header.locator('button[aria-label*="Einstellungen"]');
    await expect(settingsInHeader).toHaveCount(0);
  });

  test('should maintain view switcher below header in separate bar', async ({ page }) => {
    // View switcher should be in a separate bar below the header
    const viewSwitcherBar = page.locator('div.lg\\:hidden.sticky.top-12');
    await expect(viewSwitcherBar).toBeVisible();

    // View switcher should be present in the bar
    const viewSwitcher = viewSwitcherBar.locator('[role="tablist"]');
    await expect(viewSwitcher).toBeVisible();

    // Should have 3 tabs
    const tabs = viewSwitcher.locator('[role="tab"]');
    await expect(tabs).toHaveCount(3);
  });
});
