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
        
        const formData = new FormData();
        formData.append('keywordFile', file);
        formData.append('socketId', socket.id);

        loadingSpinner.classList.remove('hidden');
        submitButton.disabled = true;
        resultsArea.textContent = '';

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
        resultsArea.textContent = '';

        if (!data.keywords || data.keywords.length === 0) {
            const noKeywords = document.createElement('p');
            noKeywords.className = 'text-gray-500 text-center';
            noKeywords.textContent = 'Nenhuma palavra-chave encontrada.';
            resultsArea.appendChild(noKeywords);
            return;
        }

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'space-y-4';

        const header = document.createElement('div');
        header.className = 'mb-4';
        const headerTitle = document.createElement('h2');
        headerTitle.className = 'text-xl font-bold text-gray-800';
        headerTitle.textContent = 'Resultados da Análise';
        const headerCount = document.createElement('p');
        headerCount.className = 'text-gray-600';
        headerCount.textContent = `Total de palavras-chave: ${data.keywordCount}`;
        header.appendChild(headerTitle);
        header.appendChild(headerCount);
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

    function isValidProtocol(url) {
        try {
            const parsed = new URL(url, window.location.href);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
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
                const headerContainer = document.createElement('div');
                headerContainer.className = 'flex justify-between items-center';

                const leftContainer = document.createElement('div');
                leftContainer.className = 'flex items-center flex-1';

                const starSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                starSvg.setAttribute('class', 'w-5 h-5 text-yellow-500 mr-2');
                starSvg.setAttribute('fill', 'currentColor');
                starSvg.setAttribute('viewBox', '0 0 20 20');
                const starPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                starPath.setAttribute('d', 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z');
                starSvg.appendChild(starPath);
                leftContainer.appendChild(starSvg);

                const keywordSpan = document.createElement('span');
                keywordSpan.className = 'font-medium text-gray-800';
                keywordSpan.textContent = keyword.text;
                leftContainer.appendChild(keywordSpan);

                const principalSpan = document.createElement('span');
                principalSpan.className = 'ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded';
                principalSpan.textContent = 'Principal';
                leftContainer.appendChild(principalSpan);

                const rightContainer = document.createElement('div');
                rightContainer.className = 'flex items-center space-x-3';

                const volumeSpan = document.createElement('span');
                volumeSpan.className = 'text-gray-600 font-medium';
                volumeSpan.textContent = keyword.volume.toLocaleString();

                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'serp-toggle text-gray-500 hover:text-gray-700 p-1';
                const chevronSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                chevronSvg.setAttribute('class', 'w-5 h-5 transform transition-transform');
                chevronSvg.setAttribute('fill', 'none');
                chevronSvg.setAttribute('stroke', 'currentColor');
                chevronSvg.setAttribute('viewBox', '0 0 24 24');
                const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                chevronPath.setAttribute('stroke-linecap', 'round');
                chevronPath.setAttribute('stroke-linejoin', 'round');
                chevronPath.setAttribute('stroke-width', '2');
                chevronPath.setAttribute('d', 'M19 9l-7 7-7-7');
                chevronSvg.appendChild(chevronPath);
                toggleBtn.appendChild(chevronSvg);

                rightContainer.appendChild(volumeSpan);
                rightContainer.appendChild(toggleBtn);

                headerContainer.appendChild(leftContainer);
                headerContainer.appendChild(rightContainer);

                keywordHeader.appendChild(headerContainer);
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
                
                const headerContainer = document.createElement('div');
                headerContainer.className = 'flex justify-between items-center';

                const leftContainer = document.createElement('div');
                leftContainer.className = 'flex items-center flex-1';
                const keywordSpan = document.createElement('span');
                keywordSpan.className = 'text-gray-700';
                keywordSpan.textContent = keyword.text;
                const similaritySpan = document.createElement('span');
                similaritySpan.className = `ml-2 text-xs ${bgColor} ${similarityColor} px-2 py-1 rounded font-semibold`;
                similaritySpan.textContent = `${keyword.similarity}% similar`;
                leftContainer.appendChild(keywordSpan);
                leftContainer.appendChild(similaritySpan);

                const rightContainer = document.createElement('div');
                rightContainer.className = 'flex items-center space-x-3';
                const volumeSpan = document.createElement('span');
                volumeSpan.className = 'text-gray-500';
                volumeSpan.textContent = keyword.volume.toLocaleString();
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'serp-toggle text-gray-500 hover:text-gray-700 p-1';
                const chevronSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                chevronSvg.setAttribute('class', 'w-5 h-5 transform transition-transform');
                chevronSvg.setAttribute('fill', 'none');
                chevronSvg.setAttribute('stroke', 'currentColor');
                chevronSvg.setAttribute('viewBox', '0 0 24 24');
                const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                chevronPath.setAttribute('stroke-linecap', 'round');
                chevronPath.setAttribute('stroke-linejoin', 'round');
                chevronPath.setAttribute('stroke-width', '2');
                chevronPath.setAttribute('d', 'M19 9l-7 7-7-7');
                chevronSvg.appendChild(chevronPath);
                toggleBtn.appendChild(chevronSvg);
                rightContainer.appendChild(volumeSpan);
                rightContainer.appendChild(toggleBtn);

                headerContainer.appendChild(leftContainer);
                headerContainer.appendChild(rightContainer);

                keywordHeader.appendChild(headerContainer);
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
            
            if (index > 0 && commonUrls.length > 0) {
                const commonDiv = document.createElement('div');
                commonDiv.className = 'mb-3 p-2 bg-blue-50 rounded text-xs';
                const commonLabel = document.createElement('span');
                commonLabel.className = 'font-semibold text-blue-700';
                commonLabel.textContent = 'URLs em comum com a principal:';
                const commonInfo = document.createElement('span');
                commonInfo.className = 'text-blue-600 ml-1';
                commonInfo.textContent = `${commonUrls.length} de 7 (${Math.round((commonUrls.length/7)*100)}%)`;
                commonDiv.appendChild(commonLabel);
                commonDiv.appendChild(commonInfo);
                serpsContainer.appendChild(commonDiv);
            }

            const serpsTitle = document.createElement('div');
            serpsTitle.className = 'text-xs font-semibold text-gray-600 mb-2';
            serpsTitle.textContent = 'Top 7 resultados de busca:';
            serpsContainer.appendChild(serpsTitle);

            const serpsList = document.createElement('ol');
            serpsList.className = 'text-xs space-y-1';
            (keyword.serps || []).forEach((url, idx) => {
                const isCommon = index > 0 && commonUrls.some(commonUrl =>
                    normalizeUrlForComparison(commonUrl) === normalizeUrlForComparison(url)
                );
                const item = document.createElement('li');
                item.className = 'flex items-start' + (isCommon ? ' bg-green-50 p-1 rounded' : '');
                const indexSpan = document.createElement('span');
                indexSpan.className = 'text-gray-500 mr-2';
                indexSpan.textContent = `${idx + 1}.`;
                const link = document.createElement('a');
                link.className = 'text-blue-600 hover:text-blue-800 truncate flex-1';
                link.target = '_blank';
                link.title = url;
                if (isValidProtocol(url)) {
                    link.href = url;
                }
                const displayUrl = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                link.textContent = (isCommon ? '✓ ' : '') + displayUrl;
                item.appendChild(indexSpan);
                item.appendChild(link);
                serpsList.appendChild(item);
            });
            serpsContainer.appendChild(serpsList);
            if (keyword.serps && keyword.serps.length === 0) {
                const noResults = document.createElement('p');
                noResults.className = 'text-gray-500 text-xs italic';
                noResults.textContent = 'Nenhum resultado encontrado';
                serpsContainer.appendChild(noResults);
            }
            
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
        resultsArea.textContent = '';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded';
        const boldP = document.createElement('p');
        boldP.className = 'font-bold';
        boldP.textContent = 'Erro';
        const messageP = document.createElement('p');
        messageP.textContent = message;
        errorDiv.appendChild(boldP);
        errorDiv.appendChild(messageP);
        resultsArea.appendChild(errorDiv);
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
            if (isValidProtocol(url) || url.startsWith('blob:')) {
                link.href = url;
            }
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
