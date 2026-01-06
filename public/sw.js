/* public/sw.js */
const CACHE_NAME = "chef-alex-pwa-v1";

// Add only stable, small, always-present routes/assets
const PRECACHE_URLS = [
  "/",
  "/login",
  "/dashboard",
  "/send",
  "/reports",
  "/manifest.webmanifest",
  "/pwa/icon-192.png",
  "/pwa/icon-512.png",
  "/pwa/maskable-192.png",
  "/pwa/maskable-512.png",
  "/pwa/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

// Network-first for pages, cache-first for static.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  // Ignore non-GET
  if (req.method !== "GET") return;

  const isStatic =
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/pwa/") ||
    url.pathname.startsWith("/chefalex.png") ||
    url.pathname.startsWith("/facebook.png") ||
    url.pathname.startsWith("/instagram.png") ||
    url.pathname.startsWith("/linkedin.png") ||
    url.pathname.startsWith("/phone.png") ||
    url.pathname.startsWith("/website.png") ||
    url.pathname.startsWith("/email.png");

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      })
    );
    return;
  }

  // Network-first for routes/pages
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
