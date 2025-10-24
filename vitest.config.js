import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Migrated from vitest.workspace.js (deprecated since Vitest 3.2)
    projects: [
      './vitest.unit.config.js',
      './vitest.infrastructure.config.js'
    ],
    // Global defaults (only for .claude-collective tests if no projects match)
    globals: true,
    environment: 'node',
    include: ['.claude-collective/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Fixed: deps.external deprecated → use server.deps.external
    server: {
      deps: {
        external: ['fs-extra']
      }
    }
  }
})