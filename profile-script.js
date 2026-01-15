document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CEK LOGIN
    const user = localStorage.getItem('currentUser');
    if (!user) { window.location.href = 'index.html'; return; }

    const STORAGE_KEY = `savedBooks_${user}`;
    const PHOTO_KEY = `profilePic_${user}`;

    // 2. LOAD DATA PROFIL
    document.getElementById('profUser').innerText = user;
    document.getElementById('valUsername').innerText = `@${user}`;

    // Load Foto Profil
    const savedPhoto = localStorage.getItem(PHOTO_KEY);
    const imgEl = document.getElementById('largeProfileImg');
    if (imgEl) {
        imgEl.src = savedPhoto || `https://ui-avatars.com/api/?name=${user}&background=0D8ABC&color=fff&size=150`;
    }

    // 3. LOAD KOLEKSI BUKU SAYA
    const savedListEl = document.getElementById('savedBookList');
    const countEl = document.getElementById('valSavedBooks');

    function renderSavedBooks() {
        // Ambil data terbaru dari LocalStorage
        const savedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Update Statistik Jumlah Buku
        if(countEl) countEl.innerText = `${savedBooks.length} Buku`;

        savedListEl.innerHTML = ''; // Reset tampilan

        if (savedBooks.length === 0) {
            savedListEl.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #777;">
                    <i class="fas fa-bookmark" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>Belum ada buku yang disimpan.</p>
                    <a href="dashboard.html" style="color: var(--primary); text-decoration: none; font-weight: bold; margin-top: 10px; display: inline-block;">Cari di Dashboard &rarr;</a>
                </div>
            `;
            return;
        }

        savedBooks.forEach((book) => {
            const card = document.createElement('div');
            card.className = 'saved-card';
            
            // Cek sumber gambar & pdf (apakah dari upload user atau bawaan)
            const imgSrc = book.img || book.image;
            const pdfLink = book.pdf || book.file;

            card.innerHTML = `
                <img src="${imgSrc}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/150x220?text=No+Cover'">
                <div class="saved-info">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                    <div class="card-actions">
                        <button class="btn-mini btn-read" onclick="window.open('${pdfLink}', '_blank')">
                            <i class="fas fa-book-open"></i>
                        </button>
                        <button class="btn-mini btn-remove" onclick="removeBook('${book.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            savedListEl.appendChild(card);
        });
    }

    // Fungsi Hapus Buku (Global)
    window.removeBook = (bookId) => {
        if(confirm("Hapus buku ini dari koleksi?")) {
            let savedBooks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            
            // Filter buku yang ID-nya BUKAN yang mau dihapus
            savedBooks = savedBooks.filter(b => b.id !== bookId);
            
            // Simpan perubahan
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBooks));
            
            // Render ulang
            renderSavedBooks();
        }
    };

    // Render Pertama Kali
    renderSavedBooks();

    // 4. LOGIKA GANTI FOTO PROFIL
    const uploadInput = document.getElementById('uploadInput');
    if (uploadInput) {
        uploadInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { alert("Ukuran foto maksimal 2MB!"); return; }
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64 = e.target.result;
                    imgEl.src = base64;
                    localStorage.setItem(PHOTO_KEY, base64);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 5. LOGOUT
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            if (confirm("Logout sekarang?")) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        };
    }
});