---
description: Erstellt Production Build und validiert Output
---

Führe einen Production Build durch und validiere das Ergebnis:

1. **Build erstellen**:
   ```bash
   npm run build
   ```

2. **Build-Output analysieren**:
   - Prüfe ob `dist/` Ordner erfolgreich erstellt wurde
   - Zeige Bundle-Größen der generierten Dateien
   - Warne wenn Chunks größer als 600KB sind
   - Prüfe ob alle Assets (Icons, Manifest) kopiert wurden

3. **PWA Validierung**:
   - Prüfe ob `dist/manifest.json` existiert
   - Prüfe ob Service Worker generiert wurde
   - Validiere Icon-Größen (72x72 bis 512x512)

4. **Preview starten** (optional):
   ```bash
   npm run preview
   ```
   - Öffne http://localhost:4173
   - Teste grundlegende Funktionalität

5. **Build-Bericht**:
   - Zusammenfassung der Bundle-Größen
   - Hinweise zur Optimierung
   - Deployment-Bereitschaft bestätigen
