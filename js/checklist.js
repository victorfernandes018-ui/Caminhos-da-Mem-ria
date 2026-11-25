/* ===================================================
   CAMINHOS DA MEMÓRIA - Checklist de Rotina Diária
   Reseta automaticamente a cada novo dia
   =================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'caminhos_checklist';
    const TAREFAS = [
        'Oferecer café da manhã',
        'Administrar medicações da manhã',
        'Realizar higiene pessoal',
        'Propor atividade de estimulação',
        'Oferecer almoço e hidratação',
        'Administrar medicações do almoço (se houver)',
        'Período de descanso / cochilo',
        'Oferecer lanche da tarde',
        'Atividade leve ou passeio',
        'Oferecer jantar e medicações noturnas',
    ];

    function hoje() {
        return new Date().toISOString().slice(0, 10);
    }

    function carregarEstado() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (saved && saved.data === hoje()) return saved.marcados || [];
        } catch { /* */ }
        return [];
    }

    function salvarEstado(marcados) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: hoje(), marcados }));
    }

    function atualizarProgresso(marcados) {
        const total = TAREFAS.length;
        const feitos = marcados.length;
        const pct = Math.round((feitos / total) * 100);

        const barra = document.getElementById('checklist-barra');
        const texto = document.getElementById('checklist-progresso-texto');
        const progressbar = document.getElementById('checklist-progressbar');

        if (barra) barra.style.width = pct + '%';
        if (texto) texto.textContent = `${feitos} de ${total} tarefas`;
        if (progressbar) progressbar.setAttribute('aria-valuenow', pct);
    }

    function renderizar() {
        const container = document.getElementById('checklist-lista');
        if (!container) return;

        const marcados = carregarEstado();

        container.innerHTML = TAREFAS.map((tarefa, i) => {
            const checked = marcados.includes(i);
            return `
                <div class="checklist-item${checked ? ' concluido' : ''}" data-idx="${i}">
                    <input type="checkbox" id="task-${i}" ${checked ? 'checked' : ''} aria-label="${tarefa}">
                    <label for="task-${i}">${tarefa}</label>
                </div>
            `;
        }).join('');

        atualizarProgresso(marcados);

        container.querySelectorAll('.checklist-item').forEach(item => {
            const idx = parseInt(item.dataset.idx, 10);
            const checkbox = item.querySelector('input[type="checkbox"]');

            item.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                checkbox.checked = !checkbox.checked;
                toggleTarefa(idx, checkbox.checked, item);
            });

            checkbox.addEventListener('change', () => {
                toggleTarefa(idx, checkbox.checked, item);
            });
        });
    }

    function toggleTarefa(idx, checked, itemEl) {
        const marcados = carregarEstado();
        if (checked) {
            if (!marcados.includes(idx)) marcados.push(idx);
        } else {
            const pos = marcados.indexOf(idx);
            if (pos > -1) marcados.splice(pos, 1);
        }
        salvarEstado(marcados);
        itemEl.classList.toggle('concluido', checked);
        atualizarProgresso(marcados);
    }

    const btnReset = document.getElementById('checklist-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            salvarEstado([]);
            renderizar();
        });
    }

    renderizar();

})();
