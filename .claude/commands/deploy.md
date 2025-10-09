---
description: Kompletter Deployment-Workflow mit Pre-Checks
---

Führe den kompletten Deployment-Workflow durch:

## 1. Pre-Deployment Checks

**Tests ausführen**:
```bash
npm run test:unit
npm run test:puppeteer:headless
```

Falls Tests fehlschlagen → STOP und Fehler beheben!

**Lint & Format**:
```bash
npm run lint
npm run format
```

## 2. Production Build

```bash
npm run build
```

**Build validieren**:
- dist/ Ordner wurde erstellt
- Alle Assets vorhanden
- Bundle-Größe akzeptabel
- Keine Build-Warnings

## 3. Deployment-Vorbereitung

**Version prüfen**:
- Ist `package.json` Version aktuell?
- Entspricht Version im README?
- `public/version.json` aktualisiert?

**Git Status prüfen**:
```bash
git status
```
- Alle Änderungen committed?
- Auf korrektem Branch (main)?

## 4. GitHub Pages Deployment

**Option A: Manuell**:
1. Build ist im `dist/` Ordner
2. Commit und push zu GitHub
3. GitHub Actions deployt automatisch

**Option B: Interaktiv**:
Soll ich einen Git Commit + Push durchführen?
- [ ] Ja, alle Änderungen committen und pushen
- [ ] Nein, ich mache das manuell

## 5. Post-Deployment

**Validierung**:
- URL aufrufen: https://jasha256.github.io/fam-trainingsplan/
- PWA Installation testen
- Core Features prüfen:
  * Filter funktionieren
  * Karte lädt
  * Favoriten speichern
  * Geolocation
  * Kalender-Export

**Erfolgsmeldung**:
```
✅ Deployment erfolgreich!
🚀 Live URL: https://jasha256.github.io/fam-trainingsplan/
📦 Version: 2.4.0
```
