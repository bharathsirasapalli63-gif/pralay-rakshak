/**
 * Progressive Web App Service Worker
 * Caches app shell, static assets, and allows offline access in remote mountain corridors.
 */

const CACHE_NAME = 'pralay-rakshak-v2.0';
const ASSETS_TO_CACHE = [
  '/',
  '/static/index.html',
  '/static/styles.css',
  '/static/app.js',
  '/static/map.js',
  '/static/report.js',
  '/static/alerts.js',
  '/static/emergency.js',
  '/static/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline app shell');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[ServiceWorker] Pre-cache warning for external resources:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through API requests to network or fallback
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({
          status: 'OFFLINE_MODE',
          message: 'Currently operating in offline mountain mode.'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Network-first falling back to cache for assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
