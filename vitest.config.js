import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.js'],
    exclude: [
      'tests/e2e/**/*',
      'tests/unit/main.test.js' // PWA tests require virtual modules, better tested with E2E
    ]
  }
})