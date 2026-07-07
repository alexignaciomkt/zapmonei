# 06 - Decision Engine (ZapMonei V2)

---

## 1. Funcionamento do Roteador Inteligente
O **Decision Engine (Motor de Decisão)** é a camada de controle que avalia as mensagens recebidas via webhook antes de gastar recursos de processamento ou tokens de API. Ele é implementado como um nó de código javascript inicial no n8n.

---

## 2. Detalhe Técnico de Roteamento

### 2.1 Nível 1: Respostas Rápidas (Estático)
*   **Regra de Match:** RegEx case-insensitive.
*   **Padrões:**
    *   `/^(ajuda|socorro|help)$/i` → Envia menu explicativo de comandos.
    *   `/^(menu|opcoes)$/i` → Envia botões ou opções de fluxo.
    *   `/^(suporte|falar com humano)$/i` → Envia link ou contato do suporte.
*   **Processamento:** Retorno síncrono imediato de texto pré-salvo.
*   **Custo:** $0.00 | **Latência:** <50ms.

### 2.2 Nível 2: Registro Financeiro (Lançamentos)
*   **Regra de Match:** A mensagem contém números (formato de moeda ou inteiros) **E** pelo menos um termo financeiro conhecido:
    *   *Ganhos:* `"ganhei"`, `"recebi"`, `"faturei"`, `"pix"`, `"uber"`, `"99"`, `"indrive"`, `"corrida"`.
    *   *Gastos:* `"gastei"`, `"paguei"`, `"combustivel"`, `"gasolina"`, `"etanol"`, `"gnv"`, `"diesel"`, `"almoço"`, `"lanche"`, `"oficina"`, `"pneu"`, `"oleo"`, `"lavagem"`.
*   **Processamento:** Encaminha ao nó de extração estruturada (Gemini 1.5 Flash).
*   **Custo:** Baixo | **Latência:** ~2s.

### 2.3 Nível 3: Consultas SQL (Relatórios e Metas)
*   **Regra de Match:** Presença de termos analíticos de agregação (*"lucro"*, *"quanto"*, *"gasto"*, *"extrato"*) **E** referências temporais (*"hoje"*, *"semana"*, *"ontem"*, *"mes"*).
*   **Processamento:** A IA traduz a solicitação em parâmetros (ex: `data_inicio`, `data_fim`, `tipo`) para rodar consultas SQL prontas nas views seguras do banco. Os valores resultantes alimentam o Gemini que escreve o resumo amigável.
*   **Custo:** Médio | **Latência:** ~3s.

### 2.4 Nível 4: Agente Conversacional (Conversa Livre/RAG)
*   **Regra de Match:** Fallback definitivo. Qualquer mensagem que falhe nas validações dos níveis 1, 2 e 3 cai aqui.
*   **Processamento:** Agente LangChain completo com histórico conversacional. Permite conversas cotidianas, tira dúvidas sobre o produto e corrige erros de registros anteriores de forma contextual.
*   **Custo:** Alto | **Latência:** ~5-7s.
