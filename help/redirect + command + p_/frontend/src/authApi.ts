// ==========================================
// Helper pemanggilan API auth (/api/auth/*).
// Dipakai bersama oleh login.ts, register.ts, admin.ts, customer.ts, menuju-keranjang.ts,
// dan keranjang.ts — supaya logika fetch tidak diulang di tiap file.
// File ini TIDAK dipakai oleh player.ts (player.ts tetap berdiri sendiri, tidak diubah).
// ==========================================

// Backend "redirect" (auth) — proses & port terpisah dari backend CRUD (localhost:3000).
const AUTH_API_URL = 'http://localhost:3001/api/auth';

// Tipe union: role hanya boleh 'admin' atau 'customer'.
export type UserRole = 'admin' | 'customer';

// Bentuk data status login yang dikembalikan backend lewat GET /api/auth/status.
export interface AuthStatus {
    loggedIn: boolean;
    username?: string;
    role?: UserRole;
    redirectTo?: string; // path dashboard sesuai role, dikirim backend kalau loggedIn true
}

// Bentuk data yang dikembalikan backend setelah login berhasil.
export interface LoginResult {
    username: string;
    role: UserRole;
    redirectTo: string; // path tujuan redirect, ditentukan oleh backend berdasarkan role
}

// Semua fetch ke /api/auth WAJIB pakai credentials:'include' supaya cookie session
// (connect.sid) ikut terkirim/tersimpan. Tanpa ini, backend tidak akan tahu siapa yang login.
// p_path = PARAMETER: bagian akhir URL, mis. '/login', '/status'.
// p_options = PARAMETER: opsi fetch tambahan (method, body, dst), default objek kosong.
async function authFetch(p_path: string, p_options: RequestInit = {}): Promise<any> {
    const res = await fetch(`${AUTH_API_URL}${p_path}`, {
        ...p_options, // sebar semua opsi yang dikirim pemanggil (method, body, dll.)
        credentials: 'include', // wajib: ikut kirim/terima cookie session lintas port
        headers: { 'Content-Type': 'application/json', ...(p_options.headers || {}) },
    });
    // Selalu kembalikan hasil parse JSON, terlepas dari sukses/gagalnya request.
    return res.json();
}

// Menanyakan ke backend: user sedang login atau tidak, dan role-nya apa.
// Tidak menerima parameter karena tidak butuh data tambahan dari pemanggil.
export async function getAuthStatus(): Promise<AuthStatus> {
    try {
        const result = await authFetch('/status');
        // Jika backend bilang sukses, kembalikan data status login apa adanya.
        if (result.success) return result.data as AuthStatus;
        // Kalau gagal (jarang terjadi untuk endpoint ini), anggap saja belum login.
        return { loggedIn: false };
    } catch (error) {
        // Kalau fetch gagal total (mis. server mati), log error dan anggap belum login juga.
        console.error('Gagal mengecek status login:', error);
        return { loggedIn: false };
    }
}

// Login. Mengembalikan data (termasuk redirectTo) jika sukses, atau null jika gagal (pesan error di-alert di sini).
// p_username, p_password = PARAMETER: kredensial yang diketik user di form login.
export async function login(p_username: string, p_password: string): Promise<LoginResult | null> {
    try {
        const result = await authFetch('/login', {
            method: 'POST',
            // Body dikirim sebagai JSON string. Key 'username'/'password' harus sesuai
            // yang diharapkan backend, nilainya diambil dari parameter p_username/p_password.
            body: JSON.stringify({ username: p_username, password: p_password }),
        });
        if (result.success) return result.data as LoginResult;
        alert('Login gagal: ' + result.message);
        return null;
    } catch (error) {
        console.error('Error login:', error);
        alert('Terjadi kesalahan saat login.');
        return null;
    }
}

// Registrasi akun baru (admin atau customer).
// p_username, p_password, p_role = PARAMETER: data akun baru dari form register.
export async function register(p_username: string, p_password: string, p_role: UserRole): Promise<boolean> {
    try {
        const result = await authFetch('/register', {
            method: 'POST',
            body: JSON.stringify({ username: p_username, password: p_password, role: p_role }),
        });
        if (result.success) {
            alert('Akun berhasil dibuat, silakan login.');
            return true;
        }
        alert('Gagal membuat akun: ' + result.message);
        return false;
    } catch (error) {
        console.error('Error register:', error);
        alert('Terjadi kesalahan saat membuat akun.');
        return false;
    }
}

// Logout: hapus session di server + cookie di browser. Tidak butuh parameter.
export async function logout(): Promise<void> {
    try {
        await authFetch('/logout', { method: 'POST' });
    } catch (error) {
        console.error('Error logout:', error);
    }
}

// Guard untuk halaman yang butuh login (admin.html, customer.html, keranjang.html).
// Jika belum login (atau role tidak cocok), langsung lempar ke login.html dan kembalikan null.
// Dipakai di awal tiap halaman yang butuh proteksi, supaya tidak ada halaman yang bisa
// diakses langsung tanpa login lewat URL.
// p_requiredRole = PARAMETER opsional: role yang disyaratkan untuk halaman ini (mis. 'admin').
export async function requireLogin(p_requiredRole?: UserRole): Promise<AuthStatus | null> {
    const status = await getAuthStatus();
    // Tolak jika belum login SAMA SEKALI, atau sudah login tapi role-nya tidak sesuai yang disyaratkan.
    if (!status.loggedIn || (p_requiredRole && status.role !== p_requiredRole)) {
        // Path absolut (bukan relatif) karena fungsi ini dipanggil dari halaman-halaman
        // di folder berbeda (src/auth/, src/keranjang/) — relatif akan salah folder.
        window.location.href = '/src/auth/login.html';
        return null;
    }
    return status;
}

// Kebalikan dari requireLogin: dipakai di login.html & register.html. Kalau user TERNYATA
// sudah login, tidak masuk akal menampilkan form login/register lagi — langsung lempar ke
// dashboard-nya (yang sudah ada info "login sebagai ..." + tombol logout).
// Mengembalikan true jika sudah login (dan sudah di-redirect), false jika belum (boleh lanjut render form).
// Tidak butuh parameter karena hanya mengecek status login saat ini.
export async function redirectIfAlreadyLoggedIn(): Promise<boolean> {
    const status = await getAuthStatus();
    if (status.loggedIn && status.redirectTo) {
        window.location.href = status.redirectTo;
        return true;
    }
    return false;
}
