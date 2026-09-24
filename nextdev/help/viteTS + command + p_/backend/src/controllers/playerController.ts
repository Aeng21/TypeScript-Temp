import { Request, Response } from 'express';
import { z } from 'zod';
import PlayerModel, { Player } from '../models/playerModel.js';

// ============================================================
// SKEMA VALIDASI INPUT (pakai library Zod)
// ============================================================
// Kenapa validasi lama "if (!nama || !alamat || !rank)" tidak cukup:
// - Tidak mengecek TIPE data. p_req.body bisa saja berisi nama: 123 (angka)
//   atau nama: { a: 1 } (objek) kalau client mengirim JSON aneh-aneh, dan
//   itu akan lolos ke query SQL apa adanya.
// - Tidak mengecek PANJANG maksimal. Kolom di database adalah VARCHAR(100)
//   (lihat database.sql). Kalau string yang dikirim lebih panjang dari itu,
//   query bisa gagal dengan error dari MySQL, atau (tergantung mode SQL)
//   datanya bisa terpotong diam-diam tanpa pemberitahuan ke user.
// - String yang isinya HANYA spasi (misal "   ") dianggap truthy oleh
//   JavaScript, jadi lolos dari pengecekan !nama padahal secara makna kosong.
// Zod memvalidasi semuanya sekaligus dan menghasilkan pesan error yang jelas.
const playerInputSchema = z.object({
  // .trim() menghapus spasi di awal/akhir SEBELUM .min()/.max() menghitung
  // panjangnya, jadi "   " (cuma spasi) akan dianggap kosong (gagal .min(1)).
  nama: z.string().trim().min(1, 'nama tidak boleh kosong').max(100, 'nama maksimal 100 karakter'),
  alamat: z.string().trim().min(1, 'alamat tidak boleh kosong').max(100, 'alamat maksimal 100 karakter'),
  rank: z.string().trim().min(1, 'rank tidak boleh kosong').max(100, 'rank maksimal 100 karakter'),
});

// Helper kecil untuk memakai skema di atas dari dalam controller.
// p_body bertipe 'unknown' (bukan 'any') karena body request pada dasarnya
// tidak bisa dipercaya bentuknya sebelum divalidasi.
// Mengembalikan salah satu dari dua bentuk: berhasil (berisi data yang sudah
// bersih/trim) atau gagal (berisi pesan error yang siap ditampilkan ke user).
function validatePlayerInput(
  p_body: unknown
): { success: true; data: Omit<Player, 'id'> } | { success: false; message: string } {
  const hasil = playerInputSchema.safeParse(p_body);
  if (!hasil.success) {
    // Gabungkan semua pesan error field jadi satu kalimat, dipisah koma,
    // supaya user tahu persis field mana yang salah dan kenapa.
    const message = hasil.error.issues.map((p_issue) => p_issue.message).join(', ');
    return { success: false, message };
  }
  return { success: true, data: hasil.data };
}

// ============================================================
// HELPER: VALIDASI ID DARI URL PARAMETER (/api/player/:id)
// ============================================================
// Kenapa perlu ini: parseInt("abc") menghasilkan NaN, dan parseInt("12abc")
// menghasilkan 12 (parseInt berhenti di karakter non-digit pertama, tidak
// menganggapnya error). Kalau id yang "salah" ini tetap diteruskan ke
// PlayerModel, query SQL WHERE id = ? akan tetap dijalankan dengan nilai
// yang tidak masuk akal (NaN, atau angka yang sebenarnya tidak dimaksud user).
// Helper ini memastikan parameter id BENAR-BENAR string angka bulat positif
// SEBELUM dipakai untuk query apa pun.
function parseValidId(p_param: string | string[] | undefined): number | null {
  // Parameter tidak ada sama sekali (seharusnya jarang terjadi karena route
  // sudah mendefinisikan :id, tapi tetap dijaga untuk keamanan tipe).
  // Tipe p_param bisa juga 'string[]' menurut definisi tipe Express terbaru
  // (untuk route dengan pola array seperti '/:id+'), tapi route kita
  // ('/:id' biasa) tidak pernah benar-benar mengirim array. Kita tolak saja
  // kalau ternyata array, supaya TypeScript senang dan perilakunya tetap aman.
  if (!p_param || Array.isArray(p_param)) return null;
  // Regex ^\d+$ memastikan string HANYA terdiri dari digit 0-9, dari awal
  // sampai akhir. Ini menolak "12abc", "-5", "1.5", "" (kosong), dsb.
  if (!/^\d+$/.test(p_param)) return null;
  const id = parseInt(p_param, 10);
  // Id di database bertipe AUTO_INCREMENT yang mulai dari 1, jadi 0 atau
  // negatif tidak mungkin valid (regex di atas sebenarnya sudah menolak minus,
  // tapi tetap dicek eksplisit untuk jaga-jaga/kejelasan).
  if (id <= 0) return null;
  return id;
}

class PlayerController {
  static async getAll(p_req: Request, p_res: Response): Promise<void> {
    // try(mencoba): coba jalankan kode ini
    try {
      const player = await PlayerModel.getAll();

      // Mengirim response dengan status 200 (OK) dan data dalam format JSON.
      // .json() mengirim response berupa JSON dengan properti success dan data.
      p_res.status(200).json({
        success: true,   // Menandakan operasi berhasil.
        data: player,    // Data yang diminta.
      });
      // catch(menangkap): kalau kode di atas gagal, jalankan bagian ini
      // error: unknown karena TypeScript modern tidak lagi otomatis mengetik
      // error di catch sebagai 'any'. Kita HARUS narrowing (mempersempit tipe)
      // dulu pakai 'instanceof Error' sebelum mengakses .message, kalau tidak
      // TypeScript akan menolak compile (error.message tidak ada di 'unknown').
    } catch (error: unknown) {
      // console.error mencatat detail LENGKAP error di log server (untuk
      // developer/debugging), TIDAK pernah dikirim mentah-mentah ke client.
      console.error('Gagal mengambil data player:', error);
      p_res.status(500).json({
        success: false,
        message: 'Gagal mengambil data player',
        // Pesan error asli HANYA disertakan ke response saat NODE_ENV bukan
        // 'production'. Ini mencegah kebocoran detail internal (misal nama
        // kolom database, struktur query, dsb.) ke publik saat aplikasi
        // benar-benar live/production. Spread object kosong ({}) kalau
        // production, jadi properti 'error' otomatis tidak ada di response.
        ...(process.env.NODE_ENV !== 'production' && {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  }

  static async getById(p_req: Request, p_res: Response): Promise<void> {
    try {
      // Mengambil parameter ID dari URL (misal /api/player/5) lalu memvalidasinya
      // lewat helper parseValidId (lihat komentar di atas class). Kalau tidak
      // valid (bukan angka bulat positif), balas 400 SEBELUM menyentuh database
      // sama sekali — mencegah query dengan id = NaN atau id yang tidak masuk akal.
      const id = parseValidId(p_req.params.id);
      if (id === null) {
        p_res.status(400).json({
          success: false,
          message: 'ID tidak valid',
        });
        return;
      }
      // Memanggil model untuk mencari player dengan ID tersebut.
      const player = await PlayerModel.getById(id);

      // Jika player tidak ditemukan (undefined), kirim response 404 Not Found.
      // return digunakan untuk menghentikan eksekusi fungsi setelah mengirim response.
      if (!player) {
        p_res.status(404).json({
          success: false,
          message: 'Player tidak ditemukan',
        });
        return;
      }

      // Jika ditemukan, kirim data dengan status 200.
      p_res.status(200).json({
        success: true,
        data: player,
      });
    } catch (error: unknown) {
      console.error('Gagal mengambil data player:', error);
      p_res.status(500).json({
        success: false,
        message: 'Gagal mengambil data player',
        ...(process.env.NODE_ENV !== 'production' && {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  }

  static async create(p_req: Request, p_res: Response): Promise<void> {
    try {
      // Validasi body request memakai skema Zod (playerInputSchema di atas).
      // Ini menggantikan validasi manual "if (!nama || !alamat || !rank)" yang
      // lama karena skema Zod juga mengecek tipe data, panjang maksimal 100
      // karakter (sesuai VARCHAR(100) di database.sql), dan men-trim spasi
      // di awal/akhir SEBELUM data disimpan ke database.
      const validasi = validatePlayerInput(p_req.body);
      if (!validasi.success) {
        p_res.status(400).json({
          success: false,
          message: validasi.message,
        });
        return;
      }
      // validasi.data sudah bertipe Omit<Player, 'id'> dan nilainya sudah di-trim.
      const { nama, alamat, rank } = validasi.data;

      const id = await PlayerModel.create({ nama, alamat, rank });

      // Response 201 Created menunjukkan resource berhasil dibuat.
      p_res.status(201).json({
        success: true,
        message: 'Player berhasil ditambahkan',
        // Kita kirimkan kembali data yang baru dibuat beserta ID-nya.
        data: { id, nama, alamat, rank },
      });
    } catch (error: unknown) {
      console.error('Gagal menambah player:', error);
      p_res.status(500).json({
        success: false,
        message: 'Gagal menambah player',
        ...(process.env.NODE_ENV !== 'production' && {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  }

  static async update(p_req: Request, p_res: Response): Promise<void> {
    try {
      // Validasi id dari URL param DULU sebelum melakukan apa pun yang lain
      // (termasuk sebelum validasi body), supaya request dengan id ngawur
      // (misal /api/player/abc) langsung ditolak dengan pesan yang jelas.
      const id = parseValidId(p_req.params.id);
      if (id === null) {
        p_res.status(400).json({
          success: false,
          message: 'ID tidak valid',
        });
        return;
      }

      // Sama seperti create(): validasi body pakai skema Zod.
      const validasi = validatePlayerInput(p_req.body);
      if (!validasi.success) {
        p_res.status(400).json({
          success: false,
          message: validasi.message,
        });
        return;
      }
      const { nama, alamat, rank } = validasi.data;

      // Panggil model untuk update. Method update mengembalikan jumlah baris yang terpengaruh (affectedRows).
      const affectedRows = await PlayerModel.update(id, { nama, alamat, rank });

      // Jika affectedRows = 0, artinya tidak ada baris yang diubah, kemungkinan ID tidak ditemukan.
      if (affectedRows === 0) {
        p_res.status(404).json({
          success: false,
          message: 'Player tidak ditemukan',
        });
        return;
      }

      p_res.status(200).json({
        success: true,
        message: 'Player berhasil diupdate',
        data: { id, nama, alamat, rank },
      });
    } catch (error: unknown) {
      console.error('Gagal mengupdate player:', error);
      p_res.status(500).json({
        success: false,
        message: 'Gagal mengupdate player',
        ...(process.env.NODE_ENV !== 'production' && {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  }

  static async delete(p_req: Request, p_res: Response): Promise<void> {
    try {
      // Sama seperti getById()/update(): validasi id dulu sebelum menyentuh database.
      const id = parseValidId(p_req.params.id);
      if (id === null) {
        p_res.status(400).json({
          success: false,
          message: 'ID tidak valid',
        });
        return;
      }

      // Panggil model untuk menghapus data. Mengembalikan affectedRows.
      const affectedRows = await PlayerModel.delete(id);

      // Jika tidak ada baris yang terhapus, ID tidak ditemukan.
      if (affectedRows === 0) {
        p_res.status(404).json({
          success: false,
          message: 'Player tidak ditemukan',
        });
        return;
      }

      p_res.status(200).json({
        success: true,
        message: 'Player berhasil dihapus',
      });
    } catch (error: unknown) {
      console.error('Gagal menghapus player:', error);
      p_res.status(500).json({
        success: false,
        message: 'Gagal menghapus player',
        ...(process.env.NODE_ENV !== 'production' && {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
    }
  }
}

export default PlayerController;
