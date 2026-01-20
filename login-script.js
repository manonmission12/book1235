document.addEventListener('DOMContentLoaded', () => {

    // Cek kalau sudah login, langsung lempar ke dashboard
    if(localStorage.getItem('currentUser')) {
        window.location.href = 'dashboard.html';
    }
    
    // Toggle Password Eye
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if(togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    // Login Logic
    const loginForm = document.getElementById('loginForm');
    const formSection = document.querySelector('.login-form-section'); // Ambil section formnya

    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const usernameInput = document.getElementById('username').value.trim();
            const passwordInputVal = document.getElementById('password').value;

            const storedUser = localStorage.getItem(`user_${usernameInput}`);

            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.password === passwordInputVal) {
                    // Login Sukses
                    localStorage.setItem('currentUser', usernameInput);
                    window.location.href = 'dashboard.html';
                } else {
                    // Login Gagal (Password Salah) -> Goyangkan Form!
                    triggerShake();
                    alert("Password salah!");
                }
            } else {
                // Login Gagal (Username Tidak Ada) -> Goyangkan Form!
                triggerShake();
                alert("Username tidak ditemukan.");
            }
        });
    }

    // Fungsi untuk membuat efek goyang
    function triggerShake() {
        if(formSection) {
            formSection.classList.add('shake');
            // Hapus class shake setelah animasinya selesai (500ms) biar bisa digoyang lagi
            setTimeout(() => {
                formSection.classList.remove('shake');
            }, 500);
        }
    }
});