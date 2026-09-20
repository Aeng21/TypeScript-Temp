CREATE DATABASE IF NOT EXISTS minecraft_db;

USE minecraft_db;

CREATE TABLE IF NOT EXISTS player (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat VARCHAR(100) NOT NULL,
    rank VARCHAR(100) NOT NULL
);

INSERT INTO player (nama, alamat, rank) VALUES 
('Budi Santoso', 'subang', 'pro'),
('Siti Rahayu', 'karawang', 'noob'),
('Ahmad Fauzi', 'purwakarta', 'mid');