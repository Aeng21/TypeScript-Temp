# 7. Select / Dropdown — contoh: Kota

Kode sumber lengkap (versi comment, siap salin): [`7_select_dropdown.ts`](7_select_dropdown.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk pilihan tunggal dari daftar opsi yang cukup panjang (kota, provinsi, kategori) — kalau opsinya cuma 2-3, radio ([[4_radio]]) biasanya lebih cepat diklik.

- Database MySQL: `VARCHAR(50)` atau `ENUM`
- Tipe TypeScript: `string`

## Prasyarat
```sql
ALTER TABLE player ADD COLUMN kota VARCHAR(50) NOT NULL DEFAULT ''; -- BAGIAN INI
```

## 1. HTML — lokasi: `frontend/player.html`

Di dalam `<form id="formTambah">` — dengan opsi placeholder `disabled selected` di paling atas:
```html
<select id="kotaTambah" required> <!-- BAGIAN INI -->
    <option value="" disabled selected>-- Pilih Kota --</option> <!-- BAGIAN INI -->
    <option value="Jakarta">Jakarta</option> <!-- BAGIAN INI -->
    <option value="Bandung">Bandung</option> <!-- BAGIAN INI -->
    <option value="Surabaya">Surabaya</option> <!-- BAGIAN INI -->
</select> <!-- BAGIAN INI -->
```

Di dalam `<form id="formEdit">` (modal edit) — tanpa placeholder, karena selalu diisi ulang lewat TS:
```html
<div class="form-group"> <!-- BAGIAN INI -->
    <label for="kotaEdit">Kota</label> <!-- BAGIAN INI -->
    <select id="kotaEdit" required> <!-- BAGIAN INI -->
        <option value="Jakarta">Jakarta</option> <!-- BAGIAN INI -->
        <option value="Bandung">Bandung</option> <!-- BAGIAN INI -->
        <option value="Surabaya">Surabaya</option> <!-- BAGIAN INI -->
    </select> <!-- BAGIAN INI -->
</div> <!-- BAGIAN INI -->
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

**A. Bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM"** — perhatikan tipe `HTMLSelectElement`, bukan `HTMLInputElement`:
```ts
const kotaTambah = document.getElementById('kotaTambah') as HTMLSelectElement; // <- BAGIAN INI
const kotaEdit = document.getElementById('kotaEdit') as HTMLSelectElement;     // <- BAGIAN INI
```

**B. Bagian "2. FUNGSI API"**:
```ts
async function createData(p_nama: string, p_alamat: string, p_rank: string, p_kota: string) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, kota: p_kota })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_kota: string) {  // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${p_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, kota: p_kota })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}
```

**C. Bagian "3. FUNGSI UI & TAMPILAN"** — di `renderData()`:
```ts
<td>${p_index + 1}</td>
<td>${p_item.nama}</td>
<td>${p_item.alamat}</td>
<td>${p_item.rank}</td>
<td>${p_item.kota}</td>   // <- BAGIAN INI
<td>
  <button class="action-btn edit-btn" data-id="${p_item.id}" data-nama="${p_item.nama}"
      data-alamat="${p_item.alamat}" data-rank="${p_item.rank}"
      data-kota="${p_item.kota}">Edit</button>   // <- BAGIAN INI
  <button class="action-btn delete-btn" data-id="${p_item.id}">Hapus</button>
</td>
```

Event listener tombol Edit:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, target.dataset.kota!);   // <- BAGIAN INI
```

`openEditModal()` — perlakuannya sama seperti input teks biasa (pakai `.value`):
```ts
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_kota: string) {  // <- BAGIAN INI
    currentEditId = p_id;
    namaEdit.value = p_nama;
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;
    kotaEdit.value = p_kota;   // <- BAGIAN INI
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
    const kota = kotaTambah.value;                     // <- BAGIAN INI
    if (!nama || !alamat || !rank || !kota) {          // <- BAGIAN INI
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank, kota);               // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const kota = kotaEdit.value;                        // <- BAGIAN INI
    if (!nama || !alamat || !rank || !kota) {          // <- BAGIAN INI
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, kota); // <- BAGIAN INI
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
    kota: string;   // <- BAGIAN INI
}

static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, kota) VALUES (?, ?, ?, ?)';    // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.kota]   // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, kota = ? WHERE id = ?';  // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.kota, p_id]   // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts`:
```ts
static async create(p_req: Request, p_res: Response): Promise<void> {
    const { nama, alamat, rank, kota } = p_req.body as Omit<Player, 'id'>;   // <- BAGIAN INI
    if (!nama || !alamat || !rank || !kota) {                             // <- BAGIAN INI
        p_res.status(400).json({ success: false, message: 'Data harus diisi' });
        return;
    }
    const id = await PlayerModel.create({ nama, alamat, rank, kota });     // <- BAGIAN INI
    p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, kota } }); // <- BAGIAN INI
}
```

## Status pengujian
✅ Sudah dicoba end-to-end (frontend & backend `tsc --noEmit`) — bersih.

## Catatan
- Header `<th>` dan `colspan` di `player.html` perlu disesuaikan manual seperti sample lain yang menambah kolom.
- Kalau daftar kota akan sering berubah, pertimbangkan ambil opsi dari API/database alih-alih hardcode di HTML.
