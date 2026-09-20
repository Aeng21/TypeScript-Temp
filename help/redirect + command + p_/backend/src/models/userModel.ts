// Model untuk tabel `users` (akun login: admin & customer).
// Sama seperti playerModel.ts, tapi khusus untuk otentikasi.

// Mengimpor pool koneksi database yang sudah dikonfigurasi di config/database.ts.
import db from '../config/database.js';
// Mengimpor bcrypt untuk hashing & pengecekan password (password TIDAK PERNAH disimpan sebagai teks biasa).
import bcrypt from 'bcrypt';
// RowDataPacket: tipe baris hasil query SELECT. ResultSetHeader: tipe hasil INSERT/UPDATE/DELETE
// (berisi insertId, affectedRows, dll).
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Tipe union: role user hanya boleh 'admin' atau 'customer', tidak ada nilai lain yang valid.
export type UserRole = 'admin' | 'customer';

// Bentuk/struktur satu baris data user, dipakai sebagai tipe di seluruh project.
export interface User {
  id: number;
  username: string;
  password: string; // selalu berupa HASH bcrypt, tidak pernah plain text
  role: UserRole;
}

class UserModel {
  // Mencari user berdasarkan username. Dipakai saat login (butuh hash password untuk dibandingkan)
  // dan saat register (untuk cek username sudah dipakai atau belum).
  // p_username = PARAMETER: username yang mau dicari, dikirim oleh pemanggil fungsi ini.
  static async findByUsername(p_username: string): Promise<User | undefined> {
    // Query SQL dengan placeholder '?' supaya aman dari SQL injection.
    const query = 'SELECT id, username, password, role FROM users WHERE username = ?';
    // Array [p_username] mengisi tanda '?' di atas. db.query mengembalikan [rows, fields],
    // kita hanya ambil rows lewat array destructuring.
    const [rows] = await db.query<RowDataPacket[]>(query, [p_username]);
    // rows[0] = baris pertama (karena username unik, paling banyak satu hasil).
    // undefined jika tidak ditemukan. 'as User | undefined' memberi tahu TS bentuk datanya.
    return rows[0] as User | undefined;
  }

  // Membuat akun baru. Password di-hash di sini (bukan di controller) supaya plain text
  // tidak pernah "lewat" ke luar model, sama seperti pola sample/3_password.md.
  // p_username, p_password, p_role = PARAMETER: data akun baru yang mau dibuat.
  static async create(p_username: string, p_password: string, p_role: UserRole): Promise<number> {
    // bcrypt.hash(teks, saltRounds): mengubah password asli menjadi hash satu-arah.
    // Angka 10 = "cost factor", makin besar makin aman tapi makin lambat diproses.
    const hashed = await bcrypt.hash(p_password, 10);
    // Query INSERT dengan 3 placeholder, sesuai urutan array parameter kedua di bawah.
    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    // Simpan hash (bukan p_password asli) ke kolom password.
    const [result] = await db.query<ResultSetHeader>(query, [p_username, hashed, p_role]);
    // ResultSetHeader.insertId = ID baris yang baru saja dibuat (auto increment).
    return result.insertId;
  }

  // Membandingkan password plain text (input login) dengan hash yang tersimpan di database.
  // p_plainPassword = PARAMETER: password yang diketik user saat login (belum di-hash).
  // p_hashedPassword = PARAMETER: hash yang tersimpan di kolom password (hasil bcrypt.hash sebelumnya).
  static async verifyPassword(p_plainPassword: string, p_hashedPassword: string): Promise<boolean> {
    // bcrypt.compare menghitung ulang hash dari p_plainPassword lalu membandingkan
    // dengan p_hashedPassword. Mengembalikan true/false, tidak pernah "membalik" hash jadi teks asli
    // (karena hashing bersifat satu arah, tidak bisa dibalik).
    return bcrypt.compare(p_plainPassword, p_hashedPassword);
  }
}

// Diekspor sebagai default supaya controller tinggal: import UserModel from '../models/userModel.js'.
export default UserModel;
