# Claude Code Workflows für FAM Trainingsplan

Dieses Projekt ist für die optimale Nutzung mit [Claude Code](https://docs.claude.com/en/docs/claude-code) konfiguriert.

## 🚀 Quick Start

```bash
# Claude Code installieren (falls noch nicht geschehen)
npm install -g @anthropic-ai/claude-code

# Im Projekt-Ordner starten
claude

# Oder: Einmalige Task ausführen
claude "Führe alle Tests aus"
```

## 📋 Verfügbare Slash Commands

### `/test` - Kompletter Test-Durchlauf
Führt alle Tests aus (Unit, Puppeteer, Playwright) und analysiert Fehler.

```bash
/test
```

### `/build` - Production Build
Erstellt einen Production Build und validiert das Ergebnis.

```bash
/build
```

### `/pwa` - PWA Health Check
Überprüft die komplette PWA-Konfiguration (Manifest, Service Worker, Icons).

```bash
/pwa
```

### `/deploy` - Deployment Workflow
Kompletter Deployment-Workflow mit Pre-Checks, Build und GitHub Pages Deployment.

```bash
/deploy
```

### `/dev` - Development Server
Startet den Dev-Server mit Status-Check.

```bash
/dev
```

### `/analyze` - Code-Analyse
Analysiert die Codebase und identifiziert Verbesserungspotenziale.

```bash
/analyze
```

### `/fix` - Auto-Fix
Führt Prettier und ESLint Auto-Fix aus.

```bash
/fix
```

## 🎨 Output Styles

Wechsle zwischen verschiedenen Entwicklungsmodi:

### Learning Mode
```bash
/output-style learning
```
Ausführliche Erklärungen, Best Practices und Code-Kommentare.

### PWA Expert Mode
```bash
/output-style pwa-expert
```
Fokus auf Performance, Offline-Fähigkeit und Lighthouse-Scores.

### Quick Fix Mode
```bash
/output-style quick-fix
```
Minimalistisch, nur Problem → Lösung → Fix.

Zurück zum Standard:
```bash
/output-style default
```

## 🔒 Permissions

Die Konfiguration in [settings.json](settings.json) definiert:

### ✅ Automatisch erlaubt
- `npm run build`, `npm run dev`, `npm run test:*`
- `git status`, `git diff`
- Lesen aller Projekt-Dateien (außer node_modules)

### ❌ Automatisch blockiert
- Zugriff auf `node_modules/`
- Änderungen an `.env` Dateien
- Löschen von Dateien

### 🤔 Nachfragen erforderlich
- Git-Operationen (`commit`, `push`, `reset`)
- Änderungen an Config-Dateien (`*.config.js`)
- Datei-Löschungen

## 🛠️ Entwicklungs-Workflows

### Feature entwickeln
```bash
claude "Implementiere neue Filter-Option für Trainer-Namen"
```

### Bug fixen
```bash
claude "Fix: Geolocation funktioniert nicht auf iOS"
```

### Tests debuggen
```bash
/test
# Bei Fehlern: Claude analysiert und schlägt Fixes vor
```

### Deployment
```bash
/deploy
# Claude führt kompletten Deployment-Workflow durch
```

## 📦 Projekt-Struktur

```
fam-trainingsplan/
├── .claude/
│   ├── settings.json              # Projekt-weite Einstellungen
│   ├── settings.local.json        # Persönliche Einstellungen (gitignored)
│   ├── commands/                  # Custom Slash Commands
│   │   ├── test.md               # /test
│   │   ├── build.md              # /build
│   │   ├── pwa.md                # /pwa
│   │   ├── deploy.md             # /deploy
│   │   ├── dev.md                # /dev
│   │   ├── analyze.md            # /analyze
│   │   └── fix.md                # /fix
│   └── output-styles/            # Custom Output Styles
│       ├── learning.md           # Learning Mode
│       ├── pwa-expert.md         # PWA Expert Mode
│       └── quick-fix.md          # Quick Fix Mode
├── src/
├── tests/
└── ...
```

## 💡 Best Practices

### 1. Nutze Slash Commands für häufige Tasks
Statt: `claude "Führe npm run test:unit aus und analysiere die Ergebnisse"`
Besser: `/test`

### 2. Wechsle Output Styles je nach Task
- Feature lernen → `/output-style learning`
- Performance optimieren → `/output-style pwa-expert`
- Schneller Bug-Fix → `/output-style quick-fix`

### 3. Lass Claude Tests ausführen
```bash
# Vor jedem Deployment
/test
```

### 4. Nutze /analyze für Code-Reviews
```bash
/analyze
# Claude zeigt Verbesserungspotenziale
```

### 5. Deployment immer mit /deploy
```bash
/deploy
# Alle Pre-Checks werden automatisch durchgeführt
```

## 🎯 Häufige Use Cases

### Neues Feature implementieren
```bash
# 1. Feature beschreiben
claude "Füge Multi-Select für Filter hinzu"

# 2. Tests ausführen
/test

# 3. Build validieren
/build

# 4. Deployment
/deploy
```

### Bug fixen
```bash
# 1. Bug beschreiben
claude "Favoriten werden nach Page-Reload nicht geladen"

# 2. Fix validieren mit Tests
/test

# 3. Quick Deployment
/deploy
```

### Performance optimieren
```bash
# 1. PWA Expert Mode aktivieren
/output-style pwa-expert

# 2. Analyse
/analyze

# 3. Optimierungen umsetzen
claude "Optimiere Bundle Size für vendor-alpine chunk"

# 4. Validieren
/build
```

## 🔧 Erweiterte Konfiguration

### Persönliche Einstellungen
Bearbeite [settings.local.json](settings.local.json) für projektspezifische Präferenzen:

```json
{
  "permissions": {
    "allow": [
      // Zusätzliche erlaubte Commands
    ]
  },
  "customSettings": {
    "preferredEditor": "vscode",
    "autoFormat": true
  }
}
```

### Neue Slash Commands hinzufügen
Erstelle eine neue Datei in `commands/`:

```markdown
---
description: Deine Command-Beschreibung
---

Deine Anweisungen für Claude...
```

Nutzung: `/dein-command-name`

## 📚 Ressourcen

- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- [FAM Trainingsplan README](../README.md)
- [Project Repository](https://github.com/jasha256/fam-trainingsplan)

## 🤝 Support

Bei Fragen oder Problemen:
1. Prüfe diese Dokumentation
2. Nutze `claude "Hilfe zu Slash Commands"`
3. Siehe [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)

---

**Version**: 1.0.0
**Letzte Aktualisierung**: 2025-01-09
**Kompatibel mit**: Claude Code v1.0+
