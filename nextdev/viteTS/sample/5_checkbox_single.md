# 5. Checkbox Single (Boolean) — contoh: Status Aktif

Kode sumber lengkap (versi comment, siap salin): [`5_checkbox_single.ts`](5_checkbox_single.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk field ya/tidak sederhana (aktif/nonaktif, langganan/tidak). Kalau pilihannya lebih dari 2 makna atau butuh label eksplisit tiap opsi, pertimbangkan radio ([[4_radio]]) sebagai gantinya.

- Database MySQL: `TINYINT(1)` (1 = true, 0 = false)
- Tipe TypeScript: `boolean`

## Prasyarat
```sql
ALTER TABLE player ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1; -- BAGIAN INI
```

## 1. HTML — lokasi: `frontend/player.html`

Di dalam `<form id="formTambah">`:
```html
<label><input type="checkbox" id="isActiveTambah"> Aktif</label> <!-- BAGIAN INI -->
```

Di dalam `<form id="formEdit">` (modal edit):
```html
<div class="form-group"> <!-- BAGIAN INI -->
    <label><input type="checkbox" id="isActiveEdit"> Aktif</label> <!-- BAGIAN INI -->
</div> <!-- BAGIAN INI -->
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

**A. Bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM"**:
```ts
const isActiveTambah = document.getElementById('isActiveTambah') as HTMLInputElement; // <- BAGIAN INI
const isActiveEdit = document.getElementById('isActiveEdit') as HTMLInputElement;     // <- BAGIAN INI
```

**B. Bagian "2. FUNGSI API"**:
```ts
async function createData(nama: string, alamat: string, rank: string, isActive: boolean) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, alamat, rank, isActive })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(id: string, nama: string, alamat: string, rank: string, isActive: boolean) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, alamat, rank, isActive })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}
```

**C. Bagian "3. FUNGSI UI & TAMPILAN"** — di `renderData()`, `data-attribute` selalu string, jadi disimpan sebagai `"true"`/`"false"`:
```ts
<td>${item.id}</td>
<td>${item.nama}</td>
<td>${item.alamat}</td>
<td>${item.rank}</td>
<td>${item.isActive ? 'Aktif' : 'Nonaktif'}</td>   // <- BAGIAN INI
<td>
  <button class="action-btn edit-btn" data-id="${item.id}" data-nama="${item.nama}"
      data-alamat="${item.alamat}" data-rank="${item.rank}"
      data-isactive="${item.isActive}">Edit</button>   // <- BAGIAN INI
  <button class="action-btn delete-btn" data-id="${item.id}">Hapus</button>
</td>
```

Event listener tombol Edit — ubah string `"true"`/`"false"` balik jadi boolean:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, target.dataset.isactive === 'true');   // <- BAGIAN INI
```

`openEditModal()` — isi lewat `.checked` (bukan `.value`):
```ts
function openEditModal(id: string, nama: string, alamat: string, rank: string, isActive: boolean) { // <- BAGIAN INI
    currentEditId = id;
    namaEdit.value = nama;
    alamatEdit.value = alamat;
    rankEdit.value = rank;
    isActiveEdit.checked = isActive;   // <- BAGIAN INI
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
    const isActive = isActiveTambah.checked;   // <- BAGIAN INI (.checked, bukan .value)
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank, isActive);   // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const isActive = isActiveEdit.checked;      // <- BAGIAN INI
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, isActive);   // <- BAGIAN INI
});
```

`form.reset()` tidak selalu konsisten meng-uncheck checkbox — reset manual kalau perlu jaga-jaga (opsional, taruh di `closeEditModal()` / setelah `formTambah.reset()`):
```ts
isActiveTambah.checked = false;   // <- BAGIAN INI (opsional, jaga-jaga)
```

## 3. Backend — lokasi: `backend/src/models/playerModel.ts` & `backend/src/controllers/playerController.ts`

`models/playerModel.ts`:
```ts
export interface Player {
    id: number;
    nama: string;
    alamat: string;
    rank: string;
    isActive: boolean;   // <- BAGIAN INI
}

static async getAll(): Promise<Player[]> {
    const query = 'SELECT * FROM player';
    const [rows] = await db.query<RowDataPacket[]>(query);
    // MySQL TINYINT(1) balik sebagai 1/0, parse ke boolean asli
    return rows.map(row => ({ ...row, isActive: row.isActive === 1 })) as Player[];   // <- BAGIAN INI
}

static async create(data: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, isActive) VALUES (?, ?, ?, ?)';   // <- BAGIAN INI
    // boolean dikirim langsung, mysql2 otomatis ubah jadi 1/0
    const [result] = await db.query<ResultSetHeader>(
        query, [data.nama, data.alamat, data.rank, data.isActive]   // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(id: number, data: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, isActive = ? WHERE id = ?';  // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [data.nama, data.alamat, data.rank, data.isActive, id]   // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts`:
```ts
static async create(req: Request, res: Response): Promise<void> {
    const { nama, alamat, rank, isActive } = req.body as Omit<Player, 'id'>;   // <- BAGIAN INI
    if (!nama || !alamat || !rank) {
        res.status(400).json({ success: false, message: 'Data harus diisi' });
        return;
    }
    const id = await PlayerModel.create({ nama, alamat, rank, isActive: !!isActive });   // <- BAGIAN INI
    res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, isActive } }); // <- BAGIAN INI
}
```

## Status pengujian
✅ Sudah dicoba end-to-end (frontend & backend `tsc --noEmit`) — bersih.

## Catatan
- Header `<th>` dan `colspan` di `player.html` perlu disesuaikan manual seperti sample lain yang menambah kolom.
