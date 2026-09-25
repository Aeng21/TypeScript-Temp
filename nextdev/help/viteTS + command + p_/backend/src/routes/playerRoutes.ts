// Mengimpor Router dari express: alat untuk membuat "grup rute" terpisah dari server.ts.
// File ini nanti dipasang di server.ts lewat app.use('/api/player', playerRoutes).
import { Router } from 'express';
// Mengimpor controller yang berisi LOGIKA sesungguhnya tiap endpoint (query ke database, dst).
// File ini (routes) sengaja TIDAK berisi logika apa pun — cuma memetakan "method + path" ke
// fungsi controller mana yang harus dijalankan. Memisahkan keduanya (routes vs controller)
// membuat tiap file punya satu tanggung jawab yang jelas dan lebih gampang dicari.
import PlayerController from '../controllers/playerController.js';

// Membuat instance router baru.
const router = Router();

// Path di bawah ini RELATIF terhadap '/api/player' (lihat app.use('/api/player', ...) di server.ts),
// jadi '/' di sini sebenarnya berarti '/api/player', dan '/:id' berarti '/api/player/:id'.
// ':id' adalah ROUTE PARAMETER — bagian URL yang berubah-ubah (mis. /api/player/5), nilainya
// bisa diambil lewat p_req.params.id di controller.

// GET /api/player -> ambil SEMUA data player.
router.get('/', PlayerController.getAll);
// GET /api/player/:id -> ambil SATU data player berdasarkan id di URL.
router.get('/:id', PlayerController.getById);
// POST /api/player -> membuat data player BARU. Data dikirim lewat body request (JSON).
router.post('/', PlayerController.create);
// PUT /api/player/:id -> mengubah/mengupdate data player yang SUDAH ADA (id di URL, data baru di body).
router.put('/:id', PlayerController.update);
// DELETE /api/player/:id -> menghapus data player berdasarkan id di URL.
router.delete('/:id', PlayerController.delete);

// Diekspor sebagai default supaya server.ts tinggal: import playerRoutes from './routes/playerRoutes.js'.
export default router;