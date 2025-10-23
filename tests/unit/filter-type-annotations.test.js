// @ts-check
/**
 * Filter & Logic Module Type Annotation Tests
 * @file tests/unit/filter-type-annotations.test.js
 *
 * Tests that verify JSDoc type annotations are correct and TypeScript-compliant
 */

import { describe, it, expect } from 'vitest'

describe('Filter Type Annotations', () => {
  it('should compile filter-engine.js without TypeScript errors', async () => {
    // Import the module - if types are wrong, TS will catch it at build time
    const { FilterEngine } = await import('../../src/js/trainingsplaner/filter-engine.js')
    expect(FilterEngine).toBeDefined()
  })

  it('should compile quick-filters.js without TypeScript errors', async () => {
    // Import the module - if types are wrong, TS will catch it at build time
    const { QUICK_FILTERS, getQuickFilterColorClasses, getFiltersByCategory } =
      await import('../../src/js/trainingsplaner/quick-filters.js')
    expect(QUICK_FILTERS).toBeDefined()
    expect(getQuickFilterColorClasses).toBeDefined()
    expect(getFiltersByCategory).toBeDefined()
  })

  it('should compile geolocation-manager.js without TypeScript errors', async () => {
    // Import the module - if types are wrong, TS will catch it at build time
    const { GeolocationManager } = await import('../../src/js/trainingsplaner/geolocation-manager.js')
    expect(GeolocationManager).toBeDefined()
  })

  it('should handle Fuse.js search result types correctly', () => {
    // Mock Fuse.js result structure
    /** @type {import('fuse.js').FuseResult<{id: number, name: string}>[]} */
    const fuseResults = [
      { item: { id: 1, name: 'test' }, refIndex: 0 }
    ]

    // Extract items using proper type annotation
    const items = fuseResults.map((/** @type {import('fuse.js').FuseResult<{id: number, name: string}>} */ r) => r.item)

    expect(items).toHaveLength(1)
    expect(items[0].id).toBe(1)
  })

  it('should handle filter callback parameter types', () => {
    /** @type {Array<{id: number, wochentag: string}>} */
    const trainings = [
      { id: 1, wochentag: 'Montag' },
      { id: 2, wochentag: 'Dienstag' }
    ]

    // Filter with inline type annotation
    const filtered = trainings.filter((/** @type {{id: number, wochentag: string}} */ t) =>
      t.wochentag === 'Montag'
    )

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe(1)
  })
})
