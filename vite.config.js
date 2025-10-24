// @ts-check
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// @ts-ignore - ConfigEnv type compatibility with plugin types
export default defineConfig(({ mode }) => {
  // Load environment variables for the given mode
  const env = loadEnv(mode, process.cwd(), '')

  // Environment detection
  const isDev = mode === 'development'
  const isTest = mode === 'test' || process.env.VITEST === 'true'

  // Base path strategy:
  // - Development & Test: relative paths ('./') for local dev and test environments
  // - Production: absolute GitHub Pages path for deployment
  const basePath = isDev || isTest ? './' : '/fam-trainingsplan/'

  return {
    base: basePath,

    plugins: [
      // Tailwind CSS v4 Plugin with Forms & Typography
      // @ts-ignore - tailwindcss plugin accepts options but types are incomplete
      tailwindcss({
        // @ts-ignore - plugins property exists but not in type definition
        plugins: ['@tailwindcss/forms', '@tailwindcss/typography']
      }),

      // PWA Plugin
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],

        manifest: {
          name: 'FAM Trainingsplan',
          short_name: 'FAM',
          description:
            'Trainingsplan für Free Arts of Movement - Parkour, Trampolin, Tricking in München',
          theme_color: '#005892',
          background_color: '#005892',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: basePath,
          start_url: basePath,
        lang: 'de',
        dir: 'ltr',
        categories: ['sports', 'lifestyle'],

        icons: [
          {
            src: `${basePath}icons/icon-72x72.png`,
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-96x96.png`,
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-128x128.png`,
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-144x144.png`,
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-152x152.png`,
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-192x192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-384x384.png`,
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: `${basePath}icons/icon-maskable-512x512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],

        shortcuts: [
          {
            name: 'Heute',
            short_name: 'Heute',
            description: 'Heutige Trainings anzeigen',
            url: `${basePath}?filter=heute`,
            icons: [
              {
                src: `${basePath}icons/shortcut-today-96x96.png`,
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Karte',
            short_name: 'Karte',
            description: 'Trainings auf Karte',
            url: `${basePath}?view=map`,
            icons: [
              {
                src: `${basePath}icons/shortcut-map-96x96.png`,
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Favoriten',
            short_name: 'Favoriten',
            description: 'Meine Favoriten',
            url: `${basePath}?filter=favoriten`,
            icons: [
              {
                src: `${basePath}icons/shortcut-favorites-96x96.png`,
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ]
      },

        workbox: {
          runtimeCaching: [
            {
              urlPattern: isDev || isTest
                ? /^http:\/\/localhost:5173\/.*/i
                : /^https:\/\/jasha256\.github\.io\/fam-trainingsplan\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'fam-data-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 3600
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/unpkg\.com\/leaflet.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'leaflet-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 86400 * 30
                }
              }
            },
            {
              urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'osm-tiles-cache',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 86400 * 7
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 86400 * 30
                }
              }
            },
            {
              urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 86400 * 365
                }
              }
            }
          ],

          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
          navigateFallback: `${basePath}index.html`,
          navigateFallbackDenylist: [/^\/api/, /\.json$/],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true
        },

        devOptions: {
          enabled: false
        }
      }),

      // Bundle Analyzer (only when ANALYZE=true)
      ...(process.env.ANALYZE === 'true'
        ? [
            visualizer({
              filename: 'dist/stats.html',
              open: true,
              gzipSize: true,
              brotliSize: true
            })
          ]
        : [])
    ],

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',

      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-alpine': [
              'alpinejs',
              '@alpinejs/collapse',
              '@alpinejs/focus',
              '@alpinejs/intersect',
              '@alpinejs/persist'
            ],
            'vendor-utils': ['fuse.js'],
            'vendor-map': ['leaflet', 'leaflet.markercluster']
          },

          assetFileNames: assetInfo => {
            const info = assetInfo.name?.split('.') || []
            const ext = info[info.length - 1]

            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return 'assets/images/[name].[hash][extname]'
            }
            if (/woff2?|ttf|eot/i.test(ext)) {
              return 'assets/fonts/[name].[hash][extname]'
            }
            return 'assets/[name].[hash][extname]'
          },

          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js'
        }
      },

      chunkSizeWarningLimit: 600
    },

    server: {
      port: 5173,
      strictPort: false,
      open: false,
      cors: true
    },

    preview: {
      port: 4173,
      strictPort: false,
      open: false
    },

    optimizeDeps: {
      include: [
        'alpinejs',
        '@alpinejs/collapse',
        '@alpinejs/focus',
        '@alpinejs/intersect',
        '@alpinejs/persist',
        'fuse.js',
        'leaflet',
        'leaflet.markercluster'
      ],
      exclude: []
    }
  }
})
