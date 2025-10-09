import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Unit tests with jsdom
  {
    extends: './vite.config.js',
    test: {
      name: 'unit',
      environment: 'jsdom',
      include: ['tests/unit/**/*.test.js'],
      exclude: [
        'tests/unit/main.test.js' // PWA tests require virtual modules
      ],
      globals: true,
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'tests/**',
          '**/*.config.js',
          '**/node_modules/**',
          'dist/**'
        ]
      }
    }
  },

  // Integration tests with browser mode
  {
    extends: './vite.config.js',
    test: {
      name: 'integration',
      browser: {
        enabled: true,
        provider: 'playwright',
        headless: true,
        instances: [
          { browser: 'chromium' }
        ]
      },
      include: ['tests/integration/**/*.test.js'],
      globals: true,
      testTimeout: 10000
    }
  }
])
