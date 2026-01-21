document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. LOGIKA DARK MODE ---
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const icon = themeToggle.querySelector('i');

    // Cek LocalStorage saat load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    // Event Listener Tombol Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            root.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });

    // --- 1. AUTH CHECK ---
    const currentUser = localStorage.getItem('currentUser'); 
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    const SAVED_KEY = `savedBooks_${currentUser}`;
    const userDisplay = document.getElementById('userDisplay');
    if(userDisplay) userDisplay.innerText = `Halo, ${currentUser}`;

    const savedPhoto = localStorage.getItem(`profilePic_${currentUser}`);
    const navAvatar = document.querySelector('.profile-trigger .avatar');
    if (savedPhoto && navAvatar) navAvatar.src = savedPhoto;

    // --- 2. DATA BUKU ---
    const defaultBooks = [
        { id: "B1", title: "Filosofi Teras", author: "Henry Manampiring", category: "Filsafat", rating: 4.8, img: "covers/filosofi teras.png", pdf: "books/1. Filosofi Teras.pdf" },
        { id: "B2", title: "This is Marketing", author: "Seth Godin", category: "Bisnis", rating: 4.6, img: "covers/this is marketing.png", pdf: "books/2. This is marketing.pdf" },
        { id: "B3", title: "Atomic Habits", author: "James Clear", category: "Self-Improvement", rating: 4.9, img: "covers/atomic habits.png", pdf: "books/3. Atomic Habits.pdf" },
        { id: "B4", title: "Psychology of Money", author: "Morgan Housel", category: "Self-Improvement", rating: 4.7, img: "covers/the psychology of money.png", pdf: "books/4. The Psychology of Money.pdf" },
        { id: "B5", title: "Citizen 4.0", author: "Hermawan Kartajaya", category: "Bisnis", rating: 4.5, img: "covers/citizen 4.0.png", pdf: "books/5. Citizen 4.0.pdf" },
        { id: "B6", title: "Find Your Why", author: "Simon Sinek", category: "Self-Improvement", rating: 4.4, img: "covers/find your why.png", pdf: "books/6. Find your why.pdf" },
        { id: "B7", title: "How To Win Friends", author: "Dale Carnegie", category: "Self-Improvement", rating: 4.8, img: "covers/how to win friends&influence people.png", pdf: "books/7. How to win friend & influence people.pdf" },
        { id: "B8", title: "Marketing 4.0", author: "Philip Kotler", category: "Bisnis", rating: 4.7, img: "covers/marketing 4.0.png", pdf: "books/8. Marketing 4.0.pdf" },
        { id: "B9", title: "Marketing in Crisis", author: "Rhenald Kasal", category: "Bisnis", rating: 4.5, img: "covers/marketing in crisis.png", pdf: "books/9. Marketing in Crisis.pdf" },
        { id: "B10", title: "Mindset", author: "Dr. Carol S. Dweck", category: "Self-Improvement", rating: 4.3, img: "covers/mindset.png", pdf: "books/10. Mindset.pdf" },
        { id: "B11", title: "Bodo Amat", author: "Mark Manson", category: "Self-Improvement", rating: 4.6, img: "covers/sebuah seni untuk bersikap bodo amat.png", pdf: "books/11. Sebuah Seni untuk Bersikap Bodo Amat.pdf" },
        { id: "B12", title: "Thinking, Fast & Slow", author: "Daniel Kahneman", category: "Self-Improvement", rating: 4.7, img: "covers/thinking fast and slow.png", pdf: "books/12. Thinking, fast and slow.pdf" },
        { id: "B13", title: "Grit", author: "Angela Duckworth", category: "Self-Improvement", rating: 4.5, img: "covers/grit.png", pdf: "books/grit.pdf" },
        { id: "B14", title: "Show Your Work", author: "Austin Kleon", category: "Self-Improvement", rating: 4.8, img: "covers/Show Your Work.png", pdf: "books/14. Show your work.pdf" },
        { id: "B15", title: "Intelligent Investor", author: "Benjamin Graham", category: "Bisnis", rating: 4.6, img: "covers/the intelligent investor.png", pdf: "books/15. The Intelligent Investor.pdf" },
        { id: "B16", title: "Think Like a Freak", author: "Steven D. Levitt", category: "Self-Improvement", rating: 4.9, img: "covers/think like a freak.png", pdf: "books/16. Think like a freak.pdf" }
    ];

    let uploadedBooks = [];
    try {
        uploadedBooks = JSON.parse(localStorage.getItem('myUploadedBooks') || '[]');
    } catch (e) { uploadedBooks = []; }
    let allBooks = [...uploadedBooks.reverse(), ...defaultBooks];

    // --- 3. TOAST MSG ---
    const showToast = (msg, type = 'success') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        // Warna toast tetap hitam putih
        
        toast.style.cssText = `
            background: var(--text-primary); color: var(--bg-card); 
            padding: 12px 20px; border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3); font-family: 'Inter', sans-serif; 
            font-size: 0.9rem; font-weight: 500; border: 1px solid var(--border);
            display: flex; align-items: center; gap: 10px;
            animation: fadeIn 0.3s forwards;
        `;
        
        const icon = type === 'success' ? '✅' : '⚠️';
        toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    // --- 4. RENDER FUNCTION ---
    const bookList = document.getElementById('bookList');
    const searchBar = document.getElementById('searchBook');
    const categoryBtns = document.querySelectorAll('.btn-cat');

    function renderBooks(data, isSavedView = false) {
        bookList.innerHTML = '';
        
        if (data.length === 0) {
            bookList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-tertiary); margin-top: 60px;">
                <i class="fas fa-search" style="font-size: 2.5rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <p style="font-weight:500;">Buku tidak ditemukan.</p>
            </div>`;
            return;
        }

        data.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            // HAPUS SEMUA LOGIKA WARNA RANDOM

            const imgSrc = book.img || book.image; 
            
            card.innerHTML = `
                <img src="${imgSrc}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Cover'">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    
                    <div class="card-footer">
                         <span class="tag">${book.category}</span>
                         <span class="mini-rating">⭐ ${book.rating}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openModal(book));
            bookList.appendChild(card);
        });
    }

    renderBooks(allBooks); 

    // --- 5. SEARCH & FILTER ---
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            renderBooks(allBooks.filter(b => 
                b.title.toLowerCase().includes(keyword) || 
                b.author.toLowerCase().includes(keyword)
            ));
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-cat');
            
            if (cat === 'all') renderBooks(allBooks);
            else if (cat === 'saved') {
                const mySaved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
                renderBooks(mySaved, true);
            } else {
                renderBooks(allBooks.filter(b => b.category === cat));
            }
        });
    });

    // --- 6. MODAL & NOTES ---
    const modal = document.getElementById('detailModal');

    function openModal(book) {
        if (!modal) return;
        
        document.getElementById('modalImg').src = book.img || book.image;
        document.getElementById('modalTitle').innerText = book.title;
        document.getElementById('modalAuthor').innerText = book.author;
        document.getElementById('modalCategory').innerText = book.category;
        document.getElementById('modalRating').innerText = book.rating;
        
        const btnContainer = document.querySelector('.modal-actions');
        btnContainer.innerHTML = ''; 

        // Read Button
        const btnRead = document.createElement('button');
        btnRead.className = 'btn-primary';
        btnRead.innerHTML = 'Baca Sekarang';
        btnRead.onclick = () => {
            const pdfLink = book.file || book.pdf; 
            if (pdfLink) window.open(pdfLink, '_blank');
            else showToast('PDF tidak tersedia', 'error');
        };
        btnContainer.appendChild(btnRead);

        // Save Button (Monochrome Style)
        let savedList = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
        const isSaved = savedList.some(item => item.id === book.id);
        
        const btnSave = document.createElement('button');
        
        const updateSaveBtn = (saved) => {
            btnSave.className = 'btn-primary'; 
            btnSave.style.background = 'transparent';
            btnSave.style.border = '1px solid var(--text-primary)';
            btnSave.style.color = 'var(--text-primary)';
            // Teks saja yang berubah
            btnSave.innerHTML = saved ? '<i class="fas fa-check"></i> Tersimpan' : '<i class="far fa-bookmark"></i> Simpan';
        };
        updateSaveBtn(isSaved);

        btnSave.onclick = () => {
            savedList = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
            const index = savedList.findIndex(item => item.id === book.id);
            
            if (index !== -1) {
                savedList.splice(index, 1);
                showToast('Dihapus dari koleksi');
                updateSaveBtn(false);
            } else {
                savedList.push(book);
                showToast('Disimpan ke koleksi');
                updateSaveBtn(true);
            }
            localStorage.setItem(SAVED_KEY, JSON.stringify(savedList));
            
            if (document.querySelector('.btn-cat.active').getAttribute('data-cat') === 'saved') {
                renderBooks(savedList, true);
            }
        };
        btnContainer.appendChild(btnSave);

        // Notes Logic
        const noteInput = document.getElementById('noteInput');
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        const saveStatus = document.getElementById('saveStatus');
        
        const noteKey = `note_${currentUser}_${book.id}`;
        noteInput.value = localStorage.getItem(noteKey) || '';
        saveStatus.style.display = 'none';

        saveNoteBtn.onclick = () => {
            localStorage.setItem(noteKey, noteInput.value);
            saveStatus.style.display = 'inline-block';
            setTimeout(() => { saveStatus.style.display = 'none'; }, 2000);
        };

        modal.classList.add('active');
    }

    window.closeModal = () => { if(modal) modal.classList.remove('active'); };
    window.onclick = (e) => {
        if (e.target === modal) closeModal();
        const dd = document.getElementById('profileDropdown');
        if (dd && !e.target.closest('.profile-trigger')) dd.classList.remove('active');
    };

    const trigger = document.getElementById('profileTrigger');
    const dropdown = document.getElementById('profileDropdown');
    if(trigger) {
        trigger.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); };
    }
    
    document.getElementById('logoutBtn').onclick = () => {
        if(confirm('Logout dari akun?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    };
});