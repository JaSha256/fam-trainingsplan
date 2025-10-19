# 🚀 Quick Start Guide - FAM Trainingsplan

**Version:** 3.1.0
**Status:** ✅ PRODUKTIONSBEREIT

---

## ⚡ Schnellstart

```bash
# Installation
npm install

# Development Server starten
npm run dev

# Tests ausführen
npm run test:coverage

# Build für Production
npm run build
```

---

## 📦 Installation

### Voraussetzungen
- **Node.js:** >= 20.19.0
- **npm:** >= 10.0.0

### Setup
```bash
# Dependencies installieren
npm install

# TypeScript-Check (optional)
npm run typecheck
```

---

## 🧪 Testing

### Unit Tests (313 Tests, 98% Pass Rate)

```bash
# Alle Unit Tests ausführen
npm run test:unit

# Mit Watch-Mode
npm run test:unit:watch

# Mit UI
npm run test:unit:ui

# Mit Coverage-Report
npm run test:coverage
```

**Coverage:** 81.71% (Statements, Branches, Lines ✅)

### Integration Tests (60 Tests, 98.3% Pass Rate)

```bash
# Alle Integration Tests
npm run test:integration

# Mit UI
npm run test:integration:ui

# Mit Debug
npm run test:integration:debug
```

### E2E Tests (Playwright)

```bash
# Alle E2E Tests
npm run test:e2e

# Mit UI
npm run test:e2e:ui

# Mit Debug
npm run test:e2e:debug

# Nur Chromium
npm run test:e2e:chromium
```

### Spezielle Test-Suites

```bash
# Visual Regression Tests
npm run test:visual

# Visual Snapshots updaten
npm run test:visual:update

# Accessibility Tests
npm run test:a11y

# Performance Tests
npm run test:perf

# PWA Offline Tests
npm run test:pwa

# User Flow Tests
npm run test:flows
```

### Alle Tests

```bash
# Unit + Integration + E2E
npm test

# Unit + Coverage + E2E
npm run test:all
```

---

## 🛠️ Development

### Dev Server

```bash
# Vite Dev Server (http://localhost:5173)
npm run dev
```

**Features:**
- ⚡ Hot Module Replacement (HMR)
- 🔄 Auto-Reload
- 📱 Mobile Preview

### Build

```bash
# Production Build
npm run build

# Preview Production Build
npm run preview
```

**Output:** `dist/` Verzeichnis

---

## 📊 Code-Qualität

### Type Checking

```bash
# TypeScript Check (via JSDoc)
npm run typecheck

# Mit Watch-Mode
npm run typecheck:watch
```

### Linting

```bash
# ESLint
npm run lint
```

### Formatting

```bash
# Prettier
npm run format
```

---

## 📁 Projekt-Struktur

```
fam-trainingsplan/
├── src/
│   ├── js/
│   │   ├── trainingsplaner/       # Modulares Design
│   │   │   ├── data-loader.js     # ✅ 100% Coverage
│   │   │   ├── actions-manager.js # ✅ 98.4% Coverage
│   │   │   ├── map-manager.js     # ✅ 100% Coverage
│   │   │   └── ...
│   │   ├── config.js              # App Configuration
│   │   ├── utils.js               # Helper Functions
│   │   └── ...
│   ├── main.js                    # Entry Point
│   └── style.css                  # Tailwind CSS v4
├── tests/
│   ├── unit/                      # Unit Tests (11 files)
│   ├── integration/               # Integration Tests (5 files)
│   └── e2e/                       # E2E Tests (11 files)
├── public/                        # Static Assets
├── dist/                          # Build Output
└── coverage/                      # Coverage Reports
```

---

## 🎯 Wichtige Befehle

### Häufig verwendet

| Befehl | Beschreibung |
|--------|--------------|
| `npm run dev` | Dev Server starten |
| `npm run test:coverage` | Unit Tests mit Coverage |
| `npm run test:integration` | Integration Tests |
| `npm run build` | Production Build |
| `npm run preview` | Production Preview |

### Testing

| Befehl | Beschreibung |
|--------|--------------|
| `npm test` | Alle Tests (Unit + Integration + E2E) |
| `npm run test:all` | Coverage + E2E |
| `npm run test:unit:watch` | Unit Tests Watch-Mode |
| `npm run test:e2e:ui` | E2E Tests mit UI |
| `npm run test:visual:update` | Visual Snapshots updaten |

### Code-Qualität

| Befehl | Beschreibung |
|--------|--------------|
| `npm run typecheck` | TypeScript Check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier Format |

---

## 📊 Test-Coverage

### Aktuelle Metriken

```
Coverage:       81.71%
Statements:     81.71% ✅ (Threshold: 80%)
Branches:       85.64% ✅ (Threshold: 75%)
Lines:          81.71% ✅ (Threshold: 80%)
Functions:      72.94% ⚠️  (Threshold: 80%)
```

### Coverage-Report öffnen

```bash
npm run test:coverage
open coverage/index.html  # macOS
xdg-open coverage/index.html  # Linux
```

---

## 🔧 Konfiguration

### Wichtige Config-Dateien

| Datei | Zweck |
|-------|-------|
| `vite.config.js` | Vite Build Configuration |
| `vitest.config.js` | Unit Tests + Coverage |
| `playwright.config.js` | E2E Tests |
| `playwright.integration.config.js` | Integration Tests |
| `tsconfig.json` | TypeScript (JSDoc) |
| `tailwind.config.js` | Tailwind CSS v4 |

---

## 📝 Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| `README.md` | Project Overview |
| `TESTING_SUMMARY.md` | Test Documentation (comprehensive) |
| `FINAL_PROJECT_STATUS.md` | Current Project Status |
| `ARCHITECTURE.md` | System Architecture |
| `archive/README.md` | Legacy Code Documentation |

---

## 🐛 Troubleshooting

### Tests schlagen fehl

```bash
# Cache löschen
rm -rf node_modules/.vite
rm -rf coverage/

# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Tests erneut ausführen
npm run test:coverage
```

### Dev Server startet nicht

```bash
# Port bereits belegt? Anderen Port verwenden:
npm run dev -- --port 3000
```

### Build schlägt fehl

```bash
# TypeScript-Check
npm run typecheck

# ESLint
npm run lint
```

---

## 🚀 Production Deployment

### Build erstellen

```bash
npm run build
```

### Build testen

```bash
npm run preview
```

### Deployment

Das `dist/` Verzeichnis kann auf jedem Static-Hosting deployed werden:
- **Netlify**
- **Vercel**
- **GitHub Pages**
- **Cloudflare Pages**

**Wichtig:**
- `dist/trainingsplan.json` muss aktuell sein
- `dist/version.json` für PWA Update-Check

---

## 📈 Performance

### PWA Features

- ✅ Service Worker (Offline-Support)
- ✅ Manifest (Install-Prompt)
- ✅ Cache-First Strategy
- ✅ Background Sync
- ✅ Update Notifications

### Bundle Size

```bash
npm run build

# Output zeigt Bundle-Größen
```

---

## 🎯 Next Steps

### Nach Installation

1. ✅ Dev Server starten: `npm run dev`
2. ✅ Tests ausführen: `npm run test:coverage`
3. ✅ Code anschauen: `src/js/trainingsplaner/`
4. ✅ Dokumentation lesen: `TESTING_SUMMARY.md`

### Development Workflow

1. Feature-Branch erstellen
2. Tests schreiben (TDD)
3. Implementation
4. Tests ausführen: `npm run test:coverage`
5. Code-Qualität prüfen: `npm run typecheck && npm run lint`
6. Commit erstellen
7. Integration Tests: `npm run test:integration`
8. E2E Tests: `npm run test:e2e`

---

## 💡 Tipps

### Watch-Mode für schnelles Development

```bash
# Unit Tests im Hintergrund
npm run test:unit:watch

# TypeScript Check im Hintergrund
npm run typecheck:watch
```

### Debugging

```bash
# E2E Tests mit Debugger
npm run test:e2e:debug

# Integration Tests mit Debugger
npm run test:integration:debug
```

### Visual Regression Testing

```bash
# Snapshots updaten nach UI-Änderungen
npm run test:visual:update
```

---

## 📞 Support

### Dokumentation
- `TESTING_SUMMARY.md` - Umfassende Test-Dokumentation
- `ARCHITECTURE.md` - System-Architektur
- `FINAL_PROJECT_STATUS.md` - Projekt-Status

### Logs
- Unit Test Coverage: `coverage/index.html`
- Playwright Reports: `playwright-report/index.html`

---

**Version:** 3.1.0
**Last Updated:** 2025-10-19
**Status:** ✅ PRODUKTIONSBEREIT & OPTIMIERT

🎉 **Happy Coding!** 🚀
