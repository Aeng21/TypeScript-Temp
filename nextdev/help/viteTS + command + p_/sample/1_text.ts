/**
 * ==============================================================
 * KETERANGAN TIPE DATA: TEXT (STRING)
 * ==============================================================
 * Digunakan untuk inputan teks biasa (misal: Email).
 * Contoh di bawah menambahkan field baru "email" ke form Player.
 *
 * - Database MySQL  : VARCHAR(255)
 * - Tipe Typescript : string
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML  →  simpan di: frontend/player.html
 * ==============================================================
 */

// DI BAGIAN FORM TAMBAH (di dalam <form id="formTambah">)
// <input type="text" id="emailTambah" placeholder="Email" required />

// DI BAGIAN MODAL EDIT (di dalam <form id="formEdit">)
// <div class="form-group">
//     <label for="emailEdit">Email</label>
//     <input type="text" id="emailEdit" required />
// </div>

/**
 * ==============================================================
 * 2. FRONTEND TS  →  simpan di: frontend/src/player.ts
 * ==============================================================
 */

// A. Di bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM", tambahkan:
// const emailTambah = document.getElementById('emailTambah') as HTMLInputElement;   // BAGIAN INI
// const emailEdit = document.getElementById('emailEdit') as HTMLInputElement;       // BAGIAN INI

// B. Di bagian "2. FUNGSI API", tambahkan parameter email di createData & updateData:
// async function createData(p_nama: string, p_alamat: string, p_rank: string, p_email: string) {   // BAGIAN INI
//     const res = await fetch(API_URL, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, email: p_email })    // BAGIAN INI
//     });
//     // ...sisanya sama seperti aslinya
// }
//
// async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_email: string) {  // BAGIAN INI
//     const res = await fetch(`${API_URL}/${p_id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, email: p_email })    // BAGIAN INI
//     });
//     // ...sisanya sama seperti aslinya
// }

// C. Di bagian "3. FUNGSI UI & TAMPILAN":
// - renderData(): tampilkan kolom baru & bawa datanya di tombol Edit
//     <td>${p_item.email}</td>                                                            // BAGIAN INI
//     <button class="action-btn edit-btn" data-id="${p_item.id}" data-nama="${p_item.nama}"
//         data-alamat="${p_item.alamat}" data-rank="${p_item.rank}"
//         data-email="${p_item.email}">Edit</button>                                       // BAGIAN INI
//
// - Event listener tombol Edit, teruskan datanya ke openEditModal:
//     openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
//         target.dataset.rank!, target.dataset.email!);                                   // BAGIAN INI
//
// - openEditModal(): tambahkan parameter & isi ke input edit
//     function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_email: string) {  // BAGIAN INI
//         currentEditId = p_id;
//         namaEdit.value = p_nama;
//         alamatEdit.value = p_alamat;
//         rankEdit.value = p_rank;
//         emailEdit.value = p_email;                                                        // BAGIAN INI
//         modalOverlay.classList.add('active');
//     }

// D. Di bagian "4. EVENT LISTENERS UTAMA":
// Form Tambah
// formTambah.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const email = emailTambah.value.trim();                  // BAGIAN INI
//     if (!nama || !alamat || !rank || !email) {                // BAGIAN INI
//         alert('Semua field harus diisi!');
//         return;
//     }
//     createData(nama, alamat, rank, email);                    // BAGIAN INI
// });
//
// Form Edit
// formEdit.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const email = emailEdit.value.trim();                     // BAGIAN INI
//     if (!nama || !alamat || !rank || !email) {                // BAGIAN INI
//         alert('Semua field harus diisi!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, email);     // BAGIAN INI
// });

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';   // BAGIAN INI

// models/playerModel.ts
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     email: string;                                            // BAGIAN INI
// }
//
// static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'INSERT INTO player (nama, alamat, rank, email) VALUES (?, ?, ?, ?)';           // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.email]                            // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, email = ? WHERE id = ?';      // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.email, p_id]                       // BAGIAN INI
//     );
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(p_req: Request, p_res: Response): Promise<void> {
//     const { nama, alamat, rank, email } = p_req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     if (!nama || !alamat || !rank || !email) {                             // BAGIAN INI
//         p_res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, email });     // BAGIAN INI
//     p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, email } });
// }
//
// static async update(p_req: Request, p_res: Response): Promise<void> {
//     const { nama, alamat, rank, email } = p_req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     // ...validasi & pemanggilan PlayerModel.update sama pola-nya seperti create
// }
