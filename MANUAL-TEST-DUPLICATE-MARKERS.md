# Manual Test Plan: Duplicate User Location Markers Fix

## Bug Report
**Issue**: "es gibt noch fehler wenn ich zuerst automatisch bestimme und danach manuell meinen standort festlege dann hab ich plötzlich zwei marker auf der karte"

**Root Cause**: GeolocationControl and MapManager each created their own user location marker without coordinating cleanup, resulting in duplicate markers when switching between GPS and manual location modes.

**Fix Implemented**: Made MapManager the single source of truth for user location markers. The `addUserLocationMarker()` method now removes both possible markers before creating a new one:
- MapManager's marker (`this.context.userLocationMarker`)
- GeolocationControl's marker (`this.context.geolocationControl._userMarker`)

## Test Environment
- **Browser**: Chrome/Firefox/Safari (test all)
- **Device**: Desktop and Mobile
- **Network**: Allow geolocation permissions when requested
- **Dev Server**: `npm run dev` (running on http://localhost:5173)

## Test Scenarios

### Scenario 1: GPS Only (Baseline)
**Steps**:
1. Open app in fresh browser session (clear localStorage)
2. Click "Mein Standort" button in map controls
3. Allow geolocation permission when prompted

**Expected Result**:
- ✅ Single blue marker appears at GPS location
- ✅ Map zooms to user location (zoom level 16)
- ✅ Notification shows "Standort ermittelt! 📍"

**Actual Result**: ________________

---

### Scenario 2: Manual Location Only
**Steps**:
1. Open app in fresh browser session
2. Click Settings (⚙️)
3. Toggle "Standort manuell festlegen"
4. Enter coordinates: 48.1351, 11.5820 (Munich center)
5. Enter address: "Marienplatz, München"
6. Click "Speichern"

**Expected Result**:
- ✅ Single blue marker appears at manual location
- ✅ Map shows marker at Marienplatz
- ✅ Distance calculations update for all trainings
- ✅ No GPS permission requested

**Actual Result**: ________________

---

### Scenario 3: GPS → Manual (Primary Bug Scenario)
**Steps**:
1. Open app in fresh session
2. Click "Mein Standort" → Allow GPS
3. Verify GPS marker appears
4. Go to Settings → Enable "Standort manuell festlegen"
5. Enter coordinates: 48.1786, 11.5750 (LMU Munich)
6. Click "Speichern"

**Expected Result**:
- ✅ GPS marker disappears
- ✅ Single manual location marker appears at LMU
- ✅ NO duplicate markers visible
- ✅ Map updates to show new location

**Actual Result**: ________________

---

### Scenario 4: Manual → GPS
**Steps**:
1. Open app with manual location set (from Scenario 2)
2. Go to Settings
3. Disable "Standort manuell festlegen"
4. Click "Mein Standort" button

**Expected Result**:
- ✅ Manual marker disappears
- ✅ Single GPS marker appears at current location
- ✅ NO duplicate markers visible
- ✅ Geolocation permission requested

**Actual Result**: ________________

---

### Scenario 5: Reset Location
**Steps**:
1. Open app with either GPS or manual location active
2. Click "Standort zurücksetzen" button in Settings

**Expected Result**:
- ✅ All user location markers removed from map
- ✅ No markers visible
- ✅ Distance filter deactivated if active
- ✅ Distance values removed from training cards

**Actual Result**: ________________

---

### Scenario 6: Switching Multiple Times (Stress Test)
**Steps**:
1. GPS → Manual → GPS → Manual → Reset
2. Repeat 3 times

**Expected Result**:
- ✅ Only ONE marker visible at all times (except after reset)
- ✅ No marker accumulation
- ✅ No console errors
- ✅ Smooth transitions

**Actual Result**: ________________

---

### Scenario 7: "Mein Standort" Button with Saved Manual Location
**Steps**:
1. Set manual location in Settings (Marienplatz)
2. Close Settings
3. Click "Mein Standort" button in map controls

**Expected Result**:
- ✅ Map zooms to saved manual location (NOT GPS)
- ✅ Single marker at manual location
- ✅ Notification: "Gespeicherter Standort: Marienplatz, München"
- ✅ No GPS permission requested

**Actual Result**: ________________

---

### Scenario 8: Page Reload with Manual Location
**Steps**:
1. Set manual location (Marienplatz)
2. Reload page (F5)

**Expected Result**:
- ✅ Manual location marker appears automatically on map
- ✅ Single marker visible
- ✅ Distance calculations restored
- ✅ No GPS permission requested

**Actual Result**: ________________

---

## Console Error Checks

During ALL scenarios above, monitor browser console for:

**Expected**: No errors

**Common errors to watch for**:
- ❌ `Cannot read properties of null (reading '_latLngToNewLayerPoint')`
- ❌ `Alpine Expression Error: ...`
- ❌ `TypeError: ... is not a function`

**Console Output**: ________________

---

## Files Modified

- `src/js/trainingsplaner/map-manager.js` (lines 966-980)
  - Enhanced `addUserLocationMarker()` to remove both MapManager and GeolocationControl markers

- `src/js/trainingsplaner/geolocation-manager.js` (lines 200-212)
  - Enhanced `resetLocation()` to clean up both marker types

- `tests/unit/duplicate-marker-bugfix.test.js` (NEW)
  - 9 comprehensive tests covering all scenarios

## Test Coverage

**Unit Tests**: 546/553 passed (98.7%)
**Build**: ✅ Successful (668.40 KiB)

## Sign-Off

**Tester Name**: ________________
**Date**: ________________
**Browser(s) Tested**: ________________
**Overall Result**: PASS / FAIL
**Notes**: ________________
