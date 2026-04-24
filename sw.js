const CACHE = 'pedido-fenix-v3';
const FILES = [
  '/Pedido-Fenix/pedido_deposito.html',
  '/Pedido-Fenix/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Cache-first: sirve desde cache al instante (no depende de la red).
  // Actualiza el cache en background para que la próxima visita tenga la versión nueva.
  e.respondWith(
    caches.match(e.request).then(cached => {
      var update = fetch(e.request).then(res => {
        if (res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || update;
    })
  );
});
