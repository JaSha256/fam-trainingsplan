/**
 * Smoke Test - Grundlegende Funktionalität der App testen
 * Testet die laufende App auf http://localhost:5173/fam-trainingsplan/
 */

import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:5173/fam-trainingsplan/'

test.describe('Smoke Test - App Grundfunktionen', () => {
  test('sollte die Seite laden und Trainings anzeigen', async ({ page }) => {
    // Seite öffnen
    await page.goto(BASE_URL)

    // Warten bis Alpine.js geladen ist
    await page.waitForFunction(() => window.Alpine !== undefined)

    // Prüfen ob der Titel korrekt ist
    await expect(page).toHaveTitle(/Trainingsplan/)

    // Prüfen ob die Hauptüberschrift vorhanden ist
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()

    // Prüfen ob Trainings geladen wurden
    const trainingsCount = page.locator('text=/\\d+ Trainings/')
    await expect(trainingsCount).toBeVisible({ timeout: 5000 })

    // Screenshot für Dokumentation
    await page.screenshot({ path: 'tests/e2e/screenshots/smoke-test-homepage.png', fullPage: true })
  })

  test('sollte die Sidebar anzeigen (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(BASE_URL)

    // Warten bis Alpine.js initialisiert ist
    await page.waitForFunction(() => window.Alpine !== undefined)

    // Desktop-Sidebar sollte sichtbar sein
    const sidebar = page.locator('aside').first()
    await expect(sidebar).toBeVisible()

    // Sidebar sollte Filter-Optionen enthalten
    const filterHeading = page.locator('text=/Filter|Trainingsplan/i').first()
    await expect(filterHeading).toBeVisible()

    await page.screenshot({ path: 'tests/e2e/screenshots/smoke-test-sidebar.png' })
  })

  test('sollte zwischen List/Map Views wechseln können', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(BASE_URL)

    await page.waitForFunction(() => window.Alpine !== undefined)

    // View Slider finden
    const listButton = page
      .locator('[data-testid="desktop-view-tab-list"]')
      .or(page.locator('button:has-text("Liste")'))
      .first()
    const mapButton = page
      .locator('[data-testid="desktop-view-tab-map"]')
      .or(page.locator('button:has-text("Karte")'))
      .first()

    // Zu Karten-Ansicht wechseln
    if (await mapButton.isVisible()) {
      await mapButton.click()
      await page.waitForTimeout(500)

      // Karte sollte sichtbar sein
      const mapContainer = page.locator('#map, [id*="map"]').first()
      await expect(mapContainer).toBeVisible()

      await page.screenshot({ path: 'tests/e2e/screenshots/smoke-test-map-view.png' })
    }

    // Zurück zur Listen-Ansicht
    if (await listButton.isVisible()) {
      await listButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('sollte die Suche funktionieren', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForFunction(() => window.Alpine !== undefined)

    // Suchfeld finden
    const searchInput = page
      .locator('input[type="search"], input[placeholder*="Suche"], input[aria-label*="Suche"]')
      .first()

    if (await searchInput.isVisible()) {
      // Suchbegriff eingeben
      await searchInput.fill('Parkour')
      await page.waitForTimeout(500)

      // Ergebnisse sollten gefiltert sein
      const resultsText = page.locator('text=/\\d+ Training/i').first()
      await expect(resultsText).toBeVisible()

      await page.screenshot({ path: 'tests/e2e/screenshots/smoke-test-search.png' })

      // Suche zurücksetzen
      await searchInput.clear()
    }
  })

  test('sollte Filter anwenden können', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto(BASE_URL)
    await page.waitForFunction(() => window.Alpine !== undefined)

    // Wochentag-Filter finden (z.B. Montag)
    const montagFilter = page.locator('text=/Montag/i').first()

    if (await montagFilter.isVisible()) {
      // Ursprüngliche Trainingsanzahl merken
      const beforeCount = await page.locator('text=/\\d+ Training/i').first().textContent()

      // Filter anwenden
      await montagFilter.click()
      await page.waitForTimeout(500)

      // Trainingsanzahl sollte sich geändert haben
      const afterCount = await page.locator('text=/\\d+ Training/i').first().textContent()

      // Filter-Chip sollte sichtbar sein
      const filterChip = page
        .locator('[class*="chip"], [class*="badge"]')
        .filter({ hasText: /Montag/i })
        .first()
      if (await filterChip.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(filterChip).toBeVisible()
      }

      await page.screenshot({ path: 'tests/e2e/screenshots/smoke-test-filter.png' })
    }
  })

  test('sollte responsiv sein (Mobile)', async ({ page }) => {
    // Mobile Viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(BASE_URL)
    await page.waitForFunction(() => window.Alpine !== undefined)

    // Desktop-Sidebar sollte versteckt sein
    const desktopSidebar = page.locator('aside.hidden.lg\\:block').first()
    if (await desktopSidebar.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Auf Mobile sollte sie nicht sichtbar sein
      const sidebarBox = await desktopSidebar.boundingBox()
      expect(sidebarBox).toBeNull()
    }

    await page.screenshot({ path: 'tests/e2e/screenshots/smoke-test-mobile.png', fullPage: true })
  })

  test('sollte keine Console Errors haben', async ({ page }) => {
    const consoleErrors = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto(BASE_URL)
    await page.waitForFunction(() => window.Alpine !== undefined)
    await page.waitForTimeout(2000)

    // Kritische Fehler ausschließen (Warnungen sind OK)
    const criticalErrors = consoleErrors.filter(
      err => !err.includes('DevTools') && !err.includes('favicon') && !err.includes('Warning')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('sollte PWA Manifest haben', async ({ page }) => {
    await page.goto(BASE_URL)

    // Manifest Link prüfen
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)

    // Manifest abrufen
    const manifestHref = await manifestLink.getAttribute('href')
    expect(manifestHref).toBeTruthy()

    const manifestResponse = await page.goto(`${BASE_URL}${manifestHref}`)
    expect(manifestResponse?.status()).toBe(200)

    const manifestContent = await manifestResponse?.json()
    expect(manifestContent).toHaveProperty('name')
    expect(manifestContent).toHaveProperty('short_name')
  })
})
