// ====================================================================
// BOYOLALI APP - FRONTEND CORE (dipakai di semua halaman)
// ====================================================================

// 1. URL DARI GOOGLE APPS SCRIPT
// PENTING: Ganti URL ini dengan URL hasil "Deploy" Apps Script Anda sendiri.
// Cara dapatnya: buka code.gs di Apps Script > Deploy > New deployment > Web app > Copy URL.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7HWyhEbbwN6U8xG-rrpXFnPXnNjhBqKE62EveIn1I4ojVBNnyRkMCFmdo7bq_yOcKYg/exec";

// 2. REGISTRASI SERVICE WORKER (PWA) - cukup didaftarkan sekali di sini
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log("Service Worker Terdaftar!"))
        .catch(err => console.log("Gagal mendaftar Service Worker", err));
}

// Helper: matikan tombol sementara agar tidak diklik dua kali
function kunciTombol(btn) {
    if (!btn) return null;
    const teksAsli = btn.innerText;
    btn.dataset.teksAsli = teksAsli;
    btn.innerText = "Memproses...";
    btn.disabled = true;
    return teksAsli;
}
function bukaKunciTombol(btn) {
    if (!btn) return;
    btn.innerText = btn.dataset.teksAsli || btn.innerText;
    btn.disabled = false;
}

// ====================================================================
// 3. FUNGSI MENGIRIM DATA PESANAN KE GOOGLE SHEETS
// Dipakai oleh: ride.html, food.html, mart.html, send.html
// ====================================================================
async function kirimPesanan(layanan, detailJemput, detailTujuan, harga) {
    let namaUser = localStorage.getItem("userName");
    let hpUser = localStorage.getItem("userPhone");

    if (!namaUser || !hpUser) {
        alert("Sistem mendeteksi Anda belum login. Silakan login kembali.");
        return false;
    }

    let btn = document.activeElement;
    kunciTombol(btn);

    let dataKirim = new URLSearchParams({
        "action": "pesan_layanan",
        "layanan": layanan,
        "nama": namaUser,
        "wa": hpUser,
        "jemput": detailJemput,
        "tujuan": detailTujuan,
        "harga": harga
    });

    try {
        let response = await fetch(SCRIPT_URL, { method: 'POST', body: dataKirim });
        let hasil = await response.json();

        if (hasil.status === "sukses") {
            // Simpan info pesanan aktif supaya riwayat.html bisa melacaknya
            localStorage.setItem("pesananAktifBaris", hasil.baris);
            localStorage.setItem("pesananAktifLayanan", layanan);
            alert("Pesanan Berhasil Dibuat! Silakan pantau status pesanan Anda.");
            window.location.href = "riwayat.html";
            return true;
        } else {
            alert("Terjadi kesalahan sistem: " + (hasil.pesan || "Tidak diketahui"));
            return false;
        }
    } catch (error) {
        alert("Gagal terhubung ke server. Pastikan internet Anda stabil dan SCRIPT_URL di app.js sudah benar.");
        return false;
    } finally {
        bukaKunciTombol(btn);
    }
}

// ====================================================================
// 4. FUNGSI MENGIRIM DATA USER BARU
// ====================================================================
async function kirimDataUserBaru(namaUser, waUser, email, alamat) {
    let dataKirim = new URLSearchParams({
        "action": "daftar_user",
        "nama": namaUser,
        "wa": waUser,
        "email": email || "",
        "alamat": alamat || ""
    });

    try {
        let response = await fetch(SCRIPT_URL, { method: 'POST', body: dataKirim });
        let hasil = await response.json();
        console.log("Respon Server (Pendaftaran User):", hasil);
        return hasil.status === "sukses";
    } catch (error) {
        console.error("Gagal sinkronisasi data pengguna ke server:", error);
        return false;
    }
}

// ====================================================================
// 5. FUNGSI PENDAFTARAN MITRA DRIVER
// Dipakai oleh: daftar-driver.html
// ====================================================================
async function daftarDriverBaru(nama, wa, kendaraan, plat) {
    let dataKirim = new URLSearchParams({
        "action": "daftar_driver",
        "nama": nama,
        "wa": wa,
        "kendaraan": kendaraan,
        "plat": plat
    });

    try {
        let response = await fetch(SCRIPT_URL, { method: 'POST', body: dataKirim });
        let hasil = await response.json();
        return hasil.status === "sukses";
    } catch (error) {
        console.error("Gagal mendaftarkan driver:", error);
        return false;
    }
}

// ====================================================================
// 6. FUNGSI-FUNGSI UNTUK APLIKASI DRIVER
// Dipakai oleh: driver.js / driver.html
// ====================================================================
async function ambilPesananTersedia() {
    try {
        let response = await fetch(SCRIPT_URL + "?action=orders");
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil daftar order:", error);
        return [];
    }
}

async function terimaOrderServer(baris, namaDriver, waDriver) {
    let dataKirim = new URLSearchParams({
        "action": "ambil_order",
        "baris": baris,
        "namaDriver": namaDriver,
        "waDriver": waDriver
    });
    try {
        let response = await fetch(SCRIPT_URL, { method: 'POST', body: dataKirim });
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil order:", error);
        return { status: "gagal", pesan: "Koneksi gagal" };
    }
}

async function selesaikanOrderServer(baris) {
    let dataKirim = new URLSearchParams({ "action": "selesai_order", "baris": baris });
    try {
        let response = await fetch(SCRIPT_URL, { method: 'POST', body: dataKirim });
        return await response.json();
    } catch (error) {
        return { status: "gagal" };
    }
}

async function kirimLokasiDriver(wa, nama, lat, lng) {
    let dataKirim = new URLSearchParams({
        "action": "update_lokasi", "wa": wa, "nama": nama, "lat": lat, "lng": lng
    });
    try {
        await fetch(SCRIPT_URL, { method: 'POST', body: dataKirim });
    } catch (error) {
        console.log("Gagal mengirim lokasi:", error);
    }
}

// ====================================================================
// 7. FUNGSI UNTUK TRACKING PESANAN (riwayat.html)
// ====================================================================
async function ambilStatusPesanan(baris) {
    try {
        let response = await fetch(SCRIPT_URL + "?action=status_pesanan&baris=" + baris);
        return await response.json();
    } catch (error) {
        return { status: "gagal" };
    }
}

async function ambilLokasiDriver(wa) {
    try {
        let response = await fetch(SCRIPT_URL + "?action=lokasi&wa=" + encodeURIComponent(wa));
        return await response.json();
    } catch (error) {
        return { status: "gagal" };
    }
}

// ====================================================================
// 8. FUNGSI UNTUK DASBOR ADMIN (admin.html)
// ====================================================================
async function ambilDataAdmin() {
    try {
        let response = await fetch(SCRIPT_URL + "?action=admin");
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil data admin:", error);
        return { status: "gagal" };
    }
}
