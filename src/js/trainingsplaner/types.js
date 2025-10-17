// @ts-check
/**
 * Trainingsplaner Module Types
 * @file src/js/trainingsplaner/types.js
 * @version 3.0.0
 *
 * Central type definitions for all trainingsplaner modules
 */

/**
 * @typedef {import('../types.js').Training} Training
 * @typedef {import('../types.js').Filter} Filter
 * @typedef {import('../types.js').Metadata} Metadata
 * @typedef {import('../types.js').UserPosition} UserPosition
 * @typedef {import('../types.js').ApiResponse} ApiResponse
 */

// ==================== ALPINE.JS TYPES ====================

/**
 * Alpine.js Store UI Interface
 * @typedef {Object} AlpineUIStore
 * @property {Filter} filters - Current filter state
 * @property {boolean} filterSidebarOpen - Filter sidebar open state
 * @property {boolean} mapModalOpen - Map modal open state
 * @property {boolean} mobileFilterOpen - Mobile filter open state
 * @property {boolean} mapView - Map view active
 * @property {import('../types.js').Notification | null} notification - Current notification
 * @property {number | null} notificationTimeout - Notification timeout ID
 * @property {() => void} toggleMapView - Toggle map view
 * @property {() => void} showListView - Show list view
 * @property {(message: string, type?: import('../types.js').NotificationType, duration?: number) => void} showNotification - Show notification
 * @property {() => void} hideNotification - Hide notification
 * @property {() => void} resetFilters - Reset all filters
 */

/**
 * Alpine.js Store Context
 * @typedef {Object} AlpineStoreContext
 * @property {AlpineUIStore} ui - UI Store
 */

/**
 * Alpine.js Component Context (this binding)
 * @typedef {Object} AlpineContext
 * @property {AlpineStoreContext} $store - Alpine store
 * @property {(callback: () => void) => Promise<void>} $nextTick - Next tick callback
 * @property {(expression: string, callback: (value: any) => void, options?: {deep?: boolean}) => void} $watch - Watch reactive property
 */

// ==================== STATE TYPES ====================

/**
 * Trainingsplaner State
 * @typedef {Object} TrainingsplanerState
 * @property {Training[]} allTrainings - All trainings
 * @property {Training[]} filteredTrainings - Filtered trainings
 * @property {Metadata | null} metadata - Metadata from API
 * @property {boolean} loading - Loading state
 * @property {string | null} error - Error message
 * @property {boolean} fromCache - Data loaded from cache
 * @property {ReturnType<typeof setTimeout> | null} searchTimeout - Search debounce timeout
 * @property {import('fuse.js').default<Training> | null} fuse - Fuse.js instance
 * @property {import('leaflet').Map | null} map - Leaflet map instance
 * @property {import('leaflet').Marker[]} markers - Map markers
 * @property {boolean} userHasInteractedWithMap - User has interacted with map
 * @property {UserPosition | null} userPosition - User's geolocation
 * @property {string | null} geolocationError - Geolocation error message
 * @property {boolean} geolocationLoading - Geolocation loading state
 * @property {number[]} favorites - Favorite training IDs
 * @property {boolean} updateAvailable - Update available flag
 * @property {string | null} latestVersion - Latest app version
 * @property {ReturnType<typeof setInterval> | null} updateCheckInterval - Update check interval ID
 * @property {Record<string, number>} wochentagOrder - Weekday sorting order
 */

// ==================== COMPONENT TYPES ====================

/**
 * Grouped Trainings
 * @typedef {Object} GroupedTraining
 * @property {string} key - Group key (weekday)
 * @property {Training[]} items - Trainings in group
 */

/**
 * Trainingsplaner Component Base (Before Alpine.js Augmentation)
 *
 * This represents the object returned from trainingsplaner() factory.
 * Alpine.js will augment this with AlpineContext properties at runtime.
 *
 * @typedef {TrainingsplanerState & {
 *   urlFiltersManager?: any
 *   filterEngine?: any
 *   favoritesManager?: any
 *   geolocationManager?: any
 *   mapManager?: any
 *   dataLoader?: any
 *   actionsManager?: any
 *   init: () => Promise<void>
 *   watchFilters: () => void
 *   loadData: (data: ApiResponse) => void
 *   applyFilters: () => void
 *   matchesAltersgruppe: (training: Training, filterValue: string) => boolean
 *   sortTrainings: (trainings: Training[]) => Training[]
 *   addToGoogleCalendar: (training: Training) => void
 *   addToCalendar: (training: Training, provider?: string | null) => void
 *   bulkAddToGoogleCalendar: () => Promise<void>
 *   exportAllToCalendar: () => Promise<void>
 *   exportFavoritesToCalendar: () => Promise<void>
 *   shareCurrentView: () => Promise<void>
 *   loadFavorites: () => void
 *   isFavorite: (trainingId: number) => boolean
 *   toggleFavorite: (trainingId: number) => boolean
 *   quickFilterFavorites: () => void
 *   requestUserLocation: () => Promise<boolean>
 *   addDistanceToTrainings: () => void
 *   initializeMap: () => void
 *   addMarkersToMap: () => void
 *   createMapPopup: (training: Training) => string
 *   cleanupMap: () => void
 *   loadFiltersFromUrl: () => void
 *   updateUrlWithFilters: () => void
 *   getCachedData: () => ApiResponse | null
 *   setCachedData: (data: ApiResponse) => void
 *   startUpdateCheck: () => void
 *   checkForUpdates: () => Promise<void>
 *   getTrainingColor: (training: string) => string
 *   formatAlter: (training: Training) => string
 *   formatZeitrange: (von: string, bis: string) => string
 *   destroy: () => void
 * }} TrainingsplanerComponent
 */

/**
 * Alpine Component (Full Interface)
 *
 * This represents the complete Alpine.js component with all properties,
 * methods, getters, and Alpine.js context properties.
 *
 * @typedef {TrainingsplanerState & AlpineContext & {
 *   urlFiltersManager?: any
 *   filterEngine?: any
 *   favoritesManager?: any
 *   geolocationManager?: any
 *   mapManager?: any
 *   dataLoader?: any
 *   actionsManager?: any
 *   init: () => Promise<void>
 *   watchFilters: () => void
 *   loadData: (data: ApiResponse) => void
 *   applyFilters: () => void
 *   matchesAltersgruppe: (training: Training, filterValue: string) => boolean
 *   sortTrainings: (trainings: Training[]) => Training[]
 *   addToGoogleCalendar: (training: Training) => void
 *   addToCalendar: (training: Training, provider?: string | null) => void
 *   bulkAddToGoogleCalendar: () => Promise<void>
 *   exportAllToCalendar: () => Promise<void>
 *   exportFavoritesToCalendar: () => Promise<void>
 *   shareCurrentView: () => Promise<void>
 *   loadFavorites: () => void
 *   isFavorite: (trainingId: number) => boolean
 *   toggleFavorite: (trainingId: number) => boolean
 *   quickFilterFavorites: () => void
 *   requestUserLocation: () => Promise<boolean>
 *   addDistanceToTrainings: () => void
 *   initializeMap: () => void
 *   addMarkersToMap: () => void
 *   createMapPopup: (training: Training) => string
 *   cleanupMap: () => void
 *   loadFiltersFromUrl: () => void
 *   updateUrlWithFilters: () => void
 *   getCachedData: () => ApiResponse | null
 *   setCachedData: (data: ApiResponse) => void
 *   startUpdateCheck: () => void
 *   checkForUpdates: () => Promise<void>
 *   getTrainingColor: (training: string) => string
 *   formatAlter: (training: Training) => string
 *   formatZeitrange: (von: string, bis: string) => string
 *   destroy: () => void
 *   wochentage: string[]
 *   orte: string[]
 *   trainingsarten: string[]
 *   altersgruppen: string[]
 *   groupedTrainings: GroupedTraining[]
 *   favoriteTrainings: Training[]
 *   hasActiveFilters: boolean
 *   filteredTrainingsCount: number
 * }} AlpineComponent
 */

// Export types (for TypeScript inference)
export {}
