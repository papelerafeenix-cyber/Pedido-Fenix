const CACHE = 'pedido-fenix-v4';
const FILES = ['/Pedido-Fenix/pedido_deposito.html'];

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

// Solo intercepta la navegación al HTML.
// Intenta red con timeout de 3s — si hay corte breve (ej. WiFi→5G)
// sirve desde cache sin interrumpir la app.
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(
    Promise.race([
      fetch(e.request).then(res => {
        var copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }),
      new Promise((_, reject) => setTimeout(reject, 3000))
    ]).catch(() => caches.match(e.request))
  );
});
