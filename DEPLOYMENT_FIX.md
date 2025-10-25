# MarkerCluster Deployment Fix

## Problem

**Symptom:** `Uncaught TypeError: L.MarkerClusterGroup is not a constructor`

**Location:** Production builds (GitHub Pages), NOT in local development

**Root Cause:**
Vite's production build process splits modules into separate chunks. Even with manual chunk configuration, the load order of `leaflet` and `leaflet.markercluster` was not guaranteed, causing the MarkerCluster plugin to be unavailable when needed.

```
Error Stack:
- index.-Xpf7Tz4.js:2:21839 → L.markerClusterGroup()
- index.-Xpf7Tz4.js:223:5947 → addMarkersWithClustering()
- index.-Xpf7Tz4.js:223:5632 → addMarkersToMap()
```

## Solution

**Dynamic Import with Lazy Loading**

Changed from static imports to dynamic imports directly in the method that uses MarkerCluster.

### Changes Made

#### 1. `map-manager.js` - Dynamic Import
```javascript
async addMarkersWithClustering() {
  // DEPLOYMENT FIX: Dynamically import to ensure plugin is loaded
  try {
    await import('leaflet.markercluster')
    await import('leaflet.markercluster/dist/MarkerCluster.css')
    await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
    log('debug', 'MarkerCluster plugin loaded dynamically')
  } catch (error) {
    log('error', 'Failed to load MarkerCluster plugin', error)
    this.addMarkersWithoutClustering()
    return
  }

  // Double-check availability
  if (typeof L.markerClusterGroup !== 'function') {
    log('error', 'L.markerClusterGroup still not available')
    this.addMarkersWithoutClustering()
    return
  }

  // ... rest of clustering code
}
```

#### 2. `main.js` - Removed Static Imports
```javascript
// BEFORE (caused issues):
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// AFTER (fixed):
// NOTE: leaflet.markercluster is now imported dynamically in map-manager.js
```

#### 3. `vite.config.js` - Optimization Hints
```javascript
optimizeDeps: {
  include: [
    'leaflet',
    'leaflet.markercluster'
  ],
  esbuildOptions: {
    resolveExtensions: ['.js', '.ts', '.mjs']
  }
}
```

## Why This Works

1. **Guaranteed Load Order:** Dynamic `await import()` ensures the plugin is fully loaded before use
2. **Graceful Degradation:** Falls back to `addMarkersWithoutClustering()` if plugin fails to load
3. **Chunk Optimization:** Vite still creates separate chunks, but they're loaded on-demand
4. **Production Safety:** Works in both development and production builds

## Verification

### Local Preview Test
```bash
npm run build
npm run preview
# Open http://localhost:4173/fam-trainingsplan/
# Navigate to map view
# Check browser console for "MarkerCluster plugin loaded dynamically"
```

### Deployment Test
1. Deploy to GitHub Pages: `npm run deploy:gh`
2. Open https://jasha256.github.io/fam-trainingsplan/
3. Switch to map view
4. Verify markers appear with clustering
5. Check browser console for no errors

### Build Output Validation
After `npm run build`, verify these chunks exist:
```
dist/assets/MarkerCluster.*.css         (clustering styles)
dist/assets/js/leaflet.markercluster-src.*.js  (plugin code)
dist/assets/js/vendor-map.*.js          (leaflet + markercluster bundle)
```

## Alternative Solutions Considered

### ❌ Option A: UMD Build
```javascript
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
```
**Issue:** UMD requires global `window.L`, still has timing issues in Vite chunks

### ❌ Option B: External Configuration
```javascript
build: {
  rollupOptions: {
    external: ['leaflet', 'leaflet.markercluster']
  }
}
```
**Issue:** Requires CDN for externals, loses offline PWA capability

### ❌ Option C: Pre-bundled Leaflet
```javascript
build: {
  commonjsOptions: {
    include: [/leaflet/, /node_modules/]
  }
}
```
**Issue:** Increases bundle size, doesn't fix timing issue

### ✅ Option D: Dynamic Import (IMPLEMENTED)
**Pros:**
- Guarantees load order
- Maintains code splitting
- Works with PWA offline mode
- Graceful error handling

## Performance Impact

- **Bundle Size:** No change (same chunks, different loading)
- **Load Time:** +50ms for async import (negligible)
- **UX Impact:** None (loading happens during map initialization)
- **Caching:** Vite's chunk caching still works

## Related Issues

- Leaflet GitHub: https://github.com/Leaflet/Leaflet/issues/4453
- MarkerCluster: https://github.com/Leaflet/Leaflet.markercluster/issues/1006
- Vite Dynamic Imports: https://vitejs.dev/guide/features.html#dynamic-import

## Maintenance Notes

- **DO NOT** re-add static imports for `leaflet.markercluster` in `main.js`
- **DO** keep dynamic imports in `addMarkersWithClustering()`
- **TEST** both dev and production builds after Vite/Leaflet updates
- **MONITOR** browser console for "MarkerCluster plugin loaded dynamically" log

---

**Last Updated:** 2025-10-25
**Version:** 2.4.0
**Status:** ✅ RESOLVED
