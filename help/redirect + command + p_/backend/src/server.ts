// ============================================================
// Server backend "redirect" — KHUSUS untuk hal-hal non-CRUD (login/register/session).
// Terpisah total dari backend CRUD (backend/src/server.ts): proses Node sendiri, port sendiri.
// ============================================================

// express: framework utama untuk membuat server HTTP. Request/Response: tipe bawaan express.
import express, { Request, Response } from 'express';
// cors: middleware untuk mengizinkan frontend (origin/port berbeda) memanggil API ini.
import cors from 'cors';
// dotenv: membaca variabel dari file .env ke process.env.
import dotenv from 'dotenv';
// express-session: middleware untuk mengelola session login berbasis cookie.
import session from 'express-session';
// express-mysql-session: penyimpan (store) data session di tabel MySQL, bukan di memori.
import MySQLStoreFactory from 'express-mysql-session';

// Pool koneksi database, dipakai ulang sebagai koneksi untuk session store di bawah.
import pool from './config/database.js';
// Kumpulan rute /api/auth/* (register, login, logout, status).
import authRoutes from './routes/authRoutes.js';

// Muat isi file .env ke process.env sebelum dipakai di bawah.
dotenv.config();

// Membuat aplikasi express.
const app = express();
// Port server ini. Beda dari backend CRUD (3000) supaya bisa jalan bersamaan. Default 3001.
const PORT = process.env.PORT || 3001;

// Origin frontend redirect (login/register/admin/customer/keranjang), BUKAN frontend CRUD.
// credentials: true WAJIB supaya cookie session (connect.sid) diizinkan ikut terkirim
// dari frontend ke backend lintas port.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:2001',
  credentials: true,
}));

// Middleware bawaan express untuk membaca body request berformat JSON.
app.use(express.json());
// Middleware bawaan express untuk membaca body request berformat form (urlencoded).
app.use(express.urlencoded({ extended: true }));

// Session store: data session disimpan di tabel MySQL `sessions` (dibuat otomatis), bukan
// di memori proses Node, supaya user tidak ke-logout tiap backend ini di-restart.
// MySQLStoreFactory(session) menghasilkan class Store yang kompatibel dengan express-session,
// lalu 'new (...)({}, pool as any)' membuat instance store yang memakai koneksi pool di atas.
const sessionStore = new (MySQLStoreFactory(session))({}, pool as any);

// Memasang middleware session ke semua request yang masuk setelah baris ini.
app.use(session({
  store: sessionStore, // simpan session ke MySQL, bukan memori
  secret: process.env.SESSION_SECRET || 'dev-secret', // kunci untuk menandatangani cookie session
  resave: false, // jangan simpan ulang session jika tidak ada perubahan
  saveUninitialized: false, // jangan buat session kosong untuk visitor yang belum login
  rolling: true, // perpanjang masa berlaku cookie setiap kali ada request baru
  cookie: {
    httpOnly: true, // cookie tidak bisa dibaca lewat JavaScript di browser (mencegah pencurian via XSS)
    secure: false, // true hanya jika server berjalan lewat HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 7, // masa berlaku cookie: 7 hari (dalam milidetik)
  },
}));

// Route GET '/' — halaman info dasar, sekadar menandakan server ini hidup.
// p_req, p_res = PARAMETER: request masuk dan response yang dikirim balik.
app.get('/', (p_req: Request, p_res: Response) => {
  p_res.json({
    message: 'Backend redirect (auth) berjalan dengan baik!',
    endpoints: {
      auth: '/api/auth',
    },
  });
});

// Semua request ke '/api/auth/*' diteruskan ke authRoutes (register/login/logout/status).
app.use('/api/auth', authRoutes);

// Middleware 404: dijalankan jika tidak ada route di atas yang cocok dengan request.
// p_req, p_res = PARAMETER: request yang tidak cocok rute mana pun, dan response yang dikirim.
app.use((p_req: Request, p_res: Response) => {
  p_res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Middleware error handler (dikenali express lewat 4 parameter). Menangkap error yang
// dilempar/di-throw di route atau middleware sebelumnya.
// p_err = PARAMETER: objek error yang terjadi.
// p_req, p_res = PARAMETER: request & response saat error terjadi.
// p_next = PARAMETER: fungsi untuk meneruskan ke middleware error berikutnya (tidak dipakai di sini).
app.use((p_err: any, p_req: Request, p_res: Response, p_next: express.NextFunction) => {
  console.error(p_err.stack); // catat detail error di terminal server untuk debugging
  p_res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server', error: p_err.message });
});

// Menjalankan server, mulai mendengarkan request masuk di PORT yang ditentukan.
app.listen(PORT, () => {
  console.log(`Backend redirect (auth) berjalan di http://localhost:${PORT}`);
});
