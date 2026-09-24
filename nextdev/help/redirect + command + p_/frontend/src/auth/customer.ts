// Logika untuk customer.html. Terpisah dari player.ts.

// requireLogin: guard yang memastikan hanya role tertentu yang boleh mengakses halaman ini.
// logout: hapus session di server + cookie di browser.
import { requireLogin, logout } from '../authApi.js';

// Elemen teks sambutan dan tombol logout di halaman customer.html.
const welcomeText = document.getElementById('welcomeText') as HTMLParagraphElement;
const btnLogout = document.getElementById('btnLogout') as HTMLButtonElement;

// Fungsi inisialisasi halaman, dipanggil sekali saat script dimuat.
async function init() {
    // requireLogin('customer') otomatis redirect ke login.html jika belum login ATAU role bukan customer.
    const status = await requireLogin('customer'); // otomatis redirect ke login.html jika bukan customer
    if (!status) return;
    welcomeText.textContent = `Halo, ${status.username}! Kamu login sebagai customer.`;
}

// Memasang listener klik pada tombol logout.
btnLogout.addEventListener('click', async () => {
    await logout();
    window.location.href = '/src/auth/login.html';
});

// Jalankan inisialisasi begitu file ini dimuat oleh browser.
init();

// Menandai file ini sebagai module ES, bukan script global.
export { };
