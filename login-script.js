document.addEventListener('DOMContentLoaded', () => {
    // FUNGSI TOAST (Notifikasi)
    const showToast = (message, type = 'success') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Cek jika sudah login
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
    }

    const loginForm = document.querySelector('.login-form');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Fitur Mata Password
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('username').value.trim();
            const pass = passwordInput.value.trim();

            console.log("Mencoba login dengan:", user, pass); // Cek di Console Browser

            // --- AMBIL DATA USER AMAN ---
            let users = [];
            try {
                const storedData = localStorage.getItem('registeredUsers');
                console.log("Data di Database:", storedData); // Cek isi database
                users = JSON.parse(storedData) || [];
            } catch (e) {
                users = [];
            }
            
            if (!Array.isArray(users)) users = [];

            // 1. Cek apakah database kosong
            if (users.length === 0 && user !== 'admin') {
                showToast('Belum ada user terdaftar! Silakan daftar dulu.', 'error');
                return;
            }

            // 2. Cari User
            const foundUser = users.find(u => u.username === user);
            
            if (!foundUser) {
                // Jika user admin bawaan
                if (user === 'admin' && pass === '123') {
                    localStorage.setItem('currentUser', user);
                    showToast('Login Admin Berhasil!', 'success');
                    setTimeout(() => window.location.href = 'dashboard.html', 1000);
                    return;
                }
                showToast('Username tidak ditemukan! Coba daftar dulu.', 'error');
                return;
            }

            // 3. Cek Password
            if (foundUser.password !== pass) {
                showToast('Password salah!', 'error');
                return;
            }

            // LOGIN SUKSES
            localStorage.setItem('currentUser', user);
            showToast('Login Berhasil! Mengalihkan...', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        });
    }
});