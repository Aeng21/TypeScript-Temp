# Sample Tipe Data Form Player

Tiap file `N_nama.ts` di folder ini adalah dokumentasi (bukan kode yang langsung jalan — semua baris di-comment) untuk menambahkan satu tipe field baru ke form Player (`frontend/player.html`, `frontend/src/player.ts`, dan backend). File `.md` yang menyertainya berisi kode yang sama persis, sudah dikelompokkan per lokasi file tujuan (HTML/TS/Backend) dalam format yang lebih enak dibaca — pakai yang mana saja, `.ts` atau `.md`, isinya konsisten.

| # | Tipe Data | File kode | File README |
|---|---|---|---|
| 1 | Text (string) | `1_text.ts` | [1_text.md](1_text.md) |
| 2 | Number (angka) | `2_number.ts` | [2_number.md](2_number.md) |
| 3 | Password | `3_password.ts` | [3_password.md](3_password.md) |
| 4 | Radio button | `4_radio.ts` | [4_radio.md](4_radio.md) |
| 5 | Checkbox single (boolean) | `5_checkbox_single.ts` | [5_checkbox_single.md](5_checkbox_single.md) |
| 6 | Checkbox multiple (array) | `6_checkbox_multiple.ts` | [6_checkbox_multiple.md](6_checkbox_multiple.md) |
| 7 | Select / dropdown | `7_select_dropdown.ts` | [7_select_dropdown.md](7_select_dropdown.md) |
| 8 | Date / tanggal | `8_date.ts` | [8_date.md](8_date.md) |

## Catatan umum untuk semua sample
- Semua sample menambah kolom baru ke tabel `player` — jalankan `ALTER TABLE` yang disebutkan di masing-masing README sebelum test, kolom tidak otomatis ada.
- Semua sample yang menambahkan kolom ke tabel juga menambah `<td>` baru di `renderData()`, tapi tidak menyebutkan penambahan `<th>` header yang sesuai di `player.html` maupun penyesuaian `colspan="5"` pada baris "Belum ada data" — sesuaikan manual jadi `colspan="6"` (atau sesuai jumlah kolom akhir) supaya tabel tetap rapi.
- Semua sample sudah diverifikasi dengan benar-benar diterapkan ke salinan project dan dicek pakai `tsc --noEmit` (frontend & backend) — bukan hanya dibaca sekilas.
