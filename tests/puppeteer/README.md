# 🧪 Puppeteer E2E Tests

**Debugging-optimierte End-to-End Tests für FAM Trainingsplan**

## 📋 Übersicht

Diese Puppeteer Test-Suite ist speziell für **visuelles Debugging** und **AI-gestütztes Testing** optimiert.

### Hauptfeatures

- ✅ **Headed Mode**: Browser sichtbar für Live-Debugging
- ✅ **SlowMo**: Langsame Ausführung für bessere Nachvollziehbarkeit
- ✅ **Screenshots**: Automatische Screenshots bei jedem Schritt
- ✅ **Console Logging**: Browser Console wird in Terminal geloggt
- ✅ **Network Monitoring**: Netzwerk-Requests und Fehler werden getrackt
- ✅ **Alpine.js Integration**: Direkter Zugriff auf Alpine Store Data
- ✅ **Debug Helpers**: Umfangreiche Utility-Funktionen

## 🚀 Installation

```bash
npm install --save-dev puppeteer
```

## 📂 Struktur

```
tests/puppeteer/
├── README.md                          # Diese Datei
├── run-tests.js                       # Manueller Test Runner
├── app-basic.test.js                  # Basis-Funktionalität Tests
├── search-filter.test.js              # Suche & Filter Tests
├── calendar-integration.test.js       # Kalender Integration Tests
├── helpers/
│   ├── test-helpers.js               # Screenshot, Console, Network Monitoring
│   └── base-test.js                  # Basis Test-Klasse mit Common Patterns
├── screenshots/                       # Auto-generierte Screenshots
│   ├── app-basic/
│   ├── search-filter/
│   └── calendar-integration/
└── videos/                            # Videos (optional)
```

## 🎯 Tests ausführen

### Option 1: Manueller Test Runner (Empfohlen für Debugging)

```bash
# Mit sichtbarem Browser (Headed Mode)
node tests/puppeteer/run-tests.js

# Mit sichtbarem Browser + langsame Ausführung
node tests/puppeteer/run-tests.js --slow

# Headless Mode (für CI/CD)
node tests/puppeteer/run-tests.js --headless
```

### Option 2: Mit Jest/Vitest (Falls konfiguriert)

```bash
npm run test:e2e
```

### Option 3: Einzelne Test-Dateien

```bash
node tests/puppeteer/app-basic.test.js
node tests/puppeteer/search-filter.test.js
node tests/puppeteer/calendar-integration.test.js
```

## 🔧 Konfiguration

### `puppeteer.config.js`

```javascript
export default {
  launch: {
    headless: false,     // Browser sichtbar machen
    slowMo: 50,          // 50ms Verzögerung zwischen Aktionen
    devtools: false,     // DevTools automatisch öffnen
    defaultViewport: null // Volle Fenstergröße
  },

  env: {
    baseUrl: 'http://localhost:5173',
    timeout: 30000
  },

  debug: {
    screenshots: true,
    console: true,
    network: false
  }
}
```

## 📸 Screenshots

Screenshots werden automatisch erstellt:

- **Bei jedem Test-Schritt** (wenn aktiviert)
- **Bei Fehlern** (immer)
- **Manuell** via `debug.screenshots.takeScreenshot(name)`

Speicherort: `tests/puppeteer/screenshots/{test-name}/`

## 🐛 Debugging Features

### 1. Console Logging

Alle Browser Console Outputs werden in Terminal geloggt:

```javascript
const { page, debug } = await setupTest(browser, 'test-name', {
  console: true  // Aktiviert Console Logging
})

// Browser console.log erscheint im Terminal
// Browser console.error wird als Fehler geloggt
```

### 2. Network Monitoring

Trackt alle HTTP Requests und Fehler:

```javascript
const { page, debug } = await setupTest(browser, 'test-name', {
  network: true  // Aktiviert Network Monitoring
})

debug.network.getFailedRequests()  // Zeigt fehlgeschlagene Requests
debug.network.printSummary()       // Zeigt Netzwerk-Statistik
```

### 3. Alpine.js Data Inspection

Direkter Zugriff auf Alpine Store:

```javascript
// Alle Stores anzeigen
await debug.logAlpineData()

// Spezifischen Store anzeigen
await debug.logAlpineData('trainingsplaner')

// Training Count
const counts = await debug.getTrainingsCount()
console.log(counts.total, counts.filtered)
```

### 4. Step-by-Step Debugging

```javascript
await debug.step('Beschreibung des Schritts', async () => {
  // Test-Aktionen
  await page.click('button')
})

// Screenshot wird automatisch erstellt (wenn aktiviert)
```

### 5. Page State Logging

```javascript
await test.logState()
// Zeigt: Anzahl Trainings, Filter, Suche, etc.

await debug.logPageInfo()
// Zeigt: Title, URL, etc.
```

## 🧪 Test Patterns

### Basic Test Structure

```javascript
import puppeteer from 'puppeteer'
import config from '../../puppeteer.config.js'
import { setupTest, cleanup } from './helpers/test-helpers.js'
import { BaseTest } from './helpers/base-test.js'

describe('Test Suite', () => {
  let browser, page, debug, test

  beforeAll(async () => {
    browser = await puppeteer.launch(config.launch)
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    ({ page, debug } = await setupTest(browser, 'test-name', {
      screenshots: true,
      console: true
    }))
    test = new BaseTest(page, debug)

    await test.goto()
    await test.waitForAlpine()
    await test.waitForTrainings()
  })

  afterEach(async () => {
    await debug.printSummary()
    await cleanup(page)
  })

  test('should do something', async () => {
    await test.search('Parkour')
    await test.screenshot('result.png')

    const count = await test.getTrainingCount()
    expect(count).toBeGreaterThan(0)
  })
})
```

### Using BaseTest Helpers

```javascript
// Navigation
await test.goto()
await test.goto('/some-path')

// Waiting
await test.waitForAlpine()
await test.waitForTrainings()

// Interactions
await test.click('button')
await test.type('input', 'text')
await test.search('Parkour')
await test.filterByTraining('Parkour')
await test.filterByLocation('München')
await test.resetFilters()

// Assertions
await test.assertExists('button')
await test.assertText('.title', 'Expected Text')
await test.assertCount('.card', 5)

// Getting Data
const count = await test.getTrainingCount()
const text = await test.getText('.title')
const exists = await test.exists('button')

// Screenshots
await test.screenshot('name.png')

// State
await test.logState()
```

## 📊 Test Reports

Nach jedem Test wird ein Summary erstellt:

```
==========================================================
📊 Test Summary: test-name
==========================================================
📄 Page Info:
  Title: FAM Trainingsplan
  URL: http://localhost:5173

✅ No console errors

📊 Network Summary:
  Total Requests: 42
  Total Responses: 42
  Failed Requests: 0

==========================================================
```

## 🎨 Viewports

Vordefinierte Viewports für Responsive Testing:

```javascript
// Desktop
await page.setViewport(config.viewports.desktop)  // 1920x1080

// Laptop
await page.setViewport(config.viewports.laptop)   // 1366x768

// Tablet
await page.setViewport(config.viewports.tablet)   // 768x1024

// Mobile
await page.setViewport(config.viewports.mobile)   // 375x667

// Mobile L
await page.setViewport(config.viewports.mobileL)  // 425x812
```

## 🚨 Error Handling

Tests erstellen automatisch Screenshots bei Fehlern:

```javascript
try {
  await test.click('button')
} catch (error) {
  // Screenshot "FAILURE.png" wird automatisch erstellt
  throw error
}
```

## 📝 Best Practices

### 1. Immer Screenshots nutzen

```javascript
await test.screenshot('before-action.png')
await performAction()
await test.screenshot('after-action.png')
```

### 2. Debug Steps verwenden

```javascript
await debug.step('Login', async () => {
  await test.type('#username', 'user')
  await test.type('#password', 'pass')
  await test.click('#login')
})
```

### 3. State nach wichtigen Aktionen loggen

```javascript
await test.search('Parkour')
await test.logState()  // Zeigt Filter, Anzahl, etc.
```

### 4. Console Errors checken

```javascript
afterEach(async () => {
  if (debug.console.hasErrors()) {
    console.warn('⚠️ Test completed with console errors')
  }
})
```

## 🔍 Debugging-Modus aktivieren

Für maximale Debugging-Info:

```javascript
const { page, debug } = await setupTest(browser, 'test-name', {
  screenshots: true,
  console: true,
  network: true,
  viewport: config.viewports.desktop
})

// In puppeteer.config.js
debug: {
  screenshots: true,
  screenshotOnStep: true,  // Screenshot bei JEDEM step()
  console: true,
  network: true,
  slowMo: 250,             // Sehr langsam
  pauseOnFailure: true     // Bei Fehler pausieren
}
```

## 🎯 Use Cases

### AI-Debugging

Diese Tests sind perfekt für AI-gestütztes Debugging:

1. **Visuelle Inspektion**: Screenshots bei jedem Schritt
2. **Console Monitoring**: Alle Fehler werden geloggt
3. **Network Tracking**: API-Fehler werden erkannt
4. **State Inspection**: Alpine.js Store kann inspiziert werden

### Manuelle Entwicklung

```bash
# Browser sichtbar + langsam + DevTools
node tests/puppeteer/run-tests.js --slow
```

### CI/CD Integration

```bash
# Headless + schnell
node tests/puppeteer/run-tests.js --headless
```

## 📚 Weitere Ressourcen

- [Puppeteer Docs](https://pptr.dev/)
- [Puppeteer API](https://pptr.dev/api)
- [Alpine.js Docs](https://alpinejs.dev/)

## 🐛 Troubleshooting

### Tests finden keine Elemente

1. Check Screenshots in `tests/puppeteer/screenshots/`
2. Aktiviere `console: true` um Browser Console zu sehen
3. Nutze `await test.logState()` um Alpine Store zu checken
4. Erhöhe `slowMo` um Timing-Probleme zu sehen

### Browser startet nicht

```bash
# Puppeteer Chrome neu installieren
npx puppeteer browsers install chrome
```

### Popup Blocker

```javascript
// Popups werden in Tests nicht blockiert
// Falls doch, nutze:
const newPagePromise = new Promise(resolve => {
  browser.once('targetcreated', async target => {
    resolve(await target.page())
  })
})
```

---

**Last Updated:** 2025-10-03
**Maintainer:** Claude Code
