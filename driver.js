// ====================================================================
// LOGIKA APLIKASI DRIVER (driver.html)
// Membutuhkan app.js sudah dimuat lebih dulu (untuk fungsi ambilPesananTersedia,
// terimaOrderServer, kirimLokasiDriver)
// ====================================================================

let intervalPencarian;   // timer polling cari order
let intervalLokasi;      // timer kirim lokasi GPS
let orderAktifSaatIni = null; // menyimpan order yang sedang ditawarkan ke driver

// 1. PASTIKAN DRIVER SUDAH "LOGIN" (isi nama & WA sekali)
function pastikanIdentitasDriver() {
    let nama = localStorage.getItem("driverName");
    let wa = localStorage.getItem("driverWA");
    if (!nama || !wa) {
        nama = prompt("Nama Anda (Mitra Driver):", "");
        wa = prompt("Nomor WhatsApp Anda:", "");
        if (nama && wa) {
            localStorage.setItem("driverName", nama);
            localStorage.setItem("driverWA", wa);
        }
    }
    return { nama, wa };
}

// 2. CEK STATUS SAAT APLIKASI DIBUKA
window.addEventListener('load', function () {
    let statusDriver = localStorage.getItem("statusDriver");
    let btn = document.getElementById("statusBtn") || document.getElementById("switchStatus");
    if (statusDriver === "ONLINE") {
        aktifkanTampilanOnline(btn);
        mulaiCariOrder();
        mulaiKirimLokasi();
    }
});

function aktifkanTampilanOnline(btn) {
    if (!btn) return;
    if (btn.classList) {
        btn.classList.remove("offline");
        btn.classList.add("online");
    }
    if (btn.tagName === "INPUT") btn.checked = true;
    if (btn.innerText !== undefined && btn.tagName !== "INPUT") btn.innerText = "MENCARI PESANAN...";
    let teksStatus = document.getElementById("statusText");
    if (teksStatus) { teksStatus.innerText = "Online"; teksStatus.style.color = "#059669"; }
}

function aktifkanTampilanOffline(btn) {
    if (!btn) return;
    if (btn.classList) {
        btn.classList.remove("online");
        btn.classList.add("offline");
    }
    if (btn.tagName === "INPUT") btn.checked = false;
    if (btn.innerText !== undefined && btn.tagName !== "INPUT") btn.innerText = "AKTIFKAN STATUS";
    let teksStatus = document.getElementById("statusText");
    if (teksStatus) { teksStatus.innerText = "Offline"; teksStatus.style.color = "var(--text-muted)"; }
}

// 3. TOMBOL / SWITCH ONLINE-OFFLINE
function toggleStatus() {
    let btn = document.getElementById("statusBtn");
    let identitas = pastikanIdentitasDriver();
    if (!identitas.nama || !identitas.wa) {
        alert("Anda harus mengisi nama & WhatsApp dulu untuk online.");
        return;
    }

    let sedangOffline = btn ? btn.classList.contains("offline") : localStorage.getItem("statusDriver") !== "ONLINE";

    if (sedangOffline) {
        aktifkanTampilanOnline(btn);
        localStorage.setItem("statusDriver", "ONLINE");
        alert("Status Aktif! Aplikasi sekarang memantau pesanan asli dari server.");
        mulaiCariOrder();
        mulaiKirimLokasi();
    } else {
        aktifkanTampilanOffline(btn);
        localStorage.setItem("statusDriver", "OFFLINE");
        alert("Status Nonaktif. Anda tidak akan menerima pesanan untuk sementara waktu.");
        berhentiCariOrder();
        berhentiKirimLokasi();
        let notif = document.getElementById("notifOrder") || document.getElementById("orderModal");
        if (notif) notif.style.display = "none";
    }
}

// Dipakai versi driver.html yang pakai <input type="checkbox" onchange="ubahStatus(this)">
function ubahStatus(checkbox) {
    let identitas = pastikanIdentitasDriver();
    if (checkbox.checked && (!identitas.nama || !identitas.wa)) {
        checkbox.checked = false;
        alert("Anda harus mengisi nama & WhatsApp dulu untuk online.");
        return;
    }
    if (checkbox.checked) {
        aktifkanTampilanOnline(checkbox);
        localStorage.setItem("statusDriver", "ONLINE");
        mulaiCariOrder();
        mulaiKirimLokasi();
    } else {
        aktifkanTampilanOffline(checkbox);
        localStorage.setItem("statusDriver", "OFFLINE");
        berhentiCariOrder();
        berhentiKirimLokasi();
        let notif = document.getElementById("orderModal") || document.getElementById("notifOrder");
        if (notif) notif.style.display = "none";
    }
}

// 4. LOGIKA PENCARIAN ORDER ASLI (POLLING KE SERVER)
function mulaiCariOrder() {
    cekPesananKeServer(); // langsung cek sekali saat online
    intervalPencarian = setInterval(cekPesananKeServer, 8000); // lalu cek tiap 8 detik
}

function berhentiCariOrder() {
    clearInterval(intervalPencarian);
}

async function cekPesananKeServer() {
    if (typeof ambilPesananTersedia !== "function") return;
    const daftarOrder = await ambilPesananTersedia();
    if (!Array.isArray(daftarOrder) || daftarOrder.length === 0) return;

    // Kalau sedang tidak ada order yang ditampilkan, tampilkan yang paling lama menunggu
    if (!orderAktifSaatIni) {
        tampilkanOrderKeLayar(daftarOrder[0]);
    }
}

function tampilkanOrderKeLayar(order) {
    orderAktifSaatIni = order;
    let modal = document.getElementById("orderModal") || document.getElementById("notifOrder");
    if (!modal) return;

    // Isi detail jika elemen tersedia di halaman
    const setTeks = (id, teks) => { const el = document.getElementById(id); if (el) el.innerText = teks; };
    setTeks("orderLayanan", order.layanan);
    setTeks("orderJemput", order.jemput);
    setTeks("orderTujuan", order.tujuan);
    setTeks("orderHarga", order.harga);
    setTeks("orderMetode", order.metode);

    modal.style.display = "block";
}

// 5. FUNGSI TERIMA / TOLAK ORDER (ASLI, TERHUBUNG KE SERVER)
async function terimaOrder() {
    if (!orderAktifSaatIni) return;
    let identitas = pastikanIdentitasDriver();
    let modal = document.getElementById("orderModal") || document.getElementById("notifOrder");

    const hasil = await terimaOrderServer(orderAktifSaatIni.baris, identitas.nama, identitas.wa);

    if (hasil.status === "sukses") {
        localStorage.setItem("orderAktifBaris", orderAktifSaatIni.baris);
        if (modal) modal.style.display = "none";
        let konfirmasi = confirm("Pesanan diterima! Rute telah diaktifkan.\n\nApakah Anda ingin langsung mengirim pesan WhatsApp ke pelanggan bahwa Anda sedang meluncur?");
        if (konfirmasi && orderAktifSaatIni.nama) {
            let pesanTemplate = `Halo kak, saya ${identitas.nama} dari Boyolali App. Saya sedang meluncur ke lokasi jemput ya.`;
            window.open(`https://wa.me/?text=${encodeURIComponent(pesanTemplate)}`, "_blank");
        }
        orderAktifSaatIni = null;
    } else {
        alert(hasil.pesan || "Order sudah diambil driver lain, mencari order berikutnya...");
        if (modal) modal.style.display = "none";
        orderAktifSaatIni = null;
    }
}

function abaikanOrder() {
    let modal = document.getElementById("orderModal") || document.getElementById("notifOrder");
    if (modal) modal.style.display = "none";
    orderAktifSaatIni = null;
    console.log("Pesanan diabaikan, menunggu pesanan berikutnya...");
}
// Alias supaya kompatibel dengan versi lama tombol "Abaikan"
function tolakOrder() { abaikanOrder(); }

// 6. KIRIM LOKASI GPS DRIVER SECARA BERKALA (untuk tracking di riwayat.html pelanggan)
function mulaiKirimLokasi() {
    kirimLokasiSekarang();
    intervalLokasi = setInterval(kirimLokasiSekarang, 10000); // tiap 10 detik
}
function berhentiKirimLokasi() {
    clearInterval(intervalLokasi);
}
function kirimLokasiSekarang() {
    if (!navigator.geolocation) return;
    let identitas = pastikanIdentitasDriver();
    if (!identitas.wa) return;

    navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (typeof kirimLokasiDriver === "function") {
            kirimLokasiDriver(identitas.wa, identitas.nama, lat, lng);
        }
        // Update marker di peta jika tersedia (map & driverMarker didefinisikan di driver.html)
        if (typeof window.updateDriverMarker === "function") {
            window.updateDriverMarker(lat, lng);
        }
    }, function () {
        console.log("Izin lokasi ditolak / tidak tersedia.");
    });
}
