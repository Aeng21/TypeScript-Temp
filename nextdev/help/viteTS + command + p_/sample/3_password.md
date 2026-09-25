# 3. Password

Kode sumber lengkap (versi comment, siap salin): [`3_password.ts`](3_password.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk field sensitif yang harus di-hash, tidak pernah ditampilkan balik ke frontend, dan boleh dikosongkan saat edit (artinya: tidak diubah).

- Database MySQL: `VARCHAR(255)` (WAJIB disimpan dalam bentuk HASH, bukan plain text)
- Tipe TypeScript: `string`

## Prasyarat
1. Install library hash — **belum ada** di `backend/package.json`, jalankan di folder `backend`:
   ```
   npm install bcrypt @types/bcrypt
   ```
2. Jalankan di MySQL:
   ```sql
   ALTER TABLE player ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''; -- BAGIAN INI
   ```

## 1. HTML — lokasi: `frontend/player.html`

Di dalam `<form id="formTambah">`:
```html
<input type="password" id="passwordTambah" placeholder="Password" required /> <!-- BAGIAN INI -->
```

Di dalam `<form id="formEdit">` (modal edit) — **tanpa** `required`, boleh kosong = tidak diubah:
```html
<div class="form-group"> <!-- BAGIAN INI -->
    <label for="passwordEdit">Password Baru (kosongkan jika tidak diubah)</label> <!-- BAGIAN INI -->
    <input type="password" id="passwordEdit" /> <!-- BAGIAN INI -->
</div> <!-- BAGIAN INI -->
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

**A. Bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM"**:
```ts
const passwordTambah = document.getElementById('passwordTambah') as HTMLInputElement; // <- BAGIAN INI
const passwordEdit = document.getElementById('passwordEdit') as HTMLInputElement;     // <- BAGIAN INI
```

**B. Bagian "2. FUNGSI API"** — untuk update, password bersifat opsional (hanya dikirim jika diisi):
```ts
async function createData(p_nama: string, p_alamat: string, p_rank: string, p_password: string) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, password: p_password })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

// Untuk update, password bersifat opsional (hanya dikirim jika diisi)
async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_password: string) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${p_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, password: p_password })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}
```

**C. Bagian "3. FUNGSI UI & TAMPILAN"**:
- `renderData()`: **JANGAN** pernah menampilkan password di tabel/HTML, dan **JANGAN** taruh password di `data-attribute` tombol Edit (alasan keamanan) — tidak ada kode tambahan di sini untuk password, `renderData()` tetap sama seperti aslinya.
- `openEditModal()`: TIDAK menerima parameter password, dan field password di modal dikosongkan setiap kali modal dibuka:
```ts
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string) {
    currentEditId = p_id;
    namaEdit.value = p_nama;
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;
    passwordEdit.value = '';   // <- BAGIAN INI (selalu kosong)
    modalOverlay.classList.add('active');
}
```

**D. Bagian "4. EVENT LISTENERS UTAMA"**:
```ts
// Form Tambah
formTambah.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaTambah.value.trim();
    const alamat = alamatTambah.value.trim();
    const rank = rankTambah.value.trim();
    const password = passwordTambah.value;              // <- BAGIAN INI (jangan di-trim)
    if (!nama || !alamat || !rank || !password) {       // <- BAGIAN INI
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank, password);            // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const password = passwordEdit.value;                 // <- BAGIAN INI (boleh kosong = tidak diubah)
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, password); // <- BAGIAN INI
});
```

## 3. Backend — lokasi: `backend/src/models/playerModel.ts` & `backend/src/controllers/playerController.ts`

`models/playerModel.ts`:
```ts
import bcrypt from 'bcrypt';   // <- BAGIAN INI (perlu library hash)

export interface Player {
    id: number;
    nama: string;
    alamat: string;
    rank: string;
    password: string;   // <- BAGIAN INI (menyimpan HASH, bukan plain text)
}

// PENTING: JANGAN pakai "SELECT *" lagi setelah kolom password ditambahkan,
// supaya hash password tidak pernah ikut terkirim ke frontend lewat getAll/getById:
static async getAll(): Promise<Player[]> {                                                   // <- BAGIAN INI
    const query = 'SELECT id, nama, alamat, rank FROM player';                                // <- BAGIAN INI (password sengaja tidak di-select)
    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows as Player[];
}

static async getById(p_id: number): Promise<Player | undefined> {                            // <- BAGIAN INI
    const query = 'SELECT id, nama, alamat, rank FROM player WHERE id = ?';                   // <- BAGIAN INI
    const [rows] = await db.query<RowDataPacket[]>(query, [p_id]);
    return rows[0] as Player | undefined;
}

static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const hashed = await bcrypt.hash(p_docu.password, 10);                                       // <- BAGIAN INI
    const query = 'INSERT INTO player (nama, alamat, rank, password) VALUES (?, ?, ?, ?)';       // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, hashed]                                 // <- BAGIAN INI
    );
    return result.insertId;
}

// Saat update, password TIDAK selalu diganti — hanya kalau field-nya diisi
static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    if (p_docu.password) {                                                                        // <- BAGIAN INI
        const hashed = await bcrypt.hash(p_docu.password, 10);
        const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, password = ? WHERE id = ?';
        const [result] = await db.query<ResultSetHeader>(query, [p_docu.nama, p_docu.alamat, p_docu.rank, hashed, p_id]);
        return result.affectedRows;
    }
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ? WHERE id = ?';                 // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_id]);
    return result.affectedRows;
}
```

`controllers/playerController.ts` — project ini sudah pakai validasi **Zod** lewat `playerInputSchema`, bukan lagi `if (!nama || !password)` manual. Password butuh aturan sendiri (wajib diisi saat create, boleh kosong saat update = tidak diubah), jadi dibuat 2 skema turunan dari `playerInputSchema` yang sudah ada, pakai `.extend()`:
```ts
const passwordSchema = z                                                    // <- BAGIAN INI
    .string()                                                               // <- BAGIAN INI
    // Aturan ini SENGAJA disamakan persis dengan registerSchema di project auth
    // (redirect/backend/src/controllers/authController.ts) — supaya ada SATU standar kekuatan
    // password untuk seluruh template, bukan aturan baru yang beda-beda tiap tempat.
    .min(8, 'password minimal 8 karakter')                                  // <- BAGIAN INI
    .regex(/[A-Za-z]/, 'password harus mengandung huruf')                   // <- BAGIAN INI
    .regex(/[0-9]/, 'password harus mengandung angka');                     // <- BAGIAN INI

// .extend() membuat skema BARU berdasarkan playerInputSchema yang sudah ada (nama/alamat/rank),
// TANPA mengubah skema aslinya — playerInputSchema tetap bisa dipakai apa adanya di endpoint lain
// yang tidak butuh password (kalau ada).
const playerCreateSchema = playerInputSchema.extend({ password: passwordSchema });             // <- BAGIAN INI (wajib diisi)
// .optional() di sini membuat password BOLEH tidak dikirim sama sekali saat update — artinya
// "password tidak diubah". Tapi KALAU dikirim, tetap harus lolos semua aturan passwordSchema
// di atas (minimal 8 karakter + huruf + angka), tidak bisa asal isi sembarang string pendek.
const playerUpdateSchema = playerInputSchema.extend({ password: passwordSchema.optional() });   // <- BAGIAN INI (opsional = tidak diubah)
```
Aturan panjang minimal 8 karakter + wajib ada huruf & angka ini persis sama dengan yang dipakai `registerSchema` di project auth (`redirect/backend`) — konsisten satu standar untuk semua password di seluruh template.

Di `create()`, ganti `validatePlayerInput(p_req.body)` **menjadi** `playerCreateSchema.safeParse(p_req.body)` langsung (password wajib ada di sini, jadi tidak lewat helper generik `validatePlayerInput`):
```ts
const parsed = playerCreateSchema.safeParse(p_req.body);                     // <- BAGIAN INI (bukan validatePlayerInput lagi)
if (!parsed.success) {
    p_res.status(400).json({ success: false, message: parsed.error.issues.map((p_issue) => p_issue.message).join(', ') });
    return;
}
const { nama, alamat, rank, password } = parsed.data;                        // <- BAGIAN INI
const id = await PlayerModel.create({ nama, alamat, rank, password });       // <- BAGIAN INI
// Jangan pernah kirim balik password (walau sudah di-hash) di response!
p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank } });
```

Di `update()`, pakai `playerUpdateSchema.safeParse(p_req.body)` (password boleh tidak dikirim = tidak diubah). Perhatikan: `PlayerModel.update()` di project ini mensyaratkan `password: string` (bukan opsional), jadi kalau kosong kirim string kosong `''` — sama seperti pengecekan `if (p_docu.password)` truthy di model, string kosong dianggap "tidak diubah":
```ts
const parsed = playerUpdateSchema.safeParse(p_req.body);                     // <- BAGIAN INI
if (!parsed.success) {
    p_res.status(400).json({ success: false, message: parsed.error.issues.map((p_issue) => p_issue.message).join(', ') });
    return;
}
const { nama, alamat, rank, password } = parsed.data;                        // <- BAGIAN INI (password: string | undefined)
const affectedRows = await PlayerModel.update(id, { nama, alamat, rank, password: password ?? '' });   // <- BAGIAN INI ('' = tidak diubah)
// Jangan pernah kirim balik password di response di sini juga.
p_res.status(200).json({ success: true, message: 'Player berhasil diupdate', data: { id, nama, alamat, rank } });
```

## Status pengujian
✅ Skema Zod di atas (termasuk `.extend()` untuk password opsional saat update, dan penyesuaian tipe `password: password ?? ''` supaya cocok dengan signature `PlayerModel.update()` di variant ini) sudah dites lewat type-check gabungan (`tsc --noEmit`) memakai `tsconfig.json` backend yang sama — bersih. Belum dites end-to-end lewat request HTTP sungguhan dengan bcrypt sungguhan terpasang — tetap coba manual (Postman/curl/form) setelah diterapkan.

## Catatan keamanan
- Ini satu-satunya sample yang menyimpan data sensitif — jangan skip bagian `SELECT` eksplisit di atas, ini bukan opsional.
