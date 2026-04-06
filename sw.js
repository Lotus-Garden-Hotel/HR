/**
 * ══════════════════════════════════════════════════════════════
 *  SERVICE WORKER — Guard Patrol System
 *  Lotus Garden Hotel Kediri
 *  Strategy:
 *    • Static assets  → Cache First (shell, fonts)
 *    • GAS API calls  → Network First + cache fallback
 *    • Offline page   → served from cache jika jaringan mati
 * ══════════════════════════════════════════════════════════════
 */

const CACHE_NAME    = "lg-patrol-v1";
const SHELL_CACHE   = "lg-patrol-shell-v1";
const DYNAMIC_CACHE = "lg-patrol-dynamic-v1";

// ── App Shell: file statis yang harus selalu tersedia ──
const SHELL_ASSETS = [
  "./satpam_patrol.html",
  "./supervisor_dashboard.html",
  "./hrd_report.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ── Font CDN yang di-cache ──
const FONT_ORIGINS = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com"
];

// ══════════════════════════════════════════
//  INSTALL — Cache app shell
// ══════════════════════════════════════════
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn("[SW] Install cache error:", err))
  );
});

// ══════════════════════════════════════════
//  ACTIVATE — Hapus cache lama
// ══════════════════════════════════════════
self.addEventListener("activate", event => {
  const validCaches = [SHELL_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => !validCaches.includes(k))
          .map(k => { console.log("[SW] Deleting old cache:", k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

// ══════════════════════════════════════════
//  FETCH — Routing strategy
// ══════════════════════════════════════════
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya handle GET (POST patrol scan lewat — tidak di-cache)
  if (request.method !== "GET") return;

  // ── GAS API → Network First ──
  if (url.hostname.includes("script.google.com") || url.hostname.includes("googleapis.com") && url.pathname.includes("/macros/")) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // ── Google Fonts → Cache First (stale-while-revalidate) ──
  if (FONT_ORIGINS.some(o => request.url.startsWith(o))) {
    event.respondWith(cacheFirstWithNetwork(request, DYNAMIC_CACHE));
    return;
  }

  // ── App Shell (HTML, icons, manifest) → Cache First ──
  if (SHELL_ASSETS.some(a => url.pathname.endsWith(a.replace(".", "")))) {
    event.respondWith(cacheFirstWithNetwork(request, SHELL_CACHE));
    return;
  }

  // ── Default → Network First ──
  event.respondWith(networkFirstWithFallback(request));
});

// ══════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════

/**
 * Network First: coba jaringan, fallback ke cache.
 * Jika jaringan sukses → simpan ke dynamic cache.
 */
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Kembalikan offline response sederhana untuk API
    return new Response(
      JSON.stringify({ status: "offline", message: "Tidak ada koneksi internet" }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Cache First: cek cache dulu, fetch di background untuk update.
 */
async function cacheFirstWithNetwork(request, cacheName = DYNAMIC_CACHE) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response && response.ok) {
      caches.open(cacheName).then(c => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise;
}

// ══════════════════════════════════════════
//  MESSAGE — Skip waiting dari UI
// ══════════════════════════════════════════
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "CACHE_VERSION") {
    event.source.postMessage({ type: "CACHE_VERSION", version: CACHE_NAME });
  }
});
