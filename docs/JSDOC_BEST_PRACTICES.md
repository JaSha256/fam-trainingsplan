# JSDoc Best Practices - FAM Trainingsplan

**Version:** 1.0.0
**Erstellt:** 2025-10-17
**Ziel:** TypeScript-Level Type-Safety mit JSDoc + ES Modules

---

## 📋 Inhaltsverzeichnis

1. [Warum JSDoc statt TypeScript?](#warum-jsdoc-statt-typescript)
2. [Setup & Tooling](#setup--tooling)
3. [Basis-Syntax](#basis-syntax)
4. [Funktionen dokumentieren](#funktionen-dokumentieren)
5. [Typen definieren](#typen-definieren)
6. [Module & Imports](#module--imports)
7. [Alpine.js spezifisch](#alpinejs-spezifisch)
8. [Vite & Build-Integration](#vite--build-integration)
9. [IDE-Integration (VSCode)](#ide-integration-vscode)
10. [Migration-Plan](#migration-plan)
11. [Beispiele aus dem Projekt](#beispiele-aus-dem-projekt)

---

## 🎯 Warum JSDoc statt TypeScript?

### Vorteile von JSDoc + ES Modules

✅ **Kein Build-Step für Type-Checking** → Schnellere Builds
✅ **Native JavaScript** → Keine Transpilation nötig
✅ **Vite bleibt schnell** → Keine TypeScript-Compilation
✅ **Graduelle Adoption** → Schrittweise hinzufügen
✅ **100% JS-Kompatibilität** → Keine Breaking Changes
✅ **VSCode Intellisense** → Gleiche IDE-Unterstützung wie TS
✅ **Type-Checking optional** → `tsc --noEmit` nur wenn gewünscht
✅ **Einfacher Stack** → Weniger Tooling-Komplexität

### Vergleich: TypeScript vs JSDoc

| Feature | TypeScript | JSDoc + ES |
|---------|-----------|------------|
| **Type-Safety** | ✅ Compile-Time | ✅ Compile-Time (mit tsc) |
| **IDE-Support** | ✅ Exzellent | ✅ Exzellent (VSCode) |
| **Build-Speed** | ⚠️ Langsamer | ✅ Schneller |
| **Learning Curve** | ⚠️ Steiler | ✅ Flacher |
| **Migration** | ⚠️ Big-Bang | ✅ Graduell |
| **Runtime** | ⚠️ Transpilation | ✅ Native JS |
| **Vite-Integration** | ⚠️ Plugin nötig | ✅ Native |

---

## 🛠 Setup & Tooling

### 1. TypeScript installieren (nur für Type-Checking)

```bash
npm install --save-dev typescript @types/node
```

**Warum TypeScript installieren, wenn wir kein TypeScript nutzen?**
→ `tsc` wird nur für Type-Checking genutzt, NICHT für Compilation!

### 2. `tsconfig.json` erstellen

```json
{
  "compilerOptions": {
    // Type-Checking Settings
    "allowJs": true,                    // JSDoc in .js-Dateien
    "checkJs": true,                    // Type-Checking für JS
    "noEmit": true,                     // KEINE Compilation!

    // Module-System
    "module": "ESNext",                 // ES Modules
    "moduleResolution": "bundler",      // Vite Bundler
    "target": "ESNext",                 // Modern JS

    // Type-Checking strictness
    "strict": true,                     // Alle strict-Checks
    "strictNullChecks": true,           // null/undefined prüfen
    "strictFunctionTypes": true,        // Function-Types prüfen
    "noImplicitAny": true,              // Kein implizites any
    "noImplicitThis": true,             // this muss typisiert sein

    // Advanced
    "esModuleInterop": true,            // CommonJS-Import erlauben
    "skipLibCheck": true,               // node_modules überspringen
    "resolveJsonModule": true,          // JSON-Imports
    "allowSyntheticDefaultImports": true,

    // Paths (für Vite-Aliase)
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "~/*": ["src/*"]
    }
  },

  "include": [
    "src/**/*",
    "tests/**/*",
    "*.config.js"
  ],

  "exclude": [
    "node_modules",
    "dist",
    "coverage"
  ]
}
```

### 3. NPM-Script hinzufügen

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch"
  }
}
```

### 4. VSCode-Konfiguration

`.vscode/settings.json`:

```json
{
  "javascript.validate.enable": true,
  "javascript.suggestionActions.enabled": true,
  "javascript.preferences.importModuleSpecifier": "relative",
  "javascript.inlayHints.functionLikeReturnTypes.enabled": true,
  "javascript.inlayHints.parameterTypes.enabled": true,

  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },

  // JSDoc
  "jsdoc.enableJavaScript": true,
  "jsdoc.preferredFormat": "block"
}
```

### 5. ESLint-Integration

`.eslintrc.json`:

```json
{
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "valid-jsdoc": "warn",
    "require-jsdoc": ["warn", {
      "require": {
        "FunctionDeclaration": true,
        "MethodDefinition": true,
        "ClassDeclaration": true,
        "ArrowFunctionExpression": false,
        "FunctionExpression": false
      }
    }]
  }
}
```

---

## 📝 Basis-Syntax

### Einfache Typen

```javascript
/**
 * @type {string}
 */
let username = 'Max'

/**
 * @type {number}
 */
let age = 25

/**
 * @type {boolean}
 */
let isActive = true

/**
 * @type {null}
 */
let emptyValue = null

/**
 * @type {undefined}
 */
let notSet = undefined
```

### Arrays

```javascript
/**
 * @type {string[]}
 */
let names = ['Anna', 'Bob', 'Charlie']

/**
 * @type {Array<number>}
 */
let scores = [10, 20, 30]

/**
 * @type {Array<string | number>}
 */
let mixed = ['text', 42, 'more']
```

### Objects

```javascript
/**
 * @type {{ name: string, age: number }}
 */
let person = {
  name: 'Max',
  age: 25
}

/**
 * @type {Object.<string, number>}
 */
let scores = {
  math: 90,
  english: 85
}

/**
 * @type {Record<string, any>}
 */
let config = {
  timeout: 1000,
  debug: true
}
```

### Optional & Nullable

```javascript
/**
 * @type {string | null}
 */
let nullableString = null

/**
 * @type {number | undefined}
 */
let optionalNumber = undefined

/**
 * @type {string=}  // Shorthand für string | undefined
 */
let optionalShort
```

---

## 🔧 Funktionen dokumentieren

### Basis-Funktion

```javascript
/**
 * Berechnet die Summe zweier Zahlen
 *
 * @param {number} a - Erste Zahl
 * @param {number} b - Zweite Zahl
 * @returns {number} Die Summe von a und b
 */
function add(a, b) {
  return a + b
}
```

### Mit optionalen Parametern

```javascript
/**
 * Formatiert einen Text
 *
 * @param {string} text - Der zu formatierende Text
 * @param {boolean} [uppercase=false] - Text in Großbuchstaben?
 * @param {number} [maxLength] - Maximale Länge (optional)
 * @returns {string} Formatierter Text
 */
function formatText(text, uppercase = false, maxLength) {
  let result = uppercase ? text.toUpperCase() : text
  if (maxLength) {
    result = result.substring(0, maxLength)
  }
  return result
}
```

### Mit Objekten als Parameter

```javascript
/**
 * Erstellt einen Benutzer
 *
 * @param {Object} options - Optionen
 * @param {string} options.name - Name des Benutzers
 * @param {number} options.age - Alter des Benutzers
 * @param {string} [options.email] - Email (optional)
 * @returns {User} Erstellter Benutzer
 */
function createUser({ name, age, email }) {
  return { name, age, email }
}
```

### Async-Funktionen

```javascript
/**
 * Lädt Trainings-Daten vom Server
 *
 * @async
 * @param {string} url - API-URL
 * @returns {Promise<Training[]>} Array von Trainings
 * @throws {Error} Wenn Fetch fehlschlägt
 */
async function fetchTrainings(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}
```

### Arrow-Functions

```javascript
/**
 * @type {(name: string) => string}
 */
const greet = (name) => `Hello, ${name}!`

/**
 * @type {(items: string[]) => number}
 */
const countItems = (items) => items.length
```

### Callbacks

```javascript
/**
 * Führt Callback für jedes Item aus
 *
 * @param {any[]} items - Array von Items
 * @param {(item: any, index: number) => void} callback - Callback-Funktion
 * @returns {void}
 */
function forEach(items, callback) {
  for (let i = 0; i < items.length; i++) {
    callback(items[i], i)
  }
}
```

---

## 🎨 Typen definieren

### Typedef - Komplexe Typen

```javascript
/**
 * @typedef {Object} Training
 * @property {number} id - Eindeutige ID
 * @property {string} wochentag - Wochentag (Montag, Dienstag, ...)
 * @property {string} ort - Standort
 * @property {string} von - Startzeit (HH:MM)
 * @property {string} bis - Endzeit (HH:MM)
 * @property {string} training - Trainingsart (Parkour, Trampolin, ...)
 * @property {string} altersgruppe - Altersgruppe
 * @property {number} alterVon - Minimales Alter
 * @property {number} alterBis - Maximales Alter
 * @property {string} trainer - Name des Trainers
 * @property {string} probetraining - "ja" oder "nein"
 * @property {string} [anmerkung] - Optional: Anmerkung
 * @property {string} link - Anmelde-Link
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {string} [distanceText] - Optional: "2.3 km"
 * @property {number} [distance] - Optional: Distanz in km
 */

/**
 * Lädt Trainings
 *
 * @param {string} url - API-URL
 * @returns {Promise<Training[]>} Array von Trainings
 */
async function loadTrainings(url) {
  // ...
}
```

### Enum-ähnliche Typen

```javascript
/**
 * @typedef {'info' | 'success' | 'warning' | 'error'} NotificationType
 */

/**
 * @typedef {Object} Notification
 * @property {string} message - Nachricht
 * @property {NotificationType} type - Typ
 * @property {boolean} show - Sichtbar?
 */

/**
 * Zeigt Notification
 *
 * @param {string} message - Nachricht
 * @param {NotificationType} type - Typ
 * @returns {void}
 */
function showNotification(message, type) {
  // ...
}
```

### Generics

```javascript
/**
 * @template T
 * @param {T[]} array - Array
 * @param {(item: T) => boolean} predicate - Filter-Funktion
 * @returns {T[]} Gefiltertes Array
 */
function filter(array, predicate) {
  return array.filter(predicate)
}

// Verwendung:
/** @type {Training[]} */
const trainings = []
const parkourTrainings = filter(trainings, t => t.training === 'Parkour')
```

### Union-Types

```javascript
/**
 * @typedef {string | number} ID
 */

/**
 * @param {ID} id - ID (String oder Zahl)
 * @returns {Training | null}
 */
function findTraining(id) {
  // ...
}
```

### Intersection-Types (via Typedef)

```javascript
/**
 * @typedef {Object} Coordinates
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} TrainingBase
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {TrainingBase & Coordinates} TrainingWithLocation
 */
```

---

## 📦 Module & Imports

### Named Exports

```javascript
// utils.js

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {number} age
 */

/**
 * Formatiert Zeit
 *
 * @param {string} von - Startzeit
 * @param {string} bis - Endzeit
 * @returns {string} Formatierte Zeitrange
 */
export function formatZeitrange(von, bis) {
  return `${von} - ${bis}`
}

/**
 * @type {string[]}
 */
export const WOCHENTAGE = [
  'Montag', 'Dienstag', 'Mittwoch',
  'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'
]
```

### Import mit Types

```javascript
// trainingsplaner.js

/**
 * @typedef {import('./utils.js').User} User
 */

import { formatZeitrange, WOCHENTAGE } from './utils.js'

/**
 * @param {User} user - Benutzer
 * @returns {string}
 */
function greetUser(user) {
  return `Hello, ${user.name}`
}
```

### Default-Export

```javascript
// config.js

/**
 * @typedef {Object} Config
 * @property {string} apiUrl
 * @property {number} cacheTimeout
 */

/**
 * @type {Readonly<Config>}
 */
const CONFIG = Object.freeze({
  apiUrl: 'https://...',
  cacheTimeout: 3600
})

export default CONFIG
```

### Type-Only Imports

```javascript
/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').Filter} Filter
 * @typedef {import('./types.js').Metadata} Metadata
 */

// Jetzt können Training, Filter, Metadata als Typen genutzt werden
```

---

## 🎯 Alpine.js spezifisch

### Component-Factory

```javascript
/**
 * @typedef {Object} TrainingsplanerState
 * @property {Training[]} allTrainings - Alle Trainings
 * @property {Training[]} filteredTrainings - Gefilterte Trainings
 * @property {boolean} loading - Lädt?
 * @property {string | null} error - Fehler
 * @property {number[]} favorites - Favoriten-IDs
 * @property {Object | null} map - Leaflet-Map
 */

/**
 * @typedef {Object} TrainingsplanerMethods
 * @property {() => Promise<void>} init - Initialisierung
 * @property {() => void} applyFilters - Filter anwenden
 * @property {(id: number) => void} toggleFavorite - Favorit toggle
 */

/**
 * @typedef {TrainingsplanerState & TrainingsplanerMethods} TrainingsplanerComponent
 */

/**
 * Erstellt Trainingsplaner-Komponente
 *
 * @returns {TrainingsplanerComponent} Alpine-Komponente
 */
export function trainingsplaner() {
  return {
    // State
    allTrainings: [],
    filteredTrainings: [],
    loading: true,
    error: null,
    favorites: [],
    map: null,

    /**
     * Initialisierung
     *
     * @this {TrainingsplanerComponent}
     * @returns {Promise<void>}
     */
    async init() {
      try {
        const data = await fetchData()
        this.allTrainings = data.trainings
        this.applyFilters()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Filter anwenden
     *
     * @this {TrainingsplanerComponent}
     * @returns {void}
     */
    applyFilters() {
      // Implementation
    },

    /**
     * Favorit toggle
     *
     * @this {TrainingsplanerComponent}
     * @param {number} id - Training-ID
     * @returns {void}
     */
    toggleFavorite(id) {
      // Implementation
    }
  }
}
```

### Alpine Store

```javascript
/**
 * @typedef {Object} UIStore
 * @property {boolean} filterSidebarOpen
 * @property {boolean} mapModalOpen
 * @property {Notification | null} notification
 * @property {Filter} filters
 */

/**
 * @param {typeof import('alpinejs').default} Alpine
 * @returns {void}
 */
export function setupStore(Alpine) {
  Alpine.store('ui', {
    filterSidebarOpen: true,
    mapModalOpen: false,
    notification: null,
    filters: {
      wochentag: '',
      ort: '',
      training: ''
    },

    /**
     * @param {string} message
     * @param {NotificationType} type
     * @returns {void}
     */
    showNotification(message, type) {
      this.notification = { message, type, show: true }
    }
  })
}
```

---

## ⚙️ Vite & Build-Integration

### Vite-Config mit JSDoc

```javascript
// vite.config.js

import { defineConfig } from 'vite'

/**
 * @typedef {import('vite').UserConfig} ViteConfig
 */

/**
 * Vite-Konfiguration
 *
 * @type {ViteConfig}
 */
export default defineConfig({
  base: './',

  plugins: [
    // ...
  ],

  build: {
    outDir: 'dist',
    minify: 'esbuild',

    rollupOptions: {
      output: {
        /**
         * @param {string} id - Modul-ID
         * @returns {string | undefined} Chunk-Name
         */
        manualChunks(id) {
          if (id.includes('alpinejs')) {
            return 'vendor-alpine'
          }
          if (id.includes('leaflet')) {
            return 'vendor-map'
          }
        }
      }
    }
  }
})
```

### Type-Safe Env-Variables

```javascript
// src/js/env.d.js (Type-Definitionen)

/**
 * @typedef {Object} ImportMetaEnv
 * @property {string} VITE_API_URL - API-URL
 * @property {string} VITE_VERSION_URL - Version-URL
 * @property {'development' | 'production' | 'test'} MODE - Environment
 * @property {boolean} DEV - Development-Mode?
 * @property {boolean} PROD - Production-Mode?
 */

/**
 * @typedef {Object} ImportMeta
 * @property {ImportMetaEnv} env
 */
```

```javascript
// src/js/config.js

/// <reference path="./env.d.js" />

/**
 * API-URL aus Environment
 *
 * @type {string}
 */
const apiUrl = import.meta.env.VITE_API_URL || 'https://default.com'

/**
 * Development-Mode?
 *
 * @type {boolean}
 */
export const isDev = import.meta.env.MODE === 'development'
```

---

## 💻 IDE-Integration (VSCode)

### IntelliSense

VSCode erkennt JSDoc automatisch:

```javascript
/**
 * @param {Training} training
 */
function showTraining(training) {
  // VSCode zeigt jetzt alle Properties von Training:
  training.id         // ✓ number
  training.wochentag  // ✓ string
  training.ort        // ✓ string
  // ...
}
```

### Type-Hints inline

VSCode zeigt Typ-Informationen:

```javascript
const result = formatZeitrange('18:00', '20:00')
//    ^
//    const result: string
```

### Auto-Completion

Bei Objekt-Properties:

```javascript
/** @type {Training} */
const training = data.trainings[0]

training.  // ← VSCode zeigt alle Properties
//       ↓
//       id, wochentag, ort, von, bis, ...
```

### Go-to-Definition

`Ctrl+Click` auf Typ → Springt zur Definition

### Error-Highlighting

```javascript
/**
 * @param {number} age
 */
function setAge(age) {
  // ...
}

setAge('25')  // ❌ VSCode zeigt Fehler: Expected number, got string
```

### Refactoring

- ✅ Rename Symbol (F2)
- ✅ Extract Function
- ✅ Extract Variable
- ✅ Organize Imports

---

## 🔄 Migration-Plan

### Phase 1: Setup & Foundation (Woche 1)

**Ziele:**
- ✅ TypeScript installieren (nur für Type-Checking)
- ✅ `tsconfig.json` erstellen
- ✅ NPM-Scripts hinzufügen
- ✅ VSCode-Konfiguration
- ✅ CI/CD-Integration

**Tasks:**
```bash
npm install --save-dev typescript @types/node
```

**Dateien erstellen:**
- `tsconfig.json`
- `.vscode/settings.json`

**package.json:**
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "npm run typecheck && vitest run"
  }
}
```

### Phase 2: Core-Module typisieren (Woche 2)

**Priorität 1: Type-Definitionen**

`src/js/types.js`:

```javascript
/**
 * @typedef {Object} Training
 * @property {number} id
 * @property {string} wochentag
 * @property {string} ort
 * // ... alle Properties
 */

/**
 * @typedef {Object} Filter
 * @property {string} wochentag
 * @property {string} ort
 * @property {string} training
 * @property {string} altersgruppe
 * @property {string} searchTerm
 */

/**
 * @typedef {Object} Metadata
 * @property {string[]} orte
 * @property {string[]} trainingsarten
 * @property {string[]} altersgruppen
 * @property {string[]} wochentage
 */

// Export für Type-Imports
export {}
```

**Priorität 2: Config typisieren**

`src/js/config.js`:

```javascript
/**
 * @typedef {import('./types.js').Training} Training
 */

/**
 * @typedef {Object} AppConfig
 * @property {string} jsonUrl
 * @property {string} versionUrl
 * @property {boolean} cacheEnabled
 * @property {number} cacheDuration
 * // ... alle Config-Properties
 */

/**
 * Application Configuration
 *
 * @type {Readonly<AppConfig>}
 */
export const CONFIG = Object.freeze({
  // ...
})
```

**Priorität 3: Utils typisieren**

`src/js/utils.js`:

```javascript
/**
 * @typedef {import('./types.js').Training} Training
 */

/**
 * Formatiert Zeitrange
 *
 * @param {string} von - Startzeit (HH:MM)
 * @param {string} bis - Endzeit (HH:MM)
 * @returns {string} Formatierte Zeit ("18:00 - 20:00")
 */
export function formatZeitrange(von, bis) {
  return `${von} - ${bis}`
}

/**
 * Berechnet Distanz zwischen zwei Koordinaten
 *
 * @param {number} lat1 - Latitude 1
 * @param {number} lng1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lng2 - Longitude 2
 * @returns {number} Distanz in Kilometern
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  // Haversine-Formel
}
```

### Phase 3: Haupt-Komponente (Woche 3)

**trainingsplaner.js:**

```javascript
/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').Filter} Filter
 * @typedef {import('./types.js').Metadata} Metadata
 */

/**
 * Trainingsplaner Alpine-Komponente
 *
 * @returns {Object} Alpine-Komponente
 */
export function trainingsplaner() {
  return {
    /** @type {Training[]} */
    allTrainings: [],

    /** @type {Training[]} */
    filteredTrainings: [],

    /** @type {Metadata | null} */
    metadata: null,

    /** @type {boolean} */
    loading: true,

    /** @type {string | null} */
    error: null,

    /**
     * Initialisierung
     *
     * @returns {Promise<void>}
     */
    async init() {
      // ...
    },

    /**
     * Filter anwenden
     *
     * @returns {void}
     */
    applyFilters() {
      // ...
    }
  }
}
```

### Phase 4: Remaining Files (Woche 4)

- `main.js` typisieren
- `calendar-integration.js` typisieren
- `iframe-resize.js` typisieren
- Test-Files typisieren

### Phase 5: Validation & Cleanup (Woche 5)

```bash
# Type-Checking aktivieren
npm run typecheck

# Fehler beheben
# ...

# CI/CD-Integration
```

`.github/workflows/test.yml`:

```yaml
- name: Type-Check
  run: npm run typecheck

- name: Run Tests
  run: npm test
```

---

## 📚 Beispiele aus dem Projekt

### Aktueller Stand (ohne JSDoc)

```javascript
// config.js
export const CONFIG = Object.freeze({
  jsonUrl: 'https://...',
  cacheEnabled: true,
  cacheDuration: 3600000
})
```

### Mit JSDoc

```javascript
/**
 * @typedef {Object} AppConfig
 * @property {string} jsonUrl - API-URL
 * @property {string} versionUrl - Version-URL
 * @property {boolean} cacheEnabled - Cache aktiviert?
 * @property {number} cacheDuration - Cache-Dauer in ms
 */

/**
 * Application Configuration
 *
 * @type {Readonly<AppConfig>}
 */
export const CONFIG = Object.freeze({
  jsonUrl: 'https://...',
  cacheEnabled: true,
  cacheDuration: 3600000
})
```

### Aktueller Stand (Funktion)

```javascript
// utils.js
export function formatZeitrange(von, bis) {
  return `${von} - ${bis}`
}
```

### Mit JSDoc

```javascript
/**
 * Formatiert Zeitrange
 *
 * @param {string} von - Startzeit (HH:MM)
 * @param {string} bis - Endzeit (HH:MM)
 * @returns {string} Formatierte Zeitrange ("18:00 - 20:00")
 *
 * @example
 * formatZeitrange('18:00', '20:00')
 * // => "18:00 - 20:00"
 */
export function formatZeitrange(von, bis) {
  return `${von} - ${bis}`
}
```

### Alpine-Komponente (aktuell)

```javascript
export function trainingsplaner() {
  return {
    allTrainings: [],
    loading: true,

    async init() {
      // ...
    }
  }
}
```

### Mit JSDoc

```javascript
/**
 * @typedef {import('./types.js').Training} Training
 */

/**
 * Trainingsplaner Alpine-Komponente
 *
 * @returns {Object} Alpine-Komponente mit State und Methoden
 */
export function trainingsplaner() {
  return {
    /** @type {Training[]} Alle geladenen Trainings */
    allTrainings: [],

    /** @type {boolean} Lade-Zustand */
    loading: true,

    /**
     * Initialisierung der Komponente
     *
     * @returns {Promise<void>}
     */
    async init() {
      // ...
    }
  }
}
```

---

## ✅ Checkliste für Migration

### Setup
- [ ] TypeScript installiert (`npm i -D typescript @types/node`)
- [ ] `tsconfig.json` erstellt
- [ ] VSCode-Einstellungen konfiguriert
- [ ] NPM-Scripts hinzugefügt (`typecheck`)

### Type-Definitionen
- [ ] `src/js/types.js` erstellt
- [ ] `Training` Typedef
- [ ] `Filter` Typedef
- [ ] `Metadata` Typedef
- [ ] Weitere Custom-Types

### Core-Files
- [ ] `config.js` typisiert
- [ ] `utils.js` typisiert
- [ ] `trainingsplaner.js` typisiert
- [ ] `main.js` typisiert
- [ ] `calendar-integration.js` typisiert
- [ ] `iframe-resize.js` typisiert

### Tests
- [ ] Test-Files typisiert
- [ ] Test-Helpers typisiert

### Validation
- [ ] `npm run typecheck` läuft ohne Fehler
- [ ] VSCode zeigt Intellisense
- [ ] Keine Type-Errors in IDE
- [ ] CI/CD integriert

### Dokumentation
- [ ] JSDoc-Guide im Projekt
- [ ] README aktualisiert
- [ ] Contributor-Guide aktualisiert

---

## 📖 Weitere Ressourcen

**Offizielle Dokumentation:**
- [TypeScript JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [VSCode JavaScript Type-Checking](https://code.visualstudio.com/docs/languages/javascript#_type-checking)

**Tutorials:**
- [JSDoc Cheatsheet](https://devhints.io/jsdoc)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

**Tools:**
- [documentation.js](https://documentation.js.org/) - API-Docs aus JSDoc
- [TypeDoc](https://typedoc.org/) - Docs-Generator (auch für JSDoc)

---

**Version:** 1.0.0
**Autor:** FAM Trainingsplan Team
**Lizenz:** MIT
