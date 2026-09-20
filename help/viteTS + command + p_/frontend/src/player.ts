// ==========================================
// 1. KONFIGURASI & DEKLARASI ELEMEN DOM
// ==========================================

// Base URL endpoint untuk resource player di server.
const API_URL = 'http://localhost:3000/api/player';

// Ambil elemen form tambah, input nama, alamat, rank, dan tbody tabel.
const formTambah = document.getElementById('formTambah') as HTMLFormElement;
const namaTambah = document.getElementById('namaTambah') as HTMLInputElement;
const alamatTambah = document.getElementById('alamatTambah') as HTMLInputElement;
const rankTambah = document.getElementById('rankTambah') as HTMLInputElement;
const tbody = document.getElementById('tbodyPlayer') as HTMLTableSectionElement;

// Modal overlay (lapisan gelap di belakang modal)
const modalOverlay = document.getElementById('modalEdit') as HTMLDivElement;
// Form edit di dalam modal
const formEdit = document.getElementById('formEdit') as HTMLFormElement;
// Input-an di dalam modal
const namaEdit = document.getElementById('namaEdit') as HTMLInputElement;
const alamatEdit = document.getElementById('alamatEdit') as HTMLInputElement;
const rankEdit = document.getElementById('rankEdit') as HTMLInputElement;
// Tombol close (ikon 'x') dan tombol batal
const modalClose = document.getElementById('modalClose') as HTMLSpanElement;
const btnCancelEdit = document.getElementById('btnCancelEdit') as HTMLButtonElement;

// Variabel untuk menyimpan ID player yang sedang diedit
let currentEditId: string | null = null;

// ==========================================
// 2. FUNGSI API (Fetch ke Backend)
// ==========================================

// Mengambil semua data player dari API dan menampilkannya di tabel
async function loadData() {
    try {
        const res = await fetch(API_URL);              // GET request
        const result = await res.json();               // parse JSON
        if (result.success) renderData(result.data);   // jika sukses, tampilkan
        else alert('Gagal memuat data: ' + result.message);
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memuat data.');
    }
}

// Mengirim data baru ke server dengan method POST
async function createData(p_nama: string, p_alamat: string, p_rank: string) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            // tempat mendeklarasikan key yang dipakai dibackend-nya. Sedianya ini bisa memakai fitur JS modern
            // bernama Shorthand Property Names (bila nama key dan nama variabel sama, boleh disingkat jadi satu),
            // tapi karena parameter di sini sudah diberi awalan p_ (p_nama, p_alamat, p_rank) supaya jelas terlihat
            // sebagai parameter, namanya jadi berbeda dari key JSON yang diharapkan backend ('nama', 'alamat', 'rank').
            // Makanya di bawah ini ditulis eksplisit key: value:
            // body: JSON.stringify({
            //      nama: p_nama,     <= 'nama' sebelah kiri adalah KEY, 'p_nama' sebelah kanan adalah PARAMETER
            //      alamat: p_alamat,
            //      rank: p_rank
            // })

            body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank })
        });
        const result = await res.json();
        if (result.success) {
            alert('Data berhasil ditambahkan!');
            formTambah.reset();    // reset form tambah
            loadData();            // refresh tabel
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menambah data.');
    }
}

// Mengirim data yang telah diubah ke server dengan method PUT
async function updateData(p_id: string, p_nama: string, p_alamat: string, p_rank: string) {
    try {
        const res = await fetch(`${API_URL}/${p_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama: p_nama, alamat: p_alamat, rank: p_rank })
        });
        const result = await res.json();
        if (result.success) {
            alert('Data berhasil diupdate!');
            closeEditModal();      // tutup modal
            loadData();            // refresh tabel
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengupdate data.');
    }
}

// Menghapus data berdasarkan ID dengan method DELETE
async function deleteData(p_id: string) {
    if (!confirm('Yakin ingin menghapus data ini?')) return; // konfirmasi
    try {
        const res = await fetch(`${API_URL}/${p_id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            alert('Data berhasil dihapus!');
            loadData();            // refresh tabel
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghapus data.');
    }
}

// ==========================================
// 3. FUNGSI UI & TAMPILAN
// ==========================================

// Menerima array data dan membuat baris tabel + tombol aksi
function renderData(p_docu: any[]) {
    // Jika data kosong, tampilkan pesan
    if (!p_docu || p_docu.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data</td></tr>`;
        return;
    }
    // Bangun string HTML untuk setiap baris
    let html = '';
    p_docu.forEach((p_item, p_index) => {
        html += `
          <tr>
            <td>${p_index + 1}</td>
            <td>${p_item.nama}</td>
            <td>${p_item.alamat}</td>
            <td>${p_item.rank}</td>
            <td>
              <!-- Tombol Edit dan Hapus, menyimpan data sebagai atribut data-* -->
              <button class="action-btn edit-btn" data-id="${p_item.id}" data-nama="${p_item.nama}" data-alamat="${p_item.alamat}" data-rank="${p_item.rank}">Edit</button>
              <button class="action-btn delete-btn" data-id="${p_item.id}">Hapus</button>
            </td>
          </tr>
        `;
    });
    tbody.innerHTML = html;

    // Pasang event listener pada tombol Edit (setelah dirender)
    document.querySelectorAll('.edit-btn').forEach(p_btn => {
        p_btn.addEventListener('click', () => {
            const target = p_btn as HTMLButtonElement;
            // Ambil data dari atribut data-* dan buka modal
            openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!, target.dataset.rank!);
        });
    });

    // Pasang event listener pada tombol Hapus
    document.querySelectorAll('.delete-btn').forEach(p_btn => {
        p_btn.addEventListener('click', () => {
            const target = p_btn as HTMLButtonElement;
            deleteData(target.dataset.id!);
        });
    });
}

// Membuka modal dan mengisi input dengan data yang akan diedit
function openEditModal(p_id: string, p_nama: string, p_alamat: string, p_rank: string) {
    currentEditId = p_id;               // simpan ID untuk keperluan update
    namaEdit.value = p_nama;            // isi nilai input
    alamatEdit.value = p_alamat;
    rankEdit.value = p_rank;
    modalOverlay.classList.add('active'); // tampilkan modal (CSS class 'active')
}

// Menutup modal, mereset form dan ID
function closeEditModal() {
    modalOverlay.classList.remove('active');
    currentEditId = null;
    formEdit.reset();
}

// ==========================================
// 4. EVENT LISTENERS UTAMA
// ==========================================

// Saat form tambah disubmit, ambil nilai, validasi, lalu panggil createData
// Form Tambah
formTambah.addEventListener('submit', (p_e) => {
    p_e.preventDefault(); // cegah reload halaman
    // trim fungsi untuk menghapus spasi diawal dan diakhir
    const nama = namaTambah.value.trim();
    const alamat = alamatTambah.value.trim();
    const rank = rankTambah.value.trim();
    // !nama =
    // false
    // 0
    // ""
    // null
    // undefined
    // NaN
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank);
});

// Saat form edit disubmit, ambil nilai, validasi, lalu panggil updateData
// Form Edit
formEdit.addEventListener('submit', (p_e) => {
    p_e.preventDefault();
    const nama = namaEdit.value.trim();
    const alamat = alamatEdit.value.trim();
    const rank = rankEdit.value.trim();
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    if (currentEditId === null) {
        alert('ID tidak ditemukan.');
        return;
    }
    updateData(currentEditId, nama, alamat, rank);
});

// Event listener untuk menutup modal:
// - klik tombol close (x)
// - klik tombol Batal
// - klik di luar area modal (overlay)
// Tutup Modal
modalClose.addEventListener('click', closeEditModal);
btnCancelEdit.addEventListener('click', closeEditModal);
modalOverlay.addEventListener('click', (p_e) => {
    if (p_e.target === modalOverlay) closeEditModal();
});

// ==========================================
// 5. INISIALISASI (Dijalankan Saat Halaman Dimuat)
// ==========================================

// Ketika DOM sudah siap, jalankan loadData() untuk menampilkan data awal
document.addEventListener('DOMContentLoaded', loadData);

// Tanpa export/import, TypeScript dapat memperlakukan file tersebut sebagai script global.
// Karena kita menggunakan TypeScript dan mungkin ingin menghindari error global,
// kita export {} agar file ini diperlakukan sebagai modul.
export { };
