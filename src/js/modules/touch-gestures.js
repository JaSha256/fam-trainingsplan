// src/js/modules/touch-gestures.js
/**
 * Touch Gestures (Mobile)
 * @description Swipe-based view switching, pull-to-refresh, edge swipes for filter sidebar
 * @module touch-gestures
 */

// @ts-check

import { CONFIG, getBrowserInfo, log } from '../config.js'

/**
 * Initialize Touch Gestures (Mobile)
 * AUFGABE 10: Enhanced touch gestures for mobile UX
 * - Swipe Left/Right: View switching (List <-> Map)
 * - Pull-to-Refresh: Refresh training data
 * - Swipe Left/Right on edges: Open/close filter sidebar
 * @param {any} Alpine - Alpine.js instance
 * @returns {void}
 */
export function initTouchGestures(Alpine) {
  if (!CONFIG.features?.enableTouchGestures || !getBrowserInfo().isTouch) {
    return
  }

  const touchConfig = CONFIG.ui?.touch || {}
  let touchStartX = 0
  let touchStartY = 0
  let touchStartTime = 0
  let isPullingDown = false

  /**
   * Handle touch start event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchStart = e => {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()

    // Check if pull-to-refresh is possible (scrolled to top)
    if (window.scrollY === 0 && touchStartY < 100) {
      isPullingDown = true
    }
  }

  /**
   * Handle touch move event for pull-to-refresh indicator
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchMove = e => {
    if (!isPullingDown) return

    const touchCurrentY = e.touches[0].clientY
    const pullDistance = touchCurrentY - touchStartY

    // Show pull-to-refresh indicator if pulling down
    if (pullDistance > 0) {
      const refreshIndicator = document.getElementById('pull-refresh-indicator')
      if (refreshIndicator) {
        refreshIndicator.style.opacity = Math.min(pullDistance / 100, 1).toString()
        refreshIndicator.style.transform = `translateY(${Math.min(pullDistance / 2, 50)}px)`
      }
    }
  }

  /**
   * Handle touch end event
   * @param {TouchEvent} e - Touch event
   * @returns {void}
   */
  const handleTouchEnd = e => {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const touchEndTime = Date.now()

    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY
    const deltaTime = touchEndTime - touchStartTime

    // @ts-ignore - Alpine.store returns unknown
    const store = Alpine.store('ui')

    // AUFGABE 10.2: Pull-to-Refresh
    if (isPullingDown && deltaY > 100 && deltaTime < 1000) {
      log('info', 'Pull-to-refresh triggered')
      // @ts-ignore - store properties
      store.showNotification('Aktualisiere Trainings...', 'info', 2000)

      // Reload page to refresh data
      setTimeout(() => {
        window.location.reload()
      }, 500)

      // Reset indicator
      const refreshIndicator = document.getElementById('pull-refresh-indicator')
      if (refreshIndicator) {
        refreshIndicator.style.opacity = '0'
        refreshIndicator.style.transform = 'translateY(0)'
      }
      isPullingDown = false
      return
    }

    // Reset pull-to-refresh indicator
    if (isPullingDown) {
      const refreshIndicator = document.getElementById('pull-refresh-indicator')
      if (refreshIndicator) {
        refreshIndicator.style.opacity = '0'
        refreshIndicator.style.transform = 'translateY(0)'
      }
      isPullingDown = false
    }

    // HORIZONTAL SWIPES (must be fast and mostly horizontal)
    const isHorizontalSwipe =
      Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < touchConfig.swipeMaxTime
    const velocity = Math.abs(deltaX) / deltaTime

    if (!isHorizontalSwipe || velocity < touchConfig.swipeVelocity) {
      return
    }

    // AUFGABE 10.1: View Switching (Swipe in middle of screen, not edges)
    const isMiddleSwipe = touchStartX > 80 && touchStartX < window.innerWidth - 80

    if (isMiddleSwipe && Math.abs(deltaX) > touchConfig.swipeThreshold) {
      // @ts-ignore - store properties
      const currentView = store.activeView

      // Swipe Left: Next view (list -> map -> favorites -> list)
      if (deltaX < -touchConfig.swipeThreshold) {
        /** @type {Record<string, string>} */
        const viewCycle = { list: 'map', map: 'favorites', favorites: 'list' }
        const nextView = viewCycle[currentView] || 'list'
        // @ts-ignore - store properties
        store.setActiveView(nextView)
        log('info', `Swipe left - switching to ${nextView} view`)
        return
      }

      // Swipe Right: Previous view (list -> favorites -> map -> list)
      if (deltaX > touchConfig.swipeThreshold) {
        /** @type {Record<string, string>} */
        const viewCycle = { list: 'favorites', map: 'list', favorites: 'map' }
        const prevView = viewCycle[currentView] || 'list'
        // @ts-ignore - store properties
        store.setActiveView(prevView)
        log('info', `Swipe right - switching to ${prevView} view`)
        return
      }
    }

    // Edge Swipes: Open/Close Filter Sidebar
    // Swipe Left from right edge (close filter if open)
    if (deltaX < -touchConfig.swipeThreshold && touchStartX > window.innerWidth - 50) {
      // @ts-ignore - store properties
      if (store.filterSidebarOpen || store.mobileFilterOpen) {
        // @ts-ignore - store properties
        store.filterSidebarOpen = false
        // @ts-ignore - store properties
        store.mobileFilterOpen = false
        log('debug', 'Swipe left from edge - closing filter')
      }
      return
    }

    // Swipe Right from left edge (open filter)
    if (deltaX > touchConfig.swipeThreshold && touchStartX < 50) {
      if (window.innerWidth < (CONFIG.ui?.mobileBreakpoint || 768)) {
        // @ts-ignore - store properties
        store.mobileFilterOpen = true
      } else {
        // @ts-ignore - store properties
        store.filterSidebarOpen = true
      }
      log('debug', 'Swipe right from edge - opening filter')
      return
    }
  }

  document.addEventListener('touchstart', handleTouchStart, { passive: true })
  document.addEventListener('touchmove', handleTouchMove, { passive: true })
  document.addEventListener('touchend', handleTouchEnd, { passive: true })

  log('info', 'Touch gestures initialized (AUFGABE 10: View switching + Pull-to-refresh)')
}
