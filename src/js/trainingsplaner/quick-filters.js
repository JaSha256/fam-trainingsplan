// @ts-check
/**
 * Quick Filters Definition Module
 * @file src/js/trainingsplaner/quick-filters.js
 * @version 1.0.0
 *
 * Central definition of all quick filter configurations.
 * Each filter defines its category, label, and filter logic.
 */

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('../types.js').Filter} Filter
 */

/**
 * @typedef {Object} QuickFilterContext
 * @property {Training[]} allTrainings - All trainings
 * @property {number[]} favorites - Favorite training IDs
 * @property {{lat: number, lng: number} | null} userPosition - User's geolocation
 * @property {() => void} applyFilters - Apply filters callback
 */

/**
 * @typedef {Object} QuickFilter
 * @property {string} label - Display label
 * @property {'zeit' | 'feature' | 'ort' | 'persoenlich'} category - Filter category
 * @property {string} [color] - Custom color classes (default: primary)
 * @property {boolean} [requiresGeolocation] - Whether filter needs user location
 * @property {boolean} [customFilter] - Whether this uses custom filtering logic
 * @property {(filters: Filter, context: QuickFilterContext) => Training[] | void} apply - Filter logic
 */

/**
 * Quick Filter Definitions
 *
 * Each filter can either:
 * 1. Set filter criteria (wochentag, ort, etc.) and call applyFilters()
 * 2. Return a filtered Training[] array directly
 *
 * @type {Record<string, QuickFilter>}
 */
export const QUICK_FILTERS = {
  // ==================== ZEIT-BASIERT ====================

  /**
   * Heute - Today's weekday trainings
   * Most popular quick filter (QW3)
   */
  heute: {
    label: 'Heute',
    category: 'zeit',
    color: 'primary',
    apply: (filters, _context) => {
      // Get today's weekday name (0 = Sonntag, 1 = Montag, ...)
      const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      const heute = wochentage[new Date().getDay()]

      // Clear custom time filters (Zeit-Filter sind exklusiv)
      filters._customTimeFilter = ''

      // Set filter criteria
      filters.wochentag = heute
      filters.activeQuickFilter = 'heute'

      // No return - uses standard filter engine
    }
  },

  /**
   * Morgen - Tomorrow's weekday trainings
   */
  morgen: {
    label: 'Morgen',
    category: 'zeit',
    color: 'primary',
    apply: (filters, _context) => {
      // Get tomorrow's weekday name
      const wochentage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
      const morgen = wochentage[(new Date().getDay() + 1) % 7]

      // Clear custom time filters (Zeit-Filter sind exklusiv)
      filters._customTimeFilter = ''

      // Set filter criteria
      filters.wochentag = morgen
      filters.activeQuickFilter = 'morgen'

      // No return - uses standard filter engine
    }
  },

  /**
   * Wochenende - Weekend trainings (Saturday & Sunday)
   */
  wochenende: {
    label: 'Wochenende',
    category: 'zeit',
    color: 'primary',
    customFilter: true, // Uses custom filtering logic
    apply: (filters, _context) => {
      // Clear other time filters (Zeit-Filter sind exklusiv)
      filters.wochentag = ''
      filters.activeQuickFilter = 'wochenende'

      // Custom filter: wochenende
      filters._customTimeFilter = 'wochenende'
    }
  },

  /**
   * Wochentags - Weekday trainings (Monday to Friday)
   */
  wochentags: {
    label: 'Wochentags',
    category: 'zeit',
    color: 'primary',
    customFilter: true, // Uses custom filtering logic
    apply: (filters, _context) => {
      // Clear other time filters (Zeit-Filter sind exklusiv)
      filters.wochentag = ''
      filters.activeQuickFilter = 'wochentags'

      // Custom filter: wochentags
      filters._customTimeFilter = 'wochentags'
    }
  },

  // ==================== FEATURE-BASIERT ====================

  /**
   * Probetraining - Trial trainings only
   */
  probetraining: {
    label: 'Probetraining',
    category: 'feature',
    color: 'green',
    customFilter: true,
    apply: (filters, _context) => {
      // Don't clear other filters - keep zeit/ort filters
      filters.activeQuickFilter = 'probetraining'

      // Custom filter: probetraining
      filters._customFeatureFilter = 'probetraining'
    }
  },

  // ==================== ORT-BASIERT ====================

  /**
   * In meiner Nähe - Trainings within 5km radius
   * Requires user's geolocation permission
   */
  inMeinerNaehe: {
    label: 'In meiner Nähe',
    category: 'ort',
    color: 'blue',
    requiresGeolocation: true,
    customFilter: true,
    apply: (filters, context) => {
      // Check if user position is available
      if (!context.userPosition) {
        // Geolocation will be requested by applyQuickFilter()
        return
      }

      // Don't clear other filters - keep zeit/feature filters
      filters.ort = '' // Clear standard ort filter
      filters.activeQuickFilter = 'inMeinerNaehe'

      // Custom filter: in meiner Nähe
      filters._customLocationFilter = 'inMeinerNaehe'
    }
  },

  // ==================== PERSÖNLICH ====================

  /**
   * Favoriten - Favorite trainings only
   * Uses FavoritesManager for filtering
   */
  favoriten: {
    label: 'Favoriten',
    category: 'persoenlich',
    color: 'yellow',
    customFilter: true,
    apply: (filters, _context) => {
      // Clear ALL filters - Favoriten is exclusive
      filters.wochentag = ''
      filters.ort = ''
      filters.training = ''
      filters.altersgruppe = ''
      filters.searchTerm = ''
      filters._customTimeFilter = ''
      filters._customFeatureFilter = ''
      filters._customLocationFilter = ''
      filters.activeQuickFilter = 'favoriten'

      // Custom filter: favoriten
      filters._customPersonalFilter = 'favoriten'
    }
  }
}

/**
 * Get color classes for quick filter button
 *
 * @param {string} filterName - Filter name
 * @param {boolean} isActive - Whether filter is active
 * @returns {string} Tailwind CSS classes
 */
export function getQuickFilterColorClasses(filterName, isActive) {
  if (isActive) {
    return 'bg-primary-500 text-white hover:bg-primary-600'
  }

  const filter = QUICK_FILTERS[filterName]
  const color = filter?.color || 'primary'

  /** @type {Record<string, string>} */
  const colorMap = {
    primary: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
    yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100'
  }

  return colorMap[color] || colorMap.primary
}

/**
 * Get filters by category
 *
 * @param {'zeit' | 'feature' | 'ort' | 'persoenlich'} category - Filter category
 * @returns {Array<[string, QuickFilter]>} Array of [filterName, filterConfig] tuples
 */
export function getFiltersByCategory(category) {
  return Object.entries(QUICK_FILTERS).filter(
    ([/** @type {string} */ _, /** @type {QuickFilter} */ filter]) => filter.category === category
  )
}
