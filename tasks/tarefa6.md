
# Tarefa 6: Finalização e Exportação para CSV

**Objetivo:** Implementar a funcionalidade de exportação dos resultados para um arquivo CSV e realizar os ajustes finais na aplicação.

---

### Descrição Técnica

Com a análise concluída, o usuário precisa de uma forma de exportar os dados para uso externo. Criaremos um novo endpoint no backend que gera um arquivo CSV a partir dos dados agrupados. O frontend terá um botão que chama esse endpoint.

### Passos de Execução

1.  **Criar o Endpoint de Exportação (`/api/exportar`):**
    *   No `server.js`, crie uma rota `POST` para `/api/exportar`.
    *   Esta rota esperará receber no corpo da requisição (`req.body`) os dados dos grupos de keywords já processados.
    *   **Nota:** Precisaremos de `app.use(express.json());` no início do `server.js` para que o Express possa parsear o corpo da requisição JSON.

2.  **Gerar o Conteúdo CSV:**
    *   Dentro do endpoint, transforme os dados dos grupos em uma string no formato CSV.
    *   O CSV deve ter duas colunas: `Keyword Principal` e `Variações Canibalizadas`.
    *   Para cada grupo, a primeira palavra-chave (a de maior volume) vai para a primeira coluna. As demais palavras-chave do grupo são unidas por vírgula e vão para a segunda coluna.
        ```csv
        Keyword Principal,Variações Canibalizadas
        "melhores marcas de whey","whey protein melhores marcas,qual a melhor marca de whey"
        "como ganhar massa muscular","dicas para hipertrofia"
        ```

3.  **Enviar o Arquivo CSV como Resposta:**
    *   Defina os cabeçalhos da resposta para indicar que um arquivo está sendo enviado:
        ```javascript
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="keywords_agrupadas.csv"');
        ```
    *   Envie a string CSV como corpo da resposta com status 200: `res.status(200).send(csvContent);`

4.  **Lógica no Frontend para Exportação:**
    *   No `script.js`, adicione um botão "Exportar para CSV" no `index.html`, que ficará desabilitado (`disabled`) por padrão.
    *   Após uma análise bem-sucedida, armazene os dados dos grupos em uma variável global e habilite o botão de exportação.
    *   Adicione um `event listener` ao botão.
    *   Quando clicado, ele fará uma requisição `POST` para `/api/exportar`, enviando os dados dos grupos no corpo da requisição em formato JSON.

5.  **Acionar o Download no Navegador:**
    *   A resposta do `fetch` será o conteúdo do arquivo CSV.
    *   Use `response.blob()` para obter os dados como um Blob.
    *   Crie uma URL de objeto (`URL.createObjectURL(blob)`) e a use para criar um link (`<a>`) temporário no DOM.
    *   Defina o atributo `download` do link e clique nele programaticamente para iniciar o download do arquivo no navegador do usuário.
    *   Lembre-se de remover o link temporário após o clique.

### Critérios de Aceitação

*   O botão "Exportar para CSV" é habilitado apenas após uma análise bem-sucedida.
*   Clicar no botão envia os dados dos grupos para o endpoint `/api/exportar`.
*   O backend gera corretamente o conteúdo do CSV com as colunas "Keyword Principal" e "Variações Canibalizadas".
*   O frontend inicia o download do arquivo `keywords_agrupadas.csv` no navegador do usuário.
*   O arquivo CSV gerado está formatado corretamente e pode ser aberto em planilhas.
