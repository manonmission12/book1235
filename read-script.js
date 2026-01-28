document.addEventListener('DOMContentLoaded', () => {
    // PDF.js Konfigurasi
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    let pdfDoc = null, pageNum = 1, scale = 1.2, pageRendering = false, pageNumPending = null;
    const canvas = document.getElementById('the-canvas'), ctx = canvas.getContext('2d');
    const textLayerDiv = document.getElementById('text-layer'), pdfWrapper = document.getElementById('pdfWrapper');

    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title'), bookSource = urlParams.get('source');
    document.getElementById('displayTitle').innerText = bookTitle || "Dokumen";
    const highlightKey = `highlights_${bookSource || 'temp'}`;

    // --- 1. RENDER PAGE ---
    function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            pdfWrapper.style.width = `${viewport.width}px`;
            pdfWrapper.style.height = `${viewport.height}px`;

            const renderTask = page.render({ canvasContext: ctx, viewport: viewport });
            renderTask.promise.then(() => page.getTextContent()).then(textContent => {
                textLayerDiv.innerHTML = '';
                textLayerDiv.style.width = `${viewport.width}px`;
                textLayerDiv.style.height = `${viewport.height}px`;
                pdfjsLib.renderTextLayer({ textContent, container: textLayerDiv, viewport, textDivs: [] });
                pageRendering = false;
                if (pageNumPending !== null) { renderPage(pageNumPending); pageNumPending = null; }
            });
        });
        document.getElementById('pageInfo').innerText = `Hal ${num} / ${pdfDoc.numPages}`;
    }

    // --- 2. DARK MODE ---
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const updateThemeIcon = (isDark) => {
        const icon = themeToggle.querySelector('i');
        if (isDark) icon.classList.replace('fa-moon', 'fa-sun');
        else icon.classList.replace('fa-sun', 'fa-moon');
    };

    if (localStorage.getItem('theme') === 'dark') {
        root.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        if (isDark) {
            root.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            updateThemeIcon(false);
        } else {
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            updateThemeIcon(true);
        }
    });

    // --- 3. ZOOM ---
    document.getElementById('zoomIn').addEventListener('click', () => { scale += 0.2; renderPage(pageNum); updateZoomUI(); });
    document.getElementById('zoomOut').addEventListener('click', () => { if (scale > 0.6) scale -= 0.2; renderPage(pageNum); updateZoomUI(); });
    const updateZoomUI = () => document.getElementById('zoomLevel').innerText = `${Math.round(scale * 100)}%`;

    // --- 4. SEPIA ---
    document.getElementById('sepiaToggle').addEventListener('click', () => {
        document.body.classList.toggle('sepia-mode');
        document.getElementById('sepiaToggle').classList.toggle('active');
    });

    // --- 5. SEARCH ---
    document.getElementById('findInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!window.find(e.target.value, false, false, true)) alert("Kata tidak ditemukan.");
        }
    });

    // --- 6. NAVIGATION ---
    document.getElementById('prevBtn').addEventListener('click', () => { if (pageNum > 1) { pageNum--; renderPage(pageNum); } });
    document.getElementById('nextBtn').addEventListener('click', () => { if (pageNum < pdfDoc.numPages) { pageNum++; renderPage(pageNum); } });

    // --- 7. HIGHLIGHT ---
    document.getElementById('highlightBtn').addEventListener('click', () => {
        const text = window.getSelection().toString().trim();
        if (text) {
            let saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
            saved.push({ id: Date.now(), text, page: pageNum });
            localStorage.setItem(highlightKey, JSON.stringify(saved));
            loadHighlights();
            window.getSelection().removeAllRanges();
        }
    });

    function loadHighlights() {
        const list = document.getElementById('highlightsList');
        const saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        list.innerHTML = saved.length ? '' : '<div class="empty-highlight"><p>Belum ada highlight.</p></div>';
        saved.reverse().forEach(h => {
            const div = document.createElement('div');
            div.className = 'highlight-card';
            div.innerHTML = `<span class="highlight-text">"${h.text}"</span><br><small>Hal ${h.page}</small>`;
            list.appendChild(div);
        });
    }

    document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
        document.getElementById('sidebarNotes').classList.toggle('hidden');
        document.getElementById('toggleSidebarBtn').classList.toggle('active');
    });

    // --- 8. LOAD PDF ---
    if (bookSource) {
        pdfjsLib.getDocument(bookSource).promise.then(doc => { pdfDoc = doc; renderPage(pageNum); }).catch(() => alert("Gagal memuat PDF."));
    }

    loadHighlights();
});