/* Poker Night service worker.
 *
 * Deliberately conservative because the app is auth-gated: we NEVER cache
 * HTML pages or Supabase/API responses (that could leak one user's data to
 * another or serve stale, logged-out shells). We only cache-first the
 * content-hashed static assets and the app icons, and fall back to a static
 * offline page for navigations when the network is unavailable.
 */
const CACHE = "poker-night-v1";
const PRECACHE = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/manifest.webmanifest" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only touch same-origin requests — Supabase & other origins pass straight
  // through, uncached.
  if (url.origin !== self.location.origin) return;

  // Cache-first for hashed/static assets and icons.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
    return;
  }

  // Page navigations: always go to the network so auth state is fresh; only
  // fall back to the offline page if the network is unreachable.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/offline.html"))
    );
    return;
  }

  // Everything else (data, auth): network-only, no caching.
});
