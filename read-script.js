document.addEventListener('DOMContentLoaded', () => {
    
    // --- CONFIG PDF.JS ---
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    // --- VARIABLES ---
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.2; // Zoom Level
    const canvas = document.getElementById('the-canvas');
    const ctx = canvas.getContext('2d');
    const textLayerDiv = document.getElementById('text-layer');
    const pdfWrapper = document.getElementById('pdfWrapper');

    // --- URL PARAMS ---
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title');
    const bookSource = urlParams.get('source');
    
    document.getElementById('displayTitle').innerText = bookTitle || "Dokumen";

    // Kunci simpan highlight (unik per buku)
    const highlightKey = `highlights_${bookSource || 'temp'}`;

    // --- 1. RENDER PAGE FUNCTION ---
    function renderPage(num) {
        pageRendering = true;
        
        // Fetch Halaman
        pdfDoc.getPage(num).then(function(page) {
            
            // Atur Ukuran
            const viewport = page.getViewport({scale: scale});
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Penting: Samakan ukuran Wrapper dengan Canvas agar Text Layer pas
            pdfWrapper.style.width = `${viewport.width}px`;
            pdfWrapper.style.height = `${viewport.height}px`;

            // Render Gambar PDF
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            const renderTask = page.render(renderContext);

            // TUNGGU gambar selesai, baru render teks (PENTING!)
            renderTask.promise.then(function() {
                return page.getTextContent();
            }).then(function(textContent) {
                // Bersihkan layer teks lama
                textLayerDiv.innerHTML = '';
                textLayerDiv.style.setProperty('--scale-factor', scale);

                // Render Teks (Invisible tapi bisa diblok)
                pdfjsLib.renderTextLayer({
                    textContent: textContent,
                    container: textLayerDiv,
                    viewport: viewport,
                    textDivs: []
                });
                
                pageRendering = false;
                
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            }).catch(err => {
                console.error("Error render text layer:", err);
                pageRendering = false;
            });
        });

        // Update Info Halaman
        document.getElementById('pageInfo').innerText = `Hal ${num} / ${pdfDoc.numPages}`;
    }

    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    // --- NAVIGATION ---
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (pageNum >= pdfDoc.numPages) return;
        pageNum++;
        queueRenderPage(pageNum);
    });

    // --- LOAD DOCUMENT ---
    if (bookSource) {
        pdfjsLib.getDocument(bookSource).promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            document.getElementById('pageInfo').innerText = `Hal 1 / ${pdfDoc.numPages}`;
            renderPage(pageNum);
        }).catch(err => {
            alert("Gagal memuat PDF. Pastikan file valid.");
            console.error(err);
        });
    } else {
        alert("Buku tidak ditemukan.");
    }

    // --- HIGHLIGHT FEATURE ---
    const highlightBtn = document.getElementById('highlightBtn');
    loadHighlights();

    highlightBtn.addEventListener('click', () => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            saveHighlight(text, pageNum);
            selection.removeAllRanges(); // Clear blok
        } else {
            alert("Silakan blok/seleksi teks di halaman dulu!");
        }
    });

    function saveHighlight(text, page) {
        let saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        saved.push({
            id: Date.now(),
            text: text,
            page: page
        });
        localStorage.setItem(highlightKey, JSON.stringify(saved));
        renderHighlights(saved);
        
        // Feedback visual
        highlightBtn.innerHTML = '<i class="fas fa-check"></i> Tersimpan';
        setTimeout(() => highlightBtn.innerHTML = '<i class="fas fa-highlighter"></i> Stabilo', 1500);
    }

    function loadHighlights() {
        const saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        renderHighlights(saved);
    }

    function renderHighlights(data) {
        const list = document.getElementById('highlightsList');
        list.innerHTML = '';
        
        if (data.length === 0) {
            list.innerHTML = `<div class="empty-highlight"><p>Belum ada highlight.</p></div>`;
            return;
        }

        data.reverse().forEach(item => {
            const div = document.createElement('div');
            div.className = 'highlight-card';
            div.innerHTML = `
                <span class="highlight-text">"${item.text}"</span>
                <div class="highlight-meta">
                    <span>Hal ${item.page}</span>
                    <button onclick="deleteHl(${item.id})" class="btn-delete-hl"><i class="fas fa-trash"></i></button>
                </div>
            `;
            list.appendChild(div);
        });
    }

    // Fungsi Hapus (Global Scope agar bisa dipanggil onclick HTML)
    window.deleteHl = function(id) {
        let saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        saved = saved.filter(h => h.id !== id);
        localStorage.setItem(highlightKey, JSON.stringify(saved));
        loadHighlights();
    };
    
    document.getElementById('clearHighlights').addEventListener('click', () => {
        if(confirm('Hapus semua?')) {
            localStorage.removeItem(highlightKey);
            loadHighlights();
        }
    });

    // Sidebar Toggle
    document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
        const sb = document.getElementById('sidebarNotes');
        sb.classList.toggle('hidden');
        sb.classList.toggle('active');
    });

    // Dark Mode Sync
    if(localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.querySelector('#themeToggle i').classList.replace('fa-moon', 'fa-sun');
    }
    document.getElementById('themeToggle').addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
        // Icon update logic...
    });
});