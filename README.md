# Caminhos da Memória

Site institucional de apoio para pessoas com Alzheimer e suas famílias cuidadoras.

## Como abrir o site

1. Abra a pasta `SITE IDOSO` no Visual Studio Code (Arquivo → Abrir Pasta)
2. Clique duas vezes em `index.html` para abrir no navegador
3. Ou, no VS Code, instale a extensão **Live Server** e clique com botão direito em `index.html` → "Open with Live Server"

## Estrutura do projeto

```
SITE IDOSO/
├── index.html              # Página inicial
├── css/
│   ├── style.css           # Estilo principal e variáveis de design
│   └── pages.css           # Estilo das páginas internas
├── js/
│   ├── main.js             # Acessibilidade e menu
│   └── cuidador.js         # Lembrete de medicação e diário de sintomas
├── pages/
│   ├── sobre-alzheimer.html  # Informação sobre a doença
│   ├── cuidador.html         # Ferramentas para cuidadores
│   ├── atividades.html       # Sugestões de atividades
│   └── comunidade.html       # Recursos e grupos de apoio
└── README.md
```

## Identidade visual

- **Paleta:** azul-marinho profundo, dourado discreto, cinza claro e branco
- **Tipografia:** Inter (texto) + Playfair Display (títulos)
- **Linha visual:** profissional, médico, sóbrio e acolhedor

## Funcionalidades

### Acessibilidade (em todas as páginas)
- Botões para aumentar/diminuir o tamanho da fonte
- Modo de alto contraste
- Navegação por teclado totalmente funcional
- Compatível com leitores de tela
- Preferências do usuário salvas no navegador

### Página inicial
- Apresentação do projeto
- Acesso rápido às quatro seções principais
- Contatos de apoio (SAMU, CVV, ABRAz)

### Sobre Alzheimer
- O que é a doença
- Sinais e sintomas iniciais
- As três fases da doença
- Quando procurar ajuda médica
- Mitos e verdades

### Para Cuidadores
- Orientações para o dia a dia (comunicação, ambiente, rotina, alimentação)
- **Lembrete de medicação** (interativo, dados salvos no navegador)
- **Diário de sintomas** (interativo, dados salvos no navegador)
- Seção sobre o cuidado do próprio cuidador

### Atividades
- 9 sugestões de atividades cotidianas (música, fotos, jardinagem, cozinha, caminhadas, pintura, conversa, leitura, massagem)
- Princípios importantes para a realização das atividades

### Comunidade
- Lista de associações e instituições de apoio
- Depoimentos de famílias
- Espaço para fórum (em desenvolvimento)

## Privacidade

Todos os dados (medicações, diário) são salvos **apenas no navegador do
usuário** (localStorage). Nenhuma informação é enviada para a internet
ou armazenada em servidores externos.

## Próximos passos sugeridos

- Adicionar fotos profissionais para os banners
- Versão para impressão dos diários e medicações
- Implementar o fórum de comunidade (requer backend)
- Hospedar online (GitHub Pages, Netlify — gratuitos)
- Configurar domínio próprio
