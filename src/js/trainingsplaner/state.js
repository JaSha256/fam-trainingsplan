// @ts-check
/**
 * State Management Module
 * @file src/js/trainingsplaner/state.js
 * @version 3.0.0
 *
 * Creates the initial state for the trainingsplaner component.
 * State is mutable and will be modified by various manager classes.
 */

/**
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 */

/**
 * Create Trainingsplaner State
 *
 * Factory function that creates the initial state object with all
 * necessary properties initialized to their default values.
 *
 * @returns {TrainingsplanerState} Initial state object
 */
export function createTrainingsplanerState() {
  return {
    // ==================== DATA STATE ====================
    allTrainings: [],
    filteredTrainings: [],
    metadata: null,
    loading: true,
    error: null,
    fromCache: false,

    // ==================== SEARCH STATE ====================
    searchTimeout: null,
    fuse: null,

    // ==================== MAP STATE ====================
    map: null,
    markers: [],
    markerClusterGroup: null,
    userHasInteractedWithMap: false,
    tileLayer: null,
    tileLayers: null,
    layerControl: null,
    geolocationControl: null,
    resetControl: null,
    ariaLiveRegion: null,

    // ==================== GEOLOCATION STATE ====================
    userPosition: null,
    geolocationError: null,
    geolocationLoading: false,

    // ==================== FAVORITES STATE ====================
    favorites: [],

    // ==================== UPDATE CHECK STATE ====================
    updateAvailable: false,
    latestVersion: null,
    updateCheckInterval: null,

    // ==================== WOCHENTAG SORTING ====================
    wochentagOrder: {
      'Montag': 1,
      'Dienstag': 2,
      'Mittwoch': 3,
      'Donnerstag': 4,
      'Freitag': 5,
      'Samstag': 6,
      'Sonntag': 7
    }
  }
}
