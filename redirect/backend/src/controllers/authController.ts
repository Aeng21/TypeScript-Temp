import { Request, Response } from 'express';
import UserModel, { UserRole } from '../models/userModel.js';

function getRedirectByRole(role: UserRole): string {
  if (role === 'admin') return '/src/auth/admin.html';
  return '/src/auth/customer.html';
}

class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, role } = req.body as { username: string; password: string; role: string };

      if (!username || !password || !role) {
        res.status(400).json({ success: false, message: 'Username, password, dan role harus diisi' });
        return;
      }

      if (role !== 'admin' && role !== 'customer') {
        res.status(400).json({ success: false, message: 'Role harus admin atau customer' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
        return;
      }

      const existing = await UserModel.findByUsername(username);
      if (existing) {
        res.status(409).json({ success: false, message: 'Username sudah dipakai' });
        return;
      }

      const id = await UserModel.create(username, password, role as UserRole);

      res.status(201).json({
        success: true,
        message: 'Akun berhasil dibuat, silakan login',
        data: { id, username, role },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Gagal membuat akun', error: error.message });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body as { username: string; password: string };

      if (!username || !password) {
        res.status(400).json({ success: false, message: 'Username dan password harus diisi' });
        return;
      }

      const user = await UserModel.findByUsername(username);
      if (!user) {
        res.status(401).json({ success: false, message: 'Username atau password salah' });
        return;
      }

      const valid = await UserModel.verifyPassword(password, user.password);
      if (!valid) {
        res.status(401).json({ success: false, message: 'Username atau password salah' });
        return;
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          username: user.username,
          role: user.role,
          redirectTo: getRedirectByRole(user.role),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Gagal login', error: error.message });
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ success: false, message: 'Gagal logout' });
        return;
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ success: true, message: 'Logout berhasil' });
    });
  }

  static async status(req: Request, res: Response): Promise<void> {
    if (!req.session.userId) {
      res.status(200).json({ success: true, data: { loggedIn: false } });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        loggedIn: true,
        username: req.session.username,
        role: req.session.role,
        redirectTo: getRedirectByRole(req.session.role as UserRole),
      },
    });
  }
}

export default AuthController;
