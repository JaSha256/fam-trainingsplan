// puppeteer.config.js
/**
 * Puppeteer Test Configuration
 * @description Optimized for debugging and visual testing
 */

const config = {
  // Launch options
  launch: {
    headless: false, // Set to true for CI/CD
    slowMo: 50, // Slow down by 50ms for better debugging visibility
    devtools: false, // Open DevTools automatically (useful for debugging)
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ],
    defaultViewport: null // Use full window size
  },

  // Test environment
  env: {
    baseUrl: 'http://localhost:5173',
    timeout: 30000,
    screenshotPath: './tests/puppeteer/screenshots',
    videoPath: './tests/puppeteer/videos'
  },

  // Debugging options
  debug: {
    screenshots: true, // Take screenshots on failure
    screenshotOnStep: false, // Take screenshot after each step (verbose)
    console: true, // Log browser console messages
    network: false, // Log network requests
    slowMo: 50, // Additional slow motion for debugging
    pauseOnFailure: false // Pause test execution on failure (interactive debugging)
  },

  // Viewport presets
  viewports: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 },
    mobileL: { width: 425, height: 812 }
  },

  // User agents
  userAgents: {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  },

  // Test data
  testData: {
    searchQueries: ['Parkour', 'München', 'Kids', 'Montag'],
    filterCombinations: [
      { training: 'Parkour', ort: 'München' },
      { wochentag: 'Montag', altersgruppe: 'Kids' }
    ]
  }
}

export default config
