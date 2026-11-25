/* ===================================================
   CAMINHOS DA MEMÓRIA - Service Worker
   Cache-first para arquivos estáticos,
   network-first para páginas HTML
   =================================================== */

const CACHE_NAME = 'caminhos-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/pages/sobre-alzheimer.html',
    '/pages/cuidador.html',
    '/pages/atividades.html',
    '/pages/comunidade.html',
    '/css/style.css',
    '/css/pages.css',
    '/js/main.js',
    '/js/cuidador.js',
    '/js/forum.js',
    '/js/checklist.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon.svg',
];

// Instala o SW e pré-cacheia os arquivos estáticos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Estratégia: cache-first para estáticos, network-first para HTML
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições externas (fontes, imagens Unsplash, etc.)
    if (url.origin !== self.location.origin) return;

    if (request.destination === 'document') {
        // Network-first para HTML: tenta rede, cai no cache se offline
        event.respondWith(
            fetch(request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return res;
                })
                .catch(() => caches.match(request).then(r => r || caches.match('/index.html')))
        );
    } else {
        // Cache-first para CSS, JS, imagens
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(res => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return res;
                });
            })
        );
    }
});
