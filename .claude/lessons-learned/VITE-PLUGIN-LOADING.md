# Critical Lesson: Vite Plugin Loading Anti-Pattern

**Status:** 🚨 PERMANENT WARNING - READ BEFORE ANY VITE/LEAFLET CHANGES
**Affected:** leaflet.markercluster, any Leaflet plugins
**First Occurred:** 2025-10-24 (commit 5b61fe8)
**Second Occurred:** 2025-10-24 (commit 5b03bf3)
**Third Occurred:** 2025-10-25 (THIS FIX)

---

## ⚠️ THE PROBLEM

### Symptom
```
Uncaught TypeError: L.MarkerClusterGroup is not a constructor
at L.markerClusterGroup (index.[hash].js:2:21839)
```

### Why It Happens ONLY in Production
- **Development:** Vite serves modules individually, import order is preserved
- **Production:** Vite/Rollup creates optimized chunks with code-splitting
- **Result:** Even with correct static import order, chunks load in UNPREDICTABLE order

### Why Previous Fixes Failed

#### ❌ Attempt 1 (5b61fe8): Move imports to top of main.js
```javascript
// main.js
import * as L from 'leaflet'
window.L = L
import 'leaflet.markercluster'
```
**Why it failed:** Vite still splits into vendor-map chunk, load order not guaranteed

#### ❌ Attempt 2 (5b03bf3): Explicit .js import
```javascript
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
```
**Why it failed:** Rollup still bundles into separate chunk, race condition persists

#### ❌ Attempt 3: Manual chunks configuration
```javascript
// vite.config.js
manualChunks: {
  'vendor-map': ['leaflet', 'leaflet.markercluster']
}
```
**Why it failed:** Chunk creation doesn't guarantee internal execution order

---

## ✅ THE ONLY RELIABLE SOLUTION

### Dynamic Import AT Point of Use

```javascript
// map-manager.js - addMarkersWithClustering()
async addMarkersWithClustering() {
  // CRITICAL: Import plugin RIGHT BEFORE using it
  try {
    await import('leaflet.markercluster')
    await import('leaflet.markercluster/dist/MarkerCluster.css')
    await import('leaflet.markercluster/dist/MarkerCluster.Default.css')
  } catch (error) {
    log('error', 'Failed to load MarkerCluster', error)
    this.addMarkersWithoutClustering()
    return
  }

  // NOW it's guaranteed to be loaded
  const markers = L.markerClusterGroup({ ... })
}
```

### Why This Works
1. **Execution Order:** `await import()` blocks until module is fully loaded
2. **No Race Conditions:** Plugin is loaded synchronously when needed
3. **Lazy Loading Bonus:** Plugin only loads when map is actually used
4. **Graceful Degradation:** try/catch allows fallback if loading fails

---

## 🔒 ANTI-PATTERNS - NEVER DO THIS

### ❌ Anti-Pattern 1: Static Import in main.js
```javascript
// DON'T: Static imports don't guarantee load order in production
import 'leaflet.markercluster'
```

### ❌ Anti-Pattern 2: Assume window.L is global
```javascript
// DON'T: Chunk order means window.L might not exist yet
if (L.markerClusterGroup) { ... }
```

### ❌ Anti-Pattern 3: Import in separate file
```javascript
// map-utils.js
import 'leaflet.markercluster' // DON'T: May load after map-manager.js

// map-manager.js
import { setupMarkers } from './map-utils.js'
const markers = L.markerClusterGroup() // FAILS: Plugin not loaded yet
```

### ❌ Anti-Pattern 4: Rely on Vite optimizeDeps
```javascript
// vite.config.js
optimizeDeps: {
  include: ['leaflet.markercluster'] // DON'T: Only affects dev mode
}
```

---

## 📋 PRE-DEPLOYMENT CHECKLIST

**MANDATORY before ANY deployment:**

```bash
# 1. Clean build
rm -rf dist node_modules/.vite
npm run build

# 2. Test production build locally
npm run preview

# 3. Open browser to http://localhost:4173/fam-trainingsplan/

# 4. Open DevTools Console

# 5. Navigate to Map View

# 6. VERIFY these logs appear:
#    ✓ "MarkerCluster plugin loaded dynamically"
#    ✓ "Added X markers to map with clustering"

# 7. VERIFY no console errors

# 8. Test on:
#    - Desktop: Chrome, Firefox, Safari
#    - Mobile: Chrome Android, Safari iOS

# 9. Only deploy if ALL browsers work
```

---

## 🔍 HOW TO VERIFY THE FIX

### Correct Implementation Checklist

1. **✅ map-manager.js has async dynamic import**
   ```javascript
   async addMarkersWithClustering() {
     await import('leaflet.markercluster')
   ```

2. **✅ main.js does NOT have static markercluster import**
   ```javascript
   // Should NOT exist:
   // import 'leaflet.markercluster'
   ```

3. **✅ Fallback method exists**
   ```javascript
   addMarkersWithoutClustering() {
     // Standard Leaflet markers without clustering
   }
   ```

4. **✅ Double-check after import**
   ```javascript
   if (typeof L.markerClusterGroup !== 'function') {
     this.addMarkersWithoutClustering()
     return
   }
   ```

### Test in Browser
```javascript
// Open DevTools Console after navigating to map
console.log(typeof L.markerClusterGroup) // Should be 'function'
```

---

## 📚 TECHNICAL EXPLANATION

### Vite Build Process
```
Development Mode:
  main.js → imports → leaflet.markercluster
  ↓ (preserves order)
  Browser receives modules in sequence

Production Mode:
  Vite → Rollup → Code Splitting → Chunks
  ↓
  vendor-map.js (leaflet + markercluster)
  vendor-alpine.js (alpinejs)
  index.js (app code)
  ↓ (parallel loading, unpredictable order!)
  Browser loads chunks in ANY order
```

### Why Chunks Load Unpredictably
1. **HTTP/2 Multiplexing:** Multiple resources load simultaneously
2. **CDN Routing:** Different routes for different chunks
3. **Browser Caching:** Cached chunks load faster than uncached
4. **Network Jitter:** Random delays affect load sequence

### The Race Condition
```javascript
// Chunk A loads first
window.L = Leaflet

// Chunk B tries to extend L
// But Chunk A might not be done yet!
L.markerClusterGroup = function() { ... } // FAILS if L undefined
```

---

## 🎯 PERMANENT RULES FOR THIS CODEBASE

### Rule 1: Leaflet Plugins MUST Use Dynamic Import
**When:** Any Leaflet plugin that extends `L` global
**Where:** At point of use, not in main.js
**How:** `await import('plugin')` right before calling plugin API

### Rule 2: Test Production Builds BEFORE Committing
**When:** ANY changes to imports in main.js, vite.config.js, or map-manager.js
**How:** Run pre-deployment checklist (see above)

### Rule 3: Document Plugin Loading Strategy
**When:** Adding new Leaflet plugins (heatmap, draw, etc.)
**How:** Add to this lessons-learned doc

### Rule 4: Never Trust Static Imports for Runtime Extensions
**When:** Any library that modifies global objects at import time
**How:** Use dynamic imports or verify global exists before use

---

## 🔗 RELATED FILES

**Implementation:**
- `src/js/trainingsplaner/map-manager.js:497` - Dynamic import location
- `src/main.js:28` - NO static imports here
- `vite.config.js:263` - Chunk configuration

**Documentation:**
- `DEPLOYMENT_FIX.md` - Root cause analysis
- `ARCHITECTURE.md` - Will be updated with this pattern
- `docs/LEAFLET-CLUSTERING-FIX-PROMPT.md` - Original fix attempt docs

**Testing:**
- `tests/e2e/main.spec.js` - Add MarkerCluster load test
- `verify-deployment.sh` - Pre-deployment script

---

## 📞 IF THIS HAPPENS AGAIN

If you see this error in production AGAIN:

1. **DON'T** try static imports in different files
2. **DON'T** try different Vite config tricks
3. **DON'T** assume it's a caching issue

**DO THIS:**
1. Read this document completely
2. Verify `map-manager.js` has `async addMarkersWithClustering()`
3. Verify `await import('leaflet.markercluster')` exists
4. Check if someone reverted the fix
5. Run pre-deployment checklist
6. If still failing, investigate if:
   - Leaflet upgraded (breaking change?)
   - Vite upgraded (bundling change?)
   - New conflicting plugin added?

---

**Date Created:** 2025-10-25
**Last Verified:** 2025-10-25
**Next Review:** When upgrading Vite or Leaflet major versions
**Owner:** Frontend Architecture Team
