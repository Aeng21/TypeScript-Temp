/**
 * ==============================================================
 * KETERANGAN TIPE DATA: CHECKBOX MULTIPLE (ARRAY / BANYAK PILIHAN)
 * ==============================================================
 * Digunakan jika user boleh memilih lebih dari satu opsi (misal: Hobi).
 * Contoh di bawah menambahkan field baru "hobi" ke form Player.
 *
 * - Database MySQL  : JSON atau VARCHAR/TEXT (disimpan sebagai teks stringify, ex: '["Gaming","Musik"]')
 * - Tipe Typescript : string[]
 * ==============================================================
 */

/**
 * ==============================================================
 * 1. HTML  →  simpan di: frontend/player.html
 * ==============================================================
 */

// DI BAGIAN FORM TAMBAH (di dalam <form id="formTambah">)
// <span>Hobi</span>
// <label><input name="hobiTambah" type="checkbox" value="Gaming"> Gaming</label>
// <label><input name="hobiTambah" type="checkbox" value="Membaca"> Membaca</label>
// <label><input name="hobiTambah" type="checkbox" value="Olahraga"> Olahraga</label>

// DI BAGIAN MODAL EDIT (di dalam <form id="formEdit">)
// <span>Hobi</span>
// <label><input name="hobiEdit" type="checkbox" value="Gaming"> Gaming</label>
// <label><input name="hobiEdit" type="checkbox" value="Membaca"> Membaca</label>
// <label><input name="hobiEdit" type="checkbox" value="Olahraga"> Olahraga</label>

/**
 * ==============================================================
 * 2. FRONTEND TS  →  simpan di: frontend/src/player.ts
 * ==============================================================
 */

// A. Checkbox banyak pilihan pakai atribut "name" (bukan "id"), jadi TIDAK perlu
//    deklarasi getElementById satu-satu. Cukup buat 2 HELPER berikut, taruh di paling atas
//    file (dekat bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM"):
//
// function getCheckboxValues(p_name: string): string[] {                                 // BAGIAN INI
//     const checkedBoxes = document.querySelectorAll(`input[name="${p_name}"]:checked`);
//     return Array.from(checkedBoxes).map(p_cb => (p_cb as HTMLInputElement).value);
// }
//
// function setCheckboxValues(p_name: string, p_values: string[]): void {                 // BAGIAN INI
//     document.querySelectorAll(`input[name="${p_name}"]`).forEach(p_el => {
//         (p_el as HTMLInputElement).checked = false;
//     });
//     p_values.forEach(p_val => {
//         const cb = document.querySelector(`input[name="${p_name}"][value="${p_val}"]`) as HTMLInputElement | null;
//         if (cb) cb.checked = true;
//     });
// }

// B. Di bagian "2. FUNGSI API", tambahkan parameter hobi di createData & updateData:
// async function createData(p_nama: string, p_alamat: string, p_rank: string, p_hobi: string[]) {   // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, hobi: p_hobi })           // BAGIAN INI
// }
//
// async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_hobi: string[]) {  // BAGIAN INI
//     body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, hobi: p_hobi })           // BAGIAN INI
// }

// C. Di bagian "3. FUNGSI UI & TAMPILAN":
// - renderData(): tampilkan hobi (join koma) — data-attribute tidak dipakai untuk array,
//   simpan JSON string-nya saja:
//     <td>${p_item.hobi.join(', ')}</td>                                                   // BAGIAN INI
//     <button class="action-btn edit-btn" ... data-hobi='${JSON.stringify(p_item.hobi)}'>Edit</button>  // BAGIAN INI
//
// - Event listener tombol Edit: parse JSON dari dataset
//     openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
//         target.dataset.rank!, JSON.parse(target.dataset.hobi!));                          // BAGIAN INI
//
// - openEditModal(): tambahkan parameter & isi pakai setCheckboxValues()
//     function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_hobi: string[]) {  // BAGIAN INI
//         currentEditId = p_id;
//         namaEdit.value = p_nama;
//         alamatEdit.value = p_alamat;
//         rankEdit.value = p_rank;
//         setCheckboxValues('hobiEdit', p_hobi);                                              // BAGIAN INI
//         modalOverlay.classList.add('active');
//     }

// D. Di bagian "4. EVENT LISTENERS UTAMA":
// Form Tambah
// formTambah.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaTambah.value.trim();
//     const alamat = alamatTambah.value.trim();
//     const rank = rankTambah.value.trim();
//     const hobi = getCheckboxValues('hobiTambah');              // BAGIAN INI
//     if (!nama || !alamat || !rank) {
//         alert('Semua field harus diisi!');
//         return;
//     }
//     createData(nama, alamat, rank, hobi);                       // BAGIAN INI
// });
//
// Form Edit
// formEdit.addEventListener('submit', (p_e) => {
//     p_e.preventDefault();
//     const nama = namaEdit.value.trim();
//     const alamat = alamatEdit.value.trim();
//     const rank = rankEdit.value.trim();
//     const hobi = getCheckboxValues('hobiEdit');                 // BAGIAN INI
//     if (!nama || !alamat || !rank) {
//         alert('Semua field harus diisi!');
//         return;
//     }
//     if (currentEditId === null) return;
//     updateData(currentEditId, nama, alamat, rank, hobi);        // BAGIAN INI
// });
//
// closeEditModal(): kosongkan checkbox juga saat modal ditutup
// function closeEditModal() {
//     modalOverlay.classList.remove('active');
//     currentEditId = null;
//     formEdit.reset();
//     setCheckboxValues('hobiEdit', []);                          // BAGIAN INI (opsional, jaga-jaga)
// }

/**
 * ==============================================================
 * 3. BACKEND  →  simpan di: backend/src/models/playerModel.ts
 *              & backend/src/controllers/playerController.ts
 * ==============================================================
 */

// database.sql — WAJIB dijalankan dulu di MySQL, kolom baru belum otomatis ada:
// ALTER TABLE player ADD COLUMN hobi TEXT NOT NULL;   // BAGIAN INI — disimpan sebagai JSON string, pakai TEXT/JSON

// models/playerModel.ts
// export interface Player {
//     id: number;
//     nama: string;
//     alamat: string;
//     rank: string;
//     hobi: string[];                                            // BAGIAN INI
// }
//
// static async getAll(): Promise<Player[]> {
//     const query = 'SELECT * FROM player';
//     const [rows] = await db.query<RowDataPacket[]>(query);
//     // hobi di database adalah JSON string '["Gaming","Musik"]', parse ke Array          // BAGIAN INI
//     return rows.map(p_row => {                                                           // BAGIAN INI
//         let hobiArray: string[] = [];
//         try {
//             hobiArray = typeof p_row.hobi === 'string' ? JSON.parse(p_row.hobi) : p_row.hobi;
//         } catch {
//             hobiArray = [];
//         }
//         return { ...p_row, hobi: hobiArray };
//     }) as Player[];
// }
//
// static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'INSERT INTO player (nama, alamat, rank, hobi) VALUES (?, ?, ?, ?)';    // BAGIAN INI
//     const hobiString = JSON.stringify(p_docu.hobi);                                        // BAGIAN INI — array harus di-stringify
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, hobiString]                       // BAGIAN INI
//     );
//     return result.insertId;
// }
//
// static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
//     const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, hobi = ? WHERE id = ?';  // BAGIAN INI
//     const hobiString = JSON.stringify(p_docu.hobi);                                        // BAGIAN INI
//     const [result] = await db.query<ResultSetHeader>(
//         query, [p_docu.nama, p_docu.alamat, p_docu.rank, hobiString, p_id]                 // BAGIAN INI
//     );
//     return result.affectedRows;
// }

// controllers/playerController.ts
// static async create(p_req: Request, p_res: Response): Promise<void> {
//     const { nama, alamat, rank, hobi } = p_req.body as Omit<Player, 'id'>;   // BAGIAN INI
//     if (!nama || !alamat || !rank) {
//         p_res.status(400).json({ success: false, message: 'Data harus diisi' });
//         return;
//     }
//     const id = await PlayerModel.create({ nama, alamat, rank, hobi: hobi ?? [] });   // BAGIAN INI
//     p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, hobi } });
// }
