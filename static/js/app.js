/**
 * RIWA Studio Engine - Ultra Luxury Edition with Gradients & Extended Palette
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State ---
    const state = {
        templates: [],
        currentTemplate: null,
        layers: [
            {
                id: 'layer_monogram',
                label: 'Initiales',
                text: 'S  &  M',
                fontFamily: 'Tangerine',
                fontSize: 68,
                color: '#d4af37',
                gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
                align: 'center',
                pctX: 50,
                pctY: 18
            },
            {
                id: 'layer_quote1',
                label: 'Phrase d\'accueil',
                text: '« Un beau moment commence ici. »',
                fontFamily: 'Cormorant Garamond',
                fontSize: 22,
                color: '#8b6914',
                gradient: null,
                align: 'center',
                pctX: 50,
                pctY: 30
            },
            {
                id: 'layer_names',
                label: 'Noms des Mariés',
                text: 'Sarah & Mohamed',
                fontFamily: 'Great Vibes',
                fontSize: 54,
                color: '#d4af37',
                gradient: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
                align: 'center',
                pctX: 50,
                pctY: 42
            },
            {
                id: 'layer_quote2',
                label: 'Formule d\'invitation',
                text: '« Un moment à célébrer. Une histoire à partager. »',
                fontFamily: 'Playfair Display',
                fontSize: 20,
                color: '#111111',
                gradient: null,
                align: 'center',
                pctX: 50,
                pctY: 56
            },
            {
                id: 'layer_date',
                label: 'Date & Heure',
                text: 'SAMEDI 18 SEPTEMBRE 2026 — 17H00',
                fontFamily: 'Cinzel',
                fontSize: 22,
                color: '#8b6914',
                gradient: null,
                align: 'center',
                pctX: 50,
                pctY: 68
            },
            {
                id: 'layer_venue',
                label: 'Lieu de célébration',
                text: 'Hôtel Regency, Monastir, Tunisie',
                fontFamily: 'Cormorant Garamond',
                fontSize: 22,
                color: '#111111',
                gradient: null,
                align: 'center',
                pctX: 50,
                pctY: 78
            },
            {
                id: 'layer_rsvp',
                label: 'RSVP & Inscription',
                text: '« À partager avec ceux qui comptent. »\nRSVP: +216 55 222 110',
                fontFamily: 'Montserrat',
                fontSize: 16,
                color: '#555555',
                gradient: null,
                align: 'center',
                pctX: 50,
                pctY: 88
            }
        ],
        selectedLayerId: 'layer_names',
        zoomLevel: 0.75,
        showGuides: true,
        drag: {
            active: false,
            layerId: null,
            startX: 0,
            startY: 0,
            initialPctX: 50,
            initialPctY: 50
        },
        resize: {
            active: false,
            layerId: null,
            startY: 0,
            initialSize: 24
        }
    };

    // --- DOM Elements ---
    const riwaSplashScreen = document.getElementById('riwaSplashScreen');
    const btnEnterStudio = document.getElementById('btnEnterStudio');

    const fullscreenModal = document.getElementById('fullscreenModal');
    const btnFullscreenPreview = document.getElementById('btnFullscreenPreview');
    const btnCloseFullscreen = document.getElementById('btnCloseFullscreen');
    const btnCloseFullscreenSecondary = document.getElementById('btnCloseFullscreenSecondary');
    const fullscreenCanvas = document.getElementById('fullscreenCanvas');
    const btnDownloadFromFullscreen = document.getElementById('btnDownloadFromFullscreen');

    const shareModal = document.getElementById('shareModal');
    const btnOpenShareModal = document.getElementById('btnOpenShareModal');
    const btnCloseShareModal = document.getElementById('btnCloseShareModal');
    const btnShareWhatsapp = document.getElementById('btnShareWhatsapp');
    const btnShareMessenger = document.getElementById('btnShareMessenger');
    const btnShareInstagram = document.getElementById('btnShareInstagram');
    const btnCopyLink = document.getElementById('btnCopyLink');

    const templatesGrid = document.getElementById('templatesGrid');
    const cardBgImage = document.getElementById('cardBgImage');
    const interactiveStage = document.getElementById('interactiveStage');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const zoomWrapper = document.getElementById('zoomWrapper');
    const layersList = document.getElementById('layersList');
    const activeLayerSelect = document.getElementById('activeLayerSelect');
    
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const fontSizeRange = document.getElementById('fontSizeRange');
    const fontSizeVal = document.getElementById('fontSizeVal');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const alignButtons = document.querySelectorAll('[data-align]');

    const btnNewProject = document.getElementById('btnNewProject');
    const btnExportMenu = document.getElementById('btnExportMenu');
    const exportDropdownMenu = document.getElementById('exportDropdownMenu');
    const btnExportPNG = document.getElementById('btnExportPNG');
    const btnExportPDF = document.getElementById('btnExportPDF');
    const btnAddCustomText = document.getElementById('btnAddCustomText');
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnZoomFit = document.getElementById('btnZoomFit');
    const zoomPercent = document.getElementById('zoomPercent');
    const btnToggleGuide = document.getElementById('btnToggleGuide');
    const guideV = document.getElementById('guideV');
    const guideH = document.getElementById('guideH');

    const statusTemplateName = document.getElementById('statusTemplateName');
    const statusLayersCount = document.getElementById('statusLayersCount');

    // --- Init ---
    init();

    async function init() {
        setupSplash();
        setupModalsAndShare();
        setupTabs();
        setupEventListeners();
        await fetchTemplates();
        renderLayersList();
        populateLayerSelector();
        syncStyleControls();
        renderCanvas();
    }

    function setupSplash() {
        if (btnEnterStudio) {
            btnEnterStudio.addEventListener('click', () => {
                riwaSplashScreen.classList.add('hide');
                showToast("Bienvenue sur RIWA !");
            });
        }
    }

    function setupModalsAndShare() {
        if (btnFullscreenPreview) btnFullscreenPreview.addEventListener('click', generateFullscreenPreview);
        
        const closeFullscreen = () => fullscreenModal.classList.remove('show');
        if (btnCloseFullscreen) btnCloseFullscreen.addEventListener('click', closeFullscreen);
        if (btnCloseFullscreenSecondary) btnCloseFullscreenSecondary.addEventListener('click', closeFullscreen);

        // ESC Key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                fullscreenModal.classList.remove('show');
                shareModal.classList.remove('show');
            }
        });

        if (btnDownloadFromFullscreen) btnDownloadFromFullscreen.addEventListener('click', () => triggerExport('png'));

        if (btnOpenShareModal) {
            btnOpenShareModal.addEventListener('click', () => {
                shareModal.classList.add('show');
            });
        }
        if (btnCloseShareModal) btnCloseShareModal.addEventListener('click', () => shareModal.classList.remove('show'));

        const shareUrl = window.location.href;
        const shareText = "Découvrez mon invitation de mariage créée sur RIWA — « Un beau moment commence ici. »";

        const btnCopyPhotoPNG = document.getElementById('btnCopyPhotoPNG');
        if (btnCopyPhotoPNG) {
            btnCopyPhotoPNG.addEventListener('click', () => sharePhotoPNGOnly('copy'));
        }

        if (btnShareWhatsapp) {
            btnShareWhatsapp.addEventListener('click', () => sharePhotoPNGOnly('whatsapp'));
        }
        if (btnShareMessenger) {
            btnShareMessenger.addEventListener('click', () => sharePhotoPNGOnly('messenger'));
        }
        if (btnShareInstagram) {
            btnShareInstagram.addEventListener('click', () => sharePhotoPNGOnly('instagram'));
        }
        if (btnCopyLink) {
            btnCopyLink.addEventListener('click', () => sharePhotoPNGOnly('copy'));
        }
    }

    async function sharePhotoPNGOnly(platform = 'messenger') {
        if (!state.currentTemplate) return;

        showToast("Préparation de la photo PNG...");

        try {
            // 1. Generate high-definition PNG image on server side
            const res = await fetch('/api/share-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: state.currentTemplate.filename,
                    layers: state.layers,
                    previewWidth: cardBgImage.clientWidth || 800,
                    previewHeight: cardBgImage.clientHeight || 1200
                })
            });

            const json = await res.json();
            if (!json.success || !json.image_url) {
                showToast("Erreur de génération de l'image.");
                return;
            }

            // 2. Fetch PNG Blob
            const imgRes = await fetch(json.image_url);
            const blob = await imgRes.blob();
            const pngFile = new File([blob], 'Invitation_RIWA.png', { type: 'image/png' });

            // 3. Smartphone Mobile Native Share (Sends PNG photo directly into Messenger app, ZERO link)
            if (navigator.canShare && navigator.canShare({ files: [pngFile] })) {
                try {
                    await navigator.share({
                        files: [pngFile]
                    });
                    showToast("Photo PNG partagée ! 🎉");
                    return;
                } catch (shareErr) {
                    console.log("Native share cancelled:", shareErr);
                }
            }

            // 4. Desktop Web Clipboard Copy (Ctrl+V in Messenger / WhatsApp / Instagram)
            let copied = false;
            if (navigator.clipboard && window.ClipboardItem) {
                try {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);
                    copied = true;
                } catch (clipErr) {
                    console.log("Clipboard write image failed:", clipErr);
                }
            }

            // Download PNG photo as convenient backup
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'Invitation_RIWA.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

            // Open Messenger / WhatsApp directly for pasting Ctrl+V
            if (platform === 'messenger') {
                window.open('https://www.messenger.com/t', '_blank');
                if (copied) {
                    showToast("📸 Photo PNG copiée ! Faites Ctrl+V (Coller) dans Messenger pour envoyer l'image sans aucun lien !");
                } else {
                    showToast("📸 Photo PNG enregistrée ! Glissez l'image dans votre discussion Messenger.");
                }
            } else if (platform === 'whatsapp') {
                window.open('https://web.whatsapp.com', '_blank');
                showToast(copied ? "📸 Photo PNG copiée ! Faites Ctrl+V dans WhatsApp." : "📸 Photo PNG enregistrée !");
            } else if (platform === 'instagram') {
                window.open('https://www.instagram.com/direct/inbox/', '_blank');
                showToast("📸 Photo PNG enregistrée pour Instagram !");
            } else {
                showToast(copied ? "📸 Photo PNG copiée dans le presse-papier (Ctrl+V) !" : "📸 Photo PNG téléchargée !");
            }

        } catch (err) {
            console.error("sharePhotoPNGOnly error:", err);
            showToast("Erreur lors du traitement de la photo.");
        }
    }

    async function generateDynamicShareCardUrl() {
        if (!state.currentTemplate) return window.location.href;

        // Try server-side rendering first (100% reliable, zero CORS/canvas taint risk)
        try {
            const res = await fetch('/api/share-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: state.currentTemplate.filename,
                    layers: state.layers,
                    previewWidth: cardBgImage.clientWidth || 800,
                    previewHeight: cardBgImage.clientHeight || 1200
                })
            });

            const json = await res.json();
            if (json.success && json.share_url) {
                return json.share_url;
            }
        } catch (err) {
            console.error("Server-side card rendering error:", err);
        }

        // Fallback to client-side canvas rendering if server fails
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = cardBgImage;

            canvas.width = state.currentTemplate.width;
            canvas.height = state.currentTemplate.height;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            state.layers.forEach(layer => {
                if (!layer.text.trim()) return;

                ctx.font = `${layer.fontSize}px '${layer.fontFamily}', serif`;
                ctx.textAlign = layer.align;
                ctx.textBaseline = 'top';

                const x = (layer.pctX / 100.0) * canvas.width;
                const y = (layer.pctY / 100.0) * canvas.height;

                if (layer.gradient) {
                    const grad = ctx.createLinearGradient(x, y, x + 200, y + layer.fontSize);
                    grad.addColorStop(0, '#bf953f');
                    grad.addColorStop(0.5, '#fcf6ba');
                    grad.addColorStop(1, '#aa771c');
                    ctx.fillStyle = grad;
                } else {
                    ctx.fillStyle = layer.color;
                }

                const lines = layer.text.split('\n');
                let curY = y;

                lines.forEach(line => {
                    ctx.fillText(line, x, curY);
                    curY += layer.fontSize * 1.3;
                });
            });

            const dataUrl = canvas.toDataURL('image/png', 0.95);

            const res = await fetch('/api/share-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: dataUrl })
            });

            const json = await res.json();
            if (json.success && json.share_url) {
                return json.share_url;
            }
        } catch (err) {
            console.error("Client-side card rendering error:", err);
        }

        return window.location.href;
    }

    async function copyOrShareImagePNG(platform = 'direct') {
        if (!state.currentTemplate) return;

        showToast("Génération de la photo PNG...");

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = cardBgImage;

        canvas.width = state.currentTemplate.width;
        canvas.height = state.currentTemplate.height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        state.layers.forEach(layer => {
            if (!layer.text.trim()) return;

            ctx.font = `${layer.fontSize}px '${layer.fontFamily}', serif`;
            ctx.textAlign = layer.align;
            ctx.textBaseline = 'top';

            const x = (layer.pctX / 100.0) * canvas.width;
            const y = (layer.pctY / 100.0) * canvas.height;

            if (layer.gradient) {
                const grad = ctx.createLinearGradient(x, y, x + 200, y + layer.fontSize);
                grad.addColorStop(0, '#bf953f');
                grad.addColorStop(0.5, '#fcf6ba');
                grad.addColorStop(1, '#aa771c');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = layer.color;
            }

            const lines = layer.text.split('\n');
            let curY = y;

            lines.forEach(line => {
                ctx.fillText(line, x, curY);
                curY += layer.fontSize * 1.3;
            });
        });

        // Convert canvas to Blob
        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const namesLayer = state.layers.find(l => l.id === 'layer_names');
            const namesSlug = namesLayer ? namesLayer.text.replace(/[^a-zA-Z0-9]/g, '_') : 'Mariage';
            const fileName = `RIWA_Invitation_${namesSlug}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });

            // 1. Mobile Web Share API (Share ONLY file photo, NO link)
            try {
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file] });
                    showToast("Photo PNG envoyée ! 🎉");
                    return;
                }
            } catch (err) {
                console.log("Mobile share file error:", err);
            }

            // 2. Clipboard API: Copy PNG Image bytes directly to Clipboard (for Messenger / WhatsApp Ctrl+V)
            try {
                if (navigator.clipboard && window.ClipboardItem) {
                    const item = new ClipboardItem({ 'image/png': blob });
                    await navigator.clipboard.write([item]);

                    if (platform === 'messenger') {
                        window.open('https://www.messenger.com', '_blank');
                        showToast("📸 Photo PNG copiée ! Appuyez sur Ctrl+V (Coller) dans Messenger.");
                    } else if (platform === 'whatsapp') {
                        window.open('https://web.whatsapp.com', '_blank');
                        showToast("📸 Photo PNG copiée ! Appuyez sur Ctrl+V (Coller) dans WhatsApp.");
                    } else {
                        showToast("📸 Photo PNG copiée dans le presse-papier ! Appuyez sur Ctrl+V pour coller.");
                    }
                    return;
                }
            } catch (err) {
                console.log("Clipboard write failed:", err);
            }

            // Fallback: If browser cannot copy image directly, prompt user or trigger explicit download
            triggerExport('png');
        }, 'image/png', 1.0);
    }

    function setupTabs() {
        const tabBtns = document.querySelectorAll('.sidebar-tabs .tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetTab = btn.getAttribute('data-tab');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    async function fetchTemplates() {
        try {
            const response = await fetch('/api/templates');
            const data = await response.json();
            
            if (data.success && data.templates.length > 0) {
                state.templates = data.templates;
                renderTemplatesGrid(data.templates);
                selectTemplate(data.templates[0]);
            } else {
                templatesGrid.innerHTML = `<div class="loading-spinner">Aucun modèle dans Cards.</div>`;
            }
        } catch (err) {
            console.error("Error loading cards:", err);
        }
    }

    function renderTemplatesGrid(templates) {
        templatesGrid.innerHTML = '';
        templates.forEach((tmpl, idx) => {
            const card = document.createElement('div');
            card.className = `template-card ${idx === 0 ? 'active' : ''}`;
            card.setAttribute('data-id', tmpl.id);
            card.innerHTML = `<img src="${tmpl.url}" alt="${tmpl.title}">`;
            card.addEventListener('click', () => selectTemplate(tmpl));
            templatesGrid.appendChild(card);
        });
    }

    function selectTemplate(tmpl) {
        state.currentTemplate = tmpl;
        
        document.querySelectorAll('.template-card').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-id') === tmpl.id);
        });

        cardBgImage.onload = () => {
            canvasWrapper.style.width = `${cardBgImage.clientWidth}px`;
            canvasWrapper.style.height = `${cardBgImage.clientHeight}px`;
            statusTemplateName.innerHTML = `<i class="fa-regular fa-image"></i> ${tmpl.filename}`;
            autoFitZoom();
            renderCanvas();
        };

        cardBgImage.src = tmpl.url;
    }

    function autoFitZoom() {
        const viewportHeight = window.innerHeight - 200;
        const cardHeight = cardBgImage.clientHeight || 800;
        if (cardHeight > 0) {
            const optimalZoom = Math.min(0.85, Math.max(0.45, viewportHeight / cardHeight));
            setZoom(optimalZoom);
        }
    }

    // --- Stage Render with Gradient & Solid Color Support ---
    function renderCanvas() {
        interactiveStage.innerHTML = '';
        statusLayersCount.innerHTML = `<i class="fa-solid fa-layer-group"></i> Textes: ${state.layers.length}`;

        if (!state.currentTemplate) return;

        const stageWidth = cardBgImage.clientWidth || 450;
        const scale = stageWidth / state.currentTemplate.width;

        state.layers.forEach(layer => {
            const isSelected = layer.id === state.selectedLayerId;
            const el = document.createElement('div');
            el.className = `canvas-text-element ${isSelected ? 'selected' : ''}`;
            el.setAttribute('data-id', layer.id);

            el.style.fontFamily = `'${layer.fontFamily}', serif`;
            el.style.fontSize = `${layer.fontSize * scale}px`;
            el.style.textAlign = layer.align;
            el.style.lineHeight = '1.3';

            // Apply Gradient or Solid Color
            if (layer.gradient) {
                el.style.backgroundImage = layer.gradient;
                el.style.webkitBackgroundClip = 'text';
                el.style.webkitTextFillColor = 'transparent';
                el.style.color = 'transparent';
            } else {
                el.style.backgroundImage = 'none';
                el.style.webkitBackgroundClip = 'unset';
                el.style.webkitTextFillColor = 'unset';
                el.style.color = layer.color;
            }

            el.style.top = `${layer.pctY}%`;
            el.style.left = `${layer.pctX}%`;

            if (layer.align === 'center') {
                el.style.transform = 'translateX(-50%)';
            } else if (layer.align === 'right') {
                el.style.transform = 'translateX(-100%)';
            } else {
                el.style.transform = 'none';
            }

            el.textContent = layer.text;

            // Resize Corner
            if (isSelected) {
                const resizeCorner = document.createElement('div');
                resizeCorner.className = 'resize-corner';
                resizeCorner.title = 'Tirer pour agrandir/réduire';
                resizeCorner.addEventListener('mousedown', (e) => startResize(e, layer.id));
                resizeCorner.addEventListener('touchstart', (e) => startResize(e, layer.id), { passive: false });
                el.appendChild(resizeCorner);
            }

            // Drag event listeners
            el.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('resize-corner')) return;
                startDrag(e, layer.id);
            });
            el.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains('resize-corner')) return;
                startDrag(e, layer.id);
            }, { passive: false });

            interactiveStage.appendChild(el);
        });

        syncStyleControls();
    }

    // --- Drag Positioning ---
    function startDrag(e, layerId) {
        e.preventDefault();
        e.stopPropagation();

        state.selectedLayerId = layerId;
        populateLayerSelector();
        renderLayersList();
        renderCanvas();

        const layer = state.layers.find(l => l.id === layerId);
        if (!layer) return;

        const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
        const pointerY = e.touches ? e.touches[0].clientY : e.clientY;

        state.drag = {
            active: true,
            layerId: layerId,
            startX: pointerX,
            startY: pointerY,
            initialPctX: layer.pctX,
            initialPctY: layer.pctY
        };

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }

    function onDrag(e) {
        if (!state.drag.active) return;
        e.preventDefault();

        const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
        const pointerY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = pointerX - state.drag.startX;
        const deltaY = pointerY - state.drag.startY;

        const stageWidth = cardBgImage.clientWidth || 450;
        const stageHeight = cardBgImage.clientHeight || 750;

        const deltaPctX = (deltaX / stageWidth) * 100;
        const deltaPctY = (deltaY / stageHeight) * 100;

        const layer = state.layers.find(l => l.id === state.drag.layerId);
        if (layer) {
            let newPctX = state.drag.initialPctX + deltaPctX;
            let newPctY = state.drag.initialPctY + deltaPctY;

            if (Math.abs(newPctX - 50) < 3.5) {
                newPctX = 50;
                guideV.style.display = state.showGuides ? 'block' : 'none';
            } else {
                guideV.style.display = 'none';
            }

            layer.pctX = Math.max(5, Math.min(95, newPctX));
            layer.pctY = Math.max(5, Math.min(95, newPctY));

            renderCanvas();
        }
    }

    function stopDrag() {
        state.drag.active = false;
        guideV.style.display = 'none';
        guideH.style.display = 'none';

        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', stopDrag);
    }

    // --- Corner Resize ---
    function startResize(e, layerId) {
        e.preventDefault();
        e.stopPropagation();

        const layer = state.layers.find(l => l.id === layerId);
        if (!layer) return;

        const pointerY = e.touches ? e.touches[0].clientY : e.clientY;

        state.resize = {
            active: true,
            layerId: layerId,
            startY: pointerY,
            initialSize: layer.fontSize
        };

        document.addEventListener('mousemove', onResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', onResize, { passive: false });
        document.addEventListener('touchend', stopResize);
    }

    function onResize(e) {
        if (!state.resize.active) return;
        e.preventDefault();

        const pointerY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = pointerY - state.resize.startY;

        const layer = state.layers.find(l => l.id === state.resize.layerId);
        if (layer) {
            const newSize = Math.max(12, Math.min(140, Math.round(state.resize.initialSize + (deltaY * 0.6))));
            layer.fontSize = newSize;

            fontSizeRange.value = newSize;
            fontSizeVal.textContent = `${newSize}px`;

            renderCanvas();
        }
    }

    function stopResize() {
        state.resize.active = false;
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', onResize);
        document.removeEventListener('touchend', stopResize);
    }

    // --- Layer Controls ---
    function renderLayersList() {
        layersList.innerHTML = '';
        state.layers.forEach(layer => {
            const item = document.createElement('div');
            item.className = `layer-item ${layer.id === state.selectedLayerId ? 'active' : ''}`;
            
            item.innerHTML = `
                <div class="layer-header-row">
                    <span class="layer-title-badge"><i class="fa-solid fa-pen"></i> ${layer.label || 'Texte'}</span>
                    <button class="btn-icon-sm danger" data-action="delete" data-id="${layer.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
                <textarea class="layer-input-text" data-id="${layer.id}">${layer.text}</textarea>
            `;

            const textarea = item.querySelector('.layer-input-text');
            textarea.addEventListener('input', (e) => {
                layer.text = e.target.value;
                renderCanvas();
            });
            textarea.addEventListener('focus', () => {
                state.selectedLayerId = layer.id;
                populateLayerSelector();
                renderCanvas();
            });

            item.querySelector('[data-action="delete"]').addEventListener('click', () => {
                deleteLayer(layer.id);
            });

            layersList.appendChild(item);
        });
    }

    function populateLayerSelector() {
        activeLayerSelect.innerHTML = '';
        state.layers.forEach(layer => {
            const opt = document.createElement('option');
            opt.value = layer.id;
            opt.textContent = layer.label || layer.text.substring(0, 20);
            if (layer.id === state.selectedLayerId) opt.selected = true;
            activeLayerSelect.appendChild(opt);
        });
    }

    function deleteLayer(layerId) {
        if (state.layers.length <= 1) return;
        state.layers = state.layers.filter(l => l.id !== layerId);
        state.selectedLayerId = state.layers[0].id;
        populateLayerSelector();
        renderLayersList();
        renderCanvas();
    }

    function addCustomTextLayer() {
        const newId = `layer_${Date.now()}`;
        state.layers.push({
            id: newId,
            label: 'Texte Personnalisé',
            text: 'Nouveau texte ici...',
            fontFamily: 'Playfair Display',
            fontSize: 22,
            color: '#4a3505',
            gradient: null,
            align: 'center',
            pctX: 50,
            pctY: 50
        });
        state.selectedLayerId = newId;
        populateLayerSelector();
        renderLayersList();
        renderCanvas();
    }

    function syncStyleControls() {
        const selected = state.layers.find(l => l.id === state.selectedLayerId);
        if (!selected) return;

        fontFamilySelect.value = selected.fontFamily;
        fontSizeRange.value = selected.fontSize;
        fontSizeVal.textContent = `${selected.fontSize}px`;

        colorSwatches.forEach(swatch => {
            const color = swatch.getAttribute('data-color');
            const hasGrad = swatch.hasAttribute('data-gradient');
            swatch.classList.toggle('active', color === selected.color && (hasGrad ? !!selected.gradient : !selected.gradient));
        });

        alignButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-align') === selected.align);
        });
    }

    function setupEventListeners() {
        activeLayerSelect.addEventListener('change', (e) => {
            state.selectedLayerId = e.target.value;
            renderLayersList();
            renderCanvas();
        });

        fontFamilySelect.addEventListener('change', (e) => {
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.fontFamily = e.target.value;
                renderCanvas();
            }
        });

        fontSizeRange.addEventListener('input', (e) => {
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.fontSize = parseInt(e.target.value);
                fontSizeVal.textContent = `${selected.fontSize}px`;
                renderCanvas();
            }
        });

        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.getAttribute('data-color');
                const hasGrad = swatch.hasAttribute('data-gradient');
                const bgStyle = swatch.style.background;
                const selected = state.layers.find(l => l.id === state.selectedLayerId);
                
                if (selected) {
                    selected.color = color;
                    selected.gradient = hasGrad ? bgStyle : null;
                    renderCanvas();
                }
            });
        });

        alignButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const align = btn.getAttribute('data-align');
                const selected = state.layers.find(l => l.id === state.selectedLayerId);
                if (selected) {
                    selected.align = align;
                    renderCanvas();
                }
            });
        });

        btnAddCustomText.addEventListener('click', addCustomTextLayer);

        // Zoom controls
        btnZoomIn.addEventListener('click', () => setZoom(state.zoomLevel + 0.15));
        btnZoomOut.addEventListener('click', () => setZoom(state.zoomLevel - 0.15));
        if (btnZoomFit) btnZoomFit.addEventListener('click', autoFitZoom);

        btnToggleGuide.addEventListener('click', () => {
            state.showGuides = !state.showGuides;
            btnToggleGuide.classList.toggle('active', state.showGuides);
        });

        btnExportMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdownMenu.classList.toggle('show');
        });
        document.addEventListener('click', () => exportDropdownMenu.classList.remove('show'));

        btnExportPNG.addEventListener('click', () => triggerExport('png'));
        btnExportPDF.addEventListener('click', () => triggerExport('pdf'));
        btnNewProject.addEventListener('click', () => location.reload());
    }

    function setZoom(lvl) {
        state.zoomLevel = Math.max(0.35, Math.min(2.0, lvl));
        zoomWrapper.style.transform = `scale(${state.zoomLevel})`;
        zoomPercent.textContent = `${Math.round(state.zoomLevel * 100)}%`;
    }

    // --- Fullscreen Preview Render ---
    function generateFullscreenPreview() {
        if (!state.currentTemplate) return;

        const canvas = fullscreenCanvas;
        const ctx = canvas.getContext('2d');
        const img = cardBgImage;

        canvas.width = state.currentTemplate.width;
        canvas.height = state.currentTemplate.height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        state.layers.forEach(layer => {
            if (!layer.text.trim()) return;

            const fontSize = layer.fontSize;
            ctx.font = `${fontSize}px '${layer.fontFamily}', serif`;
            ctx.textAlign = layer.align;
            ctx.textBaseline = 'top';

            const x = (layer.pctX / 100.0) * canvas.width;
            const y = (layer.pctY / 100.0) * canvas.height;

            if (layer.gradient) {
                const grad = ctx.createLinearGradient(x, y, x + 200, y + fontSize);
                grad.addColorStop(0, '#bf953f');
                grad.addColorStop(0.5, '#fcf6ba');
                grad.addColorStop(1, '#aa771c');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = layer.color;
            }

            const lines = layer.text.split('\n');
            let curY = y;

            lines.forEach(line => {
                ctx.fillText(line, x, curY);
                curY += fontSize * 1.3;
            });
        });

        fullscreenModal.classList.add('show');
    }

    // --- Instant Direct Export ---
    async function triggerExport(format) {
        if (!state.currentTemplate) return;

        showToast(`Génération de votre invitation ${format.toUpperCase()}...`);

        // HTML5 Canvas Composition
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = cardBgImage;

        canvas.width = state.currentTemplate.width;
        canvas.height = state.currentTemplate.height;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        state.layers.forEach(layer => {
            if (!layer.text.trim()) return;

            ctx.font = `${layer.fontSize}px '${layer.fontFamily}', serif`;
            ctx.textAlign = layer.align;
            ctx.textBaseline = 'top';

            const x = (layer.pctX / 100.0) * canvas.width;
            const y = (layer.pctY / 100.0) * canvas.height;

            if (layer.gradient) {
                const grad = ctx.createLinearGradient(x, y, x + 200, y + layer.fontSize);
                grad.addColorStop(0, '#bf953f');
                grad.addColorStop(0.5, '#fcf6ba');
                grad.addColorStop(1, '#aa771c');
                ctx.fillStyle = grad;
            } else {
                ctx.fillStyle = layer.color;
            }

            const lines = layer.text.split('\n');
            let curY = y;

            lines.forEach(line => {
                ctx.fillText(line, x, curY);
                curY += layer.fontSize * 1.3;
            });
        });

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        
        // Clean meaningful filename
        const namesLayer = state.layers.find(l => l.id === 'layer_names');
        const namesSlug = namesLayer ? namesLayer.text.replace(/[^a-zA-Z0-9]/g, '_') : 'Mariage';
        const cleanFileName = `RIWA_Invitation_${namesSlug}.${format}`;

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = cleanFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast(`Invitation téléchargée : ${cleanFileName} ! 🎉`);
    }

    function showToast(msg) {
        const toast = document.getElementById('riwaToast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = msg;
        toast.classList.add('show');

        setTimeout(() => toast.classList.remove('show'), 3400);
    }
});
