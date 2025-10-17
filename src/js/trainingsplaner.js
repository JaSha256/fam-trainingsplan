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
import { createComputedProperties } from './trainingsplaner/computed-properties.js'
import { UrlFiltersManager } from './trainingsplaner/url-filters-manager.js'
import { FilterEngine } from './trainingsplaner/filter-engine.js'
import { FavoritesManager } from './trainingsplaner/favorites-manager.js'
import { GeolocationManager } from './trainingsplaner/geolocation-manager.js'
import { MapManager } from './trainingsplaner/map-manager.js'
import { DataLoader } from './trainingsplaner/data-loader.js'
import { ActionsManager } from './trainingsplaner/actions-manager.js'

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

  // Define state properties as getters/setters immediately
  // This allows accessing state before init() is called
  const component = {}

  Object.defineProperties(component, {
    // State properties (getters/setters for reactive access)
    allTrainings: { get: () => state.allTrainings, set: (v) => { state.allTrainings = v }, enumerable: true },
    filteredTrainings: { get: () => state.filteredTrainings, set: (v) => { state.filteredTrainings = v }, enumerable: true },
    favorites: { get: () => state.favorites, set: (v) => { state.favorites = v }, enumerable: true },
    metadata: { get: () => state.metadata, set: (v) => { state.metadata = v }, enumerable: true },
    fuse: { get: () => state.fuse, set: (v) => { state.fuse = v }, enumerable: true },
    loading: { get: () => state.loading, set: (v) => { state.loading = v }, enumerable: true },
    error: { get: () => state.error, set: (v) => { state.error = v }, enumerable: true },
    fromCache: { get: () => state.fromCache, set: (v) => { state.fromCache = v }, enumerable: true },
    userPosition: { get: () => state.userPosition, set: (v) => { state.userPosition = v }, enumerable: true },
    geolocationError: { get: () => state.geolocationError, set: (v) => { state.geolocationError = v }, enumerable: true },
    map: { get: () => state.map, set: (v) => { state.map = v }, enumerable: true },
    markers: { get: () => state.markers, set: (v) => { state.markers = v }, enumerable: true },
    userHasInteractedWithMap: { get: () => state.userHasInteractedWithMap, set: (v) => { state.userHasInteractedWithMap = v }, enumerable: true },
    updateCheckInterval: { get: () => state.updateCheckInterval, set: (v) => { state.updateCheckInterval = v }, enumerable: true },
    updateAvailable: { get: () => state.updateAvailable, set: (v) => { state.updateAvailable = v }, enumerable: true },
    latestVersion: { get: () => state.latestVersion, set: (v) => { state.latestVersion = v }, enumerable: true },
    searchTimeout: { get: () => state.searchTimeout, set: (v) => { state.searchTimeout = v }, enumerable: true },
    wochentagOrder: { get: () => state.wochentagOrder, set: (v) => { state.wochentagOrder = v }, enumerable: true }
  })

  // Define methods
  component.init = async function() {
      // Create Alpine context reference for managers
      // At runtime, Alpine.js has augmented this with $store, $watch, $nextTick
      const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (/** @type {any} */ (this))

      // Initialize Computed Properties (must be done FIRST)
      const computedProps = createComputedProperties(state, alpineContext)

      // Add computed properties to component (only getters)
      Object.defineProperties(this, {
        wochentage: { get: () => computedProps.wochentage },
        orte: { get: () => computedProps.orte },
        trainingsarten: { get: () => computedProps.trainingsarten },
        altersgruppen: { get: () => computedProps.altersgruppen },
        groupedTrainings: { get: () => computedProps.groupedTrainings },
        favoriteTrainings: { get: () => computedProps.favoriteTrainings },
        hasActiveFilters: { get: () => computedProps.hasActiveFilters },
        filteredTrainingsCount: { get: () => computedProps.filteredTrainingsCount }
      })

      // Initialize Managers
      this.urlFiltersManager = new UrlFiltersManager(alpineContext)

      this.filterEngine = new FilterEngine(state, alpineContext, {
        isFavorite: (id) => this.favoritesManager.isFavorite(id),
        updateUrl: () => this.urlFiltersManager.updateUrlWithFilters()
      })

      this.favoritesManager = new FavoritesManager(state, alpineContext, {
        applyFilters: () => this.filterEngine.applyFilters()
      })

      this.geolocationManager = new GeolocationManager(state, alpineContext, {
        applyFilters: () => this.filterEngine.applyFilters()
      })

      this.mapManager = new MapManager(state)

      this.dataLoader = new DataLoader(state, {
        addDistanceToTrainings: () => this.geolocationManager.addDistanceToTrainings(),
        applyFilters: () => this.filterEngine.applyFilters(),
        startUpdateCheck: () => this.dataLoader.startUpdateCheckInternal()
      })

      this.actionsManager = new ActionsManager(state, alpineContext, {
        get hasActiveFilters() { return computedProps.hasActiveFilters },
        get filteredTrainingsCount() { return computedProps.filteredTrainingsCount }
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
      this.watchFilters()

      // Load data
      await this.dataLoader.init()
  }

  component.watchFilters = function() {
      // At runtime, Alpine.js has augmented this with $store, $watch, $nextTick
      const alpineContext = /** @type {import('./trainingsplaner/types.js').AlpineComponent} */ (/** @type {any} */ (this))

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
          }, 100)
        },
        { deep: true }
      )

      alpineContext.$watch('$store.ui.mapModalOpen', (/** @type {boolean} */ isOpen) => {
        if (isOpen) {
          alpineContext.$nextTick(() => {
            alpineContext.mapManager.initializeMap()
          })
        } else {
          alpineContext.mapManager.cleanupMap()
        }
      })
  }

  // ==================== DELEGATED METHODS ====================

  // Filtering
  component.applyFilters = function() {
    return this.filterEngine.applyFilters()
  }

  component.matchesAltersgruppe = function(training, filterValue) {
    return this.filterEngine.matchesAltersgruppe(training, filterValue)
  }

  // Favorites
  component.loadFavorites = function() {
    return this.favoritesManager.loadFavorites()
  }

  component.isFavorite = function(trainingId) {
    return this.favoritesManager.isFavorite(trainingId)
  }

  component.toggleFavorite = function(trainingId) {
    return this.favoritesManager.toggleFavorite(trainingId)
  }

  component.quickFilterFavorites = function() {
    return this.favoritesManager.quickFilterFavorites()
  }

  // Geolocation
  component.requestUserLocation = function() {
    return this.geolocationManager.requestUserLocation()
  }

  component.addDistanceToTrainings = function() {
    return this.geolocationManager.addDistanceToTrainings()
  }

  // Map
  component.initializeMap = function() {
    return this.mapManager.initializeMap()
  }

  component.addMarkersToMap = function() {
    return this.mapManager.addMarkersToMap()
  }

  component.createMapPopup = function(training) {
    return this.mapManager.createMapPopup(training)
  }

  component.cleanupMap = function() {
    return this.mapManager.cleanupMap()
  }

  // URL Handling
  component.loadFiltersFromUrl = function() {
    return this.urlFiltersManager.loadFiltersFromUrl()
  }

  component.updateUrlWithFilters = function() {
    return this.urlFiltersManager.updateUrlWithFilters()
  }

  // Data Loading & Caching
  component.loadData = function(data) {
    return this.dataLoader.loadData(data)
  }

  component.getCachedData = function() {
    return this.dataLoader.getCachedData()
  }

  component.setCachedData = function(data) {
    return this.dataLoader.setCachedData(data)
  }

  component.startUpdateCheck = function() {
    return this.dataLoader.startUpdateCheckInternal()
  }

  component.checkForUpdates = function() {
    return this.dataLoader.checkForUpdates()
  }

  // Calendar & Actions
  component.addToGoogleCalendar = function(training) {
    return this.actionsManager.addToGoogleCalendar(training)
  }

  component.addToCalendar = function(training, provider = null) {
    return this.actionsManager.addToCalendar(training, provider)
  }

  component.bulkAddToGoogleCalendar = function() {
    return this.actionsManager.bulkAddToGoogleCalendar()
  }

  component.exportAllToCalendar = function() {
    return this.actionsManager.exportAllToCalendar()
  }

  component.exportFavoritesToCalendar = function() {
    return this.actionsManager.exportFavoritesToCalendar()
  }

  component.shareCurrentView = function() {
    return this.actionsManager.shareCurrentView()
  }

  // Utility Methods (remain inline as they're simple)
  component.sortTrainings = function(trainings) {
    return trainings.sort((a, b) => {
      const aMin = utils.zeitZuMinuten(a.von)
      const bMin = utils.zeitZuMinuten(b.von)
      return aMin - bMin
    })
  }

  component.getTrainingColor = function(training) {
    const t = (training || '').toLowerCase()
    if (t.includes('parkour'))
      return 'bg-blue-100 text-blue-800 border-blue-200'
    if (t.includes('trampolin'))
      return 'bg-green-100 text-green-800 border-green-200'
    if (t.includes('tricking'))
      return 'bg-purple-100 text-purple-800 border-purple-200'
    if (t.includes('movement'))
      return 'bg-orange-100 text-orange-800 border-orange-200'
    if (t.includes('fam')) return 'bg-pink-100 text-pink-800 border-pink-200'
    if (t.includes('flips')) return 'bg-red-100 text-red-800 border-red-200'
    if (t.includes('calistenics') || t.includes('calisthenics'))
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-slate-100 text-slate-800 border-slate-200'
  }

  component.formatAlter = function(training) {
    return utils.formatAlter(training)
  }

  component.formatZeitrange = function(von, bis) {
    return utils.formatZeitrange(von, bis)
  }

  // ==================== CLEANUP ====================

  component.destroy = function() {
    if (state.updateCheckInterval) {
      clearInterval(state.updateCheckInterval)
    }

    if (state.map) {
      this.mapManager.cleanupMap()
    }

    if (state.searchTimeout) {
      clearTimeout(state.searchTimeout)
    }
  }

  return component
}
