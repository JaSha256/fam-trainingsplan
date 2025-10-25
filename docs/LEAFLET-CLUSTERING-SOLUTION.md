# Leaflet MarkerCluster Integration - Definitive Solution

**Status:** ✅ SOLVED (2025-10-25)  
**Problem Occurred:** 3 times (2025-10-24, 2025-10-25)  
**Final Solution:** Dynamic imports at point of use

---

## Root Cause: Vite Production Build Race Condition

**Development Mode:** ✅ Works (modules served individually)  
**Production Mode:** ❌ Race condition (parallel chunk loading)

### The Issue
Static imports in production builds with code-splitting do NOT guarantee execution order.

---

## ✅ THE SOLUTION

### Dynamic Import at Point of Use (`map-manager.js:497`)

```javascript
async addMarkersWithClustering() {
  // CRITICAL: Import RIGHT BEFORE using
  await import('leaflet.markercluster')
  const markers = L.markerClusterGroup({ ... })
}
```

---

## 📋 MANDATORY READING

**Full Documentation:**
- `.claude/lessons-learned/VITE-PLUGIN-LOADING.md` ← READ THIS
- `ARCHITECTURE.md:1152` - Warning section

**Verification:**
```bash
./verify-markercluster.sh
```

**This problem occurred 3 times. DO NOT try static imports again.**
