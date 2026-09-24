// Logika tombol "Tambah ke Keranjang" di menuju-keranjang.html.
// SENGAJA dipisah dari player.ts (dan tidak ditulis di backend) sesuai permintaan:
// - Sudah login   -> langsung ke keranjang.html
// - Belum login   -> ke login.html dulu

// getAuthStatus: hanya mengecek status login, tidak melakukan redirect otomatis
// (beda dari requireLogin), karena di sini kita mau menentukan tujuan sendiri berdasarkan hasilnya.
import { getAuthStatus } from '../authApi.js';

// Elemen tombol "Tambah ke Keranjang" di halaman.
const btnTambahKeranjang = document.getElementById('btnTambahKeranjang') as HTMLButtonElement;

// Memasang listener klik pada tombol. Tidak menerima parameter event karena tidak dipakai.
btnTambahKeranjang.addEventListener('click', async () => {
    const status = await getAuthStatus();
    if (status.loggedIn) {
        // Sudah login: langsung menuju halaman keranjang.
        window.location.href = '/src/keranjang/keranjang.html';
    } else {
        // Belum login: arahkan dulu ke halaman login.
        window.location.href = '/src/auth/login.html';
    }
});

// Menandai file ini sebagai module ES, bukan script global.
export { };
