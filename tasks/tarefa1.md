
# Tarefa 1: Configuração do Ambiente e Estrutura do Projeto

**Objetivo:** Preparar a base do projeto, inicializando o Node.js, instalando as dependências essenciais e criando a estrutura de diretórios e arquivos iniciais.

---

### Descrição Técnica

Esta tarefa é o alicerce do projeto. Precisamos de um ambiente Node.js configurado com `npm` ou `yarn`. Vamos instalar o `Express` para o servidor, `multer` para o upload de arquivos, `dotenv` para gerenciar variáveis de ambiente (como chaves de API) e `tailwindcss` para a estilização.

A estrutura de arquivos deve ser lógica, separando o código do servidor, os arquivos públicos (frontend) e as configurações.

### Passos de Execução

1.  **Inicializar o Projeto Node.js:**
    *   Abra o terminal na raiz do projeto.
    *   Execute `npm init -y` para criar o arquivo `package.json`.

2.  **Instalar Dependências de Produção:**
    *   Execute `npm install express multer dotenv csv-parser`.
    *   `express`: Framework do servidor.
    *   `multer`: Middleware para manipulação de `multipart/form-data`, usado para uploads.
    *   `dotenv`: Para carregar variáveis de ambiente de um arquivo `.env`.
    *   `csv-parser`: Para processar o arquivo CSV enviado.

3.  **Instalar Dependências de Desenvolvimento:**
    *   Execute `npm install -D tailwindcss nodemon`.
    *   `tailwindcss`: Para a compilação do CSS.
    *   `nodemon`: Para reiniciar o servidor automaticamente durante o desenvolvimento.

4.  **Criar Estrutura de Diretórios:**
    *   Crie uma pasta `public` na raiz do projeto. É aqui que ficarão nossos arquivos de frontend (`index.html`, `style.css`, `script.js`).
    *   Crie uma pasta `uploads` na raiz. Ela será usada temporariamente para armazenar os arquivos enviados.

5.  **Criar Arquivos Iniciais:**
    *   Na raiz, crie `server.js`.
    *   Na raiz, crie `.gitignore` e adicione `node_modules/`, `uploads/` e `.env` a ele.
    *   Na raiz, crie `.env.example` com as chaves que usaremos (ex: `RAPIDAPI_KEY=SUA_CHAVE_AQUI`).
    *   Na pasta `public`, crie `index.html`, `script.js` e `input.css`.

6.  **Configurar Tailwind CSS:**
    *   Execute `npx tailwindcss init` para criar o arquivo `tailwind.config.js`.
    *   Configure o `tailwind.config.js` para escanear os arquivos HTML e JS em busca de classes:
        ```javascript
        module.exports = {
          content: ["./public/**/*.{html,js}"],
          theme: {
            extend: {},
          },
          plugins: [],
        }
        ```

7.  **Configurar Scripts no `package.json`:**
    *   Adicione os seguintes scripts ao seu `package.json`:
        ```json
        "scripts": {
          "start": "node server.js",
          "dev": "nodemon server.js",
          "tailwind": "npx tailwindcss -i ./public/input.css -o ./public/style.css --watch"
        }
        ```

### Critérios de Aceitação

*   O `package.json` está criado e contém todas as dependências listadas.
*   A estrutura de pastas (`public`, `uploads`) está criada.
*   Os arquivos iniciais (`server.js`, `.gitignore`, `.env.example`, `public/index.html`, `public/script.js`, `public/input.css`) existem.
*   O `tailwind.config.js` está configurado para o projeto.
*   Os scripts `start`, `dev` e `tailwind` estão funcionais no `package.json`.
