import { defineConfig } from 'vitest/config'

// Main Vitest configuration with projects
export default defineConfig({
  test: {
    projects: [
      './vitest.unit.config.js',
      './vitest.infrastructure.config.js'
    ]
  }
})
