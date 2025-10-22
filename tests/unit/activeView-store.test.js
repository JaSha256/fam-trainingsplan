// tests/unit/activeView-store.test.js
/**
 * Unit Tests for Alpine Store activeView State Management
 * Task 11.3: Update Alpine store to use activeView state
 *
 * Test Strategy:
 * 1. activeView state persistence
 * 2. setActiveView validation (only 'list', 'map', 'favorites' allowed)
 * 3. isActiveView checker method
 * 4. toggleMapView backward compatibility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Alpine } from '../../src/main.js'

describe('Alpine Store - activeView State Management (Task 11.3)', () => {
  let store

  beforeEach(() => {
    // Get fresh store reference
    store = Alpine.store('ui')
    // Reset to default state
    store.activeView = 'list'
  })

  describe('setActiveView() - View Switching Helper', () => {
    it('should set activeView to "list"', () => {
      store.setActiveView('list')
      expect(store.activeView).toBe('list')
    })

    it('should set activeView to "map"', () => {
      store.setActiveView('map')
      expect(store.activeView).toBe('map')
    })

    it('should set activeView to "favorites"', () => {
      store.setActiveView('favorites')
      expect(store.activeView).toBe('favorites')
    })

    it('should reject invalid view values', () => {
      const originalView = store.activeView
      store.setActiveView('invalid')
      expect(store.activeView).toBe(originalView) // Should not change
    })
  })

  describe('isActiveView() - View State Checker', () => {
    it('should return true when checking current view', () => {
      store.setActiveView('list')
      expect(store.isActiveView('list')).toBe(true)
    })

    it('should return false when checking non-current view', () => {
      store.setActiveView('list')
      expect(store.isActiveView('map')).toBe(false)
    })

    it('should work with "map" view', () => {
      store.setActiveView('map')
      expect(store.isActiveView('map')).toBe(true)
      expect(store.isActiveView('list')).toBe(false)
    })

    it('should work with "favorites" view', () => {
      store.setActiveView('favorites')
      expect(store.isActiveView('favorites')).toBe(true)
      expect(store.isActiveView('list')).toBe(false)
    })
  })

  describe('toggleMapView() - Backward Compatibility', () => {
    it('should toggle from "list" to "map"', () => {
      store.setActiveView('list')
      store.toggleMapView()
      expect(store.activeView).toBe('map')
    })

    it('should toggle from "map" to "list"', () => {
      store.setActiveView('map')
      store.toggleMapView()
      expect(store.activeView).toBe('list')
    })

    it('should toggle from "favorites" to "map"', () => {
      store.setActiveView('favorites')
      store.toggleMapView()
      expect(store.activeView).toBe('map')
    })
  })

  describe('State Validation', () => {
    it('should only accept valid view values', () => {
      const validViews = ['list', 'map', 'favorites']
      const invalidViews = ['', null, undefined, 'invalid', 123, {}, []]

      validViews.forEach(view => {
        store.setActiveView(view)
        expect(store.activeView).toBe(view)
      })

      invalidViews.forEach(invalidView => {
        const beforeView = store.activeView
        store.setActiveView(invalidView)
        expect(store.activeView).toBe(beforeView) // Should not change
      })
    })

    it('should maintain activeView state across method calls', () => {
      store.setActiveView('favorites')
      expect(store.activeView).toBe('favorites')
      expect(store.isActiveView('favorites')).toBe(true)

      // Should persist even after checking
      expect(store.activeView).toBe('favorites')
    })
  })

  describe('Default State', () => {
    it('should default activeView to "list"', () => {
      // Fresh store should have activeView = 'list'
      expect(store.activeView).toBe('list')
    })
  })
})
