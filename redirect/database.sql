CREATE DATABASE IF NOT EXISTS auth_db;

USE auth_db;

-- Tabel akun untuk login (admin & customer).
-- password WAJIB disimpan dalam bentuk HASH (bcrypt), bukan plain text.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer'
);

-- Tabel penyimpanan session login (dibuat OTOMATIS oleh express-mysql-session saat backend
-- pertama kali dijalankan, tidak perlu dijalankan manual). Dicatat di sini hanya untuk dokumentasi
-- skema database. Menyimpan session di MySQL (bukan memori server) supaya user tidak ke-logout
-- setiap kali server backend di-restart, tekan tombol back, atau menutup/membuka lagi browser.
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
) ENGINE=InnoDB;