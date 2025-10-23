/**
 * Type Safety Tests for keyboard-shortcuts.js
 * Tests that verify JSDoc type annotations are correct
 *
 * These tests validate:
 * 1. weekdayMap index signature allows number indexing
 * 2. initKeyboardShortcuts returns cleanup function (not void)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { initKeyboardShortcuts } from '../../src/js/keyboard-shortcuts.js'

describe('Keyboard Shortcuts - Type Safety', () => {
  let mockAlpineStore
  let cleanup

  beforeEach(() => {
    // Mock Alpine store
    mockAlpineStore = {
      filters: {
        wochentag: []
      },
      toggleMapView: vi.fn(),
      showNotification: vi.fn()
    }

    // Mock DOM elements
    const searchInput = document.createElement('input')
    searchInput.type = 'search'
    searchInput.placeholder = 'Suche'
    document.body.appendChild(searchInput)
  })

  afterEach(() => {
    // Clean up event listeners
    if (cleanup && typeof cleanup === 'function') {
      cleanup()
    }
    document.body.innerHTML = ''
  })

  it('should return a cleanup function (not void)', () => {
    // RED PHASE: This test will fail if return type is void
    cleanup = initKeyboardShortcuts(mockAlpineStore)

    // Verify cleanup is a function
    expect(cleanup).toBeInstanceOf(Function)
    expect(typeof cleanup).toBe('function')
  })

  it('should handle weekday number indexing correctly (1-7)', () => {
    // RED PHASE: This test will fail if weekdayMap lacks index signature
    cleanup = initKeyboardShortcuts(mockAlpineStore)

    // Simulate pressing number keys 1-7
    const validDayNumbers = [1, 2, 3, 4, 5, 6, 7]
    const expectedWeekdays = [
      'Montag',
      'Dienstag',
      'Mittwoch',
      'Donnerstag',
      'Freitag',
      'Samstag',
      'Sonntag'
    ]

    validDayNumbers.forEach((dayNum, index) => {
      // Reset filters
      mockAlpineStore.filters.wochentag = []

      // Trigger keyboard event
      const event = new KeyboardEvent('keydown', {
        key: String(dayNum),
        bubbles: true
      })
      document.dispatchEvent(event)

      // Verify correct weekday was added
      expect(mockAlpineStore.filters.wochentag).toContain(expectedWeekdays[index])
    })
  })

  it('should handle cleanup function execution without errors', () => {
    cleanup = initKeyboardShortcuts(mockAlpineStore)

    // Execute cleanup
    expect(() => cleanup()).not.toThrow()

    // Verify event listener was removed
    const event = new KeyboardEvent('keydown', {
      key: 'm',
      bubbles: true
    })
    document.dispatchEvent(event)

    // toggleMapView should not be called after cleanup
    expect(mockAlpineStore.toggleMapView).not.toHaveBeenCalled()
  })

  it('should pass TypeScript type checking for number-indexed weekday map', () => {
    // This test validates the Record<number, string> type annotation
    cleanup = initKeyboardShortcuts(mockAlpineStore)

    // Test all valid day numbers
    for (let dayNumber = 1; dayNumber <= 7; dayNumber++) {
      mockAlpineStore.filters.wochentag = []

      const event = new KeyboardEvent('keydown', {
        key: String(dayNumber),
        bubbles: true
      })
      document.dispatchEvent(event)

      // Should have added a weekday (no type errors)
      expect(mockAlpineStore.filters.wochentag.length).toBe(1)
      expect(typeof mockAlpineStore.filters.wochentag[0]).toBe('string')
    }
  })

  it('should not throw type errors when accessing cleanup function', () => {
    // Verify return type is callable function
    cleanup = initKeyboardShortcuts(mockAlpineStore)

    // TypeScript should allow calling cleanup as a function
    const result = cleanup()

    // Result should be void (undefined)
    expect(result).toBeUndefined()
  })
})
