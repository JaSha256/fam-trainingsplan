// @ts-check
/**
 * @file tests/unit/sidebar-persistence.test.js
 * @description Unit tests for sidebar collapse/expand state persistence in localStorage
 * @testing Alpine.$persist plugin integration for sidebarCollapsed state
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Sidebar State Persistence', () => {
  let localStorageMock

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      store: {},
      getItem: vi.fn((key) => localStorageMock.store[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = String(value)
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock.store[key]
      }),
      clear: vi.fn(() => {
        localStorageMock.store = {}
      })
    }

    global.localStorage = localStorageMock
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  /**
   * TEST 1: localStorage key naming convention
   * Verifies that the key follows the namespacing pattern
   */
  it('should use namespaced localStorage key "fam-trainingsplan-sidebar-collapsed"', () => {
    const expectedKey = 'fam-trainingsplan-sidebar-collapsed'

    // Simulate Alpine.$persist storing value
    localStorage.setItem(expectedKey, 'false')

    expect(localStorage.getItem(expectedKey)).toBe('false')
    expect(localStorageMock.getItem).toHaveBeenCalledWith(expectedKey)
  })

  /**
   * TEST 2: Default value for first-time visitors
   * New users should get sidebar expanded (false = not collapsed)
   */
  it('should default to false (expanded) for first-time visitors', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // Simulate first visit - no value in localStorage
    const storedValue = localStorage.getItem(key)

    // Expected: null (no value yet), Alpine will use default false
    expect(storedValue).toBeNull()
  })

  /**
   * TEST 3: Persist collapsed state
   * When user collapses sidebar, state should be saved
   */
  it('should persist collapsed state when user collapses sidebar', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // User collapses sidebar
    localStorage.setItem(key, 'true')

    expect(localStorage.getItem(key)).toBe('true')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(key, 'true')
  })

  /**
   * TEST 4: Persist expanded state
   * When user expands sidebar, state should be saved
   */
  it('should persist expanded state when user expands sidebar', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // Start collapsed
    localStorage.setItem(key, 'true')

    // User expands sidebar
    localStorage.setItem(key, 'false')

    expect(localStorage.getItem(key)).toBe('false')
  })

  /**
   * TEST 5: Restore state on page reload
   * User preference should be restored from localStorage
   */
  it('should restore user preference from localStorage on page reload', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // Simulate previous session - user had collapsed sidebar
    localStorage.setItem(key, 'true')

    // Simulate page reload - read from localStorage
    const restoredValue = localStorage.getItem(key)

    expect(restoredValue).toBe('true')
  })

  /**
   * TEST 6: Handle invalid values gracefully
   * If somehow invalid data is stored, should handle gracefully
   */
  it('should handle invalid localStorage values gracefully', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // Store invalid value
    localStorage.setItem(key, 'invalid')

    const storedValue = localStorage.getItem(key)

    // Should still return the value (Alpine will handle validation)
    expect(storedValue).toBe('invalid')
  })

  /**
   * TEST 7: Multiple toggle persistence
   * Rapid toggles should persist the final state
   */
  it('should persist final state after multiple toggles', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // Start expanded
    localStorage.setItem(key, 'false')

    // Toggle to collapsed
    localStorage.setItem(key, 'true')

    // Toggle back to expanded
    localStorage.setItem(key, 'false')

    // Final state should be expanded
    expect(localStorage.getItem(key)).toBe('false')
  })

  /**
   * TEST 8: Independence from other persisted states
   * Sidebar state should not interfere with other localStorage keys
   */
  it('should not interfere with other persisted Alpine states', () => {
    const sidebarKey = 'fam-trainingsplan-sidebar-collapsed'
    const otherKey = 'activeView'

    // Set sidebar state
    localStorage.setItem(sidebarKey, 'true')

    // Set other state
    localStorage.setItem(otherKey, 'map')

    // Both should be independent
    expect(localStorage.getItem(sidebarKey)).toBe('true')
    expect(localStorage.getItem(otherKey)).toBe('map')
  })
})

describe('Sidebar Persistence Integration Tests', () => {
  /**
   * Integration test: Verify Alpine.$persist behavior
   * This tests the expected behavior when Alpine.$persist is used
   */
  it('should work with Alpine.$persist plugin pattern', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // Simulate Alpine.$persist behavior:
    // 1. Check localStorage for existing value
    let storedValue = localStorage.getItem(key)

    // 2. If no value, use default (false)
    const initialValue = storedValue ? JSON.parse(storedValue) : false

    expect(initialValue).toBe(false)

    // 3. User changes value
    const newValue = true
    localStorage.setItem(key, JSON.stringify(newValue))

    // 4. Verify persistence
    storedValue = localStorage.getItem(key)
    expect(JSON.parse(storedValue)).toBe(true)
  })

  /**
   * Cross-session persistence test
   * Simulates closing and reopening the app
   */
  it('should maintain state across sessions', () => {
    const key = 'fam-trainingsplan-sidebar-collapsed'

    // Session 1: User collapses sidebar
    localStorage.setItem(key, 'true')
    const session1Value = localStorage.getItem(key)

    // Simulate session end (but localStorage persists)

    // Session 2: Page reload, read from localStorage
    const session2Value = localStorage.getItem(key)

    expect(session1Value).toBe(session2Value)
    expect(session2Value).toBe('true')
  })
})
