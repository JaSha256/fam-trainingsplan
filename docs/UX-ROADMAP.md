# UX Roadmap - FAM Trainingsplan

**Version:** 1.0.0 **Erstellt:** 2025-10-19 **Zeitrahmen:** Q1-Q2 2025

Diese Roadmap definiert **strategische UX-Verbesserungen**, die über Quick Wins
hinausgehen und größere Refactorings oder neue Features erfordern.

---

## 🎯 Vision Statement

**"Kombiniere v2's Einfachheit mit Current's Features für die beste
Training-Discovery-Experience in München."**

### Kernprinzipien

1. **Clarity over Complexity** - Einfachheit bevorzugen
2. **Speed over Features** - Schneller Zugang zu Zielen
3. **Progressive Enhancement** - Features schrittweise enthüllen
4. **Mobile-First Thinking** - Primär für mobile User optimieren
5. **Data-Driven Iteration** - Metriken tracken, A/B testen, iterieren

---

## 📅 Roadmap Overview

```
Q1 2025 (Jan-März)
├─ Phase 1: Core UX Optimization (4 Wochen)
├─ Phase 2: View Mode System (2 Wochen)
└─ Phase 3: Performance Optimization (2 Wochen)

Q2 2025 (Apr-Juni)
├─ Phase 4: Advanced Schnellfilter (3 Wochen)
├─ Phase 5: Personalization Engine (4 Wochen)
└─ Phase 6: Analytics & A/B Testing (3 Wochen)
```

**Total Timeframe:** ~18 Wochen (4.5 Monate)

---

## Phase 1: Core UX Optimization

**Timeline:** Wochen 1-4 (Januar 2025) **Goal:** Implementiere v2's überlegene
Filter-UX in Current Version

### 1.1 Schnellfilter System (Vollständig)

**Current State:**

- Nur "Favoriten" Schnellfilter
- Quick Wins nur "Heute" hinzugefügt

**Target State:**

```
┌─────────────────────────────────────────────┐
│ Schnellfilter                                │
├─────────────────────────────────────────────┤
│                                              │
│ Zeit-basiert:                                │
│ [Heute] [Morgen] [Wochenende]               │
│                                              │
│ Feature-basiert:                             │
│ [Probetraining] [Neu (Last 30d)] [Abends]  │
│                                              │
│ Ort-basiert:                                 │
│ [In meiner Nähe (5km)] [Zentrumsnah]       │
│                                              │
│ Persönlich:                                  │
│ [❤️ Favoriten] [📅 Heute empfohlen]        │
└─────────────────────────────────────────────┘
```

**Implementation:**

```javascript
// File: src/js/trainingsplaner/quick-filters.js (NEW FILE)

export const quickFilters = {
  // Zeit-basiert
  heute: {
    label: 'Heute',
    icon: '📅',
    filter: trainings => {
      const heute = getCurrentWeekday()
      return trainings.filter(t => t.wochentag === heute)
    }
  },

  morgen: {
    label: 'Morgen',
    icon: '🌅',
    filter: trainings => {
      const morgen = getTomorrowWeekday()
      return trainings.filter(t => t.wochentag === morgen)
    }
  },

  wochenende: {
    label: 'Wochenende',
    icon: '🎉',
    filter: trainings => {
      return trainings.filter(
        t => t.wochentag === 'Samstag' || t.wochentag === 'Sonntag'
      )
    }
  },

  // Feature-basiert
  probetraining: {
    label: 'Probetraining',
    icon: '🆓',
    filter: trainings => {
      return trainings.filter(t => t.probetraining === 'ja')
    }
  },

  neu: {
    label: 'Neu',
    icon: '✨',
    filter: (trainings, dataLoader) => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      return trainings.filter(t => {
        return t.createdAt && new Date(t.createdAt) > thirtyDaysAgo
      })
    }
  },

  abends: {
    label: 'Abends (18:00+)',
    icon: '🌙',
    filter: trainings => {
      return trainings.filter(t => {
        const startHour = parseInt(t.von.split(':')[0])
        return startHour >= 18
      })
    }
  },

  // Ort-basiert (requires Geolocation)
  nearby: {
    label: 'In meiner Nähe',
    icon: '📍',
    requiresGeo: true,
    filter: (trainings, { userLocation }) => {
      if (!userLocation) return []
      return filterTrainingsByDistance(trainings, userLocation, 5) // 5km radius
    }
  },

  zentrum: {
    label: 'Zentrumsnah',
    icon: '🏛️',
    filter: trainings => {
      // Munich center areas
      const zentrumOrte = ['LTR', 'Balanstraße' /* ... */]
      return trainings.filter(t => zentrumOrte.includes(t.ort))
    }
  },

  // Persönlich
  favorites: {
    label: 'Favoriten',
    icon: '❤️',
    filter: (trainings, { favorites }) => {
      return trainings.filter(t => favorites.includes(t.id))
    }
  },

  empfohlen: {
    label: 'Heute empfohlen',
    icon: '⭐',
    filter: (trainings, context) => {
      // Smart recommendation based on:
      // - User's favorites (similar trainings)
      // - Current weekday
      // - Popular trainings
      return getRecommendedTrainings(trainings, context)
    }
  }
}
```

**UI Updates:**

```html
<!-- Gruppierte Schnellfilter mit Kategorien -->
<div class="mb-6">
  <h3 class="text-sm font-semibold text-slate-700 mb-3">Schnellfilter</h3>

  <!-- Zeit -->
  <div class="mb-3">
    <p class="text-xs text-slate-600 mb-2">Zeit</p>
    <div class="flex flex-wrap gap-2">
      <button
        @click="applyQuickFilter('heute')"
        :class="activeQuickFilter === 'heute' ? 'active' : ''"
        class="quick-filter-btn"
      >
        📅 Heute
      </button>
      <button @click="applyQuickFilter('morgen')" class="quick-filter-btn">
        🌅 Morgen
      </button>
      <button @click="applyQuickFilter('wochenende')" class="quick-filter-btn">
        🎉 Wochenende
      </button>
    </div>
  </div>

  <!-- Features -->
  <div class="mb-3">
    <p class="text-xs text-slate-600 mb-2">Besonderheiten</p>
    <div class="flex flex-wrap gap-2">
      <button
        @click="applyQuickFilter('probetraining')"
        class="quick-filter-btn"
      >
        🆓 Probetraining
      </button>
      <button @click="applyQuickFilter('abends')" class="quick-filter-btn">
        🌙 Abends
      </button>
      <button
        x-show="hasNewTrainings"
        @click="applyQuickFilter('neu')"
        class="quick-filter-btn"
      >
        ✨ Neu
      </button>
    </div>
  </div>

  <!-- Ort (conditional on geolocation) -->
  <div x-show="userHasLocation" class="mb-3">
    <p class="text-xs text-slate-600 mb-2">Standort</p>
    <div class="flex flex-wrap gap-2">
      <button @click="applyQuickFilter('nearby')" class="quick-filter-btn">
        📍 In meiner Nähe
      </button>
      <button @click="applyQuickFilter('zentrum')" class="quick-filter-btn">
        🏛️ Zentrumsnah
      </button>
    </div>
  </div>

  <!-- Persönlich -->
  <div class="mb-3">
    <p class="text-xs text-slate-600 mb-2">Persönlich</p>
    <div class="flex flex-wrap gap-2">
      <button
        x-show="favorites.length > 0"
        @click="applyQuickFilter('favorites')"
        class="quick-filter-btn"
      >
        ❤️ Favoriten
        <span class="badge" x-text="favorites.length"></span>
      </button>
      <button @click="applyQuickFilter('empfohlen')" class="quick-filter-btn">
        ⭐ Empfohlen
      </button>
    </div>
  </div>
</div>
```

**Effort:** 🔴 High (3 Wochen) **Impact:** 🔥🔥🔥🔥🔥 MASSIVE - Addresses core
v2 superiority

---

### 1.2 Improved Card Information Architecture

**Problem:** Cards zeigen zu viel auf einmal.

**Solution:** Progressive Disclosure Pattern

**Compact Mode (Default):**

```
┌─────────────────────────┐
│ [Parkour]      [Probe] │
│                         │
│ LTR München            │
│ Montag, 18:00-20:00    │
│ 12-18 Jahre            │
│                         │
│ [Anmelden →]   [📍]    │
└─────────────────────────┘
```

**Expanded Mode (on hover/click):**

```
┌─────────────────────────────────┐
│ [Parkour]  [Probe ✓]  [❤️ Fav] │
│                                  │
│ LTR München                      │
│ Montag, 18:00-20:00 Uhr         │
│ 12-18 Jahre                      │
│                                  │
│ Trainer: Max Mustermann          │
│ 📍 2.5 km entfernt               │
│                                  │
│ ℹ️ Bitte Turnschuhe mitbringen │
│                                  │
│ [Anmelden →]  [📍 Karte]        │
└─────────────────────────────────┘
```

**Implementation:**

```html
<article
  class="training-card"
  :class="{ 'expanded': expandedCard === training.id }"
  @mouseenter="hoverCard = training.id"
  @mouseleave="hoverCard = null"
>
  <!-- Always Visible (Compact) -->
  <div class="card-compact">
    <div class="card-header">
      <span class="badge" x-text="training.training"></span>
      <span x-show="training.probetraining === 'ja'" class="badge-probe"
        >Probe</span
      >
    </div>

    <h3 x-text="training.ort"></h3>
    <p
      x-text="training.wochentag + ', ' + formatZeitrange(training.von, training.bis)"
    ></p>
    <p x-text="formatAlter(training)"></p>

    <div class="card-actions">
      <a :href="training.link" class="btn-primary">Anmelden</a>
      <button @click="mapZoom(training.id)" class="btn-icon">📍</button>
    </div>
  </div>

  <!-- Expanded Details (on hover/click) -->
  <div
    x-show="hoverCard === training.id || expandedCard === training.id"
    x-transition
    class="card-expanded"
  >
    <p x-show="training.trainer" class="text-sm">
      Trainer: <span x-text="training.trainer"></span>
    </p>
    <p x-show="training.distanceText" class="text-primary-600">
      📍 <span x-text="training.distanceText + ' entfernt'"></span>
    </p>
    <div x-show="training.anmerkung" class="card-note">
      ℹ️ <span x-text="training.anmerkung"></span>
    </div>
  </div>

  <!-- Expand Toggle (Mobile) -->
  <button
    x-show="$store.ui.isMobile"
    @click="expandedCard = expandedCard === training.id ? null : training.id"
    class="card-expand-btn"
  >
    <span x-show="expandedCard !== training.id">Mehr ↓</span>
    <span x-show="expandedCard === training.id">Weniger ↑</span>
  </button>
</article>
```

**Effort:** 🟡 Medium (1 Woche) **Impact:** 🔥🔥🔥🔥 HIGH - Faster scanning,
reduced cognitive load

---

### 1.3 Sticky Filter Summary Bar

**Problem:** Bei langem Scrollen verliert User Überblick über aktive Filter.

**Solution:** Sticky Bar unterhalb Header

```html
<!-- Sticky Filter Summary (appears on scroll) -->
<div
  x-show="scrollY > 200 && hasActiveFilters"
  x-transition
  class="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm"
>
  <div class="px-4 py-2 flex items-center justify-between">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-xs font-medium text-slate-600">Filter:</span>

      <!-- Active Filter Chips (Compact) -->
      <span
        x-show="$store.ui.filters.wochentag"
        class="chip-compact"
        x-text="$store.ui.filters.wochentag"
      ></span>
      <span
        x-show="$store.ui.filters.ort"
        class="chip-compact"
        x-text="$store.ui.filters.ort"
      ></span>
      <!-- ... more -->
    </div>

    <button
      @click="clearAllFilters()"
      class="text-xs text-primary-600 hover:underline"
    >
      Alle löschen
    </button>
  </div>
</div>
```

**Effort:** 🟢 Low (1 Tag) **Impact:** 🔥🔥🔥 MEDIUM - Better orientation

---

**Phase 1 Total Time:** 4 Wochen **Phase 1 Total Impact:** 🔥🔥🔥🔥🔥 CRITICAL -
Core UX transformation

---

## Phase 2: View Mode System

**Timeline:** Wochen 5-6 (Februar 2025) **Goal:** Flexibility für verschiedene
User-Typen

### 2.1 Compact vs. Detailed View Toggle

**Concept:** User wählt zwischen zwei Ansichtsmodi:

**Compact Mode** (v2-style):

- Kleinere Cards
- Nur Essential Info
- 3-4 Spalten (Desktop)
- Schnelles Scannen

**Detailed Mode** (Current):

- Größere Cards
- Alle Details sichtbar
- 2-3 Spalten (Desktop)
- Immersive Experience

**Implementation:**

```javascript
// Add to state
viewMode: localStorage.getItem('viewMode') || 'compact', // Default to Compact!
```

```html
<!-- View Mode Toggle in Toolbar -->
<div class="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full">
  <button
    @click="$store.ui.viewMode = 'compact'"
    :class="$store.ui.viewMode === 'compact' ? 'active' : ''"
    class="view-mode-btn"
    title="Kompaktansicht - Schnelles Scannen"
  >
    <svg><!-- Grid Icon --></svg>
    Kompakt
  </button>

  <button
    @click="$store.ui.viewMode = 'detailed'"
    :class="$store.ui.viewMode === 'detailed' ? 'active' : ''"
    class="view-mode-btn"
    title="Detailansicht - Alle Informationen"
  >
    <svg><!-- List Icon --></svg>
    Detailliert
  </button>
</div>
```

```html
<!-- Cards Grid with dynamic classes -->
<div
  class="grid gap-5"
  :class="{
       'grid-cols-1 md:grid-cols-2 xl:grid-cols-4': $store.ui.viewMode === 'compact',
       'grid-cols-1 md:grid-cols-2 xl:grid-cols-3': $store.ui.viewMode === 'detailed'
     }"
>
  <!-- Cards with conditional content based on viewMode -->
</div>
```

**Effort:** 🟡 Medium (1.5 Wochen) **Impact:** 🔥🔥🔥🔥 HIGH - Personalization,
caters to different preferences

---

### 2.2 List View Alternative

**Additional View:** Simple table/list for ultra-fast scanning

**List View:**

```
┌────────────────────────────────────────────────────────┐
│ Montag, 18:00 | Parkour | LTR | 12-18 | [Anmelden →] │
│ Montag, 19:00 | Tricking | Balanstr. | 18+ | [...] │
│ Dienstag, 16:00 | Trampolin | LTR | 6-12 | [...] │
└────────────────────────────────────────────────────────┘
```

**Effort:** 🟡 Medium (0.5 Wochen) **Impact:** 🔥🔥🔥 MEDIUM - Power user
feature

---

**Phase 2 Total Time:** 2 Wochen **Phase 2 Total Impact:** 🔥🔥🔥🔥 HIGH -
Flexibility

---

## Phase 3: Performance Optimization

**Timeline:** Wochen 7-8 (Februar 2025) **Goal:** v2-level Speed mit Current
Features

### 3.1 Lazy Loading & Code Splitting

**Current Problem:** ~125 KB gzipped loads upfront

**Solution:**

```javascript
// Dynamic Imports for Heavy Features

// 1. Lazy load Map (only when opened)
const openMapModal = async () => {
  if (!mapLoaded) {
    const { MapManager } = await import('./trainingsplaner/map-manager.js')
    mapManager = new MapManager(state, context)
    mapLoaded = true
  }
  mapManager.initializeMap()
  $store.ui.mapModalOpen = true
}

// 2. Lazy load Calendar Export (only when used)
const exportToCalendar = async trainings => {
  const { bulkAddToGoogleCalendar } = await import('./calendar-integration.js')
  await bulkAddToGoogleCalendar(trainings)
}

// 3. Lazy load PWA features (background)
setTimeout(async () => {
  await import('./pwa-register.js')
}, 3000) // After 3 seconds
```

**Bundle Splitting Strategy:**

```
Initial Load (~60 KB gzipped):
├─ Core App Logic
├─ Alpine.js
├─ Filters & State
└─ Training Cards

Lazy Loaded (~65 KB gzipped):
├─ Map (Leaflet + Clustering) - 44 KB
├─ Calendar Export - 8 KB
├─ PWA Worker - 3 KB
└─ Advanced Features - 10 KB
```

**Expected Result:**

- Initial Load: **60 KB** (52% reduction!)
- Time to Interactive: **<1 second** (vs. 2-3s)

**Effort:** 🔴 High (1.5 Wochen) **Impact:** 🔥🔥🔥🔥🔥 MASSIVE - v2-level speed

---

### 3.2 Virtual Scrolling for Long Lists

**Problem:** Rendering 100+ training cards is expensive

**Solution:** Only render visible cards + buffer

```javascript
// Use Intersection Observer for Lazy Card Rendering
<template x-for="(training, index) in virtualizedTrainings" :key="training.id">
  <article x-intersect:enter="loadCard(training)"
           x-intersect:leave="unloadCard(training)">
    <!-- Card content -->
  </article>
</template>
```

**Alternative:** Use Alpine.js `x-intersect` for progressive loading

**Effort:** 🟡 Medium (0.5 Wochen) **Impact:** 🔥🔥🔥 MEDIUM - Smoother with
many trainings

---

**Phase 3 Total Time:** 2 Wochen **Phase 3 Total Impact:** 🔥🔥🔥🔥🔥 MASSIVE -
Performance parity with v2

---

## Phase 4: Advanced Schnellfilter

**Timeline:** Wochen 9-11 (März 2025) **Goal:** Intelligent, context-aware
filtering

### 4.1 Smart "Empfohlen" Filter

**Concept:** Machine learning-style recommendations based on:

1. User's favorite trainings
2. Current day/time
3. Popular trainings (view counts)
4. Similar users' choices

**Algorithm:**

```javascript
function getRecommendedTrainings(trainings, context) {
  const { favorites, currentWeekday, currentHour, userLocation } = context

  let scores = trainings.map(training => {
    let score = 0

    // 1. Similarity to favorites
    if (favorites.length > 0) {
      const favTrainingTypes = favorites.map(f => f.training)
      if (favTrainingTypes.includes(training.training)) {
        score += 50 // Same training type
      }

      const favLocations = favorites.map(f => f.ort)
      if (favLocations.includes(training.ort)) {
        score += 30 // Same location
      }
    }

    // 2. Time relevance
    if (training.wochentag === currentWeekday) {
      score += 40 // Today's trainings
    }

    const startHour = parseInt(training.von.split(':')[0])
    const timeDiff = Math.abs(startHour - currentHour)
    if (timeDiff <= 2) {
      score += 30 // Starting soon
    }

    // 3. Proximity (if geolocation available)
    if (userLocation && training.lat && training.lng) {
      const distance = calculateDistance(userLocation, [
        training.lat,
        training.lng
      ])
      if (distance < 5) score += 20 // Within 5km
      if (distance < 2) score += 10 // Within 2km
    }

    // 4. Probetraining for new users
    if (favorites.length === 0 && training.probetraining === 'ja') {
      score += 25 // Encourage trial for new users
    }

    // 5. Popularity (view count - requires analytics)
    if (training.viewCount > 100) {
      score += 15
    }

    return { ...training, recommendationScore: score }
  })

  // Return top 10 recommendations
  return scores
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 10)
}
```

**Effort:** 🔴 High (2 Wochen) **Impact:** 🔥🔥🔥🔥 HIGH - Personalization,
helps new users

---

### 4.2 Saved Filter Combinations

**Concept:** User kann häufige Filter-Kombinationen speichern

**UI:**

```html
<div class="mb-4">
  <div class="flex items-center justify-between mb-2">
    <h4 class="text-xs font-semibold text-slate-600">Gespeicherte Filter</h4>
    <button
      @click="showSaveFilterDialog = true"
      class="text-xs text-primary-600"
    >
      + Speichern
    </button>
  </div>

  <div class="space-y-2">
    <template x-for="saved in savedFilters" :key="saved.id">
      <button
        @click="applyS savedFilter(saved)"
        class="w-full text-left px-3 py-2 bg-white rounded-lg border hover:border-primary-500"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium text-sm" x-text="saved.name"></span>
          <button
            @click.stop="deleteSavedFilter(saved.id)"
            class="text-slate-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
        <p class="text-xs text-slate-600 mt-1" x-text="saved.description"></p>
      </button>
    </template>
  </div>
</div>

<!-- Example Saved Filters: -->
<!-- "Meine Montag Trainings" - Montag + Parkour + LTR -->
<!-- "Probe Trainings in Nähe" - Probetraining + Nearby -->
<!-- "Kinder Wochenende" - Wochenende + Altersgruppe 6-12 -->
```

**Effort:** 🟡 Medium (1 Woche) **Impact:** 🔥🔥🔥 MEDIUM - Power user feature

---

**Phase 4 Total Time:** 3 Wochen **Phase 4 Total Impact:** 🔥🔥🔥🔥 HIGH -
Advanced filtering

---

## Phase 5: Personalization Engine

**Timeline:** Wochen 12-15 (April-Mai 2025) **Goal:** App lernt von
User-Verhalten

### 5.1 User Profile & Preferences

**Persistent User State:**

```javascript
const userProfile = {
  // Explicitly set by user
  preferredTrainingTypes: ['Parkour', 'Tricking'],
  preferredLocations: ['LTR'],
  ageGroup: '18+',
  preferredDays: ['Montag', 'Mittwoch'],
  preferredTimes: 'abends', // 'morgens', 'nachmittags', 'abends'

  // Implicitly learned from behavior
  viewedTrainings: [], // Track views
  clickedTrainings: [], // Track clicks on "Anmelden"
  favoriteChanges: [], // Track favorite additions/removals

  // Settings
  defaultViewMode: 'compact',
  defaultFilterSidebarOpen: true,
  enableNotifications: false,
  distanceUnit: 'km' // or 'mi'
}
```

**Onboarding Flow (First-Time Users):**

```html
<!-- Welcome Modal -->
<div x-show="isFirstVisit" class="modal">
  <h2>Willkommen beim FAM Trainingsplan!</h2>
  <p>Lass uns schnell deine Präferenzen einrichten:</p>

  <form @submit.prevent="saveProfile()">
    <!-- Step 1: Training Type -->
    <fieldset>
      <legend>Welche Trainingsarten interessieren dich?</legend>
      <label><input type="checkbox" value="Parkour" /> Parkour</label>
      <label><input type="checkbox" value="Trampolin" /> Trampolin</label>
      <label><input type="checkbox" value="Tricking" /> Tricking</label>
      <!-- ... -->
    </fieldset>

    <!-- Step 2: Age Group -->
    <fieldset>
      <legend>Für wen suchst du?</legend>
      <label
        ><input type="radio" name="age" value="kids" /> Für Kinder (6-12)</label
      >
      <label
        ><input type="radio" name="age" value="teens" /> Für Jugendliche
        (12-18)</label
      >
      <label
        ><input type="radio" name="age" value="adults" /> Für Erwachsene
        (18+)</label
      >
    </fieldset>

    <!-- Step 3: Location Preference -->
    <fieldset>
      <legend>Bevorzugte Standorte?</legend>
      <label><input type="checkbox" value="LTR" /> LTR</label>
      <label><input type="checkbox" value="Balanstraße" /> Balanstraße</label>
      <!-- ... -->
    </fieldset>

    <button type="submit">Los geht's! 🚀</button>
  </form>
</div>
```

**Smart Defaults Based on Profile:**

- Auto-apply preferred filters on load
- Show relevant Schnellfilter first
- Pre-sort results by user preferences

**Effort:** 🔴 High (3 Wochen) **Impact:** 🔥🔥🔥🔥 HIGH - Personalized
experience

---

### 5.2 Notification System

**Concept:** Notify users about:

1. New trainings matching their profile
2. Changes to favorited trainings (time, location)
3. Upcoming trainings they might be interested in

**Implementation:**

```javascript
// Use Push API + Service Worker
if ('Notification' in window && navigator.serviceWorker) {
  const permission = await Notification.requestPermission()

  if (permission === 'granted') {
    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: PUBLIC_VAPID_KEY
    })

    // Send subscription to backend
    await saveSubscription(subscription, userProfile)
  }
}
```

**Notification Types:**

```javascript
const notificationTypes = {
  newTraining: {
    title: '🆕 Neues Training verfügbar!',
    body: 'Parkour für Erwachsene, Montag 18:00 in LTR',
    actions: [
      { action: 'view', title: 'Anschauen' },
      { action: 'dismiss', title: 'Schließen' }
    ]
  },

  favoriteChange: {
    title: '⚠️ Training geändert',
    body: 'Dein favorisiertes "Parkour LTR" wurde auf Dienstag verlegt',
    actions: [
      { action: 'view', title: 'Details' },
      { action: 'dismiss', title: 'OK' }
    ]
  },

  upcomingTraining: {
    title: '📅 Training heute Abend',
    body: 'Erinnerung: Parkour um 18:00 in LTR',
    actions: [
      { action: 'view', title: 'Öffnen' },
      { action: 'snooze', title: '1h später erinnern' }
    ]
  }
}
```

**Effort:** 🔴 High (1 Woche + Backend) **Impact:** 🔥🔥🔥 MEDIUM - Engagement
booster

---

**Phase 5 Total Time:** 4 Wochen **Phase 5 Total Impact:** 🔥🔥🔥🔥 HIGH -
Retention

---

## Phase 6: Analytics & A/B Testing

**Timeline:** Wochen 16-18 (Mai-Juni 2025) **Goal:** Data-driven optimization

### 6.1 Event Tracking Implementation

**Track Critical User Actions:**

```javascript
// src/js/analytics.js

export const trackEvent = (eventName, properties = {}) => {
  // Privacy-friendly analytics (Plausible, Fathom, or custom)
  if (window.plausible) {
    window.plausible(eventName, { props: properties })
  }

  // Or Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

// Usage throughout app:

// Filter Usage
trackEvent('filter_applied', {
  filter_type: 'wochentag',
  filter_value: 'Montag',
  total_active_filters: 2
})

// Schnellfilter Usage
trackEvent('quick_filter_used', {
  filter_name: 'heute',
  result_count: 12
})

// Training View
trackEvent('training_viewed', {
  training_id: 123,
  training_type: 'Parkour',
  view_mode: 'compact'
})

// Training Click
trackEvent('training_clicked', {
  training_id: 123,
  action: 'anmelden',
  source: 'card' // or 'map'
})

// Favorite Actions
trackEvent('favorite_added', {
  training_id: 123,
  total_favorites: 5
})

// Map Usage
trackEvent('map_opened', {
  source: 'fab', // or 'sidebar', 'header'
  trainings_visible: 24
})

// Export
trackEvent('export_initiated', {
  type: 'all', // or 'favorites'
  count: 15
})

// View Mode Toggle
trackEvent('view_mode_changed', {
  from: 'compact',
  to: 'detailed'
})

// Search Usage
trackEvent('search_performed', {
  query_length: 8,
  results_count: 3
})
```

**Key Metrics to Track:**

1. **Engagement:**
   - Filter usage rate
   - Schnellfilter adoption
   - Time on site
   - Pages per session

2. **Task Success:**
   - Time to first filter
   - Time to first click
   - Training detail views
   - "Anmelden" click rate

3. **Feature Usage:**
   - Map open rate
   - Favorites usage
   - Export usage
   - Search usage

4. **Performance:**
   - Page load time
   - Time to Interactive (TTI)
   - First Contentful Paint (FCP)

**Effort:** 🟡 Medium (1 Woche) **Impact:** 🔥🔥🔥🔥🔥 CRITICAL - Enables
data-driven decisions

---

### 6.2 A/B Testing Framework

**Key Hypotheses to Test:**

#### Test 1: Filter Visibility

**Hypothesis:** Always-visible filters increase filter usage by 40%

**Variants:**

- A (Current): Filter sidebar toggleable, closed by default
- B (v2-style): Filter sidebar always open

**Success Metric:**

- Filter engagement rate
- Time to first filter application
- User satisfaction (survey)

**Duration:** 2 Wochen **Sample Size:** 1000 users per variant

---

#### Test 2: Schnellfilter Impact

**Hypothesis:** Schnellfilter reduce time-to-goal by 50%

**Variants:**

- A (Baseline): No Schnellfilter
- B (With Schnellfilter): "Heute", "Morgen", "Wochenende"

**Success Metric:**

- Time from page load to first training click
- Schnellfilter usage rate
- Task completion rate

---

#### Test 3: Card Density

**Hypothesis:** Compact cards increase scan speed by 30%

**Variants:**

- A (Detailed): Current card design
- B (Compact): Reduced information, more cards per row

**Success Metric:**

- Time to find specific training
- Training views per session
- Click-through rate

---

#### Test 4: Default View Mode

**Hypothesis:** Compact mode as default improves first-time user experience

**Variants:**

- A: Detailed mode default
- B: Compact mode default

**Success Metric:**

- Bounce rate
- Time on site (first visit)
- Return visitor rate

---

**A/B Testing Implementation:**

```javascript
// Simple A/B Test Framework
const assignVariant = testName => {
  const userId = getUserId() // Persistent user ID
  const hash = hashCode(userId + testName)
  return hash % 2 === 0 ? 'A' : 'B'
}

// Usage:
const filterVisibilityVariant = assignVariant('filter_visibility_test')

if (filterVisibilityVariant === 'B') {
  // Apply v2-style always-open sidebar
  Alpine.store('ui').filterSidebarOpen = true
}

// Track variant assignment
trackEvent('ab_test_assigned', {
  test_name: 'filter_visibility_test',
  variant: filterVisibilityVariant
})
```

**Effort:** 🟡 Medium (2 Wochen) **Impact:** 🔥🔥🔥🔥🔥 CRITICAL - Validates
assumptions

---

**Phase 6 Total Time:** 3 Wochen **Phase 6 Total Impact:** 🔥🔥🔥🔥🔥 MASSIVE -
Evidence-based optimization

---

## Success Metrics & KPIs

### Primary KPIs

| Metric                        | Current (Estimated) | Target (Post-Roadmap) | Improvement |
| ----------------------------- | ------------------- | --------------------- | ----------- |
| **Time to First Filter**      | ~10 seconds         | ~3 seconds            | 70% ⬇️      |
| **Filter Usage Rate**         | ~40%                | ~70%                  | 75% ⬆️      |
| **Time to Interactive (TTI)** | ~2.5 seconds        | ~0.8 seconds          | 68% ⬇️      |
| **Bounce Rate**               | ~35%                | ~20%                  | 43% ⬇️      |
| **Task Completion Rate**      | ~60%                | ~85%                  | 42% ⬆️      |
| **Return Visitor Rate**       | ~25%                | ~45%                  | 80% ⬆️      |
| **Mobile Engagement**         | ~50%                | ~70%                  | 40% ⬆️      |
| **"Anmelden" Click Rate**     | ~12%                | ~20%                  | 67% ⬆️      |

### Secondary KPIs

- Map Usage: 30% → 50%
- Favorites Usage: 15% → 35%
- Export Usage: 5% → 15%
- Search Usage: 20% → 40%
- Average Session Duration: 2 min → 4 min
- Pages per Session: 1.5 → 3.0

---

## Risk Mitigation

### Technical Risks

**Risk:** Performance regression with new features **Mitigation:**

- Lazy loading
- Code splitting
- Performance budgets
- Regular Lighthouse audits

**Risk:** Breaking changes affecting existing users **Mitigation:**

- Feature flags
- Gradual rollout
- A/B testing before full deployment
- Rollback plan

### UX Risks

**Risk:** Over-optimization makes UI too complex **Mitigation:**

- User testing at each phase
- Maintain "simple by default, advanced on demand" principle
- Iterate based on feedback

**Risk:** Personalization creates filter bubbles **Mitigation:**

- Always show "All Trainings" option
- Transparent about why recommendations shown
- Easy way to reset to default view

---

## Resource Requirements

### Development Team

**Phases 1-3 (8 Wochen):**

- 1 Senior Frontend Developer (Full-time)
- 1 UX Designer (Part-time, 50%)
- 1 QA Engineer (Part-time, 25%)

**Phases 4-6 (10 Wochen):**

- 1 Senior Frontend Developer (Full-time)
- 1 Backend Developer (Part-time, 50% - for notifications)
- 1 Data Analyst (Part-time, 25% - for analytics)
- 1 UX Designer (Part-time, 25%)

**Total Effort:** ~12 person-months

---

## Rollout Strategy

### Phased Deployment

**Phase 1-3: Alpha (Wochen 1-8)**

- Deploy to staging environment
- Internal testing
- Small beta group (50 users)

**Phase 4-5: Beta (Wochen 9-15)**

- Public beta (25% of users)
- A/B testing active
- Collect feedback
- Iterate rapidly

**Phase 6: GA (Wochen 16-18)**

- Full rollout to 100% users
- Monitoring & analytics
- Post-launch optimization

### Feature Flags

All new features behind flags for gradual activation:

```javascript
const features = {
  schnellfilter: true,
  viewModeToggle: true,
  lazyLoadMap: true,
  savedFilters: false, // Not ready yet
  recommendations: false,
  notifications: false
}
```

---

## Conclusion

This roadmap transforms the current feature-rich app into a
**best-of-both-worlds solution**:

✅ **v2's Simplicity** - Always-visible filters, Schnellfilter, compact cards ✅
**Current's Features** - M3 design, accessibility, favorites, map, export ✅
**New Capabilities** - Personalization, recommendations, notifications ✅
**Performance** - v2-level speed through lazy loading and optimization

**The result:** A training discovery platform that's **fast, intuitive, and
powerful** - combining the clarity that made v2 great with modern features users
expect.

**Next Steps:**

1. ✅ Approve roadmap and budget
2. ✅ Assemble development team
3. ✅ Begin Phase 1: Core UX Optimization
4. ✅ Set up analytics and A/B testing infrastructure
5. ✅ Iterate based on data

**Let's build something amazing! 🚀**
