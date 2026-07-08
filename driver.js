// 1. URL DARI GOOGLE APPS SCRIPT 
// Pastikan URL di bawah ini sama persis dengan yang ada di baris ke-2 file app.js Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7HWyhEbbwN6U8xG-rrpXFnPXnNjhBqKE62EveIn1I4ojVBNnyRkMCFmdo7bq_y.../exec";

// 2. CEK STATUS SAAT APLIKASI DIBUKA
window.onload = function() {
    let statusDriver = localStorage.getItem("statusDriver");
    let btn = document.getElementById("statusBtn");
    
    if (statusDriver === "ONLINE") {
        btn.classList.remove("offline");
        btn.classList.add("online");
        btn.innerText = "MENCARI PESANAN...";
    }
};

// 3. FUNGSI TOMBOL ONLINE / OFFLINE
function toggleStatus() {
    let btn = document.getElementById("statusBtn");
    let notif = document.getElementById("notifOrder");
    
    // Ubah status ke ONLINE
    if (btn.classList.contains("offline")) {
        btn.classList.remove("offline");
        btn.classList.add("online");
        btn.innerText = "MENCARI PESANAN...";
        
        // Simpan di memori HP
        localStorage.setItem("statusDriver", "ONLINE");
        
        // (Opsional) Kirim data ke Google Sheets bahwa driver ini Online
        console.log("Status: ONLINE. Mengirim sinyal ke server...");
        alert("Status Aktif! Aplikasi sekarang memantau pesanan di area Anda.");
        
        // Simulasi memunculkan pesanan setelah 2 detik 
        // (Nantinya bagian ini diganti dengan pemanggilan data dari Google Sheets)
        setTimeout(() => {
            if (notif) {
                notif.style.display = "block";
            }
        }, 2000);

    } 
    // Ubah status ke OFFLINE
    else {
        btn.classList.remove("online");
        btn.classList.add("offline");
        btn.innerText = "AKTIFKAN STATUS";
        
        // Simpan di memori HP
        localStorage.setItem("statusDriver", "OFFLINE");
        alert("Status Nonaktif. Anda tidak akan menerima pesanan untuk sementara waktu.");
        
        // Sembunyikan notifikasi jika status dimatikan
        if (notif) {
            notif.style.display = "none";
        }
    }
}

// 4. FUNGSI TERIMA PESANAN
function terimaOrder() {
    alert("Pesanan diterima! Panduan arah menuju lokasi penjemputan telah diaktifkan.");
    let notif = document.getElementById("notifOrder");
    if (notif) {
        notif.style.display = "none";
    }
}
