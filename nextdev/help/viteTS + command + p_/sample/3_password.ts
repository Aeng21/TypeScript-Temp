/**
 * ==============================================================
 * KETERANGAN TIPE DATA: PASSWORD
 * ==============================================================
 * Digunakan untuk kata sandi, karakter di layar disamarkan jadi titik/bintang.
 * Contoh di bawah menambahkan field baru "password" ke form Player.
 *
 * - Database MySQL  : VARCHAR(255) (WAJIB disimpan dalam bentuk HASH, bukan plain text)
 * - Tipe Typescript : string
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML  →  simpan di: frontend/player.html
 * ==============================================================
 */

// DI BAGIAN FORM TAMBAH (di dalam <form id="formTambah">)
// <input type="password" id="passwordTambah" placeholder="Password" required />

// DI BAGIAN MODAL EDIT (di dalam <form id="formEdit">)
// <div class="form-group">
//     <label for="passwordEdit">Password Baru (kosongkan jika tidak diubah)</label>
//     <input type="password" id="passwordEdit" />
// </div>

/**
 * ==============================================================
 * 2. FRONTEND TS  →  simpan di: frontend/src/player.ts
 * ==============================================================
 */

// A. Di bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM", tambahkan:
// const passwordTambah = document.getElementById('passwordTambah') as HTMLInputElement;   // BAGIAN INI
// const passwordEdit = document.getElementById('passwordEdit') as HTMLInputElement;       // BAGIAN INI

// B. Di bagian "2. FUNGSI API", tambahkan parameter password di createData & updateData:
// async function createData(p_nama: string, p_alamat: string, p_rank: string, p_password: string) {   // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, password: p_password })     // BAGIAN INI
// }
//
// // Untuk update, password bersifat opsional (hanya dikirim jika diisi)
// async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_password: string) {  // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, password: p_password })     // BAGIAN INI
// }

// C. Di bagian "3. FUNGSI UI & TAMPILAN":
// - renderData(): JANGAN pernah menampilkan password di tabel/HTML, dan JANGAN taruh
//   password di data-attribute tombol Edit (alasan keamanan).
//
// - openEditModal(): TIDAK menerima parameter password, dan field password di modal
//   dikosongkan setiap kali modal dibuka:
//     function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string) {
//         currentEditId = p_id;
//         namaEdit.value = p_nama;
//         alamatEdit.value = p_alamat;
//         rankEdit.value = p_rank;
//         passwordEdit.value = '';                                                         // BAGIAN INI — selalu kosong
//         modalOverlay.classList.add('active');
//     }

// D. Di bagian "4. EVENT LISTENERS UTAMA":
// Form Tambah
// formTambah.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const password = passwordTambah.value;                    // BAGIAN INI — jangan di-trim
//     if (!nama || !alamat || !rank || !password) {              // BAGIAN INI
//         alert('Semua field harus diisi!');
//         return;
//     }
//     createData(nama, alamat, rank, password);                  // BAGIAN INI
// });
//
// Form Edit
// formEdit.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const password = passwordEdit.value;                       // BAGIAN INI — boleh kosong (artinya: tidak diubah)
//     if (!nama || !alamat || !rank) {
//         alert('Semua field harus diisi!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, password);   // BAGIAN INI
// });

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// PRASYARAT — jalankan dulu di folder backend, library ini BELUM ada di package.json:
// npm install bcrypt @types/bcrypt                                                // BAGIAN INI

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';   // BAGIAN INI

// models/playerModel.ts
// import bcrypt from 'bcrypt';                                                    // BAGIAN INI — perlu library hash
//
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     password: string;                                          // BAGIAN INI — menyimpan HASH, bukan plain text
// }
//
// // PENTING: JANGAN pakai "SELECT *" lagi setelah kolom password ditambahkan,
// // supaya hash password tidak pernah ikut terkirim ke frontend lewat getAll/getById:
// static async getAll(): Promise<Player[]> {                                                   // BAGIAN INI
//     const query = 'SELECT id, nama, alamat, rank FROM player';                                // BAGIAN INI — password sengaja tidak di-select
//     const [rows] = await db.query<RowDataPacket[]>(query);
//     return rows as Player[];
// }
//
// static async getById(p_id: number): Promise<Player | undefined> {                            // BAGIAN INI
//     const query = 'SELECT id, nama, alamat, rank FROM player WHERE id = ?';                   // BAGIAN INI
//     const [rows] = await db.query<RowDataPacket[]>(query, [p_id]);
//     return rows[0] as Player | undefined;
// }
//
// static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
//     const hashed = await bcrypt.hash(p_docu.password, 10);                                       // BAGIAN INI
//     const query = 'INSERT INTO player (nama, alamat, rank, password) VALUES (?, ?, ?, ?)';       // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, hashed]                                 // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// // Saat update, password TIDAK selalu diganti — hanya kalau field-nya diisi
// static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
//     if (p_docu.password) {                                                                        // BAGIAN INI
//         const hashed = await bcrypt.hash(p_docu.password, 10);
//         const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, password = ? WHERE id = ?';
//         const [result] = await db.query<ResultSetHeader>(query, [p_docu.nama, p_docu.alamat, p_docu.rank, hashed, p_id]);
//         return result.affectedRows;
//     }
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ? WHERE id = ?';                 // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_id]);
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(p_req: Request, p_res: Response): Promise<void> {
//     const { nama, alamat, rank, password } = p_req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     if (!nama || !alamat || !rank || !password) {                              // BAGIAN INI
//         p_res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, password });      // BAGIAN INI
//     // Jangan pernah kirim balik password (walau sudah di-hash) di response!
//     p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank } });
// }
