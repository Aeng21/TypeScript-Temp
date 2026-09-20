import db from '../config/database.js';
import bcrypt from 'bcrypt';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type UserRole = 'admin' | 'customer';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
}

class UserModel {
  static async findByUsername(username: string): Promise<User | undefined> {
    const query = 'SELECT id, username, password, role FROM users WHERE username = ?';
    const [rows] = await db.query<RowDataPacket[]>(query, [username]);
    return rows[0] as User | undefined;
  }

  static async create(username: string, password: string, role: UserRole): Promise<number> {
    const hashed = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    const [result] = await db.query<ResultSetHeader>(query, [username, hashed, role]);
    return result.insertId;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default UserModel;
