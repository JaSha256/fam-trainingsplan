// @ts-check
/**
 * Data Loader Module
 * @file src/js/trainingsplaner/data-loader.js
 * @version 3.0.0
 *
 * Handles data loading from API, caching, and update checks.
 */

import { CONFIG, log } from '../config.js'
import { utils } from '../utils.js'
import Fuse from 'fuse.js'

/**
 * @typedef {import('./types.js').ApiResponse} ApiResponse
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 */

/**
 * Data Loader
 *
 * Manages data fetching, caching, and Fuse.js initialization.
 */
export class DataLoader {
  /**
   * Create Data Loader
   *
   * @param {TrainingsplanerState} state - Component state
   * @param {Object} dependencies - External dependencies
   * @param {() => void} dependencies.addDistanceToTrainings - Add distance function
   * @param {() => void} dependencies.applyFilters - Apply filters function
   * @param {() => void} dependencies.startUpdateCheck - Start update check function
   */
  constructor(state, dependencies) {
    this.state = state
    this.addDistanceToTrainings = dependencies.addDistanceToTrainings
    this.applyFilters = dependencies.applyFilters
    this.startUpdateCheck = dependencies.startUpdateCheck
  }

  /**
   * Initialize Component
   *
   * Main initialization method. Loads data from cache or API.
   *
   * @returns {Promise<void>}
   */
  async init() {
    this.state.loading = true
    this.state.error = null

    try {
      // Try Cache First
      const cached = this.getCachedData()
      if (cached) {
        this.loadData(cached)
        this.state.fromCache = true
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
        this.state.fromCache = false
      }

      // Start Update Check
      if (CONFIG.features.enableUpdateCheck) {
        this.startUpdateCheck()
      }
    } catch (err) {
      log('error', 'Failed to load trainings', err)
      this.state.error = err instanceof Error ? err.message : String(err)
    } finally {
      this.state.loading = false
    }
  }

  /**
   * Load Data into Component
   *
   * Processes API response and initializes Fuse.js search.
   *
   * @param {ApiResponse} data - API response with trainings and metadata
   * @returns {void}
   */
  loadData(data) {
    this.state.allTrainings = data.trainings || []
    this.state.metadata = data.metadata || null

    // Initialize Fuse.js
    this.state.fuse = new Fuse(this.state.allTrainings, CONFIG.search.fuseOptions)

    // Add distance if user position available
    if (this.state.userPosition) {
      this.addDistanceToTrainings()
    }

    // Apply Filters
    this.applyFilters()

    log('info', 'Data loaded', {
      trainings: this.state.allTrainings.length,
      fromCache: this.state.fromCache
    })
  }

  /**
   * Get Cached Data
   *
   * Retrieves cached data from LocalStorage if valid.
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
  }

  /**
   * Set Cached Data
   *
   * Stores data in LocalStorage with timestamp.
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
  }

  /**
   * Start Update Check
   *
   * Starts periodic update checks for new app versions.
   *
   * @returns {void}
   */
  startUpdateCheckInternal() {
    if (this.state.updateCheckInterval) return

    this.state.updateCheckInterval = setInterval(() => {
      this.checkForUpdates()
    }, CONFIG.pwa.updateCheckInterval)
  }

  /**
   * Check for Updates
   *
   * Fetches version.json and checks if update is available.
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
        this.state.updateAvailable = true
        this.state.latestVersion = data.version
        log('info', 'Update available', { version: data.version })
      }
    } catch (error) {
      log('error', 'Update check failed', error)
    }
  }
}
