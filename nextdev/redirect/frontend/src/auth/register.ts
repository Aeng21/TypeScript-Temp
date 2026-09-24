import { register, redirectIfAlreadyLoggedIn } from '../authApi.js';
import type { UserRole } from '../authApi.js';

const formRegister = document.getElementById('formRegister') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const roleSelect = document.getElementById('role') as HTMLSelectElement;

redirectIfAlreadyLoggedIn();

formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const role = roleSelect.value as UserRole;

    if (!username || !password) {
        alert('Username dan password harus diisi!');
        return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        alert('Password minimal 8 karakter dan harus mengandung huruf serta angka!');
        return;
    }

    const success = await register(username, password, role);
    if (success) {
        window.location.href = '/src/auth/login.html';
    }
});

export { };
