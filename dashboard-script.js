document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CEK AUTENTIKASI ---
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Kunci Penyimpanan Khusus User
    const SAVED_KEY = `savedBooks_${user}`;

    // Tampilkan Nama & Foto
    const userDisplay = document.getElementById('userDisplay');
    if(userDisplay) userDisplay.innerText = `Halo, ${user} 👋`;

    const savedPhoto = localStorage.getItem(`profilePic_${user}`);
    const navAvatar = document.querySelector('.profile-trigger .avatar');
    if (savedPhoto && navAvatar) navAvatar.src = savedPhoto;

    // --- 2. DATABASE BUKU ---
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

    // --- 3. TOAST NOTIFICATION ---
    const showToast = (msg, type = 'success') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;";
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        const color = type === 'success' ? '#00b894' : '#ff7675';
        const icon = type === 'success' ? '✅' : '⚠️';
        
        toast.style.cssText = `
            background: rgba(20, 20, 20, 0.95);
            color: white; 
            padding: 15px 25px; 
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
            font-family: 'Inter', sans-serif; 
            font-size: 0.95rem;
            border-left: 5px solid ${color};
            backdrop-filter: blur(10px);
            display: flex; align-items: center; gap: 10px;
            animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;
        
        if (!document.getElementById('toast-style')) {
            const style = document.createElement('style');
            style.id = 'toast-style';
            style.innerHTML = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
            document.head.appendChild(style);
        }

        toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // --- 4. RENDER BUKU ---
    const bookList = document.getElementById('bookList');
    const searchBar = document.getElementById('searchBook');
    const categoryBtns = document.querySelectorAll('.btn-cat');

    function renderBooks(data, isSavedView = false) {
        bookList.innerHTML = '';
        
        if (data.length === 0) {
            // Pesan Beda kalau di menu Tersimpan vs Menu Biasa
            const emptyMsg = isSavedView 
                ? "Belum ada buku yang kamu simpan. Yuk mulai koleksi! 📚" 
                : "Buku tidak ditemukan...";
                
            bookList.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #aaa; margin-top: 50px;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>${emptyMsg}</p>
            </div>`;
            return;
        }

        data.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const imgSrc = book.img || book.image; 
            
            card.innerHTML = `
                <img src="${imgSrc}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/300x450?text=No+Cover'">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center;">
                         <span class="tag">${book.category}</span>
                         <span class="mini-rating">⭐ ${book.rating}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openModal(book));
            bookList.appendChild(card);
        });
    }

    // Render Awal (Semua Buku)
    renderBooks(allBooks);

    // --- 5. SEARCH & FILTER (UPDATE: FITUR TERSIMPAN) ---
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
            // Reset Active Class
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const cat = btn.getAttribute('data-cat');
            
            if (cat === 'all') {
                renderBooks(allBooks);
            } else if (cat === 'saved') {
                // LOGIKA KHUSUS: Ambil buku dari LocalStorage
                const mySaved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
                renderBooks(mySaved, true); // True = mode tersimpan
            } else {
                // Logika Filter Biasa
                renderBooks(allBooks.filter(b => b.category === cat));
            }
        });
    });

    // --- 6. MODAL & LOGIKA SIMPAN ---
    const modal = document.getElementById('detailModal');

    function openModal(book) {
        if (!modal) return;
        
        document.getElementById('modalImg').src = book.img || book.image;
        document.getElementById('modalTitle').innerText = book.title;
        document.getElementById('modalAuthor').innerText = book.author;
        document.getElementById('modalCategory').innerText = book.category;
        document.getElementById('modalRating').innerText = book.rating;

        // Tombol Baca
        const btnRead = document.querySelector('.btn-primary');
        if (btnRead) {
            const newBtnRead = btnRead.cloneNode(true);
            btnRead.parentNode.replaceChild(newBtnRead, btnRead);
            newBtnRead.onclick = () => {
                const pdfLink = book.file || book.pdf; 
                if (pdfLink) window.open(pdfLink, '_blank');
                else showToast('File PDF tidak ditemukan!', 'error');
            };
        }

        // Tombol Simpan
        let savedList = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
        const isSaved = savedList.some(item => item.id === book.id);
        
        const btnContainer = document.querySelector('.modal-actions');
        const oldBtn = btnContainer.querySelector('.btn-save-custom');
        if (oldBtn) oldBtn.remove();
        
        const btnSave = document.createElement('button');
        btnSave.className = 'btn-save-custom'; 
        
        btnSave.style.cssText = `
            margin-left: 15px;
            padding: 12px 25px;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 1rem;
            border: 2px solid transparent;
        `;

        const updateButtonStyle = (saved) => {
            if (saved) {
                btnSave.innerHTML = '<i class="fas fa-check-circle"></i> Tersimpan';
                btnSave.style.background = 'var(--primary)';
                btnSave.style.color = 'white';
                btnSave.style.boxShadow = '0 0 20px rgba(0, 180, 216, 0.6)';
                btnSave.style.borderColor = 'var(--primary)';
                btnSave.style.transform = 'scale(1.05)';
            } else {
                btnSave.innerHTML = '<i class="far fa-bookmark"></i> Simpan ke Koleksi';
                btnSave.style.background = 'transparent';
                btnSave.style.color = 'var(--primary)';
                btnSave.style.boxShadow = 'none';
                btnSave.style.borderColor = 'var(--primary)';
                btnSave.style.transform = 'scale(1)';
            }
        };

        updateButtonStyle(isSaved);

        btnSave.onclick = () => {
            btnSave.style.transform = 'scale(0.95)';
            setTimeout(() => {
                savedList = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
                const index = savedList.findIndex(item => item.id === book.id);

                if (index !== -1) {
                    savedList.splice(index, 1);
                    localStorage.setItem(SAVED_KEY, JSON.stringify(savedList));
                    updateButtonStyle(false);
                    showToast('Dihapus dari koleksi.');
                    
                    // FITUR TAMBAHAN: Kalau lagi di tab "Tersimpan", langsung refresh listnya
                    const activeBtn = document.querySelector('.btn-cat.active');
                    if (activeBtn && activeBtn.getAttribute('data-cat') === 'saved') {
                        renderBooks(savedList, true);
                    }

                } else {
                    savedList.push(book);
                    localStorage.setItem(SAVED_KEY, JSON.stringify(savedList));
                    updateButtonStyle(true);
                    showToast('Berhasil disimpan! 🎉');
                }
            }, 100);
        };

        btnContainer.appendChild(btnSave);
        modal.classList.add('active');
    }

    // Tutup Modal
    window.closeModal = () => { if(modal) modal.classList.remove('active'); };
    window.onclick = (e) => {
        if (e.target === modal) closeModal();
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown && !e.target.closest('.profile-trigger')) dropdown.classList.remove('active');
    };

    // Navigasi
    const trigger = document.getElementById('profileTrigger');
    const dropdown = document.getElementById('profileDropdown');
    if(trigger) {
        trigger.onclick = (e) => { e.stopPropagation(); dropdown.classList.toggle('active'); };
    }
    document.getElementById('logoutBtn').onclick = () => {
        if(confirm('Yakin mau logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    };
});