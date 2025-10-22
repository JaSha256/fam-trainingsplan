// ESLint flat config (ESLint 9.x)
// https://eslint.org/docs/latest/use/configure/configuration-files-new

import js from '@eslint/js'
import globals from 'globals'

export default [
  // Recommended config
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      '.vite/**',
      'test-results/**',
      'playwright-report/**',
      '*.min.js',
      '.claude-collective/**',
      '.claude/**',
      '.husky/**',
      '.taskmaster/**'
    ]
  },

  // Main configuration
  {
    files: ['**/*.js', '**/*.mjs'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // Alpine.js globals
        Alpine: 'readonly'
      }
    },

    rules: {
      // Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',

      // ES6+
      'prefer-const': 'warn',
      'no-var': 'warn',
      'arrow-spacing': 'warn',
      'prefer-arrow-callback': 'warn',

      // Code style (handled by Prettier mostly)
      semi: ['error', 'never'],
      quotes: ['warn', 'single', { avoidEscape: true }],
      'comma-dangle': ['warn', 'never'],

      // Prevent common mistakes
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }]
    }
  },

  // Test files
  {
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        // Playwright globals
        page: 'readonly',
        context: 'readonly',
        browser: 'readonly'
      }
    },
    rules: {
      'no-console': 'off'
    }
  },

  // Config files
  {
    files: ['*.config.js', '*.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
