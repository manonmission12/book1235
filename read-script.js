document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. DARK MODE ---
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

    // --- 1. AMBIL DATA DARI URL ---
    // Contoh URL: read.html?title=JudulBuku&source=link.pdf
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title');
    const bookSource = urlParams.get('source');

    const displayTitle = document.getElementById('displayTitle');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfError = document.getElementById('pdfError');
    const fallbackLink = document.getElementById('fallbackLink');

    // Validasi & Tampilkan
    if (bookTitle) displayTitle.innerText = bookTitle;
    
    if (bookSource) {
        pdfViewer.src = bookSource;
        fallbackLink.href = bookSource;
    } else {
        pdfViewer.style.display = 'none';
        pdfError.style.display = 'block';
        document.querySelector('.pdf-error p').innerText = "Buku tidak ditemukan atau link rusak.";
    }

    // Handle jika iframe gagal load (misal link mati)
    pdfViewer.onerror = () => {
        pdfViewer.style.display = 'none';
        pdfError.style.display = 'block';
    };

    // --- 2. FULLSCREEN LOGIC ---
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if(fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    alert(`Gagal masuk layar penuh: ${err.message}`);
                });
                fullscreenBtn.querySelector('i').classList.replace('fa-expand', 'fa-compress');
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fullscreenBtn.querySelector('i').classList.replace('fa-compress', 'fa-expand');
                }
            }
        });
    }
});