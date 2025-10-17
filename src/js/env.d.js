// src/js/env.d.js
/**
 * Vite Environment Variables Type Definitions
 * @fileoverview Type definitions for Vite's import.meta.env
 */

/**
 * Vite Environment Variables
 *
 * @typedef {Object} ImportMetaEnv
 * @property {string} [VITE_API_URL] - API URL for trainingsplan.json
 * @property {string} [VITE_VERSION_URL] - Version URL for update-check
 * @property {'development' | 'production' | 'test'} MODE - Build mode
 * @property {boolean} DEV - Development mode flag
 * @property {boolean} PROD - Production mode flag
 * @property {boolean} SSR - Server-side rendering flag
 * @property {string} BASE_URL - Base URL for assets
 */

/**
 * Vite Import Meta
 *
 * @typedef {Object} ImportMeta
 * @property {ImportMetaEnv} env - Environment variables
 * @property {string} url - Module URL
 * @property {Object} hot - Hot Module Replacement API (dev only)
 */

// Augment globalThis with ImportMeta type
// This makes `import.meta.env` type-safe

export {}
