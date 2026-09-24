import { login, redirectIfAlreadyLoggedIn } from '../authApi.js';

const formLogin = document.getElementById('formLogin') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;

redirectIfAlreadyLoggedIn();

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Username dan password harus diisi!');
        return;
    }

    const result = await login(username, password);
    if (result) {
        window.location.href = result.redirectTo;
    }
});

export { };
