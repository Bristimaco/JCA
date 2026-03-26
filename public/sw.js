const CACHE_NAME = 'jca-v1';
const STATIC_ASSETS = [
    '/',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

// Install: pre-cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch: network-first for navigations, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Navigation requests (HTML pages): network-first
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match('/').then((cached) => cached || new Response('Geen internetverbinding. Probeer het later opnieuw.', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
                }))
            )
        );
        return;
    }

    // Static assets (JS, CSS, images, fonts): cache-first
    if (request.destination === 'script' || request.destination === 'style' ||
        request.destination === 'image' || request.destination === 'font') {
        event.respondWith(
            caches.match(request).then((cached) =>
                cached || fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
            )
        );
        return;
    }
});
