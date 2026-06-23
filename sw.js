const CACHE_NAME = "nganterin-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./food.html",
  "./ride.html",
  "./send.html",
  "./mart.html",
  "./driver.html",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
];

// Install Service Worker dan simpan file ke memori HP (Cache)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Gunakan file dari Cache jika internet lambat
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
