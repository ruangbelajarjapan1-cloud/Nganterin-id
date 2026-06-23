// 1. URL DARI GOOGLE APPS SCRIPT (Sama seperti di app.js)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw.../exec";

// 2. CEK STATUS SAAT APLIKASI DIBUKA
window.onload = function() {
    let statusDriver = localStorage.getItem("statusDriver");
    let btn = document.getElementById("statusBtn");
    
    if (statusDriver === "ONLINE") {
        btn.classList.remove("offline");
        btn.classList.add("online");
        btn.innerText = "ONLINE (MENCARI ORDER)";
    }
};

// 3. FUNGSI TOMBOL ONLINE / OFFLINE
function toggleStatus() {
    let btn = document.getElementById("statusBtn");
    
    // Ubah status ke ONLINE
    if (btn.classList.contains("offline")) {
        btn.classList.remove("offline");
        btn.classList.add("online");
        btn.innerText = "ONLINE (MENCARI ORDER)";
        
        // Simpan di memori HP
        localStorage.setItem("statusDriver", "ONLINE");
        
        // (Opsional) Kirim data ke Google Sheets bahwa driver ini Online
        console.log("Status: ONLINE. Mengirim sinyal ke server...");
        alert("Kamu sekarang ONLINE! Siap-siap dengerin bunyi Telegram ya.");
    } 
    // Ubah status ke OFFLINE
    else {
        btn.classList.remove("online");
        btn.classList.add("offline");
        btn.innerText = "MENYALA ABANGKU";
        
        // Simpan di memori HP
        localStorage.setItem("statusDriver", "OFFLINE");
        alert("Kamu OFFLINE. Istirahat dulu, Abangku!");
    }
}
