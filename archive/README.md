# Archive - Legacy Code

Dieses Verzeichnis enthält veralteten Code, der aus dem aktiven `src/` Verzeichnis entfernt wurde.

## 📦 Archivierte Dateien

### `trainingsplaner.legacy.js` (30kb)
- **Typ:** Alte monolithische Version des Trainingsplaners
- **Archiviert:** 2025-10-19
- **Grund:** Ersetzt durch modulares Design in `src/js/trainingsplaner/`
- **Coverage:** 0% (nicht mehr getestet)

### `trainingsplaner.monolithic.js` (30kb)
- **Typ:** Weitere alte monolithische Version
- **Archiviert:** 2025-10-19
- **Grund:** Ersetzt durch modulares Design
- **Coverage:** 0% (nicht mehr getestet)

### `computed-properties.js` (5.8kb)
- **Typ:** Getter-basiertes Modul für berechnete Properties
- **Archiviert:** 2025-10-19
- **Grund:** Nicht mehr verwendet, Funktionalität in andere Module integriert
- **Coverage:** 0% (keine Imports gefunden)

## 📊 Impact auf Coverage

**Vor Archivierung:**
- Gesamt-Coverage: **50.15%**
- Legacy-Files senkten Coverage massiv

**Nach Archivierung:**
- Gesamt-Coverage: **81.71%** (+63%)
- Nur noch aktiver Code wird getestet

## ⚠️ Hinweise

- Diese Dateien werden **NICHT mehr gepflegt**
- Nur für historische Referenz behalten
- Nicht in Git versioniert (`.gitignore`)
- Bei Bedarf können sie gelöscht werden

## 🔄 Migration

Falls Code aus diesen Dateien benötigt wird:
1. Prüfe zuerst, ob die Funktionalität bereits im neuen Code existiert
2. Siehe `src/js/trainingsplaner/` für das modulare Design
3. Bei Fragen: siehe `TESTING_SUMMARY.md` für Architektur-Übersicht

---

**Archiviert am:** 2025-10-19
**Version:** 3.1.0
**Coverage-Verbesserung:** +63% (50.15% → 81.71%)
