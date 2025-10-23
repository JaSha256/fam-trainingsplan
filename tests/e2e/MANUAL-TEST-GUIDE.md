# Manual Testing Guide - Active Filter Chips Bar (Task 15)

## Prerequisites
- Dev server running: `pnpm run dev`
- URL: http://localhost:5173/fam-trainingsplan/
- Browser: Any modern browser (Chrome, Firefox, Safari, Edge)

---

## Test Scenarios

### 1. Initial State ✓
**Steps:**
1. Open http://localhost:5173/fam-trainingsplan/
2. Look at the top of the content area (below header)

**Expected:**
- No filter chips bar visible
- Only main header and training cards visible

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 2. Single Filter Activation ✓
**Steps:**
1. In left sidebar, click "Wochentag" to expand section
2. Check the "Montag" checkbox
3. Look at top of content area

**Expected:**
- Filter chips bar appears below header (sticky)
- Shows "Aktive Filter:" label
- One chip visible: "Wochentag: Montag"
- Chip has X button (remove icon)
- Training results filter to Montag only

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 3. Chip Removal ✓
**Steps:**
1. With "Montag" filter active (from previous test)
2. Click the X button on the "Wochentag: Montag" chip

**Expected:**
- Chip disappears
- Filter chips bar hides (no active filters)
- "Montag" checkbox in sidebar is unchecked
- Training results show all days again

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 4. Multi-Value Filter - Separate Chips ✓
**Steps:**
1. Expand "Wochentag" section
2. Check "Montag"
3. Check "Mittwoch"
4. Check "Freitag"

**Expected:**
- Filter chips bar shows 3 SEPARATE chips:
  - "Wochentag: Montag"
  - "Wochentag: Mittwoch"
  - "Wochentag: Freitag"
- Each chip has its own X button
- Training results show only Mo/Mi/Fr

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 5. Display Limiting - Max 3 Chips + Overflow ✓
**Steps:**
1. Keep Mo/Mi/Fr checked from previous test
2. Also check "Dienstag"
3. Also check "Donnerstag"
4. Count visible chips

**Expected:**
- Only 3 chips visible (e.g., Montag, Dienstag, Mittwoch)
- Overflow indicator appears: "+2 weitere"
- Hovering over "+2 weitere" shows tooltip
- Training results show all 5 selected days

**Actual Result:** ___________
**Chips Shown:** ___________
**Overflow Text:** ___________
**Status:** PASS / FAIL

---

### 6. Removing Individual Chip from Overflow ✓
**Steps:**
1. With 5 filters active (from previous test)
2. Click X on one of the visible chips
3. Observe what happens

**Expected:**
- Clicked chip disappears
- One hidden chip becomes visible (total still 3 visible)
- Overflow indicator updates: "+1 weitere" (or disappears if ≤3 total)
- Corresponding checkbox in sidebar unchecks

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 7. "Alle löschen" Button - Normal State ✓
**Steps:**
1. Clear all filters (click X on all chips)
2. Check "Montag" only
3. Look at "Alle löschen" button in chips bar

**Expected:**
- Button visible but subtle styling
- Normal text color (primary-600)
- Underline on hover
- Not prominent/red

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 8. "Alle löschen" Button - Prominent State (3+ Filters) ✓
**Steps:**
1. Check "Montag", "Mittwoch", "Freitag" (3 filters)
2. Look at "Alle löschen" button

**Expected:**
- Button now PROMINENT with red styling
- Red background (bg-red-50)
- Red border (border-red-300)
- Bold text
- Stands out visually
- Tooltip: "Alle Filter zurücksetzen (3+ Filter aktiv)"

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 9. "Alle löschen" Button - Functionality ✓
**Steps:**
1. With 3+ filters active
2. Click "Alle löschen" button

**Expected:**
- ALL chips disappear immediately
- Filter chips bar hides
- All checkboxes in sidebar uncheck
- Training results show all trainings
- Button styling returns to normal (when re-filtering)

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 10. Accessibility - Touch Targets ✓
**Steps:**
1. Add 1-2 filters to show chips
2. Measure/inspect chip height
3. Try clicking chips with mouse
4. Try tapping chips on touch device (if available)

**Expected:**
- Each chip has minimum 44px height (WCAG guideline)
- Chips have sufficient width for labels + X button
- Easy to click/tap without misclicks
- Good spacing between chips

**Actual Result:** ___________
**Chip Height:** _______ px
**Status:** PASS / FAIL

---

### 11. Accessibility - ARIA & Tooltips ✓
**Steps:**
1. Add a filter (e.g., "Montag")
2. Hover over chip - wait for tooltip
3. Inspect chip element in DevTools
4. Check for aria-label attribute

**Expected:**
- Tooltip appears on hover (shows full filter info)
- Chip has `aria-label` attribute
- Label describes the filter and action (e.g., "Filter entfernen: Wochentag Montag")
- Screen reader would announce chip properly

**Actual Result:** ___________
**Tooltip Text:** ___________
**ARIA Label:** ___________
**Status:** PASS / FAIL

---

### 12. Responsive - Mobile (375px) ✓
**Steps:**
1. Resize browser to 375px width (or use DevTools device mode)
2. Add 2-3 filters

**Expected:**
- Filter chips bar visible and sticky
- Positioned below mobile header
- Chips wrap to multiple rows if needed
- "Alle löschen" button remains accessible
- Touch targets still 44px minimum
- No horizontal overflow

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 13. Responsive - Desktop (1920px) ✓
**Steps:**
1. Resize browser to 1920px width
2. Add 3-5 filters

**Expected:**
- Filter chips bar sticky at top
- Proper spacing and layout
- Chips display in single row (up to 3)
- Overflow indicator if >3 filters
- Button positioning correct
- No layout issues

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 14. Sticky Positioning - Scroll Test ✓
**Steps:**
1. Add 2-3 filters
2. Scroll down the page
3. Observe chips bar behavior

**Expected:**
- Chips bar "sticks" to top when scrolling
- Remains visible as you scroll down
- Positioned correctly (below header on desktop, different offset on mobile)
- z-index keeps it above content
- No jittering or layout shifts

**Actual Result:** ___________
**Status:** PASS / FAIL

---

### 15. Multiple Filter Categories ✓
**Steps:**
1. Check "Montag" (Wochentag)
2. Expand "Trainingsart" and check "Outdoor"
3. Check "Kids" under target group (if available)

**Expected:**
- Multiple chips from different categories
- Each shows "Category: Value" format
- Display limiting still works (max 3 shown)
- Can remove individual chips
- Results filter by ALL active filters (AND logic)

**Actual Result:** ___________
**Status:** PASS / FAIL

---

## Summary

**Total Tests:** 15
**Passed:** _____
**Failed:** _____
**Pass Rate:** _____%

### Critical Issues Found:
1. _____________________________________
2. _____________________________________
3. _____________________________________

### Minor Issues Found:
1. _____________________________________
2. _____________________________________

### Feature Works As Intended: YES / NO

---

## Notes

_________________________________________
_________________________________________
_________________________________________

**Tester Name:** _____________________
**Test Date:** _____________________
**Browser/Device:** _____________________
