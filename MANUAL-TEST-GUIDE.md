# Manual Testing Guide: Duplicate Marker Bug Fix

## Prerequisites
- Local dev server running (`npm run dev`)
- Browser with geolocation permission (or ability to grant it)
- FAM Trainingsplan app loaded at http://localhost:5173

## Test Environment Setup
1. Open browser DevTools (F12)
2. Enable "Device Toolbar" (mobile simulation)
3. Allow location permissions when prompted

---

## Test Case 1: GPS → Manual Location
**Expected:** Only ONE marker visible after switch

### Steps:
1. **Open Map View**
   - Click "Kartenansicht" tab or use view switcher
   - Map should load with training location markers

2. **Request GPS Location**
   - Click "Mein Standort" button (GPS icon in top-right controls)
   - Browser may prompt for location permission → Allow
   - Wait for geolocation success

3. **Verify GPS Marker**
   - ✅ Blue pulsing marker appears at your GPS location
   - ✅ Map centers on GPS location
   - ✅ Notification shows "Standort gefunden!"

4. **Switch to Manual Location**
   - Click Settings/Menu icon
   - Navigate to "Standort Einstellungen"
   - Toggle "Manuelle Standorteingabe" to ON
   - Enter coordinates (example: `48.1351, 11.5820`)
   - Click "Speichern"

5. **Verify Manual Marker** (CRITICAL TEST)
   - ✅ **ONLY ONE** blue pulsing marker visible (manual location)
   - ✅ GPS marker is GONE (no duplicate)
   - ✅ Map centers on manual location
   - ✅ Notification shows manual location address

### Expected Result:
✅ **PASS:** Only one marker visible  
❌ **FAIL (BUG):** Two markers visible

---

## Test Case 2: Manual → GPS Location
**Expected:** Only ONE marker visible after switch

### Steps:
1. **Set Manual Location First**
   - Open Settings → Standort Einstellungen
   - Enable "Manuelle Standorteingabe"
   - Enter coordinates: `48.1400, 11.5900`
   - Save

2. **Verify Manual Marker**
   - ✅ Blue pulsing marker at manual location
   - ✅ Map centered on manual location

3. **Switch to GPS**
   - Open Settings → Standort Einstellungen
   - Toggle "Manuelle Standorteingabe" to OFF (back to Auto)
   - Click "Mein Standort" button in map controls

4. **Verify GPS Marker** (CRITICAL TEST)
   - ✅ **ONLY ONE** blue pulsing marker visible (GPS location)
   - ✅ Manual marker is GONE (no duplicate)
   - ✅ Map centers on GPS location

### Expected Result:
✅ **PASS:** Only one marker visible  
❌ **FAIL (BUG):** Two markers visible

---

## Test Case 3: Location Reset
**Expected:** NO markers visible after reset

### Steps:
1. **Set Any Location** (GPS or Manual)
   - User marker visible on map ✓

2. **Reset Location**
   - Open Settings → Standort Einstellungen
   - Click "Standort zurücksetzen" button

3. **Verify Reset** (CRITICAL TEST)
   - ✅ **NO** user location marker visible
   - ✅ Distance calculations disabled
   - ✅ "Nearby" quick filter deactivated (if was active)
   - ✅ Notification shows "Standort zurückgesetzt"

### Expected Result:
✅ **PASS:** No user markers visible  
❌ **FAIL (BUG):** Marker still visible

---

## Test Case 4: Rapid Location Switching
**Expected:** Only ONE marker at all times

### Steps:
1. **GPS** → Wait for marker → ✅ 1 marker
2. **Manual (48.1351, 11.5820)** → ✅ 1 marker (different location)
3. **GPS** → ✅ 1 marker (back to GPS)
4. **Manual (48.1400, 11.5900)** → ✅ 1 marker (manual again)
5. **Reset** → ✅ 0 markers

### Verification Points:
- After EACH switch, count markers on map
- ✅ Always exactly 1 marker (or 0 after reset)
- ❌ NEVER 2 or more markers

---

## Test Case 5: Edge Cases

### 5a: Location Change While Map Closed
1. Set GPS location (map open)
2. Switch to List View (map hidden)
3. Change to Manual location in settings
4. Switch back to Map View
5. ✅ Only manual marker visible (no GPS marker)

### 5b: Multiple Maps (if applicable)
1. Open map in modal
2. Set GPS location
3. Close modal, open different map view
4. ✅ No duplicate markers

### 5c: Browser Refresh
1. Set manual location
2. Refresh browser (F5)
3. ✅ Manual location persists (from localStorage)
4. ✅ Only one marker visible

---

## Visual Inspection Checklist

For each test, verify marker appearance:
- ✅ Marker has blue pulsing animation
- ✅ Marker tooltip shows "Mein Standort"
- ✅ Marker appears ABOVE training location markers (z-index)
- ✅ Marker is clickable/interactive

---

## Browser Testing Matrix

Test in multiple browsers:
- [ ] Chrome/Chromium (Desktop)
- [ ] Chrome (Mobile - Android)
- [ ] Firefox (Desktop)
- [ ] Safari (iOS)
- [ ] Brave (Desktop)

---

## Debugging Tips

### If duplicate markers appear:
1. Open DevTools Console
2. Look for errors related to:
   - `removeLayer`
   - `userLocationMarker`
   - `_userMarker`
3. Check if both markers have different CSS classes
4. Use "Inspect Element" to identify marker sources

### Console Logging:
Look for these log messages:
- ✅ `"User location marker added to map"` (only once per location change)
- ✅ `"Standort gefunden!"` or `"Gespeicherter Standort: ..."`

### Network Tab:
- No excessive API calls
- Geolocation requests complete successfully

---

## Acceptance Criteria

✅ **Bug Fixed When:**
- All 5 test cases pass
- No duplicate markers in ANY scenario
- Marker cleanup works across all browsers
- No console errors

❌ **Bug Still Exists If:**
- Any test case shows 2 markers
- Manual testing reveals edge cases with duplicates
- Console errors related to marker removal

---

**Tester Name:** _______________  
**Test Date:** _______________  
**Browser/Version:** _______________  
**Result:** ⬜ PASS  ⬜ FAIL  
**Notes:** _______________________________________________
