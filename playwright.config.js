import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for FAM Trainingsplan
 * Supports multi-browser testing with environment-aware base URL
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,

  // CI: Retry flaky tests for stability
  // Local: No retries for faster feedback
  retries: process.env.CI ? 2 : 0,

  reporter: [['html'], ['list']],

  use: {
    // Environment-aware base URL
    // CI: Absolute GitHub Pages path
    // Local: Relative path for development
    baseURL: process.env.CI
      ? 'http://localhost:5173/fam-trainingsplan/'
      : 'http://localhost:5173/',

    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    headless: true
  },

  // Multi-browser testing matrix
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      }
    }
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  }
})
