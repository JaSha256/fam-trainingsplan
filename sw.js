/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-414b1829'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "apple-touch-icon.png",
    "revision": "b1e9d769e5bd7f69c207f5a3a51e20e0"
  }, {
    "url": "assets/index.DXeZ4om0.css",
    "revision": null
  }, {
    "url": "assets/js/index.DM5CHidO.js",
    "revision": null
  }, {
    "url": "assets/js/leaflet.markercluster-src.TemkLBXi.js",
    "revision": null
  }, {
    "url": "assets/js/vendor-alpine.D9MLegQT.js",
    "revision": null
  }, {
    "url": "assets/js/vendor-map.CN-MMHnt.js",
    "revision": null
  }, {
    "url": "assets/js/vendor-utils.Dw8P0qyA.js",
    "revision": null
  }, {
    "url": "assets/MarkerCluster.BhFbdele.css",
    "revision": null
  }, {
    "url": "assets/MarkerCluster.BKK0pH8C.css",
    "revision": null
  }, {
    "url": "fam-logo-dark.svg",
    "revision": "de8317348f10939bc8af7b010234e4c2"
  }, {
    "url": "fam-logo.svg",
    "revision": "d84416198ac83404635fe3c8018b53aa"
  }, {
    "url": "favicon.ico",
    "revision": "5e1e9cee938ed9d528f5a6142a579a44"
  }, {
    "url": "icons/fam-logo.svg",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  }, {
    "url": "icons/icon-128x128.png",
    "revision": "9a3c5636846c154ffdded75d2a1d65f2"
  }, {
    "url": "icons/icon-144x144.png",
    "revision": "3c157ff2902e3648308fc764c49026c6"
  }, {
    "url": "icons/icon-152x152.png",
    "revision": "ee90bcc5a1d4fd18fd863f3746a02259"
  }, {
    "url": "icons/icon-192x192.png",
    "revision": "da8485e19ea226b3888f6f8fecfbb68e"
  }, {
    "url": "icons/icon-384x384.png",
    "revision": "3e1d12b78e41e683eeb22a5f0066ea61"
  }, {
    "url": "icons/icon-512x512.png",
    "revision": "283d3b4e24154f918e1a63f7d7fb946a"
  }, {
    "url": "icons/icon-72x72.png",
    "revision": "2ceed0e16c198cb9b62faf7a063b645a"
  }, {
    "url": "icons/icon-96x96.png",
    "revision": "a17630b6cd879c628b2e2d7452a2df8a"
  }, {
    "url": "icons/icon-maskable-512x512.png",
    "revision": "235c37ab7fa6c1064fb11d6d61c63636"
  }, {
    "url": "icons/shortcut-favorites-96x96.png",
    "revision": "a17630b6cd879c628b2e2d7452a2df8a"
  }, {
    "url": "icons/shortcut-map-96x96.png",
    "revision": "a17630b6cd879c628b2e2d7452a2df8a"
  }, {
    "url": "icons/shortcut-today-96x96.png",
    "revision": "a17630b6cd879c628b2e2d7452a2df8a"
  }, {
    "url": "index.html",
    "revision": "dd387092342e9b8bc4f3cac9166fe6fc"
  }, {
    "url": "offline.html",
    "revision": "27d63b495e0cc4307617e5f5a6153a8a"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b1e9d769e5bd7f69c207f5a3a51e20e0"
  }, {
    "url": "favicon.ico",
    "revision": "5e1e9cee938ed9d528f5a6142a579a44"
  }, {
    "url": "manifest.webmanifest",
    "revision": "0927cd9e681e44beef63de90762c849f"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/fam-trainingsplan/index.html"), {
    denylist: [/^\/api/, /\.json$/]
  }));
  workbox.registerRoute(/^https:\/\/jasha256\.github\.io\/fam-trainingsplan\/.*/i, new workbox.NetworkFirst({
    "cacheName": "fam-data-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 3600
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/unpkg\.com\/leaflet.*/i, new workbox.CacheFirst({
    "cacheName": "leaflet-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/.*\.tile\.openstreetmap\.org\/.*/i, new workbox.CacheFirst({
    "cacheName": "osm-tiles-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 500,
      maxAgeSeconds: 604800
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp)$/i, new workbox.CacheFirst({
    "cacheName": "image-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:woff|woff2|ttf|eot)$/i, new workbox.CacheFirst({
    "cacheName": "font-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');

}));
