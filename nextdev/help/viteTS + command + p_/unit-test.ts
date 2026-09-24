// ============================================================
// UNIT TEST — alur backend Player (Model + Controller)
// ============================================================
//
// File ini TIDAK butuh MySQL menyala dan TIDAK butuh server (`npm run dev`) berjalan.
// Semua panggilan ke database (db.query) dan ke PlayerModel di-"mock" (dipalsukan)
// pakai fitur bawaan Node.js (node:test -> mock.method), jadi test ini murni
// mengecek LOGIKA kode kita sendiri: query apa yang dikirim, parameter apa yang
// dipakai, dan response apa yang dibalas ke client — bukan mengecek MySQL-nya.
//
// Cara jalanin file ini ada di penjelasan yang dikirim di chat (bukan di file ini).

import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import db from './backend/src/config/database.js';
import PlayerModel from './backend/src/models/playerModel.js';
import PlayerController from './backend/src/controllers/playerController.js';

// Tiruan minimal untuk tipe Request/Response dari Express, secukupnya yang
// dipakai controller (params, body, status().json()). Dibuat sendiri (bukan
// import dari package 'express') supaya file ini tidak bergantung pada
// node_modules-nya backend saat dibuka/dicek dari folder root.
type MockRequest = { params?: Record<string, string>; body?: any };
type MockResponse = {
  statusCode?: number;
  body?: any;
  status(code: number): MockResponse;
  json(payload: any): MockResponse;
};

// ------------------------------------------------------------
// Helper: bikin objek Response palsu ala Express.
// Controller kita selalu memanggil res.status(kode).json(payload), jadi tiruan
// ini cukup meniru dua method itu dan menyimpan apa yang dikirim supaya bisa
// dicek pakai assert di masing-masing test.
// ------------------------------------------------------------
function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: undefined,
    body: undefined,
    status(code: number) {
      res.statusCode = code;
      return res; // supaya bisa di-chain: res.status(200).json(...)
    },
    json(payload: any) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

// ============================================================
// 1. TEST PlayerModel — query ke database (db.query) di-mock
// ============================================================
describe('PlayerModel', () => {
  // Sebelum tiap test, bersihkan semua mock supaya test satu tidak bocor ke test lain.
  beforeEach(() => {
    mock.restoreAll();
  });

  it('getAll() mengembalikan semua baris hasil query sebagai Player[]', async () => {
    const fakeRows = [
      { id: 1, nama: 'Agus', alamat: 'Kamu', rank: 'Pro' },
      { id: 2, nama: 'Skeleton', alamat: 'Nether', rank: 'Pro' },
    ];
    const queryMock = mock.method(db, 'query', async () => [fakeRows, []]);

    const result = await PlayerModel.getAll();

    assert.deepEqual(result, fakeRows);
    assert.equal(queryMock.mock.callCount(), 1);
    assert.match(queryMock.mock.calls[0].arguments[0] as unknown as string, /SELECT \* FROM player/);
  });

  it('getById(p_id) mengembalikan satu Player kalau ditemukan', async () => {
    const fakeRow = { id: 5, nama: 'Zeta', alamat: 'End', rank: 'Legend' };
    const queryMock = mock.method(db, 'query', async () => [[fakeRow], []]);

    const result = await PlayerModel.getById(5);

    assert.deepEqual(result, fakeRow);
    // Pastikan id yang dioper benar-benar sampai ke parameter query (WHERE id = ?).
    assert.deepEqual(queryMock.mock.calls[0].arguments[1], [5]);
  });

  it('getById(p_id) mengembalikan undefined kalau tidak ditemukan', async () => {
    mock.method(db, 'query', async () => [[], []]);

    const result = await PlayerModel.getById(999);

    assert.equal(result, undefined);
  });

  it('create(p_docu) mengirim query INSERT dan mengembalikan insertId', async () => {
    const queryMock = mock.method(db, 'query', async () => [{ insertId: 42, affectedRows: 1 }, []]);

    const newId = await PlayerModel.create({ nama: 'Baru', alamat: 'Sini', rank: 'Newbie' });

    assert.equal(newId, 42);
    const [query, params] = queryMock.mock.calls[0].arguments;
    assert.match(query as unknown as string, /INSERT INTO player/);
    assert.deepEqual(params, ['Baru', 'Sini', 'Newbie']);
  });

  it('update(p_id, p_docu) mengirim query UPDATE dan mengembalikan affectedRows', async () => {
    const queryMock = mock.method(db, 'query', async () => [{ affectedRows: 1 }, []]);

    const affected = await PlayerModel.update(7, { nama: 'Ubah', alamat: 'Situ', rank: 'Mid' });

    assert.equal(affected, 1);
    const [query, params] = queryMock.mock.calls[0].arguments;
    assert.match(query as unknown as string, /UPDATE player SET/);
    // Urutan parameter harus nama, alamat, rank, LALU id (sesuai urutan tanda ? di query).
    assert.deepEqual(params, ['Ubah', 'Situ', 'Mid', 7]);
  });

  it('delete(p_id) mengirim query DELETE dan mengembalikan affectedRows', async () => {
    const queryMock = mock.method(db, 'query', async () => [{ affectedRows: 1 }, []]);

    const affected = await PlayerModel.delete(3);

    assert.equal(affected, 1);
    const [query, params] = queryMock.mock.calls[0].arguments;
    assert.match(query as unknown as string, /DELETE FROM player/);
    assert.deepEqual(params, [3]);
  });
});

// ============================================================
// 2. TEST PlayerController — PlayerModel di-mock, req/res dipalsukan
// ============================================================
describe('PlayerController', () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  it('getAll balas 200 + data kalau PlayerModel.getAll berhasil', async () => {
    const fakeData = [{ id: 1, nama: 'Agus', alamat: 'Kamu', rank: 'Pro' }];
    mock.method(PlayerModel, 'getAll', async () => fakeData);

    const req = {} as MockRequest;
    const res = createMockResponse();

    await PlayerController.getAll(req as any, res as any);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, data: fakeData });
  });

  it('getAll balas 500 kalau PlayerModel.getAll melempar error', async () => {
    mock.method(PlayerModel, 'getAll', async () => {
      throw new Error('DB down');
    });

    const req = {} as MockRequest;
    const res = createMockResponse();

    await PlayerController.getAll(req as any, res as any);

    assert.equal(res.statusCode, 500);
    assert.equal(res.body.success, false);
  });

  it('getById balas 200 + data kalau player ditemukan', async () => {
    const fakePlayer = { id: 5, nama: 'Zeta', alamat: 'End', rank: 'Legend' };
    mock.method(PlayerModel, 'getById', async () => fakePlayer);

    const req = { params: { id: '5' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.getById(req as any, res as any);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, data: fakePlayer });
  });

  it('getById balas 404 kalau player tidak ditemukan', async () => {
    mock.method(PlayerModel, 'getById', async () => undefined);

    const req = { params: { id: '999' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.getById(req as any, res as any);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
  });

  // ------------------------------------------------------------
  // Test baru: validasi ID param (helper parseValidId di playerController.ts).
  // Sebelumnya id diambil dengan parseInt(p_req.params.id) tanpa validasi,
  // jadi id seperti "abc" akan menghasilkan NaN yang tetap diteruskan ke
  // PlayerModel. Sekarang controller harus menolaknya dengan 400 SEBELUM
  // memanggil PlayerModel sama sekali.
  // ------------------------------------------------------------
  it('getById balas 400 kalau id di URL bukan angka (tidak sampai memanggil PlayerModel.getById)', async () => {
    const getByIdMock = mock.method(PlayerModel, 'getById', async () => undefined);

    const req = { params: { id: 'abc' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.getById(req as any, res as any);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    // Validasi id harus berhenti SEBELUM menyentuh database.
    assert.equal(getByIdMock.mock.callCount(), 0);
  });

  it('create balas 400 kalau ada field yang kosong (tidak sampai memanggil PlayerModel.create)', async () => {
    const createMock = mock.method(PlayerModel, 'create', async () => 1);

    const req = { body: { nama: 'Agus', alamat: '', rank: 'Pro' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.create(req as any, res as any);

    assert.equal(res.statusCode, 400);
    // Validasi harus berhenti SEBELUM menyentuh database.
    assert.equal(createMock.mock.callCount(), 0);
  });

  // ------------------------------------------------------------
  // Test baru: validasi panjang maksimal (skema Zod playerInputSchema).
  // Kolom di database adalah VARCHAR(100) (lihat database.sql), jadi string
  // yang lebih panjang dari 100 karakter harus ditolak dengan 400 SEBELUM
  // sampai ke PlayerModel.create (dan pada akhirnya ke query INSERT).
  // ------------------------------------------------------------
  it('create balas 400 kalau nama lebih dari 100 karakter (tidak sampai memanggil PlayerModel.create)', async () => {
    const createMock = mock.method(PlayerModel, 'create', async () => 1);

    // 'a'.repeat(101) menghasilkan string sepanjang 101 karakter, 1 lebih
    // panjang dari batas maksimal 100 di skema validasi.
    const req = {
      body: { nama: 'a'.repeat(101), alamat: 'Sini', rank: 'Newbie' },
    } as MockRequest;
    const res = createMockResponse();

    await PlayerController.create(req as any, res as any);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(createMock.mock.callCount(), 0);
  });

  it('create balas 201 + data (termasuk id baru) kalau berhasil', async () => {
    mock.method(PlayerModel, 'create', async () => 10);

    const req = { body: { nama: 'Baru', alamat: 'Sini', rank: 'Newbie' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.create(req as any, res as any);

    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.body, {
      success: true,
      message: 'Player berhasil ditambahkan',
      data: { id: 10, nama: 'Baru', alamat: 'Sini', rank: 'Newbie' },
    });
  });

  it('update balas 400 kalau id di URL bukan angka (tidak sampai memanggil PlayerModel.update)', async () => {
    const updateMock = mock.method(PlayerModel, 'update', async () => 1);

    const req = { params: { id: 'abc' }, body: { nama: 'A', alamat: 'B', rank: 'C' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.update(req as any, res as any);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(updateMock.mock.callCount(), 0);
  });

  it('update balas 400 kalau body tidak valid (field kosong), meski id valid', async () => {
    const updateMock = mock.method(PlayerModel, 'update', async () => 1);

    const req = { params: { id: '7' }, body: { nama: '', alamat: 'B', rank: 'C' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.update(req as any, res as any);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(updateMock.mock.callCount(), 0);
  });

  it('update balas 404 kalau affectedRows 0 (id tidak ditemukan)', async () => {
    mock.method(PlayerModel, 'update', async () => 0);

    const req = { params: { id: '999' }, body: { nama: 'A', alamat: 'B', rank: 'C' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.update(req as any, res as any);

    assert.equal(res.statusCode, 404);
  });

  it('update balas 200 kalau berhasil', async () => {
    mock.method(PlayerModel, 'update', async () => 1);

    const req = { params: { id: '7' }, body: { nama: 'A', alamat: 'B', rank: 'C' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.update(req as any, res as any);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
  });

  it('delete balas 400 kalau id di URL bukan angka (tidak sampai memanggil PlayerModel.delete)', async () => {
    const deleteMock = mock.method(PlayerModel, 'delete', async () => 1);

    const req = { params: { id: '-5' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.delete(req as any, res as any);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(deleteMock.mock.callCount(), 0);
  });

  it('delete balas 404 kalau affectedRows 0 (id tidak ditemukan)', async () => {
    mock.method(PlayerModel, 'delete', async () => 0);

    const req = { params: { id: '999' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.delete(req as any, res as any);

    assert.equal(res.statusCode, 404);
  });

  it('delete balas 200 kalau berhasil', async () => {
    mock.method(PlayerModel, 'delete', async () => 1);

    const req = { params: { id: '3' } } as MockRequest;
    const res = createMockResponse();

    await PlayerController.delete(req as any, res as any);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
  });
});
