# 📘 Guia Operacional ZapMonei: n8n Masterclass

Este guia detalha os 4 fluxos configurados no n8n. Cada fluxo tem um papel vital na jornada do motorista, desde o "Oi" inicial até a gravação da corrida no banco de dados.

---

## 🔗 Visão Geral da Arquitetura
O ZapMonei funciona como um sistema de pecinhas conectadas:
1.  **Entrada de WhatsApp:** O receptor (Ouvido).
2.  **Onboarding do Usuário:** O recepcionista (Boas-vindas).
3.  **Motor de IA:** O contador (Inteligência Financeira).
4.  **Proactive Nudge:** O assistente (Lembrete ativo).

---

## 1. Fluxo: Entrada de WhatsApp (ID: MIgvCgspwNcBqYUS)
*Onde tudo começa. Ele decide se manda o usuário para o Onboarding ou para a IA.*

### 📍 Nós e Configurações Principais:
- **Entrada do WhatsApp (Webhook):** 
  - **URL de Produção:** `https://autoapi.gigante.com.br/webhook/whatsapp/inbound`
  - **URL de Teste:** `https://autoapi.gigante.com.br/webhook-test/whatsapp/inbound`
- **Buscar Usuário pelo WhatsApp (Supabase):** Busca na tabela `users` usando o número de quem mandou a mensagem.
- **Está em Onboarding? (If):** Se o motorista ainda não completou o cadastro, ele é desviado para o fluxo de entrevista.
- **Iniciar Motor de IA (NLP):** Se for um motorista antigo, o texto vai para o processamento financeiro.

---

## 2. Fluxo: Onboarding do Usuário (ID: 9isljiCxkbeAagiJ)
*Gerencia a conversa inicial e personalização do assistente.*

### 📍 Nós e Configurações Principais:
- **Roteador de Etapas (Switch):** Controla se a IA deve enviar as boas-vindas ou se deve salvar o nome que o motorista acabou de escolher.
- **Salvar Nome do Assistente (Supabase):** Grava na tabela `users` o campo `agent_name_pref` e marca o onboarding como `completed`.
- **Msg: Pronto para Uso (HTTP Request):** Manda a mensagem final confirmando que o sistema está pronto.

---

## 3. Fluxo: Motor de IA (ID: J2qTlfOlhEYUBdEQ)
*O coração inteligente do sistema.*

### 📍 Nós e Configurações Principais:
- **Cérebro Gemini (Google Gemini Chat Model):** Configurado com `gemini-1.5-flash`.
- **Análise Financeira (IA Agent):** Onde está o "prompt" mestre que ensina a IA a extrair GANHOS e GASTOS em formato JSON.
- **Gravar Transação no Banco (Supabase):** Grava na tabela `transactions` os dados extraídos (valor, tipo, categoria).

---

## 4. Fluxo: Proactive Nudge (ID: a4iNB7OpySxxW0Wv)
*O lembrete automático de 1 hora.*

### 📍 Nós e Configurações Principais:
- **Gatilho por Horário (Schedule):** Roda a cada 1 hora.
- **Buscar Usuários Ativos (Supabase):** Filtra motoristas com onboarding completo.
- **Criador de Lembrete (IA Agent):** Gera uma frase curta para perguntar se houve ganhos novos.

---

## 🔑 Checklist de Credenciais (Setup Manual)

Para os fluxos funcionarem, verifique no painel do n8n:
1.  **Supabase account:** Conectada com sua URL e Service Role Key.
2.  **Google Gemini(Ai):** Conectada com sua API Key do Google Studio.
3.  **Configuração EvoGO:** Em todos os nós de "Msg" ou "Enviar Resposta", certifique-se que o header `apikey` está com o valor `0326ad2f6fcc4cb57e1e132812b1e1e1`.

---

> 📝 **Nota:** Este documento serve como referência para manutenção e expansão do ZapMonei.
