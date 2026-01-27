// src/js/modules/performance-monitoring.js
/**
 * Performance Monitoring
 * @description Observes navigation timing via PerformanceObserver
 * @module performance-monitoring
 */

// @ts-check

import { CONFIG, log } from '../config.js'

/**
 * Setup Performance Monitoring
 * @returns {void}
 */
export function setupPerformanceMonitoring() {
  if (!CONFIG.logging?.enabled || !('PerformanceObserver' in window)) {
    return
  }

  try {
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'navigation') {
          const navEntry = /** @type {PerformanceNavigationTiming} */ (entry)
          log('debug', 'Page Load Performance', {
            dns: Math.round(navEntry.domainLookupEnd - navEntry.domainLookupStart),
            tcp: Math.round(navEntry.connectEnd - navEntry.connectStart),
            ttfb: Math.round(navEntry.responseStart - navEntry.requestStart),
            download: Math.round(navEntry.responseEnd - navEntry.responseStart),
            domInteractive: Math.round(navEntry.domInteractive),
            domComplete: Math.round(navEntry.domComplete),
            loadComplete: Math.round(navEntry.loadEventEnd)
          })
        }
      })
    })

    observer.observe({ entryTypes: ['navigation'] })
  } catch (error) {
    log('warn', 'Performance monitoring failed', error)
  }
}
