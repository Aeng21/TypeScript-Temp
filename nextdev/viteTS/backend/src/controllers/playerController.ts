import { Request, Response } from 'express';
import { z } from 'zod';
import PlayerModel from '../models/playerModel.js';

const playerSchema = z.object({
  nama: z.string().trim().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
  alamat: z.string().trim().min(1, 'Alamat wajib diisi').max(100, 'Alamat maksimal 100 karakter'),
  rank: z.string().trim().min(1, 'Rank wajib diisi').max(100, 'Rank maksimal 100 karakter'),
});

function parseId(rawId: unknown): number | null {
  if (typeof rawId !== 'string' || !/^\d+$/.test(rawId)) {
    return null;
  }
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function getErrorMessage(error: unknown): string | undefined {
  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }
  return error instanceof Error ? error.message : String(error);
}

class PlayerController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const player = await PlayerModel.getAll();
      res.status(200).json({
        success: true,
        data: player,
      });
    } catch (error: unknown) {
      console.error('Gagal mengambil data player:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data player',
        error: getErrorMessage(error),
      });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid',
        });
        return;
      }

      const player = await PlayerModel.getById(id);

      if (!player) {
        res.status(404).json({
          success: false,
          message: 'Player tidak ditemukan',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: player,
      });
    } catch (error: unknown) {
      console.error('Gagal mengambil data player:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data player',
        error: getErrorMessage(error),
      });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const parsed = playerSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(', '),
        });
        return;
      }

      const { nama, alamat, rank } = parsed.data;
      const id = await PlayerModel.create({ nama, alamat, rank });

      res.status(201).json({
        success: true,
        message: 'Player berhasil ditambahkan',
        data: { id, nama, alamat, rank },
      });
    } catch (error: unknown) {
      console.error('Gagal menambah player:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambah player',
        error: getErrorMessage(error),
      });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid',
        });
        return;
      }

      const parsed = playerSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(', '),
        });
        return;
      }

      const { nama, alamat, rank } = parsed.data;
      const affectedRows = await PlayerModel.update(id, { nama, alamat, rank });

      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Player tidak ditemukan',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Player berhasil diupdate',
        data: { id, nama, alamat, rank },
      });
    } catch (error: unknown) {
      console.error('Gagal mengupdate player:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate player',
        error: getErrorMessage(error),
      });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        res.status(400).json({
          success: false,
          message: 'ID tidak valid',
        });
        return;
      }

      const affectedRows = await PlayerModel.delete(id);

      if (affectedRows === 0) {
        res.status(404).json({
          success: false,
          message: 'Player tidak ditemukan',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Player berhasil dihapus',
      });
    } catch (error: unknown) {
      console.error('Gagal menghapus player:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus player',
        error: getErrorMessage(error),
      });
    }
  }
}

export default PlayerController;
