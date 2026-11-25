/* ===================================================
   CAMINHOS DA MEMÓRIA — JS do Modo Paciente
   Perfil do paciente, data de hoje, botão de ligar
   =================================================== */

const STORAGE_PACIENTE = 'caminhos_paciente_perfil';

function carregarPerfil() {
    try { return JSON.parse(localStorage.getItem(STORAGE_PACIENTE)) || {}; } catch { return {}; }
}

function salvarPerfil(dados) {
    localStorage.setItem(STORAGE_PACIENTE, JSON.stringify(dados));
}

// Data de hoje em português
function dataHoje() {
    return new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
    });
}

function aplicarPerfil() {
    const p = carregarPerfil();

    const dataEl = document.getElementById('data-hoje');
    if (dataEl) {
        const d = dataHoje();
        dataEl.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    }

    if (p.nome) document.getElementById('nome-paciente').textContent = p.nome;
    if (p.idade) document.getElementById('idade-paciente').textContent = p.idade + ' anos';
    if (p.endereco) document.getElementById('endereco-paciente').textContent = p.endereco;

    const cuidadorNome = p.cuidadorNome || 'o cuidador';
    const cuidadorPrimeiroNome = cuidadorNome.split(' ')[0].split('(')[0].trim();

    const exibir = document.getElementById('cuidador-nome-exibir');
    const ligar = document.getElementById('cuidador-nome-ligar');
    if (exibir) exibir.textContent = cuidadorNome;
    if (ligar) ligar.textContent = cuidadorPrimeiroNome;

    const btnLigar = document.getElementById('btn-ligar');
    if (btnLigar) {
        if (p.cuidadorTel) {
            btnLigar.href = 'tel:' + p.cuidadorTel.replace(/\D/g, '');
        } else {
            btnLigar.href = '#';
            btnLigar.onclick = (e) => { e.preventDefault(); alert('Número do cuidador não cadastrado ainda.'); };
        }
    }

    // Foto
    const fotoEl = document.getElementById('foto-paciente');
    const placeholder = document.getElementById('foto-placeholder');
    if (p.foto && fotoEl) {
        fotoEl.src = p.foto;
        fotoEl.alt = p.nome || 'Foto';
        fotoEl.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
    }
}

// Configuração
function abrirConfig() {
    const p = carregarPerfil();
    const modal = document.getElementById('modal-config');
    if (!modal) return;

    document.getElementById('cfg-nome').value = p.nome || '';
    document.getElementById('cfg-idade').value = p.idade || '';
    document.getElementById('cfg-endereco').value = p.endereco || '';
    document.getElementById('cfg-cuidador-nome').value = p.cuidadorNome || '';
    document.getElementById('cfg-cuidador-tel').value = p.cuidadorTel || '';

    modal.style.display = 'flex';
}

function fecharConfig() {
    const modal = document.getElementById('modal-config');
    if (modal) modal.style.display = 'none';
}

function salvarConfig() {
    const p = carregarPerfil();

    p.nome = document.getElementById('cfg-nome').value.trim() || p.nome;
    p.idade = document.getElementById('cfg-idade').value.trim() || p.idade;
    p.endereco = document.getElementById('cfg-endereco').value.trim() || p.endereco;
    p.cuidadorNome = document.getElementById('cfg-cuidador-nome').value.trim() || p.cuidadorNome;
    p.cuidadorTel = document.getElementById('cfg-cuidador-tel').value.trim() || p.cuidadorTel;

    const fotoInput = document.getElementById('cfg-foto');
    if (fotoInput && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            p.foto = e.target.result;
            salvarPerfil(p);
            aplicarPerfil();
            fecharConfig();
        };
        reader.readAsDataURL(fotoInput.files[0]);
        return;
    }

    salvarPerfil(p);
    aplicarPerfil();
    fecharConfig();
}

// Fecha modal ao clicar fora
document.addEventListener('DOMContentLoaded', () => {
    aplicarPerfil();

    const modal = document.getElementById('modal-config');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) fecharConfig();
        });
    }
});
