# 4. Radio Button — contoh: Jenis Kelamin

Kode sumber lengkap (versi comment, siap salin): [`4_radio.ts`](4_radio.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk memilih SATU pilihan dari beberapa opsi tetap (jenis kelamin, dsb). Beda dengan checkbox single ([[5_checkbox_single]]): radio dipakai kalau opsinya lebih dari sekadar boolean, atau kamu ingin dua opsi eksplisit alih-alih satu checkbox.

- Database MySQL: `ENUM('L','P')` atau `VARCHAR(10)`
- Tipe TypeScript: `string` (`'L' | 'P'`)

## Prasyarat
```sql
ALTER TABLE player ADD COLUMN jenisKelamin VARCHAR(10) NOT NULL DEFAULT ''; -- BAGIAN INI
```

## 1. HTML — lokasi: `frontend/player.html`

Radio pakai atribut `name` (bukan `id`) supaya satu grup radio saling eksklusif. Di dalam `<form id="formTambah">`:
```html
<span>Jenis Kelamin</span> <!-- BAGIAN INI -->
<label>Pria <!-- BAGIAN INI -->
    <input name="jenkelTambah" type="radio" value="pria" required> <!-- BAGIAN INI -->
</label>
<label>Wanita <!-- BAGIAN INI -->
    <input name="jenkelTambah" type="radio" value="wanita" required> <!-- BAGIAN INI -->
</label>
```

Di dalam `<form id="formEdit">` (modal edit):
```html
<span>Jenis Kelamin</span> <!-- BAGIAN INI -->
<label>Pria <!-- BAGIAN INI -->
    <input type="radio" name="jenkelEdit" value="pria" required /> <!-- BAGIAN INI -->
</label>
<label>Wanita <!-- BAGIAN INI -->
    <input type="radio" name="jenkelEdit" value="wanita" required /> <!-- BAGIAN INI -->
</label>
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

Buat helper `getRadioValue` — taruh di dekat bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM" (seluruh fungsi ini baru):
```ts
function getRadioValue(p_name: string): string {   // <- BAGIAN INI (fungsi baru)
    const checked = document.querySelector(`input[name="${p_name}"]:checked`) as HTMLInputElement | null;
    return checked ? checked.value : '';
}
```

`openEditModal()` — tambah parameter `jenkel`, cari radio yang cocok lalu checklist (dengan null-check, jaga-jaga value tidak cocok opsi manapun):
```ts
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_jenkel: string) { // <- BAGIAN INI
    currentEditId = p_id;
    namaEdit.value = p_nama;
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;

    const radio = document.querySelector(                            // <- BAGIAN INI
        `input[name="jenkelEdit"][value="${p_jenkel}"]`               // <- BAGIAN INI
    ) as HTMLInputElement | null;                                    // <- BAGIAN INI

    if (radio) radio.checked = true;                                 // <- BAGIAN INI (null-check, jaga-jaga value tidak cocok opsi manapun)

    modalOverlay.classList.add('active');
}
```

**⚠️ PENTING — 2 tempat ini WAJIB ikut diubah**, kalau tidak `openEditModal()` di atas akan dipanggil dengan `jenkel = undefined` (radio di modal edit tidak akan ter-checklist saat kamu klik Edit):

Di `renderData()`, bawa datanya lewat `data-attribute` di tombol Edit:
```ts
<button class="action-btn edit-btn" data-id="${p_item.id}" data-nama="${p_item.nama}"
    data-alamat="${p_item.alamat}" data-rank="${p_item.rank}"
    data-jenkel="${p_item.jenisKelamin}">Edit</button>   // <- BAGIAN INI
```

Di event listener tombol Edit, teruskan ke `openEditModal`:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, target.dataset.jenkel!);   // <- BAGIAN INI (argumen jenkel ditambahkan)
```

**Bagian "4. EVENT LISTENERS UTAMA"** — panggil `getRadioValue` sesuai `name` di HTML:
```ts
// Form Tambah
formTambah.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaTambah.value.trim();
    const alamat = alamatTambah.value.trim();
    const rank = rankTambah.value.trim();
    const jenisKelamin = getRadioValue('jenkelTambah');              // <- BAGIAN INI

    if (!nama || !alamat || !rank || !jenisKelamin) {                // <- BAGIAN INI
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank, jenisKelamin);                     // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const jenisKelamin = getRadioValue('jenkelEdit');                // <- BAGIAN INI

    if (!nama || !alamat || !rank || !jenisKelamin) {                // <- BAGIAN INI
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, jenisKelamin);     // <- BAGIAN INI
});
```

Dan tambahkan parameter `jenisKelamin` di `createData`/`updateData` (bagian "2. FUNGSI API"):
```ts
async function createData(p_nama: string, p_alamat: string, p_rank: string, p_jenisKelamin: string) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, jenisKelamin: p_jenisKelamin })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_jenisKelamin: string) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${p_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, jenisKelamin: p_jenisKelamin })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}
```

## 3. Backend — lokasi: `backend/src/models/playerModel.ts` & `backend/src/controllers/playerController.ts`

`models/playerModel.ts`:
```ts
export interface Player {
    id: number;
    nama: string;
    alamat: string;
    rank: string;
    jenisKelamin: string;   // <- BAGIAN INI
}

static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, jenisKelamin) VALUES (?, ?, ?, ?)';           // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.jenisKelamin]                             // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, jenisKelamin = ? WHERE id = ?';     // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.jenisKelamin, p_id]                      // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts` — project ini sudah pakai validasi **Zod** lewat `playerInputSchema`, bukan lagi `if (!jenisKelamin)` manual. Karena opsinya cuma 2 nilai tetap (sesuai HTML: `'pria'`/`'wanita'`), pakai `z.enum` supaya nilai lain (misal dikirim langsung lewat Postman tanpa lewat form) otomatis ditolak:
```ts
const playerInputSchema = z.object({
  nama: z.string().trim().min(1, 'nama tidak boleh kosong').max(100, 'nama maksimal 100 karakter'),
  alamat: z.string().trim().min(1, 'alamat tidak boleh kosong').max(100, 'alamat maksimal 100 karakter'),
  rank: z.string().trim().min(1, 'rank tidak boleh kosong').max(100, 'rank maksimal 100 karakter'),
  // z.enum HANYA menerima nilai yang ada di daftar ('pria'/'wanita', sesuai value radio di HTML).
  // Kalau field ini pakai z.string() biasa (seperti validasi lama "if (!jenisKelamin)"), seseorang
  // yang mengirim request langsung tanpa lewat form (misal lewat Postman/curl) bisa mengisi nilai
  // apa saja, mis. "alien", dan tetap lolos karena stringnya "ada isinya".
  jenisKelamin: z.enum(['pria', 'wanita'], { message: 'jenis kelamin harus pria atau wanita' }), // <- BAGIAN INI
});
```

`validatePlayerInput()` sendiri TIDAK perlu diubah. Di `create()` dan `update()`, tinggal tambahkan `jenisKelamin` ke destructuring `validasi.data`, ke pemanggilan `PlayerModel.create`/`update`, dan ke response `data`:
```ts
const { nama, alamat, rank, jenisKelamin } = validasi.data;                                                                        // <- BAGIAN INI
const id = await PlayerModel.create({ nama, alamat, rank, jenisKelamin });                                                         // <- BAGIAN INI
p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, jenisKelamin } }); // <- BAGIAN INI
```
Lakukan hal yang sama di dalam `update()`.

## Status pengujian
✅ Skema Zod di atas sudah dites lewat type-check gabungan (`tsc --noEmit`) memakai `tsconfig.json` backend yang sama — sintaksnya valid untuk Zod v4 dan cocok dengan pola `playerInputSchema`/`validatePlayerInput()` yang sudah ada di `backend/src/controllers/playerController.ts`. Belum dites end-to-end lewat request HTTP sungguhan — tetap coba manual (Postman/curl/form) setelah diterapkan.

## Riwayat bug yang sudah diperbaiki
Versi sebelumnya dari sample ini **lupa** menyebutkan 2 poin yang ditandai ⚠️ PENTING di atas. Kalau itu kelewat: dengan TypeScript strict, akan muncul error `Expected 5 arguments, but got 4` di pemanggilan `openEditModal()` — tapi kalau dijalankan sebagai JavaScript longgar (tanpa type-check ketat), aplikasinya tetap jalan tanpa error, hanya saja `jenkel` diterima `undefined` sehingga radio di modal edit **diam-diam tidak ter-checklist otomatis** saat tombol Edit diklik. Sudah diperbaiki di `4_radio.ts` — pastikan kedua bagian itu ikut disalin.

## Catatan lain
- Sample ini tidak menampilkan kolom Jenis Kelamin di tabel (`renderData()` tidak menambah `<td>` untuk itu) — kalau kamu mau menampilkannya juga, tambahkan sendiri `<td>${p_item.jenisKelamin}</td>` dan header `<th>` yang sesuai.
