import 'express-session';
import { UserRole } from '../models/userModel.js';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    username?: string;
    role?: UserRole;
  }
}
