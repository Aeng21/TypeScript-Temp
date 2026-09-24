// Logika untuk register.html (buat akun admin atau customer). Terpisah dari player.ts.

// register: kirim data akun baru ke backend. redirectIfAlreadyLoggedIn: guard balik.
import { register, redirectIfAlreadyLoggedIn } from '../authApi.js';
// Import tipe saja (tidak ada kode yang dijalankan), untuk mengetik variabel 'role' di bawah.
import type { UserRole } from '../authApi.js';

// Mengambil elemen form dan input dari DOM.
const formRegister = document.getElementById('formRegister') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const roleSelect = document.getElementById('role') as HTMLSelectElement;

// Sama seperti login.html: kalau sudah login, tidak perlu menampilkan form buat akun lagi.
redirectIfAlreadyLoggedIn();

// p_e = PARAMETER: objek event submit dari browser saat form register dikirim.
formRegister.addEventListener('submit', async (p_e) => {
    p_e.preventDefault(); // mencegah reload halaman

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    // roleSelect.value berupa string biasa, 'as UserRole' memberi tahu TS untuk menganggapnya
    // sebagai salah satu dari 'admin' | 'customer' (aman karena opsi di HTML sudah dibatasi).
    const role = roleSelect.value as UserRole;

    // Validasi field wajib diisi.
    if (!username || !password) {
        alert('Username dan password harus diisi!');
        return;
    }
    // Validasi password (sesuai aturan yang sama di backend/authController.ts -> registerPasswordSchema):
    // minimal 8 karakter, DAN wajib mengandung minimal satu huruf serta minimal satu angka.
    // Dicek juga di sisi client (selain di backend) supaya user langsung tahu kesalahannya
    // tanpa perlu menunggu round-trip ke server — tapi ini HANYA kenyamanan tampilan;
    // validasi yang benar-benar menentukan (dan tidak bisa dilewati lewat DevTools/curl)
    // tetap ada di backend lewat zod.
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        alert('Password minimal 8 karakter dan harus mengandung huruf serta angka!');
        return;
    }

    // Kirim data ke backend lewat authApi.register().
    const success = await register(username, password, role);
    if (success) {
        // Setelah akun berhasil dibuat, arahkan user ke halaman login untuk masuk.
        window.location.href = '/src/auth/login.html';
    }
});

// Menandai file ini sebagai module ES, bukan script global.
export { };
