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
 * Calculate trainings sorted by distance from user location
 *
 * Adds `distance` and `distanceText` properties to each training.
 * Sorts trainings by distance (nearest first).
 *
 * @param {Training[]} trainings - Array of trainings
 * @param {[number, number]} userLocation - [lat, lng] of user
 * @returns {Training[]} Trainings sorted by distance with added distance properties
 *
 * @example
 * const sorted = sortTrainingsByDistance(trainings, [48.137154, 11.576124])
 * // Returns trainings sorted by proximity, with distance and distanceText added
 */
export function sortTrainingsByDistance(trainings, userLocation) {
  return trainings
    .map((training) => {
      if (!training.lat || !training.lng) {
        return { ...training, distance: Infinity, distanceText: 'Unbekannt' }
      }

      const distance = calculateDistance(userLocation, [training.lat, training.lng])
      return {
        ...training,
        distance,
        distanceText: formatDistance(distance)
      }
    })
    .sort((a, b) => a.distance - b.distance)
}

/**
 * Filter trainings by maximum distance from user
 *
 * Returns only trainings within specified distance from user location.
 *
 * @param {Training[]} trainings - Array of trainings
 * @param {[number, number]} userLocation - [lat, lng] of user
 * @param {number} maxDistanceKm - Maximum distance in kilometers
 * @returns {Training[]} Filtered trainings within distance
 *
 * @example
 * const nearby = filterTrainingsByDistance(trainings, [48.137154, 11.576124], 5)
 * // Returns only trainings within 5 km of user location
 */
export function filterTrainingsByDistance(trainings, userLocation, maxDistanceKm) {
  return trainings.filter((training) => {
    if (!training.lat || !training.lng) return false
    const distance = calculateDistance(userLocation, [training.lat, training.lng])
    return distance <= maxDistanceKm
  })
}

/**
 * Get map bounds for array of coordinates
 *
 * Calculates the bounding box that contains all given coordinates.
 * Useful for fitBounds() operations.
 *
 * @param {Array<[number, number]>} coords - Array of [lat, lng] coordinates
 * @returns {[[number, number], [number, number]] | null} Bounds as [[minLat, minLng], [maxLat, maxLng]] or null if empty
 *
 * @example
 * const bounds = getBoundsForCoordinates([[48.1, 11.5], [48.2, 11.6]])
 * map.fitBounds(bounds)
 */
export function getBoundsForCoordinates(coords) {
  if (!coords || coords.length === 0) return null

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  coords.forEach(([lat, lng]) => {
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
    if (lng < minLng) minLng = lng
    if (lng > maxLng) maxLng = lng
  })

  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ]
}

/**
 * Check if coordinates are within Munich area
 *
 * Validates if coordinates are within approximate Munich city bounds.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if within Munich area
 *
 * @example
 * isWithinMunich(48.137154, 11.576124) // true (Munich center)
 * isWithinMunich(52.520008, 13.404954) // false (Berlin)
 */
export function isWithinMunich(lat, lng) {
  const MUNICH_BOUNDS = {
    minLat: 47.9,
    maxLat: 48.3,
    minLng: 11.3,
    maxLng: 11.9
  }

  return (
    lat >= MUNICH_BOUNDS.minLat &&
    lat <= MUNICH_BOUNDS.maxLat &&
    lng >= MUNICH_BOUNDS.minLng &&
    lng <= MUNICH_BOUNDS.maxLng
  )
}

/**
 * Geocode address to coordinates (placeholder)
 *
 * NOTE: This is a placeholder. Real implementation would use a geocoding service.
 * Consider using Nominatim (OpenStreetMap) or Google Maps Geocoding API.
 *
 * @param {string} address - Address to geocode
 * @returns {Promise<[number, number] | null>} Coordinates or null if not found
 *
 * @example
 * const coords = await geocodeAddress('Marienplatz 1, München')
 * // Returns [48.137154, 11.576124] or null
 */
export async function geocodeAddress(address) {
  // TODO: Implement geocoding using Nominatim or Google Maps
  console.warn('Geocoding not yet implemented:', address)
  return null
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
 * Sort trainings by various criteria
 *
 * @param {Training[]} trainings - Array of trainings
 * @param {string} sortBy - Sort criterion (day, time, age, name)
 * @returns {Training[]} Sorted trainings
 */
export function sortTrainings(trainings, sortBy) {
  const sorted = [...trainings]

  /** @type {Record<string, number>} */
  const dayOrder = {
    'Montag': 1, 'Dienstag': 2, 'Mittwoch': 3, 'Donnerstag': 4,
    'Freitag': 5, 'Samstag': 6, 'Sonntag': 7
  }

  switch (sortBy) {
    case 'day':
      return sorted.sort((a, b) => {
        const dayA = dayOrder[a.wochentag] || 99
        const dayB = dayOrder[b.wochentag] || 99
        return dayA - dayB
      })
    case 'time':
      return sorted.sort((a, b) => {
        const timeA = a.von || '00:00'
        const timeB = b.von || '00:00'
        return timeA.localeCompare(timeB)
      })
    case 'age':
      return sorted.sort((a, b) => {
        const ageA = parseInt(String(a.vonalter || 0))
        const ageB = parseInt(String(b.vonalter || 0))
        return ageA - ageB
      })
    case 'name':
      return sorted.sort((a, b) => a.training.localeCompare(b.training))
    default:
      return sorted
  }
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
           }
         }"
         x-init="trainings = JSON.parse(decodeURIComponent(atob($el.dataset.trainingsB64)))"
      <!-- Header -->
      <div class="md-map-location-header">
        <div class="md-map-popup-icon">📍</div>
        <div class="md-map-popup-title flex-1">
          <h3 class="md-typescale-title-medium font-bold">${locationName}</h3>
          <p class="md-typescale-body-small opacity-90">${count} Training${count > 1 ? 's' : ''} an diesem Standort</p>
          ${address ? `<p class="md-typescale-body-small opacity-80 mt-0.5">🏠 ${address}</p>` : ''}
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
            <option value="day">📅 Wochentag</option>
            <option value="time">🕐 Uhrzeit</option>
            <option value="age">👥 Altersgruppe</option>
            <option value="name">🥋 Trainingsname</option>
          </select>
        </div>
      </div>

      <!-- Scrollable trainings list -->
      <div class="md-map-location-list">
        <template x-for="(training, index) in sorted" :key="training.id">
          <div class="md-map-location-item">
            <!-- Training header with icon -->
            <div class="flex items-start gap-3 mb-3">
              <div class="md-map-popup-icon" style="width: 36px; height: 36px; font-size: 18px; background-color: rgba(var(--color-primary-rgb, 0, 115, 230), 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                🥋
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="md-typescale-title-small font-semibold mb-1" x-text="training.training"></h4>
                <span x-show="training.probetraining === 'ja'"
                      class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                      style="background-color: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); font-weight: 600;">
                  ✅ Probetraining möglich
                </span>
              </div>
            </div>

            <!-- Training details grid with consistent styling -->
            <div class="md-map-popup-info-grid" style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; margin-bottom: 1rem;">
              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant); font-size: 16px;">
                📅
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium font-medium" x-text="training.wochentag"></span>
              </div>

              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant); font-size: 16px;">
                🕐
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium font-medium" x-text="training.von + ' - ' + training.bis + ' Uhr'"></span>
              </div>

              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant); font-size: 16px;">
                👥
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium" x-text="training.altersgruppe || 'Alle Altersgruppen'"></span>
              </div>

              <div class="md-map-popup-info-icon" style="display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant); font-size: 16px;">
                👤
              </div>
              <div class="md-map-popup-info-value" style="display: flex; align-items: center;">
                <span class="md-typescale-body-medium" x-text="training.trainer"></span>
              </div>
            </div>

            <!-- Note with better styling -->
            <div x-show="training.anmerkung"
                 class="md-map-popup-note"
                 style="background: linear-gradient(135deg, var(--md-sys-color-primary-container) 0%, var(--md-sys-color-secondary-container) 100%); color: var(--md-sys-color-on-primary-container); padding: 0.75rem; border-radius: 8px; margin-top: 1rem; border-left: 3px solid var(--color-primary-500);">
              <p class="md-typescale-label-small font-semibold mb-1 opacity-80" style="margin: 0 0 0.25rem 0;">💡 Wichtiger Hinweis</p>
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
  return `
    <div class="md-map-popup">
      <!-- Header with gradient background -->
      <div class="md-map-popup-header">
        <div class="md-map-popup-icon">🥋</div>
        <div class="md-map-popup-title">
          <h3 class="md-typescale-title-medium font-bold">${training.training}</h3>
        </div>
      </div>

      <!-- Body content -->
      <div class="md-map-popup-body">
        <!-- Info grid with icons -->
        <div class="md-map-popup-info-grid">
          <div class="md-map-popup-info-icon">📅</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium font-medium">${training.wochentag}</span>
          </div>

          <div class="md-map-popup-info-icon">🕐</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium font-medium">${utils.formatZeitrange(training.von, training.bis)}</span>
          </div>

          <div class="md-map-popup-info-icon">📍</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium">${training.ort}</span>
          </div>

          ${training.adresse ? `
            <div class="md-map-popup-info-icon">🏠</div>
            <div class="md-map-popup-info-value">
              <span class="md-typescale-body-small">${training.adresse}</span>
            </div>
          ` : ''}

          <div class="md-map-popup-info-icon">👥</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium">${utils.formatAlter(training)}</span>
          </div>

          <div class="md-map-popup-info-icon">👤</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium">${training.trainer}</span>
          </div>

          <div class="md-map-popup-info-icon">${training.probetraining === 'ja' ? '✅' : '❌'}</div>
          <div class="md-map-popup-info-value">
            <span class="md-typescale-body-medium ${training.probetraining === 'ja' ? 'font-semibold' : ''}"
                  style="color: ${training.probetraining === 'ja' ? 'var(--color-primary-600)' : 'var(--md-sys-color-on-surface)'};">
              ${training.probetraining === 'ja' ? 'Probetraining möglich' : 'Kein Probetraining'}
            </span>
          </div>
        </div>

        ${training.anmerkung ? `
          <div class="md-map-popup-note">
            <p class="md-typescale-label-small font-semibold mb-1 opacity-80">💡 Wichtiger Hinweis</p>
            <p class="md-typescale-body-small">${training.anmerkung}</p>
          </div>
        ` : ''}

        ${training.distanceText ? `
          <div class="md-map-popup-distance">
            <span class="md-typescale-body-medium">📏 ${training.distanceText} entfernt</span>
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
