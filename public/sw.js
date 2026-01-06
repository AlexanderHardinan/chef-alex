/* Minimal SW: installable + safe (no caching logic) */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch (no caching). Keeps behavior identical to normal web.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
