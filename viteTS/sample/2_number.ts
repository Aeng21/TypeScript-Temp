/**
 * ==============================================================
 * KETERANGAN TIPE DATA: NUMBER (ANGKA)
 * ==============================================================
 * Digunakan untuk angka (misal: Umur).
 * Contoh di bawah menambahkan field baru "umur" ke form Player.
 *
 * - Database MySQL  : INT / BIGINT / DECIMAL(10,2) (jika ada koma/harga)
 * - Tipe Typescript : number
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML  →  simpan di: frontend/player.html
 * ==============================================================
 */

// DI BAGIAN FORM TAMBAH (di dalam <form id="formTambah">)
// <input type="number" id="umurTambah" placeholder="Umur" min="0" required />

// DI BAGIAN MODAL EDIT (di dalam <form id="formEdit">)
// <div class="form-group">
//     <label for="umurEdit">Umur</label>
//     <input type="number" id="umurEdit" min="0" required />
// </div>

/**
 * ==============================================================
 * 2. FRONTEND TS  →  simpan di: frontend/src/player.ts
 * ==============================================================
 */

// A. Di bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM", tambahkan:
// const umurTambah = document.getElementById('umurTambah') as HTMLInputElement;   // BAGIAN INI
// const umurEdit = document.getElementById('umurEdit') as HTMLInputElement;       // BAGIAN INI

// B. Di bagian "2. FUNGSI API", tambahkan parameter umur di createData & updateData:
// async function createData(nama: string, alamat: string, rank: string, umur: number) {   // BAGIAN INI
//     body: JSON.stringify({ nama, alamat, rank, umur })                                   // BAGIAN INI
// }
//
// async function updateData(id: string, nama: string, alamat: string, rank: string, umur: number) {  // BAGIAN INI
//     body: JSON.stringify({ nama, alamat, rank, umur })                                   // BAGIAN INI
// }

// C. Di bagian "3. FUNGSI UI & TAMPILAN":
// - renderData(): tampilkan kolom & bawa datanya di tombol Edit
//     <td>${item.umur}</td>                                                               // BAGIAN INI
//     <button class="action-btn edit-btn" ... data-umur="${item.umur}">Edit</button>       // BAGIAN INI
//
// - Event listener tombol Edit: Number() datanya dulu karena dataset selalu string
//     openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
//         target.dataset.rank!, Number(target.dataset.umur));                             // BAGIAN INI
//
// - openEditModal(): tambahkan parameter & isi ke input edit (harus di-.toString() dulu)
//     function openEditModal(id: string, nama: string, alamat: string, rank: string, umur: number) {  // BAGIAN INI
//         currentEditId = id;
//         namaEdit.value = nama;
//         alamatEdit.value = alamat;
//         rankEdit.value = rank;
//         umurEdit.value = umur.toString();                                                 // BAGIAN INI
//         modalOverlay.classList.add('active');
//     }

// D. Di bagian "4. EVENT LISTENERS UTAMA":
// Form Tambah
// formTambah.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const umur = Number(umurTambah.value);                    // BAGIAN INI — .value string harus di-parse
//     if (!nama || !alamat || !rank || isNaN(umur)) {            // BAGIAN INI
//         alert('Semua field harus diisi dengan benar!');
//         return;
//     }
//     createData(nama, alamat, rank, umur);                      // BAGIAN INI
// });
//
// Form Edit
// formEdit.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const umur = Number(umurEdit.value);                       // BAGIAN INI
//     if (!nama || !alamat || !rank || isNaN(umur)) {             // BAGIAN INI
//         alert('Semua field harus diisi dengan benar!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, umur);        // BAGIAN INI
// });

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN umur INT NOT NULL DEFAULT 0;   // BAGIAN INI

// models/playerModel.ts
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     umur: number;                                              // BAGIAN INI
// }
//
// static async create(data: Omit<Player, 'id'>): Promise<number> {
//     const query = 'INSERT INTO player (nama, alamat, rank, umur) VALUES (?, ?, ?, ?)';            // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [data.nama, data.alamat, data.rank, data.umur]                                     // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// static async update(id: number, data: Omit<Player, 'id'>): Promise<number> {
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, umur = ? WHERE id = ?';       // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [data.nama, data.alamat, data.rank, data.umur, id]                                  // BAGIAN INI
//     );
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(req: Request, res: Response): Promise<void> {
//     const { nama, alamat, rank, umur } = req.body as Omit<Player, 'id'>;    // BAGIAN INI
//     if (!nama || !alamat || !rank || umur === undefined) {                  // BAGIAN INI
//         res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, umur });      // BAGIAN INI
//     res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, umur } });
// }
//
// static async update(req: Request, res: Response): Promise<void> {
//     const { nama, alamat, rank, umur } = req.body as Omit<Player, 'id'>;    // BAGIAN INI
//     // ...validasi & pemanggilan PlayerModel.update sama pola-nya seperti create
// }
