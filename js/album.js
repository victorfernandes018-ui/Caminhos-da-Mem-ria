/* ===================================================
   CAMINHOS DA MEMÓRIA — Álbum de Memórias
   Fotos armazenadas em IndexedDB (suporta imagens grandes)
   ================================================== */

const DB_NAME = 'caminhos_album';
const DB_VERSION = 1;
let db = null;
let fotoParaSalvar = null;
let fotoAtualIdx = null;
let categoriaAtual = 'Todas';
let modoEdicao = false;

function abrirDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const d = e.target.result;
            if (!d.objectStoreNames.contains('fotos')) {
                d.createObjectStore('fotos', { keyPath: 'id', autoIncrement: true });
            }
        };
        req.onsuccess = (e) => { db = e.target.result; resolve(db); };
        req.onerror = () => reject(req.error);
    });
}

function listarFotos() {
    return new Promise((resolve) => {
        const tx = db.transaction('fotos', 'readonly');
        const store = tx.objectStore('fotos');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
    });
}

function adicionarFoto(foto) {
    return new Promise((resolve) => {
        const tx = db.transaction('fotos', 'readwrite');
        tx.objectStore('fotos').add(foto);
        tx.oncomplete = resolve;
    });
}

function removerFoto(id) {
    return new Promise((resolve) => {
        const tx = db.transaction('fotos', 'readwrite');
        tx.objectStore('fotos').delete(id);
        tx.oncomplete = resolve;
    });
}

async function renderizarAlbum() {
    const grid = document.getElementById('album-grid');
    if (!grid) return;

    const fotos = await listarFotos();
    const filtradas = categoriaAtual === 'Todas'
        ? fotos
        : fotos.filter(f => f.categoria === categoriaAtual);

    if (filtradas.length === 0) {
        grid.innerHTML = `
            <div class="album-vazio" style="grid-column:1/-1">
                <div class="album-vazio-icone">📷</div>
                <p>${categoriaAtual === 'Todas' ? 'Nenhuma foto ainda.' : 'Nenhuma foto nesta categoria.'}</p>
                ${modoEdicao ? '<p style="font-size:14px; margin-top:8px;">Use o botão abaixo para adicionar fotos.</p>' : ''}
            </div>`;
        return;
    }

    grid.innerHTML = filtradas.map((f, idx) => `
        <div class="album-foto-card" onclick="abrirLightbox(${f.id}, '${encodeURIComponent(f.legenda || '')}')">
            <img src="${f.src}" alt="${f.legenda || 'Foto'}" loading="lazy">
            <div class="album-foto-legenda">
                ${f.legenda || ''}
                ${f.ano ? `<div class="album-foto-ano">${f.ano}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function filtrarCategoria(btn) {
    document.querySelectorAll('.album-cat-btn').forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    categoriaAtual = btn.dataset.cat;
    renderizarAlbum();
}

function abrirLightbox(id, legendaEncoded) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const leg = document.getElementById('lightbox-legenda');
    const btnRemover = document.getElementById('btn-remover-foto');

    fotoAtualIdx = id;

    listarFotos().then(fotos => {
        const foto = fotos.find(f => f.id === id);
        if (!foto) return;
        img.src = foto.src;
        img.alt = foto.legenda || 'Foto';
        leg.textContent = [foto.legenda, foto.ano].filter(Boolean).join(' — ');
        if (btnRemover) btnRemover.style.display = modoEdicao ? 'block' : 'none';
        lightbox.classList.add('aberto');
    });
}

function fecharLightbox() {
    document.getElementById('lightbox').classList.remove('aberto');
    fotoAtualIdx = null;
}

async function removerFotoAtual() {
    if (fotoAtualIdx === null) return;
    if (!confirm('Remover esta foto?')) return;
    await removerFoto(fotoAtualIdx);
    fecharLightbox();
    renderizarAlbum();
}

function handleUpload(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        fotoParaSalvar = e.target.result;
        document.getElementById('form-foto').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function salvarFoto() {
    if (!fotoParaSalvar) return;

    const legenda = document.getElementById('foto-legenda').value.trim();
    const categoria = document.getElementById('foto-categoria').value;
    const ano = document.getElementById('foto-ano').value.trim();

    await adicionarFoto({ src: fotoParaSalvar, legenda, categoria, ano });

    fotoParaSalvar = null;
    document.getElementById('foto-legenda').value = '';
    document.getElementById('foto-ano').value = '';
    document.getElementById('form-foto').style.display = 'none';
    document.getElementById('upload-input').value = '';

    renderizarAlbum();
}

function cancelarUpload() {
    fotoParaSalvar = null;
    document.getElementById('form-foto').style.display = 'none';
    document.getElementById('upload-input').value = '';
}

function toggleModoEdicao() {
    modoEdicao = !modoEdicao;
    const area = document.getElementById('upload-area-wrap');
    const btn = document.getElementById('btn-editar-album');
    if (area) area.style.display = modoEdicao ? 'block' : 'none';
    if (btn) btn.textContent = modoEdicao ? '✓ Concluir edição' : '✏️ Adicionar/remover fotos (cuidador)';
    renderizarAlbum();
}

// Fechar lightbox com Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharLightbox();
});

abrirDB().then(renderizarAlbum);
