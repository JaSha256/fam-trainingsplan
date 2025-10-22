# Leaflet MarkerCluster Integration - Senior Engineer Prompt

## Problem Statement

We have a **critical script loading issue** where Leaflet.markercluster plugin
is not being properly loaded and initialized, despite the script being
successfully fetched from CDN (HTTP 200 status confirmed).

### Current Situation

**Network Analysis:**

- ✅ `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js` → HTTP 200 (loads
  successfully)
- ✅
  `https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js`
  → HTTP 200 (loads successfully)
- ✅ Leaflet v1.9.4 is available: `window.L` exists and has all standard methods
- ❌ `window.L.markerClusterGroup` is **undefined** (plugin not attaching to
  Leaflet)

**Symptoms:**

- Console warning:
  `"Leaflet.markercluster not loaded after timeout, falling back to standard markers"`
- Map shows 60 individual markers instead of clusters
- Polling mechanism times out after 3 seconds (30 attempts × 100ms)
- `typeof window.L.markerClusterGroup` returns `undefined`

**Architecture:**

- **Build Tool**: Vite (ES modules)
- **Framework**: Alpine.js v3.15.0
- **Map Library**: Leaflet 1.9.4 (loaded from CDN with defer attribute)
- **Clustering Plugin**: leaflet.markercluster 1.5.3 (loaded from CDN with defer
  attribute)
- **Module Type**: ES6 modules (`type="module"`)

## What We've Tried (All Failed)

1. ❌ **Script in `<head>` before module** - Plugin still not available
2. ❌ **Script at end of `<body>`** - ES6 modules execute first
3. ❌ **Defer attribute on both scripts** - HTTP 200 but `L.markerClusterGroup`
   undefined
4. ✅ **Polling mechanism (fallback)** - Works as graceful degradation

## Current Implementation

### HTML Structure (`index.html` lines 46-55)

```html
<head>
  <!-- Leaflet CSS -->
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    crossorigin="anonymous"
  />

  <!-- Leaflet.markercluster CSS -->
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
  />
  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
  />

  <!-- Leaflet JS - Load with defer to execute before module scripts -->
  <script
    defer
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    crossorigin="anonymous"
  ></script>

  <!-- Leaflet.markercluster JS - Load with defer AFTER Leaflet, before module -->
  <script
    defer
    src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"
  ></script>

  <!-- Main Script - Modules are deferred by default and execute AFTER defer scripts -->
  <script type="module" src="/src/main.js"></script>
</head>
```

### Map Manager Implementation (`src/js/trainingsplaner/map-manager.js`)

**Key Methods:**

- `initializeMap()` - Creates Leaflet map instance (line 45)
- `addMarkersToMap()` - Checks for markerClusterGroup, polls if unavailable
  (line 85)
- `addMarkersWithClustering()` - Creates cluster group and adds markers
  (line 135)
- `addMarkersWithoutClustering()` - Fallback without clustering (line 228)

**Polling Logic (lines 98-121):**

```javascript
// Wait for Leaflet.markercluster to load (polling with timeout)
if (!window.L || typeof window.L.markerClusterGroup !== 'function') {
  let attempts = 0
  const maxAttempts = 30
  const checkInterval = 100 // ms

  const checkMarkerCluster = () => {
    attempts++
    if (window.L && typeof window.L.markerClusterGroup === 'function') {
      log(
        'info',
        `Leaflet.markercluster loaded after ${attempts * checkInterval}ms`
      )
      this.addMarkersWithClustering()
    } else if (attempts >= maxAttempts) {
      log(
        'warn',
        'Leaflet.markercluster not loaded after timeout, falling back to standard markers'
      )
      this.addMarkersWithoutClustering()
    } else {
      setTimeout(checkMarkerCluster, checkInterval)
    }
  }

  setTimeout(checkMarkerCluster, checkInterval)
  return
}
```

## Your Task

Using **Leaflet official documentation** and **industry best practices**,
diagnose and fix why `leaflet.markercluster.js` is successfully fetched
(HTTP 200) but `L.markerClusterGroup` remains undefined.

### Required Research

1. **Leaflet Plugin Integration Best Practices:**
   - Review https://leafletjs.com/examples/extending/extending-1-classes.html
   - How do Leaflet plugins extend the global `L` namespace?
   - What are the requirements for plugin initialization?

2. **Leaflet.markercluster Documentation:**
   - Check https://github.com/Leaflet/Leaflet.markercluster
   - Review initialization requirements and dependencies
   - Verify compatibility with Leaflet 1.9.4

3. **ES6 Modules + CDN Scripts:**
   - How should CDN scripts interact with ES6 modules in Vite?
   - Should we use `import` statements instead of script tags?
   - Does Vite need special configuration for external libraries?

4. **Vite Build Tool Considerations:**
   - Does Vite intercept or transform CDN requests?
   - Should external libraries be added to `vite.config.js`?
   - Are there known issues with defer + type="module"?

### Acceptance Criteria

✅ **Solution must:**

1. Load Leaflet.markercluster plugin successfully
2. Make `window.L.markerClusterGroup` available as a function
3. Work with Vite development server (`npm run dev`)
4. Work in production build
5. Not break existing Alpine.js or Leaflet functionality
6. Follow Leaflet and JavaScript best practices
7. Be maintainable and well-documented

✅ **Console should show:**

```
[INFO] Leaflet.markercluster loaded after Xms
[INFO] Added 60 markers to map with clustering
```

✅ **Map should display:**

- Cluster icons (numbered badges) when zoomed out
- Individual markers when zoomed in
- Automatic cluster splitting on zoom
- Click-to-zoom behavior on cluster icons

### Investigation Questions

Please investigate and answer:

1. **Why is the plugin not attaching to `window.L` despite successful HTTP
   200?**
   - Is there a JavaScript error preventing execution?
   - Is the plugin executing but targeting wrong Leaflet instance?
   - Is Vite creating multiple Leaflet instances?

2. **Should we use npm package instead of CDN?**
   - `npm install leaflet.markercluster`
   - Import as ES6 module: `import 'leaflet.markercluster'`
   - Does this solve the issue?

3. **Is there a Vite configuration issue?**
   - Should markercluster be in `optimizeDeps.exclude`?
   - Do we need to configure `resolve.alias`?
   - Should we use `vite-plugin-static-copy`?

4. **Is there a timing issue we're missing?**
   - Does Alpine.js initialization interfere?
   - Does the map modal's lazy loading cause issues?
   - Should we wait for `DOMContentLoaded` or `window.onload`?

## Files to Review

**Primary:**

- `/home/pseudo/workspace/FAM/fam-trainingsplan/index.html` (lines 46-55,
  876-877)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner/map-manager.js`
  (full file)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/vite.config.js`

**Supporting:**

- `/home/pseudo/workspace/FAM/fam-trainingsplan/src/main.js` (Alpine.js
  initialization)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/package.json` (dependencies)
- `/home/pseudo/workspace/FAM/fam-trainingsplan/docs/MAP-CLUSTERING-INFO.md`
  (clustering documentation)

## Constraints

- **Must maintain Material Design 3 styling** - Custom cluster icons use M3
  tokens
- **Must support dark mode** - Cluster icons adapt to theme
- **Must be accessible** - Markers have title/alt attributes
- **Must work in iframe** - App is embedded in parent site
- **Must be performant** - 60+ markers need efficient rendering
- **No breaking changes** - Existing functionality must continue working

## Expected Deliverables

1. **Root Cause Analysis** - Explain why plugin isn't loading
2. **Proposed Solution** - Step-by-step fix with code examples
3. **Implementation** - Updated files with comments explaining changes
4. **Testing Steps** - How to verify the fix works
5. **Documentation** - Update MAP-CLUSTERING-INFO.md with solution

## Additional Context

**Technology Stack:**

- Node.js 18+
- Vite 5.x
- Alpine.js 3.15.0
- Leaflet 1.9.4
- Leaflet.markercluster 1.5.3
- TailwindCSS 3.x

**User Workflow:**

1. User visits trainingsplan page (60 training locations loaded)
2. User clicks "Karte" button (map modal opens)
3. `MapManager.initializeMap()` creates Leaflet map
4. `MapManager.addMarkersToMap()` should add clustered markers
5. User zooms in/out to see clusters split/merge
6. User clicks marker to see training details popup

**Current Behavior:**

- Steps 1-3 work perfectly
- Step 4 shows individual markers (no clustering)
- Step 5 works but performance degrades with 60 individual markers
- Step 6 works (popups function correctly)

## References

- **Leaflet Documentation:** https://leafletjs.com/reference.html
- **Leaflet.markercluster GitHub:**
  https://github.com/Leaflet/Leaflet.markercluster
- **Leaflet.markercluster Demo:**
  https://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.388.html
- **Vite External Dependencies:** https://vitejs.dev/guide/dep-pre-bundling.html
- **Vite Static Assets:** https://vitejs.dev/guide/assets.html

---

**Priority:** 🔴 **CRITICAL** - Core functionality broken **Estimated
Complexity:** Medium (script loading + Vite integration) **Impact:** High (60
markers cause performance issues without clustering)

Please provide a **detailed, well-researched solution** that follows Leaflet
best practices and solves this issue permanently.
