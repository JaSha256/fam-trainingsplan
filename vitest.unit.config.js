// @ts-check
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// @ts-ignore - mergeConfig with imported viteConfig produces complex union type
export default mergeConfig(
  // @ts-ignore - viteConfig type inference issue from default export
  viteConfig,
  defineConfig({
    test: {
      name: 'unit',
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      include: ['tests/unit/**/*.test.js'],
      exclude: [
        'tests/unit/main.test.js' // PWA tests require virtual modules
      ],
      globals: true,
      coverage: {
        enabled: true,
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['tests/**', '**/*.config.js', '**/node_modules/**', 'dist/**']
      }
    }
  })
)
