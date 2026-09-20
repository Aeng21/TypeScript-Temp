/**
 * ==============================================================
 * KETERANGAN TIPE DATA: SELECT / DROPDOWN
 * ==============================================================
 * Digunakan untuk opsi panjang yang dipilih salah satu (misal: Kota).
 * Contoh di bawah menambahkan field baru "kota" ke form Player.
 *
 * - Database MySQL  : VARCHAR(50) atau ENUM
 * - Tipe Typescript : string
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML  →  simpan di: frontend/player.html
 * ==============================================================
 */

// DI BAGIAN FORM TAMBAH (di dalam <form id="formTambah">)
// <select id="kotaTambah" required>
//     <option value="" disabled selected>-- Pilih Kota --</option>
//     <option value="Jakarta">Jakarta</option>
//     <option value="Bandung">Bandung</option>
//     <option value="Surabaya">Surabaya</option>
// </select>

// DI BAGIAN MODAL EDIT (di dalam <form id="formEdit">)
// <div class="form-group">
//     <label for="kotaEdit">Kota</label>
//     <select id="kotaEdit" required>
//         <option value="Jakarta">Jakarta</option>
//         <option value="Bandung">Bandung</option>
//         <option value="Surabaya">Surabaya</option>
//     </select>
// </div>

/**
 * ==============================================================
 * 2. FRONTEND TS  →  simpan di: frontend/src/player.ts
 * ==============================================================
 */

// A. Di bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM", tambahkan (tipe: HTMLSelectElement):
// const kotaTambah = document.getElementById('kotaTambah') as HTMLSelectElement;   // BAGIAN INI
// const kotaEdit = document.getElementById('kotaEdit') as HTMLSelectElement;       // BAGIAN INI

// B. Di bagian "2. FUNGSI API", tambahkan parameter kota di createData & updateData:
// async function createData(p_nama: string, p_alamat: string, p_rank: string, p_kota: string) {   // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, kota: p_kota })         // BAGIAN INI
// }
//
// async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_kota: string) {  // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, kota: p_kota })         // BAGIAN INI
// }

// C. Di bagian "3. FUNGSI UI & TAMPILAN":
// - renderData(): tampilkan kolom & bawa datanya di tombol Edit
//     <td>${p_item.kota}</td>                                                             // BAGIAN INI
//     <button class="action-btn edit-btn" ... data-kota="${p_item.kota}">Edit</button>     // BAGIAN INI
//
// - Event listener tombol Edit, teruskan ke openEditModal:
//     openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
//         target.dataset.rank!, target.dataset.kota!);                                    // BAGIAN INI
//
// - openEditModal(): perlakuannya sama seperti input teks biasa (pakai .value)
//     function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_kota: string) {  // BAGIAN INI
//         currentEditId = p_id;
//         namaEdit.value = p_nama;
//         alamatEdit.value = p_alamat;
//         rankEdit.value = p_rank;
//         kotaEdit.value = p_kota;                                                          // BAGIAN INI
//         modalOverlay.classList.add('active');
//     }

// D. Di bagian "4. EVENT LISTENERS UTAMA":
// Form Tambah
// formTambah.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const kota = kotaTambah.value;                            // BAGIAN INI
//     if (!nama || !alamat || !rank || !kota) {                  // BAGIAN INI
//         alert('Semua field harus diisi!');
//         return;
//     }
//     createData(nama, alamat, rank, kota);                      // BAGIAN INI
// });
//
// Form Edit
// formEdit.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const kota = kotaEdit.value;                                // BAGIAN INI
//     if (!nama || !alamat || !rank || !kota) {                  // BAGIAN INI
//         alert('Semua field harus diisi!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, kota);        // BAGIAN INI
// });

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN kota VARCHAR(50) NOT NULL DEFAULT '';   // BAGIAN INI

// models/playerModel.ts
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     kota: string;                                              // BAGIAN INI
// }
//
// static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'INSERT INTO player (nama, alamat, rank, kota) VALUES (?, ?, ?, ?)';    // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.kota]                      // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, kota = ? WHERE id = ?';  // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.kota, p_id]                 // BAGIAN INI
//     );
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(p_req: Request, p_res: Response): Promise<void> {
//     const { nama, alamat, rank, kota } = p_req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     if (!nama || !alamat || !rank || !kota) {                             // BAGIAN INI
//         p_res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, kota });     // BAGIAN INI
//     p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, kota } });
// }
