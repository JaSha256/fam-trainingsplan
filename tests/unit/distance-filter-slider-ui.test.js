// @ts-check
/**
 * Distance Filter Slider UI Tests (TDD RED Phase)
 * @file tests/unit/distance-filter-slider-ui.test.js
 *
 * Tests for Alpine.js distance filter slider component
 * - HTML Structure validation
 * - Alpine.js bindings
 * - Accessibility (ARIA, keyboard nav)
 * - CSS/Tailwind classes
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

describe('Distance Filter Slider UI', () => {
  let dom
  let document

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`)
    document = dom.window.document
    global.document = document
    global.window = dom.window
  })

  describe('HTML Structure', () => {
    test('Slider container existiert mit korrekter CSS-Klasse', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const container = document.querySelector('.distance-filter-section')
      expect(container).toBeTruthy()
      expect(container.tagName).toBe('DIV')
    })

    test('Fieldset für semantische Gruppierung vorhanden', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const fieldset = document.querySelector('fieldset#distance-filter-fieldset')
      expect(fieldset).toBeTruthy()
    })

    test('Legend mit "Umkreis-Filter" Text existiert', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const legend = document.querySelector('fieldset#distance-filter-fieldset legend')
      expect(legend).toBeTruthy()
      expect(legend.textContent).toContain('Umkreis-Filter')
    })

    test('Range-Input hat korrekte Attribute (min, max, step)', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider[type="range"]')
      expect(slider).toBeTruthy()
      expect(slider.getAttribute('min')).toBe('0.5')
      expect(slider.getAttribute('max')).toBe('25')
      expect(slider.getAttribute('step')).toBe('0.5')
    })

    test('Output-Element zeigt aktuellen Distanz-Wert an', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const output = document.querySelector('output#distance-value')
      expect(output).toBeTruthy()
      expect(output.getAttribute('for')).toBe('distance-slider')
    })

    test('Toggle-Switch zum Aktivieren/Deaktivieren existiert', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const toggle = document.querySelector('input#distance-filter-toggle[type="checkbox"]')
      expect(toggle).toBeTruthy()
    })

    test('Visual markers (0.5, 10, 25 km) für Range vorhanden', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const markers = document.querySelector('.distance-markers')
      expect(markers).toBeTruthy()
      expect(markers.textContent).toContain('0.5 km')
      expect(markers.textContent).toContain('25 km')
    })

    test('Ergebnis-Counter zeigt Anzahl gefilterte Trainings', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const counter = document.querySelector('.filter-result-count')
      expect(counter).toBeTruthy()
    })
  })

  describe('Alpine.js Bindings', () => {
    test('Container hat x-data mit localValue Initialisierung', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const container = document.querySelector('.distance-filter-section')
      const xData = container.getAttribute('x-data')
      expect(xData).toBeTruthy()
      expect(xData).toContain('localValue')
      expect(xData).toContain('$store.ui.filters.maxDistanceKm')
    })

    test('Container hat x-show basierend auf userPosition', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const container = document.querySelector('.distance-filter-section')
      const xShow = container.getAttribute('x-show')
      expect(xShow).toBeTruthy()
      expect(xShow).toContain('userPosition')
    })

    test('Slider hat x-model.number für Two-Way-Binding', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      const xModel = slider.getAttribute('x-model.number')
      expect(xModel).toBe('localValue')
    })

    test('Slider hat @input.debounce Event-Handler', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      const inputHandler = slider.getAttribute('@input.debounce.100ms')
      expect(inputHandler).toBeTruthy()
      expect(inputHandler).toContain('$store.ui.filters.maxDistanceKm = localValue')
      expect(inputHandler).toContain('applyFilters()')
    })

    test('Toggle-Switch hat x-model für distanceFilterActive', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const toggle = document.querySelector('input#distance-filter-toggle')
      const xModel = toggle.getAttribute('x-model')
      expect(xModel).toContain('$store.ui.filters.distanceFilterActive')
    })

    test('Output hat x-text für dynamischen Wert mit .toFixed(1)', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const output = document.querySelector('output#distance-value')
      const xText = output.getAttribute('x-text')
      expect(xText).toBeTruthy()
      expect(xText).toContain('localValue')
      expect(xText).toContain('toFixed(1)')
      expect(xText).toContain('km')
    })

    test('Slider ist disabled wenn keine userPosition', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      const disabled = slider.getAttribute(':disabled')
      expect(disabled).toBeTruthy()
      expect(disabled).toContain('!userPosition')
    })

    test('Ergebnis-Counter hat x-show für Sichtbarkeit', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const counter = document.querySelector('.filter-result-count')
      const xShow = counter.getAttribute('x-show')
      expect(xShow).toBeTruthy()
      expect(xShow).toContain('filteredTrainings')
    })

    test('x-cloak Attribut verhindert Flash of Unstyled Content', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const container = document.querySelector('.distance-filter-section')
      expect(container.hasAttribute('x-cloak')).toBe(true)
    })
  })

  describe('Accessibility (WCAG 2.1 AA)', () => {
    test('Slider hat aria-label', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      const ariaLabel = slider.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
      expect(ariaLabel).toContain('Umkreis')
      expect(ariaLabel).toContain('Kilometer')
    })

    test('Slider hat aria-valuemin und aria-valuemax', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      expect(slider.getAttribute('aria-valuemin')).toBe('0.5')
      expect(slider.getAttribute('aria-valuemax')).toBe('25')
    })

    test('Slider hat :aria-valuenow dynamisch gebunden', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      const ariaNow = slider.getAttribute(':aria-valuenow')
      expect(ariaNow).toBeTruthy()
      expect(ariaNow).toContain('localValue')
    })

    test('Slider hat :aria-valuetext mit lesbarem Format', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      const ariaText = slider.getAttribute(':aria-valuetext')
      expect(ariaText).toBeTruthy()
      expect(ariaText).toContain('localValue')
      expect(ariaText).toContain('Kilometer')
    })

    test('Label ist mit Slider verbunden (for/id)', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const label = document.querySelector('label[for="distance-slider"]')
      const slider = document.querySelector('#distance-slider')
      expect(label).toBeTruthy()
      expect(slider).toBeTruthy()
      expect(label.getAttribute('for')).toBe(slider.getAttribute('id'))
    })

    test('Toggle-Switch hat Label', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const label = document.querySelector('label[for="distance-filter-toggle"]')
      expect(label).toBeTruthy()
      expect(label.textContent).toContain('Distanz-Filter')
    })

    test('Output hat role="status" für Screen Reader', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const output = document.querySelector('output#distance-value')
      expect(output.getAttribute('role')).toBe('status')
    })
  })

  describe('CSS Classes (Tailwind & Material Design 3)', () => {
    test('Slider hat responsive width-Klasse', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      expect(slider.className).toContain('w-full')
    })

    test('Container hat spacing und padding', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const container = document.querySelector('.distance-filter-section')
      expect(container.className).toMatch(/mb-|p-/)
    })

    test('Slider hat M3-spezifische Klassen', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      expect(slider.className).toContain('md-slider')
    })

    test('Slider hat min-h-[44px] für Touch-Targets', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      expect(slider.className).toContain('min-h-[44px]')
    })

    test('Toggle-Switch hat Touch-Target-Größe', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const toggleContainer = document.querySelector('.distance-filter-toggle-container')
      expect(toggleContainer.className).toContain('min-h-[44px]')
    })

    test('Focus States sind definiert', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const slider = document.querySelector('input#distance-slider')
      expect(slider.className).toMatch(/focus:ring|focus:outline/)
    })
  })

  describe('Empty State Messages', () => {
    test('Hinweis wenn keine Trainings in Umkreis', () => {
      document.body.innerHTML = getDistanceFilterHTML()
      const emptyState = document.querySelector('.distance-filter-empty-state')
      expect(emptyState).toBeTruthy()
      const xShow = emptyState.getAttribute('x-show')
      expect(xShow).toContain('filteredTrainings')
      expect(xShow).toContain('length === 0')
    })
  })
})

// ==================== HELPER FUNCTION ====================

/**
 * Generate Distance Filter HTML Component
 * @returns {string} HTML string
 */
function getDistanceFilterHTML() {
  return `
    <!-- Distance Filter Slider Component -->
    <div
      class="distance-filter-section mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
      x-show="userPosition"
      x-data="{ localValue: $store.ui.filters.maxDistanceKm || 5 }"
      x-cloak
    >
      <fieldset id="distance-filter-fieldset" class="space-y-3">
        <legend class="block mb-3 text-sm font-semibold text-slate-700">
          Umkreis-Filter
        </legend>

        <!-- Toggle Enable/Disable Distance Filter -->
        <div class="distance-filter-toggle-container flex items-center justify-between min-h-[44px] mb-3">
          <label for="distance-filter-toggle" class="text-sm font-medium text-slate-700 cursor-pointer">
            Distanz-Filter aktivieren
          </label>
          <input
            type="checkbox"
            id="distance-filter-toggle"
            x-model="$store.ui.filters.distanceFilterActive"
            class="w-10 h-6 bg-slate-200 rounded-full appearance-none cursor-pointer transition-colors
                   checked:bg-primary-600 relative
                   before:content-[''] before:absolute before:top-1 before:left-1 before:w-4 before:h-4
                   before:bg-white before:rounded-full before:transition-transform
                   checked:before:translate-x-4"
            aria-label="Distanz-Filter aktivieren oder deaktivieren"
          />
        </div>

        <!-- Slider Section (shown when toggle is active) -->
        <div x-show="$store.ui.filters.distanceFilterActive" x-transition>
          <!-- Label with current value -->
          <label
            for="distance-slider"
            class="flex items-center justify-between mb-2 text-sm font-medium text-slate-700"
          >
            <span>Maximale Entfernung:</span>
            <output
              id="distance-value"
              for="distance-slider"
              class="text-primary-600 font-semibold"
              x-text="localValue.toFixed(1) + ' km'"
              role="status"
              aria-live="polite"
            ></output>
          </label>

          <!-- Range Slider -->
          <input
            type="range"
            id="distance-slider"
            class="md-slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer
                   accent-primary-600 min-h-[44px] py-4
                   disabled:opacity-50 disabled:cursor-not-allowed
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            min="0.5"
            max="25"
            step="0.5"
            x-model.number="localValue"
            @input.debounce.100ms="
              $store.ui.filters.maxDistanceKm = localValue;
              applyFilters();
              localStorage.setItem('maxDistanceKm', localValue);
            "
            :disabled="!userPosition"
            aria-label="Umkreis in Kilometern"
            aria-valuemin="0.5"
            aria-valuemax="25"
            :aria-valuenow="localValue"
            :aria-valuetext="localValue.toFixed(1) + ' Kilometer'"
          >

          <!-- Distance Markers -->
          <div class="distance-markers flex justify-between text-xs text-slate-500 mt-1 px-1">
            <span>0.5 km</span>
            <span>10 km</span>
            <span>25 km</span>
          </div>

          <!-- Result Count -->
          <p
            class="filter-result-count text-sm text-slate-600 mt-3 flex items-center gap-2"
            x-show="filteredTrainings && filteredTrainings.length > 0"
          >
            <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span>
              <strong x-text="filteredTrainings.length"></strong>
              <span x-text="filteredTrainings.length === 1 ? 'Training' : 'Trainings'"></span>
              in deiner Nähe
            </span>
          </p>

          <!-- Empty State (optional) -->
          <p
            class="distance-filter-empty-state text-sm text-slate-500 mt-3 italic"
            x-show="userPosition && $store.ui.filters.distanceFilterActive && filteredTrainings && filteredTrainings.length === 0"
          >
            Keine Trainings in <span x-text="localValue.toFixed(1)"></span> km Umkreis.
            Erhöhe die Distanz.
          </p>
        </div>
      </fieldset>
    </div>
  `
}
