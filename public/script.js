document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('keyword-file');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultsArea = document.getElementById('results-area');
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    const exportButton = document.getElementById('export-btn');
    const progressMessage = document.getElementById('progress-message');
    const progressBar = document.getElementById('progress-bar');
    const progressCounter = document.getElementById('progress-counter');
    const progressPercent = document.getElementById('progress-percent');
    let currentGroups = null;
    
    // Elementos de configuração de API
    const saveApisBtn = document.getElementById('save-apis-btn');
    const googleApiKey = document.getElementById('google-api-key');
    const googleCseId = document.getElementById('google-cse-id');
    const googleApiStatus = document.getElementById('google-api-status');
    
    // Carregar APIs salvas do localStorage
    function loadSavedApis() {
        const savedGoogleKey = localStorage.getItem('google_api_key');
        const savedGoogleCse = localStorage.getItem('google_cse_id');
        
        if (savedGoogleKey) {
            googleApiKey.value = savedGoogleKey;
            if (savedGoogleCse) {
                googleCseId.value = savedGoogleCse;
                googleApiStatus.innerHTML = '<span class="text-green-600 font-medium">✓ Configurado e pronto para usar!</span>';
            } else {
                googleApiStatus.innerHTML = '<span class="text-yellow-600">⚠ Falta configurar o CSE ID</span>';
            }
        }
    }
    
    // Salvar APIs no localStorage
    saveApisBtn.addEventListener('click', () => {
        const googleKey = googleApiKey.value.trim();
        const googleCse = googleCseId.value.trim();
        
        let message = '';
        let messageType = 'success';
        
        if (googleKey && googleCse) {
            localStorage.setItem('google_api_key', googleKey);
            localStorage.setItem('google_cse_id', googleCse);
            googleApiStatus.innerHTML = '<span class="text-green-600 font-medium">✓ Configurado com sucesso! Pronto para usar.</span>';
            message = '✓ Configurações salvas!';
        } else if (googleKey && !googleCse) {
            localStorage.setItem('google_api_key', googleKey);
            googleApiStatus.innerHTML = '<span class="text-yellow-600">⚠ Falta configurar o CSE ID</span>';
            message = '⚠ Falta o CSE ID';
            messageType = 'warning';
        } else if (!googleKey && googleCse) {
            localStorage.setItem('google_cse_id', googleCse);
            googleApiStatus.innerHTML = '<span class="text-yellow-600">⚠ Falta configurar a API Key</span>';
            message = '⚠ Falta a API Key';
            messageType = 'warning';
        } else {
            // Limpar configuração se ambos os campos estiverem vazios
            localStorage.removeItem('google_api_key');
            localStorage.removeItem('google_cse_id');
            googleApiStatus.innerHTML = '<span class="text-gray-500">Status: Não configurado</span>';
            message = '⚠ Nenhuma configuração fornecida';
            messageType = 'warning';
        }
        
        // Mostrar mensagem de feedback
        const originalText = saveApisBtn.textContent;
        saveApisBtn.textContent = message;
        
        if (messageType === 'success') {
            saveApisBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            saveApisBtn.classList.add('bg-green-600');
        } else {
            saveApisBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            saveApisBtn.classList.add('bg-yellow-500');
        }
        
        setTimeout(() => {
            saveApisBtn.textContent = originalText;
            saveApisBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            saveApisBtn.classList.remove('bg-green-600', 'bg-yellow-500');
        }, 2000);
    });
    
    // Código do tutorial removido - agora temos uma página separada
    
    // Carregar APIs ao iniciar
    loadSavedApis();
    
    // Conectar ao Socket.IO
    const socket = io();
    
    socket.on('connect', () => {
        console.log('Conectado ao servidor');
    });
    
    socket.on('progress', (data) => {
        if (progressMessage) {
            progressMessage.textContent = data.message;
        }
        if (progressBar) {
            progressBar.style.width = `${data.progress}%`;
        }
        if (progressCounter && data.total) {
            progressCounter.textContent = `${data.current || 0}/${data.total}`;
        }
        if (progressPercent) {
            progressPercent.textContent = `${data.progress}%`;
        }
    });

    // Atualizar info de rate limit
    const updateRateLimitInfo = () => {
        const rateLimitInfo = document.getElementById('rate-limit-info');
        if (rateLimitInfo) {
            rateLimitInfo.textContent = 'Taxa: Google Custom Search API - 1 requisição/segundo (1s de intervalo)';
        }
    };
    
    updateRateLimitInfo();
    
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor, selecione um arquivo');
            return;
        }
        
        // Verificar se a API do Google está configurada
        const googleKey = localStorage.getItem('google_api_key');
        const googleCse = localStorage.getItem('google_cse_id');
        if (!googleKey || !googleCse) {
            alert('Por favor, configure a API do Google primeiro.\n\nClique no botão "Tutorial: Como obter API do Google" para aprender como fazer isso.');
            if (!googleKey) {
                googleApiKey.focus();
            } else {
                googleCseId.focus();
            }
            return;
        }

        const formData = new FormData();
        formData.append('keywordFile', file);
        formData.append('apiProvider', 'google'); // Sempre usar Google agora
        formData.append('socketId', socket.id);
        formData.append('googleApiKey', googleKey);
        formData.append('googleCseId', googleCse);

        loadingSpinner.classList.remove('hidden');
        submitButton.disabled = true;
        resultsArea.innerHTML = '';

        try {
            const response = await fetch('/api/agrupar', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar o arquivo');
            }

            renderResults(data);
            if (data.groups && data.groups.length > 0) {
                currentGroups = data.groups;
                exportButton.disabled = false;
            }
        } catch (error) {
            renderError(error.message);
        } finally {
            loadingSpinner.classList.add('hidden');
            submitButton.disabled = false;
            // Resetar barra de progresso
            if (progressBar) {
                progressBar.style.width = '0%';
            }
            if (progressMessage) {
                progressMessage.textContent = 'Iniciando análise...';
            }
            if (progressCounter) {
                progressCounter.textContent = '0/0';
            }
            if (progressPercent) {
                progressPercent.textContent = '0%';
            }
        }
    });

    function renderResults(data) {
        resultsArea.innerHTML = '';
        
        if (!data.keywords || data.keywords.length === 0) {
            resultsArea.innerHTML = '<p class="text-gray-500 text-center">Nenhuma palavra-chave encontrada.</p>';
            return;
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'space-y-4';

        const header = document.createElement('div');
        header.className = 'mb-4';
        header.innerHTML = `
            <h2 class="text-xl font-bold text-gray-800">Resultados da Análise</h2>
            <p class="text-gray-600">Total de palavras-chave: ${data.keywordCount}</p>
        `;
        resultsContainer.appendChild(header);

        const groups = groupKeywords(data.keywords);
        
        groups.forEach((group, index) => {
            const groupCard = createGroupCard(group, index + 1);
            resultsContainer.appendChild(groupCard);
        });

        resultsArea.appendChild(resultsContainer);
    }

    function groupKeywords(keywords) {
        const groups = {};
        
        keywords.forEach(keyword => {
            const keywordText = keyword['Palavra-Chave'] || keyword.keyword || Object.values(keyword)[0];
            const volume = parseInt(keyword['Volume'] || keyword.volume || 0);
            const serps = keyword['SERPs'] || keyword.serps || [];
            const similarity = keyword['Similaridade'] || keyword.similarity || 100;
            
            const baseKeyword = extractBaseKeyword(keywordText);
            
            if (!groups[baseKeyword]) {
                groups[baseKeyword] = [];
            }
            
            groups[baseKeyword].push({
                text: keywordText,
                volume: volume,
                serps: serps,
                similarity: similarity
            });
        });

        return Object.values(groups).map(group => {
            return group.sort((a, b) => b.volume - a.volume);
        });
    }

    function extractBaseKeyword(keyword) {
        const words = keyword.toLowerCase().split(' ');
        if (words.length <= 2) return keyword.toLowerCase();
        
        return words.slice(0, 2).join(' ');
    }
    
    function normalizeUrlForComparison(url) {
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

    function createGroupCard(group, groupNumber) {
        const card = document.createElement('div');
        card.className = 'bg-white border border-gray-200 rounded-lg p-4 shadow-sm';

        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-gray-800 mb-3';
        title.textContent = `Grupo ${groupNumber}`;
        card.appendChild(title);

        const keywordsList = document.createElement('div');
        keywordsList.className = 'space-y-2';

        group.forEach((keyword, index) => {
            const keywordContainer = document.createElement('div');
            keywordContainer.className = 'border rounded-lg overflow-hidden';
            
            // Header da keyword
            const keywordHeader = document.createElement('div');
            keywordHeader.className = 'p-2 cursor-pointer hover:bg-gray-50 transition-colors';
            
            if (index === 0) {
                keywordHeader.className += ' bg-blue-50 border-blue-200';
                keywordHeader.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div class="flex items-center flex-1">
                            <svg class="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            <span class="font-medium text-gray-800">${keyword.text}</span>
                            <span class="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Principal</span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <span class="text-gray-600 font-medium">${keyword.volume.toLocaleString()}</span>
                            <button class="serp-toggle text-gray-500 hover:text-gray-700 p-1">
                                <svg class="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // Definir cor baseada na similaridade
                let similarityColor = 'text-green-600';
                let bgColor = 'bg-green-50';
                if (keyword.similarity < 85) {
                    similarityColor = 'text-yellow-600';
                    bgColor = 'bg-yellow-50';
                }
                if (keyword.similarity < 80) {
                    similarityColor = 'text-red-600';
                    bgColor = 'bg-red-50';
                }
                
                keywordHeader.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div class="flex items-center flex-1">
                            <span class="text-gray-700">${keyword.text}</span>
                            <span class="ml-2 text-xs ${bgColor} ${similarityColor} px-2 py-1 rounded font-semibold">
                                ${keyword.similarity}% similar
                            </span>
                        </div>
                        <div class="flex items-center space-x-3">
                            <span class="text-gray-500">${keyword.volume.toLocaleString()}</span>
                            <button class="serp-toggle text-gray-500 hover:text-gray-700 p-1">
                                <svg class="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            }
            
            // SERPs container (inicialmente oculto)
            const serpsContainer = document.createElement('div');
            serpsContainer.className = 'hidden bg-gray-50 p-3 border-t';
            
            // Calcular URLs em comum se não for a principal
            let commonUrls = [];
            if (index > 0 && group[0].serps && keyword.serps) {
                const principalUrls = new Set(group[0].serps.map(url => normalizeUrlForComparison(url)));
                commonUrls = keyword.serps.filter(url => principalUrls.has(normalizeUrlForComparison(url)));
            }
            
            serpsContainer.innerHTML = `
                ${index > 0 && commonUrls.length > 0 ? `
                    <div class="mb-3 p-2 bg-blue-50 rounded text-xs">
                        <span class="font-semibold text-blue-700">URLs em comum com a principal:</span>
                        <span class="text-blue-600 ml-1">${commonUrls.length} de 7 (${Math.round((commonUrls.length/7)*100)}%)</span>
                    </div>
                ` : ''}
                <div class="text-xs font-semibold text-gray-600 mb-2">Top 7 resultados de busca:</div>
                <ol class="text-xs space-y-1">
                    ${(keyword.serps || []).map((url, idx) => {
                        const isCommon = index > 0 && commonUrls.some(commonUrl => 
                            normalizeUrlForComparison(commonUrl) === normalizeUrlForComparison(url)
                        );
                        return `
                            <li class="flex items-start ${isCommon ? 'bg-green-50 p-1 rounded' : ''}">
                                <span class="text-gray-500 mr-2">${idx + 1}.</span>
                                <a href="${url}" target="_blank" class="text-blue-600 hover:text-blue-800 truncate flex-1" title="${url}">
                                    ${isCommon ? '✓ ' : ''}${url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </a>
                            </li>
                        `;
                    }).join('')}
                </ol>
                ${keyword.serps && keyword.serps.length === 0 ? '<p class="text-gray-500 text-xs italic">Nenhum resultado encontrado</p>' : ''}
            `;
            
            // Adicionar evento de toggle
            const toggleBtn = keywordHeader.querySelector('.serp-toggle');
            const chevron = toggleBtn.querySelector('svg');
            
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                serpsContainer.classList.toggle('hidden');
                chevron.classList.toggle('rotate-180');
            });
            
            keywordContainer.appendChild(keywordHeader);
            keywordContainer.appendChild(serpsContainer);
            keywordsList.appendChild(keywordContainer);
        });

        card.appendChild(keywordsList);
        return card;
    }

    function renderError(message) {
        resultsArea.innerHTML = `
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p class="font-bold">Erro</p>
                <p>${message}</p>
            </div>
        `;
        currentGroups = null;
        exportButton.disabled = true;
    }

    exportButton.addEventListener('click', async () => {
        if (!currentGroups) {
            alert('Nenhum dado para exportar. Por favor, faça uma análise primeiro.');
            return;
        }

        try {
            const response = await fetch('/api/exportar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ groups: currentGroups })
            });

            if (!response.ok) {
                throw new Error('Erro ao exportar os dados');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'keywords_agrupadas.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Erro ao exportar: ${error.message}`);
        }
    });
});