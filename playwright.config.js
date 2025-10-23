import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  retries: 0,
  reporter: [['html'], ['list']],

  use: {
    baseURL: 'http://localhost:5173/fam-trainingsplan/',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    headless: true // Run in headless mode to avoid window spawning on unused screens
  },

  projects: [{
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 } // Ensure desktop viewport for view buttons
    }
  }],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173/fam-trainingsplan/',
    reuseExistingServer: true,
    timeout: 120 * 1000
  }
})
