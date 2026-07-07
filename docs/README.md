# Índice Oficial da Documentação (ZapMonei V2)

Este repositório de documentação centraliza todas as especificações, levantamentos de auditoria e decisões de arquitetura do **ZapMonei V2**. Para garantir consistência, este arquivo serve como o mapa e índice da documentação.

---

## 🗺️ Mapa de Documentos por Assunto

### 00 - Visão do Produto
*   [Definitivo] [00-VISAO_DO_PRODUTO.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/00-VISAO_DO_PRODUTO.md) — Contém a visão, missão, princípios, dores, personalidade de Kathy, personalidade do Agente Financeiro e a regra de ouro de produto.
*   *Substituídos/Duplicados:*
    *   [00-VISAO.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/00-VISAO.md) (Substituído e unificado em `00-VISAO_DO_PRODUTO.md`).
    *   [VISAO_DO_PRODUTO.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/VISAO_DO_PRODUTO.md) (Substituído e unificado em `00-VISAO_DO_PRODUTO.md`).

### 01 - MVP
*   [Definitivo] [12-MVP-SABADO.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/12-MVP-SABADO.md) — Escopo do MVP, checklists de fases (Ativação, Conexão, Registro Financeiro, Consulta) e critérios de aceite.

### 02 - Diário Técnico
*   [Definitivo] [DECISOES.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/DECISOES.md) — Registra todas as decisões arquiteturais tomadas (Postgres na VPS, n8n como orquestrador, modelos enxutos do Prisma, docker minimalista, Banco como fonte da verdade, IA não grava direto e regras determinísticas no backend).

### 03 - Banco de Dados
*   [Definitivo] [03-BANCO.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/03-BANCO.md) — Dicionário de tabelas completo, modelo de entidade-relacionamento e regras de RLS do PostgreSQL.
    *   *Nota:* Para a Sprint 1, apenas as tabelas `User`, `Transaction` e `Audit` estão mapeadas no Prisma ORM do backend, conforme decisão registrada em `DECISOES.md`.

### 04 - Fluxos n8n & IA
*   [02-FLUXOS.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/02-FLUXOS.md) — Descreve a jornada de onboarding do motorista e uso diário conversacional.
*   [04-INTEGRACOES.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/04-INTEGRACOES.md) — Mapeamento do Asaas e Evolution API (EvoGO).
*   [05-IA.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/05-IA.md) — Tom de voz, prompts do sistema e modo JSON Mode do Gemini.
*   [06-DECISION_ENGINE.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/06-DECISION_ENGINE.md) — Conceito do roteador inteligente em 4 níveis (regra estática, transações, relatórios e fallback conversational).
*   [09-MODULOS.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/09-MODULOS.md) — Descrição dos módulos funcionais e mapeamento de IDs de workflows.
*   [10-EUATTENDO-CORE.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/10-EUATTENDO-CORE.md) — Explica a arquitetura e acoplamentos do core de mensageria.

### 05 - Auditorias
*   [Definitivo M01] [AUDITORIA-M01-RECEBER-MENSAGENS.md](file:///e:/Sistemas/ZapMonei%20-%20V1/docs/AUDITORIA-M01-RECEBER-MENSAGENS.md) — Auditoria técnica integral do workflow de recebimento de mensagens e motor de IA ativo no n8n.
*   [Definitivo M02] [M02-AUDITORIA.md](file:///e:/Sistemas/ZapMonei%20-%20V1/docs/M02-AUDITORIA.md) — Levantamento técnico detalhado do fluxo de pagamento e ativação WooCommerce/Asaas.
*   *Relacionados:*
    *   [M02-ATIVACAO.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/M02-ATIVACAO.md) (Substituído e detalhado de forma completa em `M02-AUDITORIA.md`).

### 06 - Backend
*   [01-ARQUITETURA.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/01-ARQUITETURA.md) — Visão geral do desacoplamento n8n Receiver/Worker e stack técnica.
*   [Definitivo API] [API.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/API.md) — Documentação oficial de rotas e contratos da API.
*   *Documentação do Código:* Para instruções de como executar e configurar o backend, consulte o arquivo [backend/README.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/backend/README.md).

### 07 - Frontend
*   *(O frontend do ZapMonei V2 é o painel web minimalista PWA. O mapeamento técnico das telas será adicionado a esta seção na Sprint correspondente).*

### 08 - Roadmap & Histórico
*   [07-ROADMAP.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/07-ROADMAP.md) — Cronograma estimado e divisões das sprints.
*   [08-CHANGELOG.md](file:///e:/Sistemas/ZapMonei%20-%20V1/ZapMonei%20-%20V2/docs/08-CHANGELOG.md) — Histórico de mudanças da documentação.

---

## 🔎 Análise de Sobreposição e Duplicidades

1.  **Visão de Produto:** Os arquivos `00-VISAO.md` e `VISAO_DO_PRODUTO.md` possuíam informações sobrepostas. Ambas foram integralmente consolidadas no arquivo final **`00-VISAO_DO_PRODUTO.md`**.
2.  **Fluxo M02 / Ativação:** O arquivo `M02-ATIVACAO.md` foi substituído e aprofundado pelo levantamento de auditoria **`M02-AUDITORIA.md`**, que representa o comportamento exato de ativação pós-pagamento em produção.
