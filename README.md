# SiloOrganizer - Analisador de Canibalização de Keywords

## Descrição
Ferramenta para análise de canibalização de palavras-chave, agrupando keywords similares baseado em sobreposição de resultados de SERP.

## Instalação

1. Clone o projeto
2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` (opcional):
   - Copie `.env.example` para `.env`
   - Adicione sua chave da RapidAPI se desejar usar a API paga

## Uso

1. Inicie o servidor:
```bash
npm run dev
```

2. Em outro terminal, inicie o compilador do Tailwind CSS:
```bash
npm run tailwind
```

3. Acesse http://localhost:3000 no navegador

4. Faça upload de um arquivo CSV com palavras-chave no formato:
```csv
Palavra-Chave,Volume
exemplo palavra 1,1000
exemplo palavra 2,500
```

5. Selecione a API desejada (Google gratuita ou RapidAPI paga)

6. Clique em "Analisar" e aguarde o processamento

7. Visualize os grupos de palavras canibalizadas

8. Exporte os resultados para CSV

## Estrutura do Projeto

```
SiloOrganizer/
├── api/
│   ├── searchClient.js      # Cliente para APIs de busca
│   └── groupingLogic.js     # Lógica de agrupamento
├── public/
│   ├── index.html           # Interface HTML
│   ├── script.js            # Lógica do frontend
│   ├── input.css            # CSS fonte do Tailwind
│   └── style.css            # CSS compilado
├── uploads/                 # Arquivos temporários
├── server.js                # Servidor Express
├── package.json             # Dependências
└── .env                     # Variáveis de ambiente
```

## Scripts Disponíveis

- `npm start`: Inicia o servidor em produção
- `npm run dev`: Inicia o servidor em desenvolvimento (com nodemon)
- `npm run tailwind`: Compila CSS do Tailwind em modo watch

## Funcionalidades

- Upload de arquivo CSV com palavras-chave
- Análise de canibalização baseada em SERP
- Agrupamento automático (80% de similaridade)
- Destaque da palavra principal de cada grupo
- Exportação dos resultados para CSV
- Suporte a APIs gratuitas e pagas

## Tecnologias Utilizadas

- Node.js + Express
- HTML + Tailwind CSS
- JavaScript Vanilla
- CSV Parser
- Axios para requisições HTTP