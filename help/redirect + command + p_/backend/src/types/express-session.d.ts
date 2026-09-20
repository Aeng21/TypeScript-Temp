// Menambahkan properti kustom (userId, username, role) ke SessionData bawaan express-session,
// supaya `req.session.userId` dsb dikenali TypeScript di seluruh project.

// Mengimpor modul 'express-session' hanya untuk keperluan augmentasi tipe di bawah
// (tidak ada nilai yang dipakai langsung dari sini).
import 'express-session';
// Tipe UserRole ('admin' | 'customer') dari model, dipakai untuk mengetik properti role di bawah.
import { UserRole } from '../models/userModel.js';

// 'declare module' = menambahkan/menimpa definisi tipe milik package lain (module augmentation).
// Di sini kita menambahkan 3 properti baru ke interface SessionData bawaan express-session.
declare module 'express-session' {
  interface SessionData {
    userId?: number;    // ID user yang sedang login (diisi saat login berhasil)
    username?: string;  // username user yang sedang login
    role?: UserRole;    // role user yang sedang login ('admin' atau 'customer')
  }
}
