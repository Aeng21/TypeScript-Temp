// ini adalah file yang benar benar membuat sistem bisa menyambung ke database


// Mengimpor modul mysql2/promise yang menyediakan koneksi database MySQL dengan dukungan Promise (async/await).
// Dengan menggunakan versi promise, kita bisa menggunakan await pada query, sehingga lebih mudah ditangani secara asinkron.
import mysql from 'mysql2/promise';

// Mengimpor dotenv untuk membaca variabel lingkungan dari file .env.
// Ini memungkinkan kita menyimpan konfigurasi database (host, user, password, dll.) di file terpisah yang tidak masuk ke repositori.
import dotenv from 'dotenv';

// Memanggil dotenv.config() untuk membaca file .env dan memasukkan variabel-variabelnya ke dalam process.env.
dotenv.config();

// mysql.createPool() membuat sebuah pool koneksi ke database MySQL.
// Pool berguna untuk mengelola banyak koneksi sekaligus, sehingga tidak perlu membuat koneksi baru setiap kali query.
// Koneksi yang sudah selesai digunakan akan dikembalikan ke pool, sehingga bisa dipakai ulang.
const pool = mysql.createPool({
  // host: alamat server database, biasanya 'localhost' atau IP. Diambil dari file .env.
  host: process.env.DB_HOST,
  // user: nama pengguna untuk login ke database. Diambil dari .env.
  user: process.env.DB_USER,
  // password: kata sandi untuk pengguna tersebut. Diambil dari .env.
  password: process.env.DB_PASSWORD,
  // database: nama database yang akan digunakan. Diambil dari .env.
  database: process.env.DB_NAME,

  // waitForConnections: jika true, ketika semua koneksi sedang sibuk, permintaan koneksi baru akan menunggu sampai ada koneksi yang tersedia.
  // Jika false, akan langsung melempar error.
  waitForConnections: true,

  // connectionLimit: batas maksimum jumlah koneksi yang dapat dibuat secara bersamaan dalam pool.
  // Nilai 10 artinya paling banyak ada 10 koneksi aktif sekaligus. Sesuaikan dengan kapasitas server.
  connectionLimit: 10,

  // queueLimit: batas maksimum antrian permintaan koneksi yang ditunda.
  // Nilai 0 berarti tidak ada batas, semua permintaan akan diantrikan jika semua koneksi sedang sibuk.
  queueLimit: 0,
});

export default pool;
