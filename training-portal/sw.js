// ═══════════════════════════════════════════════════════
// SERVICE WORKER - Training Portal Lotus Garden PWA
// Scope: /training-portal/
// Version: 3.1
// ═══════════════════════════════════════════════════════

const CACHE_NAME   = 'lotus-training-v3.1';
const BASE         = '/training-portal';
const OFFLINE_URL  = BASE + '/offline.html';

const APP_SHELL = [
  BASE + '/training.html',
  BASE + '/offline.html',
  BASE + '/manifest.json',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
  BASE + '/icons/icon-72.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'
];

// ── INSTALL ──────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing v3.1 scope:/training-portal/');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        APP_SHELL.map(url =>
          cache.add(url).catch(e => console.warn('[SW] Skip cache:', url, e.message))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // GAS API → Network Only (jangan cache)
  if (url.hostname === 'script.google.com' ||
      url.hostname === 'script.googleusercontent.com') {
    event.respondWith(networkOnly(req));
    return;
  }

  // Drive thumbnails & Fonts → Cache First
  if (url.hostname === 'drive.google.com' ||
      url.hostname === 'lh3.googleusercontent.com' ||
      url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(req));
    return;
  }

  // App shell → Cache First + offline fallback
  event.respondWith(cacheFirstWithFallback(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch { return cached || offlineHTML(); }
}

async function cacheFirstWithFallback(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const offlinePage = await caches.match(OFFLINE_URL);
    return offlinePage || offlineHTML();
  }
}

async function networkOnly(req) {
  try {
    return await fetch(req);
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Offline — tidak ada koneksi' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function offlineHTML() {
  return new Response(
    `<html><body style="font-family:sans-serif;text-align:center;padding:48px;background:#0d3318;color:#fff">
      <div style="font-size:56px">📶</div>
      <h2 style="color:#f0d060;margin-top:16px">Tidak ada koneksi</h2>
      <p style="color:rgba(255,255,255,.6);margin-top:8px">Hubungkan ke internet & refresh.</p>
      <button onclick="location.reload()" style="margin-top:24px;background:#c9a227;color:#0d3318;border:none;border-radius:30px;padding:12px 28px;font-weight:700;font-size:14px;cursor:pointer">🔄 Coba Lagi</button>
    </body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  );
}

// ── Background Sync ───────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-uploads') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_UPLOADS' }))
      )
    );
  }
});

// ── Push Notification ─────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(
      data.title || '🌸 Training Portal - Lotus Garden',
      {
        body: data.body || 'Ada update baru!',
        icon: BASE + '/icons/icon-192.png',
        badge: BASE + '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        data: { url: data.url || BASE + '/training.html' }
      }
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || BASE + '/training.html'));
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
