const CACHE_NAME = 'type-rahmot-v1';

// ক্যাশ করার ফাইলগুলোর তালিকা
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './icon-192.png',
  './apple-touch-icon.png'
];

// ১. সার্ভিস ওয়ার্কার ইনস্টলেশন (ফাইলগুলো ক্যাশে জমা রাখা)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ২. অ্যাক্টিভেশন (পুরানো ভার্সনের ক্যাশ মুছে ফেলা)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ৩. ফেচ হ্যান্ডলিং (অফলাইনে ক্যাশ থেকে ডেটা লোড করা)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ক্যাশে ফাইল পাওয়া গেলে ক্যাশ থেকেই রিটার্ন করবে
      if (cachedResponse) {
        return cachedResponse;
      }

      // ক্যাশে না থাকলে ইন্টারনেট থেকে লোড করবে
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }).catch(() => {
      // সম্পূর্ণ অফলাইনে থাকলে index.html পেজে ফেরত পাঠাবে
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
