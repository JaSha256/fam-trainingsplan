// @ts-check
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Resolve vite config function with test mode
const resolvedViteConfig = typeof viteConfig === 'function'
  ? viteConfig({ mode: 'test', command: 'serve' })
  : viteConfig

// @ts-ignore - mergeConfig with imported viteConfig produces complex union type
export default mergeConfig(
  resolvedViteConfig,
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
