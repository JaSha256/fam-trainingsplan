---
description: Führt alle Tests aus (Unit, Puppeteer, Playwright)
---

Führe einen kompletten Test-Durchlauf durch:

1. **Unit Tests** mit Vitest ausführen:
   ```bash
   npm run test:unit
   ```

2. **Puppeteer E2E Tests** im Headless-Modus:
   ```bash
   npm run test:puppeteer:headless
   ```

3. **Playwright Tests**:
   ```bash
   npm test
   ```

Nach jedem Test-Durchlauf:
- Analysiere alle Fehler und Warnings
- Zeige eine Zusammenfassung der Ergebnisse
- Schlage Fixes für fehlgeschlagene Tests vor

Falls Tests fehlschlagen:
- Identifiziere die Root Cause
- Zeige relevante Code-Stellen
- Biete konkrete Lösungsvorschläge an
