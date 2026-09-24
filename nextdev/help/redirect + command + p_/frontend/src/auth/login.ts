// Logika untuk login.html — redirect tujuan (admin/customer) ditentukan backend lewat authApi.login().

// Mengimpor fungsi login (kirim kredensial ke backend) dan redirectIfAlreadyLoggedIn (guard balik).
import { login, redirectIfAlreadyLoggedIn } from '../authApi.js';

// Mengambil elemen form dan input dari DOM. 'as ...' memberi tahu TS tipe elemen HTML-nya.
const formLogin = document.getElementById('formLogin') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

// Kalau ternyata sudah login (mis. buka lagi login.html padahal sesi masih aktif),
// langsung lempar ke dashboard-nya, jangan tampilkan form login lagi.
redirectIfAlreadyLoggedIn();

// Memasang listener submit pada form. p_e = PARAMETER: objek event submit dari browser.
formLogin.addEventListener('submit', async (p_e) => {
    p_e.preventDefault(); // mencegah browser reload halaman (perilaku default submit form)

    // Ambil nilai input. trim() membuang spasi kosong di awal/akhir.
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Validasi sederhana di sisi client sebelum request dikirim ke server.
    if (!username || !password) {
        alert('Username dan password harus diisi!');
        return;
    }

    // Panggil fungsi login dari authApi.ts, kirim username & password.
    const result = await login(username, password);
    if (result) {
        // redirectTo datang dari backend (mis. '/src/auth/admin.html' atau '/src/auth/customer.html'),
        // frontend tinggal mengikuti, tidak menentukan sendiri tujuannya.
        window.location.href = result.redirectTo;
    }
});

// Menandai file ini sebagai module ES (bukan script global), supaya TypeScript tidak
// menganggap variabel-variabel di atas bentrok dengan file lain yang dimuat di halaman sama.
export { };
