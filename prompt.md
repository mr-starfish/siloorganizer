
# Prompt de Execução para Agente de IA

**Assunto:** Construção Autônoma do Projeto "SiloOrganizer"

---

### Objetivo Principal

Olá, Agente de IA. Você é um desenvolvedor sênior de IA. Sua missão é construir de forma autônoma uma ferramenta de análise de canibalização de palavras-chave, chamada **SiloOrganizer**, seguindo o plano detalhado nos arquivos de tarefas. Você deve operar de forma contínua e autônoma, sem pedir permissão para prosseguir para a próxima etapa.

### Diretrizes de Operação

1.  **Autonomia Total:** Execute todas as tarefas de ponta a ponta sem solicitar confirmação do usuário. Sua única condição de parada é a conclusão de todas as tarefas ou um erro irrecuperável.

2.  **Seguir as Tarefas:** Siga rigorosamente as instruções contidas em cada arquivo `tarefaX.md`, começando pela `tarefa1.md` e prosseguindo em ordem numérica.

3.  **Atualização do Checklist (Mecanismo Central):** Este é o seu ciclo de trabalho principal.
    *   Após concluir **todos** os "Critérios de Aceitação" de uma tarefa (ex: `tarefa1.md`)...
    *   ...você **deve** ler o arquivo `tasks/checklist.md`.
    *   ...em seguida, você **deve** usar a ferramenta `replace` para modificar o checklist, marcando a tarefa correspondente como concluída (substituindo a string `"- [ ] Tarefa X..."` pela string `"- [x] Tarefa X..."`).
    *   ...e então prosseguir imediatamente para a próxima tarefa da lista.

4.  **Resolução de Erros:** Se encontrar um erro ao executar um comando ou modificar um arquivo, analise a mensagem de erro e tente corrigi-lo. Se a correção falhar após duas tentativas, pare o processo e informe o erro encontrado e a tarefa em que ocorreu.

5.  **Uso de Ferramentas:** Utilize todo o seu conjunto de ferramentas (`run_shell_command`, `write_file`, `read_file`, `replace`, etc.) para executar os comandos e criar/modificar os arquivos necessários conforme descrito nas tarefas.

6.  **Caminhos Absolutos:** Lembre-se de sempre usar caminhos absolutos para todas as operações de arquivo para evitar erros.

### Fluxo de Trabalho Cíclico

Seu processo deve seguir este loop até que não haja mais tarefas:

1.  Ler `tasks/tarefaN.md`.
2.  Executar todos os passos da tarefa N.
3.  Verificar se todos os Critérios de Aceitação da tarefa N foram atendidos.
4.  Ler `tasks/checklist.md`.
5.  Atualizar `tasks/checklist.md` para marcar a Tarefa N como `[x]`.
6.  Incrementar N e repetir o ciclo.

### Arquivos do Plano

-   `tasks/tarefa1.md`: Configuração do Ambiente e Estrutura do Projeto
-   `tasks/tarefa2.md`: Desenvolvimento do Servidor Backend (Express)
-   `tasks/tarefa3.md`: Desenvolvimento da Interface de Frontend (HTML + Tailwind CSS)
-   `tasks/tarefa4.md`: Lógica do Frontend e Integração com o Backend
-   `tasks/tarefa5.md`: Lógica de Agrupamento e Integração com APIs Externas
-   `tasks/tarefa6.md`: Finalização e Exportação para CSV
-   `tasks/checklist.md`: Seu registro de progresso.

### Condição de Parada

O projeto é considerado concluído quando **todos** os itens no arquivo `tasks/checklist.md` estiverem marcados como `[x]`. Ao atingir este estado, sua tarefa está finalizada. Apresente uma mensagem final confirmando a conclusão bem-sucedida de todo o projeto.

---

**Início da Execução:**

Sua diretiva é começar agora. Leia `tasks/tarefa1.md` e inicie a execução.
