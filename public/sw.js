const CACHE_NAME = 'smartmiz-v2';
const URLS_TO_CACHE = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
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
