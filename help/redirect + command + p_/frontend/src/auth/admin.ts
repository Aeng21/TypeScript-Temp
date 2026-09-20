// Logika untuk admin.html. Terpisah dari player.ts.

// requireLogin: guard yang memastikan hanya role tertentu yang boleh mengakses halaman ini.
// logout: hapus session di server + cookie di browser.
import { requireLogin, logout } from '../authApi.js';

// Elemen teks sambutan dan tombol logout di halaman admin.html.
const welcomeText = document.getElementById('welcomeText') as HTMLParagraphElement;
const btnLogout = document.getElementById('btnLogout') as HTMLButtonElement;

// Fungsi inisialisasi halaman, dipanggil sekali saat script dimuat (lihat init() di paling bawah).
async function init() {
    // requireLogin('admin') otomatis redirect ke login.html jika belum login ATAU role bukan admin.
    const status = await requireLogin('admin'); // otomatis redirect ke login.html jika bukan admin
    // Jika status null berarti sudah di-redirect oleh requireLogin, hentikan fungsi di sini.
    if (!status) return;
    // Tampilkan nama user yang sedang login di teks sambutan.
    welcomeText.textContent = `Halo, ${status.username}! Kamu login sebagai admin.`;
}

// Memasang listener klik pada tombol logout. Tidak menerima parameter event karena tidak dipakai.
btnLogout.addEventListener('click', async () => {
    await logout(); // hapus session di server & cookie di browser
    window.location.href = '/src/auth/login.html'; // kembali ke halaman login
});

// Jalankan inisialisasi begitu file ini dimuat oleh browser.
init();

// Menandai file ini sebagai module ES, bukan script global.
export { };
