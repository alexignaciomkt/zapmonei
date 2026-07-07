# Arquitetura Oficial do Sistema

Este documento descreve a organização técnica, responsabilidades e fluxos de dados que compõem a arquitetura do **ZapMonei V2**.

---

## 1. Visão Geral dos Componentes

O sistema é composto por cinco blocos principais de arquitetura:

1.  **WhatsApp / Canal do Motorista:** Interface principal de contato. O motorista envia comandos informais, comprovantes e recebe resumos operacionais.
2.  **Evolution API (Conector de Mensagens):** Gerenciador de instâncias do WhatsApp. Recebe mensagens enviadas e dispara webhooks em tempo real, além de expor endpoints para envio de mensagens ativas.
3.  **n8n (Orquestrador de Fluxos):** Responsável pela ingestão, roteamento temporário de mensagens, chamadas à inteligência artificial (Gemini) e envio de payloads estruturados para a API.
4.  **ZapMonei API (Backend Express):** Concentra e valida todas as regras de negócios, transações financeiras e dados cadastrais. Serve como o controlador determinístico de estado.
5.  **PostgreSQL (Persistência VPS):** Banco de dados relacional central. Mapeado via **Prisma ORM**.

---

## 2. Responsabilidades

| Componente | Função Principal | Responsabilidade Específica |
|---|---|---|
| **Evolution API** | Gateway de Mensageria | Conexão de instâncias do WhatsApp, recepção e disparo de mensagens. |
| **n8n** | Orquestração Conversacional | Conectar webhooks, consumir IA, traduzir JSON e integrar fluxos externos. |
| **ZapMonei API** | Regras de Negócio e Validações | Autenticação, regras financeiras, validação estrutural de dados e persistência. |
| **PostgreSQL** | Estado do Sistema | Única Fonte da Verdade (dados cadastrais, lançamentos e transações). |

---

## 3. Fluxo de Dados Oficial (Mensagem → Banco)

```
[Motorista]
    │
    ▼ (WhatsApp)
[Evolution API]
    │
    ▼ (Webhook)
   [n8n]
    │
    ▼ (Inteligência Artificial - Gemini)
[Prompt/JSON]
    │
    ▼ (Requisição HTTP POST/PATCH)
[ZapMonei API] (Validações & Lógica de Negócio)
    │
    ▼ (Prisma Client)
[PostgreSQL] (VPS)
```

---

## 4. Diretrizes e Fontes da Verdade

### 4.1. Única Fonte da Verdade (Single Source of Truth)
*   **O PostgreSQL (VPS) é a única fonte oficial de dados e estado.**
*   Nenhum estado do usuário ou dados de transação financeira serão armazenados de forma persistente no n8n, no WhatsApp ou na Evolution API.
*   A Evolution API e o WhatsApp atuam estritamente como canais de transporte temporário de mensagens.

### 4.2. Estados Proibidos
*   **Decisões Lógicas no n8n:** O n8n nunca deve tomar decisões de negócios determinísticas de forma isolada, como decidir o reajuste de saldos ou alterar regras de cadastro direto no banco. O n8n deve sempre consumir endpoints expostos pela API.
*   **Escritas Diretas no Banco por IA:** A Inteligência Artificial (Gemini) é responsável apenas por processar e extrair dados de linguagem natural em objetos JSON. Ela **nunca** escreve dados de forma direta no banco de dados.

---

## 5. Fluxo Completo do Sistema (Exemplo de Cadastro)

1.  **Gatilho de Compra:** O motorista assina o plano no site e um webhook é disparado.
2.  **Ingestão n8n:** O workflow M02 recebe os dados da compra (nome, telefone, plano, email).
3.  **Normalização & Upsert:** O n8n executa uma requisição `POST /api/v1/users` enviando os dados. A API valida a estrutura, normaliza o telefone para o padrão DDI via módulo `phone.ts` e executa a persistência (`upsert`) no PostgreSQL via Prisma.
4.  **Criação de Instância:** Após obter sucesso no cadastro da API, o n8n prossegue chamando a Evolution API para criar e configurar a instância do WhatsApp para o usuário.
5.  **Ativação Conversacional:** A Kathy (assistente virtual de suporte técnico) envia a instrução ou QR Code de pareamento ao motorista para finalizar a conexão do WhatsApp.
