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
function getRadioValue(name: string): string {   // <- BAGIAN INI (fungsi baru)
    const checked = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
    return checked ? checked.value : '';
}
```

`openEditModal()` — tambah parameter `jenkel`, cari radio yang cocok lalu checklist (dengan null-check, jaga-jaga value tidak cocok opsi manapun):
```ts
function openEditModal(id: string, nama: string, alamat: string, rank: string, jenkel: string) { // <- BAGIAN INI
    currentEditId = id;
    namaEdit.value = nama;
    alamatEdit.value = alamat;
    rankEdit.value = rank;

    const radio = document.querySelector(                            // <- BAGIAN INI
        `input[name="jenkelEdit"][value="${jenkel}"]`                // <- BAGIAN INI
    ) as HTMLInputElement | null;                                    // <- BAGIAN INI

    if (radio) radio.checked = true;                                 // <- BAGIAN INI (null-check, jaga-jaga value tidak cocok opsi manapun)

    modalOverlay.classList.add('active');
}
```

**⚠️ PENTING — 2 tempat ini WAJIB ikut diubah**, kalau tidak `openEditModal()` di atas akan dipanggil dengan `jenkel = undefined` (radio di modal edit tidak akan ter-checklist saat kamu klik Edit):

Di `renderData()`, bawa datanya lewat `data-attribute` di tombol Edit:
```ts
<button class="action-btn edit-btn" data-id="${item.id}" data-nama="${item.nama}"
    data-alamat="${item.alamat}" data-rank="${item.rank}"
    data-jenkel="${item.jenisKelamin}">Edit</button>   // <- BAGIAN INI
```

Di event listener tombol Edit, teruskan ke `openEditModal`:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, target.dataset.jenkel!);   // <- BAGIAN INI (argumen jenkel ditambahkan)
```

**Bagian "4. EVENT LISTENERS UTAMA"** — panggil `getRadioValue` sesuai `name` di HTML:
```ts
// Form Tambah
formTambah.addEventListener('submit', (e) => {
    e.preventDefault();
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
formEdit.addEventListener('submit', (e) => {
    e.preventDefault();
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
async function createData(nama: string, alamat: string, rank: string, jenisKelamin: string) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, alamat, rank, jenisKelamin })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(id: string, nama: string, alamat: string, rank: string, jenisKelamin: string) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, alamat, rank, jenisKelamin })   // <- BAGIAN INI
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

static async create(data: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, jenisKelamin) VALUES (?, ?, ?, ?)';           // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [data.nama, data.alamat, data.rank, data.jenisKelamin]                                    // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(id: number, data: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, jenisKelamin = ? WHERE id = ?';     // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [data.nama, data.alamat, data.rank, data.jenisKelamin, id]                                // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts`:
```ts
static async create(req: Request, res: Response): Promise<void> {
    const { nama, alamat, rank, jenisKelamin } = req.body as Omit<Player, 'id'>;   // <- BAGIAN INI
    if (!nama || !alamat || !rank || !jenisKelamin) {                             // <- BAGIAN INI
        res.status(400).json({ success: false, message: 'Data harus diisi' });
        return;
    }
    const id = await PlayerModel.create({ nama, alamat, rank, jenisKelamin });     // <- BAGIAN INI
    res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, jenisKelamin } }); // <- BAGIAN INI
}
```

## Status pengujian
✅ Sudah diperbaiki dan diverifikasi ulang — `tsc --noEmit` frontend & backend bersih.

## Riwayat bug yang sudah diperbaiki
Versi sebelumnya dari sample ini **lupa** menyebutkan 2 poin yang ditandai ⚠️ PENTING di atas. Kalau itu kelewat: dengan TypeScript strict, akan muncul error `Expected 5 arguments, but got 4` di pemanggilan `openEditModal()` — tapi kalau dijalankan sebagai JavaScript longgar (tanpa type-check ketat), aplikasinya tetap jalan tanpa error, hanya saja `jenkel` diterima `undefined` sehingga radio di modal edit **diam-diam tidak ter-checklist otomatis** saat tombol Edit diklik. Sudah diperbaiki di `4_radio.ts` — pastikan kedua bagian itu ikut disalin.

## Catatan lain
- Sample ini tidak menampilkan kolom Jenis Kelamin di tabel (`renderData()` tidak menambah `<td>` untuk itu) — kalau kamu mau menampilkannya juga, tambahkan sendiri `<td>${item.jenisKelamin}</td>` dan header `<th>` yang sesuai.
