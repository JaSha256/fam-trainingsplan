Aktualisiere die Knowledge Base mit den neuesten Informationen von den eingesetzten Tools.

Führe folgende Aufgaben aus:
1. Lese die aktuelle package.json und vergleiche mit .claude/knowledge/tools.json
2. Für jedes Tool: Prüfe online nach der neuesten Version
3. Wenn neuere Versionen gefunden: Extrahiere die wichtigsten Änderungen
4. Aktualisiere tools.json mit neuen Versionen und relevanten Änderungen
5. Füge neue Patterns hinzu, falls nötig

Fokus auf:
- Major/Minor Version Updates (nicht Patch-Updates)
- Breaking Changes
- Neue Features die für dieses Projekt relevant sind
- Performance-Verbesserungen
- Sicherheitsupdates

Ignoriere:
- Detaillierte Changelogs (nur Kernänderungen)
- Experimentelle Features
- Abwärtskompatible Patch-Updates

Nutze WebFetch für aktuelle Versionsinformationen von:
- npm registry für Paket-Versionen
- Offizielle Dokumentationen für neue Features
- GitHub Releases für wichtige Änderungen