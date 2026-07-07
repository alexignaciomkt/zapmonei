# 04 - Integrações (ZapMonei V2)

---

## 1. Gateway de Pagamento: Asaas

O Asaas gerencia o fluxo de faturamento do SaaS (Pix, Cartão e Boleto).

### 1.1 Fluxo de Compra
1.  O cliente insere nome e celular no checkout do dashboard.
2.  A API `POST /api/checkout` cria o cliente no Asaas (`/customers`) e em seguida gera a assinatura (`/subscriptions`).
3.  O Asaas retorna o link da fatura (`invoiceUrl`).
4.  O dashboard redireciona o usuário para o link.

### 1.2 Webhook de Ativação
*   **Evento cadastrado no Asaas:** `PAYMENT_CONFIRMED`
*   **Destino:** `https://webhook.euattendo.com.br/webhook/asaas-payment-webhook` (n8n)
*   **Ação:** Ao receber a confirmação de pagamento, o n8n executa a ativação pós-pagamento (criação de instância, banco e início do onboarding).

---

## 2. API de WhatsApp: Evolution API (EvoGO)

A Evolution API conecta o sistema à rede do WhatsApp.

### 2.1 Configurações de Instância Privada
*   **Criação:** Cada usuário possui sua própria instância nomeada como `zapmonei_{whatsapp_number}`.
*   **Configuração de Regras (Settings):** Para reduzir custos operacionais de processamento, as seguintes regras são aplicadas no cabeçalho de criação de toda instância:
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
*   **Webhook da Instância:** A URL de webhook para escuta de mensagens de cada instância deve apontar para: `https://webhook.euattendo.com.br/webhook/whatsapp/inbound` e subscrever os eventos `MESSAGES_UPSERT` e `CONNECTION_UPDATE`.
