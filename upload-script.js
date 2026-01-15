document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Cek Login User
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Tampilkan User di Navbar
    const userDisplay = document.getElementById('userDisplay');
    if(userDisplay) userDisplay.innerText = `Halo, ${user}`;
    
    const savedPhoto = localStorage.getItem(`profilePic_${user}`);
    if (savedPhoto) {
        document.querySelector('.avatar').src = savedPhoto;
    }

    // 2. Fitur Preview Gambar Cover
    const coverInput = document.getElementById('bookCover');
    const preview = document.getElementById('coverPreview');
    
    if(coverInput) {
        coverInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. Proses Submit Form (Upload)
    const form = document.querySelector('.upload-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Ambil nilai dari input
            const title = document.getElementById('bookTitle').value;
            const author = document.getElementById('bookAuthor').value;
            const category = document.getElementById('bookCategory').value;
            const desc = document.getElementById('bookDesc').value;
            
            const coverFile = document.getElementById('bookCover').files[0];
            const pdfFile = document.getElementById('bookFile').files[0];

            if(coverFile && pdfFile) {
                // Baca file Cover dulu
                const readerCover = new FileReader();
                readerCover.onload = function(eCover) {
                    
                    // Setelah cover terbaca, baca file PDF
                    const readerPdf = new FileReader();
                    readerPdf.onload = function(ePdf) {
                        
                        // Buat Objek Buku Baru
                        const newBook = {
                            id: 'U' + Date.now(), // ID unik berdasarkan waktu
                            title: title,
                            author: author,
                            category: category,
                            desc: desc,
                            rating: 5.0, // Rating default
                            image: eCover.target.result, // Simpan gambar (Base64)
                            file: ePdf.target.result,    // Simpan PDF (Base64)
                            uploadedBy: user,
                            date: new Date().toLocaleDateString()
                        };

                        // Simpan ke LocalStorage
                        let myBooks = JSON.parse(localStorage.getItem('myUploadedBooks') || '[]');
                        myBooks.push(newBook);
                        localStorage.setItem('myUploadedBooks', JSON.stringify(myBooks));

                        alert('Buku berhasil diterbitkan! 📚');
                        window.location.href = 'dashboard.html';
                    };
                    
                    // Mulai baca PDF
                    readerPdf.readAsDataURL(pdfFile);
                };
                
                // Mulai baca Cover
                readerCover.readAsDataURL(coverFile);
            } else {
                alert('Mohon lengkapi file Cover dan PDF.');
            }
        });
    }

    // 4. Logika Dropdown Navbar
    const trigger = document.getElementById('profileTrigger');
    const menu = document.getElementById('profileDropdown');
    
    if(trigger && menu) {
        trigger.onclick = (e) => { 
            e.stopPropagation(); 
            menu.classList.toggle('active'); 
        }
        window.onclick = () => menu.classList.remove('active');
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if(logoutBtn) {
        logoutBtn.onclick = () => {
            if(confirm('Yakin ingin logout?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        }
    }
});