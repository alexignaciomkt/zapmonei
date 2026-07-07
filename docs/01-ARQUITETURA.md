# 01 - Arquitetura Técnica (ZapMonei V2)

---

## 1. Visão Geral da Nova Arquitetura
A versão 2 do ZapMonei adota uma arquitetura **assíncrona desacoplada** para garantir estabilidade, eliminar transações duplicadas e suportar milhares de usuários simultâneos sem gargalos de rede.

```
+------------------+     Webhook      +------------------+
|  Evolution API   | -------------->  |   n8n Receiver   |
| (WhatsApp Link)  |                  | (HTTP 200 em <1s)|
+------------------+                  +------------------+
                                               |
                                               | Grava na Fila
                                               v
+------------------+  Consome Assínc. +------------------+
|    n8n Worker    | <--------------  |   Fila de Msg    |
|  (Agent Brain)   |                  |  (Supabase/Redis)|
+------------------+                  +------------------+
    |         ^
    v         |
[Tools]  [Gemini LLM]
    |
    v
+------------------+
| Supabase DB / RLS|
+------------------+
```

---

## 2. Componentes Principais

### 2.1 n8n Desacoplado (Receiver vs. Worker)
*   **n8n Receiver (Webhook):** Um fluxo enxuto focado em receber a mensagem da Evolution API, verificar se o ID da mensagem já existe (idempotência), gravá-la na fila e responder `HTTP 200 OK` imediatamente. Impede que a EvolutionAPI faça novas tentativas caso a LLM demore a responder.
*   **n8n Worker (Agente):** Um processo em segundo plano acionado pela fila. Ele gerencia o loop cognitivo do Agente de IA, carrega a memória conversacional recente, executa as ferramentas necessárias e retorna a resposta final.

### 2.2 Camada de Inteligência (Gemini 1.5 + LangChain)
*   **Orquestrador Cognitivo:** Baseado em Tool Calling. A LLM decide dinamicamente se precisa atualizar o onboarding, registrar uma transação ou consultar estatísticas do banco de dados.
*   **Memória Persistente:** Armazenada na tabela `messages` do Supabase e carregada como histórico a cada turno de diálogo.

### 2.3 Camada de Banco de Dados (Supabase + RLS)
*   **PostgreSQL:** Banco de dados relacional contendo restrições de integridade estritas.
*   **Row Level Security (RLS):** Toda query vinda do painel web ou de endpoints do dashboard utiliza chaves anonimizadas com políticas de RLS ativadas, garantindo isolamento total por usuário.

### 2.4 Integração WhatsApp (EvoGO)
*   Provisionamento automático de instâncias privadas para cada usuário de forma segura.
*   Settings restritos: chamadas bloqueadas e silenciamento completo de grupos para economizar recursos computacionais.
