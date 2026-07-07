# Diário Técnico - Decisões Arquiteturais (ZapMonei V2)

Este documento registra todas as decisões técnicas tomadas durante o desenvolvimento do ZapMonei V2, visando garantir clareza, transparência e alinhamento histórico sobre as escolhas arquiteturais.

---

## Histórico de Decisões

### 01/07/2026 — Banco de Dados Relacional
*   **Decisão:** O PostgreSQL oficial do projeto será o banco de dados hospedado na VPS.
*   **Motivo:** Evitar divergências de ambiente e dados entre o desenvolvimento local e a produção.
*   **Impacto:** Nenhum container de PostgreSQL local será criado ou executado via Docker Compose no ambiente de desenvolvimento.

---

### 01/07/2026 — Orquestração de Processos no MVP
*   **Decisão:** O n8n continuará sendo o orquestrador oficial de workflows para o MVP.
*   **Motivo:** Reduzir riscos de transição e aproveitar a infraestrutura e fluxos já validados e em execução.
*   **Impacto:** A API Express de backend substituirá as regras de negócio gradualmente, atuando como um repositório centralizado de lógica, sem interromper ou reescrever completamente a orquestração n8n até sábado.

---

### 01/07/2026 — Modelagem Enxuta do Prisma
*   **Decisão:** O schema do Prisma no MVP conterá apenas 3 tabelas primordiais: `User`, `Transaction` e `Audit`.
*   **Motivo:** Manter foco absoluto na entrega do fluxo de compra, cadastro e registros financeiros básicos até sábado, reduzindo a complexidade do banco para tabelas não essenciais à primeira entrega.
*   **Impacto:** As tabelas `Message`, `Attachment` e `Category` não serão incluídas no schema inicial e serão adicionadas em sprints futuras.

---

### 01/07/2026 — Escopo dos Contêineres de Desenvolvimento
*   **Decisão:** O docker-compose de desenvolvimento local subirá apenas o serviço de API e uma instância do Redis local.
*   **Motivo:** Facilitar o desenvolvimento sem exigir VPN ativa para tráfego local de cache e filas, enquanto a persistência relacional conecta-se diretamente à VPS.
*   **Impacto:** O arquivo `docker-compose.dev.yml` não conterá os serviços `postgres` ou `minio`.

---

### 01/07/2026 — Filosofia de Desenvolvimento

**Decisão:**
Todo desenvolvimento do ZapMonei seguirá a filosofia "MVP Primeiro".

**Motivo:**
O objetivo do projeto é validar o produto com usuários reais o mais rapidamente possível. Toda funcionalidade deverá justificar sua existência ajudando diretamente o motorista a controlar suas finanças.

**Impacto:**
*   Nenhuma funcionalidade será desenvolvida apenas porque será útil no futuro.
*   Nenhuma arquitetura será criada pensando em módulos futuros.
*   Toda Sprint deverá terminar com uma funcionalidade utilizável pelo usuário.
*   Cada etapa será validada em ambiente real antes da próxima Sprint.

---

### 01/07/2026 — Regra da Reutilização

**Decisão:**
Sempre reutilizar código e workflows existentes antes de desenvolver novos componentes.

**Motivo:**
Reduzir tempo de desenvolvimento, diminuir riscos e aproveitar toda a experiência acumulada na versão anterior.

**Impacto:**
*   Antes de criar um novo workflow, verificar se algum existente pode ser adaptado.
*   Antes de criar um endpoint novo, verificar se uma rota existente pode ser expandida.
*   Refatorações completas ficam proibidas durante o MVP.

---

### 01/07/2026 — Banco é a Fonte da Verdade

**Decisão:**
O PostgreSQL será a única fonte oficial de dados do sistema.

**Motivo:**
Evitar divergências entre banco, n8n, Evolution e frontend.

**Impacto:**
*   O n8n nunca armazenará estado.
*   O WhatsApp nunca será considerado fonte de dados.
*   A Evolution nunca será considerada fonte de dados.
*   O frontend apenas consulta e envia informações.
*   Toda decisão será baseada no PostgreSQL.

---

### 01/07/2026 — A IA Nunca Escreve Diretamente no Banco

**Decisão:**
A IA (Gemini ou qualquer outro modelo) nunca terá permissão para gravar dados diretamente no banco.

**Motivo:**
A IA interpreta mensagens, mas quem valida e grava é o backend.

**Fluxo obrigatório:**
WhatsApp → Evolution → n8n → LLM → JSON → API → Validação → PostgreSQL

**Impacto:**
*   Nunca confiar cegamente na IA.
*   Toda informação recebida será validada antes de persistir.
*   Facilita trocar Gemini por OpenRouter, Ollama ou outro modelo sem alterar a regra de negócio.

---

### 01/07/2026 — LLM apenas quando necessária

**Decisão:**
Toda regra determinística deve acontecer no backend. A LLM apenas interpreta linguagem natural.

**Motivo:**
Reduzir custos, eliminar latência desnecessária e garantir exatidão lógica nas regras de negócio.

**Impacto:**
*   A LLM nunca processará cálculos matemáticos ou decisões de roteamento determinísticas.
*   O backend Express e as consultas SQL no PostgreSQL realizarão toda a lógica de dados e matemática.
*   A LLM é responsável estritamente por traduzir a mensagem informal em linguagem natural do usuário para um formato legível (JSON).
