/**
 * RIWA Studio - Interactive Digital Invitation Designer Engine
 * Handles Canvas rendering, Drag & Drop text positioning, Font switching, & High-res Exports
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    const state = {
        user: null, // Google user profile if logged in
        templates: [],
        currentTemplate: null,
        layers: [
            {
                id: 'layer_monogram',
                label: 'Monogramme / Initiales',
                text: 'S  &  M',
                fontFamily: 'Tangerine',
                fontSize: 72,
                color: 'gradient-gold',
                gradient: 'gold',
                align: 'center',
                letterSpacing: 2,
                x: 450,
                y: 220
            },
            {
                id: 'layer_names',
                label: 'Noms des Mariés',
                text: 'Sarah  &  Mohamed',
                fontFamily: 'Great Vibes',
                fontSize: 54,
                color: 'gradient-gold',
                gradient: 'gold',
                align: 'center',
                letterSpacing: 0,
                x: 450,
                y: 380
            },
            {
                id: 'layer_formula',
                label: 'Formule d\'invitation',
                text: 'ont la joie de vous inviter à célébrer leur union',
                fontFamily: 'Playfair Display',
                fontSize: 22,
                color: '#ffffff',
                gradient: null,
                align: 'center',
                letterSpacing: 1,
                x: 450,
                y: 520
            },
            {
                id: 'layer_date',
                label: 'Date & Heure',
                text: 'SAMEDI 18 JUILLET 2026 — 17H00',
                fontFamily: 'Cinzel',
                fontSize: 24,
                color: '#d4af37',
                gradient: null,
                align: 'center',
                letterSpacing: 3,
                x: 450,
                y: 640
            },
            {
                id: 'layer_venue',
                label: 'Lieu de célébration',
                text: 'Palais des Roses\nCasablanca, Maroc',
                fontFamily: 'Cormorant Garamond',
                fontSize: 24,
                color: '#ffffff',
                gradient: null,
                align: 'center',
                letterSpacing: 1,
                x: 450,
                y: 750
            },
            {
                id: 'layer_rsvp',
                label: 'RSVP & Contact',
                text: 'Réponse souhaitée avant le 1er Juin\n06 12 34 56 78',
                fontFamily: 'Montserrat',
                fontSize: 16,
                color: '#9aa1b1',
                gradient: null,
                align: 'center',
                letterSpacing: 1,
                x: 450,
                y: 920
            }
        ],
        selectedLayerId: 'layer_names',
        zoomLevel: 1.0,
        showGuides: true,
        drag: {
            active: false,
            layerId: null,
            startX: 0,
            startY: 0,
            initialX: 0,
            initialY: 0
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
    const googleAuthModal = document.getElementById('googleAuthModal');
    const btnOpenAuthModal = document.getElementById('btnOpenAuthModal');
    const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
    const googleLoginForm = document.getElementById('googleLoginForm');
    const btnSimulateGoogleAuth = document.getElementById('btnSimulateGoogleAuth');
    const userAuthContainer = document.getElementById('userAuthContainer');
    const authEmailInput = document.getElementById('authEmailInput');
    const authNameInput = document.getElementById('authNameInput');

    const templatesGrid = document.getElementById('templatesGrid');
    const cardBgImage = document.getElementById('cardBgImage');
    const interactiveStage = document.getElementById('interactiveStage');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const layersList = document.getElementById('layersList');
    const activeLayerSelect = document.getElementById('activeLayerSelect');
    
    // Style Inputs
    const fontFamilySelect = document.getElementById('fontFamilySelect');
    const fontSizeRange = document.getElementById('fontSizeRange');
    const fontSizeVal = document.getElementById('fontSizeVal');
    const letterSpacingRange = document.getElementById('letterSpacingRange');
    const letterSpacingVal = document.getElementById('letterSpacingVal');
    const customColorPicker = document.getElementById('customColorPicker');
    const customColorHex = document.getElementById('customColorHex');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const alignButtons = document.querySelectorAll('[data-align]');
    const posXRange = document.getElementById('posXRange');
    const posXVal = document.getElementById('posXVal');
    const posYRange = document.getElementById('posYRange');
    const posYVal = document.getElementById('posYVal');

    // Toolbar & Actions
    const btnNewProject = document.getElementById('btnNewProject');
    const btnSaveProject = document.getElementById('btnSaveProject');
    const btnExportMenu = document.getElementById('btnExportMenu');
    const exportDropdownMenu = document.getElementById('exportDropdownMenu');
    const btnExportPNG = document.getElementById('btnExportPNG');
    const btnExportPDF = document.getElementById('btnExportPDF');
    const btnAddCustomText = document.getElementById('btnAddCustomText');
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnZoomReset = document.getElementById('btnZoomReset');
    const zoomPercent = document.getElementById('zoomPercent');
    const btnToggleGuide = document.getElementById('btnToggleGuide');
    const guideV = document.getElementById('guideV');
    const guideH = document.getElementById('guideH');

    // Status Footer
    const statusTemplateName = document.getElementById('statusTemplateName');
    const statusResolution = document.getElementById('statusResolution');
    const statusLayersCount = document.getElementById('statusLayersCount');

    // --- Initialization ---
    init();

    async function init() {
        setupSplashAndAuth();
        setupTabs();
        setupEventListeners();
        await fetchTemplates();
        renderLayersList();
        populateLayerSelector();
        syncStyleControls();
        renderCanvas();
    }

    // --- Splash Screen & Auth logic ---
    function setupSplashAndAuth() {
        if (btnEnterStudio) {
            btnEnterStudio.addEventListener('click', () => {
                riwaSplashScreen.classList.add('hide');
            });
        }

        if (btnOpenAuthModal) {
            btnOpenAuthModal.addEventListener('click', () => {
                googleAuthModal.classList.add('show');
            });
        }

        if (btnCloseAuthModal) {
            btnCloseAuthModal.addEventListener('click', () => {
                googleAuthModal.classList.remove('show');
            });
        }

        if (btnSimulateGoogleAuth) {
            btnSimulateGoogleAuth.addEventListener('click', () => {
                authNameInput.value = "Mariem Benani";
                authEmailInput.value = "mariem.benani@gmail.com";
                submitGoogleLogin();
            });
        }

        if (googleLoginForm) {
            googleLoginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                submitGoogleLogin();
            });
        }
    }

    async function submitGoogleLogin() {
        const name = authNameInput.value.trim() || 'Membre RIWA';
        const email = authEmailInput.value.trim() || 'membre@gmail.com';

        state.user = { name, email };
        googleAuthModal.classList.remove('show');

        // Update header user badge
        userAuthContainer.innerHTML = `
            <div class="user-badge-header">
                <i class="fa-brands fa-google text-gold"></i>
                <span>${name}</span>
            </div>
        `;

        showToast(`Bienvenue ${name} ! Envoi de votre email en cours...`);

        // Send Welcome Email API call
        try {
            const res = await fetch('/api/send-welcome-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Email de bienvenue envoyé à ${email} ! 📧`);
            }
        } catch (err) {
            console.error("Welcome email error:", err);
        }
    }

    // --- Tab Switching ---
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

    // --- API Calls ---
    async function fetchTemplates() {
        try {
            const response = await fetch('/api/templates');
            const data = await response.json();
            
            if (data.success && data.templates.length > 0) {
                state.templates = data.templates;
                renderTemplatesGrid(data.templates);
                selectTemplate(data.templates[0]);
            } else {
                templatesGrid.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-triangle-exclamation"></i> Aucun modèle trouvé dans le dossier Cards.</div>`;
            }
        } catch (err) {
            console.error("Error fetching templates:", err);
            templatesGrid.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-triangle-exclamation"></i> Erreur lors du chargement des modèles.</div>`;
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
            const w = tmpl.width;
            const h = tmpl.height;
            
            canvasWrapper.style.width = `${cardBgImage.clientWidth}px`;
            canvasWrapper.style.height = `${cardBgImage.clientHeight}px`;
            
            posXRange.max = w;
            posYRange.max = h;
            
            // Adjust default initial positions relative to card width
            state.layers.forEach(layer => {
                if (layer.x === 450 || layer.x > w) {
                    layer.x = Math.round(w / 2);
                }
            });

            statusTemplateName.innerHTML = `<i class="fa-regular fa-image"></i> ${tmpl.filename}`;
            statusResolution.innerHTML = `<i class="fa-solid fa-ruler-combined"></i> ${w} × ${h} px`;
            
            renderCanvas();
        };

        cardBgImage.src = tmpl.url;
    }

    // --- Interactive Stage & Rendering ---
    function renderCanvas() {
        interactiveStage.innerHTML = '';
        statusLayersCount.innerHTML = `<i class="fa-solid fa-layer-group"></i> Textes: ${state.layers.length}`;

        if (!state.currentTemplate) return;

        const naturalW = state.currentTemplate.width;
        const naturalH = state.currentTemplate.height;
        const displayedW = cardBgImage.clientWidth || 450;
        const scale = displayedW / naturalW;

        state.layers.forEach(layer => {
            const isSelected = layer.id === state.selectedLayerId;
            const el = document.createElement('div');
            el.className = `canvas-text-element ${isSelected ? 'selected' : ''}`;
            el.setAttribute('data-id', layer.id);

            // Font & Size
            el.style.fontFamily = `'${layer.fontFamily}', serif`;
            el.style.fontSize = `${layer.fontSize * scale}px`;
            el.style.letterSpacing = `${layer.letterSpacing * scale}px`;
            el.style.textAlign = layer.align;
            el.style.lineHeight = '1.25';

            // Color / Gradient handling
            if (layer.color.startsWith('gradient-') || layer.gradient) {
                const gType = layer.gradient || layer.color.replace('gradient-', '');
                el.classList.add(`text-gradient-${gType}`);
            } else {
                el.style.color = layer.color;
            }

            // Positioning
            const posX = layer.x * scale;
            const posY = layer.y * scale;
            el.style.top = `${posY}px`;

            if (layer.align === 'center') {
                el.style.left = `${posX}px`;
                el.style.transform = 'translateX(-50%)';
            } else if (layer.align === 'right') {
                el.style.left = `${posX}px`;
                el.style.transform = 'translateX(-100%)';
            } else {
                el.style.left = `${posX}px`;
                el.style.transform = 'none';
            }

            el.textContent = layer.text;

            // Append Resize Handle for active element
            if (isSelected) {
                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'resize-handle';
                resizeHandle.title = 'Glissez pour changer la taille du texte';
                resizeHandle.addEventListener('mousedown', (e) => startResize(e, layer.id));
                resizeHandle.addEventListener('touchstart', (e) => startResize(e, layer.id), { passive: false });
                el.appendChild(resizeHandle);
            }

            // Select & Drag
            el.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('resize-handle')) return;
                startDrag(e, layer.id);
            });
            el.addEventListener('touchstart', (e) => {
                if (e.target.classList.contains('resize-handle')) return;
                startDrag(e, layer.id);
            }, { passive: false });

            interactiveStage.appendChild(el);
        });

        syncStyleControls();
    }

    // --- Drag & Drop Movement Engine ---
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
            initialX: layer.x,
            initialY: layer.y
        };

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }

    function onDrag(e) {
        if (!state.drag.active || !state.currentTemplate) return;
        e.preventDefault();

        const pointerX = e.touches ? e.touches[0].clientX : e.clientX;
        const pointerY = e.touches ? e.touches[0].clientY : e.clientY;

        const deltaX = pointerX - state.drag.startX;
        const deltaY = pointerY - state.drag.startY;

        const displayedW = cardBgImage.clientWidth || 450;
        const naturalW = state.currentTemplate.width;
        const scale = naturalW / displayedW;

        const layer = state.layers.find(l => l.id === state.drag.layerId);
        if (layer) {
            let newX = Math.round(state.drag.initialX + (deltaX * scale));
            let newY = Math.round(state.drag.initialY + (deltaY * scale));

            // Snap to center guideline if close
            const centerX = Math.round(naturalW / 2);
            if (Math.abs(newX - centerX) < 25) {
                newX = centerX;
                guideV.style.display = state.showGuides ? 'block' : 'none';
            } else {
                guideV.style.display = 'none';
            }

            layer.x = Math.max(0, Math.min(naturalW, newX));
            layer.y = Math.max(0, Math.min(state.currentTemplate.height, newY));

            posXRange.value = layer.x;
            posXVal.textContent = layer.x;
            posYRange.value = layer.y;
            posYVal.textContent = layer.y;

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

    // --- Dynamic Corner Resize Handle Engine ---
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
            const newSize = Math.max(12, Math.min(160, Math.round(state.resize.initialSize + (deltaY * 0.8))));
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

    // --- Sidebar Layers Management ---
    function renderLayersList() {
        layersList.innerHTML = '';
        state.layers.forEach((layer, idx) => {
            const item = document.createElement('div');
            item.className = `layer-item ${layer.id === state.selectedLayerId ? 'active' : ''}`;
            
            item.innerHTML = `
                <div class="layer-header-row">
                    <span class="layer-title-badge"><i class="fa-solid fa-pen"></i> ${layer.label || 'Texte'}</span>
                    <div class="layer-actions">
                        <button class="btn-icon-sm danger" data-action="delete" data-id="${layer.id}" title="Supprimer">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
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
        if (state.layers.length <= 1) {
            showToast("Vous devez garder au moins un champ de texte !");
            return;
        }
        state.layers = state.layers.filter(l => l.id !== layerId);
        if (state.selectedLayerId === layerId) {
            state.selectedLayerId = state.layers[0].id;
        }
        populateLayerSelector();
        renderLayersList();
        renderCanvas();
        showToast("Champ supprimé.");
    }

    function addCustomTextLayer() {
        const newId = `layer_${Date.now()}`;
        const newLayer = {
            id: newId,
            label: 'Texte Personnalisé',
            text: 'Nouveau texte ici...',
            fontFamily: 'Playfair Display',
            fontSize: 24,
            color: '#d4af37',
            gradient: null,
            align: 'center',
            letterSpacing: 0,
            x: state.currentTemplate ? Math.round(state.currentTemplate.width / 2) : 450,
            y: state.currentTemplate ? Math.round(state.currentTemplate.height / 2) : 500
        };

        state.layers.push(newLayer);
        state.selectedLayerId = newId;
        populateLayerSelector();
        renderLayersList();
        renderCanvas();
        showToast("Nouveau champ texte ajouté !");
    }

    // --- Synchronize Controls with Selected Layer ---
    function syncStyleControls() {
        const selected = state.layers.find(l => l.id === state.selectedLayerId);
        if (!selected) return;

        fontFamilySelect.value = selected.fontFamily;
        fontSizeRange.value = selected.fontSize;
        fontSizeVal.textContent = `${selected.fontSize}px`;
        letterSpacingRange.value = selected.letterSpacing;
        letterSpacingVal.textContent = `${selected.letterSpacing}px`;

        if (selected.color.startsWith('#')) {
            customColorPicker.value = selected.color;
            customColorHex.value = selected.color;
        }

        colorSwatches.forEach(swatch => {
            const swatchColor = swatch.getAttribute('data-color');
            const swatchGradient = swatch.getAttribute('data-gradient');
            
            if (swatchGradient && selected.gradient === swatchGradient) {
                swatch.classList.add('active');
            } else if (!swatchGradient && !selected.gradient && swatchColor.toLowerCase() === selected.color.toLowerCase()) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });

        alignButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-align') === selected.align);
        });

        posXRange.value = selected.x;
        posXVal.textContent = selected.x;
        posYRange.value = selected.y;
        posYVal.textContent = selected.y;
    }

    // --- Setup Input Control Listeners ---
    function setupEventListeners() {
        // Layer select dropdown
        activeLayerSelect.addEventListener('change', (e) => {
            state.selectedLayerId = e.target.value;
            renderLayersList();
            renderCanvas();
        });

        // Font family
        fontFamilySelect.addEventListener('change', (e) => {
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.fontFamily = e.target.value;
                renderCanvas();
            }
        });

        // Font size slider
        fontSizeRange.addEventListener('input', (e) => {
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.fontSize = parseInt(e.target.value);
                fontSizeVal.textContent = `${selected.fontSize}px`;
                renderCanvas();
            }
        });

        // Letter spacing slider
        letterSpacingRange.addEventListener('input', (e) => {
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.letterSpacing = parseFloat(e.target.value);
                letterSpacingVal.textContent = `${selected.letterSpacing}px`;
                renderCanvas();
            }
        });

        // Color swatches & Metallic Gradients
        colorSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.getAttribute('data-color');
                const gradient = swatch.getAttribute('data-gradient');
                const selected = state.layers.find(l => l.id === state.selectedLayerId);
                
                if (selected) {
                    selected.color = color;
                    selected.gradient = gradient || null;
                    if (color.startsWith('#')) {
                        customColorPicker.value = color;
                        customColorHex.value = color;
                    }
                    renderCanvas();
                }
            });
        });

        // Custom color picker & hex input
        customColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.color = color;
                selected.gradient = null;
                customColorHex.value = color;
                renderCanvas();
            }
        });

        customColorHex.addEventListener('change', (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                const selected = state.layers.find(l => l.id === state.selectedLayerId);
                if (selected) {
                    selected.color = val;
                    selected.gradient = null;
                    customColorPicker.value = val;
                    renderCanvas();
                }
            }
        });

        // Alignment buttons
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

        // Fine position sliders
        posXRange.addEventListener('input', (e) => {
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.x = parseInt(e.target.value);
                posXVal.textContent = selected.x;
                renderCanvas();
            }
        });

        posYRange.addEventListener('input', (e) => {
            const selected = state.layers.find(l => l.id === state.selectedLayerId);
            if (selected) {
                selected.y = parseInt(e.target.value);
                posYVal.textContent = selected.y;
                renderCanvas();
            }
        });

        // Add custom text button
        btnAddCustomText.addEventListener('click', addCustomTextLayer);

        // Zoom Controls
        btnZoomIn.addEventListener('click', () => setZoom(state.zoomLevel + 0.15));
        btnZoomOut.addEventListener('click', () => setZoom(state.zoomLevel - 0.15));
        btnZoomReset.addEventListener('click', () => setZoom(1.0));

        // Toggle guide line
        btnToggleGuide.addEventListener('click', () => {
            state.showGuides = !state.showGuides;
            btnToggleGuide.classList.toggle('active', state.showGuides);
            showToast(state.showGuides ? "Lignes de guidage activées" : "Lignes de guidage désactivées");
        });

        // Export menu dropdown toggle
        btnExportMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            exportDropdownMenu.classList.remove('show');
        });

        btnExportPNG.addEventListener('click', () => triggerExport('png'));
        btnExportPDF.addEventListener('click', () => triggerExport('pdf'));

        // Save & New Project
        btnSaveProject.addEventListener('click', saveProject);
        btnNewProject.addEventListener('click', () => {
            if (confirm("Voulez-vous réinitialiser le projet à son état d'origine ?")) {
                location.reload();
            }
        });
    }

    function setZoom(lvl) {
        state.zoomLevel = Math.max(0.5, Math.min(2.5, lvl));
        canvasWrapper.style.transform = `scale(${state.zoomLevel})`;
        zoomPercent.textContent = `${Math.round(state.zoomLevel * 100)}%`;
    }

    // --- High-Resolution Server-side Export & Direct PC Download ---
    async function triggerExport(format) {
        if (!state.currentTemplate) return;

        showToast(`Génération de votre invitation ${format.toUpperCase()} en cours...`);

        const payload = {
            filename: state.currentTemplate.filename,
            format: format,
            layers: state.layers,
            previewWidth: cardBgImage.clientWidth || 450,
            previewHeight: cardBgImage.clientHeight || 750
        };

        try {
            const response = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Erreur lors de l'exportation");
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = `RIWA_Invitation_Mariage_${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);

            showToast(`Invitation ${format.toUpperCase()} téléchargée sur votre ordinateur ! 🎉`);
        } catch (err) {
            console.error("Export error:", err);
            showToast(`Erreur: ${err.message}`);
        }
    }

    // --- Save Project Local ---
    async function saveProject() {
        const titleInput = document.getElementById('projectTitleInput');
        const payload = {
            title: titleInput.value || 'Invitation_RIWA',
            template: state.currentTemplate,
            layers: state.layers,
            updatedAt: new Date().toISOString()
        };

        try {
            const response = await fetch('/api/save-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.success) {
                showToast("Projet sauvegardé avec succès !");
            }
        } catch (err) {
            console.error("Save error:", err);
            showToast("Erreur lors de la sauvegarde.");
        }
    }

    // --- Toast Notifications ---
    function showToast(msg) {
        const toast = document.getElementById('riwaToast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = msg;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }
});
