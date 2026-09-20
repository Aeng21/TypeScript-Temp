import { getAuthStatus } from '../authApi.js';

const btnTambahKeranjang = document.getElementById('btnTambahKeranjang') as HTMLButtonElement;

btnTambahKeranjang.addEventListener('click', async () => {
    const status = await getAuthStatus();
    if (status.loggedIn) {
        window.location.href = '/src/keranjang/keranjang.html';
    } else {
        window.location.href = '/src/auth/login.html';
    }
});

export { };
