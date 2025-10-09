---
description: Startet Development Server mit Status-Check
---

Starte den Development Server:

1. **Dev Server starten**:
   ```bash
   npm run dev
   ```

2. **Server-Status prüfen**:
   - Server läuft auf Port 5173
   - URL: http://localhost:5173
   - Hot Module Replacement (HMR) aktiv
   - Vite dev server ready

3. **Quick Health Check**:
   - Alpine.js initialisiert?
   - Tailwind CSS geladen?
   - Training-Daten werden geladen?
   - Console-Errors vorhanden?

4. **Entwicklungs-Tipps**:
   - Nutze Browser DevTools für Debugging
   - PWA Service Worker ist im Dev-Mode deaktiviert
   - Änderungen werden automatisch geladen
   - Für PWA-Tests: `npm run build && npm run preview`

**Server läuft!** 🚀
Öffne http://localhost:5173 im Browser.
