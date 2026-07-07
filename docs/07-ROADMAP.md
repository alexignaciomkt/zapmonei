# 07 - Roadmap Projeto 100 (ZapMonei V2)

---

## 1. Visão do Roteiro
O objetivo deste roadmap é guiar o desenvolvimento focado em conquistar os **primeiros 100 clientes pagantes**. Funcionalidades secundárias foram eliminadas para manter foco total em **aquisição, ativação e retenção**.

---

## 2. Cronograma de Desenvolvimento

### 2.1 Fase 1: MVP (Lançamento Mínimo Seguro)
*Foco: Banco seguro, cobrança funcional, bot core de texto e suporte a edições.*
*   **Segurança:** Ativação obrigatória de políticas de RLS no Supabase.
*   **Core WhatsApp:** Fluxo básico de mensagem de texto → extração por IA → gravação no Supabase → retorno.
*   **Cobrança Real:** Ativação do webhook de pagamentos do Asaas (criação automática de conta de usuário pagante).
*   **Pareamento:** Onboarding da Kathy guiando conexão de QR Code ou Pairing Code.
*   **CRUD Básico:** Possibilidade do usuário editar e excluir lançamentos no dashboard web (correção de erros).
*   **Compliance:** Publicação de Termos de Uso e Política de Privacidade na landing page e checkout.

### 2.2 Sprint 2: Estabilização e Hábito
*Foco: Melhorar UX, evitar falhas e criar o ritual de retorno do usuário.*
*   **Idempotência:** Tratamento de `whatsapp_message_id` para impedir transações duplicadas causadas por retries de webhook.
*   **Nudges Ativos:** Lembretes de lançamento automáticos às 21h se o usuário não registrou nada no dia.
*   **Raio-X de Sexta:** Resumo semanal automático das finanças do motorista enviado no WhatsApp às sextas às 18h.
*   **Consultas WA:** Consultas rápidas de saldo e gastos diretamente por comandos simples no WhatsApp (*"quanto gastei hoje"*).
*   **Extrato Web:** Aba Extrato com paginação e filtros de categoria e período no painel web.
*   **Configurações:** Possibilidade de trocar nome de exibição e definir a meta de lucro líquido diário.

### 2.3 Sprint 3: Alavancas de Escala
*Foco: Otimizar o tempo e atrair novos clientes com indicações virais.*
*   **Referral (MGM):** Motorista indica 3 colegas pelo WhatsApp. Se eles começarem o teste, ele ganha +30 dias de assinatura.
*   **Áudios de Pista:** Transcrição de mensagens de voz curtas para o motorista lançar enquanto dirige.
*   **OCR de Recibos:** Envio de fotos de notas de abastecimento e processamento automatizado por IA Vision.
*   **Categorias Customizadas:** Criação e edição de categorias personalizadas via dashboard.

### 2.4 Futuro (Pós-100 clientes)
*Foco: Escala corporativa e funcionalidades de engajamento secundárias.*
*   **Gamificação:** Medalhas, streaks e ranking.
*   **PWA Nativo:** Instalação móvel e push notifications.
*   **Plano Pro Familiar:** Múltiplas conexões de WhatsApp compartilhando o mesmo painel.
*   **Memória Semântica:** Uso de pgvector para memorizar locais e hábitos repetidos.
