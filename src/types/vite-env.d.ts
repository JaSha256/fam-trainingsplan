/// <reference types="vite/client" />

/**
 * Vite Environment Variables Type Definitions
 * @see https://vitejs.dev/guide/env-and-mode.html
 */

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
  readonly VITE_API_URL?: string
  readonly VITE_VERSION_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
