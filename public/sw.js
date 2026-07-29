const CACHE_NAME = 'smartmiz-v3';
const URLS_TO_CACHE = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  // Yangi versiya kutib turmasdan darhol ishga tushsin
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// Eski keshlarni o'chiramiz, aks holda foydalanuvchi brauzerida eski JS
// abadiy qolib ketadi va yangi deploy ularga umuman yetib bormaydi.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // GET bo'lmagan so'rovlarni (Firestore yozuvlari va h.k.) umuman ushlamaymiz
  if (event.request.method !== 'GET') return;
  // Faqat o'z domenimiz: Firebase/Google so'rovlari keshlanmasin
  if (new URL(event.request.url).origin !== self.location.origin) return;

  // HTML fayllari uchun har doim tarmoqdan olishga harakat qilamiz (Network First)
  // Bu yangi versiya chiqqanda eski index.html keshda qolib ketmasligi uchun kerak
  if (event.request.mode === 'navigate' || 
      event.request.url.endsWith('/') || 
      event.request.url.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Tarmoqdan kelgan yangi nusxani keshga saqlaymiz
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request)) // Internet bo'lmasa keshdan olamiz
    );
    return;
  }

  // Boshqa fayllar (rasm, css, js) uchun keshdan qidiramiz, bo'lmasa tarmoqdan olamiz
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    })
  );
});
