# Upgrade-Plan - FAM Trainingsplan

**Version:** 1.0.0
**Erstellt:** 2025-10-17
**Status:** Ready for Implementation

---

## 📊 Dependency-Audit Ergebnis

### ✅ Sicherheits-Status

```
npm audit
found 0 vulnerabilities
```

**🎉 Keine Sicherheitslücken gefunden!**

### 📦 Veraltete Packages

| Package | Aktuell | Latest | Update-Typ | Priorität |
|---------|---------|--------|------------|-----------|
| **@playwright/test** | 1.55.1 | 1.56.1 | Minor | 🟡 Medium |
| **eslint** | 9.36.0 | 9.37.0 | Minor | 🟢 Low |
| **puppeteer** | 24.23.0 | 24.25.0 | Patch | 🟢 Low |
| **vite** | 7.1.8 | 7.1.10 | Patch | 🟡 Medium |
| **vite-plugin-pwa** | 1.0.3 | 1.1.0 | Minor | 🟡 Medium |

**Gesamt:** 5 Updates verfügbar (alle Minor/Patch)

---

## 🎯 Upgrade-Strategie

### Prinzipien

1. **Sicherheit First** → Kritische Updates sofort
2. **Nicht-Breaking** → Minor/Patch-Updates safe
3. **Testbarkeit** → Tests müssen durchlaufen
4. **Schrittweise** → Ein Update nach dem anderen
5. **Rollback-Ready** → Git-Commits pro Update

### Update-Klassifizierung

#### 🔴 Kritisch (Sofort)
- Security-Vulnerabilities
- Breaking-Bugs

#### 🟡 Medium (Diese Woche)
- Minor-Updates mit neuen Features
- Performance-Improvements
- Bug-Fixes

#### 🟢 Low (Nächste Woche)
- Patch-Updates
- Dev-Dependencies
- Nicht-kritische Features

---

## 📅 Upgrade-Roadmap

### Phase 1: Quick-Wins (Heute - 1 Tag)

**Ziel:** Safe Patch-Updates ohne Breaking-Changes

#### 1.1 Vite 7.1.8 → 7.1.10 (Patch)

**Warum:**
- Performance-Improvements
- Bug-Fixes im Build-System
- Keine Breaking-Changes

**Changelog:**
- https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md

**Risiko:** 🟢 Niedrig (Patch-Update)

**Steps:**
```bash
# 1. Update
npm update vite

# 2. Test
npm run build
npm run preview
npm run test:e2e

# 3. Commit
git add package.json package-lock.json
git commit -m "chore(deps): update vite to 7.1.10"
```

**Rollback:**
```bash
git revert HEAD
npm install
```

#### 1.2 Puppeteer 24.23.0 → 24.25.0 (Patch)

**Warum:**
- Bug-Fixes
- Dev-Dependency (kein Production-Impact)

**Risiko:** 🟢 Niedrig

**Steps:**
```bash
npm update puppeteer
npm run test:puppeteer:headless
git add package.json package-lock.json
git commit -m "chore(deps): update puppeteer to 24.25.0"
```

#### 1.3 ESLint 9.36.0 → 9.37.0 (Minor)

**Warum:**
- Neue Linter-Rules
- Bug-Fixes
- Dev-Dependency

**Risiko:** 🟢 Niedrig

**Steps:**
```bash
npm update eslint
npm run lint
git add package.json package-lock.json
git commit -m "chore(deps): update eslint to 9.37.0"
```

**Geschätzte Zeit:** 1-2 Stunden
**Tests:** Build + E2E + Puppeteer + Lint

---

### Phase 2: Medium-Updates (Diese Woche - 2-3 Tage)

#### 2.1 Playwright 1.55.1 → 1.56.1 (Minor)

**Warum:**
- Neue Browser-Versionen
- Performance-Improvements
- Neue Testing-Features

**Changelog:**
- https://github.com/microsoft/playwright/releases/tag/v1.56.1

**Risiko:** 🟡 Medium (Minor-Update, Test-Tool)

**Breaking Changes:** Keine bekannten

**Steps:**
```bash
# 1. Update
npm update @playwright/test

# 2. Browser aktualisieren
npx playwright install

# 3. Tests ausführen
npm run test:e2e
npm run test:visual
npm run test:a11y
npm run test:perf
npm run test:pwa

# 4. Visual Snapshots prüfen
# Falls nötig: npm run test:visual:update

# 5. Commit
git add package.json package-lock.json
git commit -m "chore(deps): update playwright to 1.56.1"
```

**Potenzielle Probleme:**
- Visual Regression Tests könnten fehlschlagen (Browser-Update)
- Neue Browser-Versionen können minimal andere Screenshots erzeugen

**Lösung:**
```bash
# Falls Visual Tests fehlschlagen:
npm run test:visual:update
git add tests/e2e/**/*.png
git commit -m "test: update visual snapshots for playwright 1.56.1"
```

**Geschätzte Zeit:** 2-3 Stunden
**Tests:** ALLE E2E-Tests auf ALLEN Browsern

#### 2.2 Vite-Plugin-PWA 1.0.3 → 1.1.0 (Minor)

**Warum:**
- Neue PWA-Features
- Workbox-Updates
- Bug-Fixes

**Changelog:**
- https://github.com/vite-pwa/vite-plugin-pwa/releases

**Risiko:** 🟡 Medium (PWA-kritisch)

**Steps:**
```bash
# 1. Update
npm update vite-plugin-pwa

# 2. Build testen
npm run build

# 3. Service Worker prüfen
# dist/sw.js existiert?
ls -la dist/sw.js

# 4. PWA testen
npm run preview
# Im Browser:
# - Application Tab → Service Workers
# - Application Tab → Manifest
# - Offline-Modus testen

# 5. E2E PWA-Tests
npm run test:pwa

# 6. Commit
git add package.json package-lock.json
git commit -m "chore(deps): update vite-plugin-pwa to 1.1.0"
```

**Checklist:**
- [ ] Service Worker registriert
- [ ] Manifest.json korrekt
- [ ] Offline-Modus funktioniert
- [ ] Update-Benachrichtigung funktioniert
- [ ] Cache-Strategien korrekt
- [ ] Icons vorhanden

**Geschätzte Zeit:** 3-4 Stunden
**Tests:** Build + Preview + PWA-Tests + Manual-Testing

---

### Phase 3: JSDoc-Migration (2 Wochen)

**Siehe:** `docs/JSDOC_BEST_PRACTICES.md`

#### Woche 1: Setup + Core-Types

**Tag 1-2: Setup**
```bash
# TypeScript installieren (nur Type-Checking)
npm install --save-dev typescript @types/node

# tsconfig.json erstellen
# .vscode/settings.json anpassen
# package.json Scripts erweitern
```

**Tag 3-5: Type-Definitionen**
- `src/js/types.js` erstellen
- Training Typedef
- Filter Typedef
- Metadata Typedef
- Notification Typedef
- etc.

**Deliverable:**
```javascript
// types.js
/**
 * @typedef {Object} Training
 * @property {number} id
 * @property {string} wochentag
 * // ... 15+ Properties
 */
```

#### Woche 2: Komponenten typisieren

**Tag 1-3: Core-Module**
- `config.js` ✓
- `utils.js` ✓
- `trainingsplaner.js` ✓

**Tag 4-5: Remaining**
- `main.js` ✓
- `calendar-integration.js` ✓
- `iframe-resize.js` ✓
- Test-Files ✓

**Tag 5: Validation**
```bash
npm run typecheck
# → 0 Fehler!
```

**Geschätzte Zeit:** 40-60 Stunden (2 Wochen)

---

### Phase 4: Performance-Audit (1 Woche)

#### 4.1 Bundle-Analyse

```bash
npm install --save-dev rollup-plugin-visualizer

# Build mit Analyse
npm run build
```

**Vite-Config:**
```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

**Ziel:**
- Identifiziere größte Dependencies
- Prüfe Code-Splitting
- Optimiere Bundle-Size

#### 4.2 Lighthouse-Audit

```bash
npm install --save-dev @lhci/cli

# Lighthouse CI
npx lhci autorun
```

**Targets:**
- Performance: >95
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: ✓

#### 4.3 Performance-Monitoring

**Google Analytics / Plausible:**
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Error-Tracking (optional: Sentry)

**Geschätzte Zeit:** 1 Woche

---

### Phase 5: Neue Features (Optional)

#### 5.1 Dark-Mode (v3.1.0)

**Aktuell:** Deaktiviert in Config

```javascript
features: {
  enableDarkMode: false  // ← Aktuell aus
}
```

**Implementation:**
- Tailwind Dark-Mode aktivieren
- Toggle-Button implementieren
- LocalStorage-Persistierung
- System-Preference-Detection

**Aufwand:** 1-2 Tage

#### 5.2 Push-Notifications (v3.2.0)

**Für Favoriten:**
- Erinnere 1h vor Training
- Opt-In via Notification-API
- Service Worker Push-Events

**Aufwand:** 3-5 Tage

#### 5.3 Multi-Select-Filter (v3.3.0)

**Aktuell:** Single-Select

**Neu:**
- Mehrere Wochentage gleichzeitig
- Mehrere Orte
- Checkbox-basiert

**Aufwand:** 2-3 Tage

---

## 📋 Schritt-für-Schritt Anleitung

### Heute: Phase 1 Quick-Wins

```bash
# ==================== VITE UPDATE ====================
# 1. Update
npm update vite

# 2. Test
npm run build
npm run preview  # Im Browser testen
npm run test:e2e

# 3. Commit
git add package.json package-lock.json
git commit -m "chore(deps): update vite to 7.1.10"

# ==================== PUPPETEER UPDATE ====================
# 1. Update
npm update puppeteer

# 2. Test
npm run test:puppeteer:headless

# 3. Commit
git add package.json package-lock.json
git commit -m "chore(deps): update puppeteer to 24.25.0"

# ==================== ESLINT UPDATE ====================
# 1. Update
npm update eslint

# 2. Test
npm run lint

# 3. Commit
git add package.json package-lock.json
git commit -m "chore(deps): update eslint to 9.37.0"

# ==================== PUSH ====================
git push origin master
```

**Zeit:** ~1-2 Stunden

---

### Diese Woche: Phase 2 Medium-Updates

#### Tag 1: Playwright-Update

```bash
# Morning (2h)
npm update @playwright/test
npx playwright install
npm run test:e2e

# Falls Visual-Tests fehlschlagen:
npm run test:visual:update

git commit -am "chore(deps): update playwright to 1.56.1"
```

#### Tag 2: Vite-Plugin-PWA-Update

```bash
# Morning (3h)
npm update vite-plugin-pwa
npm run build
npm run preview

# Manual-Testing:
# - DevTools → Application → Service Workers
# - DevTools → Application → Manifest
# - Offline-Modus testen

npm run test:pwa

git commit -am "chore(deps): update vite-plugin-pwa to 1.1.0"
```

#### Tag 3: Integration-Testing

```bash
# All Tests
npm run test:all

# Falls alles grün:
git push origin master
```

---

### Nächste 2 Wochen: JSDoc-Migration

**Siehe:** `docs/JSDOC_BEST_PRACTICES.md` → Migration-Plan

---

## ⚠️ Risiko-Management

### Backup-Strategie

**Vor jedem Update:**
```bash
# 1. Aktueller Stand committen
git add .
git commit -m "chore: backup before update"

# 2. Neuer Branch (optional bei größeren Updates)
git checkout -b update/playwright-1.56.1

# 3. Update durchführen
# ...

# 4. Tests erfolgreich?
# → Merge to master
# → Push

# 5. Tests fehlgeschlagen?
# → git checkout master
# → git branch -D update/playwright-1.56.1
```

### Rollback-Plan

**Schnelles Rollback:**
```bash
# Letzten Commit rückgängig machen
git revert HEAD

# Dependencies wiederherstellen
npm install
```

**Vollständiges Rollback:**
```bash
# Zu vorherigem Commit zurück
git reset --hard HEAD~1

# Dependencies wiederherstellen
npm install
```

### Monitoring nach Update

**Nach jedem Update prüfen:**
1. ✅ Build erfolgreich
2. ✅ Alle Tests grün
3. ✅ Preview im Browser funktioniert
4. ✅ Keine Console-Errors
5. ✅ Performance-Metriken gleich/besser
6. ✅ Bundle-Size nicht signifikant größer

---

## 📊 Success-Metrics

### Update-Erfolg messen

| Metrik | Vor Update | Nach Update | Ziel |
|--------|------------|-------------|------|
| **Bundle-Size** | ~450KB | ≤ 450KB | Nicht größer |
| **Build-Zeit** | ~8s | ≤ 8s | Nicht langsamer |
| **Test-Erfolgsrate** | 100% | 100% | Alle grün |
| **Lighthouse** | 95+ | ≥95 | Gleich/besser |
| **TTFB** | ~200ms | ≤200ms | Gleich/besser |
| **LCP** | ~1.8s | ≤1.8s | Gleich/besser |

### CI/CD-Integration

**.github/workflows/update-check.yml:**

```yaml
name: Dependency Updates

on:
  schedule:
    - cron: '0 8 * * MON'  # Jeden Montag 8:00
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Check for Updates
        run: npm outdated || true

      - name: Security Audit
        run: npm audit

      - name: Create Issue on Vulnerabilities
        if: failure()
        run: |
          gh issue create \
            --title "🚨 Security Vulnerabilities Found" \
            --body "npm audit hat Sicherheitslücken gefunden. Bitte prüfen und updaten."
```

---

## 🎯 Prioritäten-Matrix

### Sofort (Diese Woche)

1. **Vite 7.1.10** → Bug-Fixes, Performance
2. **Puppeteer 24.25.0** → Bug-Fixes
3. **ESLint 9.37.0** → Linter-Improvements

### Wichtig (Diese Woche)

4. **Playwright 1.56.1** → Neue Browser, Features
5. **Vite-Plugin-PWA 1.1.0** → PWA-Features

### Mittelfristig (2 Wochen)

6. **JSDoc-Migration** → Type-Safety ohne TypeScript
7. **Performance-Audit** → Bundle-Analyse, Lighthouse

### Langfristig (Backlog)

8. **Dark-Mode** → v3.1.0
9. **Push-Notifications** → v3.2.0
10. **Multi-Select-Filter** → v3.3.0

---

## 📝 Changelog-Template

**Version-Bump nach Updates:**

```markdown
# Changelog

## [2.4.1] - 2025-10-17

### Changed
- Updated vite from 7.1.8 to 7.1.10
- Updated puppeteer from 24.23.0 to 24.25.0
- Updated eslint from 9.36.0 to 9.37.0
- Updated playwright from 1.55.1 to 1.56.1
- Updated vite-plugin-pwa from 1.0.3 to 1.1.0

### Fixed
- Build-Performance verbessert (Vite-Update)
- E2E-Tests stabiler (Playwright-Update)

### Security
- No vulnerabilities (npm audit clean ✅)
```

---

## ✅ Final Checklist

### Pre-Update
- [ ] Alle Änderungen committed
- [ ] Tests laufen grün
- [ ] Branch erstellt (bei großen Updates)
- [ ] Backup vorhanden

### Update
- [ ] `npm update <package>` ausgeführt
- [ ] `package-lock.json` updated
- [ ] Changelog geprüft (Breaking Changes?)

### Testing
- [ ] `npm run build` erfolgreich
- [ ] `npm run preview` im Browser getestet
- [ ] `npm run test:unit` grün
- [ ] `npm run test:integration` grün
- [ ] `npm run test:e2e` grün
- [ ] Manual-Testing (Hauptfeatures)

### Post-Update
- [ ] Commit erstellt
- [ ] Changelog aktualisiert
- [ ] Pushed to Remote
- [ ] Monitoring aktiviert

---

## 🚀 Los geht's!

**Nächster Schritt:**

```bash
# Starte mit Phase 1 (Quick-Wins)
npm update vite puppeteer eslint

# Tests
npm run build && npm run test:e2e

# Commit
git commit -am "chore(deps): update vite, puppeteer, eslint"
```

**Geschätzte Gesamt-Zeit:**
- Phase 1 (Quick-Wins): 1-2 Stunden
- Phase 2 (Medium-Updates): 1 Woche
- Phase 3 (JSDoc): 2 Wochen
- Phase 4 (Performance): 1 Woche

**Total:** ~4 Wochen für vollständige Modernisierung

---

**Version:** 1.0.0
**Status:** Ready for Implementation
**Autor:** FAM Trainingsplan Team
**Letzte Aktualisierung:** 2025-10-17
