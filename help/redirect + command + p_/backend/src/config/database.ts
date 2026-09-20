// Koneksi database untuk backend "redirect" (auth). Terpisah dari pool milik backend CRUD
// (backend/src/config/database.ts) karena sekarang dua proses Node yang berbeda — tapi
// keduanya tetap menunjuk ke database MySQL yang sama (minecraft_db), cuma tabel yang dipakai
// beda: backend CRUD pakai tabel `player`, backend redirect pakai tabel `users` & `sessions`.

// Mengimpor modul mysql2/promise: driver MySQL yang mendukung Promise (async/await),
// jadi query bisa ditulis dengan await, bukan callback.
import mysql from 'mysql2/promise';

// Mengimpor dotenv untuk membaca variabel dari file .env (DB_HOST, DB_USER, dst).
import dotenv from 'dotenv';

// Membaca file .env dan memasukkan isinya ke process.env agar bisa dipakai di bawah.
dotenv.config();

// mysql.createPool() membuat kumpulan (pool) koneksi ke MySQL, bukan satu koneksi tunggal.
// Dengan pool, tiap query meminjam satu koneksi lalu mengembalikannya lagi setelah selesai,
// jadi tidak perlu buka/tutup koneksi baru tiap kali ada request.
const pool = mysql.createPool({
  // host: alamat server MySQL (biasanya 'localhost'). Diambil dari .env.
  host: process.env.DB_HOST,
  // user: nama akun MySQL yang dipakai untuk login. Diambil dari .env.
  user: process.env.DB_USER,
  // password: kata sandi akun MySQL tersebut. Diambil dari .env.
  password: process.env.DB_PASSWORD,
  // database: nama database yang dipakai (mis. minecraft_db). Diambil dari .env.
  database: process.env.DB_NAME,
  // waitForConnections: true berarti jika semua koneksi di pool sedang dipakai,
  // request baru akan menunggu antrian, bukan langsung gagal.
  waitForConnections: true,
  // connectionLimit: jumlah maksimum koneksi yang boleh aktif bersamaan dalam pool.
  connectionLimit: 10,
  // queueLimit: batas antrian permintaan koneksi yang menunggu. 0 berarti tidak dibatasi.
  queueLimit: 0,
});

// Mengekspor pool ini sebagai default export supaya file lain (model) tinggal
// import db from '../config/database.js' dan langsung memakai db.query(...).
export default pool;
