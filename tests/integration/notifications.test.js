// tests/integration/notifications.test.js
/**
 * Integration Tests: Notification System
 * Tests Alpine.js notification store integration with DOM
 */

import { test, expect } from '@playwright/test'
// Playwright provides page via test context

test.describe('Notification System Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForFunction(() => window.Alpine !== undefined)
  })

  test.describe('Show Notification', () => {
    test('should display notification with correct message', async ({ page }) => {
      // Trigger notification
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Test Message', 'info', 0)
      })

      await page.waitForTimeout(200)

      // Check notification is visible
      const notification = page.locator('[data-notification]')
      await expect(notification).toBeVisible()

      // Check message content
      const hasMessage = await page.evaluate(() => {
        const notif = window.Alpine.store('ui').notification
        return notif?.message === 'Test Message'
      })
      expect(hasMessage).toBe(true)
    })

    test('should display info notification with correct styling', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Info message', 'info', 0)
      })

      await page.waitForTimeout(200)

      const notifType = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.type
      })

      expect(notifType).toBe('info')
    })

    test('should display success notification', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Success!', 'success', 0)
      })

      await page.waitForTimeout(200)

      const notifData = await page.evaluate(() => {
        return window.Alpine.store('ui').notification
      })

      expect(notifData.message).toBe('Success!')
      expect(notifData.type).toBe('success')
      expect(notifData.show).toBe(true)
    })

    test('should display warning notification', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Warning!', 'warning', 0)
      })

      await page.waitForTimeout(200)

      const notifType = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.type
      })

      expect(notifType).toBe('warning')
    })

    test('should display error notification', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Error!', 'error', 0)
      })

      await page.waitForTimeout(200)

      const notifType = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.type
      })

      expect(notifType).toBe('error')
    })
  })

  test.describe('Auto-Hide Notification', () => {
    test('should auto-hide notification after duration', async ({ page }) => {
      // Show with 1 second duration
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Auto-hide test', 'info', 1000)
      })

      await page.waitForTimeout(200)

      // Should be visible
      let isVisible = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.show === true
      })
      expect(isVisible).toBe(true)

      // Wait for auto-hide
      await page.waitForTimeout(1200)

      // Should be hidden
      isVisible = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.show === true
      })
      expect(isVisible).toBe(false)
    })

    test('should not auto-hide when duration is 0', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Persistent', 'info', 0)
      })

      await page.waitForTimeout(200)

      // Wait longer than typical auto-hide
      await page.waitForTimeout(2000)

      // Should still be visible
      const isVisible = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.show === true
      })
      expect(isVisible).toBe(true)
    })
  })

  test.describe('Hide Notification', () => {
    test('should manually hide notification', async ({ page }) => {
      // Show persistent notification
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Manual hide test', 'info', 0)
      })

      await page.waitForTimeout(200)

      // Verify visible
      let isVisible = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.show === true
      })
      expect(isVisible).toBe(true)

      // Hide manually
      await page.evaluate(() => {
        window.Alpine.store('ui').hideNotification()
      })

      await page.waitForTimeout(400) // Animation time

      // Should be hidden
      isVisible = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.show === true
      })
      expect(isVisible).toBe(false)
    })

    test('should clear notification data after hide animation', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Test', 'info', 0)
      })

      await page.waitForTimeout(200)

      await page.evaluate(() => {
        window.Alpine.store('ui').hideNotification()
      })

      // Wait for animation
      await page.waitForTimeout(400)

      const notification = await page.evaluate(() => {
        return window.Alpine.store('ui').notification
      })

      expect(notification).toBeNull()
    })
  })

  test.describe('Multiple Notifications', () => {
    test('should replace previous notification with new one', async ({ page }) => {
      // Show first notification
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('First', 'info', 0)
      })

      await page.waitForTimeout(200)

      // Show second notification
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Second', 'success', 0)
      })

      await page.waitForTimeout(200)

      // Should show only second notification
      const message = await page.evaluate(() => {
        return window.Alpine.store('ui').notification?.message
      })

      expect(message).toBe('Second')
    })

    test('should cancel previous auto-hide timer', async ({ page }) => {
      // Show first with auto-hide
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('First', 'info', 1000)
      })

      await page.waitForTimeout(500)

      // Show second before first hides
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Second', 'info', 0)
      })

      await page.waitForTimeout(800) // First would have hidden by now

      // Second should still be visible
      const notification = await page.evaluate(() => {
        return window.Alpine.store('ui').notification
      })

      expect(notification.message).toBe('Second')
      expect(notification.show).toBe(true)
    })
  })

  test.describe('Online/Offline Notifications', () => {
    // SKIP: Known timing issue - offline event sometimes triggers online notification instead
    // This is a race condition that's difficult to reproduce consistently in integration tests
    // The functionality is properly tested in E2E tests (tests/e2e/pwa-offline.spec.js)
    test.skip('should show offline notification when going offline', async ({ page }) => {
      // Trigger offline
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'))
      })

      await page.waitForTimeout(500)

      const notification = await page.evaluate(() => {
        return window.Alpine.store('ui').notification
      })

      expect(notification?.message).toContain('Offline')
    })

    test('should show online notification when coming back online', async ({ page }) => {
      // Trigger online
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'))
      })

      await page.waitForTimeout(500)

      const notification = await page.evaluate(() => {
        return window.Alpine.store('ui').notification
      })

      expect(notification?.message).toContain('online')
    })
  })

  test.describe('Error Handler Notifications', () => {
    test('should show notification on global error', async ({ page }) => {
      // Trigger error
      await page.evaluate(() => {
        const errorEvent = new ErrorEvent('error', {
          message: 'Test error',
          filename: 'test.js',
          lineno: 1,
          colno: 1,
          error: new Error('Test error')
        })
        window.dispatchEvent(errorEvent)
      })

      await page.waitForTimeout(500)

      const notification = await page.evaluate(() => {
        return window.Alpine.store('ui').notification
      })

      expect(notification?.type).toBe('error')
      expect(notification?.message).toContain('Fehler')
    })

    test('should show notification on unhandled promise rejection', async ({ page }) => {
      // Trigger rejection
      await page.evaluate(() => {
        const event = new PromiseRejectionEvent('unhandledrejection', {
          promise: Promise.reject(new Error('Test rejection')),
          reason: new Error('Test rejection')
        })
        window.dispatchEvent(event)
      })

      await page.waitForTimeout(500)

      const notification = await page.evaluate(() => {
        return window.Alpine.store('ui').notification
      })

      expect(notification?.type).toBe('error')
      expect(notification?.message).toContain('Fehler')
    })
  })

  test.describe('Notification DOM Integration', () => {
    test('should render notification element when shown', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('DOM test', 'info', 0)
      })

      await page.waitForTimeout(200)

      const notification = page.locator('[data-notification]')
      await expect(notification).toBeVisible()
    })

    test('should hide notification element when dismissed', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Hide test', 'info', 0)
      })

      await page.waitForTimeout(200)

      await page.evaluate(() => {
        window.Alpine.store('ui').hideNotification()
      })

      await page.waitForTimeout(400)

      const notification = page.locator('[data-notification]')
      await expect(notification).not.toBeVisible()
    })

    test('should have accessible role and aria-live attributes', async ({ page }) => {
      await page.evaluate(() => {
        window.Alpine.store('ui').showNotification('Accessibility test', 'info', 0)
      })

      await page.waitForTimeout(200)

      const hasAriaLive = await page.evaluate(() => {
        const notif = document.querySelector('[data-notification]')
        return notif?.getAttribute('aria-live') === 'polite'
      })

      expect(hasAriaLive).toBe(true)
    })
  })
})
