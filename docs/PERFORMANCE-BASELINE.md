# Performance Baseline - Leaflet Map Implementation

**Date**: 2025-10-19 **Version**: Pre-Optimization (v2.4.0) **Purpose**:
Establish baseline metrics before optimization work

---

## Bundle Size Analysis

### Current Build Output (Production)

```
dist/assets/js/vendor-map.zdHhRoWp.js      149.70 kB │ gzip: 43.71 kB
dist/assets/js/index.DfFtmC4Q.js            91.66 kB │ gzip: 26.76 kB
dist/assets/js/vendor-alpine.D9MLegQT.js    62.35 kB │ gzip: 22.13 kB
dist/assets/js/vendor-utils.Dw8P0qyA.js     18.25 kB │ gzip:  6.72 kB
dist/assets/index.DbRH0VuQ.css             102.72 kB │ gzip: 20.40 kB
```

**Map Bundle** (`vendor-map.js`):

- Raw: 149.70 kB
- Gzipped: **43.71 kB** ← Current baseline
- Contains: Leaflet 1.9.4 + leaflet.markercluster 1.5.3

**Target**: < 200 KB raw, < 50 KB gzipped (currently within target)

---

## Current Implementation Analysis

### Map Configuration

**Tile Layer** (`map-manager.js:62-65`):

```javascript
L.tileLayer(CONFIG.map.tileLayerUrl, {
  attribution: CONFIG.map.attribution,
  maxZoom: 19
  // Missing: detectRetina, updateWhenIdle, keepBuffer, bounds
})
```

**Issues Identified**:

- ❌ No `detectRetina` (poor experience on high-DPI displays)
- ❌ No `updateWhenIdle` (tiles load during pan, can cause jank)
- ❌ No `keepBuffer` setting (uncontrolled tile caching)
- ❌ No bounds restriction (users can pan to Antarctica)
- ❌ No `minZoom` restriction

---

### Marker Clustering Configuration

**Current** (`map-manager.js:131-152`):

```javascript
L.markerClusterGroup({
  chunkedLoading: true,
  removeOutsideVisibleBounds: true,
  maxClusterRadius: 80,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  iconCreateFunction: (cluster) => { ... }
})
```

**Issues Identified**:

- ✅ `chunkedLoading` enabled (good)
- ✅ `removeOutsideVisibleBounds` enabled (good)
- ❌ No `chunkInterval` or `chunkDelay` customization
- ❌ No `animateAddingMarkers` explicitly disabled
- ❌ No `disableClusteringAtZoom` (users forced to zoom very far to see
  individual markers)
- ❌ `maxClusterRadius: 80` not responsive (same for mobile/desktop)

---

### Memory Management

**Current Cleanup** (`map-manager.js:385-404`):

```javascript
cleanupMap() {
  if (this.context.map) {
    const map = this.context.map

    // Remove cluster group
    if (this.context.markerClusterGroup) {
      map.removeLayer(this.context.markerClusterGroup)
      this.context.markerClusterGroup = null
    }

    // Remove individual markers
    this.context.markers.forEach((m) => map.removeLayer(m))
    this.context.markers = []

    // Destroy map instance
    map.remove()
    this.context.map = null
    this.context.userHasInteractedWithMap = false
  }
}
```

**Issues Identified**:

- ✅ Removes cluster group
- ✅ Removes individual markers
- ✅ Calls `map.remove()` (proper Leaflet cleanup)
- ❌ No explicit event listener cleanup (`map.off()`)
- ❌ No tile layer cleanup
- ❌ No popup cleanup (bound to markers)
- ⚠️ Potential circular references (marker.trainingId)

---

## Missing Features (Performance Impact)

### 1. No Map State Persistence

- **Impact**: Every modal open triggers `fitBounds()` calculation
- **Cost**: ~50-100ms per open (unnecessary work)
- **Solution**: Save/restore zoom and center to localStorage

### 2. No Geolocation

- **Impact**: No "nearby trainings" feature
- **Opportunity**: Could reduce visible markers (better performance)

### 3. No Error Handling

- **Impact**: Tile loading failures cause poor UX
- **Opportunity**: Offline mode, cached tiles, error recovery

### 4. No Keyboard Navigation

- **Impact**: Accessibility issue, poor UX for keyboard users
- **Opportunity**: Better engagement, WCAG compliance

### 5. No Mobile Optimization

- **Impact**: Same cluster radius on all screen sizes
- **Opportunity**: Tighter clusters on mobile (60px vs 80px)

---

## Research Findings from Official Docs

### Leaflet Best Practices (from leafletjs.com)

**Key Recommendations**:

1. **`detectRetina: true`** - Load higher resolution tiles on retina displays
2. **`updateWhenIdle: true`** - Don't update tiles during pan (smoother)
3. **`keepBuffer: 2`** - Keep 2 rows/columns of tiles loaded (default)
4. **`preferCanvas: true`** - Better performance for complex paths
5. **Use `map.off()` to remove event listeners** - Prevent memory leaks

### Leaflet.markercluster Best Practices

**Key Recommendations**:

1. **`chunkedLoading: true`** - Essential for 50+ markers ✅
2. **`chunkInterval: 200`** - Adjust for slower devices
3. **`chunkDelay: 50`** - Time between chunk batches
4. **`animateAddingMarkers: false`** - Faster initial render
5. **`disableClusteringAtZoom: 18`** - Force individual markers at high zoom
6. **`removeOutsideVisibleBounds: true`** - Critical for performance ✅

---

## Performance Targets

### Bundle Size

- ✅ Current: 43.71 kB gzipped (within target)
- 🎯 Target: < 50 kB gzipped
- 📊 Stretch Goal: < 40 kB gzipped

### Runtime Performance

- 🎯 Map Initialization: < 500ms (currently unknown)
- 🎯 Marker Addition (60 markers): < 100ms (currently unknown)
- 🎯 Memory Usage: < 50 MB (currently unknown)
- 🎯 Memory Leak: < 1 MB after 10 cycles (currently unknown)

### User Experience

- 🎯 60 FPS during zoom/pan
- 🎯 Smooth touch interactions on mobile
- 🎯 Tile loading < 2s on 3G
- 🎯 Keyboard navigation functional
- 🎯 WCAG 2.1 AA compliance

### Test Coverage

- 🎯 MapManager unit tests: > 80%
- 🎯 Integration tests: All critical paths
- 🎯 E2E tests: Complete user flows
- 🎯 Visual regression: Light/dark mode

---

## Known Issues Summary

| Category          | Issue                        | Impact                      | Priority |
| ----------------- | ---------------------------- | --------------------------- | -------- |
| **Tile Loading**  | No `detectRetina`            | Poor retina display quality | High     |
| **Tile Loading**  | No `updateWhenIdle`          | Jank during pan             | High     |
| **Tile Loading**  | No bounds restriction        | Users can pan globally      | Low      |
| **Clustering**    | Fixed `maxClusterRadius`     | Not responsive              | Medium   |
| **Clustering**    | No `disableClusteringAtZoom` | Forced deep zoom            | Medium   |
| **Clustering**    | No chunk timing tuning       | Suboptimal loading          | Low      |
| **Memory**        | No explicit event cleanup    | Potential leaks             | High     |
| **Memory**        | No tile layer cleanup        | Potential leaks             | Medium   |
| **Features**      | No map state persistence     | Unnecessary recalculation   | Medium   |
| **Features**      | No geolocation               | Missing UX feature          | Low      |
| **Features**      | No error handling            | Poor offline UX             | Medium   |
| **Accessibility** | No keyboard navigation       | WCAG violation              | High     |
| **Accessibility** | No ARIA labels               | Screen reader issues        | High     |

---

## Next Steps

1. ✅ **Phase 1: Research** - Completed
2. ✅ **Phase 2: Baseline** - Completed
3. ⏳ **Task 1.1**: Optimize tile layer configuration
4. ⏳ **Task 1.2**: Optimize clustering configuration
5. ⏳ **Task 1.3**: Fix memory leaks
6. ⏳ **Task 2.x**: Implement advanced features
7. ⏳ **Task 3**: Accessibility improvements
8. ⏳ **Task 4**: Mobile optimization
9. ⏳ **Task 5**: Error handling
10. ⏳ **Task 6**: Testing suite
11. ⏳ **Task 7**: Documentation

---

**Baseline Established**: 2025-10-19 **Next Review**: After optimization
implementation
