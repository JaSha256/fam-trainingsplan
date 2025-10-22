# UX Implementation Prompt - For Claude Code Execution

**Version:** 2.0.0 (Claude Code Optimized) **Erstellt:** 2025-10-19 **Target
Executor:** Claude Code (AI-assisted development) **Based On:**
UX-UI-COMPARISON-REPORT.md + QUICK-UX-WINS.md + UX-ROADMAP.md

---

## Execution Context

You are **Claude Code** executing a comprehensive UX optimization
implementation. This prompt is structured for AI-assisted development with
explicit tool usage patterns, parallel execution opportunities, and testable
checkpoints.

**Your capabilities:**

- ✅ Read, Edit, Write files with precision
- ✅ Execute bash commands (git, npm, build tools)
- ✅ Track tasks with TodoWrite
- ✅ Run tests and validate changes
- ✅ Parallel tool execution for efficiency

**Critical Rules:**

- 🚫 NEVER use bash for file operations (use Read/Edit/Write)
- 🚫 NEVER batch todo completions (mark complete immediately)
- 🚫 NEVER have more than ONE task in_progress
- ✅ ALWAYS use parallel tool calls for independent operations
- ✅ ALWAYS reference files with `path:line_number` format
- ✅ ALWAYS use TodoWrite for multi-step tasks

---

## Mission Summary

**Transform FAM Trainingsplan from current state to best-of-both-worlds:**

**Adopt from v2:**

- ✅ Always-visible filters (desktop)
- ✅ Schnellfilter ("Heute", "Morgen", "Wochenende", "Probe")
- ✅ Simpler card design
- ✅ Lower cognitive load

**Keep from Current:**

- ✅ Material Design 3
- ✅ Accessibility features
- ✅ Advanced features (Favorites, Map, Export)

**Add New:**

- ✅ Performance optimization (lazy loading)
- ✅ Progressive disclosure
- ✅ Analytics tracking

---

## Implementation Phases

```
Phase 1: Quick Wins (2 weeks, 10 tasks)
├─ Priority 1: Filter Discoverability (3 tasks)
├─ Priority 2: Visual Cleanup (2 tasks)
└─ Priority 3: Enhanced Feedback (5 tasks)

Phase 2: Core UX Transformation (4 weeks)
├─ Extended Schnellfilter System
├─ Card Information Architecture
└─ Performance Optimization

Phase 3: Advanced Features (6 weeks)
├─ View Mode System
├─ Personalization
└─ Analytics & A/B Testing
```

---

## Phase 1: Quick Wins - Detailed Execution Plan

### TodoWrite Structure for Phase 1

Before starting, create todo list:

```javascript
TodoWrite({
  todos: [
    // Priority 1: Filter Discoverability
    {
      content: 'QW1: Default filter sidebar OPEN on desktop',
      status: 'pending',
      activeForm: 'Setting default filter sidebar state'
    },
    {
      content: 'QW2: Add active filter count badge to toggle button',
      status: 'pending',
      activeForm: 'Adding active filter badge'
    },
    {
      content: "QW3: Implement 'Heute' Schnellfilter button",
      status: 'pending',
      activeForm: 'Implementing Heute quick filter'
    },

    // Priority 2: Visual Cleanup
    {
      content: 'QW4: Remove unnecessary icons from training cards',
      status: 'pending',
      activeForm: 'Removing card icons'
    },
    {
      content: 'QW5: Set dark mode OFF by default',
      status: 'pending',
      activeForm: 'Setting light mode default'
    },

    // Priority 3: Enhanced Feedback
    {
      content: 'QW6: Persist filter sidebar state in localStorage',
      status: 'pending',
      activeForm: 'Adding sidebar persistence'
    },
    {
      content: 'QW7: Improve empty state with contextual help',
      status: 'pending',
      activeForm: 'Enhancing empty state'
    },
    {
      content: 'QW8: Add keyboard shortcuts (Ctrl+F for filters)',
      status: 'pending',
      activeForm: 'Adding keyboard shortcuts'
    },
    {
      content: 'QW9: Add loading skeleton for training cards',
      status: 'pending',
      activeForm: 'Implementing loading skeleton'
    },
    {
      content: 'QW10: Add scroll-to-top button',
      status: 'pending',
      activeForm: 'Adding scroll to top'
    },

    // Testing
    {
      content: 'Test all Quick Wins on desktop + mobile',
      status: 'pending',
      activeForm: 'Testing Quick Wins'
    },
    {
      content: 'Run build and verify bundle sizes',
      status: 'pending',
      activeForm: 'Verifying build'
    }
  ]
})
```

---

### Task QW1: Default Filter Sidebar OPEN (Desktop)

**Current State Analysis Required:**

```javascript
// WORKFLOW: Read → Analyze → Edit → Test

// Step 1: Read current state file
Read({
  file_path:
    '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner/state.js'
  // OR if state is in main.js:
  // file_path: "/home/pseudo/workspace/FAM/fam-trainingsplan/src/main.js"
})

// Step 2: Locate Alpine.store() initialization
// Search for: filterSidebarOpen
// Current value is likely: false or not set

// Step 3: Edit to new default
Edit({
  file_path: '...', // Use actual path from Step 1
  old_string: 'filterSidebarOpen: false,',
  new_string: 'filterSidebarOpen: window.innerWidth >= 1024,'
})

// Step 4: Test in development
Bash({
  command: 'npm run dev',
  run_in_background: true
})
// Then manually verify in browser
```

**Acceptance Criteria Checklist:**

```markdown
- [ ] Desktop (≥1024px): Sidebar opens by default
- [ ] Mobile (<1024px): Sidebar closed (drawer mode)
- [ ] No console errors
- [ ] Smooth animation when toggling
- [ ] Verified in browser DevTools (resize test)
```

**File References:**

- State initialization: `src/js/trainingsplaner/state.js:XX` (find actual line)
- Sidebar component: `index.html:153-292` (Desktop sidebar section)

**Estimated Time:** 30 minutes **Impact:** 🔥🔥🔥🔥🔥 CRITICAL - Eliminates 1
click for 80% users

---

### Task QW2: Active Filter Count Badge

**Workflow with Parallel Reads:**

```javascript
// Step 1: PARALLEL READS to understand structure
// Use SINGLE message with multiple Read calls

Read({ file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html' })
Read({
  file_path:
    '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner.js'
})

// Step 2: Analyze both files
// Find: Desktop filter toggle button (~line 308-319 in index.html)
// Find: hasActiveFilters computed property (in trainingsplaner.js)

// Step 3: Add activeFilterCount computed property
Edit({
  file_path:
    '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner.js',
  old_string: `get hasActiveFilters() {
    const filters = this.$store.ui.filters
    return (
      filters.wochentag ||
      filters.ort ||
      filters.training ||
      filters.altersgruppe ||
      filters.searchTerm
    )
  }`,
  new_string: `get hasActiveFilters() {
    const filters = this.$store.ui.filters
    return (
      filters.wochentag ||
      filters.ort ||
      filters.training ||
      filters.altersgruppe ||
      filters.searchTerm
    )
  },

  get activeFilterCount() {
    const filters = this.$store.ui.filters
    let count = 0
    if (filters.wochentag) count++
    if (filters.ort) count++
    if (filters.training) count++
    if (filters.altersgruppe) count++
    if (filters.searchTerm) count++
    if (filters.activeQuickFilter) count++
    return count
  }`
})

// Step 4: Add badge to HTML
Edit({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  old_string: `<button x-show="!$store.ui.filterSidebarOpen"
        @click="$store.ui.filterSidebarOpen = true"
        type="button"
        aria-label="Filter öffnen"
        data-testid="toggle-filter-open"
        title="Filter öffnen (Tastenkürzel: Ctrl+F)"
        class="hidden lg:flex md-btn-filled items-center gap-2">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
    Filter
</button>`,
  new_string: `<button x-show="!$store.ui.filterSidebarOpen"
        @click="$store.ui.filterSidebarOpen = true"
        type="button"
        aria-label="Filter öffnen"
        data-testid="toggle-filter-open"
        title="Filter öffnen (Tastenkürzel: Ctrl+F)"
        class="hidden lg:flex md-btn-filled items-center gap-2">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
    Filter
    <span x-show="hasActiveFilters"
          x-transition
          x-text="activeFilterCount"
          class="ml-2 px-2 py-1 bg-white/90 text-primary-600 rounded-full text-xs font-bold shadow-sm"
          :aria-label="\`\${activeFilterCount} aktive Filter\`">
    </span>
</button>`
})
```

**Testing:**

```javascript
// Quick validation test
Bash({
  command:
    "npm run build 2>&1 | rg '(error|Error|ERROR)' || echo 'Build successful'",
  description: 'Verify no build errors'
})
```

**Acceptance Criteria:**

```markdown
- [ ] Badge appears only when filters active
- [ ] Shows correct count (1-6)
- [ ] Smooth fade in/out transition
- [ ] Accessible (aria-label updates)
- [ ] Updates in real-time
- [ ] Good contrast (white on primary-600)
```

**File References:**

- Computed property: `src/js/trainingsplaner.js:XXX` (after hasActiveFilters)
- Badge HTML: `index.html:308-319` (inside toggle button)

**Estimated Time:** 45 minutes **Impact:** 🔥🔥🔥🔥 HIGH - Better filter
visibility

---

### Task QW3: "Heute" Schnellfilter Button

**Multi-Part Implementation:**

```javascript
// PART A: Add UI (HTML)
// PART B: Add Function (JS)
// Execute in SEQUENCE (B depends on A for context)

// Step 1: Read current Schnellfilter section
Read({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  offset: 195, // Around Schnellfilter section
  limit: 50
})

// Step 2: Add "Heute" button BEFORE existing Favoriten button
Edit({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  old_string: `<div class="mb-6">
    <h3 class="text-sm font-semibold text-slate-700 mb-3">Schnellfilter</h3>
    <div class="flex flex-wrap gap-2">
        <button @click="favorites.length > 0 && quickFilterFavorites()"`,
  new_string: `<div class="mb-6">
    <h3 class="text-sm font-semibold text-slate-700 mb-3">Schnellfilter</h3>
    <div class="flex flex-wrap gap-2">
        <!-- Heute Schnellfilter -->
        <button @click="quickFilterHeute()"
                type="button"
                :class="{
                  'bg-primary-500 text-white shadow-md': $store.ui.filters.activeQuickFilter === 'heute',
                  'bg-primary-50 text-primary-700 hover:bg-primary-100': $store.ui.filters.activeQuickFilter !== 'heute'
                }"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                title="Trainings die heute stattfinden">
          📅 Heute
        </button>

        <!-- Existing Favoriten Button -->
        <button @click="favorites.length > 0 && quickFilterFavorites("`
})

// Step 3: Read trainingsplaner.js to find where to add function
Read({
  file_path:
    '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner.js'
})

// Step 4: Locate quickFilterFavorites() and add quickFilterHeute() near it
// Use Grep to find the location
Grep({
  pattern: 'quickFilterFavorites',
  path: '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner.js',
  output_mode: 'content',
  '-n': true, // Show line numbers
  '-B': 5,
  '-A': 10
})

// Step 5: Add function (exact placement depends on grep result)
Edit({
  file_path:
    '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner.js',
  old_string: 'quickFilterFavorites() {',
  new_string: `quickFilterHeute() {
    // Get current weekday in German
    const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
    const heute = wochentage[new Date().getDay()]

    // Clear other filters for clean experience
    this.$store.ui.filters = {
      wochentag: heute,
      ort: '',
      training: '',
      altersgruppe: '',
      searchTerm: '',
      activeQuickFilter: 'heute'
    }

    // Apply filters
    this.applyFilters()

    // Optional: Show notification
    if (this.$store.ui.showNotification) {
      this.$store.ui.showNotification({
        type: 'info',
        message: \`Zeige \${this.filteredTrainings.length} Trainings für \${heute}\`
      })
    }
  },

  quickFilterFavorites() {`
})
```

**Add Mobile Schnellfilter (optional enhancement):**

```javascript
// Also add to mobile filter drawer (~line 755)
Read({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  offset: 755,
  limit: 30
})

// Find mobile filter section and add same button
```

**Testing Workflow:**

```javascript
// Step 1: Build
Bash({
  command: 'npm run build',
  description: 'Build project to check for errors'
})

// Step 2: Manual browser test
// - Click "Heute" button
// - Verify filters to current weekday
// - Check active state styling
// - Test on different days (change system date if needed)
```

**Acceptance Criteria:**

```markdown
- [ ] Button visible in sidebar
- [ ] Click filters to today's weekday correctly
- [ ] Active state shows (bg-primary-500)
- [ ] Results update immediately
- [ ] Works Monday through Sunday
- [ ] Mobile: Also works in drawer
- [ ] No console errors
```

**File References:**

- HTML (Desktop): `index.html:196-213` (Schnellfilter section)
- HTML (Mobile): `index.html:755-770` (Mobile drawer filters)
- Function: `src/js/trainingsplaner.js:XXX` (near quickFilterFavorites)

**Estimated Time:** 1 hour **Impact:** 🔥🔥🔥🔥🔥 MASSIVE - 66% click reduction
for most common task!

---

### Task QW4: Remove Unnecessary Card Icons

**Bulk Edit Strategy:**

```javascript
// Step 1: Read training cards section
Read({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  offset: 594,
  limit: 50
})

// Step 2: Remove Zeit icon
Edit({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  old_string: `<div class="flex items-center gap-2.5 md-typescale-body-small text-slate-700">
                <svg class="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <dt class="sr-only">Zeit:</dt>
                <dd x-text="formatZeitrange(training.von, training.bis)"></dd>
            </div>`,
  new_string: `<div class="md-typescale-body-small text-slate-700">
                <dt class="sr-only">Zeit:</dt>
                <dd x-text="formatZeitrange(training.von, training.bis)"></dd>
            </div>`
})

// Step 3: Remove Altersgruppe icon
Edit({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  old_string: `<div class="flex items-center gap-2.5 md-typescale-body-small text-slate-700">
                <svg class="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <dt class="sr-only">Altersgruppe:</dt>
                <dd x-text="formatAlter(training)"></dd>
            </div>`,
  new_string: `<div class="md-typescale-body-small text-slate-700">
                <dt class="sr-only">Altersgruppe:</dt>
                <dd x-text="formatAlter(training)"></dd>
            </div>`
})

// Step 4: Remove Trainer icon
Edit({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/index.html',
  old_string: `<div x-show="training.trainer" class="flex items-center gap-2.5 md-typescale-body-small text-slate-500">
                <svg class="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <dt class="sr-only">Trainer:</dt>
                <dd x-text="training.trainer"></dd>
            </div>`,
  new_string: `<div x-show="training.trainer" class="md-typescale-body-small text-slate-500">
                <dt class="sr-only">Trainer:</dt>
                <dd x-text="training.trainer"></dd>
            </div>`
})

// NOTE: KEEP distance icon (contextually relevant)
// Do NOT edit the distance field with location pin icon
```

**Visual Verification:**

```javascript
// After edits, rebuild and check
Bash({
  command: 'npm run build',
  description: "Verify icon removal doesn't break layout"
})

// Manual check:
// - Cards should look cleaner
// - No layout shifts
// - Spacing still consistent
// - Distance icon still present
```

**Acceptance Criteria:**

```markdown
- [ ] Zeit: No icon ✅
- [ ] Altersgruppe: No icon ✅
- [ ] Trainer: No icon ✅
- [ ] Distance: KEEP icon 📍
- [ ] Layout unchanged (no shifts)
- [ ] Spacing consistent
- [ ] Cards feel less cluttered
```

**File References:**

- Training cards: `index.html:594-625` (Card detail section)

**Estimated Time:** 30 minutes **Impact:** 🔥🔥🔥 MEDIUM - Cleaner visual,
faster scanning

---

### Task QW5: Dark Mode OFF by Default

**Simplest Quick Win:**

```javascript
// Step 1: Find dark mode initialization
Grep({
  pattern: 'darkMode.*:',
  path: '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js',
  output_mode: 'content',
  '-n': true
})

// Step 2: Read the file containing darkMode
Read({
  file_path: '...' // Path from grep result
})

// Step 3: Change default
Edit({
  file_path: '...', // Actual path
  old_string: 'darkMode: true,',
  new_string: "darkMode: localStorage.getItem('darkMode') === 'true',"
})

// Alternative if already using localStorage:
Edit({
  old_string:
    "darkMode: localStorage.getItem('darkMode') === 'true' ? true : true,",
  new_string: "darkMode: localStorage.getItem('darkMode') === 'true',"
})
```

**Acceptance Criteria:**

```markdown
- [ ] First load: Light mode
- [ ] Toggle to dark: Persists
- [ ] Reload: Dark mode maintained
- [ ] Clear localStorage: Resets to light
```

**File References:**

- State file: `src/js/trainingsplaner/state.js:XX` or `src/main.js:XX`

**Estimated Time:** 5 minutes **Impact:** 🔥🔥 LOW-MEDIUM - User expectation
alignment

---

## Parallel Execution Opportunities

**Where to use parallel tool calls:**

### Scenario 1: Multiple Independent Reads

```javascript
// GOOD: Single message, parallel reads
Read({ file_path: 'index.html' })
Read({ file_path: 'src/js/trainingsplaner.js' })
Read({ file_path: 'src/js/state.js' })
```

### Scenario 2: Build + Test

```javascript
// GOOD: Independent operations
Bash({ command: 'npm run build', description: 'Build project' })
Bash({
  command: 'npm run test:unit -- quick-filters',
  description: 'Test quick filters'
})
```

### Scenario 3: Multiple Greps

```javascript
// GOOD: Searching different patterns
Grep({ pattern: 'darkMode', path: 'src/js' })
Grep({ pattern: 'filterSidebarOpen', path: 'src/js' })
Grep({ pattern: 'quickFilter', path: 'src/js' })
```

---

## Testing Checkpoints

**After Each Quick Win:**

```markdown
1. ✅ Build Check
   - Run: `npm run build`
   - Verify: No errors, bundle size reasonable

2. ✅ Runtime Check
   - Run: `npm run dev` (background)
   - Manual: Test in browser
   - Check: Console for errors

3. ✅ Acceptance Criteria
   - Mark each criterion in checklist
   - Screenshot if UI change
   - Note any deviations

4. ✅ TodoWrite Update
   - Mark current task "completed"
   - Move to next task "in_progress"

5. ✅ Git Commit (optional, per Quick Win or batched)
   - Atomic commits preferred
   - Message format: "feat(ux): QW1 - Default filter sidebar open"
```

**After All Quick Wins (Final Validation):**

```javascript
// PARALLEL execution of all tests
Bash({
  command: 'npm run build',
  description: 'Final production build'
})

Bash({
  command: 'npm run test:unit',
  description: 'Run all unit tests'
})

// Check bundle sizes
Bash({
  command: "npm run build 2>&1 | rg 'gzip:' | rg 'index|vendor'",
  description: 'Verify bundle sizes'
})

// Lighthouse audit (if configured)
Bash({
  command: "npm run test:lighthouse || echo 'Lighthouse not configured'",
  description: 'Performance audit'
})
```

**Success Criteria:**

```markdown
- ✅ All 10 Quick Wins implemented
- ✅ Build successful (no errors)
- ✅ Unit tests pass
- ✅ Bundle size ≤ 130 KB gzipped (slight increase acceptable)
- ✅ No console errors in dev
- ✅ Manual browser test passed
- ✅ Desktop + Mobile verified
```

---

## Phase 2: Core UX Transformation

### Task: Extended Schnellfilter System

**Multi-File Implementation:**

```javascript
// Step 1: Create new quick-filters.js module
Write({
  file_path:
    '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner/quick-filters.js',
  content: `// @ts-check
/**
 * Quick Filter System
 * @file src/js/trainingsplaner/quick-filters.js
 *
 * Provides 1-click access to common filter scenarios.
 * Designed for high-frequency use cases.
 */

/**
 * Quick filter definitions
 * Each filter has: id, label, icon, category, description, apply function
 */
export const quickFilters = {
  // Zeit-basiert
  heute: {
    id: 'heute',
    label: 'Heute',
    icon: '📅',
    category: 'time',
    description: 'Trainings die heute stattfinden',
    /**
     * @param {Object} state - Application state
     * @returns {Object} Filter result
     */
    apply: (state) => {
      const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      const heute = wochentage[new Date().getDay()]

      return {
        filters: { wochentag: heute },
        activeQuickFilter: 'heute'
      }
    }
  },

  morgen: {
    id: 'morgen',
    label: 'Morgen',
    icon: '🌅',
    category: 'time',
    description: 'Trainings die morgen stattfinden',
    apply: (state) => {
      const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      const morgen = wochentage[(new Date().getDay() + 1) % 7]

      return {
        filters: { wochentag: morgen },
        activeQuickFilter: 'morgen'
      }
    }
  },

  wochenende: {
    id: 'wochenende',
    label: 'Wochenende',
    icon: '🎉',
    category: 'time',
    description: 'Trainings am Samstag oder Sonntag',
    apply: (state) => {
      return {
        customFilter: (training) =>
          training.wochentag === 'Samstag' || training.wochentag === 'Sonntag',
        activeQuickFilter: 'wochenende'
      }
    }
  },

  // Feature-basiert
  probetraining: {
    id: 'probetraining',
    label: 'Probetraining',
    icon: '🆓',
    category: 'feature',
    description: 'Trainings mit kostenlosem Probetraining',
    apply: (state) => {
      return {
        customFilter: (training) => training.probetraining === 'ja',
        activeQuickFilter: 'probetraining'
      }
    }
  },

  abends: {
    id: 'abends',
    label: 'Abends',
    icon: '🌙',
    category: 'time',
    description: 'Trainings ab 18:00 Uhr',
    apply: (state) => {
      return {
        customFilter: (training) => {
          const hour = parseInt(training.von.split(':')[0])
          return hour >= 18
        },
        activeQuickFilter: 'abends'
      }
    }
  },

  // Ort-basiert (conditional on geolocation)
  nearby: {
    id: 'nearby',
    label: 'In meiner Nähe',
    icon: '📍',
    category: 'location',
    description: 'Trainings im Umkreis von 5 km',
    requiresGeolocation: true,
    apply: (state) => {
      if (!state.userLocation) {
        throw new Error('Geolocation required')
      }

      return {
        customFilter: (training) => {
          if (!training.lat || !training.lng) return false

          // Use map-utils calculateDistance
          const distance = state.calculateDistance(
            state.userLocation,
            [training.lat, training.lng]
          )
          return distance <= 5
        },
        activeQuickFilter: 'nearby'
      }
    }
  }
}

/**
 * Apply a quick filter
 * @param {string} filterId - Filter ID to apply
 * @param {Object} state - Current application state
 * @returns {Object} Filter result or error
 */
export function applyQuickFilter(filterId, state) {
  const filter = quickFilters[filterId]

  if (!filter) {
    console.error(\`Quick filter not found: \${filterId}\`)
    return { error: 'Filter not found' }
  }

  // Check geolocation requirement
  if (filter.requiresGeolocation && !state.userLocation) {
    return {
      error: 'Für diesen Filter wird dein Standort benötigt. Bitte aktiviere Geolocation.'
    }
  }

  // Apply filter
  try {
    const result = filter.apply(state)

    // Track analytics if available
    if (window.trackEvent) {
      window.trackEvent('quick_filter_applied', {
        filter_id: filterId,
        category: filter.category,
        has_geolocation: !!state.userLocation
      })
    }

    return result

  } catch (error) {
    console.error('Quick filter error:', error)
    return { error: error.message }
  }
}

/**
 * Get filters by category
 * @param {string} category - Category to filter by
 * @param {Object} state - Current state (for conditional filters)
 * @returns {Array} Filters in category
 */
export function getQuickFiltersByCategory(category, state = {}) {
  return Object.values(quickFilters).filter(f => {
    if (f.category !== category) return false
    if (f.requiresGeolocation && !state.userLocation) return false
    return true
  })
}
`
})

// Step 2: Import in main trainingsplaner.js
// (Use Edit to add import at top of file)
// (Use Edit to add methods that use the module)

// Step 3: Update HTML to use new system
// (Create UI components with x-for loops over categories)

// Step 4: Write unit tests
// (Test each filter function)

// Step 5: Write integration tests
// (Test UI interactions)
```

**This is a larger task - break into subtasks with TodoWrite!**

---

## Performance Optimization: Lazy Loading

**Key Strategy: Dynamic Imports**

```javascript
// Example: Lazy load map bundle

// Step 1: Modify map opening function
Edit({
  file_path:
    '/home/pseudo/workspace/FAM/fam-trainingsplan/src/js/trainingsplaner.js',
  old_string: `async openMapModal() {
  this.mapManager.initializeMap()
  this.$store.ui.mapModalOpen = true
}`,
  new_string: `async openMapModal() {
  // Show loading state
  this.$store.ui.mapLoading = true

  try {
    // Lazy load map modules only when needed
    if (!window.__mapLoaded) {
      const [
        { MapManager },
        leaflet,
        markerCluster
      ] = await Promise.all([
        import('./trainingsplaner/map-manager.js'),
        import('leaflet'),
        import('leaflet.markercluster')
      ])

      // Initialize map manager
      this.mapManager = new MapManager(this.state, this.context)
      window.__mapLoaded = true

      console.log('✅ Map modules loaded (~44 KB)')
    }

    // Initialize and show map
    this.mapManager.initializeMap()
    this.$store.ui.mapModalOpen = true

  } catch (error) {
    console.error('Map loading failed:', error)
    this.$store.ui.showNotification({
      type: 'error',
      message: 'Karte konnte nicht geladen werden'
    })
  } finally {
    this.$store.ui.mapLoading = false
  }
}`
})

// Step 2: Update Vite config for code splitting
Edit({
  file_path: '/home/pseudo/workspace/FAM/fam-trainingsplan/vite.config.js',
  old_string: '// Vite configuration',
  new_string: `// Vite configuration with manual chunks

build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-alpine': ['alpinejs', '@alpinejs/persist', '@alpinejs/collapse'],
        'vendor-map': ['leaflet', 'leaflet.markercluster'],
        'vendor-utils': ['fuse.js']
      }
    }
  },
  chunkSizeWarningLimit: 500
}
`
})

// Step 3: Measure impact
Bash({
  command: "npm run build 2>&1 | rg 'gzip:' | rg -v node_modules",
  description: 'Check new bundle sizes after lazy loading'
})

// Expected: Initial load ~60-75 KB, Map ~44 KB (lazy)
```

---

## Error Handling Patterns

**Standard Error Handling for All Tasks:**

```javascript
// Pattern 1: File not found
try {
  Read({ file_path: '/path/to/file.js' })
} catch (error) {
  // Fallback: Search for file
  Glob({ pattern: '**/file.js' })
}

// Pattern 2: Edit fails (old_string not found)
// Solution: Read again, find exact string, re-try Edit with correct string

// Pattern 3: Build fails
Bash({ command: 'npm run build' })
// If errors: Read error output, identify issue, fix, retry

// Pattern 4: Test fails
// Read test file, understand failure, fix code, re-run test
```

---

## Success Metrics Tracking

**Implement Analytics Events:**

```javascript
// Add to each Quick Win implementation
function trackQuickWinUsage(winId, details = {}) {
  if (window.plausible) {
    window.plausible('quick_win_used', {
      props: {
        win_id: winId,
        ...details
      }
    })
  }
}

// Example usage
trackQuickWinUsage('heute_filter', {
  day: 'Montag',
  results: 12
})
```

**Measure Before/After:**

- Time to first filter: Use `performance.mark()` + `performance.measure()`
- Filter usage rate: Track filter application events
- Click counts: Track all user interactions

---

## Final Deliverables Checklist

**Phase 1 Complete when:**

```markdown
- ✅ All 10 Quick Wins implemented
- ✅ TodoWrite tasks all "completed"
- ✅ Build successful (production)
- ✅ Unit tests written + passing
- ✅ Integration tests written + passing
- ✅ Bundle size verified (≤ 130 KB gzipped)
- ✅ Lighthouse audit passed (score ≥ 90)
- ✅ Accessibility audit passed (no violations)
- ✅ Manual testing completed:
  - ✅ Desktop Chrome
  - ✅ Desktop Firefox
  - ✅ Mobile Safari (iOS)
  - ✅ Mobile Chrome (Android)
- ✅ Analytics events firing correctly
- ✅ Git commits created (atomic or batched)
- ✅ Documentation updated (CHANGELOG, README if needed)
- ✅ Ready for beta deployment
```

---

## Workflow Summary

**Standard Task Execution Pattern:**

```
1. TodoWrite: Mark task "in_progress"
2. Read: Understand current state (parallel reads if multiple files)
3. Grep: Locate specific code patterns (if needed)
4. Edit: Make changes (sequential if dependent)
5. Bash: Build + verify
6. Test: Manual + automated
7. TodoWrite: Mark task "completed"
8. Git: Commit (optional)
9. Move to next task
```

**Communication Pattern:**

```
- Output progress updates as text
- Reference files as `path:line_number`
- Mark todos immediately when complete
- Report errors clearly with context
- Ask user only if truly blocked
```

---

## Ready to Execute?

This prompt is now **optimized for Claude Code execution** with:

✅ Explicit tool usage workflows ✅ TodoWrite integration throughout ✅ Parallel
execution opportunities marked ✅ File reference format (`path:line`) ✅
Testable checkpoints ✅ Error handling patterns ✅ Clear acceptance criteria ✅
No human-centric fluff

**Start with:** TodoWrite to create Phase 1 task list, then execute QW1-QW10
sequentially.

**Expected Duration:** ~12 hours development + 4 hours testing = **2 days of
focused work**

**Expected Impact:**

- 🔥 70% reduction in time to first filter
- 🔥 75% increase in filter usage
- 🔥 40% reduction in bundle size (initial load)
- 🔥 Massive UX improvement

**Let's build! 🚀**
