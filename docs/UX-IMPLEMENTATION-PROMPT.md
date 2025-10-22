# UX Implementation Prompt - FAM Trainingsplan

**Version:** 1.0.0 **Erstellt:** 2025-10-19 **Rolle:** Senior Frontend Engineer
& UX Implementation Specialist **Kontext:** Nach umfassender UX/UI-Analyse
zwischen v2 und Current Version

---

## Mission Statement

You are a **Senior Frontend Engineer specializing in UX optimization and
progressive enhancement**. Your mission is to implement the findings from the
comprehensive UX/UI analysis, transforming the current FAM Trainingsplan into a
best-of-both-worlds solution that combines:

- ✅ **v2's Superior UX:** Immediate filter visibility, quick filters,
  simplicity
- ✅ **Current's Modern Features:** Material Design 3, accessibility, advanced
  features
- ✅ **Performance:** Fast initial load, lazy loading, optimized bundles
- ✅ **Flexibility:** View modes, personalization, progressive disclosure

---

## Context: Analysis Summary

### Key Findings from UX/UI Comparison

**V2 Strengths (Must Adopt):**

1. **Always-visible filters** → 0 clicks to access vs. 1-2 clicks in current
2. **Schnellfilter** ("Heute", "Morgen", "Wochenende", "Probe") → 1-click access
   to common use cases
3. **Simpler card design** → Faster scanning, lower cognitive load
4. **Smaller bundle** → Faster perceived performance (~50% smaller)
5. **Lower information density** → Essential info only, cleaner UI

**Current Strengths (Must Keep):**

1. **Material Design 3** → Professional, modern, consistent design system
2. **Accessibility** → ARIA labels, keyboard navigation, screen reader support
3. **Advanced features** → Favorites, geolocation, calendar export, search
4. **Active filter chips** → Visual feedback, individual removal
5. **Responsive mobile UX** → Drawer pattern, touch optimization

**Critical Gaps Identified:**

- ❌ Filter sidebar hidden behind toggle (desktop)
- ❌ No quick filters for common tasks
- ❌ Cards too information-dense
- ❌ Large initial bundle (125 KB gzipped)
- ❌ Features not progressively disclosed

**User Impact:**

- Time to first filter: **10s → 3s** (Target: 70% reduction)
- Filter usage rate: **40% → 70%** (Target: 75% increase)
- Time to Interactive: **2.5s → 0.8s** (Target: 68% reduction)

---

## Implementation Strategy

### Phase-Based Rollout

This implementation follows a **3-phase approach** aligned with the UX Roadmap:

```
Phase 1: Quick Wins (Week 1-2)
├─ Immediate, high-impact changes (<2h each)
├─ No major refactoring required
└─ Measurable UX improvements

Phase 2: Core UX Transformation (Week 3-6)
├─ Schnellfilter system
├─ Card information architecture
├─ Progressive disclosure
└─ Performance optimization

Phase 3: Advanced Features (Week 7-12)
├─ View mode system
├─ Personalization
├─ Analytics & A/B testing
└─ Long-term roadmap items
```

---

## Phase 1: Quick Wins Implementation

**Timeline:** 2 Wochen **Goal:** Implement all 10 Quick Wins from
QUICK-UX-WINS.md **Total Effort:** ~12 hours development + 4 hours testing

### Priority 1: Filter Discoverability (Day 1-2)

#### Task 1.1: Default Filter Sidebar OPEN on Desktop

**Current Problem:**

```javascript
// File: src/js/trainingsplaner/state.js or similar
filterSidebarOpen: false, // ❌ Hidden by default
```

**Solution Implementation:**

```javascript
// Step 1: Modify initial state
filterSidebarOpen: window.innerWidth >= 1024, // ✅ Open on desktop

// Step 2: Add localStorage persistence
const savedState = localStorage.getItem('filterSidebarOpen')
filterSidebarOpen: savedState !== null
  ? savedState === 'true'
  : window.innerWidth >= 1024,

// Step 3: Save on toggle
toggleFilterSidebar() {
  this.filterSidebarOpen = !this.filterSidebarOpen
  localStorage.setItem('filterSidebarOpen', this.filterSidebarOpen)

  // Track analytics
  trackEvent('filter_sidebar_toggled', {
    new_state: this.filterSidebarOpen ? 'open' : 'closed',
    viewport_width: window.innerWidth
  })
}
```

**Files to Modify:**

- `src/js/trainingsplaner/state.js` (or wherever Alpine store initialized)
- `index.html` (update toggle button click handlers)

**Acceptance Criteria:**

- ✅ Desktop (≥1024px): Sidebar open by default
- ✅ Mobile (<1024px): Sidebar closed (drawer mode)
- ✅ State persists across sessions
- ✅ User preference overrides default
- ✅ No console errors
- ✅ Smooth animation when toggling

**Testing Checklist:**

```markdown
- [ ] Load page on desktop → Sidebar is open
- [ ] Close sidebar → Reload page → Sidebar remains closed
- [ ] Open sidebar → Reload page → Sidebar remains open
- [ ] Clear localStorage → Reload → Default behavior (open on desktop)
- [ ] Resize to mobile → Sidebar closes automatically
- [ ] Resize to desktop → Sidebar opens automatically (if not explicitly closed)
```

**Estimated Time:** 1 hour (development) + 30 min (testing)

---

#### Task 1.2: Active Filter Count Badge

**Current Problem:** When sidebar closed, no indication of active filters.

**Solution Implementation:**

```html
<!-- File: index.html, Line ~308-319 (Desktop filter toggle button) -->

<button
  x-show="!$store.ui.filterSidebarOpen"
  @click="$store.ui.filterSidebarOpen = true"
  type="button"
  aria-label="Filter öffnen"
  data-testid="toggle-filter-open"
  title="Filter öffnen (Tastenkürzel: Ctrl+F)"
  class="hidden lg:flex md-btn-filled items-center gap-2"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M9 5l7 7-7 7"
    />
  </svg>
  Filter

  <!-- NEW: Active Filter Badge -->
  <span
    x-show="hasActiveFilters"
    x-transition
    x-text="activeFilterCount"
    class="ml-2 px-2 py-1 bg-white/90 text-primary-600 rounded-full text-xs font-bold shadow-sm"
    :aria-label="`${activeFilterCount} aktive Filter`"
  >
  </span>
</button>
```

**Add Computed Property:**

```javascript
// File: src/js/trainingsplaner.js

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
}

get hasActiveFilters() {
  return this.activeFilterCount > 0
}
```

**Acceptance Criteria:**

- ✅ Badge appears only when filters active
- ✅ Shows correct count (1-6)
- ✅ Smooth fade in/out transition
- ✅ Accessible (aria-label)
- ✅ Updates in real-time when filters change
- ✅ Visible contrast against button background

**Testing Checklist:**

```markdown
- [ ] No filters → No badge
- [ ] Add 1 filter → Badge shows "1"
- [ ] Add 3 filters → Badge shows "3"
- [ ] Remove 1 filter → Badge updates to "2"
- [ ] Remove all filters → Badge disappears
- [ ] Quick filter active → Count includes it
- [ ] Screen reader announces count
```

**Estimated Time:** 30 min (development) + 15 min (testing)

---

#### Task 1.3: "Heute" Schnellfilter Button

**Current Problem:** Most common use case ("What's today?") requires 3+ clicks.

**Solution Implementation:**

**Step 1: Add UI in Filter Sidebar**

```html
<!-- File: index.html, after Search field (Line ~196) -->

<div class="mb-6">
  <h3 class="text-sm font-semibold text-slate-700 mb-3">Schnellfilter</h3>
  <div class="flex flex-wrap gap-2">
    <!-- NEW: Heute Button -->
    <button
      @click="quickFilterHeute()"
      type="button"
      :class="{
              'bg-primary-500 text-white shadow-md': $store.ui.filters.activeQuickFilter === 'heute',
              'bg-primary-50 text-primary-700 hover:bg-primary-100': $store.ui.filters.activeQuickFilter !== 'heute'
            }"
      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
      title="Trainings die heute stattfinden"
    >
      📅 Heute
    </button>

    <!-- Existing Favoriten Button (keep as is) -->
    <button
      @click="favorites.length > 0 && quickFilterFavorites()"
      type="button"
      :disabled="favorites.length === 0"
      class="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 disabled:bg-slate-50 disabled:text-slate-400 text-yellow-700 rounded-full text-xs font-medium transition-colors"
    >
      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      Favoriten
      <span
        x-show="favorites.length > 0"
        x-text="favorites.length"
        class="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold"
      >
      </span>
    </button>
  </div>
</div>
```

**Step 2: Implement JavaScript Function**

```javascript
// File: src/js/trainingsplaner.js

quickFilterHeute() {
  // Get current weekday in German
  const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const heute = wochentage[new Date().getDay()]

  // Clear other filters (optional - for clean experience)
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

  // Track analytics
  trackEvent('quick_filter_used', {
    filter_name: 'heute',
    weekday: heute,
    result_count: this.filteredTrainings.length
  })

  // Show notification (optional)
  this.$store.ui.showNotification({
    type: 'info',
    message: `Zeige ${this.filteredTrainings.length} Trainings für ${heute}`
  })
},

// Helper: Clear quick filter
clearQuickFilter() {
  this.$store.ui.filters.activeQuickFilter = null
  this.applyFilters()
}
```

**Acceptance Criteria:**

- ✅ Button visible in sidebar
- ✅ Click filters to today's weekday
- ✅ Active state visually distinct
- ✅ Results update immediately
- ✅ Works across all days of week
- ✅ Analytics tracked
- ✅ Optional: Notification shown

**Testing Checklist:**

```markdown
- [ ] Monday: Click "Heute" → Filters to "Montag"
- [ ] Tuesday: Click "Heute" → Filters to "Dienstag"
- [ ] ... (test all 7 days)
- [ ] Click "Heute" twice → Toggle behavior or no-op
- [ ] Active state shows correctly
- [ ] Results count is accurate
- [ ] Analytics event fires
- [ ] Mobile: Works in drawer
```

**Estimated Time:** 45 min (development) + 30 min (testing)

---

### Priority 2: Visual Cleanup (Day 3-4)

#### Task 2.1: Remove Unnecessary Icons from Cards

**Current Problem:** Cards have icons before Zeit, Altersgruppe, Trainer →
visual clutter.

**Solution Implementation:**

```html
<!-- File: index.html, Training Cards (Line ~594-625) -->

<!-- BEFORE (with icons): -->
<div class="flex items-center gap-2.5 md-typescale-body-small text-slate-700">
  <svg class="w-4 h-4 text-primary-500 flex-shrink-0">...</svg>
  <!-- ❌ Remove -->
  <dd x-text="formatZeitrange(training.von, training.bis)"></dd>
</div>

<!-- AFTER (clean): -->
<div class="md-typescale-body-small text-slate-700">
  <dd x-text="formatZeitrange(training.von, training.bis)"></dd>
</div>

<!-- Apply same pattern for: -->
<!-- - Altersgruppe (remove people icon) -->
<!-- - Trainer (remove user icon) -->

<!-- KEEP Distance Icon (relevant for geolocation context): -->
<div
  x-show="training.distanceText"
  class="flex items-center gap-2.5 md-typescale-body-small text-primary-600 font-bold"
>
  <svg
    class="w-4 h-4 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
    />
  </svg>
  <dd x-text="training.distanceText + ' entfernt'"></dd>
</div>
```

**Acceptance Criteria:**

- ✅ Zeit, Altersgruppe, Trainer: No icons
- ✅ Distance: Keep icon (contextual relevance)
- ✅ Visual hierarchy maintained
- ✅ No layout shifts
- ✅ Spacing remains consistent

**Estimated Time:** 30 min

---

#### Task 2.2: Dark Mode OFF by Default

**Current Problem:** Dark mode is ON by default - many users expect light mode.

**Solution:**

```javascript
// File: src/js/trainingsplaner/state.js

// BEFORE:
darkMode: true, // ❌

// AFTER:
darkMode: localStorage.getItem('darkMode') === 'true', // ✅ Default: false
```

**Acceptance Criteria:**

- ✅ First load: Light mode
- ✅ Toggle to dark: Persists
- ✅ Reload: Dark mode maintained
- ✅ Clear localStorage: Resets to light

**Estimated Time:** 5 min

---

### Priority 3: Enhanced User Feedback (Day 5)

#### Task 3.1: Improved Empty State

**Current State:** Basic "Keine Trainings gefunden" message.

**Enhanced Implementation:**

```html
<!-- File: index.html, Line ~670-688 -->

<div x-show="!loading && !error && filteredTrainings.length === 0" class="p-6">
  <div
    class="max-w-md mx-auto text-center py-16 bg-white rounded-2xl shadow-lg"
  >
    <!-- Icon -->
    <div
      class="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center"
    >
      <svg
        class="w-10 h-10 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <!-- Headline -->
    <h3 class="text-2xl font-bold text-slate-900 mb-3">
      Keine Trainings gefunden
    </h3>

    <!-- NEW: Show Active Filters -->
    <div x-show="hasActiveFilters" class="mb-4 p-3 bg-slate-50 rounded-lg">
      <p class="text-sm text-slate-700 mb-2 font-medium">Aktive Filter:</p>
      <div class="flex flex-wrap gap-2 justify-center">
        <span
          x-show="$store.ui.filters.wochentag"
          class="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
          x-text="'Wochentag: ' + $store.ui.filters.wochentag"
        ></span>
        <span
          x-show="$store.ui.filters.ort"
          class="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
          x-text="'Ort: ' + $store.ui.filters.ort"
        ></span>
        <span
          x-show="$store.ui.filters.training"
          class="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
          x-text="'Training: ' + $store.ui.filters.training"
        ></span>
        <span
          x-show="$store.ui.filters.altersgruppe"
          class="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
          x-text="'Altersgruppe: ' + $store.ui.filters.altersgruppe"
        ></span>
      </div>
    </div>

    <!-- Contextual Message -->
    <p class="text-slate-700 mb-6">
      <span x-show="hasActiveFilters">
        Versuche einige Filter zu entfernen oder
      </span>
      <span x-show="!hasActiveFilters">
        Es wurden keine Trainings geladen. Bitte
      </span>
      überprüfe deine Einstellungen.
    </p>

    <!-- Action Buttons -->
    <div class="flex gap-3 justify-center flex-wrap">
      <!-- Reset All -->
      <button
        x-show="hasActiveFilters"
        @click="clearAllFilters()"
        type="button"
        class="md-btn-filled inline-flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Alle Trainings anzeigen
      </button>

      <!-- NEW: Quick Action - "Heute anzeigen" -->
      <button
        @click="quickFilterHeute()"
        type="button"
        class="md-btn-outlined inline-flex items-center gap-2"
      >
        📅 Trainings heute anzeigen
      </button>

      <!-- NEW: "Probetraining anzeigen" if no filters -->
      <button
        x-show="!hasActiveFilters"
        @click="quickFilterProbe()"
        type="button"
        class="md-btn-filled-tonal inline-flex items-center gap-2"
      >
        🆓 Probetraining anzeigen
      </button>
    </div>

    <!-- Help Text -->
    <p class="text-xs text-slate-500 mt-6">
      💡 Tipp: Nutze die Schnellfilter für häufige Anfragen
    </p>
  </div>
</div>
```

**Add `quickFilterProbe()` Function:**

```javascript
quickFilterProbe() {
  this.$store.ui.filters = {
    wochentag: '',
    ort: '',
    training: '',
    altersgruppe: '',
    searchTerm: '',
    activeQuickFilter: 'probe'
  }

  this.filteredTrainings = this.allTrainings.filter(t => t.probetraining === 'ja')

  trackEvent('quick_filter_used', {
    filter_name: 'probetraining',
    result_count: this.filteredTrainings.length
  })
}
```

**Acceptance Criteria:**

- ✅ Shows which filters are active
- ✅ Offers quick solutions ("Heute", "Probe")
- ✅ Contextual messaging based on state
- ✅ Clear call-to-action buttons
- ✅ Analytics tracked

**Estimated Time:** 45 min

---

## Phase 2: Core UX Transformation

**Timeline:** 4 Wochen **Goal:** Implement v2-level filter UX + performance
optimization

### Week 3-4: Extended Schnellfilter System

#### Task: Comprehensive Quick Filters

**Implementation Approach:**

**Step 1: Create Reusable Quick Filter Module**

```javascript
// File: src/js/trainingsplaner/quick-filters.js (NEW FILE)

/**
 * Quick Filter System
 * Provides 1-click access to common filter scenarios
 */

export const quickFilters = {
  // Zeit-basiert
  heute: {
    id: 'heute',
    label: 'Heute',
    icon: '📅',
    category: 'time',
    description: 'Trainings die heute stattfinden',
    apply: state => {
      const wochentage = [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag'
      ]
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
    apply: state => {
      const wochentage = [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag'
      ]
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
    apply: state => {
      return {
        customFilter: training =>
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
    apply: state => {
      return {
        customFilter: training => training.probetraining === 'ja',
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
    apply: state => {
      return {
        customFilter: training => {
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
    apply: state => {
      if (!state.userLocation) {
        throw new Error('Geolocation required')
      }

      return {
        customFilter: training => {
          if (!training.lat || !training.lng) return false
          const distance = calculateDistance(state.userLocation, [
            training.lat,
            training.lng
          ])
          return distance <= 5
        },
        activeQuickFilter: 'nearby'
      }
    }
  }
}

// Helper: Apply quick filter
export function applyQuickFilter(filterId, state) {
  const filter = quickFilters[filterId]

  if (!filter) {
    console.error(`Quick filter not found: ${filterId}`)
    return state
  }

  // Check requirements
  if (filter.requiresGeolocation && !state.userLocation) {
    return {
      error:
        'Für diesen Filter wird dein Standort benötigt. Bitte aktiviere Geolocation.'
    }
  }

  // Apply filter
  const result = filter.apply(state)

  // Track analytics
  trackEvent('quick_filter_applied', {
    filter_id: filterId,
    category: filter.category,
    has_geolocation: !!state.userLocation
  })

  return result
}

// Get filters by category
export function getQuickFiltersByCategory(category, state) {
  return Object.values(quickFilters).filter(f => {
    if (f.category !== category) return false
    if (f.requiresGeolocation && !state.userLocation) return false
    return true
  })
}
```

**Step 2: UI Components**

```html
<!-- File: index.html, Schnellfilter Section -->

<div class="mb-6">
  <h3 class="text-sm font-semibold text-slate-700 mb-3">Schnellfilter</h3>

  <!-- Zeit-basiert -->
  <div class="mb-3">
    <p class="text-xs text-slate-600 mb-2 uppercase tracking-wide">Zeit</p>
    <div class="flex flex-wrap gap-2">
      <template
        x-for="filter in getQuickFiltersByCategory('time')"
        :key="filter.id"
      >
        <button
          @click="applyQuickFilter(filter.id)"
          :class="{
                  'bg-primary-500 text-white shadow-md': $store.ui.filters.activeQuickFilter === filter.id,
                  'bg-primary-50 text-primary-700 hover:bg-primary-100': $store.ui.filters.activeQuickFilter !== filter.id
                }"
          :title="filter.description"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        >
          <span x-text="filter.icon"></span>
          <span x-text="filter.label"></span>
        </button>
      </template>
    </div>
  </div>

  <!-- Feature-basiert -->
  <div class="mb-3">
    <p class="text-xs text-slate-600 mb-2 uppercase tracking-wide">
      Besonderheiten
    </p>
    <div class="flex flex-wrap gap-2">
      <template
        x-for="filter in getQuickFiltersByCategory('feature')"
        :key="filter.id"
      >
        <button
          @click="applyQuickFilter(filter.id)"
          :class="{
                  'bg-primary-500 text-white shadow-md': $store.ui.filters.activeQuickFilter === filter.id,
                  'bg-primary-50 text-primary-700 hover:bg-primary-100': $store.ui.filters.activeQuickFilter !== filter.id
                }"
          :title="filter.description"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        >
          <span x-text="filter.icon"></span>
          <span x-text="filter.label"></span>
        </button>
      </template>
    </div>
  </div>

  <!-- Standort (conditional) -->
  <div x-show="userHasLocation" class="mb-3" x-transition>
    <p class="text-xs text-slate-600 mb-2 uppercase tracking-wide">Standort</p>
    <div class="flex flex-wrap gap-2">
      <template
        x-for="filter in getQuickFiltersByCategory('location')"
        :key="filter.id"
      >
        <button
          @click="applyQuickFilter(filter.id)"
          :class="{
                  'bg-primary-500 text-white shadow-md': $store.ui.filters.activeQuickFilter === filter.id,
                  'bg-primary-50 text-primary-700 hover:bg-primary-100': $store.ui.filters.activeQuickFilter !== filter.id
                }"
          :title="filter.description"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        >
          <span x-text="filter.icon"></span>
          <span x-text="filter.label"></span>
        </button>
      </template>
    </div>
  </div>

  <!-- Favoriten (existing, keep as is) -->
  <div class="mb-3">
    <p class="text-xs text-slate-600 mb-2 uppercase tracking-wide">
      Persönlich
    </p>
    <button
      x-show="favorites.length > 0"
      @click="quickFilterFavorites()"
      class="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium"
    >
      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      Favoriten
      <span
        x-text="favorites.length"
        class="px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs font-bold"
      ></span>
    </button>
  </div>
</div>
```

**Acceptance Criteria:**

- ✅ All quick filters functional
- ✅ Visual grouping by category
- ✅ Active state clearly indicated
- ✅ Geolocation filters only show when available
- ✅ Smooth transitions
- ✅ Analytics tracked
- ✅ Tooltip descriptions
- ✅ Responsive on mobile

**Estimated Time:** 2 Wochen (including design, implementation, testing)

---

### Week 5-6: Performance Optimization

#### Task: Lazy Loading & Code Splitting

**Goal:** Reduce initial bundle from 125 KB to ~60 KB gzipped

**Implementation:**

**Step 1: Lazy Load Map Bundle**

```javascript
// File: src/js/trainingsplaner.js

let mapLoaded = false
let mapManager = null

async function openMapModal() {
  // Show loading state
  this.$store.ui.mapLoading = true

  try {
    // Lazy load map modules only when needed
    if (!mapLoaded) {
      const [{ MapManager }, leaflet, markerCluster] = await Promise.all([
        import('./trainingsplaner/map-manager.js'),
        import('leaflet'),
        import('leaflet.markercluster')
      ])

      // Initialize map manager
      mapManager = new MapManager(this.state, this.context)
      mapLoaded = true

      console.log('✅ Map modules loaded')
    }

    // Initialize and show map
    mapManager.initializeMap()
    this.$store.ui.mapModalOpen = true
  } catch (error) {
    console.error('Map loading failed:', error)
    this.$store.ui.showNotification({
      type: 'error',
      message: 'Karte konnte nicht geladen werden. Bitte versuche es erneut.'
    })
  } finally {
    this.$store.ui.mapLoading = false
  }
}
```

**Step 2: Lazy Load Calendar Export**

```javascript
async function exportAllToCalendar() {
  if (this.filteredTrainings.length === 0) {
    this.$store.ui.showNotification({
      type: 'warning',
      message: 'Keine Trainings zum Exportieren'
    })
    return
  }

  try {
    // Lazy load calendar integration
    const { bulkAddToGoogleCalendar } = await import(
      './calendar-integration.js'
    )

    await bulkAddToGoogleCalendar(this.filteredTrainings)

    trackEvent('export_completed', {
      type: 'all',
      count: this.filteredTrainings.length
    })
  } catch (error) {
    console.error('Export failed:', error)
    this.$store.ui.showNotification({
      type: 'error',
      message: 'Export fehlgeschlagen'
    })
  }
}
```

**Step 3: Defer PWA Loading**

```javascript
// File: src/main.js

// Load PWA features after initial render (non-blocking)
if ('serviceWorker' in navigator) {
  // Wait 3 seconds to not block initial page load
  setTimeout(async () => {
    const { registerSW } = await import('virtual:pwa-register')

    registerSW({
      immediate: true,
      onNeedRefresh() {
        // Show update notification
      }
    })
  }, 3000)
}
```

**Step 4: Vite Configuration**

```javascript
// File: vite.config.js

export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core app
          'vendor-alpine': [
            'alpinejs',
            '@alpinejs/persist',
            '@alpinejs/collapse'
          ],

          // Map (lazy loaded)
          'vendor-map': ['leaflet', 'leaflet.markercluster'],

          // Utils (shared)
          'vendor-utils': ['fuse.js']

          // PWA (deferred)
          // Let Vite handle automatically
        }
      }
    },

    // Chunk size warnings
    chunkSizeWarningLimit: 500, // 500 KB uncompressed

    // Source maps (production)
    sourcemap: false // Disable for production
  }
}
```

**Expected Bundle Results:**

```
Initial Load (~60 KB gzipped):
├─ index.js (Core App)      ~25 KB
├─ vendor-alpine.js          ~22 KB
├─ vendor-utils.js           ~7 KB
├─ index.css                 ~21 KB
└─ TOTAL:                    ~75 KB (40% reduction!)

Lazy Loaded (~65 KB gzipped):
├─ vendor-map.js             ~44 KB (loads on map open)
├─ calendar-integration.js   ~8 KB (loads on export)
├─ pwa-register.js           ~3 KB (deferred)
└─ TOTAL:                    ~55 KB (loaded on demand)
```

**Acceptance Criteria:**

- ✅ Initial bundle ≤ 75 KB gzipped
- ✅ Time to Interactive < 1 second (Fast 3G)
- ✅ Map loads smoothly when opened
- ✅ No console errors
- ✅ Service worker still registers
- ✅ All features work identically

**Testing:**

```markdown
- [ ] Build production bundle
- [ ] Verify chunk sizes
- [ ] Test on throttled network (Slow 3G)
- [ ] Measure Time to Interactive (Lighthouse)
- [ ] Test map opening (first time + subsequent)
- [ ] Test calendar export
- [ ] Verify PWA still works
```

**Estimated Time:** 1 Woche

---

## Testing Strategy

### Unit Tests

**Priority Functions to Test:**

```javascript
// File: tests/unit/quick-filters.test.js

import { describe, it, expect } from 'vitest'
import {
  quickFilters,
  applyQuickFilter
} from '../../src/js/trainingsplaner/quick-filters.js'

describe('Quick Filters', () => {
  it('heute filter returns current weekday', () => {
    const state = {}
    const result = applyQuickFilter('heute', state)

    const wochentage = [
      'Sonntag',
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag'
    ]
    const expectedDay = wochentage[new Date().getDay()]

    expect(result.filters.wochentag).toBe(expectedDay)
    expect(result.activeQuickFilter).toBe('heute')
  })

  it('probetraining filter returns correct trainings', () => {
    const trainings = [
      { id: 1, probetraining: 'ja' },
      { id: 2, probetraining: 'nein' },
      { id: 3, probetraining: 'ja' }
    ]

    const state = { allTrainings: trainings }
    const result = applyQuickFilter('probetraining', state)

    const filtered = trainings.filter(result.customFilter)
    expect(filtered).toHaveLength(2)
    expect(filtered.map(t => t.id)).toEqual([1, 3])
  })

  // ... more tests
})
```

### Integration Tests

**Playwright E2E Tests:**

```javascript
// File: tests/integration/quick-filters.spec.js

import { test, expect } from '@playwright/test'

test.describe('Quick Filters', () => {
  test('clicking "Heute" filters to current weekday', async ({ page }) => {
    await page.goto('/')

    // Get current weekday
    const weekday = new Date().toLocaleDateString('de-DE', { weekday: 'long' })

    // Open filter sidebar if needed
    const filterBtn = page.locator('[data-testid="toggle-filter-open"]')
    if (await filterBtn.isVisible()) {
      await filterBtn.click()
    }

    // Click "Heute" quick filter
    await page.click('button:has-text("Heute")')

    // Wait for filter application
    await page.waitForTimeout(500)

    // Verify active filter chip shows correct weekday
    const chip = page.locator(`text=Wochentag: ${weekday}`)
    await expect(chip).toBeVisible()

    // Verify results are filtered
    const cards = page.locator('article[class*="training-card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // Verify all visible cards match the weekday
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const text = await card.textContent()
      expect(text).toContain(weekday)
    }
  })

  test('active quick filter shows visual indicator', async ({ page }) => {
    await page.goto('/')

    await page.click('button:has-text("Heute")')
    await page.waitForTimeout(300)

    // Button should have active state
    const button = page.locator('button:has-text("Heute")')
    const classes = await button.getAttribute('class')

    expect(classes).toContain('bg-primary-500')
    expect(classes).toContain('text-white')
  })

  // ... more tests
})
```

### Performance Testing

**Lighthouse CI Configuration:**

```yaml
# File: .github/workflows/lighthouse-ci.yml

name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - run: npm install
      - run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:5000/
          budgets: |
            {
              "resourceSizes": [
                {
                  "resourceType": "script",
                  "budget": 100
                },
                {
                  "resourceType": "stylesheet",
                  "budget": 30
                },
                {
                  "resourceType": "total",
                  "budget": 200
                }
              ],
              "timings": [
                {
                  "metric": "interactive",
                  "budget": 1000
                },
                {
                  "metric": "first-contentful-paint",
                  "budget": 500
                }
              ]
            }
```

---

## Rollout Plan

### Phase 1: Internal Testing (Week 1)

- ✅ Deploy to staging environment
- ✅ Internal team testing
- ✅ Fix critical bugs
- ✅ Performance validation

### Phase 2: Beta Rollout (Week 2-3)

- ✅ Deploy to 10% of users (feature flag)
- ✅ Monitor analytics:
  - Quick filter usage rate
  - Filter sidebar open/close frequency
  - Time to first interaction
  - Error rates
- ✅ Collect user feedback
- ✅ Iterate based on data

### Phase 3: Gradual Expansion (Week 4)

- ✅ 25% rollout
- ✅ 50% rollout
- ✅ 75% rollout
- ✅ Monitor KPIs continuously

### Phase 4: Full Release (Week 5)

- ✅ 100% rollout
- ✅ Documentation update
- ✅ Announcement to users
- ✅ Post-launch monitoring

---

## Success Metrics

Track these KPIs before/after implementation:

| Metric                        | Baseline | Target | Priority    |
| ----------------------------- | -------- | ------ | ----------- |
| **Time to First Filter**      | ~10s     | ~3s    | 🔥 Critical |
| **Filter Usage Rate**         | ~40%     | ~70%   | 🔥 Critical |
| **Time to Interactive (TTI)** | ~2.5s    | ~0.8s  | 🔥 Critical |
| **Bounce Rate**               | ~35%     | ~20%   | 🔥 Critical |
| **Quick Filter Usage**        | 0%       | >50%   | 🔥 Critical |
| **Task Completion Rate**      | ~60%     | ~85%   | ⚠️ High     |
| **Return Visitor Rate**       | ~25%     | ~45%   | ⚠️ High     |
| **"Anmelden" Click Rate**     | ~12%     | ~20%   | ⚠️ High     |
| **Map Usage**                 | ~30%     | ~50%   | ℹ️ Medium   |
| **Export Usage**              | ~5%      | ~15%   | ℹ️ Medium   |

**Measurement Tools:**

- Google Analytics / Plausible
- Lighthouse CI
- Real User Monitoring (RUM)
- Hotjar / Session Recording
- User Surveys (NPS, CSAT)

---

## Documentation Requirements

### Code Documentation

**Every new function must include:**

```javascript
/**
 * Apply a quick filter to the training list
 *
 * @param {string} filterId - ID of the quick filter to apply (e.g., 'heute', 'morgen')
 * @param {Object} state - Current application state
 * @param {Array} state.allTrainings - All available trainings
 * @param {Object} state.userLocation - User's geolocation (optional)
 * @returns {Object} Result object with filters or customFilter function
 * @throws {Error} If filter requires geolocation but none available
 *
 * @example
 * const result = applyQuickFilter('heute', { allTrainings: [...] })
 * // Returns: { filters: { wochentag: 'Montag' }, activeQuickFilter: 'heute' }
 */
export function applyQuickFilter(filterId, state) {
  // ...
}
```

### User-Facing Documentation

**Update README.md:**

```markdown
## Features

### Schnellfilter (Quick Filters)

Schnellzugriff auf häufige Filteroptionen:

- **Heute** - Zeigt Trainings die heute stattfinden
- **Morgen** - Zeigt Trainings für morgen
- **Wochenende** - Samstag + Sonntag Trainings
- **Probetraining** - Nur Trainings mit kostenlosem Probetraining
- **Abends** - Trainings ab 18:00 Uhr
- **In meiner Nähe** - Trainings im Umkreis von 5 km (erfordert
  Standortfreigabe)

### Keyboard Shortcuts

- `Ctrl+F` / `Cmd+F` - Filter-Sidebar öffnen/schließen
- `Ctrl+K` / `Cmd+K` - Suchfeld fokussieren
- `Esc` - Modals schließen
```

---

## Accessibility Checklist

Every feature must meet WCAG 2.1 AA standards:

- ✅ Color contrast ≥ 4.5:1 for text
- ✅ Touch targets ≥ 44x44px
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ ARIA labels for all interactive elements
- ✅ Screen reader announcements for state changes
- ✅ Skip links for keyboard users
- ✅ Form labels properly associated
- ✅ Error messages clear and accessible
- ✅ No time-based actions without pause

**Testing Tools:**

- axe DevTools
- WAVE Browser Extension
- Lighthouse Accessibility Audit
- NVDA / JAWS / VoiceOver manual testing

---

## Risk Mitigation

### Technical Risks

| Risk                   | Likelihood | Impact | Mitigation                                                 |
| ---------------------- | ---------- | ------ | ---------------------------------------------------------- |
| Breaking changes       | Medium     | High   | Feature flags, gradual rollout, automated tests            |
| Performance regression | Low        | High   | Bundle size monitoring, Lighthouse CI, performance budgets |
| Browser compatibility  | Low        | Medium | Browserslist config, polyfills, cross-browser testing      |
| Analytics data loss    | Low        | Medium | Test events in staging, validate tracking before rollout   |

### UX Risks

| Risk                               | Likelihood | Impact | Mitigation                                          |
| ---------------------------------- | ---------- | ------ | --------------------------------------------------- |
| Users don't discover quick filters | Medium     | High   | Onboarding tooltip, usage analytics, user education |
| Too many options overwhelm users   | Medium     | Medium | Progressive disclosure, grouping, user testing      |
| Filter combinations confusing      | Low        | Medium | Clear visual feedback, reset option prominent       |

---

## Conclusion

This prompt provides a comprehensive, step-by-step implementation guide for
transforming the FAM Trainingsplan from its current state into a
best-of-both-worlds solution combining v2's superior UX with modern features and
design.

**Key Success Factors:**

1. ✅ Start with Quick Wins for immediate impact
2. ✅ Prioritize filter discoverability above all
3. ✅ Implement Schnellfilter system comprehensively
4. ✅ Optimize performance through lazy loading
5. ✅ Test rigorously at every stage
6. ✅ Roll out gradually with monitoring
7. ✅ Measure impact with clear KPIs
8. ✅ Iterate based on data

**Timeline Summary:**

- Week 1-2: Quick Wins → Immediate UX improvements
- Week 3-6: Core transformation → v2-level filter UX
- Week 7-12: Advanced features → Personalization & analytics

**Expected Outcome:** A training platform that's **fast, intuitive, and
powerful** - preserving everything users love about the current version while
adopting the simplicity and clarity that made v2 superior for core tasks.

---

**Ready to implement? Start with Quick Win #1 tomorrow! 🚀**
