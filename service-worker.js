const CACHE_NAME = 'type-rahmot-v4'; // ভার্সন নাম পরিবর্তন করা হয়েছে

// যেসব ফাইল ক্যাশ করা আবশ্যক
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app.js'
];

// ১. ইনস্টলেশন এবং ইন্সট্যান্ট অ্যাক্টিভেশন
self.addEventListener('install', (event) => {
  self.skipWaiting(); // পুরানো সার্ভিস ওয়ার্কারকে সাথে সাথে বাইপাস করবে
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

// ২. পুরানো ক্যাশ ক্লিনআপ এবং তাৎক্ষণিক কন্ট্রোল
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
    }).then(() => self.clients.claim()) // নতুন সার্ভিস ওয়ার্কার সাথে সাথে পেজের কন্ট্রোল নেবে
  );
});

// ৩. অফলাইন ফেচ লজিক (গিটহাব পেজেস ফ্রেন্ডলি)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // ক্যাশে ফাইল থাকলে সেখান থেকে লোড হবে
      if (cachedResponse) {
        return cachedResponse;
      }

      // ক্যাশে না থাকলে নেটওয়ার্ক থেকে আনবে
      return fetch(event.request).catch(() => {
        // পুরোপুরি অফলাইনে থাকলে এবং পেজ নেভিগেট করলে index.html পেজ আউটপুট দেবে
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});
