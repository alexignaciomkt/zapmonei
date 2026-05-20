# Guia de Integração WhatsApp (EvoGO) - ZapMonei

Este documento detalha a configuração do pipeline de onboarding via n8n para a infraestrutura EvoGO.

## 1. Credenciais Mestres
- **Base URL:** `https://apigo.euattendo.com.br`
- **Global API Key:** `0326ad2f6fcc4cb57e1e132812b1e1e1` (Usada APENAS para criar instâncias).

## 2. Fluxo de Onboarding (n8n)

### Passo 1: Criar Instância
- **Endpoint:** `POST /instance/create`
- **Auth:** Header `apikey` com a **Global API Key**.
- **Body:**
```json
{
  "name": "zapmonei_{{ whatsapp_number }}",
  "token": "{{ uuid_gerado_ou_id_supabase }}"
}
```

### Passo 2: Configurar Regras da Instância (Ignorar Grupos/Chamadas)
- **Endpoint:** `POST /settings/set/zapmonei_{{ whatsapp_number }}`
- **Auth:** Header `apikey` com a **Global API Key**.
- **Body:**
```json
{
  "rejectCall": true,
  "msgCall": "No momento só respondo por mensagens de texto e áudio! 💬",
  "ignoreGroups": true,
  "ignoreHistorics": true,
  "ignoreBroadcasts": true,
  "readMessages": true
}
```
*Isso é fundamental para economizar processamento e não sobrecarregar a Evolution API e o n8n com milhares de mensagens de grupos.*

### Passo 3: Configurar Webhook (VALIDADO ✅)
- **Endpoint:** `POST /instance/connect` ou `POST /webhook/set` (dependendo da versão da Evo)
- **Auth:** Header `apikey` com a **Global API Key**.
- **Header `instance`**: `zapmonei_{{ whatsapp_number }}`
- **Body (JSON Fixed):**
```json
{
  "webhookUrl": "https://webhook.euattendo.com.br/webhook/whatsapp/entrada",
  "enabled": true,
  "subscribe": ["MESSAGE", "CONNECTION", "QRCODE"]
}
```
- **Nota Crítica:** No n8n, use sempre a aba **Fixed** para o corpo do JSON para evitar erros de sintaxe de expressão. O campo de eventos DEVE se chamar `subscribe`.


## 3. Solução de Problemas
- **Erro 401 (Unauthorized):** Você está usando a Global Key em uma rota que exige o Token da Instância.
- **Erro 404 (Not Found):** A instância com o ID informado não foi encontrada ou a rota está mal escrita.
- **Identificação:** Use sempre o `id` (UUID) retornado pela API para operações de gerenciamento.

---
*Documento gerado em 07/05/2026 para registrar a solução dos erros 401/404 no pipeline de ativação.*
