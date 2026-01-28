document.addEventListener('DOMContentLoaded', () => {

    // --- 0. DARK MODE LOGIC ---
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const icon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

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
    document.getElementById('userDisplay').innerText = currentUser;
    const savedPhoto = localStorage.getItem(`profilePic_${currentUser}`);
    if (savedPhoto) document.querySelector('.avatar').src = savedPhoto;

    // --- 2. DRAG & DROP LOGIC ---
    const dropZoneElement = document.getElementById('dropZone');
    const inputElement = dropZoneElement.querySelector('.drop-zone__input');
    let finalBase64Img = null;

    dropZoneElement.addEventListener('click', () => inputElement.click());

    inputElement.addEventListener('change', (e) => {
        if (inputElement.files.length) {
            updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
    });

    dropZoneElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneElement.classList.add('drop-zone--over');
    });

    ['dragleave', 'dragend'].forEach(type => {
        dropZoneElement.addEventListener(type, () => {
            dropZoneElement.classList.remove('drop-zone--over');
        });
    });

    dropZoneElement.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) {
            inputElement.files = e.dataTransfer.files;
            updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }
        dropZoneElement.classList.remove('drop-zone--over');
    });

    function updateThumbnail(dropZone, file) {
        let thumbnailElement = dropZone.querySelector('.drop-zone__thumb');

        // Hapus prompt text jika ada
        if (dropZone.querySelector('.drop-zone__prompt')) {
            dropZone.querySelector('.drop-zone__prompt').remove();
        }

        // Buat elemen thumbnail jika belum ada
        if (!thumbnailElement) {
            thumbnailElement = document.createElement('div');
            thumbnailElement.classList.add('drop-zone__thumb');
            dropZone.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Baca file gambar
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            finalBase64Img = reader.result;
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
    }

    // --- 3. FORM SUBMIT ---
    const uploadForm = document.getElementById('uploadForm');

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Ambil Data
        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const category = document.getElementById('bookCategory').value;
        const link = document.getElementById('bookLink').value;

        if (!finalBase64Img) {
            alert("Harap upload cover buku!");
            return;
        }

        // Buat Objek Buku
        const newBook = {
            id: 'U' + Date.now(),
            title: title,
            author: author,
            category: category,
            rating: 0, // Default rating
            img: finalBase64Img,
            pdf: link,
            isUploaded: true,
            uploadedBy: currentUser
        };

        // Simpan ke LocalStorage 'myUploadedBooks'
        let myUploads = [];
        try {
            myUploads = JSON.parse(localStorage.getItem('myUploadedBooks') || '[]');
        } catch (e) { myUploads = []; }

        myUploads.push(newBook);
        localStorage.setItem('myUploadedBooks', JSON.stringify(myUploads));

        // Feedback & Redirect
        // Tampilkan Toast (Manual sederhana karena redirect cepat)
        const btn = document.querySelector('.btn-submit');
        btn.innerText = "Berhasil!";
        btn.style.background = "#27ae60";
        
        setTimeout(() => {
            window.location.href = 'profile.html'; // Redirect ke profil untuk melihat hasil
        }, 1000);
    });

});