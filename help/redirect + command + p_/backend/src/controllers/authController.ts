// Mengimpor tipe Request/Response dari express, untuk memberi tipe pada parameter handler.
import { Request, Response } from 'express';
// Mengimpor model User + tipe UserRole (union 'admin' | 'customer').
import UserModel, { UserRole } from '../models/userModel.js';

// Halaman tujuan redirect setelah login, ditentukan berdasarkan role.
// Ini SENGAJA ditaruh di backend (bukan di frontend) sesuai permintaan:
// frontend tinggal mengikuti nilai `redirectTo` yang dikirim balik, tanpa perlu tahu aturannya.
// p_role = PARAMETER: role user yang sudah login ('admin' atau 'customer').
function getRedirectByRole(p_role: UserRole): string {
  // Jika role admin, tujuan redirect adalah halaman admin.
  if (p_role === 'admin') return '/src/auth/admin.html';
  // Selain admin (berarti customer), tujuan redirect adalah halaman customer.
  return '/src/auth/customer.html';
}

class AuthController {
  // Mendaftarkan akun baru (admin atau customer).
  // p_req, p_res = PARAMETER: objek request masuk dan objek response yang dikirim balik ke client.
  static async register(p_req: Request, p_res: Response): Promise<void> {
    try {
      // Ambil username, password, role dari body request (dikirim frontend lewat form register).
      // Destructuring: mengambil 3 properti sekaligus dari p_req.body.
      const { username, password, role } = p_req.body as { username: string; password: string; role: string };

      // Validasi: pastikan ketiga field terisi. Jika salah satu kosong, tolak dengan 400 Bad Request.
      if (!username || !password || !role) {
        p_res.status(400).json({ success: false, message: 'Username, password, dan role harus diisi' });
        return; // hentikan fungsi di sini, jangan lanjut ke bawah
      }

      // Validasi: role yang dikirim harus salah satu dari dua nilai yang diizinkan.
      if (role !== 'admin' && role !== 'customer') {
        p_res.status(400).json({ success: false, message: 'Role harus admin atau customer' });
        return;
      }

      // Validasi: panjang password minimal 6 karakter (aturan keamanan sederhana).
      if (password.length < 6) {
        p_res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
        return;
      }

      // Cek ke database: apakah username ini sudah dipakai akun lain?
      const existing = await UserModel.findByUsername(username);
      if (existing) {
        // 409 Conflict: request valid tapi bertentangan dengan data yang sudah ada.
        p_res.status(409).json({ success: false, message: 'Username sudah dipakai' });
        return;
      }

      // Simpan akun baru ke database (password di-hash di dalam UserModel.create).
      // 'role as UserRole' = memberi tahu TS untuk menganggap string role sebagai tipe UserRole
      // (aman dilakukan karena sudah divalidasi di atas).
      const id = await UserModel.create(username, password, role as UserRole);

      // 201 Created: menandakan resource baru berhasil dibuat.
      p_res.status(201).json({
        success: true,
        message: 'Akun berhasil dibuat, silakan login',
        data: { id, username, role }, // tidak pernah mengirim balik password, walau sudah di-hash
      });
    } catch (error: any) {
      // Tangkap error tak terduga (mis. database mati) dan balas dengan 500 Internal Server Error.
      p_res.status(500).json({ success: false, message: 'Gagal membuat akun', error: error.message });
    }
  }

  // Login: verifikasi password dengan bcrypt, lalu simpan status login di session (cookie),
  // BUKAN dengan JWT. Cukup karena aplikasi ini disajikan sebagai halaman web biasa
  // (bukan API publik lintas domain untuk client lain), jadi session+cookie httpOnly lebih
  // sederhana dan lebih aman (token tidak bisa dibaca/dicuri lewat JavaScript di sisi client).
  // p_req, p_res = PARAMETER: request masuk dan response yang akan dikirim.
  static async login(p_req: Request, p_res: Response): Promise<void> {
    try {
      // Ambil username & password yang dikirim dari form login.
      const { username, password } = p_req.body as { username: string; password: string };

      // Validasi sederhana: kedua field wajib diisi.
      if (!username || !password) {
        p_res.status(400).json({ success: false, message: 'Username dan password harus diisi' });
        return;
      }

      // Cari akun dengan username tersebut di database.
      const user = await UserModel.findByUsername(username);
      if (!user) {
        // Sengaja pakai pesan generik ("Username atau password salah"), bukan "username tidak ada",
        // supaya orang jahat tidak bisa menebak-nebak username mana saja yang terdaftar.
        p_res.status(401).json({ success: false, message: 'Username atau password salah' });
        return;
      }

      // Bandingkan password yang diketik user dengan hash yang tersimpan di database.
      const valid = await UserModel.verifyPassword(password, user.password);
      if (!valid) {
        p_res.status(401).json({ success: false, message: 'Username atau password salah' });
        return;
      }

      // Simpan identitas user di session milik server (cookie hanya berisi ID session, bukan data).
      // p_req.session disediakan oleh middleware express-session yang dipasang di server.ts.
      p_req.session.userId = user.id;
      p_req.session.username = user.username;
      p_req.session.role = user.role;

      // Login berhasil: kirim balik data user + redirectTo (tujuan halaman sesuai role).
      p_res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          username: user.username,
          role: user.role,
          redirectTo: getRedirectByRole(user.role), // <- logika tujuan redirect ditentukan di sini (backend)
        },
      });
    } catch (error: any) {
      p_res.status(500).json({ success: false, message: 'Gagal login', error: error.message });
    }
  }

  // Logout: hapus session di server + cookie di browser.
  // p_req, p_res = PARAMETER: request masuk dan response yang akan dikirim.
  static async logout(p_req: Request, p_res: Response): Promise<void> {
    // session.destroy() menghapus data session ini dari MySQL session store.
    // Dijalankan lewat callback (err) karena ini operasi async model lama (bukan Promise).
    p_req.session.destroy((err) => {
      if (err) {
        p_res.status(500).json({ success: false, message: 'Gagal logout' });
        return;
      }
      // Hapus juga cookie 'connect.sid' di browser client supaya benar-benar bersih.
      p_res.clearCookie('connect.sid');
      p_res.status(200).json({ success: true, message: 'Logout berhasil' });
    });
  }

  // Dipakai frontend untuk mengecek: user sedang login atau tidak, dan role-nya apa.
  // Frontend TIDAK menyimpan status login sendiri (misal di localStorage) — selalu tanya ke sini,
  // supaya satu-satunya sumber kebenaran status login tetap di server.
  // p_req, p_res = PARAMETER: request masuk dan response yang akan dikirim.
  static async status(p_req: Request, p_res: Response): Promise<void> {
    // Jika session tidak punya userId, berarti belum login.
    if (!p_req.session.userId) {
      p_res.status(200).json({ success: true, data: { loggedIn: false } });
      return;
    }

    // Sudah login: kirim balik username, role, dan tujuan redirect sesuai role.
    p_res.status(200).json({
      success: true,
      data: {
        loggedIn: true,
        username: p_req.session.username,
        role: p_req.session.role,
        // Dikirim juga di sini (bukan cuma saat login) supaya login.html/register.html bisa
        // langsung melempar user yang sudah login ke dashboard-nya, tanpa frontend perlu
        // menghitung sendiri role -> halaman tujuan.
        redirectTo: getRedirectByRole(p_req.session.role as UserRole),
      },
    });
  }
}

// Diekspor sebagai default supaya routes tinggal: import AuthController from '../controllers/authController.js'.
export default AuthController;
