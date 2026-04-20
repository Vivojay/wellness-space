const VERSION = "v1";
const STATIC_CACHE = `ssa-static-${VERSION}`;
const IMAGE_CACHE = `ssa-images-${VERSION}`;
const PAGE_CACHE = `ssa-pages-${VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/icons/logo-removebg-preview.png",
  "/photos/logo_gpay.png",
];

const CACHEABLE_DESTINATIONS = new Set(["script", "style", "font"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, IMAGE_CACHE, PAGE_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function isCacheableResponse(response) {
  return Boolean(response) && (response.ok || response.type === "opaque");
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;

  const deletions = keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key));
  await Promise.all(deletions);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const network = await fetch(request);
  if (isCacheableResponse(network)) {
    await cache.put(request, network.clone());
    if (cacheName === IMAGE_CACHE) {
      await trimCache(IMAGE_CACHE, 220);
    }
  }

  return network;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (isCacheableResponse(response)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise || Response.error();
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const network = await fetch(request);
    if (isCacheableResponse(network)) {
      await cache.put(request, network.clone());
    }
    return network;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await caches.match("/");
    if (fallback) return fallback;
    return Response.error();
  }
}

function shouldSkip(request) {
  if (request.method !== "GET") return true;
  if (request.cache === "only-if-cached" && request.mode !== "same-origin") return true;

  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.includes("/api/")) {
    return true;
  }

  return false;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (shouldSkip(request)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGE_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  if (CACHEABLE_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
  }
});
