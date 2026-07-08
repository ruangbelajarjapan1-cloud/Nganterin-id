// 1. URL DARI GOOGLE APPS SCRIPT (Ganti dengan link URL Web App Anda nanti)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7HWyhEbbwN6U8xG-rrpXFnPXnNjhBqKE62EveIn1I4ojVBNnyRkMCFmdo7bq_yOcKYg/exec";

// 2. REGISTRASI SERVICE WORKER (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(() => console.log("Service Worker Terdaftar!"))
    .catch(err => console.log("Gagal mendaftar Service Worker", err));
}

// 3. FUNGSI UTAMA UNTUK MENGIRIM DATA PESANAN KE GOOGLE SHEETS
async function kirimPesanan(layanan, detailJemput, detailTujuan, harga) {
    // Ambil data user dari memori HP
    let namaUser = localStorage.getItem("userName");
    let hpUser = localStorage.getItem("userPhone");

    if (!namaUser || !hpUser) {
        alert("Sistem mendeteksi Anda belum login. Silakan login kembali.");
        return;
    }

    // Ubah teks tombol menjadi loading agar user tidak klik 2x
    let btn = document.activeElement;
    let teksAsli = btn.innerText;
    btn.innerText = "Memproses...";
    btn.disabled = true;

    // Siapkan data yang akan dikirim
    let dataKirim = new URLSearchParams({
        "layanan": layanan,
        "nama": namaUser,
        "wa": hpUser,
        "jemput": detailJemput,
        "tujuan": detailTujuan,
        "harga": harga
    });

    try {
        // Tembakkan data ke Google Sheets menggunakan Fetch API
        let response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: dataKirim
        });
        
        let hasil = await response.text();
        
        if (hasil === "Sukses") {
            alert("Pesanan Berhasil Dibuat! Driver kami akan segera menghubungi WA Anda.");
            window.location.href = "index.html"; // Kembali ke beranda
        } else {
            alert("Terjadi kesalahan sistem. Coba lagi.");
        }
    } catch (error) {
        alert("Gagal terhubung ke server. Pastikan internet Anda stabil.");
    } finally {
        // Kembalikan tombol seperti semula
        btn.innerText = teksAsli;
        btn.disabled = false;
    }
}
// ==============================================================
// TAMBAHAN KODE: MENGIRIM DATA USER BARU KE GOOGLE SHEETS
// Diletakkan di baris paling bawah app.js tanpa mengubah kode di atasnya
// ==============================================================

async function kirimDataUserBaru(namaUser, waUser) {
    // Pastikan SCRIPT_URL menggunakan link dari Google Apps Script Anda yang terbaru
    const URL_SERVER = SCRIPT_URL; 
    
    // Siapkan data dengan parameter 'action' = 'daftar_user'
    let dataKirim = new URLSearchParams({
        "action": "daftar_user",
        "nama": namaUser,
        "wa": waUser
    });

    try {
        // Tembakkan data ke server Google Sheets secara diam-diam (background process)
        let response = await fetch(URL_SERVER, {
            method: 'POST',
            body: dataKirim
        });
        
        let hasil = await response.text();
        console.log("Respon Server (Pendaftaran):", hasil);
    } catch (error) {
        console.error("Gagal sinkronisasi data pengguna ke server:", error);
    }
}
