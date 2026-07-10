// Naikkan versi setiap kali Anda mengubah HTML/CSS/JS agar memori lama terhapus
const CACHE_NAME = "boyolali-app-v6";

const urlsToCache = [
  "./",
  "./index.html",
  "./food.html",
  "./ride.html",
  "./send.html",
  "./mart.html",
  "./driver.html",
  "./daftar-driver.html",
  "./admin.html",
  "./riwayat.html",
  "./receipt.html",
  "./pesan.html",
  "./profil.html",
  "./topup.html",
  "./donasi.html",
  "./lainnya.html",
  "./pulsa.html",
  "./tiket.html",
  "./app.js",
  "./driver.js",
  "./manifest.json"
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
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        // PERBAIKAN: Jika gagal memuat dari internet (misal gambar mati/offline), 
        // kita wajib mengembalikan Response palsu/kosong agar browser tidak memunculkan TypeError merah.
        console.log("Resource gagal dimuat, mode offline aktif untuk: ", event.request.url);
        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      });
    })
  );
});
