# Bugfix Session - Kritische UX-Probleme

## Übersicht

Die aktuelle Implementierung der Sidebar und Filter hat mehrere kritische
UX-Probleme, die die App unbrauchbar machen.

## 🚨 KRITISCHE PROBLEME

### 1. Filter-Funktionalität komplett defekt

**Problem:**

- Standardmäßig werden KEINE Trainings angezeigt
- Ein einzelner Klick auf einen Filter wählt SOFORT ALLE Filter aus
- Filter-Logik ist fehlerhaft implementiert

**Erwartetes Verhalten:**

- Initial: ALLE Trainings sichtbar (alle Filter aktiv)
- Ein Klick: NUR dieser Filter aktiv, andere deaktiviert
- Logische UND-Verknüpfung bei mehreren aktiven Filtern

**Zu prüfen:**

- `src/js/trainingsplaner/filter-engine.js`
- `src/js/trainingsplaner/quick-filters.js`
- Event-Handler für Filter-Checkboxen

### 2. Schnellfilter-Layout unbrauchbar

**Problem:**

- Horizontaler Slider für Schnellfilter
- Schlechte UX, vor allem mobil

**Gewünschte Lösung:**

- Automatischer Umbruch der Filter-Chips
- Kein horizontales Scrolling
- Responsive Anordnung (Flexbox wrap)

**Betroffene Komponenten:**

- Quick Filters Container in Sidebar
- CSS für `.quick-filters` oder ähnlich

### 3. Sidebar Design unausgereift

**Problem:**

- Wirkt generell "hässlich" und unprofessionell
- Desktop und Mobile beide betroffen
- Material Design 3 Guidelines nicht korrekt umgesetzt

**Zu verbessern:**

- Spacing und Padding überarbeiten
- Typografie konsistenter machen
- Farben gemäß M3-Tokens verwenden
- Container-Hierarchie klarer strukturieren

**Betroffene Dateien:**

- `src/styles/sidebar.css` (falls vorhanden)
- Inline-Styles in `trainingsplaner.js`

### 4. Fehlende Desktop-Einstellungen

**Problem:**

- Einstellungen-Button/Panel fehlt komplett im Desktop-Layout
- Nur in Mobile-Bottom-Nav vorhanden (?)

**Gewünschte Lösung:**

- Settings-Button in Desktop-Sidebar hinzufügen
- Konsistente Position in beiden Layouts
- Icon: `settings` (Material Symbols)

**Zu implementieren:**

- Desktop-Sidebar um Settings erweitern
- Settings-Panel/Dialog vorbereiten

### 5. Export/Share-Buttons unintuitiv

**Problem:**

- Aktuelle Implementierung unklar (zu prüfen)
- Sollten einfache Buttons mit Menü sein

**Gewünschte Lösung:**

```
[Export-Button] → Menü öffnet:
  - Als PDF exportieren
  - Als JSON exportieren
  - Trainingsplan drucken

[Teilen-Button] → Menü öffnet:
  - Link kopieren
  - Per E-Mail teilen
  - QR-Code generieren
```

**Zu implementieren:**

- MD3 Menu-Komponenten verwenden
- Icons: `download`, `share`

## 📋 PRIORITÄTEN

### P0 - BLOCKER (sofort beheben)

1. Filter-Funktionalität reparieren
   - Standard-Zustand: alle Filter aktiv
   - Click-Logik korrigieren
   - Test: `tests/unit/filter-engine.test.js`

### P1 - KRITISCH (heute beheben)

2. Schnellfilter-Umbruch implementieren
3. Desktop-Einstellungen hinzufügen

### P2 - WICHTIG (diese Woche)

4. Sidebar-Design überarbeiten
5. Export/Share-Menüs implementieren

## 🧪 TESTS ZU SCHREIBEN/FIXEN

```bash
# Unit Tests
tests/unit/filter-engine.test.js
  - ✓ Initial state: all filters active
  - ✓ Single filter click: only that filter active
  - ✓ Multiple filters: AND logic
  - ✓ No trainings hidden by default

tests/unit/quick-filters.test.js
  - ✓ Filters wrap correctly
  - ✓ No horizontal scroll

# E2E Tests
tests/e2e/filter-functionality.spec.js
  - ✓ Default view shows all trainings
  - ✓ Single filter shows correct subset
  - ✓ Multiple filters combine correctly
```

## 🎯 ACCEPTANCE CRITERIA

### Filter-Funktionalität

- [ ] Initial: Alle Trainings sichtbar
- [ ] Ein Filter-Klick: Nur dieser Filter aktiv
- [ ] Mehrere Filter: Korrekte UND-Verknüpfung
- [ ] Visuelles Feedback klar und eindeutig

### Layout & Design

- [ ] Schnellfilter umbrechen automatisch
- [ ] Kein horizontales Scrolling
- [ ] Sidebar sieht professionell aus
- [ ] M3-Guidelines korrekt umgesetzt

### Funktionalität

- [ ] Settings im Desktop zugänglich
- [ ] Export-Button öffnet Menü mit Optionen
- [ ] Share-Button öffnet Menü mit Optionen

## 📂 RELEVANTE DATEIEN

```
src/js/trainingsplaner/
├── filter-engine.js          # Filter-Logik (HAUPTPROBLEM)
├── quick-filters.js          # Schnellfilter-UI
├── state.js                  # Initial State
└── sidebar.js (?)            # Sidebar-Komponente

src/styles/
├── sidebar.css (?)           # Sidebar-Styling
└── filters.css (?)           # Filter-Styling

tests/
├── unit/filter-engine.test.js
├── unit/quick-filters.test.js
└── e2e/filter-functionality.spec.js
```

## 🚀 EMPFOHLENER WORKFLOW

1. **Analyse der Filter-Logik**

   ```bash
   # Filter-Engine untersuchen
   less src/js/trainingsplaner/filter-engine.js
   less src/js/trainingsplaner/state.js
   ```

2. **Tests schreiben (TDD)**

   ```bash
   # Erwartetes Verhalten definieren
   npm run test:unit -- filter-engine.test.js --watch
   ```

3. **Filter-Logik fixen**
   - Initial State korrigieren
   - Click-Handler reparieren
   - Tests grün machen

4. **Quick-Filter-Layout**
   - CSS zu Flexbox wrap ändern
   - Horizontales Scrolling entfernen

5. **Desktop-Settings**
   - Button in Sidebar hinzufügen
   - Settings-Panel vorbereiten

6. **Export/Share-Menüs**
   - MD3-Menü-Komponenten implementieren
   - Optionen definieren und verknüpfen

## 💡 HINWEISE

- **Debugging-Tipp**: Console-Logs in `filter-engine.js` einfügen, um
  Click-Events zu tracken
- **Browser-DevTools**: Network-Tab prüfen, ob Filter-Daten korrekt geladen
  werden
- **State-Management**: `src/js/trainingsplaner/state.js` ist vermutlich die
  zentrale Quelle
- **M3-Komponenten**: `@material/web` Komponenten verwenden, nicht selbst bauen

## ⚠️ BEKANNTE FALLSTRICKE

1. Filter-State könnte in mehreren Dateien verteilt sein
2. Event-Bubbling könnte Click-Handler stören
3. CSS-Spezifität könnte Layout-Probleme verursachen
4. Reactive Updates könnten nicht korrekt getriggert werden

---

**Session-Start-Kommando:**

```bash
# Tests starten und Filter-Code öffnen
npm run test:unit -- filter-engine.test.js --watch
```

**Erste Schritte:**

1. Filter-Engine Code lesen
2. Initial State prüfen
3. Click-Handler analysieren
4. Tests schreiben für erwartetes Verhalten
5. Implementierung fixen
