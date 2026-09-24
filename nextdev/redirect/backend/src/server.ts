import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';

import authRoutes from './routes/authRoutes.js';
import { validateEnv } from './config/env.js';

dotenv.config();

const env = validateEnv();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:2001',
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

const sessionStore = new (MySQLStoreFactory(session))({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: env.DB_NAME,
});

app.use(session({
  store: sessionStore,
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Backend redirect (auth) berjalan dengan baik!',
    endpoints: {
      auth: '/api/auth',
    },
  });
});

app.use('/api/auth', authRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

app.use((err: unknown, req: Request, res: Response, next: express.NextFunction) => {
  console.error(err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    ...(isDev && err instanceof Error ? { error: err.message } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`Backend redirect (auth) berjalan di http://localhost:${PORT}`);
});
