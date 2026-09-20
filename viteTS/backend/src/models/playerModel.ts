import db from '../config/database.js';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

// Interface untuk data Player
export interface Player {
  id: number;
  nama: string;
  alamat: string;
  rank: string;
}

class PlayerModel {
  static async getAll(): Promise<Player[]> {
    const query = 'SELECT * FROM player';
    const [rows] = await db.query<RowDataPacket[]>(query);
    return rows as Player[];
  }

  static async getById(id: number): Promise<Player | undefined> {
    const query = 'SELECT * FROM player WHERE id = ?';
    const [rows] = await db.query<RowDataPacket[]>(query, [id]);
    return rows[0] as Player | undefined;
  }

  static async create(data: Omit<Player, 'id'>): Promise<number> {
    const query = 'INSERT INTO player (nama, alamat, rank) VALUES (?, ?, ?)';
    const [result] = await db.query<ResultSetHeader>(query, [data.nama, data.alamat, data.rank]);
    return result.insertId;
  }

  static async update(id: number, data: Omit<Player, 'id'>): Promise<number> {
    const query = 'UPDATE player SET nama = ?, alamat = ?, rank = ? WHERE id = ?';
    const [result] = await db.query<ResultSetHeader>(query, [data.nama, data.alamat, data.rank, id]);
    return result.affectedRows;
  }

  static async delete(id: number): Promise<number> {
    const query = 'DELETE FROM player WHERE id = ?';
    const [result] = await db.query<ResultSetHeader>(query, [id]);
    return result.affectedRows;
  }
}

export default PlayerModel;