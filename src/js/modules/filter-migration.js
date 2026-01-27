// src/js/modules/filter-migration.js
/**
 * Filter Format Migration
 * @description Migrates old string-based filter format to new array-based format
 * @module filter-migration
 */

// @ts-check

import { log } from '../config.js'

/**
 * Migrate Old Filter Format to New Array Format
 * AUFGABE 0.3: Backward compatibility for users with old string-based filters
 * Must run BEFORE Alpine.start() - no Alpine dependency
 * @returns {void}
 */
export function migrateFilterFormat() {
  try {
    const storedFilters = localStorage.getItem('trainingFilters')
    if (!storedFilters) {
      log('debug', 'No stored filters found, skipping migration')
      return
    }

    const filters = JSON.parse(storedFilters)

    // Check if old format (strings instead of arrays)
    const needsMigration =
      typeof filters.wochentag === 'string' ||
      typeof filters.ort === 'string' ||
      typeof filters.training === 'string' ||
      typeof filters.altersgruppe === 'string'

    if (!needsMigration) {
      log('debug', 'Filters already in array format, skipping migration')
      return
    }

    // Migrate to new array format
    const migratedFilters = {
      wochentag: filters.wochentag ? [filters.wochentag] : [],
      ort: filters.ort ? [filters.ort] : [],
      training: filters.training ? [filters.training] : [],
      altersgruppe: filters.altersgruppe ? [filters.altersgruppe] : [],
      searchTerm: filters.searchTerm || '',
      activeQuickFilter: filters.activeQuickFilter || null,
      _customTimeFilter: filters._customTimeFilter || '',
      _customFeatureFilter: filters._customFeatureFilter || '',
      _customLocationFilter: filters._customLocationFilter || '',
      _customPersonalFilter: filters._customPersonalFilter || ''
    }

    localStorage.setItem('trainingFilters', JSON.stringify(migratedFilters))
    log('info', 'Successfully migrated filter format from strings to arrays', {
      before: {
        wochentag: typeof filters.wochentag,
        ort: typeof filters.ort,
        training: typeof filters.training,
        altersgruppe: typeof filters.altersgruppe
      },
      after: {
        wochentag: Array.isArray(migratedFilters.wochentag),
        ort: Array.isArray(migratedFilters.ort),
        training: Array.isArray(migratedFilters.training),
        altersgruppe: Array.isArray(migratedFilters.altersgruppe)
      }
    })
  } catch (error) {
    log('error', 'Failed to migrate filter format', error)
    // Don't throw - allow app to continue with default filters
  }
}
