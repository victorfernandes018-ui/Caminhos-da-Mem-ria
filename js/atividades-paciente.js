/* ===================================================
   CAMINHOS DA MEMÓRIA — Atividades Cognitivas Leves
   "Quem é essa pessoa?" usando fotos do álbum
   Sem pontuação, sem punição, sempre pode pular
   =================================================== */

const DB_NAME = 'caminhos_album';
let db = null;
let perguntas = [];
let indiceAtual = 0;

// Perguntas de fallback quando não há fotos no álbum
const PERGUNTAS_PADRAO = [
    {
        imagem: null,
        pergunta: 'Qual animal ronrona e gosta de dormir ao sol?',
        opcoes: ['Cachorro', 'Gato', 'Pássaro'],
        correta: 'Gato'
    },
    {
        imagem: null,
        pergunta: 'Que fruta é amarela e doce como o sol?',
        opcoes: ['Maçã', 'Laranja', 'Banana'],
        correta: 'Banana'
    },
    {
        imagem: null,
        pergunta: 'Qual é a cor do céu num dia bonito?',
        opcoes: ['Verde', 'Azul', 'Vermelho'],
        correta: 'Azul'
    },
    {
        imagem: null,
        pergunta: 'O que a gente faz quando está cansado?',
        opcoes: ['Come', 'Dorme', 'Corre'],
        correta: 'Dorme'
    },
    {
        imagem: null,
        pergunta: 'Qual é o nosso país?',
        opcoes: ['Argentina', 'Portugal', 'Brasil'],
        correta: 'Brasil'
    }
];

function embaralhar(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function abrirDB() {
    return new Promise((resolve) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onsuccess = (e) => { db = e.target.result; resolve(); };
        req.onerror = () => resolve();
        req.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('fotos')) {
                d.createObjectStore('fotos', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function listarFotos() {
    if (!db) return Promise.resolve([]);
    return new Promise((resolve) => {
        const tx = db.transaction('fotos', 'readonly');
        const req = tx.objectStore('fotos').getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
    });
}

async function prepararPerguntas() {
    await abrirDB();
    const fotos = await listarFotos();

    if (fotos.length >= 3) {
        // Usa fotos reais do álbum
        const selecionadas = embaralhar(fotos).slice(0, Math.min(fotos.length, 6));
        perguntas = selecionadas.map(foto => {
            const outras = fotos.filter(f => f.id !== foto.id);
            const distratores = embaralhar(outras)
                .slice(0, 2)
                .map(f => f.legenda || 'Alguém da família');
            const opcoes = embaralhar([foto.legenda || 'Esta pessoa', ...distratores]);
            return {
                imagem: foto.src,
                pergunta: 'Quem é essa pessoa?',
                opcoes,
                correta: foto.legenda || 'Esta pessoa'
            };
        });
    } else {
        // Fallback: perguntas gerais
        perguntas = embaralhar(PERGUNTAS_PADRAO);
    }
}

function atualizarProgresso() {
    const wrap = document.getElementById('progresso-wrap');
    const fill = document.getElementById('prog-fill');
    const texto = document.getElementById('prog-texto');
    if (!wrap || !fill || !texto) return;

    wrap.style.display = 'flex';
    const pct = perguntas.length > 0 ? Math.round((indiceAtual / perguntas.length) * 100) : 0;
    fill.style.width = pct + '%';
    texto.textContent = `${indiceAtual} / ${perguntas.length}`;
}

function mostrarPergunta(idx) {
    const area = document.getElementById('atividade-area');
    if (!area || idx >= perguntas.length) {
        mostrarFim();
        return;
    }

    const q = perguntas[idx];
    atualizarProgresso();

    area.innerHTML = `
        <div class="atividade-card">
            <p class="atividade-pergunta">${q.pergunta}</p>
            ${q.imagem
                ? `<img src="${q.imagem}" alt="Foto" class="atividade-foto">`
                : `<div style="font-size:80px; margin:0 auto 28px; text-align:center;">🤔</div>`
            }
            <div class="atividade-opcoes" id="opcoes-${idx}">
                ${q.opcoes.map(op => `
                    <button class="atividade-opcao" onclick="responder(this, '${escapar(op)}', '${escapar(q.correta)}')">
                        ${op}
                    </button>
                `).join('')}
            </div>
            <div class="atividade-feedback" id="feedback-${idx}"></div>
            <button class="btn-pular" onclick="pular()">Pular esta →</button>
        </div>
    `;
}

function escapar(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function responder(btn, resposta, correta) {
    // Desabilita todos os botões
    const container = btn.closest('.atividade-opcoes');
    container.querySelectorAll('.atividade-opcao').forEach(b => {
        b.disabled = true;
        if (b.textContent.trim() === correta) b.classList.add('correta');
    });

    const acertou = resposta === correta;
    if (!acertou) btn.classList.add('errada');

    const feedback = container.nextElementSibling;
    if (feedback) {
        feedback.className = 'atividade-feedback ' + (acertou ? 'acerto' : 'erro');
        feedback.textContent = acertou
            ? '🌟 Isso mesmo!'
            : `💛 É ${correta}. Tudo bem!`;
    }

    // Próxima pergunta após 2 segundos
    setTimeout(() => {
        indiceAtual++;
        mostrarPergunta(indiceAtual);
    }, 2000);
}

function pular() {
    indiceAtual++;
    mostrarPergunta(indiceAtual);
}

function mostrarFim() {
    document.getElementById('atividade-area').innerHTML = '';
    document.getElementById('fim-area').style.display = 'block';
    document.getElementById('progresso-wrap').style.display = 'none';
}

async function iniciarAtividade() {
    document.getElementById('inicio-area').style.display = 'none';
    document.getElementById('fim-area').style.display = 'none';
    indiceAtual = 0;
    await prepararPerguntas();
    mostrarPergunta(0);
}

function reiniciarAtividade() {
    document.getElementById('fim-area').style.display = 'none';
    indiceAtual = 0;
    perguntas = embaralhar(perguntas);
    mostrarPergunta(0);
}
