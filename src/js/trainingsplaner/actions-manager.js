// @ts-check
/**
 * Actions Manager Module
 * @file src/js/trainingsplaner/actions-manager.js
 * @version 3.0.0
 *
 * Manages calendar exports, sharing, and bulk operations.
 */

import { log } from '../config.js'
import { utils } from '../utils.js'
import calendar from '../calendar-integration.js'

/**
 * @typedef {import('./types.js').Training} Training
 * @typedef {import('./types.js').TrainingsplanerState} TrainingsplanerState
 * @typedef {import('./types.js').AlpineContext} AlpineContext
 */

/**
 * Actions Manager
 *
 * Handles global actions like calendar export and sharing.
 */
export class ActionsManager {
  /**
   * Create Actions Manager
   *
   * @param {TrainingsplanerState} state - Component state
   * @param {AlpineContext} context - Alpine.js context
   * @param {Object} dependencies - External dependencies
   * @param {boolean} dependencies.hasActiveFilters - Check if filters are active (getter)
   * @param {number} dependencies.filteredTrainingsCount - Count of filtered trainings (getter)
   */
  constructor(state, context, dependencies) {
    this.state = state
    this.context = context
    this.dependencies = dependencies
  }

  get hasActiveFilters() {
    return this.dependencies.hasActiveFilters
  }

  get filteredTrainingsCount() {
    return this.dependencies.filteredTrainingsCount
  }

  /**
   * Add single training to Google Calendar
   *
   * Opens Google Calendar with pre-filled event.
   *
   * @param {Training} training - Training object
   * @returns {void}
   */
  addToGoogleCalendar(training) {
    try {
      const url = calendar.createGoogleCalendarUrl(training)
      window.open(url, '_blank')

      this.context.$store.ui.showNotification(
        `${training.training} zu Google Calendar hinzugef�gt`,
        'success',
        3000
      )

      log('info', '[trainingsplaner] Added to Google Calendar', {
        training: training.id
      })
    } catch (error) {
      log('error', '[trainingsplaner] Failed to add to Google Calendar', error)
      this.context.$store.ui.showNotification(
        'Fehler beim �ffnen von Google Calendar',
        'error',
        3000
      )
    }
  }

  /**
   * Add single training to calendar (smart detection)
   *
   * Detects calendar provider and opens appropriate URL.
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
          this.context.$store.ui.showNotification(
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
        this.context.$store.ui.showNotification(
          `Zu ${calendar.getCalendarProviderName(selectedProvider)} hinzugef�gt`,
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
      this.context.$store.ui.showNotification(
        'Fehler beim �ffnen des Kalenders',
        'error',
        3000
      )
    }
  }

  /**
   * Bulk add filtered trainings to Google Calendar
   *
   * Opens multiple tabs with delay to avoid browser blocking.
   *
   * @returns {Promise<void>}
   */
  async bulkAddToGoogleCalendar() {
    if (this.context.filteredTrainings.length === 0) {
      this.context.$store.ui.showNotification(
        'Keine Trainings zum Exportieren',
        'warning',
        3000
      )
      return
    }

    try {
      // Show loading notification
      this.context.$store.ui.showNotification(
        `Exportiere ${this.context.filteredTrainings.length} Trainings...`,
        'info',
        2000
      )

      const result = await calendar.bulkAddToGoogleCalendar(
        this.context.filteredTrainings,
        {
          maxBulk: 10,
          delay: 600,
          onProgress: (/** @type {{ current: number, total: number }} */ { current, total }) => {
            log('debug', '[trainingsplaner] Bulk export progress', {
              current,
              total
            })
          }
        }
      )

      if (result.success) {
        this.context.$store.ui.showNotification(
          ` ${result.exported} von ${result.total} Trainings zu Google Calendar hinzugef�gt`,
          'success',
          5000
        )
      } else {
        this.context.$store.ui.showNotification(
          result.message,
          'error',
          5000
        )
      }

      log('info', '[trainingsplaner] Bulk Google Calendar export', result)
    } catch (error) {
      log('error', '[trainingsplaner] Bulk Google Calendar export failed', error)
      this.context.$store.ui.showNotification(
        'Fehler beim Bulk-Export. Bitte versuche den .ics Export.',
        'error',
        5000
      )
    }
  }

  /**
   * Export ALL Filtered Trainings to Calendar (.ics file)
   *
   * Creates and downloads a single .ics file with all filtered trainings.
   *
   * @returns {Promise<void>}
   */
  async exportAllToCalendar() {
    if (this.context.filteredTrainings.length === 0) {
      this.context.$store.ui.showNotification(
        'Keine Trainings zum Exportieren',
        'warning',
        3000
      )
      return
    }

    try {
      const icalContent = utils.createICalBundle(this.context.filteredTrainings)
      const filename = `fam-trainings-${Date.now()}.ics`

      utils.downloadICalFile(icalContent, filename)

      this.context.$store.ui.showNotification(
        `${this.context.filteredTrainings.length} Trainings exportiert! <�`,
        'success',
        3000
      )

      log('info', 'Bulk calendar export', {
        count: this.context.filteredTrainings.length
      })
    } catch (error) {
      log('error', 'Bulk export failed', error)
      this.context.$store.ui.showNotification(
        'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
        'error',
        5000
      )
    }
  }

  /**
   * Export Favorites to Calendar
   *
   * Creates and downloads a .ics file with all favorite trainings.
   *
   * @returns {Promise<void>}
   */
  async exportFavoritesToCalendar() {
    const favTrainings = this.context.allTrainings.filter((t) =>
      this.context.favorites.includes(t.id)
    )

    if (favTrainings.length === 0) {
      this.context.$store.ui.showNotification(
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

      this.context.$store.ui.showNotification(
        `${favTrainings.length} Favoriten exportiert! P`,
        'success',
        3000
      )
    } catch (error) {
      log('error', 'Favorites export failed', error)
      this.context.$store.ui.showNotification(
        'Export fehlgeschlagen.',
        'error',
        5000
      )
    }
  }

  /**
   * Share Current View (Filters + Results)
   *
   * Creates shareable URL with current filters and shares via Web Share API or clipboard.
   *
   * @returns {Promise<void>}
   */
  async shareCurrentView() {
    const filters = this.context.$store.ui.filters
    const shareUrl = utils.createShareLink(filters)

    const hasFilters = this.hasActiveFilters
    const count = this.filteredTrainingsCount

    const shareData = {
      title: 'FAM Trainingsplan',
      text: hasFilters
        ? `${count} Trainings gefunden - Schau dir diese an!`
        : 'Entdecke alle FAM Trainings in M�nchen!',
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
          this.context.$store.ui.showNotification(
            'Link in Zwischenablage kopiert! =�',
            'success',
            3000
          )
        } else {
          throw new Error('Clipboard write failed')
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        log('error', 'Share failed', error)
        this.context.$store.ui.showNotification(
          'Teilen fehlgeschlagen.',
          'error',
          3000
        )
      }
    }
  }
}
