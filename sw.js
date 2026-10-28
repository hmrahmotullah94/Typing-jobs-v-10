
const CACHE_NAME = 'type-rahmot-v10.11';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './icon-192.png',
  './icon-512.png'
];

// 1. Install and cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Required files must be cached successfully.
      await cache.addAll(ASSETS_TO_CACHE);

      await self.skipWaiting();
    })()
  );
});

// 2. Activate and remove only old app caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith('type-rahmot-') &&
              key !== CACHE_NAME
          )
          .map((key) => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// 3. Offline request handling
self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Handle only requests from this website.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Navigation: network first, then cached app.
      if (request.mode === 'navigate') {
        try {
          const response = await fetch(request);

          if (response.ok) {
            await cache.put('./index.html', response.clone());
            return response;
          }
        } catch (error) {
          // Use the cached page while offline.
        }

        return (
          await cache.match(request) ||
          await cache.match('./index.html') ||
          await cache.match('./')
        ) || new Response(
          'অফলাইনে অ্যাপ পাওয়া যাচ্ছে না। প্রথমে ইন্টারনেট দিয়ে অ্যাপটি খুলুন।',
          {
            status: 503,
            headers: {
              'Content-Type': 'text/plain; charset=utf-8'
            }
          }
        );
      }

      // Other assets: cache first.
      const cached = await cache.match(request, {
        ignoreSearch: true
      });

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return new Response('ফাইলটি অফলাইনে পাওয়া যায়নি।', {
          status: 503
        });
      }
    })()
  );
});
