# Leaflet Map Implementation - Advanced Optimization Prompt

**Role**: You are a Senior Fullstack Engineer specializing in interactive web
mapping with **Leaflet.js**, **Progressive Web Applications (PWA)**, and
**modern JavaScript frameworks**. Your expertise includes performance
optimization, accessibility, mobile-first design, and production-grade
architecture.

---

## Context: Current Implementation

### Technical Stack

- **Build Tool**: Vite 7.x (ES modules, HMR, optimizeDeps)
- **Framework**: Alpine.js 3.15.0 (reactive state, minimal footprint)
- **Map Library**: Leaflet 1.9.4 (npm package, ES6 imports)
- **Clustering**: leaflet.markercluster 1.5.3 (npm package, ES6 imports)
- **Styling**: TailwindCSS 4.x + Material Design 3 (M3) tokens
- **PWA**: vite-plugin-pwa (Workbox, service worker, offline support)
- **Testing**: Vitest + Playwright (unit, integration, e2e, visual regression)

### Project Overview

**FAM Trainingsplan** - Interactive training schedule for Free Arts of Movement
(Parkour, Trampolin, Tricking) in Munich

- **60+ training locations** with clustering
- **Real-time filtering** (day, location, age group, training type)
- **Map modal** with lazy initialization
- **Mobile-first** responsive design
- **Dark mode** support with M3 color tokens
- **PWA** with offline capabilities
- **Production URL**: https://jasha256.github.io/fam-trainingsplan/

### Current Architecture

**Entry Point** (`src/main.js`):

```javascript
// Leaflet loaded as npm package, exposed globally for plugins
import * as L from 'leaflet'
window.L = L

import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
```

**Map Manager** (`src/js/trainingsplaner/map-manager.js`):

- **`initializeMap()`** - Creates Leaflet map instance (line 46)
- **`addMarkersToMap()`** - Adds 60+ markers with clustering (line 86)
- **`addMarkersWithClustering()`** - Uses markerClusterGroup (line 118)
- **`addMarkersWithoutClustering()`** - Fallback without clustering (line 211)
- **`zoomToTraining()`** - Deep-link to specific marker (line 258)
- **`createMapPopup()`** - M3-styled popup content (line 321)
- **`cleanupMap()`** - Memory cleanup on modal close (line 385)

**Clustering Configuration** (`map-manager.js` lines 131-152):

```javascript
const markers = L.markerClusterGroup({
  // Performance optimizations
  chunkedLoading: true, // ✅ Batch loading
  removeOutsideVisibleBounds: true, // ✅ DOM optimization

  // Clustering behavior
  maxClusterRadius: 80, // Default clustering distance
  spiderfyOnMaxZoom: true, // Fan out overlapping markers
  showCoverageOnHover: false, // No polygon on hover
  zoomToBoundsOnClick: true, // Zoom into cluster on click

  // Custom M3-styled cluster icon
  iconCreateFunction: cluster => {
    const count = cluster.getChildCount()
    return L.divIcon({
      html: `<div class="md-map-cluster"><span class="md-map-cluster-count">${count}</span></div>`,
      className: 'md-map-cluster-wrapper',
      iconSize: L.point(50, 50)
    })
  }
})
```

**Vite Configuration** (`vite.config.js`):

```javascript
optimizeDeps: {
  include: [
    'leaflet',
    'leaflet.markercluster'
  ]
}

build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-map': ['leaflet']  // Separate chunk for Leaflet
      }
    }
  }
}
```

### What's Working ✅

- Clustering displays correctly with numbered badges
- Markers split/merge on zoom
- M3 styling applied to clusters and popups
- Dark mode support for map tiles and UI
- Standard Leaflet markers (blue pins) with accessibility attributes
- Memory cleanup on modal close
- Fallback to non-clustered markers if plugin unavailable
- PWA caching for OSM tiles (7 days, 500 tiles max)

### Previous Issues (Already Resolved) ✅

- ✅ CDN loading issues → Fixed by switching to npm packages
- ✅ Plugin not attaching to global `L` → Fixed by exposing `window.L = L`
- ✅ ES6 module timing issues → Fixed with proper import order
- ✅ Vite optimization → Added to `optimizeDeps.include`

---

## Optimization Objectives

Your task is to **analyze, optimize, and enhance** the Leaflet map
implementation using **official documentation, industry best practices, and
proven patterns**. Focus on:

### 1. Performance Optimization

- **Tile Loading**: Lazy loading, prefetching, connection limits
- **Marker Performance**: Virtualization, canvas rendering, clustering tuning
- **Memory Management**: Leak prevention, proper cleanup, event listener removal
- **Bundle Size**: Tree-shaking, dynamic imports, code splitting
- **Mobile Performance**: Touch handling, reduced reflows, GPU acceleration

### 2. Leaflet Best Practices

- **Official Patterns**: Follow https://leafletjs.com/reference.html guidelines
- **Plugin Integration**: Best practices from
  https://github.com/Leaflet/Leaflet.markercluster
- **Custom Controls**: Implement Leaflet control patterns correctly
- **Event Management**: Proper event binding/unbinding
- **Coordinate Systems**: Correct projection handling

### 3. Advanced Features

- **Map State Persistence**: Save/restore zoom, center, bounds (localStorage)
- **Geolocation**: User location with "Find Me" button
- **Custom Controls**: Layer switcher, reset view, fullscreen
- **Route Planning**: Distance calculation, directions (optional)
- **Export/Share**: Static map image, permalink, share button

### 4. Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation**: Tab order, keyboard controls, focus management
- **Screen Readers**: ARIA labels, live regions, semantic HTML
- **Color Contrast**: M3 tokens meet contrast requirements
- **Alternative Content**: Text descriptions for map features
- **Focus Indicators**: Visible focus states for interactive elements

### 5. Progressive Enhancement

- **No-JS Fallback**: Static map image or address list
- **Offline Support**: Cached tiles, offline mode UI
- **Slow Networks**: Loading states, skeleton screens, retry logic
- **Browser Support**: Graceful degradation for older browsers

### 6. Testing & Monitoring

- **Unit Tests**: MapManager class methods (Vitest)
- **Integration Tests**: Map initialization, marker addition (Playwright)
- **E2E Tests**: User flows, filter interaction (Playwright)
- **Performance Tests**: FPS, memory usage, load times
- **Visual Regression**: Cluster styles, popup appearance

### 7. Code Quality

- **TypeScript**: Improve type definitions for Leaflet/markercluster
- **Error Handling**: Robust error boundaries, user-friendly messages
- **Documentation**: JSDoc comments, architecture diagrams
- **Modularity**: Extract reusable utilities, DRY principles
- **Maintainability**: Clear naming, consistent patterns

---

## Required Research & Analysis

### Phase 1: Official Documentation Deep Dive

Review the following official resources and identify optimization opportunities:

1. **Leaflet Core Documentation**
   - https://leafletjs.com/reference.html - Full API reference
   - https://leafletjs.com/examples.html - Official tutorials and examples
   - https://leafletjs.com/examples/mobile.html - Mobile-specific optimizations
   - https://leafletjs.com/examples/extending/extending-1-classes.html - Plugin
     patterns

2. **Leaflet.markercluster Documentation**
   - https://github.com/Leaflet/Leaflet.markercluster - Official repository
   - https://github.com/Leaflet/Leaflet.markercluster/blob/master/README.md -
     Configuration options
   - https://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.388.html -
     Demo with 10k markers

3. **Performance Resources**
   - https://leafletjs.com/examples/custom-icons.html - Icon optimization
   - https://github.com/Leaflet/Leaflet/blob/main/PLUGIN-GUIDE.md - Plugin best
     practices
   - https://web.dev/fast/ - Web performance guidelines

### Phase 2: Current Implementation Audit

Analyze the following files and identify:

- **Performance bottlenecks**: Profiling, memory leaks, slow operations
- **Best practice violations**: Patterns that don't match official docs
- **Missing features**: Opportunities for enhancement
- **Technical debt**: Hacky solutions, TODO comments, workarounds

**Files to Review**:

- `/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner/map-manager.js`
  (full file, 406 lines)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/src/main.js` (lines 22-31,
  Leaflet imports)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/vite.config.js` (Leaflet caching
  config)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/src/style.css` (map CSS,
  clustering styles)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/index.html` (map modal
  structure)

### Phase 3: Comparison with Best Practices

Compare current implementation against:

**Leaflet Official Patterns**:

- Are we using `map.on()` / `map.off()` correctly?
- Are custom icons optimized (size, caching, sprites)?
- Is coordinate precision appropriate (no over-precision)?
- Are we properly handling mobile touch events?
- Is the tile layer configured optimally (maxZoom, attribution)?

**Leaflet.markercluster Best Practices**:

- Is `chunkedLoading` configured optimally?
- Should we use `disableClusteringAtZoom` for specific zoom levels?
- Is `maxClusterRadius` tuned for our use case (60 markers)?
- Should we implement `clusterMarkerClick` for custom behavior?
- Are we using `refreshClusters()` correctly when filters change?

**PWA + Leaflet Integration**:

- Are OSM tiles cached efficiently? (Currently 7 days, 500 max)
- Should we implement offline map support?
- Is there a loading state for slow tile loading?
- Should we preload tiles for common areas?

---

## Specific Optimization Tasks

### Task 1: Performance Audit & Optimization

**Objective**: Reduce map initialization time and improve runtime performance.

**Deliverables**:

1. **Performance Baseline**
   - Measure current metrics: Time to Interactive (TTI), First Contentful Paint
     (FCP), memory usage
   - Identify slowest operations using Chrome DevTools Performance tab
   - Document findings in `/docs/PERFORMANCE-BASELINE.md`

2. **Tile Loading Optimization**

   ```javascript
   // Evaluate these optimizations:
   L.tileLayer(url, {
     maxZoom: 19, // Current value - is this optimal?
     minZoom: 3, // Should we set a minimum zoom?
     tileSize: 256, // Default - should we use 512 for retina?
     zoomOffset: 0, // Adjust for high-DPI displays?
     detectRetina: true, // ← Add this for better mobile experience?
     updateWhenIdle: false, // ← Add this for smoother panning?
     updateWhenZooming: false, // ← Reduce tile requests during zoom?
     keepBuffer: 2, // ← How many tile rows/cols to keep loaded?
     bounds: [
       [47.9, 11.3],
       [48.3, 11.9]
     ] // ← Restrict to Munich bounds?
   })
   ```

3. **Marker Clustering Optimization**

   ```javascript
   // Benchmark different configurations:
   const optimizedConfig = {
     chunkedLoading: true,
     chunkInterval: 200, // Default - should we adjust?
     chunkDelay: 50, // Default - should we adjust?
     removeOutsideVisibleBounds: true,

     // Should we add these?
     spiderLegPolylineOptions: { weight: 0 }, // Lighter spiderfied lines?
     polygonOptions: { weight: 0 }, // Disable coverage polygons?
     animate: true, // Animation performance impact?
     animateAddingMarkers: false, // ← Disable for faster initial render?
     disableClusteringAtZoom: 18 // ← Force individual markers at high zoom?
   }
   ```

4. **Memory Leak Prevention**
   - Review `cleanupMap()` method - are all event listeners removed?
   - Check for circular references (marker.trainingId, popup bindings)
   - Implement proper disposal of markerClusterGroup
   - Add `beforeunload` handler for final cleanup

**Acceptance Criteria**:

- Map initialization < 500ms (currently unknown)
- Memory usage < 50MB after adding 60 markers
- Smooth 60 FPS during zoom/pan on mobile devices
- No memory leaks after 10 open/close cycles of map modal

---

### Task 2: Advanced Feature Implementation

**Objective**: Add production-ready features following Leaflet best practices.

**2.1 Map State Persistence**

```javascript
// Save map state to localStorage on interaction
map.on('moveend', () => {
  const center = map.getCenter()
  const zoom = map.getZoom()
  localStorage.setItem(
    'mapState',
    JSON.stringify({
      center: [center.lat, center.lng],
      zoom
    })
  )
})

// Restore on next visit
const savedState = JSON.parse(localStorage.getItem('mapState'))
if (savedState) {
  map.setView(savedState.center, savedState.zoom)
}
```

**Questions**:

- Should we persist filter state separately?
- How to balance auto-save with `fitBounds()` on first visit?
- Should state expire after X days?

**2.2 Geolocation "Find Me" Button**

```javascript
// Create custom Leaflet control
const LocateControl = L.Control.extend({
  onAdd(map) {
    const button = L.DomUtil.create('button', 'md-btn-filled')
    button.innerHTML = '📍 Find Me'
    L.DomEvent.on(button, 'click', () => {
      map.locate({ setView: true, maxZoom: 16 })
    })
    return button
  }
})

map.addControl(new LocateControl({ position: 'topright' }))
```

**Questions**:

- Should we show user location marker?
- How to handle geolocation errors gracefully?
- Should we calculate distance from user to trainings?

**2.3 Custom Map Controls**

- **Reset View**: Button to reset to initial bounds
- **Layer Switcher**: Toggle satellite/streets (future enhancement)
- **Fullscreen**: Enter/exit fullscreen mode
- **Export**: Download static map image

**Reference**: https://leafletjs.com/examples/extending/extending-2-layers.html

---

### Task 3: Accessibility Enhancement

**Objective**: Ensure WCAG 2.1 AA compliance for map interactions.

**3.1 Keyboard Navigation**

```javascript
// Make map focusable and keyboard navigable
map.on('focus', () => {
  // Show keyboard controls hint
})

// Add keyboard controls
map.on('keydown', e => {
  const panAmount = 50
  switch (e.originalEvent.key) {
    case 'ArrowUp':
      map.panBy([0, -panAmount])
      break
    case 'ArrowDown':
      map.panBy([0, panAmount])
      break
    case 'ArrowLeft':
      map.panBy([-panAmount, 0])
      break
    case 'ArrowRight':
      map.panBy([panAmount, 0])
      break
    case '+':
      map.zoomIn()
      break
    case '-':
      map.zoomOut()
      break
  }
})
```

**3.2 Screen Reader Support**

```html
<!-- Add ARIA labels to map container -->
<div
  id="map-modal-container"
  role="application"
  aria-label="Interaktive Karte mit Trainingsstandorten"
  aria-describedby="map-instructions"
></div>

<div id="map-instructions" class="sr-only">
  Verwenden Sie die Pfeiltasten zum Verschieben, + und - zum Zoomen. Tab-Taste
  navigiert durch Marker.
</div>
```

**3.3 Focus Management**

- Trap focus within map modal when open
- Return focus to trigger button when modal closes
- Visible focus indicators on clusters/markers
- Skip link to "close map" button

**Resources**:

- https://www.w3.org/WAI/tutorials/carousels/functionality/
- https://inclusive-components.design/a-todo-list/

---

### Task 4: Mobile Optimization

**Objective**: Optimize for touch devices and small screens.

**4.1 Touch Event Optimization**

```javascript
// Enable better touch handling
map.options.tap = true
map.options.tapTolerance = 15 // Larger tap area for fingers

// Optimize tile loading for mobile
L.tileLayer(url, {
  detectRetina: true, // ← Load higher res tiles on retina
  updateWhenIdle: true, // ← Don't update tiles during pan
  updateInterval: 200, // ← Throttle tile requests
  keepBuffer: 1 // ← Reduce buffer on mobile
})
```

**4.2 Responsive Design**

```javascript
// Adjust cluster radius based on screen size
const isMobile = window.innerWidth < 768
const markers = L.markerClusterGroup({
  maxClusterRadius: isMobile ? 60 : 80, // Tighter clusters on mobile
  spiderfyDistanceMultiplier: isMobile ? 2 : 1 // More spread on small screens
})
```

**4.3 Performance Budget**

- Map initialization < 1s on 3G network
- Smooth scrolling without jank
- No layout shifts during map load

**Reference**: https://leafletjs.com/examples/mobile.html

---

### Task 5: Error Handling & Resilience

**Objective**: Graceful degradation and user-friendly error messages.

**5.1 Tile Loading Errors**

```javascript
L.tileLayer(url, {
  errorTileUrl: '/assets/tile-error.png' // Custom error tile
}).on('tileerror', error => {
  console.error('Tile loading failed', error)
  // Show user-friendly notification
  Alpine.store('ui').showNotification(
    'Karte wird geladen... Bitte warten oder Verbindung prüfen.',
    'warning',
    5000
  )
})
```

**5.2 Geolocation Errors**

```javascript
map.on('locationerror', e => {
  let message = 'Standort konnte nicht ermittelt werden.'
  if (e.code === 1) {
    message =
      'Standortzugriff wurde verweigert. Bitte in Browser-Einstellungen erlauben.'
  } else if (e.code === 2) {
    message = 'Standort nicht verfügbar. GPS aktivieren?'
  }
  Alpine.store('ui').showNotification(message, 'error', 5000)
})
```

**5.3 Offline Mode**

```javascript
// Detect offline mode and show cached tiles
if (!navigator.onLine) {
  // Show offline indicator
  // Disable features that require network
  // Load tiles from service worker cache
}
```

---

### Task 6: Testing Strategy

**Objective**: Comprehensive test coverage for map functionality.

**6.1 Unit Tests** (Vitest)

```javascript
// tests/unit/map-manager.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MapManager } from '@/js/trainingsplaner/map-manager'

describe('MapManager', () => {
  it('should initialize map with correct default center and zoom', () => {
    // Test initializeMap()
  })

  it('should add markers with clustering when markerClusterGroup available', () => {
    // Test addMarkersWithClustering()
  })

  it('should cleanup map and remove all event listeners', () => {
    // Test cleanupMap() for memory leaks
  })
})
```

**6.2 Integration Tests** (Playwright)

```javascript
// tests/integration/map-modal.spec.js
import { test, expect } from '@playwright/test'

test('should open map modal and display clustered markers', async ({
  page
}) => {
  await page.goto('/')
  await page.click('[data-test="map-button"]')

  // Wait for map to initialize
  await page.waitForSelector('.leaflet-container')

  // Verify clusters are displayed
  const clusters = await page.locator('.md-map-cluster').count()
  expect(clusters).toBeGreaterThan(0)
})
```

**6.3 E2E Tests** (Playwright)

```javascript
// tests/e2e/user-flows.spec.js
test('user can filter trainings and see updated markers on map', async ({
  page
}) => {
  // 1. Open map
  // 2. Apply filter (e.g., "Montag")
  // 3. Verify marker count reduced
  // 4. Click marker
  // 5. Verify popup shows correct training
})
```

**6.4 Visual Regression Tests**

```javascript
// tests/e2e/visual-regression.spec.js
test('cluster icons match M3 design system', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-test="map-button"]')
  await page.waitForSelector('.md-map-cluster')

  // Take screenshot of cluster
  await expect(page.locator('.md-map-cluster').first()).toHaveScreenshot(
    'cluster-light.png'
  )

  // Switch to dark mode
  await page.click('[data-test="theme-toggle"]')
  await expect(page.locator('.md-map-cluster').first()).toHaveScreenshot(
    'cluster-dark.png'
  )
})
```

---

### Task 7: Code Quality & Maintainability

**7.1 TypeScript Type Definitions**

```typescript
// src/js/trainingsplaner/types.ts
import type { Map, Marker, MarkerClusterGroup, LatLngExpression } from 'leaflet'

export interface MapManagerContext {
  map: Map | null
  markers: Marker[]
  markerClusterGroup: MarkerClusterGroup | null
  filteredTrainings: Training[]
  allTrainings: Training[]
  userHasInteractedWithMap: boolean
  $store: {
    ui: UIStore
  }
  $nextTick: (callback: () => void) => void
}
```

**7.2 Extract Reusable Utilities**

```javascript
// src/js/trainingsplaner/map-utils.js

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {[number, number]} coord1 - [lat, lng]
 * @param {[number, number]} coord2 - [lat, lng]
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(coord1, coord2) {
  // Implementation
}

/**
 * Create M3-styled map popup HTML
 * @param {Training} training
 * @returns {string} HTML string
 */
export function createPopupHTML(training) {
  // Extracted from MapManager.createMapPopup()
}

/**
 * Get optimal cluster radius based on screen size
 * @returns {number} Cluster radius in pixels
 */
export function getOptimalClusterRadius() {
  return window.innerWidth < 768 ? 60 : 80
}
```

**7.3 JSDoc Documentation**

- Add comprehensive JSDoc comments to all public methods
- Document configuration options with examples
- Add `@example` blocks for complex methods
- Reference official Leaflet docs in comments

---

## Deliverables

### 1. Code Improvements

- **Updated Files**:
  - `src/js/trainingsplaner/map-manager.js` - Optimized implementation
  - `src/js/trainingsplaner/map-utils.js` - NEW: Extracted utilities
  - `src/js/trainingsplaner/map-controls.js` - NEW: Custom Leaflet controls
  - `src/main.js` - Updated Leaflet initialization (if needed)
  - `vite.config.js` - Optimized caching and bundling
  - `src/style.css` - Updated map/cluster styles

- **Test Files**:
  - `tests/unit/map-manager.test.js` - NEW: Unit tests
  - `tests/integration/map-modal.spec.js` - NEW: Integration tests
  - `tests/e2e/map-user-flows.spec.js` - UPDATED: E2E flows

### 2. Documentation

- **`/docs/LEAFLET-OPTIMIZATION-REPORT.md`** - NEW
  - Performance baseline vs. optimized metrics
  - All changes made with justification
  - Screenshots/recordings of improvements
  - Comparison table (before/after)

- **`/docs/LEAFLET-BEST-PRACTICES.md`** - NEW
  - Official Leaflet patterns applied
  - Common pitfalls to avoid
  - Configuration guidelines
  - Plugin integration guide

- **`/docs/MAP-TESTING-GUIDE.md`** - NEW
  - How to run map tests
  - Test coverage report
  - Continuous integration setup

- **`/docs/MAP-CLUSTERING-INFO.md`** - UPDATED
  - Add advanced clustering techniques
  - Reference official documentation
  - Troubleshooting guide

### 3. Performance Report

- **Metrics** (before/after comparison):
  - Map initialization time
  - Time to Interactive (TTI)
  - First Contentful Paint (FCP)
  - Memory usage (initial, after 60 markers, after cleanup)
  - Bundle size (vendor-map chunk)
  - Lighthouse score (Performance, Accessibility)

- **Profiling Screenshots**:
  - Chrome DevTools Performance timeline
  - Memory heap snapshots
  - Network waterfall for tile loading

### 4. Configuration Examples

```javascript
// docs/examples/leaflet-config-examples.js

// Example 1: Optimal tile layer configuration
export const TILE_LAYER_CONFIG = {
  development: {
    maxZoom: 19,
    detectRetina: false, // Faster development
    updateWhenIdle: false
  },
  production: {
    maxZoom: 19,
    detectRetina: true,
    updateWhenIdle: true,
    keepBuffer: 2
  }
}

// Example 2: Clustering configurations for different use cases
export const CLUSTER_CONFIGS = {
  // Dense urban area (100+ markers)
  dense: {
    maxClusterRadius: 120,
    disableClusteringAtZoom: 17
  },

  // Sparse area (10-50 markers)
  sparse: {
    maxClusterRadius: 60,
    disableClusteringAtZoom: 15
  },

  // Mobile optimized
  mobile: {
    maxClusterRadius: 60,
    spiderfyDistanceMultiplier: 2,
    animateAddingMarkers: false
  }
}
```

---

## Constraints & Requirements

### Must Maintain

- ✅ **Material Design 3 (M3) styling** - Cluster icons, popups, controls must
  use M3 tokens
- ✅ **Dark mode support** - All map elements must adapt to theme
- ✅ **Alpine.js integration** - Use existing state management (don't introduce
  Redux/Vuex)
- ✅ **PWA compatibility** - Offline tile caching, service worker integration
- ✅ **Mobile-first design** - Touch-friendly, responsive, performant
- ✅ **Accessibility** - WCAG 2.1 AA compliance
- ✅ **No breaking changes** - Existing functionality must continue working
- ✅ **TypeScript compatibility** - Maintain JSDoc types, support
  `npm run typecheck`

### Must Avoid

- ❌ **Third-party dependencies** - No new npm packages unless absolutely
  necessary
- ❌ **Over-engineering** - Simple solutions preferred over complex abstractions
- ❌ **Performance regressions** - No slower than current implementation
- ❌ **CDN scripts** - Continue using npm packages (already solved issue)
- ❌ **Breaking API changes** - MapManager public methods should remain
  compatible

### Browser Support

- Chrome 111+
- Firefox 128+
- Safari 16.4+
- Edge (Chromium-based)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android 10+)

---

## Evaluation Criteria

Your solution will be evaluated on:

### 1. Technical Excellence (40%)

- ✅ Follows official Leaflet documentation and best practices
- ✅ Measurable performance improvements (quantified with metrics)
- ✅ Robust error handling and edge case coverage
- ✅ Clean, maintainable, well-documented code
- ✅ TypeScript-compatible type definitions

### 2. User Experience (30%)

- ✅ Smooth, responsive interactions (60 FPS)
- ✅ Clear loading states and error messages
- ✅ Accessibility for keyboard/screen reader users
- ✅ Mobile-optimized touch interactions
- ✅ Offline capability (cached tiles)

### 3. Testing & Quality (20%)

- ✅ Comprehensive unit test coverage (>80%)
- ✅ Integration tests for critical paths
- ✅ E2E tests for user flows
- ✅ Visual regression tests for UI consistency
- ✅ No memory leaks or performance regressions

### 4. Documentation (10%)

- ✅ Clear explanations of changes made
- ✅ Performance baseline and improvement metrics
- ✅ Updated docs with examples and screenshots
- ✅ References to official documentation
- ✅ Troubleshooting guides for common issues

---

## Additional Context

### User Workflow

1. User visits trainingsplan page (60 training locations loaded)
2. User applies filters (day, location, age group, training type)
3. User clicks "Karte" button → Map modal opens
4. `MapManager.initializeMap()` creates Leaflet map
5. `MapManager.addMarkersToMap()` adds clustered markers
6. User zooms in/out → Clusters split/merge
7. User clicks marker → Popup shows training details
8. User clicks popup "Anmelden" → Opens registration link
9. User closes modal → `MapManager.cleanupMap()` destroys map

### Known Issues (Not Yet Optimized)

- 🔧 No map state persistence (zoom/center reset on modal close)
- 🔧 No geolocation / "Find Me" feature
- 🔧 Tile loading has no skeleton/loading state
- 🔧 No custom controls (reset view, fullscreen, etc.)
- 🔧 Memory usage not profiled (potential leaks unknown)
- 🔧 No keyboard navigation for map interactions
- 🔧 Cluster radius not optimized for Munich's geography
- 🔧 No distance calculation from user location

### Files Overview

```
/home/pseudo/workspace/FAM/fam-trainingsplan/
├── src/
│   ├── js/
│   │   ├── trainingsplaner/
│   │   │   ├── map-manager.js         ← PRIMARY: Map logic (406 lines)
│   │   │   ├── state.js               ← State management
│   │   │   └── types.js               ← TypeScript type definitions
│   │   ├── config.js                  ← Map config (CONFIG.map)
│   │   └── utils.js                   ← Utility functions
│   ├── main.js                        ← Entry point (Leaflet imports)
│   └── style.css                      ← Map/cluster CSS
├── vite.config.js                     ← Build config (caching)
├── index.html                         ← Map modal structure
├── package.json                       ← Dependencies
├── tests/
│   ├── unit/                          ← Vitest tests (none for map yet)
│   ├── integration/                   ← Playwright integration tests
│   └── e2e/                           ← Playwright E2E tests
└── docs/
    ├── LEAFLET-CLUSTERING-FIX-PROMPT.md      ← Original problem (solved)
    ├── LEAFLET-CLUSTERING-SOLUTION.md        ← Solution documentation
    └── MAP-CLUSTERING-INFO.md                ← User guide
```

### Resources

- **Leaflet Official**: https://leafletjs.com/
- **Leaflet GitHub**: https://github.com/Leaflet/Leaflet
- **Leaflet.markercluster**: https://github.com/Leaflet/Leaflet.markercluster
- **Leaflet Plugins**: https://leafletjs.com/plugins.html
- **Material Design 3**: https://m3.material.io/
- **Web.dev Performance**: https://web.dev/fast/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Success Metrics (Quantifiable Goals)

### Performance

- ⚡ Map initialization: **< 500ms** (from modal open to first render)
- ⚡ Marker clustering: **< 100ms** (60 markers added and clustered)
- ⚡ Memory usage: **< 50MB** (after adding markers, before cleanup)
- ⚡ Memory leak: **< 1MB** (after 10 open/close cycles)
- ⚡ Lighthouse Performance: **> 90** (desktop), **> 80** (mobile)
- ⚡ Bundle size: **vendor-map chunk < 200KB** (gzipped)

### User Experience

- ✅ **60 FPS** during zoom/pan (no dropped frames)
- ✅ **Smooth touch interactions** on mobile (no lag)
- ✅ **Tile loading < 2s** on 3G network
- ✅ **Keyboard navigation** fully functional
- ✅ **Screen reader** announces map state changes

### Quality

- ✅ **Test coverage > 80%** for MapManager class
- ✅ **Zero memory leaks** detected by Chrome DevTools
- ✅ **WCAG 2.1 AA** compliance (axe DevTools)
- ✅ **No console errors** in production build
- ✅ **Visual regression tests pass** (light/dark mode)

---

## Next Steps

1. **Read this prompt carefully** - Understand all requirements and constraints
2. **Review official documentation** - Leaflet and markercluster best practices
3. **Audit current implementation** - Identify bottlenecks and violations
4. **Create performance baseline** - Measure current metrics
5. **Implement optimizations** - Make incremental, tested changes
6. **Measure improvements** - Compare before/after metrics
7. **Write tests** - Unit, integration, E2E coverage
8. **Update documentation** - Comprehensive report with screenshots
9. **Submit deliverables** - Code, tests, docs, performance report

---

**Priority**: 🟢 **HIGH** - Core user-facing feature **Estimated Effort**: 8-16
hours (depending on scope) **Impact**: High (60+ markers, used by all users)
**Risk**: Low (non-breaking changes, well-tested)

---

**Date Created**: 2025-10-19 **Version**: 1.0.0 **Status**: 📋 **READY FOR
IMPLEMENTATION**

Please provide **detailed, well-researched optimizations** that follow Leaflet
best practices and deliver measurable improvements to performance,
accessibility, and user experience. Include code examples, configuration
recommendations, and comprehensive documentation.
