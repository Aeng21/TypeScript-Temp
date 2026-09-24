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
// helmet: menambahkan sekumpulan HTTP response header pengaman (mis. X-Content-Type-Options,
// X-Frame-Options, Content-Security-Policy dasar) yang mempersulit serangan umum seperti
// clickjacking, MIME-sniffing, dan sebagian XSS. Tanpa ini, header keamanan bawaan express
// sangat minim (express secara default malah mengirim header 'X-Powered-By: Express').
import helmet from 'helmet';

// Kumpulan rute /api/auth/* (register, login, logout, status).
import authRoutes from './routes/authRoutes.js';

// Muat isi file .env ke process.env sebelum dipakai di bawah.
dotenv.config();

// ------------------------------------------------------------------
// VALIDASI ENV WAJIB SAAT STARTUP.
// Kenapa: sebelumnya SESSION_SECRET punya fallback 'dev-secret' yang diam-diam dipakai
// kalau .env lupa diisi — bahaya, karena semua cookie session jadi bisa dipalsukan/ditebak
// memakai secret publik yang sama di semua instalasi. Daripada silently insecure, kita
// GAGALKAN startup server (fail-fast) dengan pesan jelas kalau env penting belum diisi,
// supaya kesalahan konfigurasi ketahuan sejak awal, bukan nanti saat sudah di production.
// ------------------------------------------------------------------
const requiredEnvVars = ['SESSION_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'] as const;
// Cari env var wajib yang belum diisi (undefined atau string kosong).
const missingEnvVars = requiredEnvVars.filter((p_key) => !process.env[p_key]);
if (missingEnvVars.length > 0) {
  console.error(
    `[FATAL] Environment variable wajib belum diisi: ${missingEnvVars.join(', ')}. ` +
    'Isi nilai-nilai tersebut di file backend/.env sebelum menjalankan server.',
  );
  // Hentikan proses Node dengan exit code 1 (menandakan gagal) — jangan lanjut menyalakan
  // server dengan konfigurasi yang tidak lengkap/tidak aman.
  process.exit(1);
}

// Membuat aplikasi express.
const app = express();
// Port server ini. Beda dari backend CRUD (3000) supaya bisa jalan bersamaan. Default 3001.
const PORT = process.env.PORT || 3001;

// helmet() memasang banyak middleware header keamanan sekaligus (Helmet's "default" bundle):
// mis. menghapus header 'X-Powered-By', set 'X-Content-Type-Options: nosniff' (cegah browser
// menebak-nebak tipe file lalu mengeksekusinya sebagai script), 'X-Frame-Options'/frame-ancestors
// (cegah halaman ini ditaruh di <iframe> situs lain untuk clickjacking), dsb. Dipasang PALING AWAL
// di stack middleware supaya berlaku untuk semua response, termasuk error/404.
app.use(helmet());

// Origin frontend redirect (login/register/admin/customer/keranjang), BUKAN frontend CRUD.
// credentials: true WAJIB supaya cookie session (connect.sid) diizinkan ikut terkirim
// dari frontend ke backend lintas port.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:2001',
  credentials: true,
}));

// Middleware bawaan express untuk membaca body request berformat JSON.
// limit: '10kb' — membatasi ukuran maksimum body JSON yang diterima. Tanpa batas ini,
// klien (atau penyerang) bisa mengirim body raksasa (mis. ratusan MB) untuk menghabiskan
// memori/CPU server (denial-of-service sederhana). Form login/register jelas tidak pernah
// butuh body sebesar itu, jadi 10kb sudah lebih dari cukup untuk pemakaian normal.
app.use(express.json({ limit: '10kb' }));
// Middleware bawaan express untuk membaca body request berformat form (urlencoded).
// limit: '10kb' — alasan sama seperti express.json() di atas.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Session store: data session disimpan di tabel MySQL `sessions` (dibuat otomatis), bukan
// di memori proses Node, supaya user tidak ke-logout tiap backend ini di-restart.
// MySQLStoreFactory(session) menghasilkan class Store yang kompatibel dengan express-session.
// Sebelumnya di sini dipakai 'new (...)({}, pool as any)' — pool dari mysql2/promise dioper
// sebagai koneksi kedua, tapi tipe Pool milik mysql2/promise TIDAK cocok secara struktural
// dengan tipe Pool callback-style yang diharapkan @types/express-mysql-session, sehingga
// terpaksa dipaksa lewat 'as any' (menyembunyikan potensi ketidakcocokan dari TypeScript).
// Perbaikan: beri store OPSI KONEKSINYA SENDIRI (host/user/password/database dari .env).
// express-mysql-session lalu membuat pool mysql2 (callback-style) miliknya sendiri secara
// internal, sesuai tipe yang memang diharapkan — tidak perlu 'as any' sama sekali, dan
// store ini independen dari pool Promise-style yang dipakai userModel.ts untuk query biasa.
const sessionStore = new (MySQLStoreFactory(session))({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Memasang middleware session ke semua request yang masuk setelah baris ini.
app.use(session({
  store: sessionStore, // simpan session ke MySQL, bukan memori
  // SESSION_SECRET WAJIB diisi di .env (sudah divalidasi di atas, exit(1) kalau kosong).
  // TIDAK ADA fallback string default lagi ('dev-secret' sebelumnya) — fallback semacam itu
  // berbahaya karena kalau lupa diisi, server tetap jalan diam-diam dengan secret yang bisa
  // ditebak siapa saja yang baca source code ini, sehingga cookie session bisa dipalsukan.
  secret: process.env.SESSION_SECRET as string,
  resave: false, // jangan simpan ulang session jika tidak ada perubahan
  saveUninitialized: false, // jangan buat session kosong untuk visitor yang belum login
  rolling: true, // perpanjang masa berlaku cookie setiap kali ada request baru
  cookie: {
    httpOnly: true, // cookie tidak bisa dibaca lewat JavaScript di browser (mencegah pencurian via XSS)
    // secure: true HANYA saat production (server diasumsikan berjalan di belakang HTTPS).
    // Di development (NODE_ENV bukan 'production'), tetap false supaya cookie tetap terkirim
    // walau diakses lewat http://localhost biasa (tanpa TLS) saat development lokal.
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'lax' — cookie session tidak ikut terkirim pada request cross-site pihak ketiga
    // (mis. form/link dari situs lain), mengurangi risiko CSRF, tapi tetap terkirim untuk
    // navigasi biasa (klik link) dan request same-site yang dipakai frontend ini.
    sameSite: 'lax',
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
// p_err = PARAMETER: objek error yang terjadi. Tipenya 'unknown' (bukan 'any') karena JavaScript
// mengizinkan 'throw' melempar nilai apa saja (string, object biasa, dsb), bukan cuma instance
// Error — jadi kita tidak boleh asal asumsikan bentuknya sebelum dicek dengan 'instanceof'.
// p_req, p_res = PARAMETER: request & response saat error terjadi.
// p_next = PARAMETER: fungsi untuk meneruskan ke middleware error berikutnya (tidak dipakai di sini).
app.use((p_err: unknown, p_req: Request, p_res: Response, p_next: express.NextFunction) => {
  // Selalu catat error LENGKAP (termasuk stack trace) di log server untuk keperluan debugging —
  // ini aman karena log server hanya bisa dilihat developer/operator, bukan client dari luar.
  console.error(p_err);

  // Ambil pesan error dengan aman: kalau memang instance Error pakai message-nya, kalau bukan
  // (mis. seseorang 'throw' string biasa) pakai representasi string generik.
  const message = p_err instanceof Error ? p_err.message : String(p_err);

  // KENAPA pesan error asli TIDAK selalu dikirim ke client: pesan/stack error internal bisa
  // membocorkan detail implementasi (nama tabel database, path file di server, versi library,
  // dsb) yang bisa dimanfaatkan penyerang untuk merancang serangan lanjutan. Jadi pesan detail
  // hanya disertakan saat NODE_ENV bukan 'production' (mis. saat development di komputer sendiri);
  // di production, client hanya menerima pesan generik yang aman.
  p_res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV !== 'production' ? { error: message } : {}),
  });
});

// Menjalankan server, mulai mendengarkan request masuk di PORT yang ditentukan.
app.listen(PORT, () => {
  console.log(`Backend redirect (auth) berjalan di http://localhost:${PORT}`);
});
