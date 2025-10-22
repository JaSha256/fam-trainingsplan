# 🎨 UI/UX Design Meisterwerk - Wissenschaftlich fundierte Optimierung

## 🎯 Mission Statement

Transformiere den FAM Trainingsplan in ein Design-Meisterwerk durch die
Integration modernster UX-Wissenschaft, Material Design 3 Prinzipien und
bewährter Best Practices für Mobile & Desktop.

---

## 🚨 KRITISCHE UI-ANFORDERUNGEN (Höchste Priorität!)

### **Content-First Prinzip**

**"Der Inhalt ist König - UI-Elemente dienen nur der Navigation"**

Alle UI-Verbesserungen MÜSSEN folgende Kernregeln befolgen:

#### 1. **Karte ist eigene View (nicht Modal/Popout)**

```markdown
AKTUELL (FALSCH):

- Karte öffnet als Modal-Overlay
- Verdeckt gesamten Content
- Nimmt Fokus weg von Trainings

ZIEL (RICHTIG):

- Karte ist gleichwertige View wie Liste
- Tabs/Segmente: [Liste] [Karte] [Favoriten]
- Beide Views nutzen selbe Filter
- Nahtloser Wechsel ohne Unterbrechung

IMPLEMENTIERUNG: Desktop: ┌──────────┬─────────────────────────────────┐ │
Filter │ View Switcher: [Liste] [Karte] │ │ (Sticky) │ │ │ │ Content (Liste ODER
Karte) │ │ Sidebar │ (Scrollable) │ │ │ │ │ (Fixed) │ │
└──────────┴─────────────────────────────────┘

Mobile: ┌─────────────────────────────────────────┐ │ Bottom Nav: [Liste]
[Karte] [Favoriten] │ │ ────────────────────────────────────── │ │ Content
(Fullscreen) │ │ │ │ [Filter FAB ↓ - öffnet Bottom Sheet] │
└─────────────────────────────────────────┘
```

#### 2. **Filter Sidebar - Immer zugänglich & Sticky**

```markdown
PROBLEM: ✗ Desktop: Filter-Button verschwindet (Toggle in Header) ✗ Sidebar
scrollt mit Content (verliert Kontext) ✗ Kein visueller Hinweis auf aktive
Filter ✗ Kann nur 1 Filter pro Kategorie anwenden

LÖSUNG: ✓ Filter-Sidebar IMMER sichtbar (Desktop ≥1024px) ✓ Sidebar ist
position: sticky (scrollt NICHT mit) ✓ Toggle-Button in Sidebar selbst
(Collapse/Expand Icon) ✓ Aktive Filter mit farbigem Badge + Count

LAYOUT (Desktop): ┌────────────────┬────────────────────────────┐ │ 🔽 FILTER │
📍 TRAININGSPLAN │ ← Sticky Header │ ──────────── │ ────────────────────── │ │ │
│ │ ✓ Montag │ Training Cards / Karte │ │ ✓ Probetr. │ (Scrollable Content) │ │
□ LTR │ │ │ │ │ │ [2 aktiv] │ ↓ Scroll │ │ [Zurückset.] │ ↓ Content │ │ │ ↓
Weiter │ │ (Sticky!) │ │ └────────────────┴────────────────────────────┘ ↑ ↑
Fixed Width Flexible Content (280px) (Rest of Viewport)
```

#### 3. **Multi-Filter System - Kombinierbar**

```markdown
AKTUELL (Limitation):

- Nur 1 Wochentag ODER 1 Ort ODER 1 Training
- Schnellfilter überschreiben normale Filter

ZIEL (Flexibel):

- Mehrere Wochentage: Montag + Mittwoch + Freitag ✓
- Mehrere Trainingsarten: Parkour + Tricking ✓
- Kombinationen: Probetraining + Montag + LTR ✓
- AND-Verknüpfung: Alle Bedingungen müssen erfüllt sein

BEISPIEL Use-Case: User will: "Alle Probetrainings am Montag oder Mittwoch in
LTR" Filter: ✓ Probetraining: Ja ✓ Wochentag: Montag, Mittwoch ✓ Ort: LTR →
Ergebnis: Nur Trainings die ALLE 3 Bedingungen erfüllen

FILTER UI: ┌──────────────────────────────────┐ │ 🔽 FILTER (3 aktiv) │ │
─────────────────────────────── │ │ │ │ Wochentag: │ │ ☑ Montag ☑ Mittwoch │ │
☐ Dienstag ☐ Donnerstag │ │ ☐ Freitag ☐ Samstag │ │ ☐ Sonntag │ │ │ │
Trainingsart: │ │ ☑ Parkour ☐ Trampolin │ │ ☑ Tricking ☐ Movement │ │ │ │
Besonderheiten: │ │ ☑ Probetraining │ │ ☐ Neu (30 Tage) │ │ │ │ [Alle
zurücksetzen] │ └──────────────────────────────────┘
```

#### 4. **Schnellfilter - Prominent platziert**

```markdown
AKTUELL: ✗ Schnellfilter fehlen komplett ✗ Waren in Quick Wins implementiert,
jetzt weg

ZIEL: ✓ Schnellfilter OBERHALB normaler Filter ✓ Horizontal scrollbar (mobile) ✓
Sticky beim Scrollen ✓ Kombinierbar mit normalen Filtern

SCHNELLFILTER DESIGN: ┌─────────────────────────────────────────┐ │ ⚡
SCHNELLFILTER │ │ ─────────────────────────────────────── │ │ │ │ Zeit: │ │ [📅
Heute] [🌅 Morgen] [🎉 Wochenende] │ │ │ │ Besonderheiten: │ │ [🆓
Probetraining] [✨ Neu] [🌙 Abends]│ │ │ │ Persönlich: │ │ [❤️ Favoriten (5)]
[⭐ Empfohlen] │ │ ─────────────────────────────────────── │ │ │ │ 🎯 ERWEITERTE
FILTER │ │ [siehe oben: Wochentag, Training, etc.] │
└─────────────────────────────────────────┘

VERHALTEN:

- Schnellfilter "Heute" → Setzt Wochentag-Checkbox
- Zusätzlich "Probetraining" → Kombiniert beide
- "Zurücksetzen" → Löscht alle (Schnell + Normal)
```

#### 5. **Aktive Filter - Kompakte Anzeige**

```markdown
PROBLEM: ✗ Aktive Filter schwer erkennbar ✗ Nehmen zu viel Platz weg ✗ Keine
schnelle Übersicht

LÖSUNG - Sticky Filter Chips: ┌─────────────────────────────────────────┐ │ 📍
TRAININGSPLAN [🔍 Such] │ ← Header │ ─────────────────────────────────────── │ │
Aktiv: [Montag ×] [Probetraining ×] │ ← Sticky Chip Bar │ [3 Trainings gefunden]
│ │ ─────────────────────────────────────── │ │ │ │ Training Cards / Karte
Content │ │ (Scrollable) │ └─────────────────────────────────────────┘

CHIPS SPECS:

- Max. 3 Chips sichtbar, Rest "+2 weitere"
- Click auf Chip → Entfernt diesen Filter
- Click auf "+2 weitere" → Zeigt alle
- Immer sichtbar beim Scrollen (sticky)
- Kompakte Höhe: 40px total
```

#### 6. **Content-Maximierung - UI-Minimierung**

```markdown
PRINZIP: "80% Content, 20% UI"

VIEWPORT ALLOCATION: Desktop (1920px):
┌──────────┬───────────────────────────────┐ │ Filter │ Content │ │ 280px │
1640px (85%) │ │ (15%) │ │ └──────────┴───────────────────────────────┘

Mobile (375px): ┌─────────────────────────────────────────┐ │ Header: 64px (17%)
│ ├─────────────────────────────────────────┤ │ │ │ Content: 100% Width │ │
100% - 64px - 56px (73%) │ │ │ ├─────────────────────────────────────────┤ │
Bottom Nav: 56px (15%) │ └─────────────────────────────────────────┘

HEADER REDUCTION: Before: ┌─────────────────────────────────────────┐ │ Logo |
Title | Actions | Settings (80px)│

After: ┌─────────────────────────────────────────┐ │ Title | [View: Liste]
[Filter ↓] (48px)│
```

---

### **Zusammenfassung der Kern-Anforderungen:**

| Anforderung               | Aktuell             | Ziel                         |
| ------------------------- | ------------------- | ---------------------------- |
| **Karten-View**           | Modal/Popout        | Eigene View mit Tab          |
| **Filter Sidebar**        | Toggle, scrollt mit | Immer sichtbar, sticky       |
| **Multi-Filter**          | Nur 1 pro Kategorie | Kombinierbar (Checkboxen)    |
| **Schnellfilter**         | Verloren            | Wiederhergestellt, prominent |
| **Aktive Filter**         | Unklare Anzeige     | Sticky Chips, kompakt        |
| **Content-Anteil**        | ~60% Viewport       | ~80% Viewport                |
| **Desktop Filter-Button** | Verschwindet        | Immer in Sidebar             |

---

## 📊 Aktueller Tech-Stack (Voll ausreizen!)

### Frontend Framework

- **Alpine.js 3.x** - Reaktives State Management
- **Tailwind CSS 3.x** - Utility-First Styling
- **Material Design 3** - Design System (vollständig implementiert in
  `src/styles/m3-components.css`)
- **Leaflet.js 1.9.4** - Interaktive Karten mit Clustering
- **Vite 7.x** - Build-Tool mit PWA Support

### Verfügbare Features

- ✅ Dark Mode (vollständig implementiert)
- ✅ View Modes: Kompakt/Detailliert/Liste (implementiert)
- ✅ M3 Components: Buttons, Cards, Switch, Typography, State Layers
- ✅ Favoriten-System mit LocalStorage
- ✅ Standort-basierte Entfernungsberechnung
- ✅ Quick Filters (Heute, Favoriten, etc.)
- ✅ Responsive Design (Mobile-First)
- ✅ PWA mit Service Worker
- ✅ Geolocation API Integration

---

## 🎯 AUFGABE 0: KRITISCHE UI-REFACTORING (SOFORT UMSETZEN!)

**Priorität:** 🔴🔴🔴 KRITISCH - Muss VOR allen anderen Aufgaben implementiert
werden!

Diese Aufgabe implementiert alle 6 kritischen UI-Anforderungen aus der obigen
Sektion.

---

### Teil 1: Karte als eigene View (nicht Modal)

**ENTFERNEN:**

```html
<!-- DIESE MAP MODAL LÖSCHEN -->
<div x-show="$store.ui.mapModalOpen" class="fixed inset-0 bg-black/80 z-50">
  <!-- ... gesamtes Map Modal ... -->
</div>
```

**HINZUFÜGEN:**

```html
<!-- View Switcher in Header -->
<div class="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
  <button
    @click="$store.ui.activeView = 'list'"
    :class="$store.ui.activeView === 'list' ? 'bg-white shadow-sm' : ''"
    class="px-3 py-2 rounded-md text-sm font-medium transition-all"
  >
    <svg class="w-4 h-4"><!-- List Icon --></svg>
    <span class="hidden md:inline ml-1">Liste</span>
  </button>

  <button
    @click="$store.ui.activeView = 'map'"
    :class="$store.ui.activeView === 'map' ? 'bg-white shadow-sm' : ''"
    class="px-3 py-2 rounded-md text-sm font-medium transition-all"
  >
    <svg class="w-4 h-4"><!-- Map Icon --></svg>
    <span class="hidden md:inline ml-1">Karte</span>
  </button>

  <button
    @click="$store.ui.activeView = 'favorites'"
    :class="$store.ui.activeView === 'favorites' ? 'bg-white shadow-sm' : ''"
    class="px-3 py-2 rounded-md text-sm font-medium transition-all"
  >
    <svg class="w-4 h-4"><!-- Heart Icon --></svg>
    <span class="hidden md:inline ml-1">Favoriten</span>
  </button>
</div>

<!-- Content Views -->
<main class="flex-1">
  <!-- Liste View -->
  <div x-show="$store.ui.activeView === 'list'" class="p-6">
    <!-- Existing training cards grid -->
  </div>

  <!-- Karte View -->
  <div x-show="$store.ui.activeView === 'map'" class="h-[calc(100vh-64px)]">
    <div id="map-container" class="w-full h-full"></div>
  </div>

  <!-- Favoriten View -->
  <div x-show="$store.ui.activeView === 'favorites'" class="p-6">
    <!-- Filtered by favorites -->
  </div>
</main>
```

**Alpine Store Update:**

```javascript
// In main.js
Alpine.store('ui', {
  activeView: Alpine.$persist('list').as('activeView') // 'list' | 'map' | 'favorites'
  // ... rest
})
```

---

### Teil 2: Sticky Filter Sidebar (Desktop)

**AKTUELLES LAYOUT ÄNDERN:**

```html
<!-- VON (Collapsible Sidebar): -->
<aside x-show="$store.ui.filterSidebarOpen" x-collapse>
  <!-- Filter Content -->
</aside>

<!-- ZU (Always Visible + Sticky): -->
<aside
  class="hidden lg:block w-80 bg-slate-200 border-r border-slate-300
              h-screen sticky top-0 overflow-y-auto"
>
  <!-- Collapse Button (INNEN in Sidebar, nicht außen) -->
  <div class="flex items-center justify-between p-4">
    <h2 class="text-xl font-bold">Filter</h2>
    <button
      @click="$store.ui.filterSidebarCollapsed = !$store.ui.filterSidebarCollapsed"
      class="p-2 hover:bg-slate-300 rounded-lg"
    >
      <svg x-show="!$store.ui.filterSidebarCollapsed">
        <!-- Collapse Icon -->
      </svg>
      <svg x-show="$store.ui.filterSidebarCollapsed"><!-- Expand Icon --></svg>
    </button>
  </div>

  <!-- Filter Content (Show/Hide based on collapsed state) -->
  <div x-show="!$store.ui.filterSidebarCollapsed" x-collapse>
    <!-- Schnellfilter -->
    <div class="px-4 pb-4">
      <h3 class="text-xs font-semibold text-slate-600 mb-3 uppercase">
        ⚡ Schnellfilter
      </h3>
      <!-- Quick Filter Chips -->
    </div>

    <!-- Erweiterte Filter -->
    <div class="px-4 space-y-4">
      <!-- Checkboxes für Multi-Select -->
    </div>
  </div>

  <!-- Active Filter Summary (ALWAYS visible, even when collapsed) -->
  <div class="p-4 border-t border-slate-300 bg-slate-100">
    <div class="text-xs font-medium text-slate-600">
      <span x-show="activeFilterCount > 0">
        <span x-text="activeFilterCount"></span> Filter aktiv
      </span>
      <span x-show="activeFilterCount === 0"> Keine Filter </span>
    </div>
    <button
      x-show="activeFilterCount > 0"
      @click="clearAllFilters()"
      class="mt-2 w-full text-xs text-primary-600 hover:underline"
    >
      Alle zurücksetzen
    </button>
  </div>
</aside>
```

**CSS für Sticky Sidebar:**

```css
/* Sidebar sticky positioning */
aside.filter-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  /* Smooth scrolling */
  scroll-behavior: smooth;
}

/* Custom scrollbar */
aside.filter-sidebar::-webkit-scrollbar {
  width: 8px;
}

aside.filter-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

aside.filter-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
```

---

### Teil 3: Multi-Filter System (Checkboxen statt Dropdowns)

**ERSETZE SELECT-DROPDOWNS:**

```html
<!-- ALT (Single Select): -->
<select x-model="$store.ui.filters.wochentag">
  <option value="">Alle Tage</option>
  <option value="Montag">Montag</option>
  <!-- ... -->
</select>

<!-- NEU (Multi Select Checkboxen): -->
<fieldset class="space-y-2">
  <legend class="text-sm font-semibold text-slate-700 mb-2">Wochentag</legend>

  <template x-for="tag in wochentage" :key="tag">
    <label
      class="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
    >
      <input
        type="checkbox"
        :value="tag"
        x-model="$store.ui.filters.wochentage"
        @change="applyFilters()"
        class="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
      />
      <span class="text-sm" x-text="tag"></span>
    </label>
  </template>
</fieldset>
```

**Alpine Store Update (Arrays statt Strings):**

```javascript
// In main.js
Alpine.store('ui', {
  filters: Alpine.$persist({
    wochentage: [], // Array: ['Montag', 'Mittwoch']
    orte: [], // Array: ['LTR', 'Balanstraße']
    trainingsarten: [], // Array: ['Parkour', 'Tricking']
    altersgruppen: [], // Array
    probetraining: false, // Boolean
    searchTerm: ''
  }).as('trainingFilters')
  // ...
})
```

**Filter Engine Update:**

```javascript
// In filter-engine.js
applyFilters() {
  let filtered = this.state.allTrainings

  // Multi-Wochentag Filter (OR-Verknüpfung innerhalb, AND zwischen Kategorien)
  if (this.alpineContext.$store.ui.filters.wochentage.length > 0) {
    filtered = filtered.filter(t =>
      this.alpineContext.$store.ui.filters.wochentage.includes(t.wochentag)
    )
  }

  // Multi-Ort Filter
  if (this.alpineContext.$store.ui.filters.orte.length > 0) {
    filtered = filtered.filter(t =>
      this.alpineContext.$store.ui.filters.orte.includes(t.ort)
    )
  }

  // Multi-Training Filter
  if (this.alpineContext.$store.ui.filters.trainingsarten.length > 0) {
    filtered = filtered.filter(t =>
      this.alpineContext.$store.ui.filters.trainingsarten.includes(t.training)
    )
  }

  // Probetraining Filter
  if (this.alpineContext.$store.ui.filters.probetraining) {
    filtered = filtered.filter(t => t.probetraining === 'ja')
  }

  this.state.filteredTrainings = filtered
}
```

---

### Teil 4: Schnellfilter wiederherstellen

**WICHTIG:** Diese waren in `src/js/trainingsplaner/quick-filters.js` definiert!

```javascript
// In quick-filters.js (bereits vorhanden, muss reaktiviert werden)
export const QUICK_FILTERS = {
  heute: {
    label: '📅 Heute',
    category: 'zeit',
    apply: (filters, context) => {
      const heute = [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag'
      ][new Date().getDay()]

      // Add to wochentage array if not already there
      if (!filters.wochentage.includes(heute)) {
        filters.wochentage.push(heute)
      }
    }
  },

  probetraining: {
    label: '🆓 Probetraining',
    category: 'feature',
    apply: (filters, context) => {
      filters.probetraining = true
    }
  },

  favoriten: {
    label: '❤️ Favoriten',
    category: 'personal',
    apply: (filters, context) => {
      // Filter to only show favorites
      return context.allTrainings.filter(t => context.favorites.includes(t.id))
    }
  }

  // ... weitere Quick Filters
}
```

**Schnellfilter UI:**

```html
<div class="px-4 pb-4 border-b border-slate-300">
  <h3 class="text-xs font-semibold text-slate-600 mb-3 uppercase">
    ⚡ Schnellfilter
  </h3>

  <!-- Zeit -->
  <div class="mb-3">
    <p class="text-xs text-slate-500 mb-1.5">Zeit</p>
    <div class="flex flex-wrap gap-2">
      <button
        @click="applyQuickFilter('heute')"
        :class="quickFilterActive('heute') ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'"
        class="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-50 transition-colors"
      >
        📅 Heute
      </button>
      <button
        @click="applyQuickFilter('morgen')"
        class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-primary-50"
      >
        🌅 Morgen
      </button>
      <button
        @click="applyQuickFilter('wochenende')"
        class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-primary-50"
      >
        🎉 Wochenende
      </button>
    </div>
  </div>

  <!-- Besonderheiten -->
  <div class="mb-3">
    <p class="text-xs text-slate-500 mb-1.5">Besonderheiten</p>
    <div class="flex flex-wrap gap-2">
      <button
        @click="applyQuickFilter('probetraining')"
        :class="$store.ui.filters.probetraining ? 'bg-primary-100 text-primary-700' : 'bg-slate-100'"
        class="px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-primary-50"
      >
        🆓 Probetraining
      </button>
      <button
        @click="applyQuickFilter('abends')"
        class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-primary-50"
      >
        🌙 Abends
      </button>
    </div>
  </div>

  <!-- Persönlich -->
  <div>
    <p class="text-xs text-slate-500 mb-1.5">Persönlich</p>
    <div class="flex flex-wrap gap-2">
      <button
        x-show="favorites.length > 0"
        @click="applyQuickFilter('favoriten')"
        class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
      >
        ❤️ Favoriten
        <span
          class="ml-1 px-1.5 py-0.5 bg-yellow-200 rounded-full text-xs"
          x-text="favorites.length"
        ></span>
      </button>
    </div>
  </div>
</div>
```

---

### Teil 5: Aktive Filter Chips (Sticky)

**Sticky Chip Bar nach Header:**

```html
<!-- NACH dem Header, VOR dem Content -->
<div
  x-show="activeFilterCount > 0"
  x-transition
  class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-2"
>
  <div class="flex items-center justify-between gap-4 flex-wrap">
    <!-- Active Filter Chips -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-xs font-medium text-slate-600">Aktiv:</span>

      <!-- Wochentag Chips -->
      <template
        x-for="tag in $store.ui.filters.wochentage.slice(0, 3)"
        :key="'chip-' + tag"
      >
        <span
          class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
        >
          <span x-text="tag"></span>
          <button
            @click="removeFilter('wochentag', tag)"
            class="hover:bg-primary-200 rounded-full p-0.5"
          >
            <svg class="w-3 h-3"><!-- X Icon --></svg>
          </button>
        </span>
      </template>

      <!-- Overflow indicator -->
      <span
        x-show="activeFilterCount > 3"
        @click="$store.ui.filterSidebarCollapsed = false"
        class="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium cursor-pointer hover:bg-slate-200"
      >
        +<span x-text="activeFilterCount - 3"></span> weitere
      </span>

      <!-- Results Count -->
      <span class="text-xs text-slate-600 font-medium">
        →
        <span x-text="filteredTrainingsCount"></span>
        <span class="text-slate-500">Trainings</span>
      </span>
    </div>

    <!-- Clear All -->
    <button
      @click="clearAllFilters()"
      class="text-xs text-primary-600 hover:underline font-medium"
    >
      Alle löschen
    </button>
  </div>
</div>
```

**Computed Property für activeFilterCount:**

```javascript
// In component
get activeFilterCount() {
  const filters = this.$store?.ui?.filters
  if (!filters) return 0

  return (
    filters.wochentage.length +
    filters.orte.length +
    filters.trainingsarten.length +
    filters.altersgruppen.length +
    (filters.probetraining ? 1 : 0) +
    (filters.searchTerm ? 1 : 0)
  )
}
```

---

### Teil 6: Content-Maximierung

**Header kompakt machen:**

```html
<!-- ALT (80px hoch): -->
<header
  class="sticky top-0 z-40 bg-slate-100 border-b border-slate-300 px-4 py-6"
>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-primary-600">Trainingsplan</h1>
      <p class="text-sm text-slate-700">Free Arts of Movement</p>
    </div>
    <div class="flex gap-4">
      <!-- Multiple buttons -->
    </div>
  </div>
</header>

<!-- NEU (48px hoch): -->
<header
  class="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 py-2"
>
  <div class="flex items-center justify-between">
    <!-- Just essentials -->
    <h1 class="text-lg font-semibold">Trainingsplan</h1>

    <!-- View Switcher (compact) -->
    <div class="flex items-center gap-2">
      <!-- View buttons -->
      <!-- Dark mode toggle -->
    </div>
  </div>
</header>
```

**Keine Toolbar mehr - alles in Header oder Sidebar:**

```html
<!-- ENTFERNEN: -->
<div class="global-actions-toolbar">
  <!-- Share, Export, etc. -->
</div>

<!-- VERSCHIEBEN zu: -->
<!-- Share/Export Buttons → in Sidebar unten -->
<!-- View Switcher → in Header -->
<!-- Dark Mode → in Header -->
```

---

### Zusammenfassung Teil 0

**Änderungen:**

1. ✅ Map Modal → Map View (eigener Tab)
2. ✅ Sidebar always visible + sticky
3. ✅ Select → Checkboxen (Multi-Filter)
4. ✅ Schnellfilter reaktiviert
5. ✅ Sticky Filter Chips
6. ✅ Header kompakt (48px statt 80px)

**Files to modify:**

- `index.html` - Layout restructure
- `src/main.js` - Filter state (arrays)
- `src/js/trainingsplaner/filter-engine.js` - Multi-filter logic
- `src/js/trainingsplaner/quick-filters.js` - Reactive wieder
- `src/style.css` - Sticky sidebar CSS

**Effort:** 🔴 High (1 Woche) **Impact:** 🔥🔥🔥🔥🔥 MASSIVE - Fixes ALL
critical UI issues

---

## 🔬 Wissenschaftliche UX-Prinzipien (Anwenden!)

### 1. Kognitive Belastung minimieren (Cognitive Load Theory)

**Wissenschaftlicher Hintergrund:**

- Miller's Law: 7±2 Informationseinheiten im Kurzzeitgedächtnis
- Hick's Law: Entscheidungszeit steigt logarithmisch mit Optionsanzahl
- Gestalt-Prinzipien: Visuelle Gruppierung reduziert kognitive Last

**Umsetzung für Trainingsplan:**

```markdown
AUFGABE 1: Information Hierarchy & Progressive Disclosure

- Kritische Infos (Ort, Zeit, Training) auf erster Ebene
- Sekundäre Infos (Trainer, Entfernung) eingeklappt/subtil
- Tertiäre Infos (Anmerkungen) nur on-demand zeigen
- Max. 5-7 Filter gleichzeitig sichtbar (Quick Filters)
- Nutze M3 Accordion/Expansion Panels für Details

BEISPIEL: Training Card Hierarchy:

1. PRIMÄR: Trainingsart Badge + Favoriten (größte visuelle Gewichtung)
2. SEKUNDÄR: Ort + Wochentag (md-typescale-title-large)
3. TERTIÄR: Zeit + Altersgruppe (md-typescale-body-medium)
4. OPTIONAL: Trainer, Entfernung (md-typescale-body-small, ausgegraut)
5. AKTIONEN: Anmelden + Karte (md-btn-filled + md-btn-outlined)
```

### 2. Fitts's Law - Zielgröße & Erreichbarkeit

**Wissenschaftlicher Hintergrund:**

- Größere Ziele = schnellere, präzisere Interaktion
- Wichtigste Aktionen brauchen mindestens 44x44px (Apple HIG)
- Thumb Zone auf Mobile: Untere 2/3 des Screens

**Umsetzung:**

```markdown
AUFGABE 2: Touch Target Optimization

- Primary Actions (Anmelden, Favorit): min. 48x48px (M3 Standard)
- Secondary Actions (Filter, Share): min. 44x44px
- Mobile Navigation: Bottom Tab Bar (Thumb-Zone)
- FAB (Floating Action Button) für häufigste Aktion
- Spacing zwischen Tap-Targets: min. 8px

IMPLEMENTIERUNG:

<!-- Primary CTA -->
<button class="md-btn-filled min-h-[48px] min-w-[48px] md-state-layer">
  Anmelden
</button>

<!-- FAB für "Heute"-Filter -->
<button class="md-fab fixed bottom-6 right-6 z-50">
  <svg><!-- Kalender-Icon --></svg>
  <span>Heute</span>
</button>
```

### 3. Farbpsychologie & Kontrast (WCAG 2.1 AAA)

**Wissenschaftlicher Hintergrund:**

- Farbkodierung beschleunigt Kategorisierung um 40% (Stroop-Effekt)
- Kontrastverhältnis 7:1 für optimale Lesbarkeit (WCAG AAA)
- Warme Farben (Rot, Orange) = Dringlichkeit
- Kühle Farben (Blau, Grün) = Vertrauen, Ruhe

**Umsetzung:**

```markdown
AUFGABE 3: Semantische Farbkodierung

- Parkour: Blau (Vertrauen, Bewegung)
- Trampolin: Grün (Energie, Jugend)
- Tricking: Lila (Kreativität, Premium)
- Movement: Orange (Dynamik, Wärme)
- FAM: Pink (Gemeinschaft, Zugänglichkeit)

DARK MODE KONTRASTE:

- Text auf Surface: min. 7:1 (AAA)
- Interactive Elements: min. 4.5:1 (AA Large)
- Nutze M3 Color Tokens für automatische Anpassung:
  - var(--md-sys-color-on-surface)
  - var(--md-sys-color-primary-container)
  - var(--md-sys-color-outline-variant)
```

### 4. Visuelles Feedback & Mikrointeraktionen

**Wissenschaftlicher Hintergrund:**

- 100ms Rule: Feedback innerhalb 100ms fühlt sich instant an
- Skeleton Screens reduzieren wahrgenommene Ladezeit um 23%
- Animationen <200ms = performant, >400ms = störend

**Umsetzung:**

```markdown
AUFGABE 4: Delightful Microinteractions

- State Layer Ripple-Effekt (M3): 200ms easing
- Card Hover: 150ms transform + elevation change
- Favorite Toggle: Heart-Pulse Animation
- Filter Apply: Subtle Fade-in für Results (300ms)
- Skeleton Loading für Training Cards

IMPLEMENTIERUNG:

<article class="md-card-elevated md-state-layer transition-all duration-150 hover:scale-[1.02]"
         style="transition-timing-function: var(--md-sys-motion-easing-emphasized)">
  <!-- Content -->
</article>

<!-- Skeleton während Laden -->
<div class="animate-pulse space-y-3">
  <div class="h-6 bg-slate-200 rounded w-3/4"></div>
  <div class="h-4 bg-slate-200 rounded w-1/2"></div>
</div>
```

### 5. Räumliche Navigation & Mentale Modelle

**Wissenschaftlicher Hintergrund:**

- F-Pattern Eye Tracking: Users scannen von links-oben
- Z-Pattern für Landing Pages
- Karten-basierte Interfaces = 60% höhere User Engagement

**Umsetzung:**

```markdown
AUFGABE 5: Enhanced Spatial Navigation

- Karte als primärer View Mode (nicht Modal!)
- Split-View: Karte links, Filter/Liste rechts (Desktop)
- Cluster-Marker mit Live-Count
- Auto-Zoom zu Favoriten
- Ort-basierte Gruppierung in List View

LAYOUT: Desktop (≥1024px): ┌────────────────┬────────────────┐ │ │ Filters │ │
Map View │ ──────── │ │ (60% width) │ Card List │ │ │ (40% width) │
└────────────────┴────────────────┘

Mobile (<1024px): View Tabs: [Karte] [Liste] [Favoriten] Swipe-Navigation
zwischen Views
```

---

## 🎨 Material Design 3 - Vollständige Ausreizung

### 1. M3 Motion System

```markdown
AUFGABE 6: M3 Motion Tokens implementieren

- Nutze alle 5 Motion-Ebenen:
  1. Duration Short (50-200ms): State Changes
  2. Duration Medium (250-400ms): View Transitions
  3. Duration Long (400-600ms): Complex Animations

- Easing Curves:
  - Emphasized: Wichtige Aktionen (Filter Apply)
  - Emphasized Decelerate: Enter Animations
  - Emphasized Accelerate: Exit Animations
  - Standard: Utility Animations

BEISPIEL: .filter-enter { animation: slideIn
var(--md-sys-motion-duration-medium2)
var(--md-sys-motion-easing-emphasized-decelerate); }

@keyframes slideIn { from { opacity: 0; transform: translateY(-16px); } to {
opacity: 1; transform: translateY(0); } }
```

### 2. M3 Elevation & Surfaces

```markdown
AUFGABE 7: Surface Hierarchy perfektionieren Level 0 (Background): Main App
Surface Level 1 (Cards): md-sys-elevation-1 (Training Cards) Level 2 (Hover):
md-sys-elevation-2 (Card Hover State) Level 3 (Modals): md-sys-elevation-3
(Filter Drawer) Level 5 (Dialogs): md-sys-elevation-5 (Map Modal)

CONTAINER-HIERARCHIE:

- surface-container-lowest: Page Background
- surface-container-low: Sidebar
- surface-container: Cards (Resting)
- surface-container-high: Cards (Hover)
- surface-container-highest: Sticky Headers
```

### 3. M3 Typography Scale - Vollständig

```markdown
AUFGABE 8: Typography-Hierarchie optimieren DISPLAY (für Marketing/Landing):

- display-large (57px): Hero "Finde dein Training"
- display-medium (45px): Section Headlines
- display-small (36px): Feature Highlights

HEADLINE (für Content):

- headline-large (32px): Page Titles
- headline-medium (28px): Section Titles (Wochentage)
- headline-small (24px): Subsections

TITLE (für UI):

- title-large (22px): Card Titles (Ortsnamen) ✅
- title-medium (16px): Dialog Titles
- title-small (14px): List Item Titles

BODY (für Content):

- body-large (16px): Long-form Text
- body-medium (14px): Card Content ✅
- body-small (12px): Captions, Helper Text

LABEL (für UI):

- label-large (14px): Buttons ✅
- label-medium (12px): Tabs, Chips
- label-small (11px): Form Labels
```

---

## 📱 Mobile-First UX Optimierungen

### 1. Thumb-Zone Navigation

```markdown
AUFGABE 9: Bottom Navigation implementieren

- 3-5 Tab Items (Heute, Karte, Favoriten, Filter, Profil)
- Icons + Labels
- Active State mit M3 State Layer
- 56px Höhe (M3 Standard)
- Safe Area Insets für iPhone

IMPLEMENTIERUNG:

<!-- Bottom Navigation -->
<nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200"
     style="padding-bottom: env(safe-area-inset-bottom)">
  <div class="flex justify-around items-center h-14">
    <button class="flex-1 flex flex-col items-center gap-1 py-2 md-state-layer"
            :class="$store.ui.activeView === 'today' ? 'text-primary-600' : 'text-slate-600'">
      <svg class="w-6 h-6"><!-- Kalender --></svg>
      <span class="md-typescale-label-small">Heute</span>
    </button>
    <!-- Weitere Tabs -->
  </div>
</nav>
```

### 2. Swipe Gestures

```markdown
AUFGABE 10: Touch-Gesten implementieren

- Swipe Left/Right: View-Wechsel (Karte ↔ Liste)
- Pull-to-Refresh: Training-Daten aktualisieren
- Long-Press: Quick Actions (Favorit, Share)
- Swipe-to-Delete: Favoriten entfernen

NUTZE: Alpine.js x-touch Directive (Custom Plugin)
```

### 3. Progressive Disclosure für Mobile

```markdown
AUFGABE 11: Mobile Filter-Experience

- Initial: Nur Quick Filters sichtbar (3 Chips)
- "Mehr Filter" → Bottom Sheet mit allen Filtern
- Active Filter Count Badge
- "X Filter aktiv" → Tap to open Sheet
- Sticky "Anwenden"-Button im Bottom Sheet

BEISPIEL:

<!-- Quick Filters -->
<div class="flex gap-2 px-4 py-3 overflow-x-auto snap-x">
  <button class="md-chip shrink-0 snap-start" @click="applyQuickFilter('heute')">
    <svg class="w-4 h-4"><!-- Icon --></svg>
    Heute
  </button>
  <!-- ... -->
  <button class="md-chip-outlined shrink-0" @click="$store.ui.mobileFilterOpen = true">
    Mehr Filter
    <span class="ml-1 px-1.5 py-0.5 bg-primary-500 text-white rounded-full text-xs">
      3
    </span>
  </button>
</div>
```

---

## 🖥️ Desktop Power-User Features

### 1. Keyboard Shortcuts

```markdown
AUFGABE 12: Keyboard Navigation

- Cmd/Ctrl + K: Quick Search (Spotlight-Style)
- F: Toggle Filter Sidebar ✅ (bereits implementiert)
- M: Toggle Map View
- /: Focus Search Input
- 1-7: Wochentag-Filter (1=Montag, 7=Sonntag)
- H: "Heute"-Filter
- Escape: Close Modals ✅
- Tab: Navigate between Cards
- Enter: Open Training Details

IMPLEMENTIERUNG:

<!-- Keyboard Shortcut Hints -->
<div class="hidden lg:flex items-center gap-1 text-xs text-slate-500">
  <kbd class="px-2 py-1 bg-slate-100 rounded border border-slate-200">F</kbd>
  <span>Filter</span>
</div>
```

### 2. Multi-Select & Bulk Actions

```markdown
AUFGABE 13: Bulk Operations

- Shift + Click: Multi-Select Cards
- Cmd + A: Select All (filtered)
- Bulk Export zu Google Calendar
- Bulk Add to Favorites
- Selection Toolbar (Floating)

UI:

<!-- Selection Toolbar -->
<div x-show="selectedTrainings.length > 0"
     class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-3 px-6 py-3 bg-white rounded-full
            shadow-lg border border-slate-200">
  <span class="md-typescale-body-medium font-semibold">
    <span x-text="selectedTrainings.length"></span> ausgewählt
  </span>
  <div class="w-px h-6 bg-slate-300"></div>
  <button class="md-btn-text" @click="bulkAddToFavorites()">
    <svg><!-- Heart --></svg>
    Favoriten
  </button>
  <button class="md-btn-text" @click="bulkExportToCalendar()">
    <svg><!-- Calendar --></svg>
    Exportieren
  </button>
  <button class="md-btn-text text-red-600" @click="clearSelection()">
    Abbrechen
  </button>
</div>
```

### 3. Advanced Filtering

```markdown
AUFGABE 14: Filter Kombinationen & Presets

- AND/OR Logic: Mehrere Trainingsarten gleichzeitig
- Filter Presets speichern ("Meine Woche")
- Zeitraum-Filter: Nächste 7 Tage, Dieser Monat
- Entfernungs-Slider: 0-20km
- Kapazität-Filter: Freie Plätze vorhanden

UI:

<!-- Filter Logic Switcher -->
<div class="flex items-center gap-2 mb-4">
  <span class="text-sm text-slate-700">Verknüpfung:</span>
  <button @click="$store.ui.filterLogic = 'AND'"
          :class="$store.ui.filterLogic === 'AND' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'"
          class="px-3 py-1.5 rounded-lg text-xs font-medium">
    UND (alle)
  </button>
  <button @click="$store.ui.filterLogic = 'OR'"
          :class="$store.ui.filterLogic === 'OR' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'"
          class="px-3 py-1.5 rounded-lg text-xs font-medium">
    ODER (mind. eine)
  </button>
</div>
```

---

## 🗺️ Karten-Integration - Premium Experience

### 1. Enhanced Map Features

```markdown
AUFGABE 15: Karte als First-Class Citizen

- Persistent Map View (nicht Modal!)
- Split-Screen Desktop: Map + List
- Synchronized Selection: Click Card → Highlight Marker
- Heatmap Layer: Trainings-Dichte visualisieren
- Route Planning: Navigation zu Training
- Custom Marker Icons nach Trainingsart

IMPLEMENTIERUNG: // Custom Marker Icons const markerIcons = { parkour: L.icon({
iconUrl: '/icons/parkour-marker.svg', iconSize: [32, 40], iconAnchor: [16, 40],
className: 'drop-shadow-lg' }), // ... }

// Highlight aktive Marker markers.forEach(marker => { marker.on('click', () =>
{ // Remove previous highlight markers.forEach(m => m.setIcon(defaultIcon)) //
Highlight clicked marker.setIcon(highlightIcon) // Scroll to Card
scrollToCard(marker.trainingId) }) })
```

### 2. Smart Clustering

```markdown
AUFGABE 16: Intelligentes Cluster-Verhalten

- Cluster-Farbe nach dominanter Trainingsart
- Spider-Leg Layout bei Overlap
- Cluster-Click → Zoom + Show Cards in Sidebar
- Max-Zoom: Disable Clustering, zeige alle Marker

BEISPIEL: markerClusterGroup.on('clustermouseover', (cluster) => { const
trainings = cluster.layer.getAllChildMarkers() // Zeige Cluster-Tooltip mit
Trainingsarten-Breakdown const breakdown =
calculateTrainingsBreakdown(trainings) showTooltip(breakdown) // "3x Parkour, 2x
Trampolin" })
```

---

## ⚡ Performance Optimierungen

### 1. Virtualisierung für große Listen

```markdown
AUFGABE 17: Virtual Scrolling implementieren

- Nur sichtbare Cards rendern
- Nutze Intersection Observer
- Lazy-Load Trainer-Bilder
- Debounce Filter-Änderungen (300ms)

IMPLEMENTIERUNG:

<div x-intersect:enter="loadCard"
     x-intersect:leave="unloadCard"
     class="training-card-slot">
  <template x-if="cardLoaded">
    <article class="md-card-elevated">
      <!-- Content -->
    </article>
  </template>
  <template x-if="!cardLoaded">
    <div class="skeleton-card"></div>
  </template>
</div>
```

### 2. Optimistic UI Updates

```markdown
AUFGABE 18: Instant Feedback

- Favorit-Toggle: Sofort UI updaten (vor API-Call)
- Filter Apply: Sofort filtern (vor URL-Update)
- LocalStorage-Sync: Async, non-blocking
- Error Recovery: Rollback bei Fehler

BEISPIEL: async toggleFavorite(trainingId) { // Optimistic Update
this.favorites.push(trainingId) this.updateUI()

try { await saveFavoriteToBackend(trainingId) } catch (error) { // Rollback
this.favorites = this.favorites.filter(id => id !== trainingId) this.updateUI()
this.showError('Favorit konnte nicht gespeichert werden') } }
```

---

## ♿ Accessibility - WCAG 2.1 AAA

### 1. Screen Reader Optimierung

```markdown
AUFGABE 19: A11y Semantik

- ARIA Labels für alle interaktiven Elemente
- Live Regions für Filter-Updates
- Skip Links zu Hauptinhalten ✅
- Semantisches HTML (header, nav, main, aside)
- Focus Management bei Modal-Open/Close

BEISPIEL:

<!-- Live Region für Filter-Updates -->
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  <span x-text="`${filteredTrainingsCount} Trainings gefunden`"></span>
</div>

<!-- Accessible Card -->
<article role="article"
         aria-labelledby="training-title-123"
         aria-describedby="training-details-123">
  <h3 id="training-title-123" class="md-typescale-title-large">
    Parkour Training Olympiapark
  </h3>
  <div id="training-details-123">
    <p>Montag, 18:00 - 20:00 Uhr</p>
    <!-- ... -->
  </div>
</article>
```

### 2. Keyboard Navigation

```markdown
AUFGABE 20: Full Keyboard Support

- Tab-Index für alle Cards
- Arrow Keys: Navigate Cards
- Space/Enter: Activate Card
- Focus-Visible Ring (M3 Outline)
- Focus Trap in Modals

CSS: .md-state-layer:focus-visible { outline: 2px solid
var(--md-sys-color-primary); outline-offset: 2px; }
```

---

## 📊 Datenvisualisierung - Insights

### 1. Training Analytics

```markdown
AUFGABE 21: User Insights Dashboard

- Meine Statistiken: Teilnahme-Streak
- Favoriten-Heatmap: Welche Wochentage?
- Trainingsarten-Breakdown: Pie Chart
- Aktivitätslevel: Badge-System

UI:

<!-- Stats Cards -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div class="md-card-filled p-4 text-center">
    <div class="text-3xl font-bold text-primary-600" x-text="userStats.streak"></div>
    <div class="md-typescale-body-small text-slate-600">Tage Streak</div>
  </div>
  <!-- Weitere Stats -->
</div>
```

### 2. Smart Recommendations

```markdown
AUFGABE 22: ML-basierte Empfehlungen

- "Basierend auf deinen Favoriten"
- Zeitbasiert: Trainings um deine bevorzugten Zeiten
- Entfernungsbasiert: Neue Trainings in deiner Nähe
- Trendbasiert: Beliebte Trainings dieser Woche

ALGORITHMUS (Pseudo-Code): function getRecommendations(user) { const
favoriteTrainings = user.favorites const commonTraits =
analyzeTraits(favoriteTrainings)

return allTrainings .filter(t => !user.attended.includes(t.id)) .filter(t =>
matchesTraits(t, commonTraits, 0.6)) // 60% Match .sort((a, b) =>
calculateScore(a, user) - calculateScore(b, user)) .slice(0, 5) }
```

---

## 🎭 Advanced Interactions

### 1. Drag & Drop

```markdown
AUFGABE 23: Drag-to-Calendar

- Drag Training Card → External Calendar
- Drag to Reorder Favorites
- Drop-Zones mit Visual Feedback

IMPLEMENTIERUNG:

<article draggable="true"
         @dragstart="handleDragStart($event, training)"
         class="md-card-elevated cursor-move">
  <!-- Content -->
</article>

<div class="drop-zone"
     @dragover.prevent
     @drop="handleDrop($event)"
     :class="{'drop-zone-active': isDraggingOver}">
  Hierher ziehen zum Exportieren
</div>
```

### 2. Context Menu (Right-Click)

```markdown
AUFGABE 24: Power-User Context Menu

- Right-Click auf Card → Context Menu
- Optionen: Favorit, Share, Export, Details
- Position: Maus-Cursor
- M3 Menu Component

MENU:

<div x-show="contextMenuOpen"
     @click.outside="contextMenuOpen = false"
     :style="`top: ${contextMenuY}px; left: ${contextMenuX}px`"
     class="fixed z-50 md-surface-container-high rounded-lg
            shadow-lg min-w-[200px] py-2">
  <button class="w-full px-4 py-2 hover:bg-slate-100 text-left">
    <svg class="inline w-4 h-4 mr-2"><!-- Heart --></svg>
    Zu Favoriten
  </button>
  <!-- Weitere Optionen -->
</div>
```

---

## 🧪 A/B Testing Hypothesen

### Test 1: Card Layout Varianten

```markdown
HYPOTHESE: Kompakte Cards mit weniger Details führen zu schnellerem Scannen

VARIANTE A (Control):

- Alle Details sichtbar
- 3 Spalten Desktop

VARIANTE B (Treatment):

- Nur Titel + Training + Zeit initial
- "Mehr anzeigen" für Details
- 4 Spalten Desktop

METRIK: Time-to-Decision (Wie lange bis User klickt)
```

### Test 2: Filter-Position

```markdown
HYPOTHESE: Top-Bar Filter führen zu höherer Nutzung als Sidebar

VARIANTE A (Control):

- Sidebar Links ✅ (aktuell)

VARIANTE B (Treatment):

- Horizontal Chip-Filter in Top-Bar
- Sidebar nur für erweiterte Filter

METRIK: Filter-Nutzungsrate
```

---

## 📱 Native-ähnliche Features

### 1. Pull-to-Refresh

```markdown
AUFGABE 25: Mobile-Native Gesten IMPLEMENTIERUNG: let startY = 0 let currentY =
0

document.addEventListener('touchstart', (e) => { if (window.scrollY === 0) {
startY = e.touches[0].clientY } })

document.addEventListener('touchmove', (e) => { if (startY) { currentY =
e.touches[0].clientY const pullDistance = currentY - startY

    if (pullDistance > 0) {
      showRefreshIndicator(pullDistance)
    }

} })

document.addEventListener('touchend', () => { if (currentY - startY > 100) {
refreshData() } hideRefreshIndicator() startY = 0 })
```

### 2. Haptic Feedback

```markdown
AUFGABE 26: Vibration API für Feedback // Bei wichtigen Aktionen if
(navigator.vibrate) { navigator.vibrate(10) // 10ms kurz }

// Bei Favoriten-Toggle navigator.vibrate([10, 20, 10]) // Pattern
```

---

## 🎨 Visual Polish - Details matter

### 1. Micro-Animations Library

```markdown
AUFGABE 27: Curated Animation Set // Favoriten Heart Pulse @keyframes heartPulse
{ 0%, 100% { transform: scale(1); } 25% { transform: scale(1.2); } 50% {
transform: scale(0.95); } 75% { transform: scale(1.1); } }

.favorite-added { animation: heartPulse 0.6s
var(--md-sys-motion-easing-emphasized); }

// Card Entry Stagger .training-card { animation: fadeInUp 0.4s
var(--md-sys-motion-easing-emphasized-decelerate); animation-fill-mode: both; }

.training-card:nth-child(1) { animation-delay: 0ms; }
.training-card:nth-child(2) { animation-delay: 50ms; }
.training-card:nth-child(3) { animation-delay: 100ms; } /_ ... bis 10 _/

@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to {
opacity: 1; transform: translateY(0); } }
```

### 2. Loading States

```markdown
AUFGABE 28: Skeleton Screens + Shimmer

<div class="skeleton-card">
  <div class="skeleton-shimmer"></div>
  <div class="skeleton-line w-3/4 h-6 mb-2"></div>
  <div class="skeleton-line w-1/2 h-4 mb-4"></div>
  <div class="skeleton-line w-full h-4 mb-2"></div>
  <div class="skeleton-line w-5/6 h-4"></div>
</div>

<style>
.skeleton-card {
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton-line {
  background: var(--md-sys-color-surface-container-high);
  border-radius: 4px;
}
</style>
```

---

## 🔔 Smart Notifications

### 1. Training Reminders

```markdown
AUFGABE 29: Push Notifications (PWA)

- 1 Stunde vor Training
- Bei neuen Trainings in Favoriten-Kategorie
- Bei Kapazitäts-Änderungen
- Weekly Digest: Deine Woche

IMPLEMENTIERUNG: // Service Worker self.addEventListener('push', (event) => {
const data = event.data.json()

self.registration.showNotification(data.title, { body: data.body, icon:
'/icons/fam-192.png', badge: '/icons/fam-badge.png', tag: data.tag, actions: [ {
action: 'open', title: 'Zum Training' }, { action: 'dismiss', title: 'Später' }
] }) })
```

---

## 📐 Layout Innovations

### 1. Masonry Grid für Cards

```markdown
AUFGABE 30: Pinterest-Style Layout

- Variable Card Heights basierend auf Content
- Optimal für Mixed Content
- CSS Grid Masonry (Firefox) + Fallback

CSS: .training-grid { display: grid; grid-template-columns: repeat(auto-fill,
minmax(300px, 1fr)); grid-template-rows: masonry; /_ Firefox _/ gap: 1.25rem; }

/_ Fallback für andere Browser _/ @supports not (grid-template-rows: masonry) {
.training-grid { display: flex; flex-wrap: wrap; gap: 1.25rem; }

.training-card { flex: 1 1 calc(33.333% - 1rem); min-width: 300px; } }
```

### 2. Sticky Grouped Headers

```markdown
AUFGABE 31: iOS-Style Sticky Section Headers

<div class="space-y-6">
  <template x-for="gruppe in groupedTrainings">
    <section>
      <!-- Sticky Header -->
      <div class="sticky top-0 z-20 bg-white/95 backdrop-blur-sm
                  px-4 py-3 -mx-4 mb-4
                  border-b border-slate-200">
        <h2 class="md-typescale-headline-medium flex items-center gap-3">
          <span x-text="gruppe.key"></span>
          <span class="md-chip-small" x-text="gruppe.items.length"></span>
        </h2>
      </div>

      <!-- Cards -->
      <div class="training-grid">
        <!-- ... -->
      </div>
    </section>

  </template>
</div>
```

---

## 🎯 Abschluss-Checkliste

### Priorität 1 (Must-Have)

- [ ] Bottom Navigation (Mobile)
- [ ] Swipe Gestures für View-Wechsel
- [ ] Keyboard Shortcuts (Desktop)
- [ ] Enhanced Map Split-View
- [ ] WCAG AAA Kontraste
- [ ] Micro-Animations (Heart Pulse, Card Hover)
- [ ] Skeleton Loading States

### Priorität 2 (Should-Have)

- [ ] Bulk-Select & Actions
- [ ] Advanced Filter Logic (AND/OR)
- [ ] Smart Recommendations
- [ ] Pull-to-Refresh
- [ ] Context Menu
- [ ] Sticky Section Headers
- [ ] Virtual Scrolling

### Priorität 3 (Nice-to-Have)

- [ ] Analytics Dashboard
- [ ] Drag & Drop to Calendar
- [ ] Haptic Feedback
- [ ] Push Notifications
- [ ] Masonry Grid Layout
- [ ] A/B Testing Setup

---

## 🚀 Implementierungs-Reihenfolge

### Phase 1: Mobile Foundation (Woche 1)

1. Bottom Navigation
2. Swipe Gestures
3. Pull-to-Refresh
4. Mobile Filter Bottom Sheet

### Phase 2: Desktop Power (Woche 2)

1. Keyboard Shortcuts
2. Bulk Selection
3. Advanced Filters
4. Context Menu

### Phase 3: Visual Polish (Woche 3)

1. Micro-Animations
2. Loading States
3. Sticky Headers
4. Card Stagger Animations

### Phase 4: Map Enhancement (Woche 4)

1. Split-View Layout
2. Custom Markers
3. Smart Clustering
4. Route Planning

### Phase 5: Intelligence (Woche 5)

1. Smart Recommendations
2. Analytics Dashboard
3. Push Notifications
4. Personalization

---

## 📚 Referenzen & Ressourcen

### UX-Wissenschaft

- Nielsen Norman Group: https://www.nngroup.com/
- Laws of UX: https://lawsofux.com/
- Material Design 3: https://m3.material.io/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

### Code-Beispiele

- Alpine.js Components: https://alpinejs.dev/
- Tailwind CSS Patterns: https://tailwindui.com/
- Leaflet Plugins: https://leafletjs.com/plugins.html

### Design-Inspiration

- Dribbble Trainingsplan Designs
- Behance Fitness Apps
- Mobile Patterns: http://www.mobile-patterns.com/

---

**Erstellt am:** 2025-10-21 **Version:** 1.0.0 **Tech-Stack:** Alpine.js 3.x,
M3, Tailwind CSS, Leaflet 1.9.4 **Ziel:** Design-Meisterwerk durch
wissenschaftlich fundierte UX
