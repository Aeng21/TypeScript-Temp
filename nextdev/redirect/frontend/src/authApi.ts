const AUTH_API_URL = 'http://localhost:3001/api/auth';

export type UserRole = 'admin' | 'customer';

export interface AuthStatus {
    loggedIn: boolean;
    username?: string;
    role?: UserRole;
    redirectTo?: string;
}

export interface LoginResult {
    username: string;
    role: UserRole;
    redirectTo: string;
}

interface ApiResult<T> {
    success: boolean;
    message?: string;
    data?: T;
}

async function authFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    const res = await fetch(`${AUTH_API_URL}${path}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const result = (await res.json()) as ApiResult<T>;
    if (!res.ok || !result.success) {
        return { success: false, message: result.message || 'Terjadi kesalahan, silakan coba lagi.' };
    }
    return result;
}

export async function getAuthStatus(): Promise<AuthStatus> {
    try {
        const result = await authFetch<AuthStatus>('/status');
        if (result.success) return result.data as AuthStatus;
        return { loggedIn: false };
    } catch (error) {
        console.error('Gagal mengecek status login:', error);
        return { loggedIn: false };
    }
}

export async function login(username: string, password: string): Promise<LoginResult | null> {
    try {
        const result = await authFetch<LoginResult>('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
        if (result.success) return result.data as LoginResult;
        alert('Login gagal: ' + result.message);
        return null;
    } catch (error) {
        console.error('Error login:', error);
        alert('Terjadi kesalahan saat login.');
        return null;
    }
}

export async function register(username: string, password: string, role: UserRole): Promise<boolean> {
    try {
        const result = await authFetch('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, role }),
        });
        if (result.success) {
            alert('Akun berhasil dibuat, silakan login.');
            return true;
        }
        alert('Gagal membuat akun: ' + result.message);
        return false;
    } catch (error) {
        console.error('Error register:', error);
        alert('Terjadi kesalahan saat membuat akun.');
        return false;
    }
}

export async function logout(): Promise<void> {
    try {
        await authFetch('/logout', { method: 'POST' });
    } catch (error) {
        console.error('Error logout:', error);
    }
}

export async function requireLogin(requiredRole?: UserRole): Promise<AuthStatus | null> {
    const status = await getAuthStatus();
    if (!status.loggedIn || (requiredRole && status.role !== requiredRole)) {
        window.location.href = '/src/auth/login.html';
        return null;
    }
    return status;
}

export async function redirectIfAlreadyLoggedIn(): Promise<boolean> {
    const status = await getAuthStatus();
    if (status.loggedIn && status.redirectTo) {
        window.location.href = status.redirectTo;
        return true;
    }
    return false;
}
