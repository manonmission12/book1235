document.addEventListener('DOMContentLoaded', () => {
    // FUNGSI TOAST
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

    const signupForm = document.querySelector('.signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Ambil Value
            const userElement = document.getElementById('newUsername');
            const passElement = document.getElementById('newPassword');
            const confirmElement = document.getElementById('confirmPassword');

            // Cek apakah elemen ada di HTML (Pencegahan Error)
            if (!userElement || !passElement || !confirmElement) {
                showToast('Error: Form HTML tidak lengkap!', 'error');
                return;
            }

            const user = userElement.value.trim();
            const pass = passElement.value.trim();
            const confirm = confirmElement.value.trim();

            // Validasi Input Kosong
            if (!user || !pass || !confirm) {
                showToast('Semua kolom wajib diisi!', 'error');
                return;
            }

            // Validasi Password Match
            if (pass !== confirm) {
                showToast('Konfirmasi password tidak cocok!', 'error');
                return;
            }

            // --- BAGIAN PENTING: MENGAMBIL DATA DENGAN AMAN ---
            let users = [];
            try {
                const storedData = localStorage.getItem('registeredUsers');
                users = JSON.parse(storedData) || [];
            } catch (error) {
                // Jika data rusak, reset jadi array kosong
                users = [];
            }

            // Pastikan users adalah Array (jika bukan, reset)
            if (!Array.isArray(users)) {
                users = [];
            }

            // Cek Username Ganda
            if (users.some(u => u.username === user)) {
                showToast('Username sudah terdaftar!', 'error');
                return;
            }

            // Simpan Data Baru
            users.push({ username: user, password: pass });
            localStorage.setItem('registeredUsers', JSON.stringify(users));
            
            showToast('Pendaftaran Berhasil! Mengalihkan...', 'success');
            
            // Redirect ke index.html (File Login kamu)
            setTimeout(() => window.location.href = 'index.html', 1500);
        });
    }
});