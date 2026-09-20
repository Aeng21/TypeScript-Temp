// ==========================================
// 1. KONFIGURASI & DEKLARASI ELEMEN DOM
// ==========================================
const API_URL = 'http://localhost:3000/api/player';

const formTambah = document.getElementById('formTambah') as HTMLFormElement;
const namaTambah = document.getElementById('namaTambah') as HTMLInputElement;
const alamatTambah = document.getElementById('alamatTambah') as HTMLInputElement;
const rankTambah = document.getElementById('rankTambah') as HTMLInputElement;
const tbody = document.getElementById('tbodyPlayer') as HTMLTableSectionElement;

const modalOverlay = document.getElementById('modalEdit') as HTMLDivElement;
const formEdit = document.getElementById('formEdit') as HTMLFormElement;
const namaEdit = document.getElementById('namaEdit') as HTMLInputElement;
const alamatEdit = document.getElementById('alamatEdit') as HTMLInputElement;
const rankEdit = document.getElementById('rankEdit') as HTMLInputElement;
const modalClose = document.getElementById('modalClose') as HTMLSpanElement;
const btnCancelEdit = document.getElementById('btnCancelEdit') as HTMLButtonElement;

let currentEditId: string | null = null;

// ==========================================
// 2. FUNGSI API (Fetch ke Backend)
// ==========================================
async function loadData() {
    try {
        const res = await fetch(API_URL);
        const result = await res.json();
        if (result.success) renderData(result.data);
        else alert('Gagal memuat data: ' + result.message);
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memuat data.');
    }
}

async function createData(nama: string, alamat: string, rank: string) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, alamat, rank })
        });
        const result = await res.json();
        if (result.success) {
            alert('Data berhasil ditambahkan!');
            formTambah.reset();
            loadData();
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menambah data.');
    }
}

async function updateData(id: string, nama: string, alamat: string, rank: string) {
    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, alamat, rank })
        });
        const result = await res.json();
        if (result.success) {
            alert('Data berhasil diupdate!');
            closeEditModal();
            loadData();
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengupdate data.');
    }
}

async function deleteData(id: string) {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
            alert('Data berhasil dihapus!');
            loadData();
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
function renderData(data: any[]) {
    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data</td></tr>`;
        return;
    }
    let html = '';
    data.forEach((item, index) => {
        html += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.nama}</td>
            <td>${item.alamat}</td>
            <td>${item.rank}</td>
            <td>
              <button class="action-btn edit-btn" data-id="${item.id}" data-nama="${item.nama}" data-alamat="${item.alamat}" data-rank="${item.rank}">Edit</button>
              <button class="action-btn delete-btn" data-id="${item.id}">Hapus</button>
            </td>
          </tr>
        `;
    });
    tbody.innerHTML = html;

    // Event listener untuk tombol Edit & Hapus yang baru dibuat
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn as HTMLButtonElement;
            openEditModal(target.dataset.id!, target.dataset.nama!, target.dataset.alamat!, target.dataset.rank!);
        });
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn as HTMLButtonElement;
            deleteData(target.dataset.id!);
        });
    });
}

function openEditModal(id: string, nama: string, alamat: string, rank: string) {
    currentEditId = id;
    namaEdit.value = nama;
    alamatEdit.value = alamat;
    rankEdit.value = rank;
    modalOverlay.classList.add('active');
}

function closeEditModal() {
    modalOverlay.classList.remove('active');
    currentEditId = null;
    formEdit.reset();
}

// ==========================================
// 4. EVENT LISTENERS UTAMA
// ==========================================

// Form Tambah
formTambah.addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = namaTambah.value.trim();
    const alamat = alamatTambah.value.trim();
    const rank = rankTambah.value.trim();
    if (!nama || !alamat || !rank) {
        alert('Semua field harus diisi!');
        return;
    }
    createData(nama, alamat, rank);
});

// Form Edit
formEdit.addEventListener('submit', (e) => {
    e.preventDefault();
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

// Tutup Modal
modalClose.addEventListener('click', closeEditModal);
btnCancelEdit.addEventListener('click', closeEditModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeEditModal();
});

// ==========================================
// 5. INISIALISASI (Dijalankan Saat Halaman Dimuat)
// ==========================================
document.addEventListener('DOMContentLoaded', loadData);

export { };