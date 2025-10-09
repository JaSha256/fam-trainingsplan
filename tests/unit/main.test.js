// tests/unit/main.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Alpine } from '../../src/main.js'

describe('main.js - Alpine Store', () => {
  beforeEach(() => {
    // Reset store
    Alpine.store('ui', {
      filterSidebarOpen: true,
      mapModalOpen: false,
      notification: null
    })
  })

  it('should toggle map view', () => {
    const store = Alpine.store('ui')
    
    expect(store.mapView).toBe(false)
    
    store.toggleMapView()
    expect(store.mapView).toBe(true)
    
    store.toggleMapView()
    expect(store.mapView).toBe(false)
  })

  it('should show notification with correct type', () => {
    const store = Alpine.store('ui')
    
    store.showNotification('Test message', 'success', 0)
    
    expect(store.notification).toEqual({
      message: 'Test message',
      type: 'success',
      show: true
    })
  })

  it('should auto-hide notification after duration', async () => {
    vi.useFakeTimers()
    
    const store = Alpine.store('ui')
    store.showNotification('Auto-hide', 'info', 3000)
    
    expect(store.notification.show).toBe(true)
    
    vi.advanceTimersByTime(3000)
    
    expect(store.notification.show).toBe(false)
    
    vi.useRealTimers()
  })
})

describe('main.js - PWA Setup', () => {
  it('should register service worker when supported', async () => {
    const mockRegisterSW = vi.fn()
    
    vi.mock('virtual:pwa-register', () => ({
      registerSW: mockRegisterSW
    }))
    
    // Test execution
    expect(mockRegisterSW).toHaveBeenCalled()
  })
})

describe('main.js - Touch Gestures', () => {
  it('should detect swipe left', () => {
    const store = Alpine.store('ui')
    store.filterSidebarOpen = true
    
    const touchStart = new TouchEvent('touchstart', {
      touches: [{ clientX: 200, clientY: 100 }]
    })
    
    const touchEnd = new TouchEvent('touchend', {
      changedTouches: [{ clientX: 50, clientY: 100 }]
    })
    
    document.dispatchEvent(touchStart)
    document.dispatchEvent(touchEnd)
    
    expect(store.filterSidebarOpen).toBe(false)
  })
})

describe('main.js - Error Handling', () => {
  it('should show user-friendly error message', () => {
    const store = Alpine.store('ui')
    const showNotificationSpy = vi.spyOn(store, 'showNotification')
    
    const errorEvent = new ErrorEvent('error', {
      message: 'Test error',
      filename: 'test.js',
      lineno: 10
    })
    
    window.dispatchEvent(errorEvent)
    
    expect(showNotificationSpy).toHaveBeenCalledWith(
      'Ein Fehler ist aufgetreten. Bitte Seite neu laden.',
      'error',
      5000
    )
  })
})
