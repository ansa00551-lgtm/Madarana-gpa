const CACHE_NAME = 'gpa-tullab-v1';

// كل الملفات اللي نبغاها تشتغل بدون نت
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Google Fonts - تُخزَّن أول مرة
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap'
];

// تثبيت: خزّن كل الملفات
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {
        // لو فشل تخزين الفونت (بدون نت) ما يوقف التثبيت
        return cache.addAll(['./', './index.html', './manifest.json']);
      });
    })
  );
  self.skipWaiting();
});

// تفعيل: احذف الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// طلبات الشبكة: Cache First
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((response) => {
        // خزّن الفونت وملفات جديدة
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // لو فشل كل شيء، رجّع الصفحة الرئيسية
        return caches.match('./index.html');
      });
    })
  );
});
