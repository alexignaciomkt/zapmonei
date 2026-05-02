# Plano de Implementação: Jornada do Cliente ZapMonei

Este plano detalha a automação da jornada do cliente, desde o pagamento até o primeiro uso do assistente.

## 1. Fluxo de Contratação & Ativação
**Objetivo:** Automatizar a criação do usuário e da infraestrutura de comunicação após o pagamento.

### [NEW] `workflows/ZapMonei_Ativacao_Pos_Pagamento.json`
- **Gatilho:** Webhook (Stripe/Mercado Pago/Hotmart).
- **Ações:**
  1. Validar status do pagamento.
  2. Criar/Atualizar usuário na tabela `users` do Supabase.
  3. Disparar a criação da instância no Evo-Go.

---

## 2. Automação de Infraestrutura (Evo-Go)
**Objetivo:** Garantir que cada motorista tenha sua própria instância sem intervenção manual.

### Integração com API Evo-Go
- **Endpoint:** `POST https://apigo.euattendo.com.br/instance/create`
- **Body:** `{ "instanceName": "zapmonei_user_id", "token": "..." }`
- **Webhook de Status:** Configurar para avisar o n8n quando o QR Code for lido.

---

## 3. Conexão & QR Code (Web App)
**Objetivo:** Facilitar a conexão do WhatsApp para o motorista.

### [MODIFY] `frontend/src/app/dashboard/settings/page.tsx`
- Criar seção "Conectar Assistente".
- Consumir API do Evo-Go para exibir o QR Code (Base64) em tempo real.
- Exibir status "Conectado" ou "Aguardando Leitura".

---

## 4. Onboarding & Primeiro Contato
**Objetivo:** Enviar a mensagem educativa assim que a conexão for estabelecida.

### [MODIFY] `workflows/ZapMonei_Onboarding_do_Usuario.json`
- **Mensagem Final:** Atualizar com a "Regra de Ouro" (O QUE + VALOR + TIPO).
- **Guia Visual:** Enviar um pequeno card ou imagem exemplificando o uso correto.

---

## Verificação & Testes
1. Simular um webhook de pagamento.
2. Verificar criação da instância no painel Evo-Go.
3. Testar a leitura do QR Code no Front-end.
4. Validar o recebimento da mensagem de boas-vindas no WhatsApp.
