// @ts-nocheck
// src/js/trainingsplaner.js
/**
 * Trainingsplaner Alpine Component - Refactored v3.0
 * @version 3.0.0
 * @requires Node 20+
 *
 * BREAKING CHANGES:
 * - Share/Export moved to global actions
 * - Fuse.js imported locally (no window pollution)
 * - Better error boundaries
 * - Extracted bulk operations
 *
 * NOTE: TypeScript checking disabled for this file due to Alpine.js dynamic context.
 * All methods are fully JSDoc annotated for IDE support.
 */

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').Filter} Filter
 * @typedef {import('./types.js').Metadata} Metadata
 * @typedef {import('./types.js').UserPosition} UserPosition
 * @typedef {import('./types.js').ApiResponse} ApiResponse
 */

import { CONFIG, log } from './config.js'
import { utils } from './utils.js'
import calendar from './calendar-integration.js'
import Fuse from 'fuse.js'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Trainingsplaner Component Factory
 *
 * @returns {Object} Alpine.js component with state and methods
 */
export function trainingsplaner() {
  return {
    // ==================== STATE ====================
    allTrainings: [],
    filteredTrainings: [],
    metadata: null,
    loading: true,
    error: null,
    fromCache: false,

    // Search State
    searchTimeout: null,
    fuse: null,

    // Map State
    map: null,
    markers: [],
    userHasInteractedWithMap: false,

    // Geolocation State
    userPosition: null,
    geolocationError: null,
    geolocationLoading: false,

    // Favorites State
    favorites: [],

    // Update Check State
    updateAvailable: false,
    latestVersion: null,
    updateCheckInterval: null,

    // Wochentag Sorting
    wochentagOrder: {
      'Montag': 1,
      'Dienstag': 2,
      'Mittwoch': 3,
      'Donnerstag': 4,
      'Freitag': 5,
      'Samstag': 6,
      'Sonntag': 7
    },

    // ==================== COMPUTED PROPERTIES ====================

    get wochentage() {
      return this.metadata?.wochentage || [
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag',
        'Sonntag'
      ]
    },

    get orte() {
      return (
        this.metadata?.orte || utils.extractUnique(this.allTrainings, 'ort')
      )
    },

    get trainingsarten() {
      return (
        this.metadata?.trainingsarten ||
        utils.extractUnique(this.allTrainings, 'training')
      )
    },

    get altersgruppen() {
      if (this.metadata?.altersgruppen) {
        return this.metadata.altersgruppen
      }

      const values = this.allTrainings
        .map((t) => t.altersgruppe)
        .filter((v) => v && String(v).trim() !== '')

      const allGroups = []
      values.forEach((val) => {
        String(val)
          .split(',')
          .forEach((group) => {
            const cleaned = group.trim()
            if (cleaned && !allGroups.includes(cleaned)) {
              allGroups.push(cleaned)
            }
          })
      })

      return allGroups.sort()
    },

    get groupedTrainings() {
      const grouped = {}

      this.filteredTrainings.forEach((training) => {
        const key = training.wochentag || 'Ohne Tag'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(training)
      })

      const groupKeys = Object.keys(grouped).sort((a, b) => {
        return (this.wochentagOrder[a] || 999) - (this.wochentagOrder[b] || 999)
      })

      return groupKeys.map((key) => ({
        key: key,
        items: this.sortTrainings(grouped[key])
      }))
    },

    get favoriteTrainings() {
      return this.allTrainings.filter((t) => this.isFavorite(t.id))
    },

    get hasActiveFilters() {
      const f = this.$store.ui.filters
      return ['wochentag', 'ort', 'training', 'altersgruppe', 'searchTerm']
        .reduce((count, key) => (f[key] ? count + 1 : count), 0) > 0
    },

    get filteredTrainingsCount() {
      return this.filteredTrainings.length
    },

    // ==================== INITIALIZATION ====================

    /**
     * Initialize Component
     *
     * Loads data from cache or API, initializes favorites, URL filters
     *
     * @returns {Promise<void>}
     */
    async init() {
      this.loading = true
      this.error = null

      // Load Favorites
      if (CONFIG.features.enableFavorites) {
        this.loadFavorites()
      }

      // Load URL Filters
      if (CONFIG.filters.persistInUrl) {
        this.loadFiltersFromUrl()
      }

      try {
        // Try Cache First
        const cached = this.getCachedData()
        if (cached) {
          this.loadData(cached)
          this.fromCache = true
        }

        // Fetch Fresh Data
        const response = await fetch(CONFIG.jsonUrl + '?_=' + Date.now())

        if (!response.ok) {
          if (cached) {
            log('warn', 'Network error, using cache')
            return
          }
          throw new Error(`HTTP ${response.status}: File not found`)
        }

        const data = await response.json()

        if (!data.version || !data.trainings || !Array.isArray(data.trainings)) {
          throw new Error('Invalid data format')
        }

        // Check if data changed
        const dataHash = utils.generateHash(JSON.stringify(data.trainings))
        const cachedHash = cached
          ? utils.generateHash(JSON.stringify(cached.trainings))
          : null

        if (dataHash !== cachedHash) {
          log('info', 'New data available, updating...')
          this.loadData(data)
          this.setCachedData(data)
          this.fromCache = false
        }

        // Start Update Check
        if (CONFIG.features.enableUpdateCheck) {
          this.startUpdateCheck()
        }
      } catch (err) {
        log('error', 'Failed to load trainings', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    /**
     * Load Data into Component
     *
     * @param {ApiResponse} data - API response with trainings and metadata
     * @returns {void}
     */
    loadData(data) {
      this.allTrainings = data.trainings || []
      this.metadata = data.metadata || null

      // Initialize Fuse.js
      this.fuse = new Fuse(this.allTrainings, CONFIG.search.fuseOptions)

      // Add distance if user position available
      if (this.userPosition) {
        this.addDistanceToTrainings()
      }

      // Apply Filters
      this.applyFilters()

      log('info', 'Data loaded', {
        trainings: this.allTrainings.length,
        fromCache: this.fromCache
      })
    },

    /**
     * Watch for Filter Changes
     *
     * Sets up reactive watchers for filter changes and map modal
     *
     * @returns {void}
     */
    watchFilters() {
      let filterChangeTimeout = null

      this.$watch(
        '$store.ui.filters',
        () => {
          clearTimeout(filterChangeTimeout)
          filterChangeTimeout = setTimeout(() => {
            this.applyFilters()
          }, 100)
        },
        { deep: true }
      )

      this.$watch('$store.ui.mapModalOpen', (isOpen) => {
        if (isOpen) {
          this.$nextTick(() => {
            this.initializeMap()
          })
        } else {
          this.cleanupMap()
        }
      })
    },

    // ==================== FILTERING ====================

    /**
     * Apply All Filters
     *
     * Filters trainings based on all active filter criteria
     *
     * @returns {void}
     */
    applyFilters() {
      const filters = this.$store.ui.filters
      let result = [...this.allTrainings]

      // Quick Filter: Favoriten
      if (filters.activeQuickFilter === 'favoriten') {
        result = result.filter((t) => this.isFavorite(t.id))
      }

      // Wochentag Filter
      if (filters.wochentag) {
        result = result.filter(
          (t) =>
            t.wochentag &&
            t.wochentag.toLowerCase() === filters.wochentag.toLowerCase()
        )
      }

      // Ort Filter
      if (filters.ort) {
        result = result.filter(
          (t) => t.ort && t.ort.toLowerCase() === filters.ort.toLowerCase()
        )
      }

      // Training Filter
      if (filters.training) {
        result = result.filter(
          (t) =>
            t.training &&
            t.training.toLowerCase().includes(filters.training.toLowerCase())
        )
      }

      // Altersgruppe Filter
      if (filters.altersgruppe) {
        result = result.filter((t) =>
          this.matchesAltersgruppe(t, filters.altersgruppe)
        )
      }

      // Search Term (Fuse.js)
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const fuseResults = this.fuse.search(filters.searchTerm.trim())
        const searchIds = new Set(fuseResults.map((r) => r.item.id))
        result = result.filter((t) => searchIds.has(t.id))
      }

      // Distance Filter (if user position)
      if (this.userPosition && CONFIG.map.geolocation.maxDistance > 0) {
        result = result.filter((t) => {
          if (!t.distance) return false
          return t.distance <= CONFIG.map.geolocation.maxDistance
        })
      }

      // Sort by distance if available
      if (this.userPosition) {
        result.sort((a, b) => (a.distance || 999) - (b.distance || 999))
      }

      this.filteredTrainings = result

      // Update URL
      if (CONFIG.filters.persistInUrl) {
        this.updateUrlWithFilters()
      }

      log('debug', 'Filters applied', {
        total: this.allTrainings.length,
        filtered: result.length
      })
    },

    /**
     * Match Altersgruppe Filter
     *
     * @param {Training} training - Training object
     * @param {string} filterValue - Filter value
     * @returns {boolean}
     */
    matchesAltersgruppe(training, filterValue) {
      if (!training.altersgruppe) return false

      const groups = String(training.altersgruppe)
        .split(',')
        .map((g) => g.trim().toLowerCase())

      return groups.some((g) => g === filterValue.toLowerCase())
    },

    /**
     * Sort Trainings by Time
     *
     * @param {Training[]} trainings - Array of trainings
     * @returns {Training[]} Sorted trainings
     */
    sortTrainings(trainings) {
      return trainings.sort((a, b) => {
        const aMin = utils.zeitZuMinuten(a.von)
        const bMin = utils.zeitZuMinuten(b.von)
        return aMin - bMin
      })
    },

    // ==================== CALENDAR INTEGRATION ====================

    /**
     * Add single training to Google Calendar
     *
     * Opens Google Calendar with pre-filled event
     *
     * @param {Training} training - Training object
     * @returns {void}
     */
    addToGoogleCalendar(training) {
      try {
        const url = calendar.createGoogleCalendarUrl(training)
        window.open(url, '_blank')

        this.$store.ui.showNotification(
          `${training.training} zu Google Calendar hinzugefügt`,
          'success',
          3000
        )

        log('info', '[trainingsplaner] Added to Google Calendar', {
          training: training.id
        })
      } catch (error) {
        log('error', '[trainingsplaner] Failed to add to Google Calendar', error)
        this.$store.ui.showNotification(
          'Fehler beim Öffnen von Google Calendar',
          'error',
          3000
        )
      }
    },

    /**
     * Add single training to calendar (smart detection)
     *
     * Detects calendar provider and opens appropriate URL
     *
     * @param {Training} training - Training object
     * @param {string | null} [provider] - Optional provider override
     * @returns {void}
     */
    addToCalendar(training, provider = null) {
      const selectedProvider = provider || calendar.detectCalendarProvider()

      try {
        let url

        switch (selectedProvider) {
          case 'google':
            url = calendar.createGoogleCalendarUrl(training)
            break
          case 'outlook':
            url = calendar.createOutlookCalendarUrl(training)
            break
          case 'office365':
            url = calendar.createOffice365CalendarUrl(training)
            break
          case 'yahoo':
            url = calendar.createYahooCalendarUrl(training)
            break
          case 'apple':
          case 'ical':
            calendar.downloadICalFile(training)
            this.$store.ui.showNotification(
              'Kalenderdatei heruntergeladen',
              'success',
              3000
            )
            return
          default:
            throw new Error(`Unknown provider: ${selectedProvider}`)
        }

        if (url) {
          window.open(url, '_blank')
          this.$store.ui.showNotification(
            `Zu ${calendar.getCalendarProviderName(selectedProvider)} hinzugefügt`,
            'success',
            3000
          )
        }

        log('info', '[trainingsplaner] Added to calendar', {
          training: training.id,
          provider: selectedProvider
        })
      } catch (error) {
        log('error', '[trainingsplaner] Failed to add to calendar', error)
        this.$store.ui.showNotification(
          'Fehler beim Öffnen des Kalenders',
          'error',
          3000
        )
      }
    },

    /**
     * Bulk add filtered trainings to Google Calendar
     *
     * Opens multiple tabs with delay to avoid browser blocking
     *
     * @returns {Promise<void>}
     */
    async bulkAddToGoogleCalendar() {
      if (this.filteredTrainings.length === 0) {
        this.$store.ui.showNotification(
          'Keine Trainings zum Exportieren',
          'warning',
          3000
        )
        return
      }

      try {
        // Show loading notification
        this.$store.ui.showNotification(
          `Exportiere ${this.filteredTrainings.length} Trainings...`,
          'info',
          2000
        )

        const result = await calendar.bulkAddToGoogleCalendar(
          this.filteredTrainings,
          {
            maxBulk: 10,
            delay: 600,
            onProgress: ({ current, total }) => {
              log('debug', '[trainingsplaner] Bulk export progress', {
                current,
                total
              })
            }
          }
        )

        if (result.success) {
          this.$store.ui.showNotification(
            `✅ ${result.exported} von ${result.total} Trainings zu Google Calendar hinzugefügt`,
            'success',
            5000
          )
        } else {
          this.$store.ui.showNotification(
            result.message,
            'error',
            5000
          )
        }

        log('info', '[trainingsplaner] Bulk Google Calendar export', result)
      } catch (error) {
        log('error', '[trainingsplaner] Bulk Google Calendar export failed', error)
        this.$store.ui.showNotification(
          'Fehler beim Bulk-Export. Bitte versuche den .ics Export.',
          'error',
          5000
        )
      }
    },

    // ==================== GLOBAL ACTIONS ====================

    /**
     * Export ALL Filtered Trainings to Calendar (.ics file)
     *
     * Creates and downloads a single .ics file with all filtered trainings
     *
     * @returns {Promise<void>}
     */
    async exportAllToCalendar() {
      if (this.filteredTrainings.length === 0) {
        this.$store.ui.showNotification(
          'Keine Trainings zum Exportieren',
          'warning',
          3000
        )
        return
      }

      try {
        const icalContent = utils.createICalBundle(this.filteredTrainings)
        const filename = `fam-trainings-${Date.now()}.ics`

        utils.downloadICalFile(icalContent, filename)

        this.$store.ui.showNotification(
          `${this.filteredTrainings.length} Trainings exportiert! 🎉`,
          'success',
          3000
        )

        log('info', 'Bulk calendar export', {
          count: this.filteredTrainings.length
        })
      } catch (error) {
        log('error', 'Bulk export failed', error)
        this.$store.ui.showNotification(
          'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
          'error',
          5000
        )
      }
    },

    /**
     * Export Favorites to Calendar
     *
     * Creates and downloads a .ics file with all favorite trainings
     *
     * @returns {Promise<void>}
     */
    async exportFavoritesToCalendar() {
      const favTrainings = this.favoriteTrainings

      if (favTrainings.length === 0) {
        this.$store.ui.showNotification(
          'Keine Favoriten zum Exportieren',
          'warning',
          3000
        )
        return
      }

      try {
        const icalContent = utils.createICalBundle(favTrainings)
        const filename = `fam-favoriten-${Date.now()}.ics`

        utils.downloadICalFile(icalContent, filename)

        this.$store.ui.showNotification(
          `${favTrainings.length} Favoriten exportiert! ⭐`,
          'success',
          3000
        )
      } catch (error) {
        log('error', 'Favorites export failed', error)
        this.$store.ui.showNotification(
          'Export fehlgeschlagen.',
          'error',
          5000
        )
      }
    },

    /**
     * Share Current View (Filters + Results)
     *
     * Creates shareable URL with current filters and shares via Web Share API or clipboard
     *
     * @returns {Promise<void>}
     */
    async shareCurrentView() {
      const filters = this.$store.ui.filters
      const shareUrl = utils.createShareLink(filters)

      const hasFilters = this.hasActiveFilters
      const count = this.filteredTrainingsCount

      const shareData = {
        title: 'FAM Trainingsplan',
        text: hasFilters
          ? `${count} Trainings gefunden - Schau dir diese an!`
          : 'Entdecke alle FAM Trainings in München!',
        url: shareUrl
      }

      try {
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData)
          log('info', 'View shared via native API')
        } else {
          // Fallback: Copy to Clipboard
          const success = await utils.copyToClipboard(shareUrl)
          if (success) {
            this.$store.ui.showNotification(
              'Link in Zwischenablage kopiert! 📋',
              'success',
              3000
            )
          } else {
            throw new Error('Clipboard write failed')
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          log('error', 'Share failed', error)
          this.$store.ui.showNotification(
            'Teilen fehlgeschlagen.',
            'error',
            3000
          )
        }
      }
    },

    // ==================== FAVORITES ====================

    /**
     * Load Favorites from LocalStorage
     *
     * @returns {void}
     */
    loadFavorites() {
      this.favorites = utils.favorites.load()
      log('debug', 'Favorites loaded', { count: this.favorites.length })
    },

    /**
     * Check if Training is Favorite
     *
     * @param {number} trainingId - Training ID
     * @returns {boolean} True if favorite
     */
    isFavorite(trainingId) {
      return this.favorites.includes(trainingId)
    },

    /**
     * Toggle Favorite Status
     *
     * @param {number} trainingId - Training ID
     * @returns {boolean} New favorite status
     */
    toggleFavorite(trainingId) {
      const isNowFavorite = utils.favorites.toggle(trainingId)
      this.loadFavorites()

      this.$nextTick(() => {
        if (this.$store.ui.filters.activeQuickFilter === 'favoriten') {
          this.applyFilters()
        }
      })

      this.$store.ui.showNotification(
        isNowFavorite ? 'Zu Favoriten hinzugefügt ⭐' : 'Von Favoriten entfernt',
        'info',
        2000
      )

      return isNowFavorite
    },

    /**
     * Quick Filter Favorites
     *
     * Sets filter to show only favorites
     *
     * @returns {void}
     */
    quickFilterFavorites() {
      this.$store.ui.filters = {
        wochentag: '',
        ort: '',
        training: '',
        altersgruppe: '',
        searchTerm: '',
        activeQuickFilter: 'favoriten'
      }
      this.applyFilters()
    },

    // ==================== GEOLOCATION ====================

    /**
     * Request User Location
     *
     * Requests geolocation permission and adds distance to trainings
     *
     * @returns {Promise<boolean>} True if location obtained
     */
    async requestUserLocation() {
      if (!CONFIG.features.enableGeolocation) {
        this.geolocationError = 'Geolocation ist deaktiviert'
        return false
      }

      this.geolocationLoading = true
      this.geolocationError = null

      try {
        this.userPosition = await utils.getCurrentPosition()
        log('info', 'Position obtained', this.userPosition)

        this.addDistanceToTrainings()
        this.applyFilters()

        this.$store.ui.showNotification(
          'Standort ermittelt! 📍',
          'success',
          2000
        )

        return true
      } catch (err) {
        log('error', 'Geolocation failed', err)
        this.geolocationError = err.message
        this.$store.ui.showNotification(err.message, 'error', 5000)
        return false
      } finally {
        this.geolocationLoading = false
      }
    },

    /**
     * Add Distance to Trainings
     *
     * Calculates distance from user position to each training location
     *
     * @returns {void}
     */
    addDistanceToTrainings() {
      if (!this.userPosition) return

      this.allTrainings = utils.addDistanceToTrainings(
        this.allTrainings,
        this.userPosition
      )

      this.allTrainings.forEach((t) => {
        if (t.distance !== undefined) {
          t.distanceText = t.distance.toFixed(1) + ' km'
        }
      })
    },

    // ==================== MAP ====================

    /**
     * Initialize Map
     *
     * Creates Leaflet map instance and adds tile layer
     *
     * @returns {void}
     */
    initializeMap() {
      if (this.map) return

      const container = document.getElementById('map-modal-container')
      if (!container) {
        log('error', 'Map container not found')
        return
      }

      try {
        this.map = L.map('map-modal-container', {
          center: CONFIG.map.defaultCenter,
          zoom: CONFIG.map.defaultZoom,
          zoomControl: true
        })

        L.tileLayer(CONFIG.map.tileLayerUrl, {
          attribution: CONFIG.map.attribution,
          maxZoom: 19
        }).addTo(this.map)

        this.addMarkersToMap()

        log('info', 'Map initialized')
      } catch (error) {
        log('error', 'Map initialization failed', error)
      }
    },

    /**
     * Add Markers to Map
     *
     * Adds markers for all filtered trainings to the map
     *
     * @returns {void}
     */
    addMarkersToMap() {
      if (!this.map) return

      this.markers.forEach((m) => this.map.removeLayer(m))
      this.markers = []

      const bounds = []

      this.filteredTrainings.forEach((training) => {
        if (!training.lat || !training.lng) return

        const marker = L.marker([training.lat, training.lng])
        marker.bindPopup(this.createMapPopup(training))
        marker.addTo(this.map)

        this.markers.push(marker)
        bounds.push([training.lat, training.lng])
      })

      if (bounds.length > 0 && !this.userHasInteractedWithMap) {
        this.map.fitBounds(bounds, { padding: [50, 50] })
      }

      this.map.once('movestart', () => {
        this.userHasInteractedWithMap = true
      })
    },

    /**
     * Create Map Popup HTML
     *
     * @param {Training} training - Training object
     * @returns {string} HTML string for popup
     */
    createMapPopup(training) {
      return `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-2">${training.training}</h3>
          <p class="text-sm mb-1"><strong>Ort:</strong> ${training.ort}</p>
          <p class="text-sm mb-1"><strong>Zeit:</strong> ${utils.formatZeitrange(
            training.von,
            training.bis
          )}</p>
          <p class="text-sm mb-1"><strong>Alter:</strong> ${utils.formatAlter(
            training
          )}</p>
          ${
            training.distanceText
              ? `<p class="text-sm text-primary-600 font-bold mt-2">📍 ${training.distanceText} entfernt</p>`
              : ''
          }
          ${
            training.link
              ? `<a href="${training.link}" target="_blank" class="inline-block mt-2 px-3 py-1 bg-primary-500 text-white rounded text-xs font-bold hover:bg-primary-600">Anmelden →</a>`
              : ''
          }
        </div>
      `
    },

    /**
     * Cleanup Map
     *
     * Removes all markers and destroys map instance
     *
     * @returns {void}
     */
    cleanupMap() {
      if (this.map) {
        this.markers.forEach((m) => this.map.removeLayer(m))
        this.markers = []
        this.map.remove()
        this.map = null
        this.userHasInteractedWithMap = false
      }
    },

    // ==================== URL HANDLING ====================

    /**
     * Load Filters from URL
     *
     * Parses URL parameters and sets filters accordingly
     *
     * @returns {void}
     */
    loadFiltersFromUrl() {
      const urlFilters = utils.getFiltersFromUrl()
      Object.assign(this.$store.ui.filters, urlFilters)
      log('debug', 'URL filters loaded', urlFilters)
    },

    /**
     * Update URL with Filters
     *
     * Updates URL with current filter state (without page reload)
     *
     * @returns {void}
     */
    updateUrlWithFilters() {
      if (!CONFIG.filters.persistInUrl) return

      const url = utils.createShareLink(this.$store.ui.filters)
      window.history.replaceState({}, '', url)
    },

    // ==================== CACHING ====================

    /**
     * Get Cached Data
     *
     * Retrieves cached data from LocalStorage if valid
     *
     * @returns {ApiResponse | null} Cached data or null
     */
    getCachedData() {
      if (!CONFIG.cacheEnabled) return null

      try {
        const cached = localStorage.getItem(CONFIG.cacheKey)
        if (!cached) return null

        const data = JSON.parse(cached)
        const now = Date.now()

        if (now - data.timestamp > CONFIG.cacheDuration) {
          localStorage.removeItem(CONFIG.cacheKey)
          return null
        }

        return data.data
      } catch (error) {
        log('error', 'Cache read failed', error)
        return null
      }
    },

    /**
     * Set Cached Data
     *
     * Stores data in LocalStorage with timestamp
     *
     * @param {ApiResponse} data - Data to cache
     * @returns {void}
     */
    setCachedData(data) {
      if (!CONFIG.cacheEnabled) return

      try {
        const cacheData = {
          timestamp: Date.now(),
          data: data
        }
        localStorage.setItem(CONFIG.cacheKey, JSON.stringify(cacheData))
      } catch (error) {
        log('error', 'Cache write failed', error)
      }
    },

    // ==================== UPDATE CHECK ====================

    /**
     * Start Update Check
     *
     * Starts periodic update checks
     *
     * @returns {void}
     */
    startUpdateCheck() {
      if (this.updateCheckInterval) return

      this.updateCheckInterval = setInterval(() => {
        this.checkForUpdates()
      }, CONFIG.pwa.updateCheckInterval)
    },

    /**
     * Check for Updates
     *
     * Fetches version.json and checks if update is available
     *
     * @returns {Promise<void>}
     */
    async checkForUpdates() {
      try {
        const response = await fetch(
          CONFIG.versionUrl + '?_=' + Date.now()
        )
        const data = await response.json()

        if (data.version && data.version !== CONFIG.pwa.version) {
          this.updateAvailable = true
          this.latestVersion = data.version
          log('info', 'Update available', { version: data.version })
        }
      } catch (error) {
        log('error', 'Update check failed', error)
      }
    },

    // ==================== FORMATTING ====================

    /**
     * Get Training Color Classes
     *
     * Returns Tailwind CSS classes based on training type
     *
     * @param {string} training - Training type
     * @returns {string} Tailwind CSS classes
     */
    getTrainingColor(training) {
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
    },

    /**
     * Format Alter
     *
     * @param {Training} training - Training object
     * @returns {string} Formatted age range
     */
    formatAlter(training) {
      return utils.formatAlter(training)
    },

    /**
     * Format Zeitrange
     *
     * @param {string} von - Start time
     * @param {string} bis - End time
     * @returns {string} Formatted time range
     */
    formatZeitrange(von, bis) {
      return utils.formatZeitrange(von, bis)
    },

    // ==================== CLEANUP ====================

    /**
     * Destroy Component
     *
     * Cleans up intervals, map, and timeouts
     *
     * @returns {void}
     */
    destroy() {
      if (this.updateCheckInterval) {
        clearInterval(this.updateCheckInterval)
      }

      if (this.map) {
        this.cleanupMap()
      }

      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }
    }
  }
}
