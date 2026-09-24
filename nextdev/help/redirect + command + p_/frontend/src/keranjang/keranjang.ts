// Logika untuk keranjang.html. Halaman ini hanya boleh diakses jika sudah login
// (dijaga lewat requireLogin, otomatis lempar ke login.html kalau belum login).

// requireLogin tanpa argumen: cukup memastikan sudah login, tidak peduli role apa.
import { requireLogin } from '../authApi.js';

// Elemen teks sambutan di halaman keranjang.html.
const welcomeText = document.getElementById('welcomeText') as HTMLParagraphElement;

// Fungsi inisialisasi halaman, dipanggil sekali saat script dimuat.
async function init() {
    const status = await requireLogin();
    // Jika belum login, requireLogin sudah redirect; status akan null, hentikan di sini.
    if (!status) return;
    welcomeText.textContent = `Halo, ${status.username}! Keranjangmu masih kosong.`;
}

// Jalankan inisialisasi begitu file ini dimuat oleh browser.
init();

// Menandai file ini sebagai module ES, bukan script global.
export { };
