const { google } = require('googleapis');
require('dotenv').config();

async function testGoogleSearch() {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    
    console.log('Testando Google Custom Search API...');
    console.log('CSE ID:', cseId);
    console.log('');
    
    try {
        const customsearch = google.customsearch('v1');
        
        const response = await customsearch.cse.list({
            key: apiKey,
            cx: cseId,
            q: 'melhor whey protein',
            num: 3,
            gl: 'br',
            hl: 'pt-BR',
            lr: 'lang_pt'
        });
        
        console.log('✅ Conexão bem-sucedida!');
        console.log('');
        console.log('Resultados encontrados para "melhor whey protein":');
        console.log('━'.repeat(50));
        
        const items = response.data.items || [];
        items.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title}`);
            console.log(`   URL: ${item.link}`);
            console.log(`   ${item.snippet}`);
            console.log('');
        });
        
        console.log(`Total de resultados: ${items.length}`);
        
    } catch (error) {
        console.error('❌ Erro ao conectar:', error.message);
        if (error.response) {
            console.error('Detalhes:', error.response.data);
        }
    }
}

testGoogleSearch();