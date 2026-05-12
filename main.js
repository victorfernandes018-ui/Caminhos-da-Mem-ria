/* ===================================================
   CAMINHOS DA MEMÓRIA - JavaScript Principal
   Funções globais: acessibilidade e navegação
   =================================================== */

(function () {
    'use strict';

    // ==========================================
    // 1. CONTROLE DE TAMANHO DE FONTE
    // ==========================================
    const STORAGE_KEY_FONT = 'caminhos_font_scale';
    const STORAGE_KEY_CONTRAST = 'caminhos_high_contrast';

    const html = document.documentElement;

    // Carrega preferências salvas
    const savedFontScale = parseFloat(localStorage.getItem(STORAGE_KEY_FONT)) || 1;
    html.style.fontSize = (16 * savedFontScale) + 'px';

    if (localStorage.getItem(STORAGE_KEY_CONTRAST) === 'true') {
        document.body.classList.add('high-contrast');
    }

    function setFontScale(scale) {
        // Limita entre 0.85x e 1.5x para não quebrar o layout
        scale = Math.max(0.85, Math.min(1.5, scale));
        html.style.fontSize = (16 * scale) + 'px';
        localStorage.setItem(STORAGE_KEY_FONT, scale);
    }

    function getCurrentScale() {
        return parseFloat(localStorage.getItem(STORAGE_KEY_FONT)) || 1;
    }

    const btnIncrease = document.getElementById('font-increase');
    const btnDecrease = document.getElementById('font-decrease');
    const btnReset = document.getElementById('font-reset');

    if (btnIncrease) {
        btnIncrease.addEventListener('click', () => {
            setFontScale(getCurrentScale() + 0.1);
        });
    }

    if (btnDecrease) {
        btnDecrease.addEventListener('click', () => {
            setFontScale(getCurrentScale() - 0.1);
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            setFontScale(1);
        });
    }

    // ==========================================
    // 2. ALTO CONTRASTE
    // ==========================================
    const btnContrast = document.getElementById('contrast-toggle');
    if (btnContrast) {
        btnContrast.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            const isOn = document.body.classList.contains('high-contrast');
            localStorage.setItem(STORAGE_KEY_CONTRAST, isOn);
        });
    }

    // ==========================================
    // 3. MENU MOBILE
    // ==========================================
    const menuToggle = document.getElementById('menuToggle');
    const mainMenu = document.getElementById('mainMenu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = mainMenu.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // ==========================================
    // 4. MARCAR LINK ATIVO AUTOMATICAMENTE
    // ==========================================
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.menu a').forEach(link => {
        const linkPath = link.getAttribute('href').split('/').pop();
        if (linkPath === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

})();
