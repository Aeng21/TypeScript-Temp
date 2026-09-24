import { Request, Response } from 'express';
import { z } from 'zod';
import UserModel, { UserRole } from '../models/userModel.js';

function getRedirectByRole(role: UserRole): string {
  if (role === 'admin') return '/src/auth/admin.html';
  return '/src/auth/customer.html';
}

function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh berisi huruf, angka, dan underscore'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Za-z]/, 'Password harus mengandung setidaknya satu huruf')
    .regex(/[0-9]/, 'Password harus mengandung setidaknya satu angka'),
  role: z.enum(['admin', 'customer'], {
    message: 'Role harus admin atau customer',
  }),
});

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
});

class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: formatZodError(parsed.error) });
        return;
      }

      const { username, password, role } = parsed.data;

      const existing = await UserModel.findByUsername(username);
      if (existing) {
        res.status(409).json({ success: false, message: 'Username sudah dipakai' });
        return;
      }

      const id = await UserModel.create(username, password, role);

      res.status(201).json({
        success: true,
        message: 'Akun berhasil dibuat, silakan login',
        data: { id, username, role },
      });
    } catch (error: unknown) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat akun',
        ...(process.env.NODE_ENV !== 'production' ? { error: getErrorMessage(error) } : {}),
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, message: formatZodError(parsed.error) });
        return;
      }

      const { username, password } = parsed.data;

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
    } catch (error: unknown) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal login',
        ...(process.env.NODE_ENV !== 'production' ? { error: getErrorMessage(error) } : {}),
      });
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
