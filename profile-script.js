document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. DARK MODE LOGIC (PERSISTENCE) ---
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const icon = themeToggle ? themeToggle.querySelector('i') : null;

    // Cek tema saat load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        if(icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

    // Toggle klik
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

    // --- 1. USER CHECK ---
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Update UI User Info
    document.getElementById('profileName').innerText = currentUser;
    document.getElementById('profileEmail').innerText = `${currentUser.toLowerCase().replace(/\s/g, '')}@student.com`; // Dummy email
    
    // Load Avatar
    const savedPhoto = localStorage.getItem(`profilePic_${currentUser}`);
    if (savedPhoto) {
        document.getElementById('profileImg').src = savedPhoto;
        document.querySelector('.profile-trigger img').src = savedPhoto;
    }
    document.querySelector('.user-name').innerText = currentUser;

    // --- 2. UPLOAD AVATAR ---
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgResult = e.target.result;
                document.getElementById('profileImg').src = imgResult;
                document.querySelector('.profile-trigger img').src = imgResult;
                localStorage.setItem(`profilePic_${currentUser}`, imgResult);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 3. LOAD BOOKS (KOLEKSI & UPLOAD) ---
    const savedListEl = document.getElementById('savedList');
    const uploadedListEl = document.getElementById('uploadedList');
    
    const savedBooks = JSON.parse(localStorage.getItem(`savedBooks_${currentUser}`) || '[]');
    const myUploads = JSON.parse(localStorage.getItem('myUploadedBooks') || '[]');

    // Update Stats
    document.getElementById('statCollection').innerText = savedBooks.length;
    document.getElementById('statUploads').innerText = myUploads.length;

    // Render Function
    function renderList(data, container, emptyMsg) {
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>${emptyMsg}</p>
                </div>`;
            return;
        }

        data.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const imgSrc = book.img || book.image || 'https://via.placeholder.com/300x450';
            
            // Layout Kartu Simpel
            card.innerHTML = `
                <img src="${imgSrc}" alt="${book.title}">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderList(savedBooks, savedListEl, "Belum ada buku yang disimpan.");
    renderList(myUploads, uploadedListEl, "Belum ada buku yang diupload.");

    // --- 4. TABS LOGIC ---
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-target')).classList.add('active');
        });
    });

    // --- 5. LOGOUT ---
    document.getElementById('logoutBtnProfile').addEventListener('click', () => {
        if(confirm('Yakin ingin keluar?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
});