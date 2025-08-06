
# Tarefa 4: Lógica do Frontend e Integração com o Backend

**Objetivo:** Implementar a lógica no `script.js` para capturar os dados do formulário, enviá-los para o backend, e exibir os resultados retornados de forma dinâmica.

---

### Descrição Técnica

Esta tarefa conecta o frontend ao backend. Usaremos a API `fetch` para fazer a requisição `POST` para o nosso servidor. O JavaScript será responsável por gerenciar o estado da UI (ex: mostrar/ocultar o spinner de carregamento) e por renderizar os grupos de palavras-chave na área de resultados.

### Passos de Execução

1.  **Adicionar Event Listener ao Formulário:**
    *   No `script.js`, obtenha a referência para o formulário (`#upload-form`).
    *   Adicione um `event listener` para o evento `submit`.
    *   Dentro do listener, previna o comportamento padrão do formulário com `event.preventDefault()`.

2.  **Coletar Dados do Formulário:**
    *   Obtenha o arquivo selecionado pelo usuário a partir do input de arquivo.
    *   Verifique qual API foi selecionada no toggle (`#api-selector`).
    *   Use o `FormData` para construir o corpo da requisição, que é ideal para enviar arquivos.
        ```javascript
        const formData = new FormData();
        formData.append('keywordFile', fileInput.files[0]);
        formData.append('apiProvider', selectedApi);
        ```

3.  **Fazer a Requisição `fetch`:**
    *   Mostre o spinner de carregamento e desabilite o botão de submit para evitar envios duplicados.
    *   Faça uma chamada `fetch` para o endpoint `POST /api/agrupar`.
    *   Passe o `formData` no `body` da requisição.
    *   Use `try...catch` para lidar com possíveis erros de rede.
    *   Após a resposta, oculte o spinner e reabilite o botão.

4.  **Processar a Resposta e Renderizar os Resultados:**
    *   Verifique se a resposta foi bem-sucedida (`response.ok`).
    *   Converta a resposta para JSON: `const data = await response.json();`.
    *   Limpe a área de resultados (`#results-area`).
    *   Crie uma função `renderResults(groups)` que itera sobre os grupos de palavras-chave recebidos.
    *   Para cada grupo, crie um elemento HTML (ex: um `div` com estilo de card) e popule-o com as palavras-chave do grupo.
    *   **Destaque a Keyword Principal:** Dentro de cada card, a palavra-chave com o maior volume de busca deve ter um destaque visual (ex: cor diferente, um ícone de "estrela" ou um selo "Principal").
    *   Adicione os cards gerados à `#results-area`.

5.  **Tratamento de Erros:**
    *   Se a requisição `fetch` falhar ou o servidor retornar um erro, exiba uma mensagem amigável para o usuário na área de resultados.

### Critérios de Aceitação

*   Clicar no botão "Analisar" envia corretamente o arquivo e a API selecionada para o backend.
*   Um indicador de carregamento é exibido durante o processamento da requisição.
*   Os resultados (grupos de keywords) retornados pelo backend são exibidos corretamente na área de resultados.
*   A palavra-chave com maior volume em cada grupo é visualmente destacada.
*   Erros de comunicação com o servidor são tratados e exibidos de forma clara para o usuário.
