# 8. Date / Tanggal — contoh: Tanggal Lahir

Kode sumber lengkap (versi comment, siap salin): [`8_date.ts`](8_date.ts)

> Baris yang ditandai `// <- BAGIAN INI` (atau `<!-- BAGIAN INI -->` untuk HTML, `-- BAGIAN INI` untuk SQL) adalah baris yang baru ditambahkan/diubah. Baris lain di sekitarnya adalah kode yang sudah ada, ditampilkan sebagai konteks — bisa disalin semua sekaligus, atau cukup baris yang ditandai saja.

## Kapan dipakai
Untuk field tanggal (tanggal lahir, tanggal bergabung). `<input type="date">` selalu mengembalikan/menerima string format `'YYYY-MM-DD'`.

- Database MySQL: `DATE` (format `'YYYY-MM-DD'`)
- Tipe TypeScript: `string`

## Prasyarat
1. Jalankan di MySQL:
   ```sql
   ALTER TABLE player ADD COLUMN tanggalLahir DATE NOT NULL; -- BAGIAN INI
   ```
2. **WAJIB** edit `backend/src/config/database.ts` (file ini di luar folder sample, ubah manual), tambahkan `dateStrings: true` di `mysql.createPool({ ... })`:
   ```ts
   const pool = mysql.createPool({
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME,
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
     dateStrings: true,   // <- BAGIAN INI (atau dateStrings: ['DATE'])
   });
   ```

## Kenapa `dateStrings: true` wajib
Tanpa opsi ini, kolom `DATE` dari MySQL dikembalikan sebagai objek `Date` JavaScript pada timezone lokal server. Kalau lalu dikonversi dengan `.toISOString()` (yang selalu UTC), tanggalnya bisa **mundur 1 hari** untuk timezone WIB/WITA/WIT (UTC+7/+8/+9) — misal tanggal asli `2024-01-01` bisa berubah jadi `2023-12-31T17:00:00.000Z`. Dengan `dateStrings: true`, MySQL langsung mengembalikan string `'YYYY-MM-DD'` apa adanya, tanpa konversi timezone sama sekali. Sudah diverifikasi langsung ke source code `mysql2` (`lib/parsers/text_parser.js`) bahwa opsi ini benar-benar menghindari parsing ke `Date` untuk kolom bertipe DATE/DATETIME/TIMESTAMP.

## 1. HTML — lokasi: `frontend/player.html`

Di dalam `<form id="formTambah">`:
```html
<input type="date" id="tanggalLahirTambah" required /> <!-- BAGIAN INI -->
```

Di dalam `<form id="formEdit">` (modal edit):
```html
<div class="form-group"> <!-- BAGIAN INI -->
    <label for="tanggalLahirEdit">Tanggal Lahir</label> <!-- BAGIAN INI -->
    <input type="date" id="tanggalLahirEdit" required /> <!-- BAGIAN INI -->
</div> <!-- BAGIAN INI -->
```

## 2. Frontend TS — lokasi: `frontend/src/player.ts`

**A. Bagian "1. KONFIGURASI & DEKLARASI ELEMEN DOM"**:
```ts
const tanggalLahirTambah = document.getElementById('tanggalLahirTambah') as HTMLInputElement; // <- BAGIAN INI
const tanggalLahirEdit = document.getElementById('tanggalLahirEdit') as HTMLInputElement;     // <- BAGIAN INI
```

**B. Bagian "2. FUNGSI API"**:
```ts
async function createData(p_nama: string, p_alamat: string, p_rank: string, p_tanggalLahir: string) { // <- BAGIAN INI
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, tanggalLahir: p_tanggalLahir })   // <- BAGIAN INI
    });
    // ...sisanya sama seperti aslinya
}

async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_tanggalLahir: string) { // <- BAGIAN INI
    const res = await fetch(`${API_URL}/${p_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank, tanggalLahir: p_tanggalLahir })   // <- BAGIAN INI
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
<td>${p_item.tanggalLahir}</td>   // <- BAGIAN INI
<td>
  <button class="action-btn edit-btn" data-id="${p_item.id}" data-nama="${p_item.nama}"
      data-alamat="${p_item.alamat}" data-rank="${p_item.rank}"
      data-tanggal="${p_item.tanggalLahir}">Edit</button>   // <- BAGIAN INI
  <button class="action-btn delete-btn" data-id="${p_item.id}">Hapus</button>
</td>
```

Event listener tombol Edit:
```ts
openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!,
    target.dataset.rank!, target.dataset.tanggal!);   // <- BAGIAN INI
```

`openEditModal()` — setelah `dateStrings: true` dipasang, `tanggalLahir` dari backend sudah pasti string `'YYYY-MM-DD'` apa adanya, jadi tinggal diisi langsung tanpa split/konversi apa pun:
```ts
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string, p_tanggalLahir: string) {  // <- BAGIAN INI
    currentEditId = p_id;
    namaEdit.value = p_nama;
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;
    tanggalLahirEdit.value = p_tanggalLahir;   // <- BAGIAN INI
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
    const tanggalLahir = tanggalLahirTambah.value;             // <- BAGIAN INI (sudah otomatis 'YYYY-MM-DD')
    if (!nama || !alamat || !rank || !tanggalLahir) {          // <- BAGIAN INI
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank, tanggalLahir);               // <- BAGIAN INI
});

// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    const tanggalLahir = tanggalLahirEdit.value;                // <- BAGIAN INI
    if (!nama || !alamat || !rank || !tanggalLahir) {          // <- BAGIAN INI
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) return;
    updateData(currentEditId, nama, alamat, rank, tanggalLahir); // <- BAGIAN INI
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
    tanggalLahir: string;   // <- BAGIAN INI (sudah string 'YYYY-MM-DD' berkat dateStrings: true)
}

static async getAll(): Promise<Player[]> {
    const query = 'SELECT * FROM player';
    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows as Player[];   // <- BAGIAN INI (tidak perlu konversi Date lagi)
}

static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank, tanggalLahir) VALUES (?, ?, ?, ?)';  // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.tanggalLahir]   // <- BAGIAN INI
    );
    return result.insertId;
}

static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ?, tanggalLahir = ? WHERE id = ?';  // <- BAGIAN INI
    const [result] = await db.query<ResultSetHeader>(
        query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_docu.tanggalLahir, p_id]   // <- BAGIAN INI
    );
    return result.affectedRows;
}
```

`controllers/playerController.ts` — project ini sudah pakai validasi **Zod** lewat `playerInputSchema`, bukan lagi `if (!tanggalLahir)` manual (yang cuma menolak string kosong, tapi tetap meloloskan format ngawur seperti `"32 Januari"` atau `"besok"`). Validasi format `'YYYY-MM-DD'` + pastikan tanggalnya benar-benar valid:
```ts
const playerInputSchema = z.object({
  nama: z.string().trim().min(1, 'nama tidak boleh kosong').max(100, 'nama maksimal 100 karakter'),
  alamat: z.string().trim().min(1, 'alamat tidak boleh kosong').max(100, 'alamat maksimal 100 karakter'),
  rank: z.string().trim().min(1, 'rank tidak boleh kosong').max(100, 'rank maksimal 100 karakter'),
  tanggalLahir: z                                                              // <- BAGIAN INI
    .string()                                                                  // <- BAGIAN INI
    // Regex ini memastikan formatnya PERSIS 4 digit tahun - 2 digit bulan - 2 digit tanggal
    // (sesuai yang selalu dikirim <input type="date">), menolak format lain seperti "01/01/2024"
    // yang lolos validasi lama "if (!tanggalLahir)" selama tidak kosong.
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'format tanggal harus YYYY-MM-DD')           // <- BAGIAN INI
    // Regex di atas cuma mengecek BENTUK teksnya, belum tentu tanggalnya beneran ada di kalender
    // (misal "2024-02-30" tetap lolos regex, padahal Februari tidak pernah punya tanggal 30).
    // .refine() menjalankan pengecekan tambahan bebas: Date.parse() mengembalikan NaN kalau
    // tanggalnya tidak valid, jadi !isNaN(...) berarti "tanggalnya beneran ada".
    .refine((val) => !isNaN(Date.parse(val)), 'tanggal tidak valid'),          // <- BAGIAN INI
});
```

`validatePlayerInput()` sendiri TIDAK perlu diubah. Di `create()` dan `update()`, tinggal tambahkan `tanggalLahir` ke destructuring `validasi.data`, ke pemanggilan `PlayerModel.create`/`update`, dan ke response `data`:
```ts
const { nama, alamat, rank, tanggalLahir } = validasi.data;                                                                        // <- BAGIAN INI
const id = await PlayerModel.create({ nama, alamat, rank, tanggalLahir });                                                         // <- BAGIAN INI
p_res.status(201).json({ success: true, message: 'Player berhasil ditambahkan', data: { id, nama, alamat, rank, tanggalLahir } }); // <- BAGIAN INI
```
Lakukan hal yang sama di dalam `update()`.

## Status pengujian
✅ Skema Zod di atas sudah dites lewat type-check gabungan (`tsc --noEmit`) memakai `tsconfig.json` backend yang sama — sintaksnya valid untuk Zod v4 dan cocok dengan pola `playerInputSchema`/`validatePlayerInput()` yang sudah ada di `backend/src/controllers/playerController.ts`. Belum dites end-to-end lewat request HTTP sungguhan (termasuk belum diverifikasi ulang ke source `mysql2`) — tetap coba manual (Postman/curl/form) setelah diterapkan.

## Catatan
- Header `<th>` dan `colspan` di `player.html` perlu disesuaikan manual seperti sample lain yang menambah kolom.
- Opsi `dateStrings: true` berlaku global untuk SEMUA kolom DATE/DATETIME/TIMESTAMP di seluruh project — jadi cukup dipasang sekali walau nanti ada field tanggal lain.
