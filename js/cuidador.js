/* ===================================================
   PÁGINA DO CUIDADOR
   - Lembrete de medicação
   - Diário de sintomas
   Dados salvos APENAS no navegador (localStorage)
   =================================================== */

(function () {
    'use strict';

    // ============================
    // LEMBRETE DE MEDICAÇÃO
    // ============================
    const KEY_MED = 'caminhos_medicacoes';
    const formMed = document.getElementById('form-medicacao');
    const listaMed = document.getElementById('lista-medicacoes');

    function carregarMedicacoes() {
        try {
            return JSON.parse(localStorage.getItem(KEY_MED)) || [];
        } catch (e) {
            return [];
        }
    }

    function salvarMedicacoes(medicacoes) {
        localStorage.setItem(KEY_MED, JSON.stringify(medicacoes));
    }

    function renderizarMedicacoes() {
        if (!listaMed) return;
        const medicacoes = carregarMedicacoes();
        const titulo = '<h3>Medicações cadastradas:</h3>';

        if (medicacoes.length === 0) {
            listaMed.innerHTML = titulo + '<p class="vazio-msg">Nenhuma medicação cadastrada ainda.</p>';
            return;
        }

        // Ordena por horário
        medicacoes.sort((a, b) => a.horario.localeCompare(b.horario));

        const html = medicacoes.map((med, idx) => `
            <div class="item-card">
                <div class="item-info">
                    <strong>⏰ ${escapeHtml(med.horario)} — ${escapeHtml(med.nome)}</strong>
                    <div class="item-detalhes">
                        Dose: ${escapeHtml(med.dose)}
                        ${med.obs ? '<br>📝 ' + escapeHtml(med.obs) : ''}
                    </div>
                </div>
                <button class="btn-remover" data-idx="${idx}" data-tipo="med" aria-label="Remover ${escapeHtml(med.nome)}">Remover</button>
            </div>
        `).join('');

        listaMed.innerHTML = titulo + html;
    }

    if (formMed) {
        formMed.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('med-nome').value.trim();
            const dose = document.getElementById('med-dose').value.trim();
            const horario = document.getElementById('med-horario').value;
            const obs = document.getElementById('med-obs').value.trim();

            if (!nome || !dose || !horario) return;

            const medicacoes = carregarMedicacoes();
            medicacoes.push({ nome, dose, horario, obs });
            salvarMedicacoes(medicacoes);
            renderizarMedicacoes();
            formMed.reset();
        });
    }

    // ============================
    // DIÁRIO DE SINTOMAS
    // ============================
    const KEY_DIARIO = 'caminhos_diario';
    const formDiario = document.getElementById('form-diario');
    const listaDiario = document.getElementById('lista-diario');

    function carregarDiario() {
        try {
            return JSON.parse(localStorage.getItem(KEY_DIARIO)) || [];
        } catch (e) {
            return [];
        }
    }

    function salvarDiario(registros) {
        localStorage.setItem(KEY_DIARIO, JSON.stringify(registros));
    }

    function formatarData(dataStr) {
        if (!dataStr) return '';
        const [ano, mes, dia] = dataStr.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function renderizarDiario() {
        if (!listaDiario) return;
        const registros = carregarDiario();
        const titulo = '<h3>Últimos registros:</h3>';

        if (registros.length === 0) {
            listaDiario.innerHTML = titulo + '<p class="vazio-msg">Nenhum registro ainda.</p>';
            return;
        }

        // Ordena do mais recente para o mais antigo
        registros.sort((a, b) => b.data.localeCompare(a.data));

        // Mostra os 10 mais recentes
        const recentes = registros.slice(0, 10);

        const html = recentes.map((reg, idx) => `
            <div class="item-card">
                <div class="item-info">
                    <strong>📅 ${formatarData(reg.data)}</strong>
                    <div class="item-detalhes">
                        Humor: ${escapeHtml(reg.humor)}<br>
                        Sono: ${escapeHtml(reg.sono)}
                        ${reg.obs ? '<br>📝 ' + escapeHtml(reg.obs) : ''}
                    </div>
                </div>
                <button class="btn-remover" data-idx="${idx}" data-tipo="diario" aria-label="Remover registro de ${formatarData(reg.data)}">Remover</button>
            </div>
        `).join('');

        listaDiario.innerHTML = titulo + html;
    }

    if (formDiario) {
        // Pré-preencher data com hoje
        const inputData = document.getElementById('diario-data');
        if (inputData) {
            const hoje = new Date().toISOString().split('T')[0];
            inputData.value = hoje;
        }

        formDiario.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = document.getElementById('diario-data').value;
            const humor = document.getElementById('diario-humor').value;
            const sono = document.getElementById('diario-sono').value;
            const obs = document.getElementById('diario-obs').value.trim();

            if (!data || !humor || !sono) return;

            const registros = carregarDiario();
            registros.push({ data, humor, sono, obs });
            salvarDiario(registros);
            renderizarDiario();
            formDiario.reset();
            // Restaurar data de hoje
            if (inputData) {
                inputData.value = new Date().toISOString().split('T')[0];
            }
        });
    }

    // ============================
    // REMOVER ITENS
    // ============================
    document.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn-remover')) return;

        const idx = parseInt(e.target.dataset.idx);
        const tipo = e.target.dataset.tipo;

        if (tipo === 'med') {
            if (!confirm('Remover esta medicação?')) return;
            const medicacoes = carregarMedicacoes();
            medicacoes.sort((a, b) => a.horario.localeCompare(b.horario));
            medicacoes.splice(idx, 1);
            salvarMedicacoes(medicacoes);
            renderizarMedicacoes();
        } else if (tipo === 'diario') {
            if (!confirm('Remover este registro?')) return;
            const registros = carregarDiario();
            registros.sort((a, b) => b.data.localeCompare(a.data));
            registros.splice(idx, 1);
            salvarDiario(registros);
            renderizarDiario();
        }
    });

    // ============================
    // UTIL: Sanitizar HTML
    // ============================
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ============================
    // INICIALIZAR
    // ============================
    renderizarMedicacoes();
    renderizarDiario();

})();

// ============================
// IMPRESSÃO
// ============================
function imprimirSecao(secao) {
    const titulos = {
        medicacao: 'Lista de Medicações',
        diario: 'Diário de Sintomas'
    };

    const printTitulo = document.getElementById('print-titulo');
    const printData = document.getElementById('print-data');

    if (printTitulo) printTitulo.textContent = titulos[secao] || '';
    if (printData) {
        const agora = new Date();
        printData.textContent = 'Gerado em: ' + agora.toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    }

    // Esconde as seções que não são desta impressão
    const todasSecoes = ['medicacao', 'diario', 'dicas', 'autocuidado'];
    todasSecoes.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.dataset.printHide = id !== secao ? 'true' : 'false';
    });

    // Adiciona estilo temporário para esconder o que não precisa
    const style = document.createElement('style');
    style.id = 'print-temp';
    style.textContent = `
        @media print {
            #${secao === 'medicacao' ? 'diario' : 'medicacao'} { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    window.print();

    // Remove estilo temporário depois
    setTimeout(() => {
        const s = document.getElementById('print-temp');
        if (s) s.remove();
    }, 1000);
}
