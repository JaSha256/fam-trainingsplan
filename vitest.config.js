import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.js'],
    exclude: [
      'tests/e2e/**/*',
      'tests/unit/main.test.js', // PWA tests require virtual modules, better tested with E2E
      'tests/unit/iframe-resize.test.js' // Iframe auto-init conflicts with unit test isolation
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        'src/**/*.test.js',
        'src/**/*.spec.js',
        'src/main.js', // Entry point, tested via E2E
        'src/js/env.d.js', // Type definitions only
        'src/js/types.js', // Type definitions only
        'src/js/iframe-resize.js' // Auto-init conflicts with test isolation
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
})