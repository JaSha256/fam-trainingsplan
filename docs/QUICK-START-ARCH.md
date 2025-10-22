# FAM Trainingsplan - Quick Start (Arch Linux)

Schnelleinstieg für Entwicklung auf Arch Linux mit TDD-Validierung.

## Prerequisites

```bash
# System-Dependencies installieren (falls nötig)
sudo pacman -S nodejs npm base-devel git chromium firefox

# Optional: webkit2gtk für Safari-Testing
sudo pacman -S webkit2gtk
```

## Setup (Automatisch)

```bash
# Ins Projektverzeichnis wechseln
cd /home/pseudo/workspace/FAM/fam-trainingsplan

# Setup-Script ausführen
zsh ./setup-arch.sh

# System-Browser nutzen (optional - spart ~1GB)
export USE_SYSTEM_BROWSERS=true
```

## Setup (Manuell)

```bash
# NPM Dependencies installieren
npm ci

# Git Hooks einrichten
npm run prepare

# Playwright Browser (optional)
npx playwright install chromium firefox
```

## Development starten

```bash
# Dev-Server starten (http://localhost:5173)
npm run dev

# In neuem Terminal: Tests im Watch-Mode
npm run test:unit:watch

# In neuem Terminal: E2E Tests
npm run test:e2e:ui
```

## TDD Infrastructure Validation

Das Setup wird automatisch durch **52 Tests** validiert:

```bash
npm run setup:validate           # Infrastructure Tests (TDD)
npm run test:infrastructure      # Alias
```

**Erwartetes Ergebnis:**

```
✓ |infrastructure| tests/infrastructure/setup-validation.test.js (52 tests)
Test Files  1 passed (1)
Tests  52 passed (52)
```

**Was wird getestet:**

- System Dependencies (Node.js, npm, Browser)
- Project Configuration (package.json, configs)
- NPM Dependencies (718 Pakete)
- Build System (Vite, Tailwind, PWA)
- Testing Infrastructure (Vitest, Playwright)
- Development Scripts (dev, build, test)
- Git Integration (Husky, lint-staged)
- Project Structure

## Häufige Commands

```bash
# Development
npm run dev              # Development Server (Port 5173)
npm run build            # Production Build
npm run preview          # Preview Build

# Testing
npm run setup:validate   # Infrastructure Tests (52 Tests)
npm run test:unit        # Unit Tests (307 Tests)
npm run test:e2e         # E2E Tests (Playwright)
npm test                 # Alle Tests

# Code Quality
npm run typecheck        # TypeScript Check
npm run lint             # ESLint
npm run format           # Prettier Formatierung
```

## System-Info

- **Node:** >=20.19.0 erforderlich
- **npm:** >=10.0.0 erforderlich
- **Browser:** chromium, firefox, webkit2gtk

## Troubleshooting

### "Module not found"

```bash
# Dependencies neu installieren
npm clean-install
```

### "Port 5173 already in use"

```bash
kill -9 $(lsof -ti:5173)
npm run dev
```

### Tests schlagen fehl

```bash
# Playwright Browser neu installieren
npx playwright install --with-deps
```

## Weitere Dokumentation

- [SETUP-ARCH.md](./SETUP-ARCH.md) - Vollständige Setup-Dokumentation
- [README.md](../README.md) - Projekt-Übersicht
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution Guidelines
