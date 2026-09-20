import { requireLogin, logout } from '../authApi.js';

const welcomeText = document.getElementById('welcomeText') as HTMLParagraphElement;
const btnLogout = document.getElementById('btnLogout') as HTMLButtonElement;

async function init() {
    const status = await requireLogin('customer');
    if (!status) return;
    welcomeText.textContent = `Halo, ${status.username}! Kamu login sebagai customer.`;
}

btnLogout.addEventListener('click', async () => {
    await logout();
    window.location.href = '/src/auth/login.html';
});

init();

export { };
