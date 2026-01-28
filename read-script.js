document.addEventListener('DOMContentLoaded', () => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    let pdfDoc = null, pageNum = 1, scale = 1.0, pageRendering = false;
    const canvas = document.getElementById('the-canvas'), ctx = canvas.getContext('2d');
    const textLayerDiv = document.getElementById('text-layer'), pdfWrapper = document.getElementById('pdfWrapper');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('title'), bookSource = urlParams.get('source');
    const highlightKey = `highlights_${bookSource || 'default'}`;

    // --- RENDER ---
    async function renderPage(num) {
        pageRendering = true;
        
        try {
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            pdfWrapper.style.width = `${viewport.width}px`;
            pdfWrapper.style.height = `${viewport.height}px`;

            await page.render({ canvasContext: ctx, viewport: viewport }).promise;

            const textContent = await page.getTextContent();
            textLayerDiv.innerHTML = '';
            textLayerDiv.style.width = `${viewport.width}px`;
            textLayerDiv.style.height = `${viewport.height}px`;
            
            pdfjsLib.renderTextLayer({
                textContent: textContent,
                container: textLayerDiv,
                viewport: viewport,
                textDivs: []
            });
            textLayerDiv.classList.remove('hidden');

        } catch (error) {
            console.error(error);
        } finally {
            pageRendering = false;
            loadingOverlay.classList.remove('active');
            document.getElementById('pageInfo').innerText = `Hal ${num} dari ${pdfDoc ? pdfDoc.numPages : '-'}`;
        }
    }

    // --- NAVIGASI ---
    async function goToPage(direction) {
        if (pageRendering) return;
        const targetPage = direction === 'next' ? pageNum + 1 : pageNum - 1;
        if (targetPage < 1 || targetPage > pdfDoc.numPages) return;

        textLayerDiv.classList.add('hidden');
        const animClass = direction === 'next' ? 'page-turning-next' : 'page-turning-prev';
        canvas.classList.add(animClass);

        setTimeout(async () => {
            pageNum = targetPage;
            loadingOverlay.classList.add('active');
            await renderPage(pageNum);
            loadingOverlay.classList.remove('active');
            canvas.classList.remove(animClass);
        }, 300);
    }

    document.getElementById('prevBtn').addEventListener('click', () => goToPage('prev'));
    document.getElementById('nextBtn').addEventListener('click', () => goToPage('next'));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') goToPage('next');
        if (e.key === 'ArrowLeft') goToPage('prev');
    });

    // --- ZOOM & UI ---
    const updateZoomUI = () => document.getElementById('zoomLevel').innerText = Math.round(scale*100) + "%";
    document.getElementById('zoomIn').addEventListener('click', () => { scale += 0.2; renderPage(pageNum); updateZoomUI(); });
    document.getElementById('zoomOut').addEventListener('click', () => { if(scale > 0.4) scale -= 0.2; renderPage(pageNum); updateZoomUI(); });

    document.getElementById('sepiaToggle').addEventListener('click', () => document.body.classList.toggle('sepia-mode'));
    document.getElementById('toggleSidebarBtn').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebarNotes');
        sidebar.classList.toggle('hidden');
        document.getElementById('toggleSidebarBtn').classList.toggle('active');
    });

    // --- HIGHLIGHTS ---
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
        
        if (saved.length === 0) {
            list.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:#9ca3af;">
                    <i class="fas fa-book-open" style="font-size:2rem; margin-bottom:12px; opacity:0.5;"></i>
                    <p style="font-size:0.9rem;">Belum ada highlight.</p>
                </div>`;
            return;
        }

        list.innerHTML = '';
        saved.reverse().forEach(h => {
            const el = document.createElement('div');
            el.className = 'highlight-card';
            el.innerHTML = `
                <span class="highlight-text">"${h.text}"</span>
                <div class="highlight-meta">
                    <span><i class="far fa-file-alt"></i> Hal ${h.page}</span>
                    <button onclick="deleteHl(${h.id})" class="btn-del-item" title="Hapus Highlight ini">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
            list.appendChild(el);
        });
    }

    window.deleteHl = (id) => {
        let saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        localStorage.setItem(highlightKey, JSON.stringify(saved.filter(h => h.id !== id)));
        loadHighlights();
    };

    document.getElementById('clearHighlights').addEventListener('click', () => {
        const saved = JSON.parse(localStorage.getItem(highlightKey) || '[]');
        if (saved.length === 0) return;
        if(confirm('Yakin ingin menghapus SEMUA highlight di buku ini?')) { 
            localStorage.removeItem(highlightKey); 
            loadHighlights(); 
        }
    });

    // --- LOAD ---
    if (bookSource) {
        loadingOverlay.classList.add('active');
        pdfjsLib.getDocument(bookSource).promise.then(doc => {
            pdfDoc = doc;
            renderPage(pageNum);
            loadHighlights();
        }).catch(err => {
            console.error(err);
            alert("Gagal memuat PDF.");
        });
    } else { loadingOverlay.classList.remove('active'); }
});