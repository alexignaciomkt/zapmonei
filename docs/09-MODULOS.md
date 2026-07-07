# 09 - Módulos Oficiais (ZapMonei V2)

Este documento descreve as especificações técnicas, limites de escopo, dependências e interfaces dos 9 módulos oficiais que compõem o ecossistema do **ZapMonei V2**.

---

## M01 - Checkout
*   **Objetivo:** Gerenciar a aquisição de clientes, faturamento, planos de assinatura e integração com gateways de pagamento.
*   **Entradas:** Dados do cliente preenchidos no formulário de checkout (Nome, Telefone, Plano selecionado, Cupom de desconto opcional).
*   **Saídas:** `invoiceUrl` (URL da fatura do Asaas para redirecionamento do cliente), registro da assinatura no gateway de pagamento.
*   **Dependências:** Gateway de pagamento Asaas (API v3), Frontend Next.js.
*   **Workflows:** Processado diretamente via API Route `/api/checkout` no Next.js (sem workflow do n8n).
*   **APIs Utilizadas:**
    *   Asaas `/customers` (Criação/busca do cliente).
    *   Asaas `/subscriptions` (Criação da assinatura mensal/anual).
    *   Asaas `/payments` (Busca da primeira fatura para extração de link).
*   **Testes:**
    *   Simular compra com cartão e Pix em modo sandbox.
    *   Testar aplicação do cupom mestre `KATHY100` (desconto de 100%).
    *   Validar redirecionamento automático para a página de sucesso após o preenchimento.

---

## M02 - Ativação
*   **Objetivo:** Provisionar o perfil do usuário e disparar a criação de sua infraestrutura dedicada de WhatsApp após a confirmação do pagamento.
*   **Entradas:** Webhook `PAYMENT_CONFIRMED` enviado pelo gateway Asaas.
*   **Saídas:** Criação do usuário no Supabase (`users`), requisição de inicialização de instância dedicada na Evolution API.
*   **Dependências:** Supabase Database, M03 (Evolution API).
*   **Workflows:** `ZapMonei: Ativação Pós-Pagamento (Completo)` (ID: `hny1Z8BTMqvcwlWR`).
*   **APIs Utilizadas:**
    *   Supabase SDK (Inserção do usuário).
    *   Evolution API `/instance/create` (Criação de instância privada).
    *   Evolution API `/settings/set` (Configuração de limites da instância).
    *   Evolution API `/instance/connect` (Definição de webhooks).
*   **Testes:**
    *   Simular recebimento de webhook `PAYMENT_CONFIRMED`.
    *   Verificar criação da instância com nome `zapmonei_{telefone}` e gravação de chaves de segurança na tabela `users`.
    *   Confirmar envio do primeiro WhatsApp de boas-vindas do bot de suporte (`Kathy`).

---

## M03 - Evolution
*   **Objetivo:** Gerenciar o pareamento e sincronização do dispositivo físico do usuário à sua instância dedicada de WhatsApp, monitorando a estabilidade da conexão.
*   **Entradas:** Comandos de menu respondidos pelo usuário no WhatsApp do suporte (Kathy), status de conexão de eventos da Evolution API.
*   **Saídas:** Envio de imagens de QR Code ou Pairing Code textual para o celular do usuário, alteração de status de pareamento na tabela `users`.
*   **Dependências:** Evolution API, M02 (Ativação).
*   **Workflows:** `ZapMonei_Onboarding_Kathy` (ID: `j3eyLr3P8yhJtslL`).
*   **APIs Utilizadas:**
    *   Evolution API `/instance/qr` (Geração de QR Code).
    *   Evolution API `/instance/pair` (Geração de pairing code de 8 dígitos).
    *   Evolution API `/instance/status` (Verificação de status da conexão).
    *   Evolution API `/send/text` & `/send/media` (Mensagens e imagens enviadas via Kathy).
*   **Testes:**
    *   Enviar "1" ou "2" no chat de suporte para acionar a geração de QR/Pairing.
    *   Testar loop de verificação de status (conectando com sucesso).
    *   Testar expiração de timeout de 5 minutos (mensagem de falha e novas opções).

---

## M04 - Onboarding
*   **Objetivo:** Conduzir a entrevista de boas-vindas do motorista no seu próprio bot de finanças, gerando o "Aha Moment" de cálculo de Lucro Real em menos de 60 segundos.
*   **Entradas:** Respostas textuais do motorista digitadas em sua própria instância do WhatsApp.
*   **Saídas:** Atualização de perfil de uso do motorista no banco de dados (`monthly_goal`, `agent_custom_name`, `is_driver`), primeira simulação de ganho/gasto bem-sucedida.
*   **Dependências:** M03 (Instância conectada), Supabase Database, M05 (Decision Engine).
*   **Workflows:** `ZapMonei: Onboarding do Usuário (Condicional Completo)` (ID: `pWzC99a3p7rCkqLr`).
*   **APIs Utilizadas:**
    *   Evolution API `/send/text`.
    *   Supabase SDK (atualizações de step e perfil).
*   **Testes:**
    *   Simular o fluxo de boas-vindas do zero.
    *   Verificar progressão de steps de 0 a 5 com o banco atualizando em tempo de execução.
    *   Testar respostas inesperadas (desvios de assunto) e a capacidade da IA de retornar ao fluxo original.

---

## M05 - Decision Engine
*   **Objetivo:** Roteador lógico de mensagens do WhatsApp para otimizar tempo de resposta e direcionar requisições para a tecnologia mais barata e correta.
*   **Entradas:** Payload bruto de mensagem recebida no webhook do WhatsApp (`MESSAGES_UPSERT`).
*   **Saídas:** Roteamento do fluxo para: Nível 1 (Respostas Rápidas), Nível 2 (Lançamento Financeiro), Nível 3 (Consultas SQL) ou Nível 4 (Diálogo Livre).
*   **Dependências:** Evolution API, n8n.
*   **Workflows:** `ZapMonei: Entrada de WhatsApp` (ID: `67YPm1nKSktXwXGW`).
*   **APIs Utilizadas:** Nenhuma API externa (roteamento feito via Javascript interno no n8n).
*   **Testes:**
    *   Enviar palavras-chave estáticas (*"ajuda"*, *"suporte"*) e verificar execução instantânea.
    *   Enviar frases de lançamento (*"ganhei 80"*) e verificar desvio para o Motor de IA.
    *   Enviar perguntas de agregação (*"quanto lucrei hoje"*) e verificar desvio para consultas.

---

## M06 - Finance Engine
*   **Objetivo:** Processar lançamentos financeiros de ganhos, gastos, realizar correções contextuais baseadas em conversas anteriores e ler fotos de cupons fiscais.
*   **Entradas:** Mensagens financeiras textuais, notas de voz (áudio) ou fotos de notas fiscais de postos enviadas pelo usuário.
*   **Saídas:** Gravação de transações na tabela `transactions`, resposta estruturada amigável no WhatsApp.
*   **Dependências:** M05 (Roteamento), Gemini API (JSON Mode), Supabase Database.
*   **Workflows:** 
    *   `ZapMonei: Motor de Inteligência Artificial` (ID: `XekB9YJ42IPtNg0Y`).
    *   `ZapMonei: Leitor de Recibos (OCR) - Versão Estável` (ID: `KAes31apBR0uuIBh`).
    *   `ZapMonei: Transcritor de Áudio` (ID: `5NwgAaUFTrAtFfkN`).
*   **APIs Utilizadas:**
    *   Gemini API (1.5 Flash para extração e 1.5 Vision para OCR).
    *   Supabase SDK (Insert em `transactions`).
    *   Evolution API (Envio de resposta final).
*   **Testes:**
    *   Lançar receitas com variação de gírias e plataformas (*"fiz 85 de Uber"*, *"ganhei 90 na 99"*).
    *   Lançar despesas com combustível, pedágio e alimentação.
    *   Mandar foto de nota fiscal de GNV e verificar leitura de valor e estabelecimento.
    *   Digitar uma correção (*"corrige o último pra 40"*) e verificar alteração no banco.

---

## M07 - Dashboard
*   **Objetivo:** Interface web minimalista para consulta consolidada de gráficos, relatórios e correções manuais de registros financeiros.
*   **Entradas:** Ações do usuário no frontend Next.js (modificar filtros, clicar em botões, editar formulários).
*   **Saídas:** Visualização dinâmica de lucros, gastos, gráficos de área e pizza, e listagem completa de extrato.
*   **Dependências:** Supabase Auth (Magic Links/Senha), Supabase RLS.
*   **Workflows:** Processado diretamente pelo frontend e rotas `/api/transactions` no Next.js.
*   **APIs Utilizadas:** Supabase client SDK (Consultas autenticadas por JWT).
*   **Testes:**
    *   Validar login e proteção de rotas com cookies no Middleware.
    *   Testar criação, edição e exclusão de transações pela interface.
    *   Verificar que um usuário A não consegue ler transações do usuário B ao forçar chamadas HTTP diretas (validação de RLS).

---

## M08 - Notificações
*   **Objetivo:** Engajar o usuário, reduzir abandono e enviar resumos semanais de faturamento e custos.
*   **Entradas:** Gatilhos temporais (Cron Job de 24h e semanal).
*   **Saídas:** Lembretes de lançamento no WhatsApp, e-mails de credenciais de login, relatórios de Raio-X semanal.
*   **Dependências:** Supabase Database, Evolution API, SMTP Email.
*   **Workflows:** `ZapMonei: Lembrete Ativo` (ID: `zQxxcCL7pgUrdUD7`).
*   **APIs Utilizadas:**
    *   Evolution API `/send/text`.
    *   SMTP API (Brevo/SendGrid).
*   **Testes:**
    *   Simular disparo cron do nudge diário às 21h (validar se ignora quem já lançou no dia).
    *   Gerar e disparar o Raio-X de sexta-feira contendo faturamento, despesa, depreciação acumulada e comparação percentual.

---

## M09 - Administração
*   **Objetivo:** Monitorar o status de funcionamento de toda a infraestrutura, registrar logs de auditoria e emitir alertas em caso de erro nos fluxos.
*   **Entradas:** Erros em nós do n8n, modificações de banco no Supabase.
*   **Saídas:** Registros em `audits`, alertas no canal Slack ou e-mail do administrador do sistema.
*   **Dependências:** n8n Error Trigger, Supabase SQL.
*   **Workflows:** Processado por sub-workflows de tratamento de erros no n8n.
*   **APIs Utilizadas:** Slack Webhook API.
*   **Testes:**
    *   Simular falha em uma API externa (ex: Gemini fora do ar) e verificar se o fluxo de erro notifica o administrador.
    *   Alterar um registro de transação direto no painel do Supabase e verificar criação automática de linha de auditoria na tabela `audits`.
