// @ts-check
/**
 * Trainingsplaner Alpine Component - Refactored v4.0
 * @file src/js/trainingsplaner.js
 * @version 4.0.0
 *
 * MAJOR REFACTOR:
 * - Modular architecture with 10+ specialized modules
 * - Full TypeScript type safety via JSDoc
 * - Zero @ts-ignore (clean type-checking)
 * - Single Responsibility Principle throughout
 * - Dependency injection for testability
 *
 * @module trainingsplaner
 */

import { CONFIG } from './config.js'
import { utils } from './utils.js'

// Import modular architecture
import { createTrainingsplanerState } from './trainingsplaner/state.js'
import { UrlFiltersManager } from './trainingsplaner/url-filters-manager.js'
import { FilterEngine } from './trainingsplaner/filter-engine.js'
import { FavoritesManager } from './trainingsplaner/favorites-manager.js'
import { GeolocationManager } from './trainingsplaner/geolocation-manager.js'
import { MapManager } from './trainingsplaner/map-manager.js'
import { DataLoader } from './trainingsplaner/data-loader.js'
import { ActionsManager } from './trainingsplaner/actions-manager.js'
import { QUICK_FILTERS } from './trainingsplaner/quick-filters.js'

/**
 * @typedef {import('./trainingsplaner/types.js').Training} Training
 * @typedef {import('./trainingsplaner/types.js').TrainingsplanerComponent} TrainingsplanerComponent
 */

/**
 * Trainingsplaner Component Factory
 *
 * Creates an Alpine.js component with modular architecture.
 * All business logic is delegated to specialized manager classes.
 * Alpine.js will augment this with $store, $watch, $nextTick at runtime.
 *
 * @returns {TrainingsplanerComponent} Component object (Alpine.js will add context properties)
 */
export function trainingsplaner() {
  // Create initial state
  const state = createTrainingsplanerState()

  // Define component with direct state properties (Alpine will make them reactive)
  // This allows Alpine's Proxy to track all changes
  // TypeScript: Cast to 'any' first to allow dynamic method additions, then to TrainingsplanerComponent at return
  /** @type {any} */
  const component = {
    // State properties (direct assignment for Alpine reactivity)
    allTrainings: state.allTrainings,
    filteredTrainings: state.filteredTrainings,
    favorites: state.favorites,
    metadata: state.metadata,
    fuse: state.fuse,
    loading: state.loading,
    error: state.error,
    fromCache: state.fromCache,
    userPosition: state.userPosition,
    geolocationError: state.geolocationError,
    map: state.map,
    markers: state.markers,
    markerClusterGroup: state.markerClusterGroup,
    userHasInteractedWithMap: state.userHasInteractedWithMap,
    updateCheckInterval: state.updateCheckInterval,
    updateAvailable: state.updateAvailable,
    latestVersion: state.latestVersion,
    searchTimeout: state.searchTimeout,
    wochentagOrder: state.wochentagOrder
  }

  // Computed properties (defined as getters AFTER base properties)
  Object.defineProperties(component, {
    // Computed properties (MUST be defined BEFORE init() so Alpine can access them immediately)
    wochentage: {
      get() {
        const order = [
          'Montag',
          'Dienstag',
          'Mittwoch',
          'Donnerstag',
          'Freitag',
          'Samstag',
          'Sonntag'
        ]
        const tage = this.metadata?.wochentage || order
        // Sort chronologically (Mo-So) instead of alphabetically
        return [...tage].sort((a, b) => {
          const aIdx = order.indexOf(a)
          const bIdx = order.indexOf(b)
          if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
          if (aIdx === -1) return 1
          if (bIdx === -1) return -1
          return aIdx - bIdx
        })
      },
      enumerable: true
    },
    orte: {
      get() {
        return this.metadata?.orte || utils.extractUnique(this.allTrainings, 'ort')
      },
      enumerable: true
    },
    trainingsarten: {
      get() {
        return this.metadata?.trainingsarten || utils.extractUnique(this.allTrainings, 'training')
      },
      enumerable: true
    },
    altersgruppen: {
      get() {
        const order = ['Minis', 'Kids', 'Teens', 'Adults']
        if (this.metadata?.altersgruppen) {
          // Sort age groups young → old instead of alphabetically
          return [...this.metadata.altersgruppen].sort((a, b) => {
            const aIdx = order.indexOf(a)
            const bIdx = order.indexOf(b)
            if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
            if (aIdx === -1) return 1 // Unknown groups last
            if (bIdx === -1) return -1
            return aIdx - bIdx
          })
        }
        const values = this.allTrainings
          .map((/** @type {Training} */ t) => t.altersgruppe)
          .filter((/** @type {any} */ v) => v && String(v).trim() !== '')
        /** @type {string[]} */
        const allGroups = []
        values.forEach((/** @type {any} */ val) => {
          String(val)
            .split(',')
            .forEach((/** @type {string} */ group) => {
              const cleaned = group.trim()
              if (cleaned && !allGroups.includes(cleaned)) {
                allGroups.push(cleaned)
              }
            })
        })
        // Sort age groups young → old instead of alphabetically
        return allGroups.sort((/** @type {string} */ a, /** @type {string} */ b) => {
          const aIdx = order.indexOf(a)
          const bIdx = order.indexOf(b)
          if (aIdx === -1 && bIdx === -1) return a.localeCompare(b)
          if (aIdx === -1) return 1 // Unknown groups last
          if (bIdx === -1) return -1
          return aIdx - bIdx
        })
      },
      enumerable: true
    },
    groupedTrainings: {
      get() {
        // At runtime, Alpine.js augments 'this' with $store
        const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
          /** @type {any} */ (this)
        )
        const groupingMode = alpineContext.$store?.ui?.groupingMode || 'wochentag'

        /** @type {Record<string, Training[]>} */
        const grouped = {}
        this.filteredTrainings.forEach((/** @type {Training} */ training) => {
          // AUFGABE 5: Dynamic grouping by weekday or location
          let key
          if (groupingMode === 'ort') {
            key = training.ort || 'Ohne Ort'
          } else {
            key = training.wochentag || 'Ohne Tag'
          }

          if (!grouped[key]) grouped[key] = []
          grouped[key].push(training)
        })

        // Sort group keys based on grouping mode
        let groupKeys
        if (groupingMode === 'ort') {
          // Sort locations alphabetically
          groupKeys = Object.keys(grouped).sort((/** @type {string} */ a, /** @type {string} */ b) => a.localeCompare(b))
        } else {
          // Sort weekdays chronologically (Mo-So)
          groupKeys = Object.keys(grouped).sort((/** @type {string} */ a, /** @type {string} */ b) => {
            return (this.wochentagOrder[a] || 999) - (this.wochentagOrder[b] || 999)
          })
        }

        return groupKeys.map((/** @type {string} */ key) => ({
          key: key,
          items: this.sortTrainings(grouped[key])
        }))
      },
      enumerable: true
    },
    favoriteTrainings: {
      get() {
        return this.allTrainings.filter((/** @type {Training} */ t) => this.favorites.includes(t.id))
      },
      enumerable: true
    },
    hasActiveFilters: {
      get() {
        // At runtime, Alpine.js augments 'this' with $store
        const filters = this.$store?.ui?.filters
        if (!filters) return false
        return (
          ['wochentag', 'ort', 'training', 'altersgruppe', 'searchTerm'].reduce(
            (/** @type {number} */ count, /** @type {string} */ key) => (filters[key] ? count + 1 : count),
            0
          ) > 0
        )
      },
      enumerable: true
    },
    filteredTrainingsCount: {
      get() {
        return this.filteredTrainings.length
      },
      enumerable: true
    }
  })

  // Define methods
  component.init = async function () {
    // Create Alpine context reference for managers
    // At runtime, Alpine.js has augmented this with $store, $watch, $nextTick
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )

    // NOTE: Computed properties are now defined at component creation (lines 74-155)
    // to prevent "undefined" errors during Alpine's initial template rendering

    // Initialize Managers
    this.urlFiltersManager = new UrlFiltersManager(alpineContext)

    this.filterEngine = new FilterEngine(state, alpineContext, {
      isFavorite: id => this.favoritesManager.isFavorite(id),
      updateUrl: () => this.urlFiltersManager.updateUrlWithFilters()
    })

    this.favoritesManager = new FavoritesManager(state, alpineContext, {
      applyFilters: () => this.filterEngine.applyFilters()
    })

    this.mapManager = new MapManager(state, alpineContext)

    this.geolocationManager = new GeolocationManager(state, alpineContext, {
      applyFilters: () => this.filterEngine.applyFilters(),
      mapManager: this.mapManager
    })

    this.dataLoader = new DataLoader(state, alpineContext, {
      addDistanceToTrainings: () => this.geolocationManager.addDistanceToTrainings(),
      applyFilters: () => this.filterEngine.applyFilters(),
      startUpdateCheck: () => this.dataLoader.startUpdateCheckInternal()
    })

    this.actionsManager = new ActionsManager(state, alpineContext, {
      get hasActiveFilters() {
        return alpineContext.hasActiveFilters
      },
      get filteredTrainingsCount() {
        return alpineContext.filteredTrainingsCount
      }
    })

    // Load Favorites
    if (CONFIG.features.enableFavorites) {
      this.favoritesManager.loadFavorites()
    }

    // Load URL Filters
    if (CONFIG.filters.persistInUrl) {
      this.urlFiltersManager.loadFiltersFromUrl()
    }

    // Setup watchers
    // @ts-expect-error - watchFilters defined below
    this.watchFilters()

    // Setup keyboard shortcuts
    // @ts-expect-error - handleKeyboardShortcuts defined below
    window.addEventListener('keydown', e => this.handleKeyboardShortcuts(e))

    // QW9: Setup scroll to top button visibility
    window.addEventListener(
      'scroll',
      () => {
        if (alpineContext.$store?.ui) {
          alpineContext.$store.ui.showScrollTop = window.scrollY > 500
        }
      },
      { passive: true }
    )

    // Load data
    await this.dataLoader.init()

    // Populate filter options store for dropdowns (after data loads)
    if (alpineContext.$store?.filterOptions) {
      alpineContext.$store.filterOptions.wochentage = alpineContext.wochentage
      alpineContext.$store.filterOptions.orte = alpineContext.orte
      alpineContext.$store.filterOptions.trainingsarten = alpineContext.trainingsarten
      alpineContext.$store.filterOptions.altersgruppen = alpineContext.altersgruppen
    }
  }

  component.watchFilters = function () {
    // At runtime, Alpine.js has augmented this with $store, $watch, $nextTick
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )

    /** @type {ReturnType<typeof setTimeout> | null} */
    let filterChangeTimeout = null

    alpineContext.$watch(
      '$store.ui.filters',
      () => {
        if (filterChangeTimeout !== null) {
          clearTimeout(filterChangeTimeout)
        }
        filterChangeTimeout = setTimeout(() => {
          alpineContext.filterEngine.applyFilters()

          // Auto-update map markers when filters change and map is active or split view
          if (
            (alpineContext.$store?.ui?.activeView === 'map' ||
              alpineContext.$store?.ui?.activeView === 'split') &&
            alpineContext.map
          ) {
            alpineContext.$nextTick(() => {
              alpineContext.mapManager.addMarkersToMap()
            })
          }
        }, 100)
      },
      { deep: true }
    )

    // Watch for map view (activeView state replaces mapModalOpen)
    alpineContext.$watch('$store.ui.activeView', (/** @type {string} */ activeView) => {
      if (activeView === 'map' || activeView === 'split') {
        alpineContext.$nextTick(() => {
          // Initialize map if not already initialized
          if (!alpineContext.map) {
            alpineContext.mapManager.initializeMap()
          } else {
            // Map exists, just make sure container is visible (handled by x-show in template)
            // Force map to recalculate size in case container dimensions changed
            alpineContext.map.invalidateSize()
          }
        })
      }
      // Note: We don't cleanup map when switching away - map instance persists
    })

    // Check initial state - initialize map if activeView is already 'map' or 'split'
    if (
      alpineContext.$store?.ui?.activeView === 'map' ||
      alpineContext.$store?.ui?.activeView === 'split'
    ) {
      alpineContext.$nextTick(() => {
        if (!alpineContext.map) {
          alpineContext.mapManager.initializeMap()
        }
      })
    }
  }

  // ==================== DELEGATED METHODS ====================
  // NOTE: TypeScript can't infer manager properties (filterEngine, favoritesManager, etc.)
  // because they're added dynamically in init(). These methods work correctly at runtime.

  // Filtering
  component.applyFilters = function () {
    return this.filterEngine.applyFilters()
  }

  component.matchesAltersgruppe = function (
    /** @type {Training} */ training,
    /** @type {string} */ filterValue
  ) {
    return this.filterEngine.matchesAltersgruppe(training, filterValue)
  }

  // Favorites
  component.loadFavorites = function () {
    return this.favoritesManager.loadFavorites()
  }

  component.isFavorite = function (/** @type {number} */ trainingId) {
    return this.favoritesManager.isFavorite(trainingId)
  }

  component.toggleFavorite = function (/** @type {number} */ trainingId) {
    return this.favoritesManager.toggleFavorite(trainingId)
  }

  component.quickFilterFavorites = function () {
    return this.favoritesManager.quickFilterFavorites()
  }

  /**
   * Quick Filter: Heute
   * QW3: Toggle filter for today's weekday (highest impact quick win!)
   * If already active, deactivates the filter. If not active, filters for today.
   * @returns {void}
   */
  component.quickFilterHeute = function () {
    // At runtime, Alpine.js augments 'this' with $store
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )

    if (!alpineContext.$store?.ui?.filters) return

    const currentActive = alpineContext.$store.ui.filters.activeQuickFilter

    // Toggle: wenn bereits aktiv → deaktivieren
    if (currentActive === 'heute') {
      alpineContext.$store.ui.filters = {
        wochentag: '',
        ort: '',
        training: '',
        altersgruppe: '',
        searchTerm: '',
        activeQuickFilter: null
      }
    } else {
      // Aktivieren: heute's Wochentag setzen
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

      alpineContext.$store.ui.filters.wochentag = heute
      alpineContext.$store.ui.filters.activeQuickFilter = 'heute'
    }

    // Apply filters
    this.applyFilters()
  }

  /**
   * Apply Quick Filter (Universal Method)
   *
   * Central method for all quick filters with toggle behavior.
   * Handles geolocation requests and custom filter logic.
   *
   * @param {string} filterName - Name of the quick filter to apply
   * @returns {Promise<void>}
   */
  component.applyQuickFilter = async function (filterName) {
    // At runtime, Alpine.js augments 'this' with $store
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )

    if (!alpineContext.$store?.ui?.filters) return

    const currentActive = alpineContext.$store.ui.filters.activeQuickFilter
    const filter = QUICK_FILTERS[filterName]

    if (!filter) {
      console.warn(`Unknown quick filter: ${filterName}`)
      return
    }

    // Toggle: wenn bereits aktiv → deaktivieren
    if (currentActive === filterName) {
      // Only clear the specific filter category, preserve others
      if (filter.category === 'zeit') {
        // Zeit filters clear wochentag and _customTimeFilter
        alpineContext.$store.ui.filters.wochentag = ''
        alpineContext.$store.ui.filters._customTimeFilter = ''
      } else if (filter.category === 'feature') {
        // Feature filters only clear _customFeatureFilter
        alpineContext.$store.ui.filters._customFeatureFilter = ''
      } else if (filter.category === 'ort') {
        // Location filters only clear _customLocationFilter
        alpineContext.$store.ui.filters._customLocationFilter = ''
      } else if (filter.category === 'persoenlich') {
        // Personal filters (Favoriten) are exclusive, clear everything
        alpineContext.clearAllFilters()
        return
      }

      alpineContext.$store.ui.filters.activeQuickFilter = null
      alpineContext.applyFilters()
      return
    }

    // Check if geolocation is required
    if (filter.requiresGeolocation && !alpineContext.userPosition) {
      // Request geolocation first
      const granted = await alpineContext.requestUserLocation()
      if (!granted) {
        alpineContext.$store.ui.showNotification(
          'Standort-Zugriff benötigt für "In meiner Nähe" Filter',
          'warning',
          3000
        )
        return
      }
      // Wait for distance calculation
      alpineContext.addDistanceToTrainings()
    }

    // Create context for filter
    const context = {
      allTrainings: alpineContext.allTrainings,
      favorites: alpineContext.favorites,
      userPosition: alpineContext.userPosition,
      applyFilters: () => alpineContext.applyFilters()
    }

    // Apply filter logic
    const result = filter.apply(alpineContext.$store.ui.filters, context)

    // If filter returns array directly, set filteredTrainings
    if (Array.isArray(result)) {
      alpineContext.filteredTrainings = result
    } else {
      // Otherwise use standard filter engine
      alpineContext.applyFilters()
    }

    // UX: Auto-close mobile filter drawer after quick filter selection
    // Check if we're on mobile (not desktop) using the lg breakpoint (1024px)
    const isMobile = !window.matchMedia('(min-width: 1024px)').matches
    if (isMobile && alpineContext.$store?.ui) {
      // Small delay to let the filter apply first, then close drawer
      setTimeout(() => {
        alpineContext.$store.ui.mobileFilterOpen = false

        // UX: Smooth scroll to results after drawer closes
        setTimeout(() => {
          const mainContent = document.getElementById('main-content')
          if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 200)
      }, 150)
    }
  }

  // Geolocation
  component.requestUserLocation = function () {
    return this.geolocationManager.requestUserLocation()
  }

  component.addDistanceToTrainings = function () {
    return this.geolocationManager.addDistanceToTrainings()
  }

  component.resetLocation = function () {
    return this.geolocationManager.resetLocation()
  }

  // Map
  component.initializeMap = function () {
    return this.mapManager.initializeMap()
  }

  component.addMarkersToMap = function () {
    return this.mapManager.addMarkersToMap()
  }

  component.createMapPopup = function (/** @type {Training} */ training) {
    return this.mapManager.createMapPopup(training)
  }

  component.cleanupMap = function () {
    return this.mapManager.cleanupMap()
  }

  component.zoomToFavorites = function () {
    return this.mapManager.zoomToFavorites()
  }

  // URL Handling
  component.loadFiltersFromUrl = function () {
    return this.urlFiltersManager.loadFiltersFromUrl()
  }

  component.updateUrlWithFilters = function () {
    return this.urlFiltersManager.updateUrlWithFilters()
  }

  // Data Loading & Caching
  component.loadData = function (/** @type {any} */ data) {
    return this.dataLoader.loadData(data)
  }

  component.getCachedData = function () {
    return this.dataLoader.getCachedData()
  }

  component.setCachedData = function (/** @type {any} */ data) {
    return this.dataLoader.setCachedData(data)
  }

  component.startUpdateCheck = function () {
    return this.dataLoader.startUpdateCheckInternal()
  }

  component.checkForUpdates = function () {
    return this.dataLoader.checkForUpdates()
  }

  // Calendar & Actions
  component.addToGoogleCalendar = function (/** @type {Training} */ training) {
    return this.actionsManager.addToGoogleCalendar(training)
  }

  component.addToCalendar = function (
    /** @type {Training} */ training,
    /** @type {string | null} */ provider = null
  ) {
    return this.actionsManager.addToCalendar(training, provider)
  }

  component.bulkAddToGoogleCalendar = function () {
    return this.actionsManager.bulkAddToGoogleCalendar()
  }

  component.exportAllToCalendar = function () {
    return this.actionsManager.exportAllToCalendar()
  }

  component.exportFavoritesToCalendar = function () {
    return this.actionsManager.exportFavoritesToCalendar()
  }

  component.shareCurrentView = function () {
    return this.actionsManager.shareCurrentView()
  }

  component.shareFavorites = function () {
    return this.actionsManager.shareFavorites()
  }

  // Utility Methods (remain inline as they're simple)
  /**
   * Sort Trainings with Multi-Level Cascade
   *
   * Implements flexible multi-level sorting using the Alpine.js store's sortBy array.
   * Supports 4 sort orders:
   * - Standard: Wochentag → Ort → Uhrzeit → Training
   * - Nach Uhrzeit: Uhrzeit → Wochentag → Ort → Training
   * - Nach Standort: Ort → Wochentag → Uhrzeit → Training
   * - Nach Training: Training → Wochentag → Ort → Uhrzeit
   *
   * @param {Training[]} trainings - Array of trainings to sort
   * @returns {Training[]} Sorted array
   */
  component.sortTrainings = function (/** @type {Training[]} */ trainings) {
    // At runtime, Alpine.js augments 'this' with $store
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )

    // Get sort order from store (default: wochentag → ort → uhrzeit → training)
    const sortBy = alpineContext.$store?.ui?.sortBy || ['wochentag', 'ort', 'uhrzeit', 'training']

    return trainings.sort((/** @type {Training} */ a, /** @type {Training} */ b) => {
      // Multi-level sorting cascade
      for (const field of sortBy) {
        let comparison = 0

        if (field === 'wochentag') {
          // Sort by weekday order (Mon-Sun)
          const aIdx = (a.wochentag && this.wochentagOrder[a.wochentag]) || 999
          const bIdx = (b.wochentag && this.wochentagOrder[b.wochentag]) || 999
          comparison = aIdx - bIdx
        } else if (field === 'ort') {
          // Sort by location alphabetically
          comparison = (a.ort || '').localeCompare(b.ort || '')
        } else if (field === 'uhrzeit') {
          // Sort by start time
          const aMin = utils.zeitZuMinuten(a.von)
          const bMin = utils.zeitZuMinuten(b.von)
          comparison = aMin - bMin
        } else if (field === 'training') {
          // Sort by training type alphabetically
          comparison = (a.training || '').localeCompare(b.training || '')
        }

        // If this field produces a difference, return it (cascade stops)
        if (comparison !== 0) return comparison
      }

      // All fields equal
      return 0
    })
  }

  /**
   * Get Training Color Badge Class
   * AUFGABE 3: Semantische Farbkodierung
   *
   * Returns semantic CSS class for training type badge with:
   * - WCAG AAA compliant colors (≥7:1 contrast)
   * - Dark mode support via training-colors.css
   * - Scientific color psychology (Blue=Trust, Green=Energy, etc.)
   *
   * @param {string} training - Training type name
   * @returns {string} CSS class for badge styling
   */
  component.getTrainingColor = function (/** @type {string} */ training) {
    const t = (training || '').toLowerCase()

    // AUFGABE 3: Semantic color badges (WCAG AAA compliant)
    if (t.includes('parkour')) return 'training-badge badge-parkour'
    if (t.includes('trampolin')) return 'training-badge badge-trampolin'
    if (t.includes('tricking')) return 'training-badge badge-tricking'
    if (t.includes('movement')) return 'training-badge badge-movement'
    if (t.includes('fam')) return 'training-badge badge-fam'

    // Fallback for other training types (maintain old styling for compatibility)
    if (t.includes('flips')) return 'bg-red-100 text-red-800 border-red-200'
    if (t.includes('calistenics') || t.includes('calisthenics'))
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'

    // Default fallback
    return 'bg-slate-100 text-slate-800 border-slate-200'
  }

  component.formatAlter = function (/** @type {Training} */ training) {
    return utils.formatAlter(training)
  }

  component.formatZeitrange = function (/** @type {string} */ von, /** @type {string} */ bis) {
    return utils.formatZeitrange(von, bis)
  }

  // ==================== FILTER & KEYBOARD ACTIONS ====================

  /**
   * Clear All Filters
   *
   * Resets all filter values to empty state and re-applies filters.
   * Used by "Alle löschen" button in filter chips UI.
   * Task 13: Multi-select arrays
   *
   * @returns {void}
   */
  component.clearAllFilters = function () {
    // At runtime, Alpine.js augments 'this' with $store
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )

    if (alpineContext.$store?.ui?.filters) {
      alpineContext.$store.ui.filters = {
        wochentag: [],
        ort: [],
        training: [],
        altersgruppe: [],
        searchTerm: '',
        activeQuickFilter: null,
        _customTimeFilter: '',
        _customFeatureFilter: '',
        _customLocationFilter: '',
        _customPersonalFilter: ''
      }
    }

    this.applyFilters()
  }

  // ==================== TASK 15: ACTIVE FILTER CHIPS ====================

  /**
   * Truncate Text with Ellipsis
   *
   * Helper function to truncate long text for filter chip display.
   *
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text with ellipsis if needed
   */
  component.truncateText = function (text, maxLength = 30) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  /**
   * Remove Category Filter
   *
   * Removes ALL filters from a specific category (e.g., all weekdays).
   *
   * @param {string} category - Filter category to clear
   * @returns {void}
   */
  component.removeCategoryFilter = function (/** @type {string} */ category) {
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )
    const filters = alpineContext.$store?.ui?.filters
    if (!filters) return

    // Clear array filters
    if (['wochentag', 'ort', 'training', 'altersgruppe'].includes(category)) {
      // @ts-expect-error - Dynamic category access is safe for known filter properties
      filters[category] = []
    }
    // Clear search
    else if (category === 'search') {
      filters.searchTerm = ''
    }
    // Clear quick filter
    else if (category === 'quickFilter') {
      filters.activeQuickFilter = null
    }

    this.applyFilters()
  }

  /**
   * Get Active Filter Chips
   *
   * Returns array of filter chips with SEPARATE chips for each filter value.
   * Task 15: Active Filter Chips Bar
   *
   * @returns {Array<{category: string, label: string, value: string, remove: () => void, tooltip: string, ariaLabel: string, prominent: boolean, styleClass: string, minTouchTarget: number}>}
   */
  component.getActiveFilterChips = function () {
    // At runtime, Alpine.js augments 'this' with $store
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )
    const filters = alpineContext.$store?.ui?.filters

    if (!filters) return []

    const chips = []

    // Wochentag filters (separate chip for each value)
    if (Array.isArray(filters.wochentag) && filters.wochentag.length > 0) {
      filters.wochentag.forEach((/** @type {string} */ value) => {
        chips.push({
          category: 'wochentag',
          label: 'Wochentag',
          value: value,
          remove: () => this.removeFilterChip('wochentag', value),
          tooltip: `Klicken zum Entfernen: Wochentag - ${value}`,
          ariaLabel: `Wochentag ${value} entfernen`,
          prominent: true,
          styleClass: 'filter-chip-primary',
          minTouchTarget: 44
        })
      })
    }

    // Ort filters (separate chip for each value)
    if (Array.isArray(filters.ort) && filters.ort.length > 0) {
      filters.ort.forEach((/** @type {string} */ value) => {
        chips.push({
          category: 'ort',
          label: 'Ort',
          value: value,
          remove: () => this.removeFilterChip('ort', value),
          tooltip: `Klicken zum Entfernen: Ort - ${value}`,
          ariaLabel: `Ort ${value} entfernen`,
          prominent: true,
          styleClass: 'filter-chip-primary',
          minTouchTarget: 44
        })
      })
    }

    // Training filters (separate chip for each value)
    if (Array.isArray(filters.training) && filters.training.length > 0) {
      filters.training.forEach((/** @type {string} */ value) => {
        chips.push({
          category: 'training',
          label: 'Training',
          value: value,
          remove: () => this.removeFilterChip('training', value),
          tooltip: `Klicken zum Entfernen: Training - ${value}`,
          ariaLabel: `Training ${value} entfernen`,
          prominent: true,
          styleClass: 'filter-chip-primary',
          minTouchTarget: 44
        })
      })
    }

    // Altersgruppe filters (separate chip for each value)
    if (Array.isArray(filters.altersgruppe) && filters.altersgruppe.length > 0) {
      filters.altersgruppe.forEach((/** @type {string} */ value) => {
        chips.push({
          category: 'altersgruppe',
          label: 'Altersgruppe',
          value: value,
          remove: () => this.removeFilterChip('altersgruppe', value),
          tooltip: `Klicken zum Entfernen: Altersgruppe - ${value}`,
          ariaLabel: `Altersgruppe ${value} entfernen`,
          prominent: true,
          styleClass: 'filter-chip-primary',
          minTouchTarget: 44
        })
      })
    }

    // Search term
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      chips.push({
        category: 'search',
        label: 'Suche',
        value: filters.searchTerm,
        remove: () => this.removeFilterChip('search', filters.searchTerm),
        tooltip: `Klicken zum Entfernen: Suche - ${filters.searchTerm}`,
        ariaLabel: `Suche ${filters.searchTerm} entfernen`,
        prominent: true,
        styleClass: 'filter-chip-primary',
        minTouchTarget: 44
      })
    }

    // Quick filter
    if (filters.activeQuickFilter) {
      // Get human-readable label for quick filter
      /** @type {Record<string, string>} */
      const quickFilterLabels = {
        heute: 'Heute',
        morgen: 'Morgen',
        wochenende: 'Wochenende',
        probetraining: 'Probetraining',
        favoriten: 'Favoriten',
        'in-meiner-naehe': 'In meiner Nähe'
      }

      const qfValue = quickFilterLabels[filters.activeQuickFilter] || filters.activeQuickFilter

      chips.push({
        category: 'quickFilter',
        label: 'Quick-Filter',
        value: qfValue,
        remove: () => this.removeFilterChip('quickFilter', filters.activeQuickFilter),
        tooltip: `Klicken zum Entfernen: Quick-Filter - ${qfValue}`,
        ariaLabel: `Quick-Filter ${qfValue} entfernen`,
        prominent: true,
        styleClass: 'filter-chip-primary',
        minTouchTarget: 44
      })
    }

    return chips
  }

  /**
   * Get Displayed Filter Chips (Max 3)
   *
   * Returns first 3 active filter chips for display.
   * Task 15: Sticky filter chips bar
   *
   * @returns {Array<{category: string, label: string, value: string, remove: () => void}>}
   */
  component.getDisplayedFilterChips = function () {
    const allChips = this.getActiveFilterChips()
    return allChips.slice(0, 3)
  }

  /**
   * Get Overflow Filter Count
   *
   * Returns count of filters beyond the first 3 displayed chips.
   * Task 15: Sticky filter chips bar
   *
   * @returns {number}
   */
  component.getOverflowFilterCount = function () {
    const allChips = this.getActiveFilterChips()
    return Math.max(0, allChips.length - 3)
  }

  /**
   * Get Active Filter Count
   *
   * Returns total count of all active filters.
   * Task 15: Sticky filter chips bar
   *
   * @returns {number}
   */
  component.getActiveFilterCount = function () {
    return this.getActiveFilterChips().length
  }

  /**
   * Remove Filter Chip
   *
   * Removes a specific filter value and re-applies filters.
   * Task 15: Sticky filter chips bar
   *
   * @param {string} category - Filter category (wochentag, ort, training, altersgruppe, search, quickFilter)
   * @param {string} value - Filter value to remove
   * @returns {void}
   */
  component.removeFilterChip = function (category, value) {
    // At runtime, Alpine.js augments 'this' with $store
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )
    const filters = alpineContext.$store?.ui?.filters

    if (!filters) return

    // Handle array filters (wochentag, ort, training, altersgruppe)
    if (['wochentag', 'ort', 'training', 'altersgruppe'].includes(category)) {
      // @ts-expect-error - Dynamic category access is safe for known filter properties
      if (Array.isArray(filters[category])) {
        // @ts-expect-error - Dynamic category access is safe for known filter properties
        filters[category] = filters[category].filter((/** @type {string} */ v) => v !== value)
      }
    }
    // Handle search term
    else if (category === 'search') {
      filters.searchTerm = ''
    }
    // Handle quick filter
    else if (category === 'quickFilter') {
      filters.activeQuickFilter = null
    }

    // Re-apply filters
    this.applyFilters()
  }

  /**
   * Get Results Count
   *
   * Returns the count of filtered trainings.
   * Task 15: Sticky filter chips bar
   *
   * @returns {number}
   */
  component.getResultsCount = function () {
    return this.filteredTrainings?.length || 0
  }

  /**
   * Get Results Count Text
   *
   * Returns formatted German text for results count (singular/plural).
   * Task 15: Sticky filter chips bar
   *
   * @returns {string}
   */
  component.getResultsCountText = function () {
    const count = this.getResultsCount()
    if (count === 1) {
      return '1 Training gefunden'
    }
    return `${count} Trainings gefunden`
  }

  /**
   * Should Show Filter Chips
   *
   * Returns true if any filters are active and chips bar should be displayed.
   * Task 15: Sticky filter chips bar
   *
   * @returns {boolean}
   */
  component.shouldShowFilterChips = function () {
    return this.getActiveFilterCount() > 0
  }

  /**
   * Should Clear Button Be Prominent
   *
   * Returns true if "Alle loschen" button should have prominent styling.
   * Prominent when 3 or more filters are active (user needs more obvious reset option).
   * UX Enhancement: Better visibility for clear all button
   *
   * @returns {boolean}
   */
  component.shouldClearButtonBeProminent = function () {
    return this.getActiveFilterCount() >= 3
  }

  /**
   * Handle Keyboard Shortcuts
   *
   * Global keyboard shortcuts for power users:
   * - Ctrl/Cmd + F: Toggle filter sidebar (desktop only)
   * - Escape: Close open modals in priority order (map → mobile filters)
   *
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {void}
   */
  component.handleKeyboardShortcuts = function (event) {
    // At runtime, Alpine.js augments 'this' with $store
    const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (
      /** @type {any} */ (this)
    )

    // Ctrl/Cmd + F: Toggle filter sidebar (desktop only)
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      // Check if we're on desktop (lg breakpoint)
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches

      if (isDesktop && alpineContext.$store?.ui) {
        event.preventDefault()
        alpineContext.$store.ui.filterSidebarOpen = !alpineContext.$store.ui.filterSidebarOpen
      }
    }

    // Escape: Close modals in priority order
    if (event.key === 'Escape') {
      if (alpineContext.$store?.ui) {
        // Switch away from map view first (highest priority)
        if (alpineContext.$store.ui.activeView === 'map') {
          alpineContext.$store.ui.activeView = 'list'
          event.preventDefault()
          return
        }

        // Then mobile filter drawer
        if (alpineContext.$store.ui.mobileFilterOpen) {
          alpineContext.$store.ui.mobileFilterOpen = false
          event.preventDefault()
          return
        }
      }
    }
  }

  // ==================== CLEANUP ====================

  component.destroy = function () {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval)
    }

    if (this.map) {
      this.mapManager.cleanupMap()
    }

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
  }

  // Return component with explicit type (TypeScript now knows all methods exist)
  return /** @type {TrainingsplanerComponent} */ (component)
}
