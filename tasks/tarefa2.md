
# Tarefa 2: Desenvolvimento do Servidor Backend (Express)

**Objetivo:** Criar o servidor web básico com Express, configurar os middlewares necessários e criar o endpoint para o upload do arquivo de palavras-chave.

---

### Descrição Técnica

Nesta fase, vamos construir o coração da aplicação. O `server.js` será responsável por servir os arquivos estáticos do frontend, receber o arquivo CSV, processá-lo com o `multer` e o `csv-parser`, e preparar os dados para a próxima etapa de análise.

### Passos de Execução

1.  **Configurar o Servidor Express Básico:**
    *   No `server.js`, importe as dependências: `express`, `path`, `multer`, `fs` (File System), e `csv-parser`.
    *   Inicialize o Express: `const app = express();`.
    *   Defina a porta: `const PORT = process.env.PORT || 3000;`.
    *   Configure o Express para servir arquivos estáticos da pasta `public`:
        ```javascript
        app.use(express.static(path.join(__dirname, 'public')));
        ```

2.  **Configurar o Multer para Upload:**
    *   Crie uma instância do `multer` para gerenciar o armazenamento dos arquivos. Os arquivos devem ser salvos na pasta `uploads/`.
        ```javascript
        const upload = multer({ dest: 'uploads/' });
        ```

3.  **Criar o Endpoint de Análise (`/api/agrupar`):**
    *   Crie uma rota `POST` para `/api/agrupar`.
    *   Use o middleware do `multer` para aceitar um único arquivo com o nome de campo `keywordFile`:
        ```javascript
        app.post('/api/agrupar', upload.single('keywordFile'), (req, res) => {
          // Lógica de processamento aqui
        });
        ```

4.  **Processar o Arquivo CSV:**
    *   Dentro do endpoint, verifique se `req.file` existe. Se não, retorne um erro 400.
    *   Use o `fs.createReadStream` para ler o arquivo enviado (`req.file.path`).
    *   Faça o `pipe` do stream para o `csv-parser` para converter as linhas do CSV em objetos JavaScript.
    *   Armazene os resultados em um array. Cada item do array deve ser um objeto (ex: `{ 'Palavra-Chave': 'melhor whey', 'Volume': '12000' }`).
    *   Após o processamento, lembre-se de deletar o arquivo da pasta `uploads/` usando `fs.unlinkSync(req.file.path)` para manter o sistema limpo.

5.  **Estruturar a Resposta:**
    *   Por enquanto, após ler e processar o arquivo, envie uma resposta de sucesso (status 200) com os dados extraídos em formato JSON. Isso permitirá que o frontend seja desenvolvido em paralelo.
        ```javascript
        // Exemplo de resposta
        res.json({ 
          message: 'Arquivo processado com sucesso!',
          keywordCount: results.length,
          keywords: results 
        });
        ```

6.  **Iniciar o Servidor:**
    *   Adicione o código para iniciar o servidor no final do `server.js`:
        ```javascript
        app.listen(PORT, () => {
          console.log(`Servidor rodando na porta ${PORT}`);
        });
        ```

### Critérios de Aceitação

*   O servidor Express inicia sem erros ao executar `npm run dev`.
*   Acessar `http://localhost:3000` no navegador serve o `index.html`.
*   Enviar um arquivo CSV para o endpoint `POST /api/agrupar` resulta em uma resposta JSON contendo os dados do arquivo.
*   O arquivo enviado é corretamente salvo na pasta `uploads/` durante o processamento e removido após a conclusão.
*   O servidor lida corretamente com casos onde nenhum arquivo é enviado.
