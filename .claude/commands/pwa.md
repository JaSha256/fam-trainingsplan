---
description: Überprüft PWA-Konfiguration und Features
---

Führe einen umfassenden PWA Health Check durch:

1. **Manifest Validierung** (`public/manifest.json`):
   - Name, short_name, description
   - theme_color, background_color
   - display, orientation, scope, start_url
   - Icons: Alle Größen vorhanden? (72x72 bis 512x512)
   - Shortcuts konfiguriert?

2. **Service Worker Konfiguration** (`vite.config.js`):
   - VitePWA Plugin korrekt konfiguriert?
   - Workbox Runtime Caching Strategien:
     * Trainingsplan-Daten (NetworkFirst)
     * Leaflet Assets (CacheFirst)
     * OSM Tiles (CacheFirst)
     * Images & Fonts (CacheFirst)
   - Offline Fallback konfiguriert?

3. **PWA Features prüfen**:
   - ✓ Installierbar als App
   - ✓ Offline-Funktionalität
   - ✓ Service Worker Auto-Update
   - ✓ App Shortcuts für Quick-Access
   - ✓ Icons in allen Größen

4. **Performance Checks**:
   - Cache-Strategien optimiert?
   - Bundle-Größe < 600KB?
   - Lazy Loading implementiert?

5. **Best Practices**:
   - HTTPS required (außer localhost)
   - Start URL funktioniert
   - Theme Color passend zu Brand

Zeige einen detaillierten Bericht mit allen Prüfungsergebnissen.
