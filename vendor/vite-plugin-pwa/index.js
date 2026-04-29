const normalizeAssetPath = (base, path) => {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}` || '/';
};

const createServiceWorker = (assets) => {
  const cacheName = `todo-list-app-${Date.now()}`;

  return `const CACHE_NAME = '${cacheName}';
const PRECACHE = ${JSON.stringify(assets, null, 2)};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const request = event.request;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy));
          return response;
        })
        .catch(async () => {
          const cachedRoot = await caches.match('/');
          return cachedRoot || caches.match('/index.html');
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});`;
};

export const VitePWA = (options) => {
  let base = '/';

  return {
    name: 'local-vite-plugin-pwa',
    apply: 'build',
    configResolved(config) {
      base = config.base || '/';
    },
    generateBundle(_outputOptions, bundle) {
      const outputFiles = Object.keys(bundle).filter((file) => !file.endsWith('.map'));
      const publicAssets = (options.includeAssets || []).map((asset) => normalizeAssetPath(base, asset));
      const generatedAssets = outputFiles.map((asset) => normalizeAssetPath(base, asset));
      const precacheAssets = Array.from(
        new Set([normalizeAssetPath(base, '/'), normalizeAssetPath(base, '/index.html'), ...publicAssets, ...generatedAssets]),
      );

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify(options.manifest, null, 2),
      });

      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: createServiceWorker(precacheAssets),
      });
    },
  };
};
