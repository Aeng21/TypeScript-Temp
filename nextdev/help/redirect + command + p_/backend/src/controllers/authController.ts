// Mengimpor tipe Request/Response dari express, untuk memberi tipe pada parameter handler.
import { Request, Response } from 'express';
// Mengimpor model User + tipe UserRole (union 'admin' | 'customer').
import UserModel, { UserRole } from '../models/userModel.js';
// zod: library validasi schema. Dipakai untuk memvalidasi BENTUK & ATURAN body request
// (tipe data, panjang, karakter yang diizinkan, dst) SEBELUM data itu menyentuh database.
// Kenapa penting: validasi manual dengan if-else gampang lupa mengecek satu kasus (mis. tipe
// data yang salah, karakter aneh, panjang berlebihan), sedangkan zod memaksa semua aturan
// didefinisikan eksplisit di satu tempat (schema) dan menolak apa pun yang tidak sesuai.
import { z } from 'zod';

// ------------------------------------------------------------------
// SCHEMA VALIDASI untuk body request register.
// ------------------------------------------------------------------
// username: 3-30 karakter, HANYA huruf (besar/kecil), angka, dan underscore.
// Kenapa dibatasi karakternya: mencegah username berisi karakter aneh (spasi, tanda kutip,
// simbol SQL/HTML) yang berpotensi dipakai untuk trik injeksi atau tampil rusak di UI lain.
const usernameSchema = z
  .string()
  .min(3, 'Username minimal 3 karakter')
  .max(30, 'Username maksimal 30 karakter')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore (_)');

// password (aturan register): minimal 8 karakter, WAJIB mengandung minimal satu huruf DAN
// minimal satu angka. Kenapa: password pendek/hanya angka/hanya huruf jauh lebih mudah
// ditebak lewat brute-force atau serangan kamus dibanding password yang mengombinasikan
// huruf & angka dengan panjang lebih memadai.
const registerPasswordSchema = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .regex(/[A-Za-z]/, 'Password harus mengandung minimal satu huruf')
  .regex(/[0-9]/, 'Password harus mengandung minimal satu angka');

// role: HANYA boleh salah satu dari dua nilai ini — z.enum otomatis menolak nilai lain
// (termasuk string kosong, angka, atau role hasil rekayasa seperti 'superadmin').
const roleSchema = z.enum(['admin', 'customer']);

// Schema lengkap body register: gabungan tiga aturan di atas.
const registerSchema = z.object({
  username: usernameSchema,
  password: registerPasswordSchema,
  role: roleSchema,
});

// ------------------------------------------------------------------
// SCHEMA VALIDASI untuk body request login.
// ------------------------------------------------------------------
// Login SENGAJA tidak diberi aturan format/panjang seperti register (tidak dicek regex/minimal
// karakter) — tujuannya cuma memastikan kedua field ADA dan berupa string tidak kosong.
// Alasan: aturan format password (mis. minimal 8 karakter + huruf & angka) bisa berubah di masa
// depan, tapi akun lama yang dibuat dengan aturan lama tetap harus bisa login memakai password
// lamanya. Validasi format yang ketat semestinya hanya berlaku saat password itu DIBUAT (register),
// bukan saat dicocokkan kembali (login).
const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
});

// Helper kecil: mengubah error zod (bisa berisi banyak isu sekaligus) menjadi satu pesan
// string yang gampang dibaca manusia, supaya response 400 tetap konsisten dengan format
// { success: false, message } yang sudah dipakai di seluruh controller ini.
// p_error = PARAMETER: objek ZodError hasil dari schema.safeParse(...).error.
function formatZodError(p_error: z.ZodError): string {
  // .issues = daftar semua pelanggaran validasi. Gabungkan pesan tiap issue dengan '; '
  // supaya kalau ada lebih dari satu masalah sekaligus, semuanya tetap terlihat oleh user.
  return p_error.issues.map((issue) => issue.message).join('; ');
}

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
      // Validasi bentuk & aturan body request dengan zod SEBELUM data apa pun disentuh atau
      // dikirim ke database. safeParse (bukan parse) dipakai supaya kegagalan validasi
      // dikembalikan sebagai objek biasa ({ success:false, error }), bukan melempar exception
      // yang harus ditangkap terpisah — lebih mudah dikontrol alurnya di sini.
      const parsed = registerSchema.safeParse(p_req.body);
      if (!parsed.success) {
        // 400 Bad Request: body yang dikirim client tidak memenuhi aturan (panjang/format/role).
        p_res.status(400).json({ success: false, message: formatZodError(parsed.error) });
        return; // hentikan fungsi di sini, jangan lanjut ke bawah
      }
      // Setelah lolos validasi, TypeScript juga sudah tahu bentuk & tipe persisnya lewat
      // parsed.data (username: string, password: string, role: 'admin' | 'customer') — tidak
      // perlu lagi 'as' manual seperti sebelumnya.
      const { username, password, role } = parsed.data;

      // Cek ke database: apakah username ini sudah dipakai akun lain?
      const existing = await UserModel.findByUsername(username);
      if (existing) {
        // 409 Conflict: request valid tapi bertentangan dengan data yang sudah ada.
        p_res.status(409).json({ success: false, message: 'Username sudah dipakai' });
        return;
      }

      // Simpan akun baru ke database (password di-hash di dalam UserModel.create).
      const id = await UserModel.create(username, password, role as UserRole);

      // 201 Created: menandakan resource baru berhasil dibuat.
      p_res.status(201).json({
        success: true,
        message: 'Akun berhasil dibuat, silakan login',
        data: { id, username, role }, // tidak pernah mengirim balik password, walau sudah di-hash
      });
    } catch (error: unknown) {
      // Tangkap error tak terduga (mis. database mati) dan balas dengan 500 Internal Server Error.
      // 'unknown' (bukan 'any') memaksa kita mengecek tipe error sebelum memakainya di bawah.
      console.error('Register error:', error); // log lengkap di server untuk debugging
      const message = error instanceof Error ? error.message : 'Unknown error';
      p_res.status(500).json({
        success: false,
        message: 'Gagal membuat akun',
        // Pesan error detail HANYA dikirim ke client saat bukan production, supaya detail
        // internal (mis. pesan error MySQL yang menyebut nama tabel/kolom) tidak bocor ke luar.
        ...(process.env.NODE_ENV !== 'production' ? { error: message } : {}),
      });
    }
  }

  // Login: verifikasi password dengan bcrypt, lalu simpan status login di session (cookie),
  // BUKAN dengan JWT. Cukup karena aplikasi ini disajikan sebagai halaman web biasa
  // (bukan API publik lintas domain untuk client lain), jadi session+cookie httpOnly lebih
  // sederhana dan lebih aman (token tidak bisa dibaca/dicuri lewat JavaScript di sisi client).
  // p_req, p_res = PARAMETER: request masuk dan response yang akan dikirim.
  static async login(p_req: Request, p_res: Response): Promise<void> {
    try {
      // Validasi body request dengan zod (hanya cek field ada & bukan string kosong — lihat
      // komentar di deklarasi loginSchema untuk alasan kenapa login tidak divalidasi format
      // ketat seperti register).
      const parsed = loginSchema.safeParse(p_req.body);
      if (!parsed.success) {
        p_res.status(400).json({ success: false, message: formatZodError(parsed.error) });
        return;
      }
      const { username, password } = parsed.data;

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
    } catch (error: unknown) {
      console.error('Login error:', error); // log lengkap di server untuk debugging
      const message = error instanceof Error ? error.message : 'Unknown error';
      p_res.status(500).json({
        success: false,
        message: 'Gagal login',
        ...(process.env.NODE_ENV !== 'production' ? { error: message } : {}),
      });
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
