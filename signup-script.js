document.addEventListener('DOMContentLoaded', () => {
    
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validasi Sederhana
            if (username.length < 3) {
                alert("Username minimal 3 karakter."); return;
            }
            if (password.length < 6) {
                alert("Password minimal 6 karakter."); return;
            }
            if (password !== confirmPassword) {
                alert("Password tidak cocok!"); return;
            }
            if (localStorage.getItem(`user_${username}`)) {
                alert("Username sudah terpakai! Pilih yang lain."); return;
            }

            // Simpan Data User Baru
            const userData = { username, password, joinDate: new Date().toLocaleDateString() };
            localStorage.setItem(`user_${username}`, JSON.stringify(userData));

            // --- BAGIAN MERIAH: EFEK KONFETI! ---
            // Kita tembakkan konfeti dari kiri dan kanan bawah
            var duration = 2 * 1000; // 2 detik
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            function randomInRange(min, max) { return Math.random() * (max - min) + min; }

            var interval = setInterval(function() {
              var timeLeft = animationEnd - Date.now();
              if (timeLeft <= 0) { return clearInterval(interval); }
              var particleCount = 50 * (timeLeft / duration);
              // Tembak dari kiri
              confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
              // Tembak dari kanan
              confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);

            // Ubah teks tombol sementara
            const btn = signupForm.querySelector('.login-button');
            const originalText = btn.innerText;
            btn.innerText = "Hore! Berhasil... 🥳";
            btn.disabled = true;

            // Tunggu 2.5 detik buat menikmati konfeti sebelum pindah
            setTimeout(() => {
                 window.location.href = 'index.html';
            }, 2500);
        });
    }
});