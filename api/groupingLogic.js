function calculateSimilarity(urls1, urls2) {
    if (!urls1 || !urls2 || urls1.length === 0 || urls2.length === 0) {
        return 0;
    }
    
    // Normalizar URLs mas manter a URL completa
    const set1 = new Set(urls1.map(url => normalizeUrl(url)));
    const set2 = new Set(urls2.map(url => normalizeUrl(url)));
    
    // Contar quantas URLs são exatamente iguais
    const intersection = new Set([...set1].filter(url => set2.has(url)));
    
    // Calcular similaridade baseado no menor conjunto
    const minSize = Math.min(set1.size, set2.size);
    if (minSize === 0) return 0;
    
    return (intersection.size / minSize) * 100;
}

function normalizeUrl(url) {
    try {
        // Remover protocolo e www para comparação, mas manter o path completo
        let normalized = url.toLowerCase()
            .replace(/^https?:\/\//, '')  // Remove http:// ou https://
            .replace(/^www\./, '')         // Remove www.
            .replace(/\/$/, '')            // Remove trailing slash
            .replace(/\#.*$/, '')          // Remove fragmentos (#)
            .replace(/\?.*$/, '');         // Remove query parameters (?)
        
        return normalized;
    } catch {
        return url.toLowerCase().replace(/\/$/, '');
    }
}

function groupSimilarKeywords(keywordsWithSerps, threshold = 80) {
    const groups = [];
    const processed = new Set();
    
    console.log(`\n📊 Iniciando agrupamento com threshold de ${threshold}%`);
    console.log(`Total de palavras-chave para agrupar: ${keywordsWithSerps.length}`);
    
    for (let i = 0; i < keywordsWithSerps.length; i++) {
        if (processed.has(i)) continue;
        
        const currentGroup = [{
            ...keywordsWithSerps[i],
            similarity: 100 // A palavra principal tem 100% de similaridade consigo mesma
        }];
        processed.add(i);
        
        console.log(`\n🔍 Analisando: "${keywordsWithSerps[i].keyword}"`);
        
        for (let j = i + 1; j < keywordsWithSerps.length; j++) {
            if (processed.has(j)) continue;
            
            const similarity = calculateSimilarity(
                keywordsWithSerps[i].serps,
                keywordsWithSerps[j].serps
            );
            
            console.log(`  → Comparando com "${keywordsWithSerps[j].keyword}": ${similarity.toFixed(1)}%`);
            
            if (similarity >= threshold) {
                console.log(`    ✓ Agrupando! (${similarity.toFixed(1)}% >= ${threshold}%)`);
                currentGroup.push({
                    ...keywordsWithSerps[j],
                    similarity: Math.round(similarity) // Armazenar a similaridade
                });
                processed.add(j);
            }
        }
        
        currentGroup.sort((a, b) => {
            const volumeA = parseInt(a.volume) || 0;
            const volumeB = parseInt(b.volume) || 0;
            return volumeB - volumeA;
        });
        
        groups.push(currentGroup);
        console.log(`  Grupo formado com ${currentGroup.length} palavra(s)-chave`);
    }
    
    console.log(`\n✅ Agrupamento concluído: ${groups.length} grupos formados`);
    return groups;
}

module.exports = {
    calculateSimilarity,
    groupSimilarKeywords
};