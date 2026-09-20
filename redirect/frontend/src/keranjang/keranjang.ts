import { requireLogin } from '../authApi.js';

const welcomeText = document.getElementById('welcomeText') as HTMLParagraphElement;

async function init() {
    const status = await requireLogin();
    if (!status) return;
    welcomeText.textContent = `Halo, ${status.username}! Keranjangmu masih kosong.`;
}

init();

export { };
