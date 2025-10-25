# FAM Trainingsplan - Architektur-Dokumentation

**Version:** 3.0.0
**Letztes Update:** 2025-10-17
**Autor:** Dokumentation generiert durch Code-Analyse

---

## 📋 Inhaltsverzeichnis

1. [Projekt-Übersicht](#projekt-übersicht)
2. [Technologie-Stack](#technologie-stack)
3. [Architektur-Übersicht](#architektur-übersicht)
4. [Code-Organisation](#code-organisation)
5. [Hauptkomponenten](#hauptkomponenten)
6. [State Management](#state-management)
7. [Features & Funktionalität](#features--funktionalität)
8. [Testing-Strategie](#testing-strategie)
9. [Performance & Optimierungen](#performance--optimierungen)
10. [Build & Deployment](#build--deployment)
11. [Entwickler-Workflows](#entwickler-workflows)
12. [Sicherheit & Best Practices](#sicherheit--best-practices)

---

## 🎯 Projekt-Übersicht

### Was ist FAM Trainingsplan?

FAM Trainingsplan ist eine **Progressive Web App (PWA)** zur Anzeige und Verwaltung von Trainingsangeboten für Free Arts of Movement (FAM) München. Die App ermöglicht es Nutzern, Trainings nach verschiedenen Kriterien zu filtern, zu suchen, als Favoriten zu markieren und in Kalender zu exportieren.

### Hauptzweck

- **Trainings-Discovery**: Nutzer finden passende Trainings nach Wochentag, Ort, Art und Altersgruppe
- **Offline-First**: App funktioniert auch ohne Internetverbindung
- **Mobile-Optimiert**: Touch-Gesten, responsive Design, PWA-Installation
- **Kalender-Integration**: Export zu Google Calendar, Outlook, Apple Calendar

### Zielgruppen

- **Trainierende**: Nutzer, die Parkour/Trampolin/Tricking-Trainings suchen
- **Eltern**: Suche nach altersgerechten Trainings für Kinder
- **Trainer**: Übersicht über alle Trainings
- **Website-Besucher**: Kann als Iframe in FAM-Website eingebunden werden

---

## 🛠 Technologie-Stack

### Frontend-Framework

- **Alpine.js 3.15**: Reaktives Framework (leichtgewichtig, ~15KB)
- **Tailwind CSS v4.1**: Utility-First CSS-Framework
- **Vite 7.1**: Build-Tool & Dev-Server (schnellstes Build-System)

### Libraries

| Library | Version | Zweck |
|---------|---------|-------|
| **Fuse.js** | 7.0.0 | Fuzzy-Search für Trainings |
| **Leaflet** | 1.9.4 | Interaktive Karten |
| **Workbox** | 7.3.0 | Service Worker & PWA |

### Alpine.js Plugins

- **@alpinejs/collapse**: Animierte Transitions
- **@alpinejs/focus**: Focus-Management für Accessibility
- **@alpinejs/intersect**: Lazy-Loading & Infinite Scroll
- **@alpinejs/persist**: LocalStorage-Persistierung

### Testing

| Tool | Zweck |
|------|-------|
| **Playwright 1.48** | E2E-Tests (Multi-Browser) |
| **Vitest 3.2** | Unit & Integration Tests |
| **Puppeteer 24.23** | Legacy E2E-Tests |
| **Axe-Core** | Accessibility-Tests |
| **jsdom** | DOM-Simulation für Unit-Tests |

### Build & DevOps

- **Node.js**: ≥ 20.19.0
- **npm**: ≥ 10.0.0
- **ESLint 9**: Code-Linting
- **Prettier 3**: Code-Formatting

### Browser-Support

**Desktop:**
- Chrome 111+
- Firefox 128+
- Safari 16.4+
- Edge 90+

**Mobile:**
- iOS Safari 14+
- Chrome Android 90+
- Samsung Internet 14+

---

## 🏗 Architektur-Übersicht

### High-Level Architektur

```
┌─────────────────────────────────────────────────────────┐
│                   Client (Browser)                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   index.html │→ │   main.js    │→ │  Alpine.js   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                            ↓                             │
│         ┌──────────────────┴────────────────┐           │
│         ↓                                    ↓           │
│  ┌──────────────┐                  ┌──────────────┐    │
│  │ trainings-   │                  │   Alpine     │    │
│  │ planer.js    │←────────────────→│   Store      │    │
│  └──────────────┘                  └──────────────┘    │
│         ↓                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   utils.js   │  │  config.js   │  │ calendar-    │  │
│  │              │  │              │  │ integration  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
├─────────────────────────────────────────────────────────┤
│                   Service Worker                         │
│              (Offline, Caching, Updates)                 │
├─────────────────────────────────────────────────────────┤
│                   External APIs                          │
│  • trainingsplan.json (Daten)                            │
│  • version.json (Update-Check)                           │
│  • OpenStreetMap (Karten-Tiles)                          │
│  • Google Calendar API (Export)                          │
└─────────────────────────────────────────────────────────┘
```

### Design-Patterns

#### 1. **Component-Based Architecture**
- Alpine.js Data-Components: `trainingsplaner()`
- Separation of Concerns: Logic in JS, Struktur in HTML, Styling in CSS

#### 2. **State Management**
- **Global Store**: `Alpine.store('ui')` für UI-State (Filter, Modals, Notifications)
- **Component State**: Lokaler State in `trainingsplaner` für Trainings-Daten
- **Persistence**: `Alpine.$persist()` für LocalStorage-Sync

#### 3. **Module Pattern**
- ES6 Modules für Code-Organisation
- Named Exports für bessere Tree-Shaking
- Immutable Config-Objekte (`Object.freeze`)

#### 4. **Factory Pattern**
- `trainingsplaner()` ist eine Factory-Funktion
- Erzeugt isolierte Component-Instanzen

#### 5. **Observer Pattern**
- Alpine.js Reactivity: `$watch()` für Filter-Changes
- Service Worker: Update-Notifications
- Intersection Observer: Lazy-Loading

#### 6. **Strategy Pattern**
- Kalender-Export: Multiple Strategien (Google, Outlook, iCal)
- Caching: NetworkFirst vs CacheFirst Strategien

---

## 📁 Code-Organisation

### Verzeichnisstruktur

```
fam-trainingsplan/
├── .claude/                      # Claude Code Konfiguration
│   ├── commands/                 # Custom Slash-Commands
│   │   ├── tools.md             # Tools-Dokumentation
│   │   └── update-docs.md       # Docs-Update-Command
│   └── settings.json            # Claude-Einstellungen
├── docs/                         # Dokumentation
│   ├── CALENDAR_UI_COMPONENTS.md
│   └── GOOGLE_CALENDAR_INTEGRATION.md
├── public/                       # Statische Assets
│   ├── icons/                    # PWA-Icons (72x72 bis 512x512)
│   ├── screenshots/              # App-Screenshots
│   ├── manifest.json             # PWA-Manifest
│   ├── offline.html              # Offline-Fallback
│   └── version.json              # Version für Update-Check
├── src/                          # Source-Code
│   ├── js/                       # JavaScript-Module
│   │   ├── calendar-integration.js  # Kalender-Export
│   │   ├── config.js                # Zentrale Konfiguration
│   │   ├── iframe-resize.js         # Iframe-Auto-Resize
│   │   ├── trainingsplaner.js       # Haupt-Komponente
│   │   └── utils.js                 # Helper-Funktionen
│   ├── main.js                   # Entry Point
│   └── style.css                 # Tailwind + Custom CSS
├── tests/                        # Test-Suite
│   ├── e2e/                      # End-to-End Tests (Playwright)
│   │   ├── accessibility.spec.js    # A11y-Tests (Axe)
│   │   ├── main.spec.js             # Core Functionality
│   │   ├── performance.spec.js      # Performance-Tests
│   │   ├── pwa-offline.spec.js      # Offline-Tests
│   │   ├── user-flows.spec.js       # User Journeys
│   │   ├── visual-regression.spec.js # Screenshot-Tests
│   │   └── test-helpers.js          # E2E-Helpers
│   ├── integration/              # Integration Tests (Vitest)
│   │   ├── favorites.test.js
│   │   ├── filter-system.test.js
│   │   ├── notifications.test.js
│   │   ├── search.test.js
│   │   └── test-helpers.js
│   ├── puppeteer/                # Legacy E2E-Tests
│   │   ├── app-basic.test.js
│   │   ├── calendar-integration.test.js
│   │   └── helpers/
│   └── unit/                     # Unit-Tests (Vitest)
├── index.html                    # HTML-Template
├── vite.config.js                # Vite Build-Config
├── playwright.config.js          # Playwright-Config
├── vitest.config.js              # Vitest-Config
├── vitest.workspace.js           # Vitest Workspace
├── puppeteer.config.js           # Puppeteer-Config
├── .eslintrc.json                # ESLint-Regeln
├── package.json                  # Dependencies & Scripts
├── README.md                     # Projekt-Dokumentation
├── ROADMAP.md                    # Feature-Roadmap
└── CLAUDE_SETUP.md               # Claude-Setup-Guide
```

### Code-Organisation Best Practices

#### 1. **Single Responsibility Principle**
- Jedes Modul hat eine klare, einzelne Verantwortung
- `config.js`: Nur Konfiguration
- `utils.js`: Nur Helper-Funktionen
- `trainingsplaner.js`: Nur Haupt-Logik

#### 2. **Dependency Injection**
- Konfiguration wird übergeben, nicht global gelesen
- Funktionen sind testbar durch DI

#### 3. **Immutability**
- `CONFIG` ist `Object.freeze()` → unveränderbar
- Verhindert ungewollte Seiteneffekte

#### 4. **Error Boundaries**
- Try-Catch in kritischen Bereichen
- Global Error Handlers für Fallback

---

## 🧩 Hauptkomponenten

### 1. `main.js` - Entry Point

**Verantwortlichkeiten:**
- Alpine.js Setup & Plugin-Registration
- Global Store Definition
- PWA-Initialisierung
- Touch-Gesten Setup
- Error Handling

**Wichtige Funktionen:**

```javascript
registerAlpinePlugins()     // Alpine-Plugins registrieren
setupPWA()                  // Service Worker + Updates
initTouchGestures()         // Swipe-Gesten (Mobile)
setupPerformanceMonitoring() // Performance-Observer
initIframe()                // Iframe-Auto-Resize
```

**Global Store:**

```javascript
Alpine.store('ui', {
  filterSidebarOpen: true,
  mapModalOpen: false,
  mobileFilterOpen: false,
  notification: null,
  filters: { ... },

  showNotification(msg, type, duration),
  hideNotification(),
  resetFilters()
})
```

---

### 2. `trainingsplaner.js` - Haupt-Komponente

**Verantwortlichkeiten:**
- Trainings-Daten laden & cachen
- Filter-Logik
- Favoriten-Management
- Geolocation & Distanz-Berechnung
- Karten-Integration (Leaflet)
- Update-Check

**State:**

```javascript
{
  allTrainings: [],           // Alle Trainings
  filteredTrainings: [],      // Gefilterte Trainings
  metadata: {},               // Metadaten (Orte, Arten, etc.)
  loading: true,
  error: null,
  favorites: [],
  userPosition: null,
  map: null,
  fuse: null                  // Fuse.js Instanz
}
```

**Computed Properties:**

```javascript
wochentage          // Alle Wochentage
orte                // Alle Standorte
trainingsarten      // Alle Trainingsarten
altersgruppen       // Alle Altersgruppen
groupedTrainings    // Nach Wochentag gruppiert
favoriteTrainings   // Nur Favoriten
hasActiveFilters    // Filter aktiv?
filteredTrainingsCount // Anzahl gefilterte Trainings
```

**Lifecycle:**

```javascript
init()              // Daten laden, Cache prüfen
loadData(data)      // Daten in Component laden
watchFilters()      // Filter-Änderungen beobachten
destroy()           // Cleanup (Map, Intervals, etc.)
```

**Filtering:**

```javascript
applyFilters()      // Alle Filter anwenden
matchesAltersgruppe(training, filter)
sortTrainings(trainings)
```

**Kalender-Integration:**

```javascript
addToCalendar(training, provider)  // Single-Export
exportAllToCalendar()              // Bulk-Export (.ics)
exportFavoritesToCalendar()        // Favoriten-Export
bulkAddToGoogleCalendar()          // Google Calendar Bulk
```

**Geolocation:**

```javascript
requestUserLocation()       // GPS-Position abrufen
addDistanceToTrainings()    // Distanz zu allen Trainings
```

**Map:**

```javascript
initializeMap()             // Leaflet-Map erstellen
addMarkersToMap()           // Marker hinzufügen
createMapPopup(training)    // Popup-HTML generieren
cleanupMap()                // Map-Ressourcen freigeben
```

---

### 3. `config.js` - Zentrale Konfiguration

**Struktur:**

```javascript
export const CONFIG = Object.freeze({
  jsonUrl: 'https://...',
  versionUrl: 'https://...',

  cacheEnabled: true,
  cacheKey: 'trainingsplan_cache_v3',
  cacheDuration: 3600000, // 1 Stunde

  search: {
    debounceDelay: 300,
    fuseOptions: { ... }
  },

  filters: {
    persistInUrl: true,
    urlParams: { ... }
  },

  map: {
    defaultCenter: [48.137, 11.576],
    defaultZoom: 12,
    geolocation: { ... }
  },

  ui: {
    mobileBreakpoint: 768,
    touch: { ... }
  },

  features: {
    enableMap: true,
    enableSearch: true,
    enableFavorites: true,
    enableGeolocation: true,
    enableCalendarExport: true,
    enableTouchGestures: true,
    // ... weitere Feature-Flags
  },

  pwa: {
    enabled: true,
    version: '3.0.0',
    updateStrategy: 'prompt'
  },

  logging: {
    enabled: isDev,
    level: 'debug'
  }
})
```

**Helper-Funktionen:**

```javascript
isFeatureEnabled(feature)   // Feature-Flag prüfen
shouldLog(level)            // Log-Level prüfen
log(level, msg, ...args)    // Strukturiertes Logging
getBrowserInfo()            // Browser-Capabilities
isValidCoordinates(lat,lng) // Koordinaten-Validation
```

**Vorteile:**
- ✅ Single Source of Truth
- ✅ Type-Safe durch Immutability
- ✅ Validation beim Start (Dev-Mode)
- ✅ Feature-Flags für A/B-Tests
- ✅ Environment-spezifische Configs

---

### 4. `utils.js` - Helper-Funktionen

**Kategorien:**

#### A. String-Utilities
```javascript
formatZeitrange(von, bis)   // "18:00 - 20:00"
formatAlter(training)       // "6 - 11 Jahre"
zeitZuMinuten(zeit)         // "18:30" → 1110
```

#### B. Array-Utilities
```javascript
extractUnique(arr, key)     // Eindeutige Werte extrahieren
groupBy(arr, key)           // Gruppieren nach Eigenschaft
```

#### C. Favorites
```javascript
favorites.load()            // Favoriten laden
favorites.add(id)           // Favorit hinzufügen
favorites.remove(id)        // Favorit entfernen
favorites.toggle(id)        // Toggle Favorit
favorites.has(id)           // Favorit vorhanden?
```

#### D. Geolocation
```javascript
getCurrentPosition()        // GPS-Position (Promise)
calculateDistance(lat1,lng1,lat2,lng2) // Haversine-Formel
addDistanceToTrainings(trainings, pos) // Distanz zu allen
```

#### E. URL-Handling
```javascript
getFiltersFromUrl()         // URL-Parameter → Filter
createShareLink(filters)    // Filter → Share-URL
updateUrlWithFilters(filters) // URL aktualisieren
```

#### F. Kalender-Integration
```javascript
createICalEvent(training)   // iCal-String generieren
createICalBundle(trainings) // Multiple Events
downloadICalFile(content, filename)
calculateNextTrainingDate(training) // Nächster Termin
```

#### G. Clipboard & Share
```javascript
copyToClipboard(text)       // Text kopieren
shareViaAPI(data)           // Native Share API
```

#### H. Cache & Storage
```javascript
cache.get(key)              // Cache lesen
cache.set(key, data, ttl)   // Cache schreiben
cache.clear(key)            // Cache löschen
storage.get(key)            // LocalStorage lesen
storage.set(key, data)      // LocalStorage schreiben
```

---

### 5. `calendar-integration.js` - Kalender-Export

**Unterstützte Provider:**

1. **Google Calendar** → URL-basiert
2. **Outlook** → URL-basiert
3. **Office 365** → URL-basiert
4. **Yahoo Calendar** → URL-basiert
5. **Apple Calendar** → .ics-Download
6. **Generic iCal** → .ics-Download

**Funktionen:**

```javascript
detectCalendarProvider()    // Auto-Detection
createGoogleCalendarUrl(training)
createOutlookCalendarUrl(training)
createOffice365CalendarUrl(training)
createYahooCalendarUrl(training)
downloadICalFile(training)
bulkAddToGoogleCalendar(trainings, opts)
getCalendarProviderName(provider)
```

**iCal-Format:**

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//FAM//Trainingsplan//DE
BEGIN:VEVENT
UID:0@fam-trainingsplan
DTSTART:20250120T180000Z
DTEND:20250120T200000Z
SUMMARY:Parkour - LTR
DESCRIPTION:Parkour\nAltersgruppe: 6 - 11 Jahre\n...
LOCATION:LTR, München
URL:https://fam.kurabu.com/...
RRULE:FREQ=WEEKLY;BYDAY=MO
END:VEVENT
END:VCALENDAR
```

**Bulk-Export-Strategie:**

- **Limit**: Max 10 Trainings gleichzeitig
- **Delay**: 600ms zwischen Exports
- **Progress-Callback**: Real-time Feedback
- **Error-Handling**: Graceful Degradation

---

## 🔄 State Management

### Architektur

```
┌────────────────────────────────────────────┐
│         Alpine Global Store (ui)           │
│  • UI-State (Modals, Sidebar)              │
│  • Filter-State (Persisted)                │
│  • Notifications                           │
└────────────┬───────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────┐
│    trainingsplaner Component State         │
│  • Trainings-Daten                         │
│  • Favorites                               │
│  • User-Position                           │
│  • Map-State                               │
└────────────┬───────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────┐
│          LocalStorage / Cache              │
│  • trainingFilters (Persisted)             │
│  • trainingsplan_favorites_v1              │
│  • trainingsplan_cache_v3                  │
│  • filterSidebarOpen                       │
└────────────────────────────────────────────┘
```

### Persistierungs-Strategie

#### 1. **Alpine.$persist() - Filter & UI**

```javascript
filters: Alpine.$persist({
  wochentag: '',
  ort: '',
  training: '',
  altersgruppe: '',
  searchTerm: '',
  activeQuickFilter: null
}).as('trainingFilters')
```

- Automatische Synchronisation mit LocalStorage
- Reaktive Updates
- Key: `_x_trainingFilters`

#### 2. **Manual LocalStorage - Favoriten**

```javascript
localStorage.setItem(
  'trainingsplan_favorites_v1',
  JSON.stringify([1, 5, 12])
)
```

- Manuelle Kontrolle über Serialisierung
- Versionierung im Key

#### 3. **Cache mit TTL - Trainings-Daten**

```javascript
{
  timestamp: 1729180800000,
  data: { trainings: [...], metadata: {...} }
}
```

- TTL: 1 Stunde (konfigurierbar)
- Automatic Expiration
- Key: `trainingsplan_cache_v3`

### Reaktivität

#### Alpine Reactivity Flow

```
User-Input (z.B. Filter ändern)
    ↓
Alpine.$watch() triggert
    ↓
applyFilters() wird aufgerufen
    ↓
filteredTrainings wird aktualisiert
    ↓
DOM wird automatisch re-rendered
    ↓
URL wird aktualisiert (History API)
```

#### Watch-Example

```javascript
this.$watch('$store.ui.filters', () => {
  clearTimeout(filterChangeTimeout)
  filterChangeTimeout = setTimeout(() => {
    this.applyFilters()
  }, 100) // Debounced
}, { deep: true })
```

---

## 🎨 Features & Funktionalität

### Core Features (v2.4.0)

#### 1. **Dynamische Filter**
- ✅ Wochentag-Filter
- ✅ Orts-Filter
- ✅ Trainingsart-Filter
- ✅ Altersgruppen-Filter
- ✅ Kombinierbar
- ✅ URL-Persistierung

#### 2. **Fuzzy-Suche (Fuse.js)**
- ✅ Multi-Field-Search (Training, Ort, Trainer)
- ✅ Gewichtung nach Relevanz
- ✅ Typo-Toleranz
- ✅ Debounced (300ms)

#### 3. **Favoriten-System**
- ✅ Trainings als Favoriten markieren
- ✅ LocalStorage-Persistierung
- ✅ Quick-Filter "Favoriten"
- ✅ Batch-Export

#### 4. **Geolocation - "In meiner Nähe"**
- ✅ GPS-basierte Standortermittlung
- ✅ Distanz-Berechnung (Haversine)
- ✅ Sortierung nach Entfernung
- ✅ Max-Distance-Filter (50km)
- ✅ Permissions-Handling

#### 5. **Kalender-Export**

**Single-Export:**
- Google Calendar URL
- Outlook URL
- Office 365 URL
- Yahoo URL
- .ics-Download (Apple, Generic)

**Bulk-Export:**
- Alle gefilterten Trainings
- Nur Favoriten
- .ics-Bundle mit allen Events

#### 6. **Share-Funktionalität**
- ✅ Native Share API (Mobile)
- ✅ Fallback: Clipboard
- ✅ Teilt aktuelle Filter
- ✅ Deep-Links

#### 7. **PWA (Progressive Web App)**

**Installation:**
- Android: "Zum Startbildschirm hinzufügen"
- iOS: "Zum Home-Bildschirm"
- Desktop: "App installieren"

**Features:**
- ✅ Offline-Modus (Service Worker)
- ✅ App-Icons (72x72 bis 512x512)
- ✅ App-Shortcuts (Heute, Karte, Favoriten)
- ✅ Auto-Update mit Benachrichtigung
- ✅ Background-Sync (vorbereitet)

#### 8. **Touch-Gesten (Mobile)**
- ✅ Swipe Right → Filter öffnen
- ✅ Swipe Left → Filter schließen
- ✅ Velocity-Detection
- ✅ Touch-Optimierte Buttons

#### 9. **Interaktive Karte (Leaflet)**
- ✅ OpenStreetMap-Integration
- ✅ Marker für alle Trainings
- ✅ Clustering (bei vielen Trainings)
- ✅ Popups mit Infos
- ✅ Auto-Fit Bounds
- ✅ User-Interaction-Detection

#### 10. **Responsive Design**
- ✅ Mobile-First Approach
- ✅ Breakpoints: Mobile (< 768px), Tablet, Desktop
- ✅ Touch-Optimierung
- ✅ Adaptive UI (Sidebar vs Drawer)

#### 11. **Update-Check**
- ✅ Automatische Prüfung (1x pro Stunde)
- ✅ Version-Vergleich
- ✅ Update-Benachrichtigung
- ✅ Service Worker Update

---

## 🧪 Testing-Strategie

### Test-Pyramide

```
         ┌─────────────┐
         │   E2E (20)  │  ← Playwright
         │   Tests     │
         └─────────────┘
       ┌───────────────────┐
       │  Integration (15) │  ← Vitest
       │     Tests         │
       └───────────────────┘
     ┌───────────────────────┐
     │   Unit Tests (25)     │  ← Vitest + jsdom
     │                       │
     └───────────────────────┘
```

### 1. **E2E-Tests (Playwright)**

**Datei: `tests/e2e/`**

#### a) `main.spec.js` - Core Functionality
```javascript
✓ App sollte laden
✓ Filter sollten funktionieren
✓ Suche sollte funktionieren
✓ Karte sollte öffnen
✓ Touch-Gesten (Mobile)
✓ Online/Offline-Detection
```

#### b) `accessibility.spec.js` - A11y (Axe-Core)
```javascript
✓ Keine Accessibility-Violations
✓ Alle Buttons haben accessible names
✓ Ausreichender Kontrast
✓ Skip-Link vorhanden
✓ ARIA-Regionen korrekt
✓ Keyboard-Navigation
```

#### c) `performance.spec.js` - Performance
```javascript
✓ Time to First Byte < 500ms
✓ DOM Content Loaded < 2s
✓ Largest Contentful Paint < 2.5s
✓ First Input Delay < 100ms
✓ Cumulative Layout Shift < 0.1
✓ DOM-Size < 1500 Elemente
✓ Alpine.js init < 500ms
✓ Search Performance < 300ms
```

#### d) `pwa-offline.spec.js` - PWA & Offline
```javascript
✓ Service Worker registriert
✓ Offline-Modus funktioniert
✓ Cached Data wird angezeigt
✓ Failed Fetch handled gracefully
✓ Online-Notification erscheint
✓ Update-Benachrichtigung funktioniert
```

#### e) `visual-regression.spec.js` - Screenshots
```javascript
✓ Homepage (Desktop, Tablet, Mobile)
✓ Filter-Sidebar
✓ Map-Modal
✓ Mobile-Header
✓ Training-Cards
✓ Notifications
✓ Light/Dark-Mode
✓ Breakpoints (320px, 375px, 768px, 1366px, 1920px)
```

#### f) `user-flows.spec.js` - User Journeys
```javascript
✓ Neuer Nutzer: Trainings finden
✓ Favoriten-Workflow
✓ Kalender-Export-Flow
✓ Share-Flow
✓ Geolocation-Flow
```

**Playwright-Konfiguration:**

```javascript
projects: [
  { name: 'chromium' },
  { name: 'firefox' },
  { name: 'webkit' },
  { name: 'Mobile Chrome', use: devices['Pixel 5'] },
  { name: 'Mobile Safari', use: devices['iPhone 13'] },
  { name: 'iPad', use: devices['iPad Pro'] }
]
```

- **6 Browser-Konfigurationen**
- **Parallel-Execution** (CI: workers=1, Local: workers=auto)
- **Retries**: 2x in CI
- **Screenshots** bei Fehlern
- **Videos** bei Fehlern

### 2. **Integration-Tests (Vitest)**

**Datei: `tests/integration/`**

#### a) `filter-system.test.js`
```javascript
✓ Filter kombinieren
✓ URL-Persistierung
✓ Filter zurücksetzen
✓ Quick-Filter
```

#### b) `search.test.js`
```javascript
✓ Fuse.js Fuzzy-Search
✓ Multi-Field-Search
✓ Typo-Toleranz
✓ Empty-Results-Handling
```

#### c) `favorites.test.js`
```javascript
✓ Favorit hinzufügen
✓ Favorit entfernen
✓ Favorit toggle
✓ LocalStorage-Persistierung
✓ Max-Favorites-Limit
```

#### d) `notifications.test.js`
```javascript
✓ Notification anzeigen
✓ Auto-Hide nach Timeout
✓ Notification-Queue
✓ Error-Notifications
```

### 3. **Unit-Tests (Vitest + jsdom)**

**Datei: `tests/unit/`**

```javascript
// utils.test.js
✓ formatZeitrange()
✓ formatAlter()
✓ zeitZuMinuten()
✓ calculateDistance()
✓ extractUnique()

// config.test.js
✓ isFeatureEnabled()
✓ shouldLog()
✓ getBrowserInfo()
✓ isValidCoordinates()

// favorites.test.js
✓ favorites.load()
✓ favorites.add()
✓ favorites.toggle()
```

### 4. **Legacy Puppeteer-Tests**

**Datei: `tests/puppeteer/`**

- Backward-Compatibility für alte Tests
- Wird schrittweise zu Playwright migriert

### Test-Commands

```bash
# Unit-Tests
npm run test:unit          # Run once
npm run test:unit:watch    # Watch-Mode
npm run test:unit:ui       # Vitest UI

# Integration-Tests
npm run test:integration
npm run test:integration:watch

# E2E-Tests
npm run test:e2e           # Alle Browser
npm run test:e2e:ui        # Playwright UI
npm run test:e2e:debug     # Debug-Mode
npm run test:e2e:chromium  # Nur Chromium

# Spezifische E2E-Tests
npm run test:visual        # Visual Regression
npm run test:visual:update # Snapshots aktualisieren
npm run test:a11y          # Accessibility
npm run test:perf          # Performance
npm run test:pwa           # PWA & Offline
npm run test:flows         # User Flows

# Coverage
npm run test:coverage      # Unit + Integration
npm run test:all           # Coverage + E2E
```

### CI/CD-Integration

**GitHub Actions:**
```yaml
- name: Run Tests
  run: |
    npm run test:unit
    npm run test:integration
    npm run test:e2e
```

- Tests laufen bei jedem Push/PR
- Playwright installiert Browser automatisch
- Screenshots/Videos als Artifacts
- Test-Reports als HTML

---

## ⚡ Performance & Optimierungen

### Performance-Metriken (Ziele)

| Metrik | Ziel | Aktuell | Status |
|--------|------|---------|--------|
| **TTFB** | < 500ms | ~200ms | ✅ |
| **FCP** | < 1.8s | ~1.2s | ✅ |
| **LCP** | < 2.5s | ~1.8s | ✅ |
| **FID** | < 100ms | ~50ms | ✅ |
| **CLS** | < 0.1 | ~0.05 | ✅ |
| **DOM-Size** | < 1500 | ~800 | ✅ |
| **Bundle** | < 600KB | ~450KB | ✅ |

### Optimierungen

#### 1. **Code-Splitting**

**Vite-Konfiguration:**
```javascript
manualChunks: {
  'vendor-alpine': ['alpinejs', '@alpinejs/*'],
  'vendor-utils': ['fuse.js'],
  'vendor-map': ['leaflet']
}
```

**Resultat:**
- `vendor-alpine.js` → ~80KB
- `vendor-utils.js` → ~60KB
- `vendor-map.js` → ~150KB
- `main.js` → ~30KB

**Vorteil:** Besseres Caching, parallele Downloads

#### 2. **Lazy Loading**

**Alpine Intersect:**
```html
<div x-intersect="$el.classList.add('animate-fade-in')">
  <!-- Content wird geladen wenn sichtbar -->
</div>
```

**Leaflet Map:**
- Map wird erst initialisiert wenn Modal öffnet
- Tiles werden on-demand geladen

**Service Worker:**
```javascript
{
  urlPattern: /\.(?:png|jpg|svg)$/i,
  handler: 'CacheFirst'
}
```

#### 3. **Caching-Strategie**

**Multi-Layer-Cache:**

```
Request → Service Worker → IndexedDB → Network
                ↓              ↓           ↓
            Stale-While-   LocalStorage  Fresh
            Revalidate        Cache       Data
```

**Cache-Typen:**

| Asset-Type | Strategy | TTL |
|------------|----------|-----|
| **HTML** | NetworkFirst | 1h |
| **JS/CSS** | CacheFirst | 30d |
| **Images** | CacheFirst | 30d |
| **Fonts** | CacheFirst | 365d |
| **API-Data** | NetworkFirst | 1h |
| **Map-Tiles** | CacheFirst | 7d |

#### 4. **Debouncing & Throttling**

**Search Debounce:**
```javascript
@input.debounce.300ms="applyFilters()"
```

**Filter Debounce:**
```javascript
setTimeout(() => this.applyFilters(), 100)
```

**Scroll Throttle:**
```javascript
// Alpine Intersect nutzt IntersectionObserver
// → Keine manuelle Scroll-Listener nötig
```

#### 5. **Bundle-Optimierung**

**Vite Build:**
- **Minification**: esbuild (schneller als Terser)
- **Tree-Shaking**: Dead-Code-Elimination
- **Gzip**: ~60% Größen-Reduktion
- **Brotli**: ~70% Größen-Reduktion (Server)

**Asset-Optimization:**
- **Images**: WebP mit PNG-Fallback
- **Icons**: SVG (inline + sprites)
- **Fonts**: WOFF2 only

#### 6. **Virtual Scrolling**

**Aktuell deaktiviert, aber vorbereitet:**

```javascript
performance: {
  enableVirtualScroll: false,
  lazyLoadImages: true
}
```

**Bei >1000 Trainings:** Virtual Scrolling aktivieren

#### 7. **Request Optimization**

**Prefetch:**
```javascript
<link rel="preconnect" href="https://unpkg.com">
<link rel="dns-prefetch" href="https://unpkg.com">
```

**Async Loading:**
```javascript
async function setupPWA() {
  const { registerSW } = await import('virtual:pwa-register')
  // Non-blocking PWA init
}
```

#### 8. **Performance Monitoring**

**PerformanceObserver:**
```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    log('debug', 'Performance', {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ttfb: entry.responseStart - entry.requestStart
    })
  })
})
```

**Custom Metrics:**
```javascript
performance.mark('trainings-loaded')
performance.measure('init-to-loaded', 'navigationStart', 'trainings-loaded')
```

---

## ⚠️ CRITICAL: Vite Plugin Loading Anti-Pattern

**🚨 READ THIS BEFORE MODIFYING LEAFLET/VITE CODE**

### The Problem: Race Conditions in Production Builds
Vite's production build creates optimized chunks that load in UNPREDICTABLE order.
Static imports of Leaflet plugins (like markercluster) can fail with:
```
Uncaught TypeError: L.MarkerClusterGroup is not a constructor
```

### ✅ THE SOLUTION: Dynamic Imports at Point of Use
**Location:** `src/js/trainingsplaner/map-manager.js:497`

```javascript
// CORRECT: Dynamic import RIGHT BEFORE using plugin
async addMarkersWithClustering() {
  await import('leaflet.markercluster')
  await import('leaflet.markercluster/dist/MarkerCluster.css')

  // NOW safe to use
  const markers = L.markerClusterGroup({ ... })
}
```

### ❌ ANTI-PATTERNS - NEVER DO THIS
```javascript
// DON'T: Static import in main.js
import 'leaflet.markercluster' // ❌ Race condition!

// DON'T: Assume load order from vite.config.js
manualChunks: { 'vendor-map': ['leaflet', 'leaflet.markercluster'] } // ❌ Doesn't guarantee order!

// DON'T: Import in separate utility file
// map-utils.js
import 'leaflet.markercluster' // ❌ May load after map-manager!
```

### 📋 Pre-Deployment Checklist
**MANDATORY before ANY deployment:**
1. `npm run build && npm run preview`
2. Open Map View in browser
3. Verify Console: "MarkerCluster plugin loaded dynamically" ✅
4. Test on Chrome, Firefox, Safari (Desktop + Mobile)

**Full Documentation:** `.claude/lessons-learned/VITE-PLUGIN-LOADING.md`

**This problem occurred 3 times. DO NOT try static imports again.**

---

## 📦 Build & Deployment

### Build-Prozess

#### 1. **Development Build**

```bash
npm run dev
```

**Features:**
- Hot Module Replacement (HMR)
- Source Maps
- Debug-Logging
- No Minification
- Port 5173

**Vite Dev-Server:**
- Instant Server Start (~100ms)
- Lightning Fast HMR
- On-Demand Compilation

#### 2. **Production Build**

```bash
npm run build
```

**Pipeline:**
```
src/ → Vite → esbuild → Rollup → dist/
                ↓         ↓
           Minify    Code-Split
                ↓         ↓
           Tree-Shake  Optimize
```

**Output:**
```
dist/
├── assets/
│   ├── js/
│   │   ├── main.[hash].js
│   │   ├── vendor-alpine.[hash].js
│   │   ├── vendor-utils.[hash].js
│   │   └── vendor-map.[hash].js
│   ├── images/
│   │   └── *.webp
│   └── fonts/
│       └── *.woff2
├── icons/
├── index.html
├── manifest.json
└── sw.js  (Service Worker)
```

#### 3. **Preview Build**

```bash
npm run preview
```

- Testet Production-Build lokal
- Port 4173
- Keine HMR

### Build-Optimierungen

#### Vite-Config

```javascript
build: {
  outDir: 'dist',
  minify: 'esbuild',  // Schneller als Terser
  sourcemap: false,   // Keine Source Maps in Prod

  rollupOptions: {
    output: {
      manualChunks: { ... },
      assetFileNames: 'assets/[type]/[name].[hash][extname]',
      chunkFileNames: 'assets/js/[name].[hash].js'
    }
  },

  chunkSizeWarningLimit: 600  // Warnung bei >600KB
}
```

### Deployment

#### GitHub Pages (Standard)

**GitHub Actions Workflow:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**URL:** `https://jasha256.github.io/fam-trainingsplan/`

#### Alternative Plattformen

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod --dir=dist
```

**Cloudflare Pages:**
- Build-Command: `npm run build`
- Output: `dist/`

### Environment-Variablen

**.env.production:**
```bash
VITE_API_URL=https://jasha256.github.io/fam-trainingsplan/trainingsplan.json
VITE_VERSION_URL=https://jasha256.github.io/fam-trainingsplan/version.json
```

**Zugriff im Code:**
```javascript
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 👨‍💻 Entwickler-Workflows

### Setup

```bash
# 1. Repository klonen
git clone https://github.com/jasha256/fam-trainingsplan.git
cd fam-trainingsplan

# 2. Dependencies installieren
npm install

# 3. Dev-Server starten
npm run dev

# 4. In Browser öffnen
# http://localhost:5173
```

### Häufige Tasks

#### Neues Feature entwickeln

```bash
# 1. Branch erstellen
git checkout -b feature/neue-funktion

# 2. Code schreiben
# src/js/...

# 3. Tests schreiben
# tests/unit/neue-funktion.test.js

# 4. Tests ausführen
npm run test:unit

# 5. E2E-Tests
npm run test:e2e

# 6. Build testen
npm run build
npm run preview

# 7. Commit & Push
git add .
git commit -m "feat: Neue Funktion hinzugefügt"
git push origin feature/neue-funktion

# 8. Pull Request erstellen
```

#### Bug fixen

```bash
# 1. Branch erstellen
git checkout -b fix/bug-beschreibung

# 2. Bug reproduzieren
# Test schreiben der Bug zeigt

# 3. Bug fixen
# Code anpassen

# 4. Test sollte jetzt durchlaufen
npm run test:unit

# 5. E2E-Tests
npm run test:e2e

# 6. Commit & Push
git commit -m "fix: Bug XYZ behoben"
```

#### Styling anpassen

```bash
# Tailwind CSS v4 nutzt CSS-Variablen
# src/style.css bearbeiten

# Vite HMR zeigt Änderungen sofort
# Kein Reload nötig
```

### Code-Style

**ESLint:**
```bash
npm run lint
```

**Prettier:**
```bash
npm run format
```

**Automatisch formatieren bei Commit:**
- Husky (wenn konfiguriert)
- VSCode-Extension

### Debugging

#### Browser DevTools

**Alpine DevTools:**
```javascript
window.Alpine  // Zugriff auf Alpine-Instanz
Alpine.version // Version prüfen
```

**Component-State:**
```javascript
// In DevTools Console
document.querySelector('[x-data]').__x.$data
```

#### Logging

**Log-Level ändern:**
```javascript
// In config.js
logging: {
  level: 'debug'  // debug|info|warn|error
}
```

**Custom Logs:**
```javascript
import { log } from './config.js'

log('debug', 'Custom message', { data })
```

#### Performance-Profiling

**Chrome DevTools:**
1. Performance-Tab
2. Record
3. Interact with App
4. Stop
5. Analyze Flame-Chart

---

## 🔒 Sicherheit & Best Practices

### Sicherheits-Features

#### 1. **Content Security Policy (CSP)**

**Meta-Tag in index.html:**
```html
<meta http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' unpkg.com;
        style-src 'self' 'unsafe-inline' unpkg.com;
        img-src 'self' data: https:;
        connect-src 'self' https://jasha256.github.io;
        frame-ancestors 'self' https://www.freeartsofmovement.com;
      ">
```

#### 2. **XSS-Protection**

**Alpine.js Auto-Escaping:**
```html
<!-- Sicher -->
<p x-text="training.name"></p>

<!-- Gefährlich (nur nutzen wenn HTML erlaubt) -->
<p x-html="training.description"></p>
```

**DOMPurify (bei Bedarf):**
```javascript
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(dirty)
```

#### 3. **HTTPS-Enforcement**

**Service Worker:**
```javascript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`)
}
```

#### 4. **Input-Validation**

**Koordinaten:**
```javascript
export function isValidCoordinates(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  )
}
```

**Cache-Key:**
```javascript
export function isValidCacheKey(key) {
  return typeof key === 'string' &&
         key.length > 0 &&
         key.length < 256
}
```

#### 5. **Error-Handling**

**Global Error Handlers:**
```javascript
window.addEventListener('error', (event) => {
  log('error', 'Global Error', event)
  Alpine.store('ui').showNotification(
    'Ein Fehler ist aufgetreten.',
    'error'
  )
})

window.addEventListener('unhandledrejection', (event) => {
  log('error', 'Unhandled Promise Rejection', event.reason)
})
```

#### 6. **Rate-Limiting**

**Debouncing:**
```javascript
// Verhindert exzessive API-Calls
@input.debounce.300ms="search()"
```

**Geolocation:**
```javascript
geolocation: {
  timeout: 10000,          // Max 10 Sekunden
  maximumAge: 300000       // Cache 5 Minuten
}
```

### Best Practices

#### 1. **Immutability**

```javascript
// ✅ Gut
export const CONFIG = Object.freeze({ ... })

// ❌ Schlecht
export let config = { ... }
```

#### 2. **Error-Boundaries**

```javascript
try {
  await riskyOperation()
} catch (error) {
  log('error', 'Operation failed', error)
  showUserFriendlyError()
}
```

#### 3. **Dependency Updates**

```bash
# Regelmäßig prüfen
npm outdated

# Sicherheits-Audit
npm audit

# Automatische Fixes
npm audit fix
```

#### 4. **Code-Reviews**

- Alle PRs müssen reviewed werden
- Mindestens 1 Approval
- Tests müssen durchlaufen

#### 5. **Secrets-Management**

```bash
# ❌ Niemals in Code committen
API_KEY=secret123

# ✅ Environment-Variablen
VITE_API_KEY=secret123

# ✅ .gitignore
.env
.env.local
```

---

## 📚 Weitere Dokumentation

### Vorhandene Docs

1. **README.md** - Projekt-Übersicht, Features, Installation
2. **ROADMAP.md** - Feature-Roadmap, geplante Updates
3. **CLAUDE_SETUP.md** - Claude Code Setup-Anleitung
4. **docs/CALENDAR_UI_COMPONENTS.md** - Kalender-UI-Komponenten
5. **docs/GOOGLE_CALENDAR_INTEGRATION.md** - Google Calendar Integration

### Zusätzliche Ressourcen

**Alpine.js:**
- https://alpinejs.dev/
- https://alpinejs.dev/plugins/persist

**Vite:**
- https://vitejs.dev/
- https://vitejs.dev/guide/build.html

**Tailwind CSS:**
- https://tailwindcss.com/
- https://tailwindcss.com/docs/responsive-design

**Playwright:**
- https://playwright.dev/
- https://playwright.dev/docs/test-configuration

**Vitest:**
- https://vitest.dev/
- https://vitest.dev/guide/

---

## 🤝 Mitwirken

### Contribution-Workflow

1. **Issue erstellen** - Beschreibe Feature/Bug
2. **Fork Repository** - Eigener Fork
3. **Branch erstellen** - `feature/xyz` oder `fix/xyz`
4. **Code schreiben** - Mit Tests
5. **Tests ausführen** - Alle Tests müssen durchlaufen
6. **Pull Request** - Mit ausführlicher Beschreibung

### Commit-Messages

**Format:**
```
type(scope): subject

body

footer
```

**Types:**
- `feat`: Neues Feature
- `fix`: Bug-Fix
- `docs`: Dokumentation
- `style`: Formatting
- `refactor`: Code-Refactoring
- `test`: Tests hinzufügen
- `chore`: Build-Prozess, Dependencies

**Beispiel:**
```
feat(calendar): Add bulk export functionality

Implementiert Bulk-Export für gefilterte Trainings.
Nutzer können jetzt alle gefilterten Trainings auf einmal
als .ics-Datei exportieren.

Closes #123
```

---

## 📞 Support & Kontakt

**GitHub Issues:**
https://github.com/jasha256/fam-trainingsplan/issues

**Website:**
https://www.freeartsofmovement.com

**App:**
https://jasha256.github.io/fam-trainingsplan/

---

**Ende der Dokumentation**

*Generiert am: 2025-10-17*
*Version: 1.0.0*
*Letzte Änderung: Initiale Erstellung*
