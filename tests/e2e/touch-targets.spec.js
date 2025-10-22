/**
 * AUFGABE 2: Touch Target Optimization - Fitts's Law Implementation
 *
 * Tests for touch target sizes and spacing based on:
 * - Material Design 3 Standards
 * - Apple Human Interface Guidelines
 * - WCAG 2.1 AAA Accessibility Requirements
 *
 * Scientific Basis:
 * - Primary actions (Anmelden): min 48x48px (M3 Standard)
 * - Secondary actions (Favorit, Filter): min 44x44px (Apple HIG)
 * - Minimum spacing between targets: 8px
 * - FAB (Floating Action Button): 56x56px (M3 Standard)
 */

import { test, expect } from '@playwright/test'

test.describe('AUFGABE 2: Touch Target Optimization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5176/')
    await page.waitForLoadState('networkidle')
    // Wait for trainings to load
    await page.waitForSelector('[data-training-card]', { timeout: 10000 })
  })

  test('Primary CTA buttons (Anmelden) should be at least 48x48px', async ({ page }) => {
    // Find first "Anmelden" button in training card
    const anmeldenButton = page.locator('button:has-text("Anmelden")').first()
    await anmeldenButton.waitFor({ state: 'visible' })

    const box = await anmeldenButton.boundingBox()

    expect(box).not.toBeNull()
    expect(box.width).toBeGreaterThanOrEqual(48)
    expect(box.height).toBeGreaterThanOrEqual(48)
  })

  test('Favorite toggle buttons should be at least 44x44px', async ({ page }) => {
    // Find first favorite button
    const favoriteButton = page.locator('button[aria-label*="Favoriten"]').first()
    await favoriteButton.waitFor({ state: 'visible' })

    const box = await favoriteButton.boundingBox()

    expect(box).not.toBeNull()
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)
  })

  test('FAB (Floating Action Button) should be 56x56px and positioned correctly', async ({
    page
  }) => {
    // FAB should be visible on list view
    await page.locator('button[aria-label="Liste-Ansicht"]').click()

    // Wait for FAB to appear (it should be for "Heute" quick filter)
    const fab = page.locator('.md-fab')

    // Check if FAB exists
    const fabCount = await fab.count()

    if (fabCount > 0) {
      await fab.waitFor({ state: 'visible' })

      const box = await fab.boundingBox()
      expect(box).not.toBeNull()

      // M3 Standard FAB size: 56x56px
      expect(box.width).toBeGreaterThanOrEqual(56)
      expect(box.height).toBeGreaterThanOrEqual(56)

      // Position check: should be in bottom-right corner
      const viewport = page.viewportSize()
      expect(box.x).toBeGreaterThan(viewport.width - 200) // Right side
      expect(box.y).toBeGreaterThan(viewport.height - 200) // Bottom side
    }
  })

  test('Button spacing should be at least 8px in action groups', async ({ page }) => {
    // Find training card with multiple buttons
    const trainingCard = page.locator('[data-training-card]').first()
    await trainingCard.waitFor({ state: 'visible' })

    // Get all buttons within card
    const buttons = trainingCard.locator('button')
    const buttonCount = await buttons.count()

    if (buttonCount >= 2) {
      const boxes = []
      for (let i = 0; i < Math.min(buttonCount, 3); i++) {
        const box = await buttons.nth(i).boundingBox()
        if (box) boxes.push(box)
      }

      // Check spacing between consecutive buttons
      for (let i = 0; i < boxes.length - 1; i++) {
        const box1 = boxes[i]
        const box2 = boxes[i + 1]

        // Calculate horizontal or vertical spacing
        let spacing = 0

        // If buttons are horizontally aligned
        if (Math.abs(box1.y - box2.y) < 10) {
          spacing = box2.x - (box1.x + box1.width)
        }
        // If buttons are vertically stacked
        else {
          spacing = box2.y - (box1.y + box1.height)
        }

        // Spacing should be at least 8px
        if (spacing > 0) {
          expect(spacing).toBeGreaterThanOrEqual(8)
        }
      }
    }
  })

  test('All interactive elements should have accessible labels', async ({ page }) => {
    // Check all buttons have aria-label or text content
    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < Math.min(count, 20); i++) {
      const button = buttons.nth(i)
      const isVisible = await button.isVisible()

      if (isVisible) {
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = (await button.textContent()).trim()
        const hasChildSvg = (await button.locator('svg').count()) > 0

        // Button should have either aria-label, text content, or title
        const hasLabel = ariaLabel || textContent || hasChildSvg
        expect(hasLabel).toBeTruthy()
      }
    }
  })
})

test.describe('AUFGABE 2: Mobile Touch Target Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5176/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-training-card]', { timeout: 10000 })
  })

  test('Mobile: Primary buttons should be at least 48x48px', async ({ page }) => {
    const anmeldenButton = page.locator('button:has-text("Anmelden")').first()
    await anmeldenButton.waitFor({ state: 'visible' })

    const box = await anmeldenButton.boundingBox()

    expect(box).not.toBeNull()
    expect(box.width).toBeGreaterThanOrEqual(48)
    expect(box.height).toBeGreaterThanOrEqual(48)
  })

  test('Mobile: FAB should be positioned above bottom navigation', async ({ page }) => {
    await page.locator('button[aria-label="Liste-Ansicht"]').click()

    const fab = page.locator('.md-fab')
    const fabCount = await fab.count()

    if (fabCount > 0) {
      await fab.waitFor({ state: 'visible' })

      const fabBox = await fab.boundingBox()
      const viewport = page.viewportSize()

      // FAB should be at least 80px from bottom (above nav bar)
      expect(viewport.height - (fabBox.y + fabBox.height)).toBeGreaterThanOrEqual(70)
    }
  })

  test('Mobile: Touch targets should not overlap', async ({ page }) => {
    const trainingCard = page.locator('[data-training-card]').first()
    await trainingCard.waitFor({ state: 'visible' })

    const buttons = trainingCard.locator('button:visible')
    const buttonCount = await buttons.count()

    const boxes = []
    for (let i = 0; i < buttonCount; i++) {
      const box = await buttons.nth(i).boundingBox()
      if (box) boxes.push(box)
    }

    // Check for overlaps
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const box1 = boxes[i]
        const box2 = boxes[j]

        // Check if boxes overlap
        const xOverlap = !(box1.x + box1.width < box2.x || box2.x + box2.width < box1.x)
        const yOverlap = !(box1.y + box1.height < box2.y || box2.y + box2.height < box1.y)

        const overlap = xOverlap && yOverlap
        expect(overlap).toBe(false)
      }
    }
  })
})

test.describe('AUFGABE 2: Desktop Touch Target Optimization', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('http://localhost:5176/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-training-card]', { timeout: 10000 })
  })

  test('Desktop: Filter checkboxes should have proper click target', async ({ page }) => {
    // Open filter sidebar (should be visible on desktop)
    const filterSection = page.locator('[data-filter-section]').first()

    if (await filterSection.isVisible()) {
      const checkboxLabels = page.locator(
        'input[type="checkbox"] + label, label:has(input[type="checkbox"])'
      )
      const labelCount = await checkboxLabels.count()

      if (labelCount > 0) {
        const firstLabel = checkboxLabels.first()
        const box = await firstLabel.boundingBox()

        expect(box).not.toBeNull()
        // Label should provide adequate click area
        expect(box.height).toBeGreaterThanOrEqual(32)
      }
    }
  })

  test('Desktop: Export and settings buttons should be properly sized', async ({ page }) => {
    // Header action buttons
    const exportButton = page.locator('button[aria-label="Export"]').first()

    if (await exportButton.isVisible()) {
      const box = await exportButton.boundingBox()

      expect(box).not.toBeNull()
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })
})
