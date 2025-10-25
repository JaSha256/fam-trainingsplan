#!/bin/bash

# MarkerCluster Production Build Verification Script
# This script MUST pass before deploying to GitHub Pages
# See: .claude/lessons-learned/VITE-PLUGIN-LOADING.md

set -e

echo "=========================================="
echo "🔍 MarkerCluster Deployment Verification"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check implementation files
echo "📁 Step 1: Checking implementation files..."

if ! grep -q "async addMarkersWithClustering()" src/js/trainingsplaner/map-manager.js; then
    echo -e "${RED}❌ FAIL: addMarkersWithClustering() is not async${NC}"
    echo "   Fix: Make method async in map-manager.js:497"
    exit 1
fi
echo -e "${GREEN}✓${NC} addMarkersWithClustering() is async"

if ! grep -q "await import('leaflet.markercluster')" src/js/trainingsplaner/map-manager.js; then
    echo -e "${RED}❌ FAIL: Missing dynamic import in addMarkersWithClustering()${NC}"
    echo "   Fix: Add 'await import(leaflet.markercluster)' before using L.markerClusterGroup()"
    exit 1
fi
echo -e "${GREEN}✓${NC} Dynamic import exists in addMarkersWithClustering()"

if grep -q "import 'leaflet.markercluster" src/main.js 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Static import found in main.js${NC}"
    echo "   Fix: Remove static 'import leaflet.markercluster' from main.js"
    exit 1
fi
echo -e "${GREEN}✓${NC} No static imports in main.js"

if ! grep -q "addMarkersWithoutClustering()" src/js/trainingsplaner/map-manager.js; then
    echo -e "${YELLOW}⚠${NC}  WARNING: No fallback method found"
fi

echo ""

# Step 2: Clean build
echo "🧹 Step 2: Clean build..."
rm -rf dist node_modules/.vite
echo -e "${GREEN}✓${NC} Build cache cleared"
echo ""

# Step 3: Production build
echo "📦 Step 3: Building production bundle..."
if ! npm run build > /tmp/build.log 2>&1; then
    echo -e "${RED}❌ FAIL: Build failed${NC}"
    cat /tmp/build.log
    exit 1
fi
echo -e "${GREEN}✓${NC} Production build successful"
echo ""

# Step 4: Check build output
echo "🔎 Step 4: Verifying build output..."

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ FAIL: dist/index.html not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} dist/index.html exists"

# Check for markercluster chunk
if ! ls dist/assets/js/*markercluster* 2>/dev/null | grep -q .; then
    echo -e "${YELLOW}⚠${NC}  WARNING: No markercluster chunk found (may be bundled)"
else
    echo -e "${GREEN}✓${NC} MarkerCluster chunk exists"
fi

# Check for vendor-map chunk
if ! ls dist/assets/js/vendor-map* 2>/dev/null | grep -q .; then
    echo -e "${YELLOW}⚠${NC}  WARNING: No vendor-map chunk found"
else
    echo -e "${GREEN}✓${NC} vendor-map chunk exists"
fi

echo ""

# Step 5: Start preview server
echo "🚀 Step 5: Starting preview server..."
npm run preview > /tmp/preview.log 2>&1 &
PREVIEW_PID=$!

# Wait for server to start
sleep 3

if ! kill -0 $PREVIEW_PID 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Preview server failed to start${NC}"
    cat /tmp/preview.log
    exit 1
fi
echo -e "${GREEN}✓${NC} Preview server running (PID: $PREVIEW_PID)"
echo ""

# Step 6: Manual verification instructions
echo "=========================================="
echo "📋 MANUAL VERIFICATION REQUIRED"
echo "=========================================="
echo ""
echo "1. Open browser to: http://localhost:4173/fam-trainingsplan/"
echo ""
echo "2. Open DevTools Console (F12)"
echo ""
echo "3. Navigate to Map View (click map icon)"
echo ""
echo "4. Verify these console messages appear:"
echo -e "   ${GREEN}✓${NC} 'MarkerCluster plugin loaded dynamically'"
echo -e "   ${GREEN}✓${NC} 'Added X markers to map with clustering'"
echo ""
echo "5. Verify NO errors in console"
echo ""
echo "6. Test marker clustering:"
echo "   - Zoom out → markers should cluster"
echo "   - Zoom in → clusters should break apart"
echo "   - Click cluster → should zoom to area"
echo ""
echo "7. Test on multiple browsers:"
echo "   - Desktop: Chrome, Firefox, Safari"
echo "   - Mobile: Chrome Android, Safari iOS"
echo ""
echo "Press Ctrl+C when verification complete"
echo ""

# Wait for user to verify
trap "echo ''; echo 'Stopping preview server...'; kill $PREVIEW_PID 2>/dev/null; echo 'Done.'; exit 0" INT

wait $PREVIEW_PID
