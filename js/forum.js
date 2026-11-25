/* ===================================================
   CAMINHOS DA MEMÓRIA - Mural da Comunidade
   Armazenamento local via localStorage
   =================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'caminhos_forum';

    function carregarMensagens() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch {
            return [];
        }
    }

    function salvarMensagens(msgs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    }

    function escapar(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatarData(iso) {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    function renderizarMensagens() {
        const container = document.getElementById('forum-mensagens');
        if (!container) return;

        const msgs = carregarMensagens();

        if (msgs.length === 0) {
            container.innerHTML = '<p class="vazio-msg">Nenhuma mensagem ainda. Seja o primeiro a compartilhar!</p>';
            return;
        }

        container.innerHTML = msgs
            .slice()
            .reverse()
            .map((m, idx) => `
                <article class="forum-card">
                    <div class="forum-card-header">
                        <span class="forum-autor">${escapar(m.nome || 'Anônimo')}</span>
                        <span class="forum-data">${formatarData(m.data)}</span>
                    </div>
                    <p class="forum-texto">${escapar(m.mensagem)}</p>
                    <button class="forum-excluir" data-idx="${msgs.length - 1 - idx}" aria-label="Excluir mensagem">Excluir</button>
                </article>
            `)
            .join('');

        container.querySelectorAll('.forum-excluir').forEach(btn => {
            btn.addEventListener('click', () => {
                const i = parseInt(btn.dataset.idx, 10);
                const msgs = carregarMensagens();
                msgs.splice(i, 1);
                salvarMensagens(msgs);
                renderizarMensagens();
            });
        });
    }

    // Contador de caracteres
    const textarea = document.getElementById('forum-mensagem');
    const contador = document.getElementById('forum-contador');

    if (textarea && contador) {
        textarea.addEventListener('input', () => {
            contador.textContent = `${textarea.value.length} / 500`;
        });
    }

    // Envio do formulário
    const form = document.getElementById('form-forum');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nome = (document.getElementById('forum-nome')?.value || '').trim();
            const mensagem = (document.getElementById('forum-mensagem')?.value || '').trim();

            if (!mensagem) return;

            const msgs = carregarMensagens();
            msgs.push({ nome, mensagem, data: new Date().toISOString() });
            salvarMensagens(msgs);

            form.reset();
            if (contador) contador.textContent = '0 / 500';
            renderizarMensagens();

            // Rola até a lista
            document.getElementById('forum-mensagens')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    renderizarMensagens();

})();
