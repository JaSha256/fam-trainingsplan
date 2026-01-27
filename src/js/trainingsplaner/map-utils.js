// @ts-check
/**
 * Map Utilities - FAM Trainingsplan
 * @file src/js/trainingsplaner/map-utils.js
 * @version 1.0.0
 *
 * Reusable utility functions for map operations.
 */

/**
 * @typedef {import('./types.js').Training} Training
 */

/**
 * @typedef {Object} UtilsFormatters
 * @property {(von: string, bis: string) => string} formatZeitrange - Format time range
 * @property {(training: Training) => string} formatAlter - Format age range
 */

/**
 * SVG icon strings for map popups (Heroicons Outline, 16x16)
 * Replaces emoji literals for consistent visual language with cards.
 */
const POPUP_ICONS = {
  mapPin: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>',
  calendar: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>',
  clock: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  users: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>',
  user: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>',
  home: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/></svg>',
  checkCircle: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  xCircle: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
  lightBulb: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>',
  bolt: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>',
  ruler: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h18v18H3V3zm3 6h2m2 0h2m2 0h2M6 15h2m2 0h2m2 0h2"/></svg>'
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * Returns distance in kilometers between two lat/lng points.
 * Uses the Haversine formula for great-circle distance.
 *
 * @param {[number, number]} coord1 - [lat, lng]
 * @param {[number, number]} coord2 - [lat, lng]
 * @returns {number} Distance in kilometers
 *
 * @example
 * const distance = calculateDistance([48.137154, 11.576124], [48.1351, 11.5820])
 * console.log(distance) // 0.52 (km)
 */
export function calculateDistance(coord1, coord2) {
  const [lat1, lon1] = coord1
  const [lat2, lon2] = coord2

  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 *
 * @param {number} degrees - Degrees to convert
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

/**
 * Validate coordinates
 *
 * Checks if latitude and longitude are valid numbers within acceptable ranges.
 *
 * @param {number} lat - Latitude (-90 to 90)
 * @param {number} lng - Longitude (-180 to 180)
 * @returns {boolean} True if coordinates are valid
 *
 * @example
 * isValidCoordinates(48.137154, 11.576124) // true
 * isValidCoordinates(91, 200) // false
 */
export function isValidCoordinates(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

/**
 * Get optimal cluster radius based on screen size
 *
 * Returns responsive cluster radius for marker clustering.
 * Mobile devices get tighter clustering to prevent overlap.
 *
 * @param {number} [breakpoint=768] - Mobile breakpoint in pixels
 * @returns {number} Cluster radius in pixels
 *
 * @example
 * const radius = getOptimalClusterRadius()
 * // Returns 60 on mobile, 80 on desktop
 */
export function getOptimalClusterRadius(breakpoint = 768) {
  return window.innerWidth < breakpoint ? 60 : 80
}

/**
 * Get optimal spiderfy distance multiplier based on screen size
 *
 * Returns responsive distance multiplier for spiderfied markers.
 * Mobile devices get larger spread for easier tapping.
 *
 * @param {number} [breakpoint=768] - Mobile breakpoint in pixels
 * @returns {number} Distance multiplier
 *
 * @example
 * const multiplier = getOptimalSpiderfyMultiplier()
 * // Returns 1.5 on mobile, 1 on desktop
 */
export function getOptimalSpiderfyMultiplier(breakpoint = 768) {
  return window.innerWidth < breakpoint ? 1.5 : 1
}

/**
 * Format distance for display
 *
 * Formats distance in kilometers to human-readable string.
 * Shows meters if distance < 1 km.
 *
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 *
 * @example
 * formatDistance(0.5) // "500 m"
 * formatDistance(1.2) // "1.2 km"
 * formatDistance(12.5) // "12.5 km"
 */
export function formatDistance(distanceKm) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}

/**
 * Group trainings by exact location
 *
 * Groups trainings that share the exact same coordinates.
 * Returns a map where key is "lat,lng" and value is array of trainings.
 *
 * @param {Training[]} trainings - Array of trainings
 * @returns {Map<string, Training[]>} Map of location key to trainings
 *
 * @example
 * const grouped = groupTrainingsByLocation(trainings)
 * // Returns Map { "48.1351,11.582" => [training1, training2], ... }
 */
export function groupTrainingsByLocation(trainings) {
  const locationMap = new Map()

  trainings.forEach((training) => {
    if (!training.lat || !training.lng) return

    // Create unique key for this exact location
    const locationKey = `${training.lat.toFixed(6)},${training.lng.toFixed(6)}`

    if (!locationMap.has(locationKey)) {
      locationMap.set(locationKey, [])
    }

    locationMap.get(locationKey).push(training)
  })

  return locationMap
}

/**
 * Create popup HTML for multiple trainings at same location
 *
 * Generates scrollable list of trainings at the same location with sorting.
 *
 * @param {Training[]} trainings - Array of trainings at this location
 * @returns {string} HTML string for popup
 *
 * @example
 * const html = createLocationPopupHTML(trainings)
 * marker.bindPopup(html)
 */
export function createLocationPopupHTML(trainings) {
  const locationName = trainings[0].ort || 'Standort'
  const address = trainings[0].adresse || ''
  const count = trainings.length

  // Serialize trainings data - use base64 to avoid quote escaping issues
  const trainingsData = trainings.map(t => ({
    id: t.id,
    training: t.training,
    wochentag: t.wochentag,
    von: t.von,
    bis: t.bis,
    altersgruppe: t.altersgruppe,
    trainer: t.trainer,
    probetraining: t.probetraining,
    anmerkung: t.anmerkung,
    link: t.link
  }))

  // Base64 encode to avoid all quote/escaping issues
  const trainingsJSON = btoa(encodeURIComponent(JSON.stringify(trainingsData)))

  return `
    <div class="md-map-location-popup"
         data-trainings-b64="${trainingsJSON}"
         x-data="{
           trainings: [],
           sortBy: 'day',
           showAll: false,
           pageSize: 5,
           get sorted() {
             const dayOrder = {Montag:1,Dienstag:2,Mittwoch:3,Donnerstag:4,Freitag:5,Samstag:6,Sonntag:7};
             const list = [...this.trainings];
             switch(this.sortBy) {
               case 'day': return list.sort((a,b) => (dayOrder[a.wochentag]||99) - (dayOrder[b.wochentag]||99));
               case 'time': return list.sort((a,b) => (a.von||'00:00').localeCompare(b.von||'00:00'));
               case 'age': return list.sort((a,b) => (parseInt(a.vonalter)||0) - (parseInt(b.vonalter)||0));
               case 'name': return list.sort((a,b) => a.training.localeCompare(b.training));
               default: return list;
             }
           },
           get displayed() {
             return this.showAll ? this.sorted : this.sorted.slice(0, this.pageSize);
           },
           get hasMore() {
             return this.trainings.length > this.pageSize && !this.showAll;
           },
           get remainingCount() {
             return Math.max(0, this.trainings.length - this.pageSize);
           }
         }"
         x-init="trainings = JSON.parse(decodeURIComponent(atob($el.dataset.trainingsB64)))"
    >
      <!-- Header -->
      <div class="md-map-location-header">
        <div class="md-map-popup-icon">${POPUP_ICONS.mapPin}</div>
        <div class="md-map-popup-title flex-1">
          <h3 class="md-typescale-title-medium font-bold">${locationName}</h3>
          <p class="md-typescale-body-small opacity-90">${count} Training${count > 1 ? 's' : ''} an diesem Standort</p>
          ${address ? `<p class="md-typescale-body-small opacity-80 mt-0.5">${POPUP_ICONS.home} ${address}</p>` : ''}
        </div>
      </div>

      <!-- Sorting Controls -->
      <div class="md-map-location-sort">
        <div class="flex items-center gap-3">
          <label for="sort-select" class="md-typescale-label-medium font-semibold" style="color: var(--md-sys-color-on-surface);">
            Sortieren nach:
          </label>
          <select id="sort-select"
                  x-model="sortBy"
                  class="md-sort-dropdown">
            <option value="day">Wochentag</option>
            <option value="time">Uhrzeit</option>
            <option value="age">Altersgruppe</option>
            <option value="name">Trainingsname</option>
          </select>
        </div>
      </div>

      <!-- Scrollable trainings list -->
      <div class="md-map-location-list">
        <template x-for="(training, index) in displayed" :key="training.id">
          <div class="md-map-location-item">
            <!-- Training header with icon -->
            <div class="flex items-start gap-3 mb-3">
              <div class="md-map-popup-icon" style="width: 36px; height: 36px; background-color: rgba(var(--color-primary-rgb, 0, 115, 230), 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${POPUP_ICONS.bolt}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="md-typescale-title-small font-semibold mb-1" x-text="training.training"></h4>
                <span x-show="training.probetraining === 'ja'"
                      class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); font-weight: 600;">
                  ${POPUP_ICONS.checkCircle} Probetraining
                </span>
              </div>
            </div>

            <!-- Training details grid with consistent styling -->
            <div class="md-map-popup-info-grid" style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; margin-bottom: 1rem;">
              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant);">
                ${POPUP_ICONS.calendar}
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium font-medium" x-text="training.wochentag"></span>
              </div>

              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant);">
                ${POPUP_ICONS.clock}
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium font-medium" x-text="training.von + ' - ' + training.bis + ' Uhr'"></span>
              </div>

              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant);">
                ${POPUP_ICONS.users}
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium" x-text="training.altersgruppe || 'Alle Altersgruppen'"></span>
              </div>

              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant);">
                ${POPUP_ICONS.user}
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium" x-text="training.trainer"></span>
              </div>
            </div>

            <!-- Note with better styling -->
            <div x-show="training.anmerkung"
                 class="md-map-popup-note"
                 style="background: linear-gradient(135deg, var(--md-sys-color-primary-container) 0%, var(--md-sys-color-secondary-container) 100%); color: var(--md-sys-color-on-primary-container); padding: 0.75rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid var(--color-primary-500);">
              <p class="md-typescale-label-small font-semibold mb-1 opacity-80" style="margin: 0 0 0.25rem 0;">${POPUP_ICONS.lightBulb} Wichtiger Hinweis</p>
              <p class="md-typescale-body-small" style="margin: 0;" x-text="training.anmerkung"></p>
            </div>

            <!-- Action button with correct color -->
            <div x-show="training.link" class="mt-3">
              <a :href="training.link" target="_blank" rel="noopener noreferrer"
                 class="md-location-action-btn"
                 style="color: white !important;">
                <span style="color: white !important;">Jetzt anmelden</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </a>
            </div>
          </div>
        </template>

        <!-- Show more button (pagination) -->
        <div x-show="hasMore" class="mt-3 text-center">
          <button @click="showAll = true"
                  type="button"
                  class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container);">
            <span x-text="'Alle ' + trainings.length + ' anzeigen'"></span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
}

/**
 * Create popup HTML for single training
 *
 * Generates M3-styled HTML content for a single training.
 *
 * @param {Training} training - Training object
 * @param {UtilsFormatters} utils - Utils object with formatters
 * @returns {string} HTML string for popup
 *
 * @example
 * const html = createMapPopupHTML(training, utils)
 * marker.bindPopup(html)
 */
export function createMapPopupHTML(training, utils) {
  const probeIcon = training.probetraining === 'ja' ? POPUP_ICONS.checkCircle : POPUP_ICONS.xCircle

  return `
    <div class="md-map-popup">
      <!-- Header with gradient background -->
      <div class="md-map-popup-header">
        <div class="md-map-popup-icon">${POPUP_ICONS.bolt}</div>
        <div class="md-map-popup-title">
          <h3 class="md-typescale-title-medium font-bold">${training.training}</h3>
        </div>
      </div>

      <!-- Body content -->
      <div class="md-map-popup-body">
        <!-- Info grid with icons -->
        <div class="md-map-popup-info-grid">
          <div class="md-map-popup-info-icon">${POPUP_ICONS.calendar}</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium font-medium">${training.wochentag}</span>
          </div>

          <div class="md-map-popup-info-icon">${POPUP_ICONS.clock}</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium font-medium">${utils.formatZeitrange(training.von, training.bis)}</span>
          </div>

          <div class="md-map-popup-info-icon">${POPUP_ICONS.mapPin}</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium">${training.ort}</span>
          </div>

          ${training.adresse ? `
            <div class="md-map-popup-info-icon">${POPUP_ICONS.home}</div>
            <div class="md-map-popup-info-value">
              <span class="md-typescale-body-small">${training.adresse}</span>
            </div>
          ` : ''}

          <div class="md-map-popup-info-icon">${POPUP_ICONS.users}</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium">${utils.formatAlter(training)}</span>
          </div>

          <div class="md-map-popup-info-icon">${POPUP_ICONS.user}</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium">${training.trainer}</span>
          </div>

          <div class="md-map-popup-info-icon">${probeIcon}</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium ${training.probetraining === 'ja' ? 'font-semibold' : ''}"
                  style="color: ${training.probetraining === 'ja' ? 'var(--color-primary-600)' : 'var(--md-sys-color-on-surface)'};">
              ${training.probetraining === 'ja' ? 'Probetraining möglich' : 'Kein Probetraining'}
            </span>
          </div>
        </div>

        ${training.anmerkung ? `
          <div class="md-map-popup-note">
            <p class="md-typescale-label-small font-semibold mb-1 opacity-80">${POPUP_ICONS.lightBulb} Wichtiger Hinweis</p>
            <p class="md-typescale-body-small">${training.anmerkung}</p>
          </div>
        ` : ''}

        ${training.distanceText ? `
          <div class="md-map-popup-distance">
            <span class="md-typescale-body-medium">${POPUP_ICONS.ruler} ${training.distanceText} entfernt</span>
          </div>
        ` : ''}

        ${training.link ? `
          <div class="md-map-popup-action">
            <a href="${training.link}" target="_blank" rel="noopener noreferrer" class="md-btn-filled no-underline" style="color: white !important;">
              <span style="color: white !important;">Jetzt anmelden</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `
}
