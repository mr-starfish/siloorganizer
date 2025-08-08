const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const { fetchSerpResults } = require('./api/searchClient');
const { groupSimilarKeywords } = require('./api/groupingLogic');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/agrupar', upload.single('keywordFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado' });
  }

  const socketId = req.body.socketId; // Receber socketId do cliente
  
  const results = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', async () => {
      fs.unlinkSync(req.file.path);
      
      try {
        console.log(`\n🚀 Iniciando processamento de ${results.length} palavras-chave com Google API`);
        console.log('━'.repeat(50));
        
        // Calcular tempo estimado (1s por requisição)
        const estimatedTime = Math.ceil(results.length / 60);
        
        // Enviar atualização inicial
        if (socketId) {
          io.to(socketId).emit('progress', {
            message: `Iniciando análise de ${results.length} palavras-chave... (Tempo estimado: ~${estimatedTime} minuto${estimatedTime > 1 ? 's' : ''})`,
            progress: 0,
            total: results.length,
            current: 0
          });
        }
        
        // Processar sequencialmente para evitar rate limiting
        const keywordsWithSerps = [];
        
        for (let i = 0; i < results.length; i++) {
          const keyword = results[i];
          const keywordText = keyword['Palavra-Chave'] || keyword.keyword || Object.values(keyword)[0];
          const volume = keyword['Volume'] || keyword.volume || '0';
          
          // Enviar atualização antes de buscar
          if (socketId) {
            io.to(socketId).emit('progress', {
              message: `[${i + 1}/${results.length}] Analisando: "${keywordText}"`,
              progress: Math.round((i / results.length) * 100),
              total: results.length,
              current: i + 1
            });
          }
          
          const serps = await fetchSerpResults(keywordText, 'google', i + 1, results.length);
          
          keywordsWithSerps.push({
            keyword: keywordText,
            volume: volume,
            serps: serps
          });
          
          // Mostrar progresso
          const progress = Math.round(((i + 1) / results.length) * 100);
          console.log(`📊 Progresso: ${progress}% (${i + 1}/${results.length})`);
          
          // Enviar atualização após buscar
          if (socketId) {
            io.to(socketId).emit('progress', {
              message: `✓ Concluído: "${keywordText}"`,
              progress: progress,
              total: results.length,
              current: i + 1
            });
          }
        }
        
        console.log('━'.repeat(50));
        console.log('✅ Processamento concluído!');
        
        // Enviar atualização de agrupamento
        if (socketId) {
          io.to(socketId).emit('progress', {
            message: 'Agrupando palavras-chave similares...',
            progress: 100
          });
        }
        
        const groups = groupSimilarKeywords(keywordsWithSerps);
        
        const formattedGroups = groups.map((group, index) => ({
          groupId: index + 1,
          keywords: group.map(item => ({
            'Palavra-Chave': item.keyword,
            'Volume': item.volume,
            'SERPs': item.serps || [],
            'Similaridade': item.similarity || 100
          }))
        }));
        
        res.json({ 
          message: 'Arquivo processado com sucesso!',
          keywordCount: results.length,
          groups: formattedGroups,
          keywords: formattedGroups.flatMap(g => g.keywords)
        });
      } catch (error) {
        console.error('Erro ao processar palavras-chave:', error);
        res.status(500).json({ error: 'Erro ao processar as palavras-chave' });
      }
    })
    .on('error', (err) => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Erro ao processar o arquivo CSV' });
    });
});

app.post('/api/exportar', (req, res) => {
  const { groups } = req.body;
  
  if (!groups || !Array.isArray(groups)) {
    return res.status(400).json({ error: 'Dados inválidos para exportação' });
  }
  
  let csvContent = 'Keyword Principal,Variações Canibalizadas\n';
  
  groups.forEach(group => {
    const keywords = group.keywords || [];
    if (keywords.length > 0) {
      const principal = keywords[0]['Palavra-Chave'] || '';
      const variacoes = keywords.slice(1).map(k => k['Palavra-Chave']).join(',');
      
      const principalEscaped = principal.includes(',') ? `"${principal}"` : principal;
      const variacoesEscaped = variacoes.includes(',') ? `"${variacoes}"` : variacoes;
      
      csvContent += `${principalEscaped},${variacoesEscaped}\n`;
    }
  });
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="keywords_agrupadas.csv"');
  res.status(200).send('\ufeff' + csvContent);
});

// Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});