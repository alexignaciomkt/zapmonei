# 🧠 Decision Engine — Roteador Inteligente de Mensagens
### Arquitetura de Processamento de Intenções em Quatro Níveis

Este documento descreve as especificações de design e funcionamento do futuro **Decision Engine (Motor de Decisão)** do ZapMonei. O objetivo deste motor é atuar como uma triagem inteligente na entrada de webhooks do WhatsApp, reduzindo custos de API, otimizando a latência de respostas e garantindo alta precisão no processamento.

---

## 1. Visão Geral da Arquitetura do Roteador

O Decision Engine funciona como uma cascata de avaliação de mensagens. Em vez de enviar toda e qualquer mensagem diretamente para um modelo de linguagem caro e lento, a mensagem é submetida a uma filtragem sequencial que prioriza a execução mais barata e rápida primeiro.

```
                  MENSAGEM DO USUÁRIO
                           │
                           ▼
          ┌──────────────────────────────────┐
          │  Nível 1: Respostas Rápidas      │ ──▶ SIM ──▶ Retorna Template Rápido
          │  (RegEx & Regras Estáticas)      │             (Latência <50ms | Custo: $0)
          └────────────────┬─────────────────┘
                           │ NÃO
                           ▼
          ┌──────────────────────────────────┐
          │  Nível 2: Registro Financeiro    │ ──▶ SIM ──▶ LLM Structured Extraction
          │  (Detecção de Padrão Numérico)   │             (Latência ~2s | Custo: Baixo)
          └────────────────┬─────────────────┘
                           │ NÃO
                           ▼
          ┌──────────────────────────────────┐
          │  Nível 3: Consultas e Relatórios │ ──▶ SIM ──▶ Text-to-SQL / Templates
          │  (Intenções de Análise / Balanço)│             (Latência ~3s | Custo: Médio)
          └────────────────┬─────────────────┘
                           │ NÃO
                           ▼
          ┌──────────────────────────────────┐
          │  Nível 4: Agente Conversacional  │ ──▶ Processa Diálogo Livre & RAG
          │  (LangChain Agent / Memory Loop) │             (Latência 4-6s | Custo: Alto)
          └──────────────────────────────────┘
```

---

## 2. Detalhamento dos Níveis de Decisão

### NÍVEL 1: Respostas Rápidas (Sem IA)
*   **Gatilho:** Correspondência exata de palavras-chave, botões clicados ou expressões regulares simples.
*   **Intenções tratadas:** Pedidos de ajuda (*"ajuda"*, *"socorro"*), solicitação de menu (*"menu"*, *"opcoes"*), cancelamento (*"parar"*, *"cancelar"*) ou contato de suporte (*"suporte"*, *"falar com humano"*).
*   **Como funciona:** Um nó de Switch ou código estático no n8n intercepta a mensagem. Se houver match, retorna imediatamente um fluxo de texto pré-configurado sem consultar nenhuma inteligência artificial.
*   **Vantagens:** Latência quase nula (<50ms) e custo financeiro zero de APIs de LLM.

### NÍVEL 2: Registro Financeiro (Extração Estruturada Especializada)
*   **Gatilho:** Mensagens que contenham indicadores claros de valores numéricos e termos operacionais de ganho ou gasto (ex: *"ganhei"*, *"gastei"*, *"recebi"*, *"pagamento"*, *"combustível"*, *"posto"*, *"Uber"*, *"99"*).
*   **Intenções tratadas:** Lançamento de receitas e despesas.
*   **Como funciona:** O roteador identifica a presença de números + palavras financeiras. A mensagem é enviada a um nó especializado do Gemini 1.5 Flash com um system prompt focado **exclusivamente** em extração estruturada de parâmetros (`valor`, `tipo`, `categoria`, `descricao`).
*   **Vantagens:** O prompt de extração é enxuto (poucos tokens de contexto), garantindo resposta rápida (~2 segundos) e alta precisão.

### NÍVEL 3: Consultas e Relatórios (Text-to-SQL / Query Templates)
*   **Gatilho:** Frases que denotam intenção de análise retrospectiva ou agrupamento de dados (ex: *"quanto lucrei hoje?"*, *"extrato da semana"*, *"quanto gastei com gasolina no mês?"*).
*   **Intenções tratadas:** Consultas a bancos de dados, somatórios, médias e metas.
*   **Como funciona:** A IA traduz a linguagem natural do usuário em filtros estruturados (data de início, data de término, categoria) que são repassados a uma consulta SQL pré-formatada e segura no Supabase (executando apenas `SELECT` em views seguras e isoladas por usuário). O n8n roda a consulta e devolve os dados para a LLM redigir a resposta final.
*   **Vantagens:** Garante exatidão matemática completa. Evita alucinações onde a IA "chuta" o lucro do usuário a partir do histórico bruto de chat.

### NÍVEL 4: Agente Conversacional (Memória Conversacional e RAG)
*   **Gatilho:** Mensagens que não se enquadram em nenhum dos níveis anteriores (diálogo livre, dúvidas gerais, complementos contextuais, reclamações).
*   **Intenções tratadas:** Conversa fiada (*"tudo bem?"*, *"bom dia"*), correções contextuais (*"não, o valor de antes foi 50 e não 30"*), e dúvidas gerais do produto (*"como faço pra ver meu extrato na web?"*).
*   **Como funciona:** É a camada de inteligência mais pesada. Utiliza um Agente Cognitivo com histórico de conversas carregado do Supabase. O Agente tem acesso às ferramentas do sistema e pode conduzir discussões complexas, explicar regras de depreciação ou guiar o usuário na resolução de problemas.
*   **Vantagens:** Age como uma rede de proteção (fallback). Garante que o bot nunca pareça estúpido ou incapaz de dialogar de forma humana.

---

## 3. Lógica de Roteamento no n8n (Passo a Passo)

1.  **Interceptador (Router):** Um nó de Javascript roda no n8n assim que o webhook é disparado.
2.  **Fase 1 Match:** Se `message.text` corresponder a `/^(ajuda|menu|suporte|cancelar|sair)$/i`, envia para o **Nível 1** e encerra.
3.  **Fase 2 Match:** Se `message.text` contiver números E palavras-chave de transações, envia para o **Nível 2** (Motor de IA de Lançamentos).
4.  **Fase 3 Match:** Se `message.text` contiver palavras-chave de agrupamento/tempo (ex: *"quanto"*, *"lucro"*, *"gastei"*, *"gráfico"*, *"resumo"*) E referências temporais (ex: *"hoje"*, *"semana"*, *"mês"*, *"ontem"*), envia para o **Nível 3** (Consulta de Relatórios).
5.  **Fase 4 Fallback:** Qualquer outro caso cai no **Nível 4** (Agente Geral).
