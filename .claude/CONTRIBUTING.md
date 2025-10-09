# Contributing mit Claude Code - FAM Trainingsplan

Dieses Dokument beschreibt den empfohlenen Workflow für die Entwicklung mit Claude Code.

## 🎯 Workflow-Übersicht

```
Feature-Request → Implementierung → Tests → Build → Review → Deploy
     ↓                ↓               ↓       ↓       ↓        ↓
  Claude         Claude + Dev     /test   /build  /analyze  /deploy
```

## 🚀 Feature-Entwicklung

### 1. Feature planen
```bash
claude "Plane die Implementierung von: $FEATURE_NAME"
```

Claude erstellt einen Implementierungsplan mit:
- Zu ändernde Dateien
- Neue Komponenten
- Test-Strategie
- Potenzielle Risiken

### 2. Feature implementieren
```bash
# Mit Erklärungen (für neue Features)
/output-style learning
claude "Implementiere $FEATURE_NAME"

# Schnell und pragmatisch
/output-style quick-fix
claude "Implementiere $FEATURE_NAME"
```

### 3. Tests schreiben
```bash
claude "Schreibe Unit Tests für $FEATURE_NAME"
```

### 4. Validieren
```bash
/test      # Alle Tests
/build     # Production Build testen
/pwa       # PWA-Features prüfen
```

### 5. Code-Review
```bash
/analyze
# Claude zeigt Verbesserungspotenziale
```

### 6. Deployment
```bash
/deploy
# Kompletter Workflow mit Checks
```

## 🐛 Bug-Fixing Workflow

### 1. Bug reproduzieren
```bash
claude "Hilf mir den Bug zu reproduzieren: $BUG_DESCRIPTION"
```

### 2. Bug analysieren
```bash
claude "Analysiere die Root Cause für: $BUG_DESCRIPTION"
```

### 3. Fix implementieren
```bash
/output-style quick-fix
claude "Fix: $BUG_DESCRIPTION"
```

### 4. Regression Tests
```bash
/test
# Stelle sicher, dass nichts kaputt gegangen ist
```

### 5. Hotfix Deploy (bei kritischen Bugs)
```bash
/deploy
# Wähle "Ja" bei Git Commit/Push
```

## 🧪 Testing Best Practices

### Unit Tests
```bash
# Tests für spezifische Datei
claude "Schreibe Unit Tests für @src/js/utils.js"

# Tests ausführen
npm run test:unit
```

### E2E Tests
```bash
# Puppeteer Tests (schneller)
npm run test:puppeteer:headless

# Playwright Tests (umfassender)
npm test
```

### Test-Driven Development
```bash
# 1. Tests zuerst schreiben
claude "Schreibe Tests für Feature: $FEATURE"

# 2. Implementierung
claude "Implementiere Feature so dass Tests bestehen"

# 3. Validieren
/test
```

## 🎨 Code-Style & Formatierung

### Automatische Formatierung
```bash
/fix
# Führt aus:
# - prettier --write
# - eslint --fix
```

### Vor jedem Commit
```bash
/fix
/test
# Dann erst committen
```

## 📦 Build & Deployment

### Development Build
```bash
/dev
# Startet Dev-Server auf localhost:5173
```

### Production Build
```bash
/build
# Validiert Build-Output und Bundle-Size
```

### Deployment Checklist
```bash
/deploy
```

Claude prüft automatisch:
- [ ] Alle Tests bestehen
- [ ] Keine Lint-Errors
- [ ] Build erfolgreich
- [ ] Bundle-Size akzeptabel
- [ ] PWA Manifest korrekt
- [ ] Version aktualisiert
- [ ] Git Status clean

## 🔒 Security & Permissions

### Geschützte Dateien
Claude wird **immer fragen** vor:
- Git Commits/Pushes
- Änderungen an Config-Dateien
- Datei-Löschungen

### Automatisch blockiert
- Zugriff auf `node_modules/`
- Änderungen an `.env` Dateien
- Destruktive Git-Operationen

### Sensitive Daten
```bash
# ❌ NICHT committen:
.env
.env.local
API-Keys
Credentials

# ✅ Claude warnt automatisch
```

## 🎯 Output Styles richtig nutzen

### Learning Mode
**Wann**: Neue Features, Architektur-Entscheidungen
```bash
/output-style learning
claude "Wie implementiere ich Feature X am besten?"
```

**Vorteile**:
- Ausführliche Erklärungen
- Best Practices
- Alternative Ansätze
- Code-Kommentare

### PWA Expert Mode
**Wann**: Performance-Optimierung, PWA-Features
```bash
/output-style pwa-expert
claude "Optimiere Bundle Size"
```

**Vorteile**:
- Performance-Metriken
- Cache-Strategien
- Lighthouse-Scores
- Offline-First Patterns

### Quick Fix Mode
**Wann**: Hotfixes, kritische Bugs, Zeitdruck
```bash
/output-style quick-fix
claude "Fix: Karte lädt nicht"
```

**Vorteile**:
- Minimalistisch
- Schnelle Lösungen
- Kein Over-Engineering
- Fokus auf Problem-Lösung

## 📚 Dokumentation

### Code-Dokumentation
```bash
claude "Füge JSDoc-Kommentare zu @src/js/trainingsplaner.js hinzu"
```

### README aktualisieren
```bash
claude "Update README mit neuen Features aus v2.4.0"
```

### API-Dokumentation
```bash
claude "Dokumentiere die öffentliche API von utils.js"
```

## 🤝 Team-Workflows

### Feature-Branch Workflow
```bash
# 1. Neuen Branch erstellen
git checkout -b feature/$FEATURE_NAME

# 2. Feature entwickeln
claude "Implementiere $FEATURE_NAME"

# 3. Tests
/test

# 4. Commit
claude "Commit alle Änderungen mit Message: Add $FEATURE_NAME"

# 5. Push
git push origin feature/$FEATURE_NAME

# 6. PR erstellen (manuell auf GitHub)
```

### Code-Review mit Claude
```bash
# Vor dem PR
/analyze
# Claude zeigt Verbesserungen

# Reviewer kann auch fragen
claude "Review die Änderungen in @src/js/trainingsplaner.js"
```

### Merge-Konflikte lösen
```bash
claude "Hilf mir Merge-Konflikte in $FILE zu lösen"
```

## 🔧 Erweiterte Features

### Custom Slash Commands erstellen
```bash
# 1. Command-Datei erstellen
# .claude/commands/my-workflow.md

# 2. Dokumentieren
---
description: Mein Custom Workflow
---

Schritt 1: ...
Schritt 2: ...

# 3. Nutzen
/my-workflow
```

### Hooks konfigurieren (geplant)
```json
{
  "hooks": [
    {
      "event": "PreToolUse",
      "matcher": "Edit",
      "command": "npm run format"
    }
  ]
}
```

## 📊 Performance-Monitoring

### Bundle-Size tracken
```bash
/build
# Claude zeigt Bundle-Größen

# Bei Warnung:
claude "Analysiere warum vendor-alpine so groß ist"
```

### Lighthouse-Scores
```bash
/pwa
# Claude gibt Performance-Tipps

# Bei schlechten Scores:
/output-style pwa-expert
claude "Optimiere Lighthouse Performance Score"
```

## 🆘 Troubleshooting

### Claude versteht Task nicht
```bash
# ❌ Zu vage
claude "Mach das besser"

# ✅ Klar und spezifisch
claude "Refactore trainingsplaner.js: Extrahiere Filter-Logik in separate Funktion"
```

### Tests schlagen fehl
```bash
/test
# Claude analysiert automatisch

# Oder explizit:
claude "Warum schlägt Test X fehl?"
```

### Build-Errors
```bash
/build
# Claude zeigt Errors

# Für Details:
claude "Erkläre den Build-Error: $ERROR_MESSAGE"
```

### Permission-Probleme
```bash
# Settings anpassen in:
.claude/settings.json        # Team-weit
.claude/settings.local.json  # Persönlich
```

## 📖 Weiterführende Ressourcen

- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- [.claude/README.md](.claude/README.md) - Projekt-spezifische Docs
- [.claude/CHEATSHEET.md](.claude/CHEATSHEET.md) - Schnellreferenz
- [Project README](../README.md) - FAM Trainingsplan Docs

## 💡 Pro-Tipps

### 1. Kontext bewahren
```bash
# Claude merkt sich Kontext in der Session
claude "Analysiere trainingsplaner.js"
claude "Wie kann ich das optimieren?"  # Bezieht sich auf vorherige Analyse
```

### 2. Iterative Entwicklung
```bash
# Schrittweise Features entwickeln
claude "Füge Basis-Struktur für Feature X hinzu"
/test
claude "Erweitere Feature X um Validierung"
/test
claude "Füge Error-Handling zu Feature X hinzu"
/test
```

### 3. Pair-Programming mit Claude
```bash
# Learning Mode nutzen
/output-style learning

# Feature gemeinsam entwickeln
claude "Lass uns gemeinsam Feature X entwickeln. Erkläre jeden Schritt."
```

### 4. Batch-Processing
```bash
# Mehrere Tasks auf einmal
claude "1. Fix Bug A, 2. Add Feature B, 3. Update Tests, 4. Update Docs"
```

---

**Happy Coding mit Claude!** 🚀

Bei Fragen: Nutze `claude "Hilfe zu $TOPIC"` oder schaue in die Docs.
