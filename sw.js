const CACHE = 'pedido-fenix-v6';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.add('/Pedido-Fenix/pedido_deposito.html'))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(cached => {
        if (cached) {
          fetch(e.request).then(res => { if (res.ok) c.put(e.request, res); }).catch(() => {});
          return cached;
        }
        return fetch(e.request).then(res => {
          if (res.ok) c.put(e.request, res.clone());
          return res;
        });
      })
    )
  );
});
