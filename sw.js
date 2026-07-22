const CACHE = "meu-dinheiro-v5";
const ASSETS = ["/", "/index.html"];

// Instala e limpa caches antigos imediatamente
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting(); // ativa o novo SW imediatamente
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // assume controle de todas as abas abertas
});

// Network-first: sempre busca versão nova na rede, usa cache só se offline
self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    // Para o HTML: sempre tenta rede primeiro
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
  } else {
    // Para outros assets: cache primeiro, depois rede
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
