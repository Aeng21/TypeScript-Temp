/**
 * ==============================================================
 * KETERANGAN TIPE DATA: RADIO BUTTON
 * ==============================================================
 * Digunakan untuk memilih SATU pilihan dari beberapa opsi (misal Jenis Kelamin).
 *
 * - Database MySQL  : ENUM('L','P') atau VARCHAR(10)
 * - Tipe Typescript : string ('L' | 'P')
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML (Copas ke dalam form)
 * ==============================================================
 */

// DI BAGIAN TAMBAH
// <span>Jenis Kelamin</span>
// <label>Pria
//     <input name="jenkelTambah" type="radio" value="pria" required>
// </label>
//
// <label>Wanita
//     <input name="jenkelTambah" type="radio" value="wanita" required>
// </label>

// DI BAGIAN MODAL EDIT
// <span>Jenis Kelamin</span>
// <label>Pria
//     <input type="radio" name="jenkelEdit" value="pria" required />
// </label>
//
// <label>Wanita
//     <input type="radio" name="jenkelEdit" value="wanita" required />
// </label>

/**
 * ==============================================================
 * 2. FRONTEND TS
 * ==============================================================
 */

// BUAT HELPER GET NYA
// HELPER GET
// function getRadioValue(name: string): string {
//     const checked = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
//     return checked ? checked.value : '';
// }

// TAMBAHKAN HELPER SET NYA di openEditModal
// function openEditModal(id: string, nama: string, alamat: string, rank: string, jenkel: string) {
//     currentEditId = id;
//     namaEdit.value = nama;
//     alamatEdit.value = alamat;
//     rankEdit.value = rank;
//
//     const radio = document.querySelector(                            // BAGIAN INI
//         `input[name="jenkelEdit"][value="${jenkel}"]`                // BAGIAN INI
//     ) as HTMLInputElement | null;                                    // BAGIAN INI
//
//     if (radio) radio.checked = true;                                 // BAGIAN INI — null-check, jaga-jaga value tidak cocok opsi manapun
//
//     modalOverlay.classList.add('active');
// }

// PENTING — 2 tempat ini WAJIB ikut diubah, kalau tidak openEditModal() di atas akan
// dipanggil dengan jenkel = undefined (radio di modal edit tidak akan ter-checklist):
//
// - renderData(): bawa datanya lewat data-attribute di tombol Edit
//     <button class="action-btn edit-btn" ... data-jenkel="${item.jenisKelamin}">Edit</button>   // BAGIAN INI
//
// - Event listener tombol Edit, teruskan ke openEditModal:
//     openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
//         target.dataset.rank!, target.dataset.jenkel!);                                        // BAGIAN INI

// Panggil di dalam event submit dengan name yang sesuai HTML:
// Form Tambah
// formTambah.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const jenisKelamin = getRadioValue('jenkelTambah');              // ← BAGIAN INI
//
//     if (!nama || !alamat || !rank || !jenisKelamin) {
//         alert('Semua field harus diisi!');
//         return;
//     }
//     createData(nama, alamat, rank, jenisKelamin);
// });

// Form Edit
// formEdit.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const jenisKelamin = getRadioValue('jenkelEdit');                // ← BAGIAN INI
//
//     if (!nama || !alamat || !rank || !jenisKelamin) {
//         alert('Semua field harus diisi!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, jenisKelamin);
// });

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN jenisKelamin VARCHAR(10) NOT NULL DEFAULT '';   // BAGIAN INI

// models/playerModel.ts
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     jenisKelamin: string;                                      // BAGIAN INI
// }
//
// static async create(data: Omit<Player, 'id'>): Promise<number> {
//     const query = 'INSERT INTO player (nama, alamat, rank, jenisKelamin) VALUES (?, ?, ?, ?)';           // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [data.nama, data.alamat, data.rank, data.jenisKelamin]                                    // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// static async update(id: number, data: Omit<Player, 'id'>): Promise<number> {
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, jenisKelamin = ? WHERE id = ?';     // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [data.nama, data.alamat, data.rank, data.jenisKelamin, id]                                // BAGIAN INI
//     );
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(req: Request, res: Response): Promise<void> {
//     const { nama, alamat, rank, jenisKelamin } = req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     if (!nama || !alamat || !rank || !jenisKelamin) {                             // BAGIAN INI
//         res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, jenisKelamin });     // BAGIAN INI
//     res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, jenisKelamin } });
// }