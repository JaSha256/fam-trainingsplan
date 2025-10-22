# Location Reset Feature Implementation

## Overview

Implemented a "Standort zurücksetzen" (Reset Location) button in the Geolocation
Settings modal that allows users to clear their saved location data and reset
distance-based filters.

## Implementation Details

### 1. Backend Logic - GeolocationManager

**File:** `src/js/trainingsplaner/geolocation-manager.js`

Added `resetLocation()` method that:

- Clears `userPosition` state
- Removes manual location data from Alpine store
- Removes data from localStorage
- Removes distance properties from all trainings
- Removes user location marker from map
- Deactivates "nearby" quick filter if active
- Reapplies filters to update UI

```javascript
resetLocation() {
  // Clear userPosition
  this.context.userPosition = null

  // Clear manual location from store
  this.context.$store.ui.manualLocation = null
  this.context.$store.ui.manualLocationAddress = ''
  this.context.$store.ui.manualLocationSet = false

  // Remove from localStorage
  localStorage.removeItem('manualLocation')

  // Remove distance properties from trainings
  this.context.allTrainings.forEach((t) => {
    delete t.distance
    delete t.distanceText
  })

  // Remove map marker for user location
  if (this.context.map && this.context.userLocationMarker) {
    this.context.map.removeLayer(this.context.userLocationMarker)
    this.context.userLocationMarker = null
  }

  // Deactivate distance-based quick filter
  if (this.context.$store.ui.filters.activeQuickFilter === 'nearby') {
    this.context.$store.ui.filters.activeQuickFilter = null
  }

  // Reapply filters
  this.applyFilters()
}
```

### 2. Component Integration

**File:** `src/js/trainingsplaner.js`

Exposed reset method in trainingsplaner component:

```javascript
component.resetLocation = function () {
  return this.geolocationManager.resetLocation()
}
```

### 3. UI Implementation

**File:** `index.html`

Added to Location Settings Modal:

1. **Confirmation Handler:**

   ```javascript
   confirmResetLocation() {
     if (confirm('Möchten Sie Ihren gespeicherten Standort wirklich zurücksetzen?...')) {
       resetLocation();
       // Reset local state
       this.locationType = 'auto';
       this.manualLat = '';
       this.manualLng = '';
       this.manualAddress = '';
       // Show notification and close modal
       this.$store.ui.showNotification('Standort zurückgesetzt', 'success', 2000);
       this.$store.ui.locationSettingsOpen = false;
     }
   }
   ```

2. **Reset Button:**
   ```html
   <button
     x-show="$store.ui.manualLocationSet || userPosition"
     @click="confirmResetLocation()"
     type="button"
     class="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
   >
     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
       <path
         stroke-linecap="round"
         stroke-linejoin="round"
         stroke-width="2"
         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
       />
     </svg>
     Standort zurücksetzen
   </button>
   ```

## UX Design

### Visual Design

- **Color Scheme:** Red accent (bg-red-50, text-red-700) to indicate destructive
  action
- **Icon:** Trash/delete icon from Heroicons
- **Position:** Between "Standort speichern" and "Abbrechen" buttons
- **Visibility:** Only shown when location is active
  (`x-show="$store.ui.manualLocationSet || userPosition"`)

### Material Design 3 Compliance

- ✅ Minimum touch target: 44px height
- ✅ Proper spacing: 12px gap between buttons
- ✅ Clear visual hierarchy: Destructive action styled differently from primary
  action
- ✅ Accessible contrast ratios
- ✅ Smooth transitions on hover

### User Flow

1. User opens Location Settings
2. If location is set, Reset button appears
3. User clicks "Standort zurücksetzen"
4. Confirmation dialog appears with clear warning
5. If confirmed:
   - Location data is cleared
   - Success notification shown
   - Modal closes automatically
   - Green indicator dot disappears from settings button
   - Distance-based filters are deactivated
6. If cancelled:
   - Modal remains open
   - No changes made

## Testing

### Unit Tests

**File:** `tests/unit/geolocation-reset.test.js`

Covers:

- ✅ Clear userPosition
- ✅ Clear manual location from store
- ✅ Remove from localStorage
- ✅ Remove distance properties from trainings
- ✅ Remove user location marker from map
- ✅ Deactivate nearby quick filter if active
- ✅ Preserve other quick filters
- ✅ Reapply filters after reset
- ✅ Handle missing map gracefully
- ✅ Handle missing user location marker gracefully

**Test Results:** All 10 tests passing ✅

### E2E Tests

**File:** `tests/e2e/location-reset.spec.js`

Covers:

- Reset button visibility based on location state
- Confirmation dialog appears before reset
- Reset cancellation preserves state
- Reset clears all location data
- Distance-based filters are cleared

## Features

### Core Functionality

- ✅ Clears user position state
- ✅ Removes manual location from store
- ✅ Removes data from localStorage
- ✅ Removes distance properties from all trainings
- ✅ Removes user location marker from map
- ✅ Deactivates distance-based filters
- ✅ Reapplies filters to update UI

### UX Features

- ✅ Confirmation dialog prevents accidental resets
- ✅ Success notification provides feedback
- ✅ Button only shown when location is active
- ✅ Modal auto-closes after successful reset
- ✅ Destructive action styling (red)
- ✅ Material Design 3 compliant
- ✅ Responsive and touch-friendly

## Accessibility

- ✅ Keyboard accessible (standard button element)
- ✅ Clear visual indicators
- ✅ Confirmation dialog for destructive action
- ✅ Semantic HTML
- ✅ Proper contrast ratios
- ✅ Touch target size compliance

## Browser Compatibility

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Uses standard Web APIs (localStorage, confirm)
- ✅ Graceful degradation for missing features

## Files Modified

1. `src/js/trainingsplaner/geolocation-manager.js` - Added resetLocation()
   method
2. `src/js/trainingsplaner.js` - Exposed resetLocation() in component
3. `index.html` - Added reset button and confirmation handler to modal

## Files Created

1. `tests/unit/geolocation-reset.test.js` - Unit tests for reset functionality
2. `tests/e2e/location-reset.spec.js` - End-to-end tests for user flow
3. `docs/LOCATION-RESET-IMPLEMENTATION.md` - This documentation

## Future Enhancements

Potential improvements for future iterations:

1. **Better Modal Dialog:** Replace native `confirm()` with custom Material
   Design 3 dialog
2. **Undo Functionality:** Add toast notification with "Undo" button after reset
3. **Animation:** Add smooth transition when button appears/disappears
4. **Analytics:** Track reset button usage for UX insights
5. **Keyboard Shortcut:** Add keyboard shortcut for power users
6. **Settings Export:** Allow users to export/import location settings

## Known Limitations

- Uses native browser `confirm()` dialog (not styled with M3)
- Cannot undo reset action (permanent)
- No warning if distance-based filters are active
- No animation on button show/hide

## Migration Notes

No migration needed - this is a new feature that doesn't affect existing
functionality or data structures.

## Conclusion

The Location Reset feature provides users with a simple, safe way to clear their
saved location data and reset distance-based filters. The implementation follows
Material Design 3 guidelines, includes comprehensive testing, and maintains
consistency with the existing codebase architecture.
