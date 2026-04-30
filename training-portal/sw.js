// ═══════════════════════════════════════════════════════
// SERVICE WORKER - Training Portal Lotus Garden PWA
// Version: 3.1
// ═══════════════════════════════════════════════════════

const CACHE_NAME     = 'lotus-training-v3.1';
const OFFLINE_URL    = 'training-portal/offline.html';
const TRAINING_URL   = 'training-portal/training.html';

// App Shell — file yang di-cache saat install
const APP_SHELL = [
  'training-portal/training.html',
  'training-portal/offline.html',
  'training-portal/manifest.json',
  'training-portal/icons/icon-72.png',
  'training-portal/icons/icon-96.png',
  'training-portal/icons/icon-192.png',
  'training-portal /icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'
];

// ── INSTALL ──────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing v3.1...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell...');
        // Cache satu per satu agar tidak gagal total jika 1 file error
        return Promise.allSettled(
          APP_SHELL.map(url => cache.add(url).catch(e => console.warn('[SW] Failed to cache:', url, e)))
        );
      })
      .then(() => {
        console.log('[SW] App shell cached!');
        return self.skipWaiting();
      })
  );
});

// ── ACTIVATE ─────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      ))
      .then(() => self.clients.claim())
      .then(() => console.log('[SW] Active & claimed!'))
  );
});

// ── FETCH ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET & browser-extension requests
  if (req.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // ① GAS API → Network First (data harus selalu fresh)
  if (
    url.hostname === 'script.google.com' ||
    url.hostname === 'script.googleusercontent.com'
  ) {
    event.respondWith(networkFirst(req, false)); // jangan cache API
    return;
  }

  // ② Google Drive thumbnails → Cache First (gambar jarang berubah)
  if (
    url.hostname === 'drive.google.com' ||
    url.hostname === 'lh3.googleusercontent.com'
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // ③ Google Fonts → Cache First
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // ④ App shell & assets → Cache First dengan offline fallback
  event.respondWith(cacheFirstWithOffline(req));
});

// ── Strategy: Cache First ────────────────────────────
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok && response.status < 400) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return offlinePlaceholder();
  }
}

// ── Strategy: Cache First + Offline Fallback ─────────
async function cacheFirstWithOffline(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Coba cache dulu
    const cached = await caches.match(request);
    if (cached) return cached;

    // Offline fallback
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    return offlinePlaceholder();
  }
}

// ── Strategy: Network First ──────────────────────────
async function networkFirst(request, shouldCache = true) {
  try {
    const response = await fetch(request);
    if (shouldCache && response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    if (shouldCache) {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    // Return offline JSON untuk API calls
    return new Response(
      JSON.stringify({ success: false, error: 'Offline — tidak ada koneksi internet' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── Offline Placeholder ──────────────────────────────
function offlinePlaceholder() {
  return new Response(
    `<html><body style="font-family:sans-serif;text-align:center;padding:40px;background:#0d3318;color:#fff">
      <div style="font-size:60px">📶</div>
      <h2 style="color:#f0d060;margin-top:16px">Tidak ada koneksi</h2>
      <p style="color:rgba(255,255,255,.6);margin-top:8px">Hubungkan ke internet & refresh.</p>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// ── Background Sync (upload tertunda saat offline) ───
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-pending-uploads') {
    event.waitUntil(syncPendingUploads());
  }
});

async function syncPendingUploads() {
  console.log('[SW] Syncing pending uploads...');
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => client.postMessage({ type: 'SYNC_UPLOADS' }));
}

// ── Push Notification ────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(
      data.title || '🌸 Training Portal - Lotus Garden',
      {
        body:    data.body || 'Ada update baru!',
        icon:    '/icons/icon-192.png',
        badge:   '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data:    { url: data.url || '/training.html' },
        actions: [
          { action: 'open',  title: '📂 Buka App' },
          { action: 'close', title: 'Tutup' }
        ]
      }
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action !== 'close') {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/training.html')
    );
  }
});

// ── Message from client ──────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker v3.1 loaded');
