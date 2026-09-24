// Mengimpor koneksi database (pool) dari file config/database.js
// db adalah objek pool yang sudah dikonfigurasi untuk melakukan query ke MySQL.
import db from '../config/database.js';

// Mengimpor tipe data dari mysql2 untuk membantu TypeScript memahami hasil query.
// RowDataPacket: tipe untuk baris hasil SELECT (data mentah dari tabel).
// OkPacket: tipe untuk hasil operasi INSERT/UPDATE/DELETE (biasanya berisi info seperti affectedRows).
// ResultSetHeader: tipe yang lebih spesifik untuk hasil INSERT/UPDATE/DELETE, mengandung insertId, affectedRows, dll.
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

// Interface untuk data Player
// bisa digunakan dengan implements untuk memastikan class mengikuti interface
// Setelah ":" sebagai tipe. bisa divariabel,param,array,function dll.
// Dengan as sebagai pemberi tahu typescript "anggap saja ini sebagai ..."
export interface Player {
  id: number;
  nama: string;
  alamat: string;
  rank: string;
}

class PlayerModel {

  // Fungsi async selalu mengembalikan Promise.
  // Promise = hasil yang belum tersedia sekarang, tetapi akan diberikan setelah proses selesai.
  // Tanda <> adalah generic type, digunakan untuk memberi tahu TypeScript tipe data yang diharapkan
  // Tipe data yang ada di dalam <> menunjukkan bentuk hasil yang akan diberikan setelah proses selesai.
  // Ini adalah contoh generic function yang tipenya bisa ditentukan saat dipanggil.
  // Generic function = function yang tipe datanya bisa ditentukan saat function tersebut dipanggil(tidak dikunci dari awal).
  // : = digunakan untuk menentukan tipe data dari sesuatu, misalnya parameter, variabel, atau hasil function.
  // <> = digunakan untuk memberikan tipe data kepada function atau class yang menyediakan tempat untuk menerima tipe inputan(bukan yang langsung ditentukan seperti dengan :).
  static async getAll(): Promise<Player[]> {
    const query = 'SELECT * FROM player';

    // const [rows] = array destructuring: kita hanya mengambil elemen pertamanya yaitu (rows) dari hasil query.
    // db.query() mengirim perintah SQL ke database dan menunggu/menerima hasilnya (await). mengembalikan array [rows, fields]
    // <RowDataPacket[]> memberi tahu TypeScript bahwa hasil yang diharapkan adalah array dari RowDataPacket.
    // RowDataPacket adalah tipe bawaan mysql2 untuk mewakili baris hasil SELECT.
    const [rows] = await db.query<RowDataPacket[]>(query);

    // Karena rows adalah array RowDataPacket, kita "cast" (anggap) sebagai array Player.
    // as = memberi informasi kepada TypeScript untuk menganggap rows bertipe Player[].
    // as tidak mengubah data sebenarnya benar benar hanya informasi untuk ts.
    return rows as Player[];
  }

  // Tanda tanya (?) pada parameter: ini adalah placeholder SQL (bukan TypeScript).
  // Placeholder ? akan diganti dengan nilai dari array parameter kedua(p_id) saat query dijalankan.
  // Mengembalikan Promise yang berisi Player atau undefined jika tidak ditemukan.
  static async getById(p_id: number): Promise<Player | undefined> {
    const query = 'SELECT * FROM player WHERE id = ?';
    // Array [p_id] akan menggantikan tanda ? pada query.
    const [rows] = await db.query<RowDataPacket[]>(query, [p_id]);
    // rows[0] adalah baris pertama (karena id unik, hanya ada satu). Jika tidak ada, undefined.
    // Berikan data itu kembali ke Controller yang tadi meminta tolong.
    return rows[0] as Player | undefined;
  }

  // Omit = mengambil sebuah tipe data, lalu menghilangkan properti tertentu dari tipe tersebut.
  // Omit<Player, 'id'> = menggunakan tipe/blueprint Player tetapi mengecualikan properti id.
  // Parameter p_docu berisi data Player tanpa id karena id dibuat otomatis oleh database.
  // Promise<number> = function akan menghasilkan nilai bertipe number setelah proses selesai.
  // Dalam function ini, number tersebut adalah ID dari data yang baru ditambahkan.
  static async create(p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank) VALUES (?, ?, ?)';
    // ResultSetHeader = tipe data untuk hasil operasi SQL seperti INSERT, UPDATE, atau DELETE.
    // Digunakan agar TypeScript mengetahui bahwa result berisi informasi hasil operasi database.
    // Pada INSERT, result dapat digunakan untuk mengambil insertId dari data yang baru dibuat.
    const [result] = await db.query<ResultSetHeader>(query, [p_docu.nama, p_docu.alamat, p_docu.rank]);
    // Mengembalikan ID baris yang baru ditambahkan.
    return result.insertId;
  }

  // Menerima p_id dan p_docu (data baru tanpa id). Mengembalikan jumlah baris yang terpengaruh (affectedRows).
  static async update(p_id: number, p_docu: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ? WHERE id = ?';
    // Parameter array berisi data baru dan id di akhir.
    const [result] = await db.query<ResultSetHeader>(query, [p_docu.nama, p_docu.alamat, p_docu.rank, p_id]);
    // affectedRows menunjukkan berapa baris yang diubah.
    return result.affectedRows;
  }

  // Mengembalikan jumlah baris yang dihapus (affectedRows).
  static async delete(p_id: number): Promise<number> {
    const query = 'DELETE FROM player WHERE id = ?';
    const [result] = await db.query<ResultSetHeader>(query, [p_id]);
    return result.affectedRows;
  }
}

export default PlayerModel;
