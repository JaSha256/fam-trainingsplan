# FAM Trainingsplan v2.4.0

Interaktiver Trainingsplan für Free Arts of Movement (FAM) München.
**Parkour • Trampolin • Tricking • Movement Training**

## Features

### Core Features
- **Dynamische Filter**: Nach Wochentag, Ort, Trainingsart und Altersgruppe filtern
- **Fuzzy-Suche**: Intelligente Textsuche mit Fuse.js
- **Quick-Filter**: Schnellzugriff auf Heute, Morgen, Wochenende, Probetraining
- **Interaktive Karte**: Leaflet-Integration mit Clustern und Popups
- **Responsive Design**: Mobile-First mit Touch-Optimierung

### Neue Features (v2.4.0)

#### 1. URL-basierte Filter (Share-Links)
Teile gefilterte Trainings per Link:
```
https://example.com/?tag=montag&ort=LTR&art=parkour
```
- Alle Filter werden in URL-Parameter gespeichert
- Links können per WhatsApp, E-Mail etc. geteilt werden
- Automatisches Laden der Filter beim Öffnen

#### 2. Favoriten-System
- Trainings als Favoriten markieren (Herz-Icon)
- Favoriten werden in LocalStorage gespeichert
- Quick-Filter "Favoriten" zeigt nur gespeicherte Trainings
- Badge mit Anzahl der Favoriten

#### 3. Geolocation - "In meiner Nähe"
- GPS-basierte Standortermittlung
- Distanz-Anzeige bei jedem Training (z.B. "2.3 km entfernt")
- Sortierung nach Entfernung
- Quick-Filter "In meiner Nähe"
- Funktioniert nur mit HTTPS oder localhost

#### 4. Kalender-Export (.ics)
- Exportiere Trainings in deinen Kalender
- `.ics`-Dateien kompatibel mit:
  - Google Calendar
  - Apple Calendar
  - Outlook
  - Alle iCal-kompatiblen Apps
- Automatische Berechnung des nächsten Trainingstermins

#### 5. Share-Funktionalität
- Native Share API für Mobile
- Fallback: Link in Zwischenablage kopieren
- Teile einzelne Trainings oder Filter-Kombinationen

#### 6. PWA (Progressive Web App)
- Als App installierbar (Android, iOS, Desktop)
- Offline-Funktionalität
- App-Shortcuts für Quick-Access
- Service Worker für Caching
- Push-Notifications vorbereitet

#### 7. Touch-Gesten (Mobile)
- Swipe von links: Filter öffnen
- Swipe von rechts: Filter schließen
- Optimiert für Touch-Devices

#### 8. Auto-Update-Check
- Automatische Erkennung neuer Versionen
- Update-Benachrichtigung
- Nahtloses Update ohne Datenverlust

## Installation

### Voraussetzungen
- Node.js >= 20.19.0
- npm >= 10.0.0

### Setup

#### Arch Linux (Automatisch)

```bash
# Repository klonen
git clone https://github.com/jasha256/fam-trainingsplan.git
cd fam-trainingsplan

# Automatisches Setup mit Arch Linux Optimierungen
zsh ./setup-arch.sh

# Development Server starten
npm run dev
```

**Siehe [docs/SETUP-ARCH.md](docs/SETUP-ARCH.md) für Details.**

#### Standard Setup

```bash
# Repository klonen
git clone https://github.com/jasha256/fam-trainingsplan.git
cd fam-trainingsplan

# Dependencies installieren
npm ci

# Development Server starten
npm run dev

# Production Build
npm run build

# Preview des Builds
npm run preview
```

## Projektstruktur

```
fam-trainingsplan/
├── src/
│   ├── js/
│   │   ├── config.js          # Zentrale Konfiguration
│   │   ├── utils.js           # Helper-Funktionen
│   │   ├── trainingsplaner.js # Haupt-Komponente
│   │   └── iframe-resize.js   # Iframe-Integration
│   ├── style.css              # Tailwind + Custom CSS
│   └── main.js                # Entry Point
├── public/
│   ├── manifest.json          # PWA Manifest
│   ├── offline.html           # Offline-Fallback
│   ├── version.json           # Update-Check
│   └── icons/                 # PWA Icons
├── index.html                 # Haupt-Template
├── vite.config.js             # Build-Konfiguration
├── tailwind.config.js         # CSS-Framework
└── package.json               # Dependencies
```

## Konfiguration

### config.js

Zentrale Konfiguration in `src/js/config.js`:

```javascript
export const CONFIG = {
  // Daten-Quelle
  jsonUrl: 'https://jasha256.github.io/fam-trainingsplan/trainingsplan.json',
  
  // Caching
  cacheEnabled: true,
  cacheDuration: 3600000, // 1 Stunde
  
  // Features ein-/ausschalten
  features: {
    enableFavorites: true,
    enableGeolocation: true,
    enableShareLinks: true,
    enableCalendarExport: true,
    enablePWA: true,
    enableTouchGestures: true,
    enableUpdateCheck: true
  },
  
  // Geolocation
  map: {
    geolocation: {
      maxDistance: 50, // km
      timeout: 10000
    }
  }
}
```

## Daten-Format

### trainingsplan.json

```json
{
  "version": "2.3.0",
  "generated": "2025-01-02T12:00:00.000Z",
  "metadata": {
    "orte": ["LTR", "Balanstr.", ...],
    "trainingsarten": ["Parkour", "Trampolin", ...],
    "altersgruppen": ["Kids", "Teens", "Adults"],
    "wochentage": ["Montag", "Dienstag", ...]
  },
  "trainings": [
    {
      "id": 0,
      "wochentag": "Montag",
      "ort": "LTR",
      "von": "18:00",
      "bis": "20:00",
      "training": "Parkour",
      "altersgruppe": "Kids",
      "alterVon": 6,
      "alterBis": 11,
      "trainer": "Max",
      "probetraining": "ja",
      "anmerkung": "",
      "link": "https://fam.kurabu.com/...",
      "lat": 48.124155,
      "lng": 11.621655
    }
  ]
}
```

## Features im Detail

### URL-Filter

**Parameter-Mapping:**
- `tag` → Wochentag
- `ort` → Standort
- `art` → Trainingsart
- `alter` → Altersgruppe
- `suche` → Suchbegriff
- `naehe` → Geolocation-Modus

**Beispiele:**
```
# Montags in LTR
/?tag=montag&ort=LTR

# Parkour für Kids
/?art=parkour&alter=Kids

# Probetraining am Wochenende
/?tag=samstag&art=probetraining

# In meiner Nähe
/?naehe=true
```

### Favoriten

**LocalStorage:**
```javascript
// Key: 'trainingsplan_favorites_v1'
// Value: [1, 5, 12, 23] // Training-IDs
```

**Programmatische Nutzung:**
```javascript
import { utils } from './utils.js'

// Favorit hinzufügen
utils.favorites.add(trainingId)

// Favorit entfernen
utils.favorites.remove(trainingId)

// Toggle
utils.favorites.toggle(trainingId)

// Prüfen
utils.favorites.has(trainingId)

// Alle laden
const favs = utils.favorites.load()
```

### Geolocation

**Funktion:**
```javascript
// Position abrufen
const position = await utils.getCurrentPosition()
// { lat: 48.1351, lng: 11.5820, accuracy: 20 }

// Distanz berechnen
const distance = utils.calculateDistance(
  userLat, userLng,
  trainingLat, trainingLng
) // Ergebnis in km

// Distanz zu allen Trainings hinzufügen
const trainingsWithDistance = utils.addDistanceToTrainings(
  trainings,
  userPosition
)
```

**Fehlerbehandlung:**
```javascript
try {
  await utils.getCurrentPosition()
} catch (err) {
  // Fehler-Typen:
  // - "Standort-Berechtigung verweigert"
  // - "Standort nicht verfügbar"
  // - "Standort-Anfrage Timeout"
}
```

### Kalender-Export

**Funktion:**
```javascript
// iCal-Event erstellen
const icalContent = utils.createICalEvent(training)

// Datei downloaden
utils.downloadICalFile(icalContent, 'training-parkour.ics')
```

**iCal-Format:**
```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:0@fam-trainingsplan
DTSTART:20250106T180000Z
DTEND:20250106T200000Z
SUMMARY:Parkour - LTR
DESCRIPTION:Parkour\nAltersgruppe: 6 - 11 Jahre\n...
LOCATION:LTR
URL:https://fam.kurabu.com/...
END:VEVENT
END:VCALENDAR
```

### PWA Installation

**Android:**
1. Öffne die Website in Chrome
2. Tippe auf Menü → "Zum Startbildschirm hinzufügen"
3. App wird wie native App installiert

**iOS:**
1. Öffne die Website in Safari
2. Tippe auf Teilen-Icon
3. "Zum Home-Bildschirm" auswählen

**Desktop:**
1. Chrome: Icon in Adressleiste
2. Edge: Einstellungen → Apps → Diese Seite installieren

**Shortcuts:**
- Heute
- Morgen
- Karte
- Favoriten

## Performance

### Optimierungen
- **Code Splitting**: Vendor-Chunks (Alpine, Leaflet, Fuse)
- **Lazy Loading**: Bilder & Karten-Tiles
- **Caching**: 
  - Training-Daten: 1 Stunde
  - Karten-Tiles: 7 Tage
  - Assets: 30 Tage
- **Service Worker**: Offline-First Strategie
- **Debouncing**: Search (300ms), Filter (100ms)
- **Virtual Scrolling**: Vorbereitet für >1000 Trainings

### Lighthouse Score (Ziel)
- Performance: >95
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: ✓

## Browser-Support

### Desktop
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile
- iOS Safari 14+
- Chrome Android 90+
- Samsung Internet 14+

### Features mit Fallback
- Service Worker → Kein Offline-Modus
- Geolocation → Keine Distanz-Anzeige
- Web Share API → Copy to Clipboard
- Intersection Observer → Alle Cards sofort anzeigen

## Deployment

### Deployment-Script (Empfohlen)

```bash
# Preview lokal
./deploy.sh preview

# Deploy zu nginx (Arch Linux)
./deploy.sh --build nginx

# Deploy zu Apache
./deploy.sh --build apache

# Deploy zu GitHub Pages
./deploy.sh github
```

### GitHub Pages (Automatisch)
```bash
# Build erstellen
npm run build

# Deploy (automatisch via GitHub Actions)
git push origin main
```

### Manuelle Deployment-Optionen

**Siehe [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) für detaillierte Anleitungen:**
- nginx Konfiguration (mit Gzip, Cache Headers, Security)
- Apache .htaccess
- CI/CD mit GitHub Actions
- Performance-Optimierungen
- Troubleshooting

### Umgebungsvariablen
```bash
# .env.example als Vorlage verwenden
cp .env.example .env

# Für Production
VITE_API_URL=https://your-domain.com/trainingsplan.json
```

## Entwicklung

### 📚 Dokumentation

| Dokument | Beschreibung |
|----------|--------------|
| **[QUICK_START.md](QUICK_START.md)** | **Schnellstart-Guide** - Alle npm Scripts, Testing, Development |
| **[SETUP-ARCH.md](docs/SETUP-ARCH.md)** | **Arch Linux Setup** - System-Dependencies, Entwicklungsumgebung |
| **[QUICK-START-ARCH.md](docs/QUICK-START-ARCH.md)** | **Arch Quick Start** - Schnelleinstieg für Arch Linux |
| **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** | **Deployment Guide** - Production deployment (nginx, Apache, GitHub Pages) |
| **[TESTING_SUMMARY.md](TESTING_SUMMARY.md)** | **Test-Dokumentation** - Coverage, Metriken, Test-Details |
| **[FINAL_PROJECT_STATUS.md](FINAL_PROJECT_STATUS.md)** | **Projekt-Status** - Aktuelle Metriken, Qualität |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System-Architektur & Design-Patterns |

### 🧪 Testing (81.71% Coverage)

```bash
# Unit Tests (313 Tests, 98% pass rate)
npm run test:unit
npm run test:coverage        # Mit Coverage-Report

# Integration Tests (60 Tests, 98.3% pass rate)
npm run test:integration

# E2E Tests (Playwright)
npm run test:e2e
npm run test:e2e:ui          # Mit UI

# Alle Tests
npm test                     # Unit + Integration + E2E
```

**Coverage-Metriken:**
- ✅ Statements: 81.71% (Threshold: 80%)
- ✅ Branches: 85.64% (Threshold: 75%)
- ✅ Lines: 81.71% (Threshold: 80%)
- ⚠️ Functions: 72.94% (Threshold: 80%)

**Siehe [TESTING_SUMMARY.md](TESTING_SUMMARY.md) für Details.**

### NPM Scripts
```bash
npm run dev      # Dev-Server (Port 5173)
npm run build    # Production Build
npm run preview  # Preview Build (Port 4173)
```

**Alle Scripts:** Siehe [QUICK_START.md](QUICK_START.md)

### Logging
```javascript
import { log } from './config.js'

log('debug', 'Debug-Nachricht', { data })
log('info', 'Info-Nachricht')
log('warn', 'Warnung')
log('error', 'Fehler', error)
```

### Feature-Flags
```javascript
import { isFeatureEnabled } from './config.js'

if (isFeatureEnabled('enableFavorites')) {
  // Feature-Code
}
```

## Troubleshooting

### Geolocation funktioniert nicht
- **HTTPS erforderlich** (außer localhost)
- Browser-Berechtigung prüfen
- GPS aktiviert?

### PWA installiert sich nicht
- HTTPS erforderlich
- `manifest.json` erreichbar?
- Service Worker registriert?
- Icons vorhanden?

### Karte lädt nicht
- Leaflet CSS geladen?
- `#map-modal-container` existiert?
- Koordinaten vorhanden?

### Cache wird nicht geleert
```javascript
// Cache manuell löschen
localStorage.removeItem('trainingsplan_cache_v2.3')
localStorage.removeItem('trainingFilters')
```

## Roadmap

### v2.4.0 (geplant)
- [ ] Multi-Select Filter
- [ ] Kalender-Sync (Google Calendar API)
- [ ] Push-Notifications für Favoriten
- [ ] Trainer-Profile

### v2.5.0 (geplant)
- [ ] User-Accounts
- [ ] Buchungshistorie
- [ ] Bewertungen & Reviews
- [ ] Social Features

### v3.0.0 (Zukunft)
- [ ] Admin-Panel
- [ ] REST API
- [ ] Real-time Updates (WebSocket)
- [ ] Native Apps (React Native)

## Lizenz

MIT License - Free Arts of Movement

## Support

- **Website**: https://www.freeartsofmovement.com
- **GitHub**: https://github.com/jasha256/fam-trainingsplan
- **Issues**: https://github.com/jasha256/fam-trainingsplan/issues

## Credits

- **Framework**: Alpine.js, Vite, Tailwind CSS
- **Karten**: Leaflet, OpenStreetMap
- **Suche**: Fuse.js
- **Icons**: Heroicons

---

## 🎯 Projekt-Status

**Version:** 3.1.0
**Status:** ✅ PRODUKTIONSBEREIT & OPTIMIERT
**Test Coverage:** 81.71%
**Tests:** 306 passed (98% pass rate)

**Siehe [FINAL_PROJECT_STATUS.md](FINAL_PROJECT_STATUS.md) für vollständigen Status.**

---

**Letzte Aktualisierung**: 2025-10-19