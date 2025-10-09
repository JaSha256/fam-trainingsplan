// tests/e2e/performance.spec.js
/**
 * Performance Benchmarking Tests
 * Tests Core Web Vitals and application performance
 */

import { test, expect } from '@playwright/test'
import { waitForAlpineAndData } from './test-helpers.js'

test.describe('Performance Benchmarks', () => {
  test.describe('Core Web Vitals', () => {
    test('Largest Contentful Paint (LCP) is under 2.5s', async ({ page }) => {
      await page.goto('/')

      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            resolve(lastEntry.renderTime || lastEntry.loadTime)
          }).observe({ type: 'largest-contentful-paint', buffered: true })

          // Fallback timeout
          setTimeout(() => resolve(0), 5000)
        })
      })

      console.log(`LCP: ${lcp}ms`)
      expect(lcp).toBeLessThan(2500) // Good LCP < 2.5s
    })

    test('First Input Delay (FID) simulation', async ({ page }) => {
      await page.goto('/')
      await waitForAlpineAndData(page)

      // Wait for page to be interactive
      await page.waitForLoadState('networkidle')

      // Simulate interaction
      const startTime = Date.now()
      await page.click('button', { timeout: 5000 })
      const endTime = Date.now()

      const interactionTime = endTime - startTime

      console.log(`Interaction time: ${interactionTime}ms`)
      expect(interactionTime).toBeLessThan(200) // Relaxed threshold
    })

    test('Cumulative Layout Shift (CLS) is under 0.1', async ({ page }) => {
      await page.goto('/')

      await page.waitForTimeout(2000) // Let page settle

      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0

          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            }
            resolve(clsValue)
          }).observe({ type: 'layout-shift', buffered: true })

          setTimeout(() => resolve(clsValue), 2000)
        })
      })

      console.log(`CLS: ${cls}`)
      expect(cls).toBeLessThan(0.1) // Good CLS < 0.1
    })
  })

  test.describe('Page Load Performance', () => {
    test('page loads within 3 seconds', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const endTime = Date.now()

      const loadTime = endTime - startTime

      console.log(`Page load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(3000)
    })

    test('Time to First Byte (TTFB) is fast', async ({ page }) => {
      const [response] = await Promise.all([
        page.waitForResponse(response => response.url().includes('localhost')),
        page.goto('/')
      ])

      const timing = await response.serverTiming()
      const ttfb = await page.evaluate(() => {
        const [entry] = performance.getEntriesByType('navigation')
        return entry.responseStart - entry.requestStart
      })

      console.log(`TTFB: ${ttfb}ms`)
      expect(ttfb).toBeLessThan(600) // Good TTFB < 600ms
    })

    test('DOM Content Loaded is fast', async ({ page }) => {
      await page.goto('/')

      const domContentLoaded = await page.evaluate(() => {
        const [entry] = performance.getEntriesByType('navigation')
        return entry.domContentLoadedEventEnd - entry.fetchStart
      })

      console.log(`DOM Content Loaded: ${domContentLoaded}ms`)
      expect(domContentLoaded).toBeLessThan(1500)
    })

    test('page is interactive quickly', async ({ page }) => {
      await page.goto('/')

      const tti = await page.evaluate(() => {
        const [entry] = performance.getEntriesByType('navigation')
        return entry.domInteractive - entry.fetchStart
      })

      console.log(`Time to Interactive: ${tti}ms`)
      expect(tti).toBeLessThan(2000)
    })
  })

  test.describe('JavaScript Performance', () => {
    test('Alpine.js initializes quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForFunction(() => window.Alpine !== undefined)
      const endTime = Date.now()

      const alpineInitTime = endTime - startTime

      console.log(`Alpine init time: ${alpineInitTime}ms`)
      expect(alpineInitTime).toBeLessThan(1000)
    })

    test('data loads within reasonable time', async ({ page }) => {
      await page.goto('/')
      const startTime = Date.now()

      await waitForAlpineAndData(page)

      const endTime = Date.now()
      const dataLoadTime = endTime - startTime

      console.log(`Data load time: ${dataLoadTime}ms`)
      expect(dataLoadTime).toBeLessThan(3000)
    })

    test('filter operations are fast', async ({ page }) => {
      await page.goto('/')
      await waitForAlpineAndData(page)

      const startTime = Date.now()

      await page.evaluate(() => {
        window.Alpine.store('ui').filters.wochentag = 'Montag'
        const component = window.Alpine.$data(document.querySelector('[x-data]'))
        component.applyFilters()
      })

      await page.waitForTimeout(100)

      const endTime = Date.now()
      const filterTime = endTime - startTime

      console.log(`Filter time: ${filterTime}ms`)
      expect(filterTime).toBeLessThan(500)
    })

    test('search is performant', async ({ page }) => {
      await page.goto('/')
      await waitForAlpineAndData(page)

      const startTime = Date.now()

      await page.evaluate(() => {
        window.Alpine.store('ui').filters.searchTerm = 'Parkour'
        window.Alpine.store('trainingsplaner').applyFilters()
      })

      await page.waitForTimeout(100)

      const endTime = Date.now()
      const searchTime = endTime - startTime

      console.log(`Search time: ${searchTime}ms`)
      expect(searchTime).toBeLessThan(500)
    })
  })

  test.describe('Resource Loading', () => {
    test('total page size is reasonable', async ({ page }) => {
      const response = await page.goto('/')

      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource').map(r => ({
          name: r.name,
          size: r.transferSize || r.encodedBodySize || 0
        }))
      })

      const totalSize = resources.reduce((sum, r) => sum + r.size, 0)

      console.log(`Total resources: ${totalSize} bytes (${(totalSize / 1024).toFixed(2)} KB)`)
      expect(totalSize).toBeLessThan(2 * 1024 * 1024) // < 2MB
    })

    test('JavaScript bundle size is optimized', async ({ page }) => {
      await page.goto('/')

      const jsResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(r => r.name.endsWith('.js'))
          .map(r => ({
            name: r.name,
            size: r.transferSize || r.encodedBodySize || 0
          }))
      })

      const totalJsSize = jsResources.reduce((sum, r) => sum + r.size, 0)

      console.log(`Total JS: ${(totalJsSize / 1024).toFixed(2)} KB`)
      expect(totalJsSize).toBeLessThan(500 * 1024) // < 500KB
    })

    test('CSS is optimized', async ({ page }) => {
      await page.goto('/')

      const cssResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(r => r.name.endsWith('.css'))
          .map(r => ({
            name: r.name,
            size: r.transferSize || r.encodedBodySize || 0
          }))
      })

      const totalCssSize = cssResources.reduce((sum, r) => sum + r.size, 0)

      console.log(`Total CSS: ${(totalCssSize / 1024).toFixed(2)} KB`)
      expect(totalCssSize).toBeLessThan(100 * 1024) // < 100KB
    })

    test('images are optimized', async ({ page }) => {
      await page.goto('/')

      const imageResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(r => r.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/))
          .map(r => ({
            name: r.name,
            size: r.transferSize || r.encodedBodySize || 0
          }))
      })

      const totalImageSize = imageResources.reduce((sum, r) => sum + r.size, 0)

      console.log(`Total images: ${(totalImageSize / 1024).toFixed(2)} KB`)
      // Images should be reasonable (may not have many on main page)
      expect(totalImageSize).toBeLessThan(1024 * 1024) // < 1MB
    })
  })

  test.describe('DOM Performance', () => {
    test('DOM size is reasonable', async ({ page }) => {
      await page.goto('/')
      await waitForAlpineAndData(page)

      const domSize = await page.locator('*').count()

      console.log(`DOM nodes: ${domSize}`)
      expect(domSize).toBeLessThan(1500)
    }, { timeout: 45000 })

    test('no excessive DOM depth', async ({ page }) => {
      await page.goto('/')

      const maxDepth = await page.evaluate(() => {
        function getMaxDepth(element) {
          if (!element || element.children.length === 0) return 0
          return 1 + Math.max(...Array.from(element.children).map(getMaxDepth))
        }
        return getMaxDepth(document.body)
      })

      console.log(`Max DOM depth: ${maxDepth}`)
      expect(maxDepth).toBeLessThan(15)
    })
  })

  test.describe('Memory Performance', () => {
    test('no memory leaks on filter changes', async ({ page }) => {
      await page.goto('/')
      await waitForAlpineAndData(page)

      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize
        }
        return 0
      })

      // Perform multiple filter operations
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => {
          window.Alpine.store('ui').filters.wochentag = 'Montag'
          const component = window.Alpine.$data(document.querySelector('[x-data]'))
          component.applyFilters()
        })
        await page.waitForTimeout(100)

        await page.evaluate(() => {
          window.Alpine.store('ui').resetFilters()
          const component = window.Alpine.$data(document.querySelector('[x-data]'))
          component.applyFilters()
        })
        await page.waitForTimeout(100)
      }

      // Get final memory
      const finalMemory = await page.evaluate(() => {
        if (performance.memory) {
          return performance.memory.usedJSHeapSize
        }
        return 0
      })

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory
        const percentIncrease = (memoryIncrease / initialMemory) * 100

        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB (${percentIncrease.toFixed(2)}%)`)

        // Memory shouldn't increase by more than 50%
        expect(percentIncrease).toBeLessThan(50)
      }
    }, { timeout: 45000 })
  })

  test.describe('Mobile Performance', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('mobile load time is acceptable', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const endTime = Date.now()

      const loadTime = endTime - startTime

      console.log(`Mobile load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(4000) // Slightly more lenient for mobile
    })

    test('mobile interactions are responsive', async ({ page }) => {
      await page.goto('/')
      await page.waitForFunction(() => window.Alpine !== undefined)

      const startTime = Date.now()

      await page.evaluate(() => {
        window.Alpine.store('ui').mobileFilterOpen = true
      })

      await page.waitForTimeout(100)

      const endTime = Date.now()
      const interactionTime = endTime - startTime

      console.log(`Mobile interaction time: ${interactionTime}ms`)
      expect(interactionTime).toBeLessThan(300)
    })
  })

  test.describe('Network Performance', () => {
    test('handles slow 3G gracefully', async ({ page, context }) => {
      // Simulate slow 3G
      await context.route('**/*', route => {
        setTimeout(() => route.continue(), 100)
      })

      const startTime = Date.now()
      await page.goto('/')
      await page.waitForFunction(() => window.Alpine !== undefined, { timeout: 10000 })
      const endTime = Date.now()

      const loadTime = endTime - startTime

      console.log(`Slow 3G load time: ${loadTime}ms`)
      // Should still load within reasonable time even on slow connection
      expect(loadTime).toBeLessThan(10000)
    })
  })
})
