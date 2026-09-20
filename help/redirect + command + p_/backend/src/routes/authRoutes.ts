// Mengimpor Router dari express untuk membuat grup rute terpisah dari server.ts.
import { Router } from 'express';
// Mengimpor controller yang berisi logika tiap endpoint (register, login, logout, status).
import AuthController from '../controllers/authController.js';

// Membuat instance router baru, nanti dipasang di server.ts lewat app.use('/api/auth', router).
const router = Router();

// POST /api/auth/register -> menjalankan AuthController.register (buat akun baru).
router.post('/register', AuthController.register);
// POST /api/auth/login -> menjalankan AuthController.login (verifikasi & buat session).
router.post('/login', AuthController.login);
// POST /api/auth/logout -> menjalankan AuthController.logout (hapus session & cookie).
router.post('/logout', AuthController.logout);
// GET /api/auth/status -> menjalankan AuthController.status (cek status login saat ini).
router.get('/status', AuthController.status);

// Diekspor sebagai default supaya server.ts tinggal: import authRoutes from './routes/authRoutes.js'.
export default router;
