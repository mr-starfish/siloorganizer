
# Tarefa 5: Lógica de Agrupamento e Integração com APIs Externas

**Objetivo:** Implementar a lógica principal da aplicação no backend: buscar os resultados de SERP para cada palavra-chave, comparar os resultados e agrupar as palavras-chave similares.

---

### Descrição Técnica

Esta é a tarefa mais complexa. Precisamos de uma função que orquestre as chamadas para as APIs externas (Google e RapidAPI). Para evitar bloquear a resposta, as chamadas de API para cada palavra-chave devem ser feitas de forma assíncrona e, se possível, em paralelo.

### Passos de Execução

1.  **Criar um Módulo de API:**
    *   Crie um novo arquivo, por exemplo, `api/searchClient.js`.
    *   Este módulo exportará uma função, `fetchSerpResults(keyword, apiProvider)`.
    *   Dentro desta função, use uma estrutura `if/else` ou `switch` baseada no `apiProvider` para decidir qual API chamar.

2.  **Implementar a Chamada para a API do Google (Gratuita):**
    *   Use a ferramenta `google_web_search` (ou uma biblioteca Node.js equivalente como `google-it`) para buscar a palavra-chave.
    *   A função deve retornar uma lista dos 10 primeiros URLs.
    *   Implemente um tratamento de erro robusto e talvez um mecanismo de nova tentativa (`retry`) simples para lidar com a instabilidade da rede.

3.  **Implementar a Chamada para a API da RapidAPI (Paga):**
    *   Use uma biblioteca como `axios` ou `node-fetch` para fazer a requisição para o endpoint da RapidAPI que você escolher.
    *   Recupere a chave da API do `.env`: `process.env.RAPIDAPI_KEY`.
    *   Configure os cabeçalhos necessários (`X-RapidAPI-Key`, `X-RapidAPI-Host`).
    *   Mapeie a resposta da API para o mesmo formato da API do Google (uma lista de 10 URLs) para manter a consistência.

4.  **Orquestrar as Chamadas de API no `server.js`:**
    *   Após processar o CSV no endpoint `/api/agrupar`, você terá uma lista de palavras-chave.
    *   Use `Promise.all` ou `Promise.allSettled` para disparar as chamadas de API para todas as palavras-chave em paralelo. Isso é crucial para o desempenho.
        ```javascript
        const searchPromises = keywords.map(kw => searchClient.fetchSerpResults(kw['Palavra-Chave'], apiProvider));
        const serpResults = await Promise.all(searchPromises);
        ```
    *   Associe cada resultado de SERP à sua palavra-chave original.

5.  **Implementar a Lógica de Agrupamento:**
    *   Crie uma função `groupSimilarKeywords(keywordsWithSerps)`.
    *   Itere sobre cada palavra-chave e compare-a com todas as outras que ainda não foram agrupadas.
    *   **Função de Comparação:** Crie uma função auxiliar `calculateSimilarity(urls1, urls2)` que recebe dois arrays de URLs e retorna a porcentagem de sobreposição.
    *   **Critério de Agrupamento:** Se a similaridade for de 80% ou mais, agrupe as palavras-chave.
    *   O resultado final deve ser um array de grupos (ex: `[[kw1, kw2], [kw3], [kw4, kw5, kw6]]`).

6.  **Integrar com o Endpoint:**
    *   Chame a função de agrupamento e envie o resultado final (os grupos) como resposta JSON para o frontend.

### Critérios de Aceitação

*   O módulo `searchClient.js` consegue buscar resultados de SERP tanto da API do Google quanto da RapidAPI.
*   As chaves de API são carregadas de forma segura a partir do arquivo `.env`.
*   A lógica de agrupamento identifica corretamente as palavras-chave com 80% ou mais de sobreposição de SERP.
*   O endpoint `/api/agrupar` retorna a estrutura de dados final com os grupos de palavras-chave.
*   O processo é razoavelmente performático, utilizando chamadas de API em paralelo.
