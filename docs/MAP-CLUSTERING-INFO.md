# Karten-Clustering Information

## ✅ Clustering ist implementiert mit Best Practices!

Das automatische Zusammenfassen und Aufteilen von Pins beim Zoomen ist
vollständig implementiert durch **Leaflet.markerClusterGroup** nach offiziellen
Best Practices.

### Wie es funktioniert:

#### 🔍 **Herauszoomen (Zoom Out)**

- Marker, die nahe beieinander liegen, werden automatisch zu **Cluster-Icons**
  zusammengefasst
- Cluster zeigen die Gesamtzahl der Trainings in diesem Bereich
- Beispiel: 26 einzelne Marker werden zu einem Cluster mit "26"

#### 🔎 **Hineinzoomen (Zoom In)**

- Cluster teilen sich automatisch in kleinere Cluster auf
- Bei höchstem Zoom-Level werden einzelne Marker angezeigt (Standard Leaflet
  Blue Pin)
- Jeder Marker kann angeklickt werden für detaillierte Informationen

### Konfiguration

Die Clustering-Einstellungen in `map-manager.js` folgen den Best Practices:

```javascript
const markers = window.L.markerClusterGroup({
  // Performance-Optimierungen
  chunkedLoading: true,              // Lädt Marker in Chunks für bessere Performance
  removeOutsideVisibleBounds: true,  // Entfernt Marker außerhalb des sichtbaren Bereichs

  // Clustering-Verhalten
  maxClusterRadius: 80,              // Radius für Clustering
  spiderfyOnMaxZoom: true,           // Marker "auffächern" bei maximalem Zoom
  showCoverageOnHover: false,        // Kein Polygon beim Hover
  zoomToBoundsOnClick: true,         // Beim Klick auf Cluster hereinzoomen

  // Custom M3-styled cluster icon
  iconCreateFunction: (cluster) => { ... }
})
```

### Unterschied: Cluster vs. Standard Marker

| Feature           | Cluster Icon                | Standard Leaflet Marker           |
| ----------------- | --------------------------- | --------------------------------- |
| **Aussehen**      | Runder Badge mit Zahl       | Standard blaues Pin-Icon          |
| **Farbe**         | Primary Container (M3)      | Leaflet Default Blue              |
| **Border**        | 3px surface color           | Keine                             |
| **Bedeutung**     | Mehrere Standorte gruppiert | Ein einzelner Standort            |
| **Bei Klick**     | Zoomt näher heran           | Öffnet Popup mit Training-Details |
| **Accessibility** | Zählwert sichtbar           | title und alt attributes          |

### Dark Mode

Die Karte passt sich automatisch an den Dark Mode an:

- **Karten-Tiles**: Invertiert und angepasst mit CSS-Filtern
- **UI-Elemente**: Nutzen M3 dark mode Farben
- **Cluster**: Dunklere Border-Farben (`surface-container`)
- **Popups**: Dark surface backgrounds mit M3 color tokens
- **Leaflet Controls**: M3-styled mit dark mode support

### Technische Details

#### Standard Leaflet Markers

- Verwendet die **Standard Leaflet Marker** (blaues Pin-Icon)
- Jeder Marker repräsentiert **ein einzelnes Training**
- Vorteile:
  - Offizielle Leaflet-Icons, keine Custom-Implementierung
  - Bessere Performance durch natives Rendering
  - Automatische Icon-Assets (keine CSS-Tricks nötig)
  - Accessibility built-in (`title`, `alt`, `riseOnHover`)

#### Clustering-Mechanismus

- **markerClusterGroup** gruppiert Marker automatisch basierend auf Zoom-Level
- Verwendet `addLayers()` für Batch-Addition (Performance Best Practice)
- `chunkedLoading` verhindert UI-Freezing bei vielen Markern
- `removeOutsideVisibleBounds` reduziert DOM-Load

### Best Practices

#### Für Benutzer:

1. **Herauszoomen** → Überblick über Trainings-Dichte in verschiedenen
   Stadtteilen (Cluster)
2. **Hineinzoomen** → Einzelne Marker werden sichtbar
3. **Auf Cluster klicken** → Automatisch näher zoomen zu den enthaltenen Markern
4. **Auf Marker klicken** → Popup mit detaillierten Training-Informationen
   öffnet sich
5. **Marker Tooltip** → Beim Hover über Marker erscheint
   `"[Trainingsart] - [Ort]"`

#### Für Entwickler:

- ✅ Verwendet **Standard Leaflet.markerClusterGroup Best Practices**
- ✅ `addLayers()` statt einzelne `addLayer()` Calls (Performance)
- ✅ `chunkedLoading` aktiviert für große Datasets
- ✅ `removeOutsideVisibleBounds` reduziert DOM-Overhead
- ✅ Accessibility: `title`, `alt`, `riseOnHover` auf allen Markern
- ✅ Marker reagieren auf Filter-Änderungen in Echtzeit
- ⚙️ `maxClusterRadius` anpassen für mehr/weniger aggressive Gruppierung
- 📊 Clustering funktioniert nur mit `filteredTrainings`, nicht allen Trainings
