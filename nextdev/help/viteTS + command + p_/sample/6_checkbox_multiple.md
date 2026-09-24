# 6. Checkbox Multiple (Array) — contoh: Hobi

Kode sumber lengkap (versi comment, siap salin): [`6_checkbox_multiple.ts`](6_checkbox_multiple.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk field yang boleh diisi lebih dari satu pilihan sekaligus (hobi, kategori, tag).

- Database MySQL: `JSON` atau `VARCHAR`/`TEXT` (disimpan sebagai teks stringify, contoh: `'["Gaming","Musik"]'`)
- Tipe TypeScript: `string[]`

## Prasyarat
```sql
ALTER TABLE player ADD COLUMN hobi TEXT NOT NULL; -- BAGIAN INI
```

## 1. HTML — lokasi: `frontend/player.html`

Pakai `name` yang SAMA untuk satu grup checkbox (bukan `id` satu-satu), di dalam `<form id="formTambah">`:
```html
<span>Hobi</span> <!-- BAGIAN INI -->
<label><input name="hobiTambah" type="checkbox" value="Gaming"> Gaming</label> <!-- BAGIAN INI -->
<label><input name="hobiTambah" type="checkbox" value="Membaca"> Membaca</label> <!-- BAGIAN INI -->
<label><input name="hobiTambah" type="checkbox" value="Olahraga"> Olahraga</label> <!-- BAGIAN INI -->
```

Di dalam `<form id="formEdit">` (modal edit):
```html
<span>Hobi</span> <!-- BAGIAN INI -->
<label><input name="hobiEdit" type="checkbox" value="Gaming"> Gaming</label> <!-- BAGIAN INI -->
<label><input name="hobiEdit" type="checkbox" value="Membaca"> Membaca</label> <!-- BAGIAN INI -->
<label><input name="hobiEdit" type="checkbox" value="Olahraga"> Olahraga</label> <!-- BAGIAN INI -->
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

Checkbox banyak pilihan TIDAK perlu deklarasi `getElementById` satu-satu. Buat 2 helper generik (fungsi baru) — taruh di dekat bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM":
```ts
function getCheckboxValues(p_name: string): string[] {   // <- BAGIAN INI (fungsi baru)
    const checkedBoxes = document.querySelectorAll(`input[name="${p_name}"]:checked`);
    return Array.from(checkedBoxes).map(p_cb => (p_cb as HTMLInputElement).value);
}

function setCheckboxValues(p_name: string, p_values: string[]): void {   // <- BAGIAN INI (fungsi baru)
    document.querySelectorAll(`input[name="${p_name}"]`).forEach(p_el => {
        (p_el as HTMLInputElement).checked = false;
    });
    p_values.forEach(p_val => {
        const cb = document.querySelector(`input[name="${p_name}"][value="${p_val}"]`) as HTMLInputElement | null;
        if (cb) cb.checked = true;
    });
}
```

**Bagian "2. FUNGSI API"**:
```ts
async function createData(p_nama: string, p_alamat: string, p_rank: string, p_hobi: string[]) {   // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, hobi: p_hobi })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_hobi: string[]) {  // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${p_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, hobi: p_hobi })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}
```

**Bagian "3. FUNGSI UI & TAMPILAN"** — di `renderData()`, tampilkan hobi dengan `.join(', ')`; `data-attribute` tidak dipakai untuk array biasa, simpan JSON string-nya saja (perhatikan kutip tunggal di atribut HTML supaya tidak bentrok dengan `"` di JSON):
```ts
<td>${p_item.hobi.join(', ')}</td>   // <- BAGIAN INI
<button class="action-btn edit-btn" ... data-hobi='${JSON.stringify(p_item.hobi)}'>Edit</button>  // <- BAGIAN INI
```

Event listener tombol Edit — parse JSON dari dataset:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, JSON.parse(target.dataset.hobi!));   // <- BAGIAN INI
```

`openEditModal()` — isi pakai `setCheckboxValues()`:
```ts
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_hobi: string[]) {  // <- BAGIAN INI
    currentEditId = p_id;
    namaEdit.value = p_nama;
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;
    setCheckboxValues('hobiEdit', p_hobi);   // <- BAGIAN INI
    modalOverlay.classList.add('active');
}
```

**Bagian "4. EVENT LISTENERS UTAMA"**:
```ts
// Form Tambah
formTambah.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaTambah.value.trim();
    const alamat = alamatTambah.value.trim();
    const rank = rankTambah.value.trim();
    const hobi = getCheckboxValues('hobiTambah');   // <- BAGIAN INI
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank, hobi);            // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const hobi = getCheckboxValues('hobiEdit');     // <- BAGIAN INI
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, hobi);   // <- BAGIAN INI
});
```

`closeEditModal()` — kosongkan checkbox juga saat modal ditutup:
```ts
function closeEditModal() {
    modalOverlay.classList.remove('active');
    currentEditId = null;
    formEdit.reset();
    setCheckboxValues('hobiEdit', []);   // <- BAGIAN INI (opsional, jaga-jaga)
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
    hobi: string[];   // <- BAGIAN INI
}

static async getAll(): Promise<Player[]> {
    const query = 'SELECT * FROM player';
    const [rows] = await db.query<RowDataPacket[]>(query);
    // hobi di database adalah JSON string '["Gaming","Musik"]', parse ke Array
    return rows.map(p_row => {                                                           // <- BAGIAN INI
        let hobiArray: string[] = [];
        try {
            hobiArray = typeof p_row.hobi === 'string' ? JSON.parse(p_row.hobi) : p_row.hobi;
        } catch {
            hobiArray = [];
        }
        return { ...p_row, hobi: hobiArray };
    }) as Player[];
}

static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, hobi) VALUES (?, ?, ?, ?)';    // <- BAGIAN INI
    const hobiString = JSON.stringify(p_docu.hobi);                                        // <- BAGIAN INI (array harus di-stringify)
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, hobiString]                       // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, hobi = ? WHERE id = ?';  // <- BAGIAN INI
    const hobiString = JSON.stringify(p_docu.hobi);                                        // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, hobiString, p_id]                 // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts`:
```ts
static async create(p_req: Request, p_res: Response): Promise<void> {
    const { nama, alamat, rank, hobi } = p_req.body as Omit<Player, 'id'>;   // <- BAGIAN INI
    if (!nama || !alamat || !rank) {
        p_res.status(400).json({ success: false, message: 'Data harus diisi' });
        return;
    }
    const id = await PlayerModel.create({ nama, alamat, rank, hobi: hobi ?? [] });   // <- BAGIAN INI
    p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, hobi } }); // <- BAGIAN INI
}
```

## Status pengujian
✅ Sudah dicoba end-to-end (frontend & backend `tsc --noEmit`) — bersih. Ini sample paling lengkap dibanding yang lain (helper generik + backend penuh).

## Catatan
- Header `<th>` dan `colspan` di `player.html` perlu disesuaikan manual.
- Kalau nilai hobi mengandung karakter kutip (`'` atau `"`), escaping HTML/JSON bisa jadi rumit — untuk kasus sederhana (opsi tetap seperti contoh) aman, tapi hati-hati kalau opsi berasal dari input bebas user.
