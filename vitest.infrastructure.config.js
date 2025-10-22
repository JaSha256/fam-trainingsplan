import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'infrastructure',
    environment: 'node',
    include: ['tests/infrastructure/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    testTimeout: 10000,
    reporters: ['verbose'],
    coverage: {
      enabled: false // Infrastructure tests validate setup, not application code
    },
    server: {
      deps: {
        external: ['fs-extra']
      }
    }
  }
})
