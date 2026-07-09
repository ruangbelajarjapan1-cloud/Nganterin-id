// Naikkan versi setiap kali Anda mengubah HTML/CSS/JS agar memori lama terhapus
const CACHE_NAME = "nganterin-v3"; 

const urlsToCache = [
  "./",
  "./index.html",
  "./food.html",
  "./ride.html",
  "./send.html",
  "./mart.html",
  "./driver.html",
  "./riwayat.html",
  "./pesan.html",
  "./profil.html"
];

// Install Service Worker dan simpan file ke memori HP (Cache)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// AKTIVASI: Hapus cache versi lama agar aplikasi selalu mendapatkan update terbaru
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("Menghapus cache lama:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// FETCH: Gunakan file dari Cache, jika tidak ada, ambil dari internet.
// Ditambah dengan fungsi .catch() agar tidak muncul error merah saat gagal muat ikon.
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        console.log("Peringatan: Gagal memuat resource dari jaringan (Mungkin offline): ", event.request.url);
        // Biarkan aplikasi tetap berjalan lancar meskipun 1 gambar gagal dimuat
      });
    })
  );
});
