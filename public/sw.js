// ── ClawBot Mission Control — Service Worker (PWA) ──────────
const CACHE_VERSION = 'clawbot-mcs-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  // Network-first for API calls
  if (event.request.url.includes('supabase.co') || event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    )
    return
  }
  // Cache-first for static assets
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const clone = response.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone))
        return response
      })
    )
  )
})
