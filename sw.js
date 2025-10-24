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
    "url": "assets/index.BY9qlG0U.css",
    "revision": null
  }, {
    "url": "assets/js/index.D81OVK4P.js",
    "revision": null
  }, {
    "url": "assets/js/vendor-alpine.D9MLegQT.js",
    "revision": null
  }, {
    "url": "assets/js/vendor-map.zdHhRoWp.js",
    "revision": null
  }, {
    "url": "assets/js/vendor-utils.Dw8P0qyA.js",
    "revision": null
  }, {
    "url": "assets/js/virtual_pwa-register.jG66OWqM.js",
    "revision": null
  }, {
    "url": "assets/js/workbox-window.prod.es5.CwtvwXb3.js",
    "revision": null
  }, {
    "url": "fam-logo-dark.svg",
    "revision": "de8317348f10939bc8af7b010234e4c2"
  }, {
    "url": "fam-logo.svg",
    "revision": "d84416198ac83404635fe3c8018b53aa"
  }, {
    "url": "index.html",
    "revision": "5f02047380c9c488766d23d021576842"
  }, {
    "url": "offline.html",
    "revision": "27d63b495e0cc4307617e5f5a6153a8a"
  }, {
    "url": "manifest.webmanifest",
    "revision": "d65486a3bc1bc14e5f0ec53f32ea2797"
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
