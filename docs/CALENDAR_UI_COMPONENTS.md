# 📅 Calendar Integration - UI Components

**Version:** 1.0.0
**Status:** Ready for Integration
**Date:** 2025-10-03

---

## 🎨 UI Components

Hier findest du fertige UI-Komponenten für die Calendar Integration.

---

## 1. Single Training Card - Calendar Dropdown

Füge diesen Button zu jeder Training Card hinzu (nach dem "Anmelden" Button):

```html
<!-- Calendar Dropdown Button -->
<div class="relative" x-data="{ calendarOpen: false }">
  <!-- Trigger Button -->
  <button @click="calendarOpen = !calendarOpen"
          type="button"
          class="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
    Kalender
  </button>

  <!-- Dropdown Menu -->
  <div x-show="calendarOpen"
       @click.away="calendarOpen = false"
       x-transition:enter="transition ease-out duration-100"
       x-transition:enter-start="transform opacity-0 scale-95"
       x-transition:enter-end="transform opacity-100 scale-100"
       x-transition:leave="transition ease-in duration-75"
       x-transition:leave-start="transform opacity-100 scale-100"
       x-transition:leave-end="transform opacity-0 scale-95"
       class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-10 overflow-hidden">

    <!-- Google Calendar -->
    <button @click="addToGoogleCalendar(training); calendarOpen = false"
            type="button"
            class="w-full px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left">
      <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path fill="#4285F4" d="M19.9 11.5c0-.7-.1-1.4-.2-2H11v4h5c-.2 1.1-.9 2-1.8 2.7v2.3h2.9c1.7-1.6 2.8-3.9 2.8-6.9z"/>
        <path fill="#34A853" d="M11 20c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H3v2.4C4.6 18 7.6 20 11 20z"/>
        <path fill="#FBBC05" d="M5.9 12.6c-.2-.5-.3-1.1-.3-1.6s.1-1.1.3-1.6V6.9H3C2.4 8.1 2 9.5 2 11s.4 2.9 1 4.1l2.9-2.4z"/>
        <path fill="#EA4335" d="M11 5.2c1.4 0 2.6.5 3.6 1.4l2.7-2.7C15.4 2.3 13.3 1.5 11 1.5 7.6 1.5 4.6 3.5 3 6.5l2.9 2.4c.7-2.2 2.7-3.8 5.1-3.8z"/>
      </svg>
      <div class="flex-1">
        <div class="font-medium text-slate-900">Google Calendar</div>
        <div class="text-xs text-slate-500">Öffnet in neuem Tab</div>
      </div>
    </button>

    <!-- Apple Calendar (.ics) -->
    <button @click="addToCalendar(training, 'apple'); calendarOpen = false"
            type="button"
            class="w-full px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left border-t border-slate-100">
      <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      <div class="flex-1">
        <div class="font-medium text-slate-900">Apple Calendar</div>
        <div class="text-xs text-slate-500">Download .ics Datei</div>
      </div>
    </button>

    <!-- Outlook -->
    <button @click="addToCalendar(training, 'outlook'); calendarOpen = false"
            type="button"
            class="w-full px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 text-left border-t border-slate-100">
      <svg class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#0078D4">
        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.59l7 3.5v7.82l-7-3.5V9.59zm9 11.32v-7.82l7-3.5v7.82l-7 3.5z"/>
      </svg>
      <div class="flex-1">
        <div class="font-medium text-slate-900">Outlook</div>
        <div class="text-xs text-slate-500">Öffnet in neuem Tab</div>
      </div>
    </button>
  </div>
</div>
```

---

## 2. Global Actions Toolbar - Bulk Export

Füge diese Buttons zur Global Actions Toolbar hinzu (neben "Alle exportieren"):

```html
<!-- Updated Export Actions -->
<div class="flex items-center gap-2">

  <!-- Google Calendar Bulk Export -->
  <button @click="bulkAddToGoogleCalendar()"
          :disabled="filteredTrainingsCount === 0"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors">
    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path fill="currentColor" d="M19.9 11.5c0-.7-.1-1.4-.2-2H11v4h5c-.2 1.1-.9 2-1.8 2.7v2.3h2.9c1.7-1.6 2.8-3.9 2.8-6.9z"/>
    </svg>
    <span class="hidden sm:inline">Google Calendar</span>
    <span class="sm:hidden">Google</span>
  </button>

  <!-- iCal Download (existing) -->
  <button @click="exportAllToCalendar()"
          :disabled="filteredTrainingsCount === 0"
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
    <span class="hidden sm:inline">.ics Download</span>
    <span class="sm:hidden">Download</span>
  </button>

  <!-- Export Favorites (existing, but add Google option) -->
  <div x-show="favorites.length > 0"
       x-transition
       class="relative"
       x-data="{ favMenuOpen: false }">
    <button @click="favMenuOpen = !favMenuOpen"
            type="button"
            class="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors">
      <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <span class="hidden sm:inline">Favoriten</span>
    </button>

    <!-- Favorites Dropdown -->
    <div x-show="favMenuOpen"
         @click.away="favMenuOpen = false"
         x-transition
         class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-10 overflow-hidden">
      <button @click="bulkAddToGoogleCalendar(); favMenuOpen = false"
              type="button"
              class="w-full px-4 py-3 hover:bg-slate-50 text-left">
        Google Calendar
      </button>
      <button @click="exportFavoritesToCalendar(); favMenuOpen = false"
              type="button"
              class="w-full px-4 py-3 hover:bg-slate-50 text-left border-t border-slate-100">
        .ics Download
      </button>
    </div>
  </div>
</div>
```

---

## 3. Mobile Optimized Version

Für Mobile (innerhalb `lg:hidden` Blocks):

```html
<!-- Mobile Calendar Button -->
<button @click="$store.ui.calendarModalOpen = true"
        type="button"
        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-semibold active:bg-green-600 transition-colors">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>
  Zum Kalender
</button>
```

---

## 4. Calendar Modal (Full Screen on Mobile)

Füge dieses Modal am Ende von `index.html` hinzu (vor `</div><!-- #app -->`):

```html
<!-- ==================== CALENDAR MODAL (MOBILE) ==================== -->
<div x-show="$store.ui.calendarModalOpen"
     x-trap.inert.noscroll="$store.ui.calendarModalOpen"
     x-transition:enter="transition ease-out duration-300"
     x-transition:enter-start="opacity-0"
     x-transition:enter-end="opacity-100"
     x-transition:leave="transition ease-in duration-200"
     x-transition:leave-start="opacity-100"
     x-transition:leave-end="opacity-0"
     @keydown.escape.window="$store.ui.calendarModalOpen = false"
     class="lg:hidden fixed inset-0 bg-black/80 z-50 flex items-end">

  <div class="w-full bg-white rounded-t-2xl shadow-2xl overflow-hidden"
       x-transition:enter="transition ease-out duration-300"
       x-transition:enter-start="translate-y-full"
       x-transition:enter-end="translate-y-0"
       x-transition:leave="transition ease-in duration-200"
       x-transition:leave-start="translate-y-0"
       x-transition:leave-end="translate-y-full">

    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
      <h2 class="text-xl font-bold text-slate-900">Zum Kalender hinzufügen</h2>
      <button @click="$store.ui.calendarModalOpen = false"
              type="button"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
        <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Calendar Options -->
    <div class="p-6 space-y-3">
      <!-- Google Calendar -->
      <button @click="bulkAddToGoogleCalendar(); $store.ui.calendarModalOpen = false"
              type="button"
              class="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-slate-50 transition-all flex items-center gap-4">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path fill="#4285F4" d="M19.9 11.5c0-.7-.1-1.4-.2-2H11v4h5c-.2 1.1-.9 2-1.8 2.7v2.3h2.9c1.7-1.6 2.8-3.9 2.8-6.9z"/>
        </svg>
        <div class="flex-1 text-left">
          <div class="font-bold text-slate-900">Google Calendar</div>
          <div class="text-sm text-slate-600">
            <span x-text="filteredTrainingsCount"></span> Trainings hinzufügen
          </div>
        </div>
        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      <!-- Apple Calendar -->
      <button @click="exportAllToCalendar(); $store.ui.calendarModalOpen = false"
              type="button"
              class="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-500 hover:bg-slate-50 transition-all flex items-center gap-4">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
        <div class="flex-1 text-left">
          <div class="font-bold text-slate-900">Apple / Outlook</div>
          <div class="text-sm text-slate-600">.ics Datei herunterladen</div>
        </div>
        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>

    <!-- Info -->
    <div class="px-6 py-4 bg-slate-50 border-t border-slate-200">
      <p class="text-xs text-slate-600 text-center">
        💡 Tipp: Verwende Google Calendar für automatische Updates
      </p>
    </div>
  </div>
</div>
```

---

## 5. Alpine Store Update

Füge zum UI Store in `main.js` hinzu:

```javascript
// In Alpine.store('ui', { ... })

// Add these properties:
calendarModalOpen: false,
preferredCalendar: null, // 'google' | 'apple' | 'outlook'
```

---

## 6. Icons als SVG Components

Optional: Erstelle wiederverwendbare Icon-Komponenten:

```html
<!-- Google Calendar Icon -->
<template x-if="true">
  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path fill="#4285F4" d="M19.9 11.5c0-.7-.1-1.4-.2-2H11v4h5c-.2 1.1-.9 2-1.8 2.7v2.3h2.9c1.7-1.6 2.8-3.9 2.8-6.9z"/>
    <path fill="#34A853" d="M11 20c2.4 0 4.5-.8 6-2.2l-2.9-2.3c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H3v2.4C4.6 18 7.6 20 11 20z"/>
    <path fill="#FBBC05" d="M5.9 12.6c-.2-.5-.3-1.1-.3-1.6s.1-1.1.3-1.6V6.9H3C2.4 8.1 2 9.5 2 11s.4 2.9 1 4.1l2.9-2.4z"/>
    <path fill="#EA4335" d="M11 5.2c1.4 0 2.6.5 3.6 1.4l2.7-2.7C15.4 2.3 13.3 1.5 11 1.5 7.6 1.5 4.6 3.5 3 6.5l2.9 2.4c.7-2.2 2.7-3.8 5.1-3.8z"/>
  </svg>
</template>
```

---

## 🎨 Styling Tips

### Colors

- **Google Calendar**: `bg-[#4285F4]` (Blue)
- **Apple Calendar**: `bg-black` oder Grayscale
- **Outlook**: `bg-[#0078D4]` (Microsoft Blue)
- **Success**: `bg-green-500`
- **Warning**: `bg-yellow-500`

### Transitions

```css
/* Smooth dropdown */
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);

/* Spring animation für Modals */
transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## ✅ Integration Checklist

- [ ] Calendar Dropdown zu Training Cards hinzugefügt
- [ ] Bulk Export Buttons zur Toolbar hinzugefügt
- [ ] Mobile Calendar Modal implementiert
- [ ] Alpine Store erweitert (`calendarModalOpen`)
- [ ] Icons importiert/erstellt
- [ ] Responsive Design getestet
- [ ] Touch-Gesten auf Mobile getestet
- [ ] Error States hinzugefügt
- [ ] Loading States hinzugefügt

---

## 📊 Analytics Events

Tracking empfohlen:

```javascript
// In den Calendar-Funktionen
gtag('event', 'calendar_add', {
  calendar_provider: 'google',
  training_type: training.training,
  method: 'single' | 'bulk'
})
```

---

**Next Steps:**
1. Copy-paste die UI Components in `index.html`
2. Teste auf Mobile & Desktop
3. Sammle User Feedback
4. Iteriere basierend auf Nutzung

---

**Created:** 2025-10-03
**Author:** Claude Code
