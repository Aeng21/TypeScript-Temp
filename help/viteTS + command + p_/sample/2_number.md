# 2. Number (Angka) — contoh: Umur

Kode sumber lengkap (versi comment, siap salin): [`2_number.ts`](2_number.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk field angka (umur, harga, jumlah). Ingat: nilai dari HTML input selalu string, jadi wajib di-`Number()`/parse dulu sebelum dipakai sebagai number.

- Database MySQL: `INT` / `BIGINT` / `DECIMAL(10,2)` (kalau ada koma/harga)
- Tipe TypeScript: `number`

## Prasyarat
```sql
ALTER TABLE player ADD COLUMN umur INT NOT NULL DEFAULT 0; -- BAGIAN INI
```

## 1. HTML — lokasi: `frontend/player.html`

Di dalam `<form id="formTambah">`:
```html
<input type="number" id="umurTambah" placeholder="Umur" min="0" required /> <!-- BAGIAN INI -->
```

Di dalam `<form id="formEdit">` (modal edit):
```html
<div class="form-group"> <!-- BAGIAN INI -->
    <label for="umurEdit">Umur</label> <!-- BAGIAN INI -->
    <input type="number" id="umurEdit" min="0" required /> <!-- BAGIAN INI -->
</div> <!-- BAGIAN INI -->
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

**A. Bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM"**:
```ts
const umurTambah = document.getElementById('umurTambah') as HTMLInputElement; // <- BAGIAN INI
const umurEdit = document.getElementById('umurEdit') as HTMLInputElement;     // <- BAGIAN INI
```

**B. Bagian "2. FUNGSI API"** — tambah parameter `umur: number`:
```ts
async function createData(p_nama: string, p_alamat: string, p_rank: string, p_umur: number) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, umur: p_umur })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_umur: number) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${p_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, umur: p_umur })    // <- BAGIAN INI
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
<td>${p_item.umur}</td>   // <- BAGIAN INI
<td>
  <button class="action-btn edit-btn" data-id="${p_item.id}" data-nama="${p_item.nama}"
      data-alamat="${p_item.alamat}" data-rank="${p_item.rank}"
      data-umur="${p_item.umur}">Edit</button>   // <- BAGIAN INI
  <button class="action-btn delete-btn" data-id="${p_item.id}">Hapus</button>
</td>
```

Event listener tombol Edit — `Number()` datanya dulu karena `dataset` selalu string:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, Number(target.dataset.umur));   // <- BAGIAN INI
```

`openEditModal()` — isi ke input edit harus di-`.toString()` dulu:
```ts
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_umur: number) { // <- BAGIAN INI
    currentEditId = p_id;
    namaEdit.value = p_nama;
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;
    umurEdit.value = p_umur.toString();   // <- BAGIAN INI
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
    const umur = Number(umurTambah.value);              // <- BAGIAN INI (.value string harus di-parse)
    if (!nama || !alamat || !rank || isNaN(umur)) {     // <- BAGIAN INI
        alert('Semua field harus diisi dengan benar!');
        return;
    }
    createData(nama, alamat, rank, umur);                // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const umur = Number(umurEdit.value);                 // <- BAGIAN INI
    if (!nama || !alamat || !rank || isNaN(umur)) {     // <- BAGIAN INI
        alert('Semua field harus diisi dengan benar!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, umur); // <- BAGIAN INI
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
    umur: number;   // <- BAGIAN INI
}

static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, umur) VALUES (?, ?, ?, ?)';   // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.umur]   // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, umur = ? WHERE id = ?';   // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.umur, p_id]   // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts`:
```ts
static async create(p_req: Request, p_res: Response): Promise<void> {
    const { nama, alamat, rank, umur } = p_req.body as Omit<Player, 'id'>;    // <- BAGIAN INI
    if (!nama || !alamat || !rank || umur === undefined) {                  // <- BAGIAN INI
        p_res.status(400).json({ success: false, message: 'Data harus diisi' });
        return;
    }
    const id = await PlayerModel.create({ nama, alamat, rank, umur });      // <- BAGIAN INI
    p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, umur } }); // <- BAGIAN INI
}

static async update(p_req: Request, p_res: Response): Promise<void> {
    const { nama, alamat, rank, umur } = p_req.body as Omit<Player, 'id'>;    // <- BAGIAN INI
    // ...validasi & pemanggilan PlayerModel.update sama pola-nya seperti create
}
```

## Status pengujian
✅ Sudah dicoba end-to-end (frontend & backend `tsc --noEmit`) — bersih.

## Catatan
- Header `<th>Umur</th>` dan `colspan` pada baris "Belum ada data" di `player.html` perlu disesuaikan manual, sample tidak menyebutkannya.
- Validasi `isNaN(umur)` penting — kalau field dikosongkan, `Number('')` menghasilkan `0` (bukan `NaN`), jadi kombinasikan dengan atribut `required` di HTML supaya user tidak bisa submit kosong.
