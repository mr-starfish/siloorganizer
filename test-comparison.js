const { calculateSimilarity } = require('./api/groupingLogic');

console.log('Teste de Comparação de URLs\n');
console.log('='*50);

// Teste 1: URLs idênticas
const urls1 = [
    'https://www.example.com/page1',
    'https://www.example.com/page2',
    'https://www.site.com.br/artigo'
];

const urls2 = [
    'https://www.example.com/page1',
    'https://www.example.com/page2',
    'https://www.site.com.br/artigo'
];

console.log('\nTeste 1: URLs idênticas');
console.log('URLs Set 1:', urls1);
console.log('URLs Set 2:', urls2);
console.log('Similaridade:', calculateSimilarity(urls1, urls2) + '%');

// Teste 2: URLs completamente diferentes
const urls3 = [
    'https://www.example.com/page1',
    'https://www.example.com/page2',
    'https://www.site.com.br/artigo'
];

const urls4 = [
    'https://www.outro.com/diferente',
    'https://www.site2.com/page',
    'https://www.blog.com.br/post'
];

console.log('\nTeste 2: URLs completamente diferentes');
console.log('URLs Set 1:', urls3);
console.log('URLs Set 2:', urls4);
console.log('Similaridade:', calculateSimilarity(urls3, urls4) + '%');

// Teste 3: Mesmo domínio, páginas diferentes
const urls5 = [
    'https://www.example.com/page1',
    'https://www.example.com/page2',
    'https://www.example.com/page3'
];

const urls6 = [
    'https://www.example.com/outra-pagina',
    'https://www.example.com/diferente',
    'https://www.example.com/nova'
];

console.log('\nTeste 3: Mesmo domínio, páginas diferentes');
console.log('URLs Set 1:', urls5);
console.log('URLs Set 2:', urls6);
console.log('Similaridade:', calculateSimilarity(urls5, urls6) + '%');
console.log('(Deve ser 0% pois as URLs completas são diferentes)');

// Teste 4: Parcialmente similares
const urls7 = [
    'https://www.example.com/page1',
    'https://www.example.com/page2',
    'https://www.site.com.br/artigo',
    'https://www.blog.com/post1',
    'https://www.loja.com/produto'
];

const urls8 = [
    'https://www.example.com/page1',  // Igual
    'https://www.example.com/page2',  // Igual
    'https://www.outro.com/diferente', // Diferente
    'https://www.blog.com/post1',      // Igual
    'https://www.forum.com/topic'      // Diferente
];

console.log('\nTeste 4: Parcialmente similares (3 de 5 iguais = 60%)');
console.log('URLs Set 1:', urls7);
console.log('URLs Set 2:', urls8);
console.log('Similaridade:', calculateSimilarity(urls7, urls8) + '%');

// Teste 5: Com www e sem www
const urls9 = [
    'https://www.example.com/page1',
    'https://example.com/page2',
    'www.site.com.br/artigo'
];

const urls10 = [
    'https://example.com/page1',      // Mesmo sem www
    'http://www.example.com/page2',   // Mesmo com protocolo diferente
    'https://site.com.br/artigo'      // Mesmo sem www
];

console.log('\nTeste 5: Ignorando www e protocolo');
console.log('URLs Set 1:', urls9);
console.log('URLs Set 2:', urls10);
console.log('Similaridade:', calculateSimilarity(urls9, urls10) + '%');
console.log('(Deve ser 100% pois são as mesmas URLs normalizadas)');