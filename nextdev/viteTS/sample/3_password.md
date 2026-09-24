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
async function createData(nama: string, alamat: string, rank: string, password: string) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, alamat, rank, password })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

// Untuk update, password bersifat opsional (hanya dikirim jika diisi)
async function updateData(id: string, nama: string, alamat: string, rank: string, password: string) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, alamat, rank, password })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}
```

**C. Bagian "3. FUNGSI UI & TAMPILAN"**:
- `renderData()`: **JANGAN** pernah menampilkan password di tabel/HTML, dan **JANGAN** taruh password di `data-attribute` tombol Edit (alasan keamanan) — tidak ada kode tambahan di sini untuk password, `renderData()` tetap sama seperti aslinya.
- `openEditModal()`: TIDAK menerima parameter password, dan field password di modal dikosongkan setiap kali modal dibuka:
```ts
function openEditModal(id: string, nama: string, alamat: string, rank: string) {
    currentEditId = id;
    namaEdit.value = nama;
    alamatEdit.value = alamat;
    rankEdit.value = rank;
    passwordEdit.value = '';   // <- BAGIAN INI (selalu kosong)
    modalOverlay.classList.add('active');
}
```

**D. Bagian "4. EVENT LISTENERS UTAMA"**:
```ts
// Form Tambah
formTambah.addEventListener('submit', (e) => {
    e.preventDefault();
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
formEdit.addEventListener('submit', (e) => {
    e.preventDefault();
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

static async getById(id: number): Promise<Player | undefined> {                              // <- BAGIAN INI
    const query = 'SELECT id, nama, alamat, rank FROM player WHERE id = ?';                   // <- BAGIAN INI
    const [rows] = await db.query<RowDataPacket[]>(query, [id]);
    return rows[0] as Player | undefined;
}

static async create(data: Omit<Player, 'id'>): Promise<number> {
    const hashed = await bcrypt.hash(data.password, 10);                                        // <- BAGIAN INI
    const query = 'INSERT INTO player (nama, alamat, rank, password) VALUES (?, ?, ?, ?)';       // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [data.nama, data.alamat, data.rank, hashed]                                       // <- BAGIAN INI
    );
    return result.insertId;
}

// Saat update, password TIDAK selalu diganti — hanya kalau field-nya diisi
static async update(id: number, data: Omit<Player, 'id' | 'password'> & { password?: string }): Promise<number>
{                                                                          // <- BAGIAN INI
        const hashed = await bcrypt.hash(data.password, 10);
        const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, password = ? WHERE id = ?';
        const [result] = await db.query<ResultSetHeader>(query, [data.nama, data.alamat, data.rank, hashed, id]);
        return result.affectedRows;
    }
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ? WHERE id = ?';                 // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(query, [data.nama, data.alamat, data.rank, id]);
    return result.affectedRows;
}
```

`controllers/playerController.ts`:
```ts
static async create(req: Request, res: Response): Promise<void> {
    const { nama, alamat, rank, password } = req.body as Omit<Player, 'id'>;   // <- BAGIAN INI
    if (!nama || !alamat || !rank || !password) {                              // <- BAGIAN INI
        res.status(400).json({ success: false, message: 'Data harus diisi' });
        return;
    }
    const id = await PlayerModel.create({ nama, alamat, rank, password });      // <- BAGIAN INI
    // Jangan pernah kirim balik password (walau sudah di-hash) di response!
    res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank } });
}
```

## Status pengujian
✅ Sudah dicoba end-to-end di salinan project terisolasi (bcrypt di-install khusus untuk pengujian, `tsc --noEmit` backend bersih).

## Catatan keamanan
- Ini satu-satunya sample yang menyimpan data sensitif — jangan skip bagian `SELECT` eksplisit di atas, ini bukan opsional.
