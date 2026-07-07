# 🗺️ Roadmap Projeto 100 — ZapMonei
### Funcionalidades Focadas em Aquisição, Ativação e Retenção

Este documento estabelece o roteiro de desenvolvimento do ZapMonei com o objetivo estrito de atingir os **primeiros 100 clientes pagantes**. A classificação é rigorosa: tudo que não reduz o churn (retenção), não acelera a indicação (aquisição) ou não gera o "Aha Moment" (ativação) foi empurrado para o futuro.

---

## 📊 Matriz de Priorização (Visão Geral)

```
┌─────────────────────────────────────────────────────────────────┐
│                      MATRIZ DE LANÇAMENTO                       │
├─────────────────────────────────────────────────────────────────┤
│ MVP (Dias 1-7)      │ Segurança, Core WhatsApp, Pagtos, CRUD    │
│ Sprint 2 (Dias 8-15)│ Idempotência, Nudges, Resumo WA, Extrato  │
│ Sprint 3 (Dias 16+) │ Indicações (MGM), Áudios, OCR de Notas    │
│ Futuro (Pós-100)    │ Gamificação, PWA, Plano Família, pgvector │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Fase 1: MVP (Lançamento Mínimo Seguro)
*Foco: Garantir que a engrenagem básica funcione sem vazamento de dados e cobrando de verdade.*

*   **🔒 Segurança RLS Ativada (Retenção/Confiança):**
    *   *O que é:* Ativação obrigatória de Row Level Security em todas as tabelas do Supabase. Um usuário jamais pode ver ou alterar transações de outro.
*   **💬 Registro Core via WhatsApp (Ativação):**
    *   *O que é:* Fluxo síncrono funcional: mensagem de texto → Gemini extrai → grava transação → bot responde confirmação.
*   **💳 Webhook de Cobrança Real Asaas (Aquisição):**
    *   *O que é:* O n8n recebe o status de confirmação real do Asaas e cria a conta do cliente de imediato, substituindo o bypass do cupom de testes.
*   **🔑 Onboarding Kathy & Pareamento (Ativação):**
    *   *O que é:* Conectar o próprio número via QR Code ou Pairing Code guiado pelo WhatsApp do suporte.
*   **✏️ Edição e Deleção de Transações no Dashboard (Retenção):**
    *   *O que é:* O usuário poder corrigir lançamentos errados na tela. Sem isso, um erro de interpretação da IA estraga permanentemente os relatórios dele.
*   **📄 Termos de Uso e Privacidade (Compliance):**
    *   *O que é:* Proteção legal básica contra incidentes envolvendo dados financeiros pessoais.

---

## 2. Sprint 2: Estabilização e Motor de Hábito
*Foco: Reduzir a fricção de uso e garantir que o motorista crie o hábito de lançar todo dia.*

*   **🛡️ Antiduplicação de Transações (Confiabilidade):**
    *   *O que é:* Idempotência baseada no `whatsapp_message_id`. Evita lançamentos em dobro caso a Evolution API repita o webhook devido a lentidão da IA.
*   **🔔 Lembrete Noturno - Proactive Nudge (Retenção):**
    *   *O que é:* Disparo automático às 21h se o usuário não registrou nada no dia: *"Rodou hoje, chefe? Me manda os valores que eu organizo."*
*   **📊 Relatório Semanal de Lucro no WhatsApp (Retenção):**
    *   *O que é:* Envio automático toda sexta-feira do consolidado da semana comparado com a semana anterior. O verdadeiro "Aha Moment" recorrente.
*   **🔍 Consultas Rápidas no Chat (Ativação):**
    *   *O que é:* O motorista digita *"resumo"* ou *"saldo"* e o bot responde no WhatsApp com o lucro do dia, sem precisar abrir o painel web.
*   **📑 Aba Extrato com Filtros no Dashboard (Retenção):**
    *   *O que é:* Visualização da lista completa de transações com filtros básicos por tipo (ganho/gasto) e data.
*   **⚙️ Aba de Configurações no Dashboard (Retenção):**
    *   *O que é:* Permite ao usuário editar seu nome de exibição e configurar sua meta de lucro diário pessoal (substituindo o padrão de R$ 300).

---

## 3. Sprint 3: Alavancas de Escala (Rumo aos 100 Clientes)
*Foco: Otimizar o tempo do motorista e usar a base atual para indicar novos clientes sem gastar em anúncio.*

*   **👥 Indicações no WhatsApp - Member Get Member (Aquisição):**
    *   *O que é:* Programa de indicação por chat. *"Indique 3 colegas de pista. Se eles começarem o teste grátis, você ganha +30 dias de uso grátis."*
*   **🎤 Transcrição de Áudios de Pista (Ativação/UX):**
    *   *O que é:* Processamento de notas de voz curtas via Whisper/Gemini Audio. Essencial para o motorista que registra enquanto dirige.
*   **📸 Leitor Multimodal de Cupons GNV/Gasolina (Ativação/UX):**
    *   *O que é:* Enviar foto do cupom do posto e a IA extrair valor e estabelecimento. Reduz o atrito no abastecimento.
*   **🏷️ Gestão de Categorias Customizadas (Retenção):**
    *   *O que é:* Interface no painel web para criar categorias personalizadas além do padrão de fábrica (ex: "Consórcio", "Prestações").

---

## 4. Futuro: Escala e Expansão (Pós-100 Clientes)
*Foco: Funcionalidades complexas ou de vaidade que exigem tempo de engenharia e não trazem tração inicial.*

*   **🎮 Gamificação (Streaks/Medalhas):**
    *   *O que é:* Medalhas por consistência financeira ou streaks de lançamentos.
*   **👪 Plano Pro Familiar (Multi-usuários):**
    *   *O que é:* Dashboards compartilhados e controle conjugal com múltiplos acessos de WhatsApp.
*   **🧠 Memória Semântica de Longo Prazo (pgvector RAG):**
    *   *O que é:* IA lembrar de hábitos profundos (ex: associar "posto do Zé" com a localização e valor de sempre).
*   **📲 Aplicativo PWA Nativo:**
    *   *O que é:* Notificações push no celular e armazenamento em cache offline.
