document.addEventListener('DOMContentLoaded', () => {
    // 1. Setup PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    let pdfDoc = null, pageNum = 1, scale = 1.2, pageRendering = false;

    // Referensi Elemen DOM
    const canvas = document.getElementById('the-canvas'), ctx = canvas.getContext('2d');
    const textLayerDiv = document.getElementById('text-layer');
    const pdfWrapper = document.getElementById('pdfWrapper');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Ambil Parameter URL
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title');
    const bookSource = urlParams.get('source');
    
    document.getElementById('displayTitle').innerText = bookTitle || "Dokumen";
    const highlightKey = `highlights_${bookSource || 'default'}`;

    // --- FUNGSI RENDER UTAMA ---
    async function renderPage(num) {
        pageRendering = true;
        loadingOverlay.classList.add('active'); // Mulai Loading
        textLayerDiv.classList.remove('hidden'); // Pastikan text layer siap

        try {
            const page = await pdfDoc.getPage(num);
            
            // Set Ukuran
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            pdfWrapper.style.width = `${viewport.width}px`;
            pdfWrapper.style.height = `${viewport.height}px`;

            // Render Gambar
            const renderContext = { canvasContext: ctx, viewport: viewport };
            await page.render(renderContext).promise;

            // Render Teks (untuk Stabilo)
            const textContent = await page.getTextContent();
            
            // Reset Text Layer
            textLayerDiv.innerHTML = '';
            textLayerDiv.style.width = `${viewport.width}px`;
            textLayerDiv.style.height = `${viewport.height}px`;

            // Gambar ulang text layer
            pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: textLayerDiv,
                viewport: viewport,
                textDivs: []
            });

        } catch (error) {
            console.error("Error rendering page:", error);
        } finally {
            // PENTING: Matikan loading apapun yang terjadi
            pageRendering = false;
            loadingOverlay.classList.remove('active');
            document.getElementById('pageInfo').innerText = `Hal ${num} / ${pdfDoc ? pdfDoc.numPages : '-'}`;
        }
    }

    // --- NAVIGASI & ANIMASI ---
    function goToPage(direction) {
        if (pageRendering) return;

        const targetPage = direction === 'next' ? pageNum + 1 : pageNum - 1;
        if (targetPage < 1 || targetPage > pdfDoc.numPages) return;

        // 1. Sembunyikan Text Layer (biar animasi mulus)
        textLayerDiv.classList.add('hidden');

        // 2. Tambahkan Class Animasi
        const animClass = direction === 'next' ? 'page-turning-next' : 'page-turning-prev';
        canvas.classList.add(animClass);

        // 3. Tunggu kertas 'tegak' (400ms), lalu ganti isi
        setTimeout(() => {
            pageNum = targetPage;
            renderPage(pageNum);

            // 4. Balikin kertas (Hapus animasi)
            setTimeout(() => {
                canvas.classList.remove(animClass);
            }, 100);
        }, 400);
    }

    // Event Listeners Navigasi
    document.getElementById('prevBtn').addEventListener('click', () => goToPage('prev'));
    document.getElementById('nextBtn').addEventListener('click', () => goToPage('next'));

    // Keyboard & Swipe
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') goToPage('next');
        if (e.key === 'ArrowLeft') goToPage('prev');
    });

    // --- FITUR EKSTRA ---
    
    // Zoom
    const updateZoomUI = () => document.getElementById('zoomLevel').innerText = Math.round(scale * 100) + "%";
    document.getElementById('zoomIn').addEventListener('click', () => { scale += 0.2; renderPage(pageNum); updateZoomUI(); });
    document.getElementById('zoomOut').addEventListener('click', () => { if(scale > 0.6) scale -= 0.2; renderPage(pageNum); updateZoomUI(); });

    // Sepia
    document.getElementById('sepiaToggle').addEventListener('click', () => {
        document.body.classList.toggle('sepia-mode');
    });

    // Dark Mode Sync
    const themeToggle = document.getElementById('themeToggle');
    const updateIcon = () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        themeToggle.querySelector('i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    };
    
    if(localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateIcon();
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        updateIcon();
    });

    // Sidebar & Highlight
    document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
        document.getElementById('sidebarNotes').classList.toggle('hidden');
    });

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
        if (!list) return;
        const saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        list.innerHTML = saved.length ? '' : '<div style="text-align:center; padding:20px; color:#666;">Belum ada highlight.</div>';
        
        saved.reverse().forEach(h => {
            const div = document.createElement('div');
            div.style.cssText = "background:var(--bg-input, #eee); padding:10px; margin-bottom:10px; border-left:4px solid gold; border-radius:4px;";
            div.innerHTML = `"${h.text}" <br><small style="color:#666">Hal ${h.page}</small> <button onclick="deleteHl(${h.id})" style="float:right; border:none; background:none; color:red; cursor:pointer;">&times;</button>`;
            list.appendChild(div);
        });
    }

    window.deleteHl = function(id) {
        let saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        saved = saved.filter(h => h.id !== id);
        localStorage.setItem(highlightKey, JSON.stringify(saved));
        loadHighlights();
    };

    document.getElementById('clearHighlights').addEventListener('click', () => {
        if(confirm('Hapus semua?')) { localStorage.removeItem(highlightKey); loadHighlights(); }
    });

    // --- LOAD PDF ---
    if (bookSource) {
        pdfjsLib.getDocument(bookSource).promise.then(doc => {
            pdfDoc = doc;
            renderPage(pageNum);
            loadHighlights();
        }).catch(err => {
            console.error(err);
            loadingOverlay.classList.remove('active');
            alert("Gagal memuat PDF. Pastikan file ada.");
        });
    } else {
        loadingOverlay.classList.remove('active');
    }
});