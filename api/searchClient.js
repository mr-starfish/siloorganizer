const axios = require('axios');
const { google } = require('googleapis');

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchSerpResults(keyword, apiProvider = 'google', index = 0, total = 0) {
    try {
        // Adiciona delay para respeitar rate limit do Google (100 requisições por 100 segundos)
        if (index > 0) {
            console.log(`⏳ Aguardando 1 segundo antes da próxima requisição (${index}/${total})...`);
            await delay(1000);
        }
        return await fetchGoogleResults(keyword, index, total);
    } catch (error) {
        console.error(`Erro ao buscar resultados para "${keyword}":`, error.message);
        return [];
    }
}

async function fetchGoogleResults(keyword, index = 0, total = 0) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cseId = process.env.GOOGLE_CSE_ID;
    
    if (!apiKey || !cseId) {
        console.warn('GOOGLE_API_KEY ou GOOGLE_CSE_ID não configuradas, usando resultados simulados');
        return simulateGoogleResults(keyword);
    }
    
    if (index > 0 && total > 0) {
        console.log(`[${index}/${total}] Buscando no Google: "${keyword}"`);
    } else {
        console.log(`Buscando no Google: "${keyword}"`);
    }
    
    try {
        const customsearch = google.customsearch('v1');
        
        const response = await customsearch.cse.list({
            key: apiKey,
            cx: cseId,
            q: keyword,
            num: 7,           // Número de resultados
            gl: 'br',         // País: Brasil
            hl: 'pt-BR',      // Idioma: Português Brasil
            lr: 'lang_pt',    // Restringir a páginas em português
            googlehost: 'google.com.br'  // Host do Google Brasil
        });
        
        const items = response.data.items || [];
        const urls = items.map(item => item.link).filter(url => url);
        
        console.log(`✓ Encontrados ${urls.length} resultados no Google para "${keyword}"`);
        
        return urls.slice(0, 7);
    } catch (error) {
        // Retry automático para qualquer erro
        console.error(`⚠️ Erro ao buscar no Google "${keyword}": ${error.message}. Tentando novamente em 1 segundo...`);
        await delay(1000);
        
        try {
            const customsearch = google.customsearch('v1');
            const retryResponse = await customsearch.cse.list({
                key: apiKey,
                cx: cseId,
                q: keyword,
                num: 7,
                gl: 'br',
                hl: 'pt-BR',
                lr: 'lang_pt',
                googlehost: 'google.com.br'
            });
            
            const retryItems = retryResponse.data.items || [];
            const retryUrls = retryItems.map(item => item.link).filter(url => url);
            console.log(`✓ Retry bem-sucedido! Encontrados ${retryUrls.length} resultados para "${keyword}"`);
            return retryUrls.slice(0, 7);
        } catch (retryError) {
            console.error(`❌ Todas as tentativas falharam para "${keyword}". Usando resultados simulados.`);
            return simulateGoogleResults(keyword);
        }
    }
}

// Função removida - não usamos mais RapidAPI

function simulateGoogleResults(keyword) {
    const baseUrls = [
        'https://www.exemplo1.com.br/',
        'https://www.exemplo2.com.br/',
        'https://www.site1.com.br/',
        'https://www.portal1.com.br/',
        'https://www.blog1.com.br/',
        'https://www.loja1.com.br/',
        'https://www.info1.com.br/'
    ];
    
    const keywords = keyword.toLowerCase().split(' ');
    const variant = keywords.join('-');
    
    return baseUrls.map((url, index) => {
        if (index < 3) {
            return url + variant;
        }
        return url + keywords[0];
    });
}

// Função removida - não usamos mais RapidAPI

module.exports = {
    fetchSerpResults
};