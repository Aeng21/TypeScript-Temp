// ============================================================
// 1. IMPOR MODUL-MODUL YANG DIBUTUHKAN
// ============================================================

// mengimport export default express dan type interface(request, responce, nextfunction) dari lib express
// agar bisa menggunakan fungsi dasar express dan type dari express
import express, { Request, Response, NextFunction } from 'express';

// mengimport path
// Digunakan untuk menentukan dan menggabungkan lokasi file/folder.
import path from 'path';

// Mengubah alamat/lokasi file menjadi path yang bisa digunakan Node.js.
// Karena pakai ES Module, __dirname tidak tersedia otomatis.
// #path = tempat menyimpan file (contoh: C:\Users\Aeng\AppData\Local\Programs\Microsoft VS Code\Code.exe)
import { fileURLToPath } from 'url';

// Mengimpor CORS agar aplikasi dapat menerima request dari origin yang berbeda
// Contoh: aplikasi di localhost:5173 dapat mengirim request ke localhost:3000
// #Origin = Protokol(http://) + Domain/Host(localhost) + Port(:5173)
import cors from 'cors';

// mengimport dotenv untuk membaca isi file .env
import dotenv from 'dotenv';

// mengimport export default untuk router player. dari folder routes
// File ini berisi rute-rute spesifik (misal GET /api/player, POST /api/player, dll.).
import playerRoutes from './routes/playerRoutes.js';

// ============================================================
// 2. KONFIGURASI AWAL
// ============================================================

// Memuat semua variabel dari file .env ke process.env.
// ALIAS Mengambil data dari file .env agar bisa digunakan di program melalui process.env
dotenv.config();

// Membuat aplikasi Express yang akan digunakan untuk menjalankan server
// app = mengreturn objek yang punya banyak method didalamnya
const app = express();

// Menentukan port yang akan digunakan. Prioritas dari environment variable PORT,
// ||3000 maksudnya: jika tidak ada, gunakan port 3000.
const PORT = process.env.PORT || 3000;

// ============================================================
// 3. MIDDLEWARE GLOBAL
// ============================================================

// use = Memasang middleware ke aplikasi Express.
// #cors() mengaktifkan CORS agar frontend (misal dari port berbeda) bisa memanggil API ini.
// ALIAS Mengaktifkan CORS agar aplikasi dapat menerima request dari origin yang berbeda
app.use(cors());

// express.json() mem-parsing body request yang berformat JSON menjadi objek JavaScript.
// Tanpa ini, p_req.body akan undefined untuk request JSON.
// fungsinya membuat Express bisa membaca data JSON yang dikirim oleh client/frontend(misalnya saat post dan put).
app.use(express.json());

// express.urlencoded() mem-parsing body request yang dikirim melalui form HTML (URL-encoded).
// extended: true mengizinkan data bertipe objek/array di dalam form.
// fungsinya membuat Express bisa membaca data dari Tag <form> yang dikirim oleh client/frontend(misalnya saat post dan put).
// #contoh: nama=Aeng&umur=23 data yang dikirim lewat url
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 4. MENYAJIKAN FILE STATIS (public)
// ============================================================

// Karena kita menggunakan ES Module, kita perlu membuat __filename dan __dirname sendiri.

// fileURLToPath() = mengubah lokasi tersebut menjadi path biasa
// import.meta.url = mendapatkan URL/lokasi file yang sedang dijalankan
// __filename = lokasi lengkap file server.js
const __filename = fileURLToPath(import.meta.url);
// __dirname = lokasi folder tempat server.js berada
// path.dirname() = mengambil folder dari lokasi file __filename yang sebelumnya dibuat
const __dirname = path.dirname(__filename);

// express.static() : membuat file dalam suatu folder bisa diakses oleh browser/client.
// path.join() : Menggabungkan alamat folder agar menjadi satu path yang benar. contoh dirname = projeck/src dan ../public = naik satu folder lalu masuk ke public. hasilnya  = project/public
// membuat file dalam folder public bisa diakses oleh browser/client.
// express.static : tempat sistem mencari file index.html saat ada req masuk dari /
app.use(express.static(path.join(__dirname, '../public')));

// app.use(express.static(path.join(__dirname, '../public'), {
// index: 'utama.html' // Memberi tahu Express untuk mencari utama.html, bukan index.html
// ini jika kamu ingin mengganti file default index.html jadi file dengan nama lain.
// }));

// ============================================================
// 5. ROUTE UTAMA (root) - INFORMASI SERVER
// ============================================================

// app.get() : membuat route untuk menerima request GET.
// '/' : alamat yang dituju. '/' berarti root/halaman utama server.
// (p_req, p_res) => { ... } : fungsi yang dijalankan ketika ada request GET ke '/'.
// Menangani request GET ke '/' (root). Mengembalikan pesan sukses dan daftar endpoint yang tersedia.
app.get('/', (p_req: Request, p_res: Response) => {
  // p_res.json() : mengirim response dalam bentuk JSON ke client.
  p_res.json({
    message: 'Server berjalan dengan baik!',
    endpoints: {
      player: '/api/player',
    },
  });
});

// ============================================================
// 6. ROUTE UNTUK MASING-MASING RESOURCE (API)
// ============================================================

// Semua route yang dimulai dengan '/api/player' akan diteruskan ke playerRoutes.
// Di dalam playerRoutes, kita bisa mendefinisikan GET, POST, PUT, DELETE, dsb.
// ALIAS membuat endpoint awal untuk masing masing routes
// contoh : router.get('/', PlayerController.getAll); = GET /api/player/
// contoh : router.get('/:id', PlayerController.getById); = GET /api/player/:id
app.use('/api/player', playerRoutes);

// ============================================================
// 7. HANDLER UNTUK ENDPOINT YANG TIDAK DITEMUKAN (404)
// ============================================================

// Jika request tidak cocok dengan route mana pun di atas, maka middleware ini akan dijalankan.
// Mengatur status() menjadi 404 (Not Found), lalu mengirim pesan error dalam bentuk JSON.
app.use((p_req: Request, p_res: Response) => {
  p_res.status(404).json({
    // Menandakan bahwa request gagal.
    success: false,
    // Pesan yang dikirim kepada client.
    message: 'Endpoint tidak ditemukan',
  });
});

// ============================================================
// 8. HANDLER UNTUK ERROR SERVER (500)
// ============================================================

// Middleware error handling (ditandai dengan 4 parameter). Akan menangkap semua error yang terjadi di route atau middleware sebelumnya.
// Mencetak error di console dan mengembalikan response JSON status 500.
// p_err: error yang terjadi, p_req: request dari client, p_res: response untuk client, p_next: meneruskan ke middleware berikutnya
app.use((p_err: any, p_req: Request, p_res: Response, p_next: NextFunction) => {
  console.error(p_err.stack); // menampilkan tumpukan error di console
  p_res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    error: p_err.message, // pesan error dikirim ke client (untuk debugging, bisa dihapus di production)
  });
});

// ============================================================
// 9. MENJALANKAN SERVER
// ============================================================

// Memanggil method listen() untuk membuat server mulai mendengarkan request dari client di PORT yang ditentukan.
// Setelah server berjalan, callback akan dijalankan dan menampilkan pesan di console.
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
