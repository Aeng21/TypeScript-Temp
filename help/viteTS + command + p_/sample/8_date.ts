/**
 * ==============================================================
 * KETERANGAN TIPE DATA: DATE / TANGGAL
 * ==============================================================
 * Digunakan untuk tanggal (misal: Tanggal Lahir).
 * Contoh di bawah menambahkan field baru "tanggalLahir" ke form Player.
 *
 * - Database MySQL  : DATE (format 'YYYY-MM-DD')
 * - Tipe Typescript : string (input type="date" selalu mengembalikan string 'YYYY-MM-DD')
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML  →  simpan di: frontend/player.html
 * ==============================================================
 */

// DI BAGIAN FORM TAMBAH (di dalam <form id="formTambah">)
// <input type="date" id="tanggalLahirTambah" required />

// DI BAGIAN MODAL EDIT (di dalam <form id="formEdit">)
// <div class="form-group">
//     <label for="tanggalLahirEdit">Tanggal Lahir</label>
//     <input type="date" id="tanggalLahirEdit" required />
// </div>

/**
 * ==============================================================
 * 2. FRONTEND TS  →  simpan di: frontend/src/player.ts
 * ==============================================================
 */

// A. Di bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM", tambahkan:
// const tanggalLahirTambah = document.getElementById('tanggalLahirTambah') as HTMLInputElement;   // BAGIAN INI
// const tanggalLahirEdit = document.getElementById('tanggalLahirEdit') as HTMLInputElement;       // BAGIAN INI

// B. Di bagian "2. FUNGSI API", tambahkan parameter tanggalLahir di createData & updateData:
// async function createData(p_nama: string, p_alamat: string, p_rank: string, p_tanggalLahir: string) {   // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, tanggalLahir: p_tanggalLahir }) // BAGIAN INI
// }
//
// async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_tanggalLahir: string) {  // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, tanggalLahir: p_tanggalLahir }) // BAGIAN INI
// }

// C. Di bagian "3. FUNGSI UI & TAMPILAN":
// - renderData(): tampilkan kolom & bawa datanya di tombol Edit
//     <td>${p_item.tanggalLahir}</td>                                                             // BAGIAN INI
//     <button class="action-btn edit-btn" ... data-tanggal="${p_item.tanggalLahir}">Edit</button>  // BAGIAN INI
//
// - Event listener tombol Edit, teruskan ke openEditModal:
//     openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
//         target.dataset.rank!, target.dataset.tanggal!);                                         // BAGIAN INI
//
// - openEditModal(): input type="date" WAJIB diisi format 'YYYY-MM-DD'. Setelah
//   dateStrings: true dipasang (lihat bagian 3. BACKEND), tanggalLahir dari backend
//   sudah pasti string 'YYYY-MM-DD' apa adanya, jadi tinggal diisi langsung tanpa
//   split/konversi apa pun:
//     function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_tanggalLahir: string) {  // BAGIAN INI
//         currentEditId = p_id;
//         namaEdit.value = p_nama;
//         alamatEdit.value = p_alamat;
//         rankEdit.value = p_rank;
//         tanggalLahirEdit.value = p_tanggalLahir;                                                 // BAGIAN INI
//         modalOverlay.classList.add('active');
//     }

// D. Di bagian "4. EVENT LISTENERS UTAMA":
// Form Tambah
// formTambah.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const tanggalLahir = tanggalLahirTambah.value;             // BAGIAN INI — sudah otomatis 'YYYY-MM-DD'
//     if (!nama || !alamat || !rank || !tanggalLahir) {           // BAGIAN INI
//         alert('Semua field harus diisi!');
//         return;
//     }
//     createData(nama, alamat, rank, tanggalLahir);               // BAGIAN INI
// });
//
// Form Edit
// formEdit.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const tanggalLahir = tanggalLahirEdit.value;                // BAGIAN INI
//     if (!nama || !alamat || !rank || !tanggalLahir) {           // BAGIAN INI
//         alert('Semua field harus diisi!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, tanggalLahir); // BAGIAN INI
// });

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN tanggalLahir DATE NOT NULL;   // BAGIAN INI

// PRASYARAT PENTING — backend/src/config/database.ts (di luar folder sample, edit manual):
// Pool koneksi saat ini TIDAK di-set "dateStrings", jadi kolom DATE dikembalikan sebagai
// objek Date pada timezone lokal server. Kalau lalu di-convert pakai .toISOString() (UTC),
// tanggalnya bisa MUNDUR 1 HARI untuk timezone WIB/WITA/WIT (UTC+7/+8/+9). Supaya kolom
// DATE selalu balik sebagai string 'YYYY-MM-DD' apa adanya (tanpa konversi timezone sama
// sekali), tambahkan opsi berikut di mysql.createPool({ ... }):
//     dateStrings: true,                                        // BAGIAN INI — atau dateStrings: ['DATE']
// Dengan opsi ini, snippet getAll() di bawah TIDAK perlu lagi cek "instanceof Date".

// models/playerModel.ts
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     tanggalLahir: string;                                      // BAGIAN INI — sudah string 'YYYY-MM-DD' berkat dateStrings: true
// }
//
// static async getAll(): Promise<Player[]> {
//     const query = 'SELECT * FROM player';
//     const [rows] = await db.query<RowDataPacket[]>(query);
//     return rows as Player[];                                                             // BAGIAN INI — tidak perlu konversi Date lagi
// }
//
// static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'INSERT INTO player (nama, alamat, rank, tanggalLahir) VALUES (?, ?, ?, ?)';  // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.tanggalLahir]                    // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, tanggalLahir = ? WHERE id = ?';  // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.tanggalLahir, p_id]                   // BAGIAN INI
//     );
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(p_req: Request, p_res: Response): Promise<void> {
//     const { nama, alamat, rank, tanggalLahir } = p_req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     if (!nama || !alamat || !rank || !tanggalLahir) {                             // BAGIAN INI
//         p_res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, tanggalLahir });     // BAGIAN INI
//     p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, tanggalLahir } });
// }
