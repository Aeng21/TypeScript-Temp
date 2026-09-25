# 1. Text (String) — contoh: Email

Kode sumber lengkap (versi comment, siap salin): [`1_text.ts`](1_text.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks supaya kamu tahu di mana harus menaruh baris barunya — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk field teks bebas satu baris (email, username, dll). Cocok untuk hampir semua data string tanpa aturan format ketat.

- Database MySQL: `VARCHAR(255)`
- Tipe TypeScript: `string`

## Prasyarat
Jalankan dulu di MySQL (kolom tidak otomatis ada):
```sql
ALTER TABLE player ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT ''; -- BAGIAN INI
```

## 1. HTML — lokasi: `frontend/player.html`

Di dalam `<form id="formTambah">`:
```html
<input type="text" id="emailTambah" placeholder="Email" required /> <!-- BAGIAN INI -->
```

Di dalam `<form id="formEdit">` (modal edit):
```html
<div class="form-group"> <!-- BAGIAN INI -->
    <label for="emailEdit">Email</label> <!-- BAGIAN INI -->
    <input type="text" id="emailEdit" required /> <!-- BAGIAN INI -->
</div> <!-- BAGIAN INI -->
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

**A. Bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM"** — tambahkan deklarasi:
```ts
const emailTambah = document.getElementById('emailTambah') as HTMLInputElement; // <- BAGIAN INI
const emailEdit = document.getElementById('emailEdit') as HTMLInputElement;     // <- BAGIAN INI
```

**B. Bagian "2. FUNGSI API"** — tambah parameter `email` di `createData` & `updateData` (baris lain di dalam fungsi tetap sama seperti aslinya):
```ts
async function createData(p_nama: string, p_alamat: string, p_rank: string, p_email: string) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, email: p_email })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_email: string) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${p_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, email: p_email })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}
```

**C. Bagian "3. FUNGSI UI & TAMPILAN"** — di dalam `renderData()`, tampilkan kolom baru & bawa datanya di tombol Edit:
```ts
<td>${p_index + 1}</td>
<td>${p_item.nama}</td>
<td>${p_item.alamat}</td>
<td>${p_item.rank}</td>
<td>${p_item.email}</td>   // <- BAGIAN INI
<td>
  <button class="action-btn edit-btn" data-id="${p_item.id}" data-nama="${p_item.nama}"
      data-alamat="${p_item.alamat}" data-rank="${p_item.rank}"
      data-email="${p_item.email}">Edit</button>   // <- BAGIAN INI
  <button class="action-btn delete-btn" data-id="${p_item.id}">Hapus</button>
</td>
```

Event listener tombol Edit, teruskan datanya ke `openEditModal`:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, target.dataset.email!);   // <- BAGIAN INI (argumen email ditambahkan)
```

`openEditModal()` — tambahkan parameter & isi ke input edit:
```ts
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_email: string) { // <- BAGIAN INI
    currentEditId = p_id;
    namaEdit.value = p_nama;
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;
    emailEdit.value = p_email;   // <- BAGIAN INI
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
    const email = emailTambah.value.trim();          // <- BAGIAN INI
    if (!nama || !alamat || !rank || !email) {        // <- BAGIAN INI (tambah !email)
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank, email);            // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const email = emailEdit.value.trim();             // <- BAGIAN INI
    if (!nama || !alamat || !rank || !email) {        // <- BAGIAN INI (tambah !email)
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, email); // <- BAGIAN INI
});
```

## 3. Backend — lokasi: `backend/src/models/playerModel.ts` & `backend/src/controllers/playerController.ts`

`models/playerModel.ts`:
```ts
export interface Player {
    id: number;
    nama: string;
    alamat: string;
    rank: string;
    email: string;   // <- BAGIAN INI
}

static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, email) VALUES (?, ?, ?, ?)';   // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.email]   // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, email = ? WHERE id = ?';   // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.email, p_id]   // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts` — project ini sudah pakai validasi **Zod** lewat skema `playerInputSchema` + helper `validatePlayerInput()`, bukan lagi `if (!nama || ...)` manual. Cukup tambah field baru ke skema yang sudah ada:
```ts
const playerInputSchema = z.object({
  nama: z.string().trim().min(1, 'nama tidak boleh kosong').max(100, 'nama maksimal 100 karakter'),
  alamat: z.string().trim().min(1, 'alamat tidak boleh kosong').max(100, 'alamat maksimal 100 karakter'),
  rank: z.string().trim().min(1, 'rank tidak boleh kosong').max(100, 'rank maksimal 100 karakter'),
  // .email() bawaan Zod mengecek format alamat email (harus ada "@" dan domain yang wajar) —
  // menolak string sembarangan yang lolos validasi teks biasa tapi jelas bukan email.
  // .max(255) sengaja disamakan dengan tipe kolom VARCHAR(255) di database (lihat ALTER TABLE
  // di atas), supaya email kepanjangan ditolak DI SINI dengan pesan jelas, bukan dipotong diam-diam
  // atau bikin query gagal di MySQL.
  email: z.string().trim().min(1, 'email tidak boleh kosong').max(255, 'email maksimal 255 karakter').email('format email tidak valid'), // <- BAGIAN INI
});
```

`validatePlayerInput()` sendiri TIDAK perlu diubah (dia otomatis ikut memvalidasi field apa pun yang ada di `playerInputSchema`). Di `create()` dan `update()`, tinggal tambahkan `email` ke destructuring `validasi.data`, ke pemanggilan `PlayerModel.create`/`update`, dan ke response `data`:
```ts
const { nama, alamat, rank, email } = validasi.data;                                                                        // <- BAGIAN INI
const id = await PlayerModel.create({ nama, alamat, rank, email });                                                         // <- BAGIAN INI
p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, email } }); // <- BAGIAN INI
```
Lakukan hal yang sama (tambah `email` ke `validasi.data`, ke `PlayerModel.update`, dan ke response) di dalam `update()`.

## Status pengujian
✅ Skema Zod di atas sudah dites lewat type-check gabungan (`tsc --noEmit`) memakai `tsconfig.json` backend yang sama — sintaksnya valid untuk Zod v4 dan cocok dengan pola `playerInputSchema`/`validatePlayerInput()` yang sudah ada di `backend/src/controllers/playerController.ts`. Belum dites end-to-end lewat request HTTP sungguhan — tetap coba manual (Postman/curl/form) setelah diterapkan.

## Catatan
- Sample ini menambah kolom baru di tabel, tapi tidak menyebutkan penyesuaian `<th>Email</th>` di header tabel (`frontend/player.html`) maupun `colspan="5"` pada baris "Belum ada data" di `renderData()`. Ubah manual jadi `colspan="6"` dan tambah header kolom supaya tabel tetap rapi.
