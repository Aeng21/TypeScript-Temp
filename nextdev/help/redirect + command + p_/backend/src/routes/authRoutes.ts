// Mengimpor Router dari express untuk membuat grup rute terpisah dari server.ts.
import { Router } from 'express';
// Mengimpor controller yang berisi logika tiap endpoint (register, login, logout, status).
import AuthController from '../controllers/authController.js';
// express-rate-limit: middleware pembatas jumlah request per alamat IP dalam rentang waktu
// tertentu. Dipakai KHUSUS untuk /login & /register (endpoint yang paling menarik untuk
// diserang lewat brute-force menebak password / spam pembuatan akun), BUKAN untuk /logout
// atau /status yang aman dipanggil berkali-kali (mis. /status dicek tiap kali halaman dibuka).
import rateLimit from 'express-rate-limit';

// Membuat instance router baru, nanti dipasang di server.ts lewat app.use('/api/auth', router).
const router = Router();

// Limiter ketat: maksimum 10 request per IP dalam jendela waktu 10 menit.
// Kenapa perlu: tanpa rate limit, penyerang bisa mencoba ribuan kombinasi password per menit
// (brute-force) lewat /login, atau membuat ribuan akun sampah lewat /register, karena tidak
// ada biaya/hambatan apa pun untuk mencoba berulang-ulang secepat mungkin.
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // jendela waktu: 10 menit (dalam milidetik)
  limit: 10, // maksimum 10 request yang diizinkan per IP dalam jendela waktu di atas
  standardHeaders: true, // kirim info batas rate lewat header standar RateLimit-*
  legacyHeaders: false, // matikan header lama X-RateLimit-* (sudah digantikan standardHeaders)
  message: { success: false, message: 'Terlalu banyak percobaan, coba lagi beberapa saat lagi' },
});

// POST /api/auth/register -> menjalankan AuthController.register (buat akun baru).
// authLimiter dipasang SEBELUM controller supaya request yang kelebihan batas langsung ditolak
// tanpa perlu menyentuh database sama sekali.
router.post('/register', authLimiter, AuthController.register);
// POST /api/auth/login -> menjalankan AuthController.login (verifikasi & buat session).
router.post('/login', authLimiter, AuthController.login);
// POST /api/auth/logout -> menjalankan AuthController.logout (hapus session & cookie).
// TIDAK diberi rate limit: logout hanya menghapus session milik user itu sendiri, tidak
// membuka celah brute-force/spam, dan wajar dipanggil kapan saja user ingin keluar.
router.post('/logout', AuthController.logout);
// GET /api/auth/status -> menjalankan AuthController.status (cek status login saat ini).
// TIDAK diberi rate limit: dipanggil otomatis tiap halaman dimuat (guard requireLogin /
// redirectIfAlreadyLoggedIn di authApi.ts) sehingga wajar terpanggil sering dalam waktu singkat.
router.get('/status', AuthController.status);

// Diekspor sebagai default supaya server.ts tinggal: import authRoutes from './routes/authRoutes.js'.
export default router;
