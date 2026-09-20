/**
 * ==============================================================
 * KETERANGAN TIPE DATA: CHECKBOX SINGLE (BOOLEAN)
 * ==============================================================
 * Digunakan untuk opsi Ya/Tidak (misal: "Status Aktif").
 * Contoh di bawah menambahkan field baru "isActive" ke form Player.
 *
 * - Database MySQL  : TINYINT(1) (1 = true, 0 = false)
 * - Tipe Typescript : boolean
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML  →  simpan di: frontend/player.html
 * ==============================================================
 */

// DI BAGIAN FORM TAMBAH (di dalam <form id="formTambah">)
// <label><input type="checkbox" id="isActiveTambah"> Aktif</label>

// DI BAGIAN MODAL EDIT (di dalam <form id="formEdit">)
// <div class="form-group">
//     <label><input type="checkbox" id="isActiveEdit"> Aktif</label>
// </div>

/**
 * ==============================================================
 * 2. FRONTEND TS  →  simpan di: frontend/src/player.ts
 * ==============================================================
 */

// A. Di bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM", tambahkan:
// const isActiveTambah = document.getElementById('isActiveTambah') as HTMLInputElement;   // BAGIAN INI
// const isActiveEdit = document.getElementById('isActiveEdit') as HTMLInputElement;       // BAGIAN INI

// B. Di bagian "2. FUNGSI API", tambahkan parameter isActive di createData & updateData:
// async function createData(p_nama: string, p_alamat: string, p_rank: string, p_isActive: boolean) {  // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, isActive: p_isActive })    // BAGIAN INI
// }
//
// async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_isActive: boolean) {  // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, isActive: p_isActive })    // BAGIAN INI
// }

// C. Di bagian "3. FUNGSI UI & TAMPILAN":
// - renderData(): tampilkan status & bawa datanya di tombol Edit (data-attribute selalu string,
//   jadi disimpan sebagai "true"/"false")
//     <td>${p_item.isActive ? 'Aktif' : 'Nonaktif'}</td>                                      // BAGIAN INI
//     <button class="action-btn edit-btn" ... data-isactive="${p_item.isActive}">Edit</button> // BAGIAN INI
//
// - Event listener tombol Edit: ubah string "true"/"false" balik jadi boolean
//     openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
//         target.dataset.rank!, target.dataset.isactive === 'true');                          // BAGIAN INI
//
// - openEditModal(): tambahkan parameter & isi lewat .checked (bukan .value)
//     function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_isActive: boolean) {  // BAGIAN INI
//         currentEditId = p_id;
//         namaEdit.value = p_nama;
//         alamatEdit.value = p_alamat;
//         rankEdit.value = p_rank;
//         isActiveEdit.checked = p_isActive;                                                    // BAGIAN INI
//         modalOverlay.classList.add('active');
//     }

// D. Di bagian "4. EVENT LISTENERS UTAMA":
// Form Tambah
// formTambah.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const isActive = isActiveTambah.checked;                  // BAGIAN INI — .checked, bukan .value
//     if (!nama || !alamat || !rank) {
//         alert('Semua field harus diisi!');
//         return;
//     }
//     createData(nama, alamat, rank, isActive);                  // BAGIAN INI
// });
//
// Form Edit
// formEdit.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const isActive = isActiveEdit.checked;                     // BAGIAN INI
//     if (!nama || !alamat || !rank) {
//         alert('Semua field harus diisi!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, isActive);   // BAGIAN INI
// });
//
// PENTING: form.reset() TIDAK meng-uncheck checkbox secara konsisten di semua kasus,
// jadi di closeEditModal() / setelah formTambah.reset() pastikan reset manual jika perlu:
// isActiveTambah.checked = false;                                // BAGIAN INI (opsional, jaga-jaga)

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1;   // BAGIAN INI

// models/playerModel.ts
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     isActive: boolean;                                         // BAGIAN INI
// }
//
// static async getAll(): Promise<Player[]> {
//     const query = 'SELECT * FROM player';
//     const [rows] = await db.query<RowDataPacket[]>(query);
//     // MySQL TINYINT(1) balik sebagai 1/0, parse ke boolean asli                             // BAGIAN INI
//     return rows.map(p_row => ({ ...p_row, isActive: p_row.isActive === 1 })) as Player[];     // BAGIAN INI
// }
//
// static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'INSERT INTO player (nama, alamat, rank, isActive) VALUES (?, ?, ?, ?)';   // BAGIAN INI
//     // boolean dikirim langsung, mysql2 otomatis ubah jadi 1/0
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.isActive]                     // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, isActive = ? WHERE id = ?';  // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.isActive, p_id]                    // BAGIAN INI
//     );
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(p_req: Request, p_res: Response): Promise<void> {
//     const { nama, alamat, rank, isActive } = p_req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     if (!nama || !alamat || !rank) {
//         p_res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, isActive: !!isActive });   // BAGIAN INI
//     p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, isActive } });
// }
