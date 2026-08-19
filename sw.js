const CACHE_NAME = 'type-rahmot-v10.1';

// যেসব ফাইল ক্যাশ করা আবশ্যক
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './icon-192.png',
  './icon-512.png'
];

// ১. ইনস্টলেশন এবং ক্যাশিং
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => 
          cache.add(url).catch(err => console.warn('Cache error for:', url))
        )
      );
    })
  );
});

// ২. পুরানো ক্যাশ মুছে ফেলা
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ৩. অফলাইন ফেচ হ্যান্ডলিং
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // ক্যাশে ফাইল থাকলে সেখান থেকে লোড হবে
      if (cachedResponse) {
        return cachedResponse;
      }

      // ক্যাশে না থাকলে নেটওয়ার্ক থেকে আনবে
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // পুরোপুরি অফলাইনে থাকলে মূল index.html লোড করবে
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});
