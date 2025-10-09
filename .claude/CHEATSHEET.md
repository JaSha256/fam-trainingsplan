# Claude Code Cheatsheet - FAM Trainingsplan

## 🚀 Schnellstart

```bash
claude                  # Interactive Mode starten
claude "task"           # One-Shot Command
exit                    # Claude beenden
```

## 📋 Slash Commands

| Command | Beschreibung |
|---------|--------------|
| `/test` | Alle Tests ausführen (Unit + E2E) |
| `/build` | Production Build + Validierung |
| `/pwa` | PWA Health Check |
| `/deploy` | Kompletter Deployment-Workflow |
| `/dev` | Dev Server starten |
| `/analyze` | Code-Analyse + Verbesserungen |
| `/fix` | Prettier + ESLint Auto-Fix |

## 🎨 Output Styles

```bash
/output-style learning      # Lern-Modus mit Erklärungen
/output-style pwa-expert    # PWA Performance-Fokus
/output-style quick-fix     # Minimalistisch, nur Fix
/output-style default       # Zurück zum Standard
```

## 💡 Häufige Aufgaben

### Feature entwickeln
```bash
claude "Füge neue Filter-Option hinzu: $FEATURE_NAME"
/test
/build
```

### Bug fixen
```bash
claude "Fix: $BUG_DESCRIPTION"
/test
```

### Tests debuggen
```bash
/test
# Claude analysiert Fehler automatisch
```

### Performance optimieren
```bash
/output-style pwa-expert
/analyze
claude "Optimiere Bundle Size"
```

### Deployment
```bash
/deploy
# Führt automatisch durch:
# 1. Tests
# 2. Lint
# 3. Build
# 4. Validierung
# 5. Git Commit/Push (optional)
```

## 🎯 Pro-Tipps

### 1. Kontext bereitstellen
```bash
# ❌ Zu vage
claude "Fix den Bug"

# ✅ Klar und präzise
claude "Fix: Favoriten werden nach Page-Reload nicht aus LocalStorage geladen"
```

### 2. Batch-Tasks
```bash
# ✅ Mehrere Tasks auf einmal
claude "1. Füge Validation zu Filter hinzu, 2. Schreibe Tests, 3. Update Docs"
```

### 3. File-Referenzen nutzen
```bash
# Nutze @ für File-Referenzen
claude "Analysiere @src/js/trainingsplaner.js und schlage Optimierungen vor"
```

### 4. Output Style wechseln
```bash
# Beim Lernen
/output-style learning
claude "Wie funktioniert die Geolocation-Implementierung?"

# Bei Bugs
/output-style quick-fix
claude "Fix: Karte lädt nicht"

# Zurück zum Standard
/output-style default
```

## 🔍 Debugging

### Test-Fehler analysieren
```bash
/test
# Claude zeigt automatisch:
# - Fehlgeschlagene Tests
# - Root Cause
# - Fix-Vorschläge
```

### Build-Probleme
```bash
/build
# Claude prüft:
# - Build-Errors
# - Bundle-Size Warnings
# - Missing Assets
```

### PWA-Probleme
```bash
/pwa
# Claude validiert:
# - Manifest
# - Service Worker
# - Icons
# - Cache-Strategien
```

## 📦 Nützliche Commands

### Git-Integration
```bash
claude "Zeige Git Status"
claude "Was wurde geändert?"
claude "Commit alle Änderungen mit Message: $MESSAGE"
```

### Code-Quality
```bash
/fix                              # Auto-Format + Lint
/analyze                          # Code-Review
claude "Prüfe auf Code-Duplikation"
```

### Dokumentation
```bash
claude "Update README mit neuen Features"
claude "Generiere JSDoc-Kommentare für trainingsplaner.js"
```

## ⚙️ Konfiguration

### Settings anpassen
```bash
# Projekt-weit
.claude/settings.json

# Persönlich (gitignored)
.claude/settings.local.json
```

### Neue Slash Commands erstellen
```bash
# Datei erstellen: .claude/commands/mein-command.md
# Nutzung: /mein-command
```

## 🚫 Was NICHT tun

❌ **Sensitive Daten committen**
- Claude fragt vor Git-Operationen
- .env Dateien sind geschützt

❌ **node_modules bearbeiten**
- Zugriff ist blockiert

❌ **Config-Dateien ohne Review ändern**
- Änderungen erfordern Bestätigung

## 🔑 Tastenkombinationen (Interactive Mode)

| Shortcut | Aktion |
|----------|--------|
| `Ctrl+C` | Abbrechen / Stop |
| `Ctrl+D` | Claude beenden |
| `↑` / `↓` | Command-History |
| `Ctrl+R` | History durchsuchen |
| `Ctrl+L` | Terminal clearen |

## 📊 Performance-Tipps

### Bundle Size reduzieren
```bash
/output-style pwa-expert
claude "Analysiere Bundle und schlage Optimierungen vor"
```

### Cache-Strategien optimieren
```bash
/pwa
claude "Optimiere Service Worker Cache-Strategien"
```

### Lighthouse-Score verbessern
```bash
/output-style pwa-expert
claude "Analysiere Performance-Metriken und optimiere"
```

## 🆘 Hilfe

```bash
claude "Zeige verfügbare Slash Commands"
claude "Wie nutze ich Output Styles?"
claude "Erkläre die Permission-Konfiguration"
```

---

**Quick Reference**: Bookmark diese Seite für schnellen Zugriff!
