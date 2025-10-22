// @ts-check
import { test, expect } from '@playwright/test'

test.describe('Location Reset Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')

    // Wait for app to load
    await page.waitForSelector('[data-testid="trainings-list"]', { timeout: 10000 })
  })

  test('should show reset button only when location is active', async ({ page }) => {
    // Open location settings
    await page.click('button[aria-label="Standort-Einstellungen"]')

    // Wait for modal to appear
    await expect(page.locator('h2:has-text("Standort-Einstellungen")')).toBeVisible()

    // Reset button should NOT be visible initially (no location set)
    const resetButton = page.locator('button:has-text("Standort zurücksetzen")')
    await expect(resetButton).toBeHidden()

    // Select manual location mode
    await page.click('input[value="manual"]')

    // Enter coordinates
    await page.fill('input[placeholder*="Breitengrad"]', '48.1351')
    await page.fill('input[placeholder*="Längengrad"]', '11.582')
    await page.fill('input[placeholder*="Adresse"]', 'München, Deutschland')

    // Save location
    await page.click('button:has-text("Standort speichern")')

    // Wait for success notification
    await expect(page.locator('text=Standort gespeichert')).toBeVisible({ timeout: 5000 })

    // Re-open settings
    await page.click('button[aria-label="Standort-Einstellungen"]')

    // Reset button SHOULD now be visible
    await expect(resetButton).toBeVisible()
  })

  test('should show confirmation dialog before reset', async ({ page }) => {
    // Set up a manual location first
    await page.click('button[aria-label="Standort-Einstellungen"]')
    await page.click('input[value="manual"]')
    await page.fill('input[placeholder*="Breitengrad"]', '48.1351')
    await page.fill('input[placeholder*="Längengrad"]', '11.582')
    await page.click('button:has-text("Standort speichern")')

    // Re-open settings
    await page.click('button[aria-label="Standort-Einstellungen"]')

    // Set up dialog handler to cancel
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('zurücksetzen')
      await dialog.dismiss()
    })

    // Click reset button
    await page.click('button:has-text("Standort zurücksetzen")')

    // Modal should still be open (reset was cancelled)
    await expect(page.locator('h2:has-text("Standort-Einstellungen")')).toBeVisible()
  })

  test('should reset location when confirmed', async ({ page }) => {
    // Set up a manual location first
    await page.click('button[aria-label="Standort-Einstellungen"]')
    await page.click('input[value="manual"]')
    await page.fill('input[placeholder*="Breitengrad"]', '48.1351')
    await page.fill('input[placeholder*="Längengrad"]', '11.582')
    await page.fill('input[placeholder*="Adresse"]', 'München, Deutschland')
    await page.click('button:has-text("Standort speichern")')

    // Verify green indicator is shown
    await expect(page.locator('.bg-green-500').first()).toBeVisible()

    // Re-open settings and reset
    await page.click('button[aria-label="Standort-Einstellungen"]')

    // Set up dialog handler to confirm
    page.once('dialog', async dialog => {
      await dialog.accept()
    })

    // Click reset button
    await page.click('button:has-text("Standort zurücksetzen")')

    // Wait for success notification
    await expect(page.locator('text=Standort zurückgesetzt')).toBeVisible({ timeout: 5000 })

    // Modal should be closed
    await expect(page.locator('h2:has-text("Standort-Einstellungen")')).toBeHidden()

    // Green indicator should be gone
    await expect(page.locator('.bg-green-500').first()).toBeHidden()
  })

  test('should clear distance-based filters on reset', async ({ page }) => {
    // Set up a manual location
    await page.click('button[aria-label="Standort-Einstellungen"]')
    await page.click('input[value="manual"]')
    await page.fill('input[placeholder*="Breitengrad"]', '48.1351')
    await page.fill('input[placeholder*="Längengrad"]', '11.582')
    await page.click('button:has-text("Standort speichern")')

    // Apply "In meiner Nähe" quick filter
    await page.click('button:has-text("In meiner Nähe")')

    // Verify filter is active (would show filter chip or notification)
    // This depends on your UI implementation

    // Reset location
    await page.click('button[aria-label="Standort-Einstellungen"]')

    page.once('dialog', async dialog => {
      await dialog.accept()
    })

    await page.click('button:has-text("Standort zurücksetzen")')

    // Distance-based filter should be cleared (verify trainings list updated)
    // This would need specific selectors based on your UI
  })
})
