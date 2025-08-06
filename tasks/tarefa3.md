
# Tarefa 3: Desenvolvimento da Interface de Frontend (HTML + Tailwind CSS)

**Objetivo:** Criar a interface do usuário (UI) com HTML e Tailwind CSS, permitindo que o usuário selecione a API, envie um arquivo e veja os resultados.

---

### Descrição Técnica

Vamos construir uma interface limpa e funcional no arquivo `public/index.html`. A estilização será feita utilizando as classes de utilitário do Tailwind CSS. O foco é na usabilidade: o usuário deve entender imediatamente como usar a ferramenta.

### Passos de Execução

1.  **Estrutura Básica do HTML:**
    *   No `public/index.html`, crie a estrutura HTML5 padrão.
    *   Link o arquivo de CSS gerado pelo Tailwind: `<link rel="stylesheet" href="/style.css">`.
    *   Link o arquivo de script no final do `<body>`: `<script src="/script.js"></script>`.

2.  **Criar o Cabeçalho e Título:**
    *   Use classes do Tailwind (`bg-gray-800`, `text-white`, `p-4`, `text-2xl`, `font-bold`) para criar um cabeçalho para a aplicação com o título "Analisador de Canibalização de Keywords".

3.  **Criar a Seção de Controles:**
    *   Crie um container principal (`max-w-4xl`, `mx-auto`, `p-8`).
    *   **Formulário de Upload:**
        *   Crie um `<form id="upload-form">`.
        *   Adicione um `<input type="file" id="keyword-file" name="keywordFile" accept=".csv,.txt">`. Estilize-o para ser visualmente atraente.
        *   Adicione um botão de submit (`<button type="submit">Analisar</button>`). Estilize-o com classes do Tailwind (`bg-blue-500`, `hover:bg-blue-700`, `text-white`, `font-bold`, `py-2`, `px-4`, `rounded`).
    *   **Toggle de Seleção de API:**
        *   Crie um switch/toggle para o usuário escolher entre "API Gratuita (Google)" e "API Paga (RapidAPI)".
        *   Você pode implementar isso com um checkbox estilizado ou dois botões de rádio.
        *   Adicione um `id="api-selector"` para que o JavaScript possa ler a escolha do usuário.

4.  **Criar a Área de Resultados:**
    *   Abaixo dos controles, crie uma `div` com `id="results-area"`.
    *   Inicialmente, esta área pode conter uma mensagem como "Os resultados aparecerão aqui."
    *   Vamos também preparar um estado de "carregamento" (loading spinner) que será exibido enquanto o backend processa os dados. Ele pode ser uma `div` separada, inicialmente oculta (`hidden`).

5.  **Estilização e Layout:**
    *   Use Flexbox ou Grid do Tailwind para organizar os elementos na página.
    *   Garanta que a interface seja responsiva e funcione bem em telas de diferentes tamanhos.
    *   Adicione um feedback visual para o estado de hover e focus nos elementos interativos (botões, inputs).

### Critérios de Aceitação

*   A página `index.html` renderiza corretamente no navegador.
*   Todos os elementos da UI (título, formulário de upload, seletor de API, área de resultados) estão presentes e estilizados com Tailwind CSS.
*   A página é visualmente agradável e responsiva.
*   O seletor de API permite que o usuário alterne entre as duas opções.
*   A área de resultados está pronta para receber o conteúdo dinâmico do JavaScript.
*   O script `tailwind` (`npm run tailwind`) compila o `input.css` para `style.css` sem erros.
