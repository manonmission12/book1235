document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. DARK MODE LOGIC ---
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        if(icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                root.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                if(icon) icon.classList.replace('fa-sun', 'fa-moon');
            } else {
                root.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if(icon) icon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }

    // --- 1. USER & AVATAR ---
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) { window.location.href = 'index.html'; return; }

    document.getElementById('profileName').innerText = currentUser;
    document.querySelector('.user-name').innerText = currentUser;
    
    // Load Avatar
    const savedPhoto = localStorage.getItem(`profilePic_${currentUser}`);
    if (savedPhoto) {
        document.getElementById('profileImg').src = savedPhoto;
        document.getElementById('navAvatar').src = savedPhoto;
    }

    // Avatar Upload
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgResult = e.target.result;
                document.getElementById('profileImg').src = imgResult;
                document.getElementById('navAvatar').src = imgResult;
                localStorage.setItem(`profilePic_${currentUser}`, imgResult);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 2. DATA LOAD & STATE ---
    let savedBooks = [];
    let myUploads = [];

    const savedListEl = document.getElementById('savedList');
    const uploadedListEl = document.getElementById('uploadedList');

    function loadData() {
        savedBooks = JSON.parse(localStorage.getItem(`savedBooks_${currentUser}`) || '[]');
        myUploads = JSON.parse(localStorage.getItem('myUploadedBooks') || '[]');
        
        document.getElementById('statCollection').innerText = savedBooks.length;
        document.getElementById('statUploads').innerText = myUploads.length;
        
        applyFilters(); // Render data
    }

    // --- 3. FILTER, SEARCH & SORT LOGIC ---
    const searchInput = document.getElementById('profileSearch');
    const sortSelect = document.getElementById('profileSort');
    const tabs = document.querySelectorAll('.tab-btn');
    let currentTab = 'koleksi'; // 'koleksi' or 'upload'

    // Event Listeners
    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-target')).classList.add('active');
            
            currentTab = tab.getAttribute('data-target');
            applyFilters();
        });
    });

    function applyFilters() {
        const keyword = searchInput.value.toLowerCase();
        const sortType = sortSelect.value;
        
        // Pilih data berdasarkan tab aktif
        let data = currentTab === 'koleksi' ? [...savedBooks] : [...myUploads];

        // 1. FILTER SEARCH
        if (keyword) {
            data = data.filter(b => b.title.toLowerCase().includes(keyword) || b.author.toLowerCase().includes(keyword));
        }

        // 2. SORTING
        data.sort((a, b) => {
            if (sortType === 'az') return a.title.localeCompare(b.title);
            if (sortType === 'za') return b.title.localeCompare(a.title);
            if (sortType === 'newest') return (b.id > a.id) ? 1 : -1; // Asumsi ID mengandung timestamp
            if (sortType === 'oldest') return (a.id > b.id) ? 1 : -1;
            return 0;
        });

        // 3. RENDER
        const container = currentTab === 'koleksi' ? savedListEl : uploadedListEl;
        const isUploadMode = (currentTab === 'upload');
        renderList(data, container, "Buku tidak ditemukan.", isUploadMode);
    }

    // --- 4. RENDER FUNCTION (WITH EDIT & DELETE) ---
    function renderList(data, container, emptyMsg, isUploadMode) {
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>${emptyMsg}</p></div>`;
            return;
        }

        data.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const imgSrc = book.img || 'https://via.placeholder.com/300x450';
            
            let actionButtons = '';
            
            // Tombol Edit & Delete HANYA di Tab Upload
            if (isUploadMode) {
                actionButtons = `
                    <div class="card-actions">
                        <button class="action-btn btn-edit" title="Edit Buku">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="action-btn btn-delete" title="Hapus Buku">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
            }

            card.innerHTML = `
                ${actionButtons}
                <img src="${imgSrc}" alt="${book.title}">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                </div>
            `;

            // Event Listeners Tombol
            if (isUploadMode) {
                // EDIT
                card.querySelector('.btn-edit').addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Redirect ke halaman upload dengan parameter ID
                    window.location.href = `upload.html?edit=${book.id}`;
                });

                // DELETE
                card.querySelector('.btn-delete').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm(`Hapus "${book.title}" permanen?`)) {
                        deleteBook(book.id);
                    }
                });
            }

            container.appendChild(card);
        });
    }

    function deleteBook(id) {
        let uploads = JSON.parse(localStorage.getItem('myUploadedBooks') || '[]');
        const updated = uploads.filter(b => b.id !== id);
        localStorage.setItem('myUploadedBooks', JSON.stringify(updated));
        alert('Buku berhasil dihapus.');
        loadData(); // Refresh
    }

    // --- 5. LOGOUT ---
    document.getElementById('logoutBtnProfile').addEventListener('click', () => {
        if(confirm('Keluar akun?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });

    // START
    loadData();
});