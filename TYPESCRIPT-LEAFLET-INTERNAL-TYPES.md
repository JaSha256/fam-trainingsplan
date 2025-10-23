# TypeScript Type Definitions für Leaflet Interne APIs

**Datum**: 2025-10-23
**Problem**: TypeScript-Fehler bei Verwendung von Leaflet internen/privaten APIs
**Kontext**: Leaflet Race Condition Fix benötigt Zugriff auf interne Methoden

## TypeScript-Fehler

### Fehlerübersicht

```
src/js/trainingsplaner/map-controls.js(113,5): error TS2578: Unused '@ts-expect-error' directive.

src/js/trainingsplaner/map-manager.js(154,29): error TS2551: Property '_latLngToNewLayerPoint' does not exist on type 'Map'.
src/js/trainingsplaner/map-manager.js(154,57): error TS2339: Property '_latlng' does not exist on type 'Marker<any>'.
src/js/trainingsplaner/map-manager.js(155,12): error TS2339: Property '_setPos' does not exist on type 'Marker<any>'.

src/js/trainingsplaner/map-manager.js(164,29): error TS2551: Property '_latLngToNewLayerPoint' does not exist on type 'Map'.
src/js/trainingsplaner/map-manager.js(164,57): error TS2339: Property '_latlng' does not exist on type 'Popup'.
src/js/trainingsplaner/map-manager.js(165,27): error TS2339: Property '_getAnchor' does not exist on type 'Popup'.
src/js/trainingsplaner/map-manager.js(166,34): error TS2339: Property '_container' does not exist on type 'Popup'.

src/js/trainingsplaner/map-manager.js(172,27): error TS2339: Property '_animateZoom' does not exist on type 'Tooltip'.
src/js/trainingsplaner/map-manager.js(172,52): error TS7006: Parameter 'e' implicitly has an 'any' type.
src/js/trainingsplaner/map-manager.js(176,31): error TS2551: Property '_latLngToNewLayerPoint' does not exist on type 'Map'.
src/js/trainingsplaner/map-manager.js(176,59): error TS2339: Property '_latlng' does not exist on type 'Tooltip'.
src/js/trainingsplaner/map-manager.js(177,29): error TS2339: Property '_getAnchor' does not exist on type 'Tooltip'.
src/js/trainingsplaner/map-manager.js(178,36): error TS2339: Property '_container' does not exist on type 'Tooltip'.
```

## Analyse der Internen APIs

### 1. L.Map Interne Properties

#### `_latLngToNewLayerPoint()`
- **Typ**: Interne Methode
- **Zweck**: Konvertiert geografische Koordinaten zu Layer-Pixel-Koordinaten während Zoom-Animation
- **Signatur**: `_latLngToNewLayerPoint(latlng: LatLng, zoom: number, center: LatLng): Point`
- **Status**: Nicht in offiziellen TypeScript-Definitionen (privat, beginnt mit `_`)
- **Verwendung**: Wird von Leaflet intern während Zoom-Animationen verwendet

### 2. L.Marker Interne Properties

#### `_latlng`
- **Typ**: Private Property
- **Zweck**: Speichert die geografischen Koordinaten des Markers
- **Signatur**: `_latlng: LatLng`
- **Public Alternative**: `getLatLng()` (aber nicht in Callback verfügbar)

#### `_setPos()`
- **Typ**: Private Methode
- **Zweck**: Setzt die DOM-Position des Markers
- **Signatur**: `_setPos(pos: Point): void`
- **Status**: Nicht in öffentlichen APIs

#### `_animateZoom()`
- **Typ**: Private Methode (die wir überschreiben)
- **Zweck**: Animiert Marker-Position während Zoom
- **Signatur**: `_animateZoom(opt: {zoom: number, center: LatLng}): void`

### 3. L.Popup Interne Properties

#### `_latlng`
- **Typ**: Private Property
- **Zweck**: Popup-Anker-Koordinaten
- **Signatur**: `_latlng: LatLng`

#### `_getAnchor()`
- **Typ**: Private Methode
- **Zweck**: Berechnet Popup-Anker-Offset
- **Signatur**: `_getAnchor(): Point`

#### `_container`
- **Typ**: Private Property
- **Zweck**: DOM-Element des Popups
- **Signatur**: `_container: HTMLElement`

#### `_animateZoom()`
- **Typ**: Private Methode (die wir überschreiben)
- **Zweck**: Animiert Popup-Position während Zoom
- **Signatur**: `_animateZoom(e: {zoom: number, center: LatLng}): void`

### 4. L.Tooltip Interne Properties

Gleiche Properties wie Popup (gleiche Basis-Klasse):
- `_latlng: LatLng`
- `_getAnchor(): Point`
- `_container: HTMLElement`
- `_animateZoom(e: {zoom: number, center: LatLng}): void`

## Lösungsansätze

### Option 1: @ts-ignore für gesamte Methode (AKTUELL)

**Vorteile**:
- Einfach und schnell
- Funktioniert sofort

**Nachteile**:
- Deaktiviert ALLE Type-Checks für die Methode
- Könnte echte Fehler verbergen
- Nicht best practice

**Implementierung**:
```javascript
// @ts-ignore - Overriding internal Leaflet method
L.Marker.prototype._animateZoom = function (opt) {
  // ... gesamte Methode ohne Type-Checks
}
```

### Option 2: @ts-expect-error für spezifische Zeilen (EMPFOHLEN)

**Vorteile**:
- Granulare Kontrolle - nur spezifische Fehler suppressed
- Dokumentiert genau WELCHE internen APIs verwendet werden
- Fehlt später wenn Fehler behoben ist (TypeScript warnt)

**Nachteile**:
- Mehr Code
- Muss für jede Zeile separat angewendet werden

**Implementierung**:
```javascript
L.Marker.prototype._animateZoom = function (opt) {
  if (!this._map) {
    return
  }
  // @ts-expect-error - _latLngToNewLayerPoint is internal Leaflet API
  const pos = this._map._latLngToNewLayerPoint(
    // @ts-expect-error - _latlng is internal Marker property
    this._latlng,
    opt.zoom,
    opt.center
  ).round()
  // @ts-expect-error - _setPos is internal Marker method
  this._setPos(pos)
}
```

### Option 3: Type Declarations erweitern (BEST PRACTICE)

**Vorteile**:
- Saubere Type-Safety
- Dokumentiert die internen APIs formal
- Wiederverwendbar für andere Code-Stellen
- Best Practice für TypeScript

**Nachteile**:
- Mehr Aufwand initial
- Benötigt separate `.d.ts` Datei

**Implementierung**:

**Datei**: `src/types/leaflet-internals.d.ts` (NEU)

```typescript
/**
 * Extended Leaflet Type Definitions for Internal APIs
 *
 * These definitions extend the official Leaflet types to include
 * internal/private APIs that are used for the race condition fix.
 *
 * IMPORTANT: These are internal Leaflet APIs and may change between versions.
 * They are marked with underscore prefix to indicate private status.
 *
 * References:
 * - https://github.com/Leaflet/Leaflet/blob/main/src/layer/marker/Marker.js
 * - https://github.com/Leaflet/Leaflet/blob/main/src/layer/Popup.js
 * - https://github.com/Leaflet/Leaflet/blob/main/src/layer/Tooltip.js
 */

import * as L from 'leaflet'

declare module 'leaflet' {
  /**
   * Extended Map type with internal animation method
   */
  interface Map {
    /**
     * Internal method to convert LatLng to pixel coordinates during zoom animation
     * @internal
     * @param latlng - Geographic coordinates
     * @param zoom - Target zoom level
     * @param center - Animation center point
     * @returns Pixel coordinates as Point
     */
    _latLngToNewLayerPoint(latlng: LatLng, zoom: number, center: LatLng): Point
  }

  /**
   * Extended Marker type with internal properties and methods
   */
  interface Marker {
    /**
     * Internal storage of marker geographic coordinates
     * @internal
     */
    _latlng: LatLng

    /**
     * Internal method to set DOM position of marker
     * @internal
     * @param pos - Pixel position as Point
     */
    _setPos(pos: Point): void

    /**
     * Internal method called during zoom animation to reposition marker
     * @internal
     * @param opt - Animation options with zoom level and center
     */
    _animateZoom(opt: { zoom: number; center: LatLng }): void

    /**
     * Reference to the map this marker is added to (null if not on map)
     * @internal
     */
    _map: Map | null
  }

  /**
   * Extended Popup type with internal properties and methods
   */
  interface Popup {
    /**
     * Internal storage of popup anchor coordinates
     * @internal
     */
    _latlng: LatLng

    /**
     * Internal DOM container element
     * @internal
     */
    _container: HTMLElement

    /**
     * Internal method to calculate popup anchor offset
     * @internal
     * @returns Anchor offset as Point
     */
    _getAnchor(): Point

    /**
     * Internal method called during zoom animation to reposition popup
     * @internal
     * @param e - Zoom event with zoom level and center
     */
    _animateZoom(e: { zoom: number; center: LatLng }): void

    /**
     * Reference to the map this popup is added to (null if not on map)
     * @internal
     */
    _map: Map | null
  }

  /**
   * Extended Tooltip type with internal properties and methods
   */
  interface Tooltip {
    /**
     * Internal storage of tooltip anchor coordinates
     * @internal
     */
    _latlng: LatLng

    /**
     * Internal DOM container element
     * @internal
     */
    _container: HTMLElement

    /**
     * Internal method to calculate tooltip anchor offset
     * @internal
     * @returns Anchor offset as Point
     */
    _getAnchor(): Point

    /**
     * Internal method called during zoom animation to reposition tooltip
     * @internal
     * @param e - Zoom event with zoom level and center
     */
    _animateZoom(e: { zoom: number; center: LatLng }): void

    /**
     * Reference to the map this tooltip is added to (null if not on map)
     * @internal
     */
    _map: Map | null
  }
}
```

## Empfohlene Lösung

### Schritt 1: Type Declarations Datei erstellen

Erstelle `src/types/leaflet-internals.d.ts` mit dem obigen Inhalt.

### Schritt 2: tsconfig.json aktualisieren

Stelle sicher, dass die Types gefunden werden:

```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",
      "./src/types"
    ]
  },
  "include": [
    "src/**/*",
    "src/types/**/*.d.ts"
  ]
}
```

### Schritt 3: JSDoc-Kommentare ergänzen

In `map-manager.js`:

```javascript
/**
 * Apply Leaflet Race Condition Fix
 *
 * Overrides Leaflet's internal _animateZoom methods on Marker, Popup, and Tooltip prototypes
 * to add null checks before accessing this._map._latLngToNewLayerPoint().
 *
 * IMPORTANT: Uses Leaflet internal APIs (marked with _ prefix).
 * Type definitions in src/types/leaflet-internals.d.ts
 *
 * @returns {void}
 */
applyLeafletRaceConditionFix() {
  // Fix for Markers
  L.Marker.prototype._animateZoom = function (opt) {
    if (!this._map) {
      return // Map reference lost - skip animation
    }
    const pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round()
    this._setPos(pos)
  }

  // Fix for Popups
  L.Popup.prototype._animateZoom = function (e) {
    if (!this._map) {
      return // Map reference lost - skip animation
    }
    const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
    const anchor = this._getAnchor()
    L.DomUtil.setPosition(this._container, pos.add(anchor))
  }

  // Fix for Tooltips (if present)
  if (L.Tooltip && L.Tooltip.prototype._animateZoom) {
    L.Tooltip.prototype._animateZoom = function (e) {
      if (!this._map) {
        return // Map reference lost - skip animation
      }
      const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
      const anchor = this._getAnchor()
      L.DomUtil.setPosition(this._container, pos.add(anchor))
    }
  }

  log('info', 'Leaflet race condition fix applied (Marker, Popup, Tooltip _animateZoom overrides)')
}
```

### Schritt 4: Unused @ts-expect-error in map-controls.js entfernen

```javascript
// Zeile 113 in map-controls.js - entfernen oder korrigieren
```

## Alternativer Schnell-Fix (falls Type Declarations zu aufwändig)

Wenn die Type-Declaration-Datei zu viel Aufwand ist, verwende spezifische `@ts-expect-error` Kommentare:

```javascript
applyLeafletRaceConditionFix() {
  // Fix for Markers
  // @ts-expect-error - Overriding internal Leaflet _animateZoom method
  L.Marker.prototype._animateZoom = function (opt) {
    // @ts-expect-error - _map is internal property, can be null after removal
    if (!this._map) {
      return
    }
    // @ts-expect-error - Using internal Leaflet APIs: _latLngToNewLayerPoint, _latlng, _setPos
    const pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round()
    // @ts-expect-error - _setPos is internal Marker method
    this._setPos(pos)
  }

  // Fix for Popups
  // @ts-expect-error - Overriding internal Leaflet _animateZoom method
  L.Popup.prototype._animateZoom = function (e) {
    // @ts-expect-error - _map is internal property
    if (!this._map) {
      return
    }
    // @ts-expect-error - Using internal Popup APIs: _latlng, _getAnchor, _container
    const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
    const anchor = this._getAnchor()
    L.DomUtil.setPosition(this._container, pos.add(anchor))
  }

  // Fix for Tooltips
  // @ts-expect-error - Checking if Tooltip has _animateZoom method
  if (L.Tooltip && L.Tooltip.prototype._animateZoom) {
    // @ts-expect-error - Overriding internal Tooltip _animateZoom method
    L.Tooltip.prototype._animateZoom = function (e) {
      // @ts-expect-error - _map is internal property
      if (!this._map) {
        return
      }
      // @ts-expect-error - Using internal Tooltip APIs: _latlng, _getAnchor, _container
      const pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
      const anchor = this._getAnchor()
      L.DomUtil.setPosition(this._container, pos.add(anchor))
    }
  }

  log('info', 'Leaflet race condition fix applied')
}
```

## Zusammenfassung

### Empfohlener Ansatz: Type Declarations
1. Erstelle `src/types/leaflet-internals.d.ts`
2. Dokumentiere alle internen APIs formal
3. Aktualisiere `tsconfig.json`
4. Kein `@ts-ignore` oder `@ts-expect-error` nötig

### Schneller Ansatz: @ts-expect-error
1. Füge `@ts-expect-error` mit Kommentaren hinzu
2. Dokumentiert, WARUM der Fehler ignoriert wird
3. Funktioniert sofort

### Warum interne APIs verwendet werden müssen

Die Leaflet Race Condition kann NUR durch Überschreiben der internen `_animateZoom`-Methoden gelöst werden, weil:

1. **Kein öffentliches Event**: Leaflet bietet kein Event, das VOR dem Aufruf von `_animateZoom` gefeuert wird
2. **Kein Hook**: Es gibt keinen Hook, um die Animation zu unterbrechen
3. **Timing-Problem**: Der Fehler tritt INNERHALB der Animation auf, nicht davor/danach
4. **Community-Konsens**: Dies ist die offizielle, dokumentierte Lösung in der Leaflet-Community

**Referenzen**:
- GitHub Issue #4453: https://github.com/Leaflet/Leaflet/issues/4453
- Stack Overflow: https://stackoverflow.com/questions/44803875/

## Nächste Schritte

1. **Entscheiden**: Type Declarations oder @ts-expect-error?
2. **Implementieren**: Eine der beiden Lösungen
3. **Testen**: `npm run typecheck` muss fehlerfrei durchlaufen
4. **Commit**: Mit dokumentierter Lösung

---

**Status**: Dokumentiert, wartet auf Implementierung
**Empfehlung**: Type Declarations für saubere, wartbare Lösung
