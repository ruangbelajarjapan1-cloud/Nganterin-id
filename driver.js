// 1. URL DARI GOOGLE APPS SCRIPT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7HWyhEbbwN6U8xG-rrpXFnPXnNjhBqKE62EveIn1I4ojVBNnyRkMCFmdo7bq_y.../exec";

let intervalPencarian; // Variabel untuk menyimpan timer polling

// 2. CEK STATUS SAAT APLIKASI DIBUKA
window.onload = function() {
    let statusDriver = localStorage.getItem("statusDriver");
    let btn = document.getElementById("statusBtn");
    
    if (statusDriver === "ONLINE") {
        btn.classList.remove("offline");
        btn.classList.add("online");
        btn.innerText = "MENCARI PESANAN...";
        mulaiCariOrder(); // Langsung mulai mencari jika statusnya online
    }
};

// 3. FUNGSI TOMBOL ONLINE / OFFLINE
function toggleStatus() {
    let btn = document.getElementById("statusBtn");
    let notif = document.getElementById("notifOrder");
    
    if (btn.classList.contains("offline")) {
        // UBAH KE ONLINE
        btn.classList.remove("offline");
        btn.classList.add("online");
        btn.innerText = "MENCARI PESANAN...";
        localStorage.setItem("statusDriver", "ONLINE");
        
        alert("Status Aktif! Aplikasi sekarang memantau pesanan di area Anda.");
        mulaiCariOrder(); // Jalankan fungsi pencarian

    } else {
        // UBAH KE OFFLINE
        btn.classList.remove("online");
        btn.classList.add("offline");
        btn.innerText = "AKTIFKAN STATUS";
        localStorage.setItem("statusDriver", "OFFLINE");
        
        alert("Status Nonaktif. Anda tidak akan menerima pesanan untuk sementara waktu.");
        berhentiCariOrder(); // Hentikan pencarian
        
        if (notif) notif.style.display = "none";
    }
}

// 4. LOGIKA PENCARIAN ORDER (POLLING)
function mulaiCariOrder() {
    // Simulasi: Mengecek server setiap 10 detik (10000 milidetik)
    intervalPencarian = setInterval(cekPesananKeServer, 10000);
    
    // DEMO: Munculkan popup pertama kali setelah 3 detik untuk presentasi
    setTimeout(() => {
        let notif = document.getElementById("notifOrder");
        if (notif && localStorage.getItem("statusDriver") === "ONLINE") {
            notif.style.display = "block";
        }
    }, 3000);
}

function berhentiCariOrder() {
    clearInterval(intervalPencarian);
}

// Fungsi ini yang nantinya mengambil data dari Google Sheets (GET Request)
async function cekPesananKeServer() {
    console.log("Mengecek pesanan baru ke server...");
    // Nanti kode fetch() ke Apps Script ditaruh di sini
}

// 5. FUNGSI AMBIL DAN TOLAK ORDER
function terimaOrder() {
    let notif = document.getElementById("notifOrder");
    
    // Nanti ditambahkan kode fetch() POST untuk mengubah status di Sheets
    
    notif.style.display = "none";
    alert("Berhasil! Pesanan telah masuk ke daftar tugas Anda. Silakan menuju lokasi penjemputan.");
}

function tolakOrder() {
    let notif = document.getElementById("notifOrder");
    notif.style.display = "none";
    console.log("Pesanan diabaikan, menunggu pesanan berikutnya...");
}
