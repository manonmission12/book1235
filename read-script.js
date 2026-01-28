document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. DARK MODE ---
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

    // --- 1. AMBIL PARAMETER DARI URL ---
    // URL contoh: read.html?title=Atomic%20Habits&source=books/3.pdf
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title');
    const bookSource = urlParams.get('source');

    const displayTitle = document.getElementById('displayTitle');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfError = document.getElementById('pdfError');
    const fallbackLink = document.getElementById('fallbackLink');

    // Validasi
    if (bookTitle) displayTitle.innerText = bookTitle;
    
    if (bookSource) {
        // Cek apakah source adalah Base64 (Upload-an user) atau File Path biasa
        pdfViewer.src = bookSource;
        fallbackLink.href = bookSource;
    } else {
        // Jika tidak ada buku yang dipilih
        pdfViewer.style.display = 'none';
        pdfError.style.display = 'block';
        document.querySelector('.pdf-error p').innerText = "Buku tidak ditemukan.";
    }

    // Error Handling Iframe (Basic)
    pdfViewer.onerror = () => {
        pdfViewer.style.display = 'none';
        pdfError.style.display = 'block';
    };

    // --- 2. FULLSCREEN LOGIC ---
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable fullscreen: ${err.message}`);
            });
            fullscreenBtn.querySelector('i').classList.replace('fa-expand', 'fa-compress');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                fullscreenBtn.querySelector('i').classList.replace('fa-compress', 'fa-expand');
            }
        }
    });
});