// Service worker template. The build (build/serviceWorkerPlugin.ts) replaces the two placeholders
// below with a content hash and the list of every file in dist, then writes it to dist/sw.js.
// Plain JavaScript on purpose: it runs as-is in the worker, outside the app's TypeScript bundle.

const CACHE_PREFIX = 'med-tracker-shell-';
const CACHE_NAME = CACHE_PREFIX + '__CACHE_VERSION__';
const PRECACHE_URLS = __PRECACHE_URLS__;
const APP_SHELL_URL = '/index.html';
/** How long a navigation waits for the network before the cached shell is used instead. */
const NAVIGATION_TIMEOUT_MS = 3000;
/** Matches paths that end in a file name, which Firebase serves as files rather than the app. */
const FILE_PATH_PATTERN = /\.[^/]+$/;

// No skipWaiting(): a new worker waits until every tab of the old version is closed, so open pages
// keep the cache holding the files they were built with. Font subsets, for example, load lazily
// by their old hashed names, which the new deploy no longer serves.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // `reload` skips the HTTP cache so a new version never precaches a stale copy.
      .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function cacheThenNetwork(request) {
  return caches.match(request).then((cached) => cached ?? fetch(request));
}

/**
 * Network first, so a new deploy shows on the next visit. Offline, failing, or slower than the
 * timeout, it falls back to the precached shell.
 */
async function navigateNetworkFirst(request) {
  let timer;
  const network = fetch(request).then((response) => {
    if (!response.ok) throw new Error(`Navigation failed with HTTP ${response.status}`);
    return response;
  });
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Navigation timed out')), NAVIGATION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([network, timeout]);
  } catch {
    const cached = await caches.match(APP_SHELL_URL);
    // With no cached shell, keep waiting for the network rather than fail a slow first visit.
    return cached ?? network;
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Every app route is the same single-page shell, matching the hosting rewrite of extensionless
  // paths. Opening a file such as /manifest.webmanifest directly gets that file instead.
  const isAppRoute = request.mode === 'navigate' && !FILE_PATH_PATTERN.test(url.pathname);
  event.respondWith(isAppRoute ? navigateNetworkFirst(request) : cacheThenNetwork(request));
});

// Reminders are shown through the registration (required on Android), so a tap should bring the
// app back into focus rather than do nothing.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows[0];
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    }),
  );
});
