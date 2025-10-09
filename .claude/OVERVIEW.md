# Claude Code Setup - Übersicht

## 📁 Struktur

```
.claude/
├── README.md                      # Hauptdokumentation
├── CHEATSHEET.md                  # Schnellreferenz
├── CONTRIBUTING.md                # Team-Workflows
├── OVERVIEW.md                    # Diese Datei
├── settings.json                  # Projekt-Einstellungen (versioniert)
├── settings.local.json            # Persönliche Einstellungen (gitignored)
│
├── commands/                      # Custom Slash Commands
│   ├── test.md                   # /test - Alle Tests ausführen
│   ├── build.md                  # /build - Production Build
│   ├── pwa.md                    # /pwa - PWA Health Check
│   ├── deploy.md                 # /deploy - Deployment Workflow
│   ├── dev.md                    # /dev - Dev Server starten
│   ├── analyze.md                # /analyze - Code-Analyse
│   └── fix.md                    # /fix - Auto-Formatierung
│
└── output-styles/                 # Custom Output Styles
    ├── learning.md               # Learning Mode
    ├── pwa-expert.md             # PWA Expert Mode
    └── quick-fix.md              # Quick Fix Mode
```

## 🎯 Quick Access

### Für Einsteiger
1. Start: [README.md](README.md)
2. Schnellreferenz: [CHEATSHEET.md](CHEATSHEET.md)
3. Erste Schritte: `/dev` dann `/test`

### Für Entwickler
1. Workflows: [CONTRIBUTING.md](CONTRIBUTING.md)
2. Commands: `commands/` Ordner
3. Styles: `output-styles/` Ordner

### Für Admins
1. Konfiguration: [settings.json](settings.json)
2. Permissions: In `settings.json` definiert
3. Team-Settings: [CONTRIBUTING.md](CONTRIBUTING.md)

## 🚀 Slash Commands (7 verfügbar)

| Command | Use Case | Dauer |
|---------|----------|-------|
| `/test` | Alle Tests ausführen | ~2-5 Min |
| `/build` | Production Build + Validierung | ~1-2 Min |
| `/pwa` | PWA Configuration Check | ~30 Sek |
| `/deploy` | Kompletter Deployment | ~5-10 Min |
| `/dev` | Dev Server starten | ~10 Sek |
| `/analyze` | Code-Review & Optimierung | ~1-2 Min |
| `/fix` | Auto-Format & Lint | ~30 Sek |

## 🎨 Output Styles (3 verfügbar)

| Style | Charakteristik | Wann nutzen? |
|-------|----------------|--------------|
| `learning` | Ausführlich, lehrreich | Neue Features lernen |
| `pwa-expert` | Performance-fokussiert | PWA-Optimierung |
| `quick-fix` | Minimalistisch, direkt | Hotfixes, Zeitdruck |

## 🔒 Permissions

### ✅ Automatisch erlaubt (9 Patterns)
- NPM Scripts: `build`, `dev`, `test:*`, `preview`, `lint`, `format`
- Git Read: `git status`, `git diff`
- Node Scripts: `node tests/*`

### ❌ Automatisch blockiert (5 Patterns)
- `node_modules/` (Read/Edit/Write)
- `.env*` Dateien (Edit/Write)

### 🤔 Nachfrage erforderlich (5 Patterns)
- Git Write: `commit`, `push`, `reset`, `rebase`, `merge`
- Config-Änderungen: `*.config.js`
- Datei-Löschungen: `rm`, `del`

## 📊 Statistiken

- **Slash Commands**: 7
- **Output Styles**: 3
- **Dokumentations-Seiten**: 4
- **Permission-Regeln**: 19 (9 allow, 5 deny, 5 ask)
- **Geschützte Dateien**: `node_modules/`, `.env*`
- **Versioniert**: `settings.json`, `commands/`, `output-styles/`, Docs
- **Gitignored**: `settings.local.json`, `.session/`, `memory/`

## 🎓 Learning Path

### Stufe 1: Basics (Tag 1)
```bash
# Setup
.claude/README.md lesen

# Erste Commands
/dev
/test
/build
```

### Stufe 2: Workflows (Woche 1)
```bash
# Feature entwickeln
/output-style learning
claude "Implementiere Feature X"
/test
/build

# CONTRIBUTING.md lesen
```

### Stufe 3: Advanced (Monat 1)
```bash
# Custom Commands erstellen
# Neue .md in commands/ erstellen

# Output Styles nutzen
/output-style pwa-expert
/analyze

# Settings anpassen
settings.local.json bearbeiten
```

## 🔄 Typische Workflows

### Daily Development
```
/dev → Code → /fix → /test → Repeat
```

### Feature Development
```
Plan → /output-style learning → Implement → /test → /analyze → /build
```

### Bug Fixing
```
/output-style quick-fix → Debug → Fix → /test → /deploy
```

### Performance Optimization
```
/output-style pwa-expert → /analyze → Optimize → /build → /pwa
```

### Deployment
```
/fix → /test → /build → /pwa → /deploy
```

## 💡 Pro-Tipps

### 1. Command-Chaining
```bash
# Nach Feature-Implementierung
/fix
/test
/build
/analyze
```

### 2. Style-Switching
```bash
# Bei Learning
/output-style learning
claude "Erkläre Feature X"

# Bei Bug
/output-style quick-fix
claude "Fix Bug Y"

# Zurück
/output-style default
```

### 3. Context nutzen
```bash
# Claude merkt sich vorherigen Kontext
claude "Analysiere trainingsplaner.js"
claude "Wie optimiere ich das?"  # Bezieht sich auf trainingsplaner.js
```

## 📈 ROI & Benefits

### Zeitersparnis
- **Tests**: `/test` statt 3 separate Commands
- **Deployment**: `/deploy` statt 10+ manuelle Schritte
- **Code-Review**: `/analyze` statt manuelle Prüfung

### Qualität
- **Konsistenz**: `/fix` formatiert nach Standards
- **Best Practices**: Output Styles geben Guidance
- **Error Prevention**: Permissions verhindern Fehler

### Team-Produktivität
- **Onboarding**: CONTRIBUTING.md als Guideline
- **Standards**: Shared `settings.json`
- **Documentation**: Auto-generiert durch Claude

## 🔮 Zukünftige Erweiterungen

### Geplant
- [ ] Pre-Commit Hooks
- [ ] Post-Deploy Hooks
- [ ] MCP Integration (GitHub, Sentry)
- [ ] Custom Agents
- [ ] CI/CD Integration

### Ideen
- [ ] Performance-Monitoring Hook
- [ ] Automated Changelog Generation
- [ ] Lighthouse-Score Tracking
- [ ] Bundle-Size Alerts

## 📞 Support & Ressourcen

### Interne Docs
- [README.md](README.md) - Umfassende Dokumentation
- [CHEATSHEET.md](CHEATSHEET.md) - Schnellreferenz
- [CONTRIBUTING.md](CONTRIBUTING.md) - Team-Workflows

### Externe Ressourcen
- [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [Project Repository](https://github.com/jasha256/fam-trainingsplan)

### Quick Help
```bash
claude "Hilfe zu Slash Commands"
claude "Wie nutze ich Output Styles?"
claude "Erkläre die Permission-Konfiguration"
```

## ✅ Setup-Checklist

- [x] `.claude/` Ordner erstellt
- [x] `settings.json` konfiguriert
- [x] 7 Slash Commands verfügbar
- [x] 3 Output Styles erstellt
- [x] 4 Dokumentations-Seiten geschrieben
- [x] `.gitignore` aktualisiert
- [x] Permissions definiert
- [ ] Team informiert (Next Step)
- [ ] Erste Tests durchgeführt (Next Step)

## 🎉 Bereit zum Starten!

```bash
# Claude Code starten
claude

# Ersten Command ausprobieren
/test

# Oder Feature entwickeln
claude "Zeige mir was möglich ist"
```

---

**Setup Version**: 1.0.0
**Erstellt**: 2025-01-09
**Kompatibel mit**: Claude Code v1.0+
**Projekt**: FAM Trainingsplan v2.4.0
