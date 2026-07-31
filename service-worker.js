const CACHE_NAME = 'type-rahmot-v2';

// যেসব ফাইল ক্যাশ করা হবে (আপনার প্রজেক্টের সঠিক ফাইল নামগুলো নিশ্চিত করুন)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app.js',
  './icon-192.png',
  './icon-512.png'
  // আপনার যদি আলাদা CSS ফাইল থাকে, তবে নিচের মতো যোগ করুন:
  // './style.css'
];

// ১. নিরাপদ ইনস্টলেশন (একটি ফাইল মিসিং হলেও ইনস্টল আটকাবে না)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching essential assets...');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn(`Failed to cache ${url}:`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ২. অ্যাক্টিভেশন (পুরানো ক্যাশ মুছে ফেলা)
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

// ৩. ফেচ হ্যান্ডলিং (অফলাইন সাপোর্ট)
self.addEventListener('fetch', (event) => {
  // কেবল GET রিকোয়েস্ট ক্যাশ করা হবে
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        // কেবল http/https প্রোটোকলের সম্পদ ক্যাশ করা হবে
        if (event.request.url.startsWith('http')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // পুরোপুরি অফলাইনে থাকলে index.html পেজে ফেরত পাঠাবে
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
