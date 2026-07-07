# Auditoria Técnica - Workflow M02 (Ativação Pós-Pagamento)
**Data da Auditoria:** 01 de Julho de 2026

Este documento detalha o levantamento técnico do workflow M02 do ZapMonei exatamente como ele está implementado hoje, sem nenhuma alteração.

---

# 1. Nome do Workflow
`ZapMonei: Ativação Pós-Pagamento (Completo)` (ID: `hny1Z8BTMqvcwlWR`)

---

# 2. Caminho do Trigger
O workflow é iniciado por um gatilho de webhook configurado no n8n com as seguintes especificações:
*   **URL do Webhook:** `/webhook/asaas-payment-webhook`
*   **Método HTTP:** `POST`
*   **Produção:** `https://<n8n-domain>/webhook/asaas-payment-webhook`
*   **Teste:** `https://<n8n-domain>/webhook-test/asaas-payment-webhook`
*   **Response Mode:** Respond Immediately (`"Workflow got started."`)

---

# 3. Payload esperado do Asaas
Apesar do nome do endpoint indicar Asaas, a estrutura do payload que o workflow processa e mapeia nos nós subsequentes é, na verdade, a do **WooCommerce** (Order Created/Completed webhook). O payload estrutural esperado possui os seguintes campos:

```json
{
  "body": {
    "billing": {
      "first_name": "Nome do Cliente",
      "cellphone": "16982265352"
    },
    "line_items": [
      {
        "name": "Nome do Plano / Produto"
      }
    ]
  }
}
```

---

# 4. Todos os Nodes

| Nome do Nó | Tipo | Função | Entrada | Saída |
| :--- | :--- | :--- | :--- | :--- |
| `Webhook: Pagamento Recebido` | `n8n-nodes-base.webhook` | Recebe a notificação de compra/pagamento | Requisição HTTP POST externa | Payload JSON com dados de compra do WooCommerce |
| `Supabase: Criar/Atualizar Usuário` | `n8n-nodes-base.supabase` | Insere ou atualiza o motorista no banco de dados com status `pending` | Payload bruto do webhook | Registro do usuário criado/atualizado com ID gerado (UUID) |
| `Evo-Go: Criar Instância` | `n8n-nodes-base.httpRequest` | Envia requisição para a Evolution API para instanciar o WhatsApp do usuário | UUID do usuário e número do WhatsApp | Token de API e nome da instância do WhatsApp gerada |
| `Supabase: Salvar Token` | `n8n-nodes-base.supabase` | Atualiza o registro do usuário com o token e nome da instância gerada | Retorno do nó de criação de instância | Registro do usuário atualizado no banco |
| `EvoGo: Configurar Webhook` | `n8n-nodes-base.httpRequest` | Configura o webhook de recebimento de mensagens na instância criada | Token e nome da instância atualizados | Resposta de confirmação de registro de webhook |
| `Kathy: Boas-Vindas` | `n8n-nodes-base.httpRequest` | Dispara a mensagem inicial com as opções de conexão | Dados do usuário e confirmação de webhook | Resposta de sucesso de envio de mensagem |

---

# 5. APIs chamadas

### WooCommerce / Asaas
*   **Endpoint:** Recebido no webhook inicial (gatilho).
*   **Finalidade:** Receber sinalização de faturamento para início do provisionamento do usuário.

### Supabase
*   **Endpoint (Tabela `users`):** Inserção/Atualização via n8n integration.
*   **Finalidade:** Criar o usuário no banco de dados e atualizar com os dados de instância de WhatsApp gerados posteriormente.

### Evolution API (EvoGO)
*   **Endpoint:** `POST https://apigo.euattendo.com.br/instance/create`
    *   **Finalidade:** Provisionar uma nova instância do WhatsApp para o usuário, nomeada com o prefixo `zapmonei_` + telefone e token correspondente ao ID do Supabase.
*   **Endpoint:** `POST https://apigo.euattendo.com.br/instance/connect`
    *   **Finalidade:** Configurar e registrar a URL do webhook do n8n (`/webhook/whatsapp/inbound`) para a instância recém-criada, escutando eventos de mensagens, status de conexão e QR Code.
*   **Endpoint:** `POST https://apigo.euattendo.com.br/send/text`
    *   **Finalidade:** Enviar a mensagem de boas-vindas do assistente Kathy contendo as opções interativas de leitura de QR Code.

---

# 6. Campos utilizados

*   `body.billing.first_name`: Mapeado como `nome` do usuário no banco Supabase e na mensagem de boas-vindas da Kathy.
*   `body.billing.cellphone`: Processado por uma expressão JS para limpar caracteres não-numéricos e adicionar prefixo `55`. Mapeado no campo `whatsapp_number` no Supabase e usado como destinatário do WhatsApp.
*   `body.line_items[0].name`: Mapeado como o plano do usuário (`plan`) na tabela `users`.
*   `id` (Supabase UUID): Utilizado como o token de autorização da instância (`token`) no nó `Evo-Go: Criar Instância`.
*   `whatsapp_number`: Usado para nomear a instância (`zapmonei_{{whatsapp_number}}`) e buscar/identificar o usuário.
*   `data.token` e `data.name` (Evolution API): Retornados do nó de criação de instância e salvos no Supabase como `whatsapp_instance_token` e `whatsapp_instance_name`.
*   `whatsapp_instance_token` e `whatsapp_instance_name` (Supabase): Utilizados no cabeçalho HTTP do nó `EvoGo: Configurar Webhook` para autenticar a conexão.

---

# 7. Escritas no banco

| Tabela | Operação | Campos gravados |
| :--- | :--- | :--- |
| `users` | Insert / Update | `nome`, `whatsapp_number` (normalizado), `plan`, `onboarding_status` (com o valor `'pending'`) |
| `users` | Update | `whatsapp_instance_token`, `whatsapp_instance_name` |

---

# 8. Chamadas para Evolution

### Criar Instância
*   **Endpoint:** `POST https://apigo.euattendo.com.br/instance/create`
*   **Header:** `apikey: 0326ad2f6fcc4cb57e1e132812b1e1e1` (Chave mestra de admin)
*   **Payload:**
    ```json
    {
      "name": "zapmonei_{{ $node[\"Supabase: Criar/Atualizar Usuário\"].json.whatsapp_number }}",
      "token": "{{ $node[\"Supabase: Criar/Atualizar Usuário\"].json.id }}"
    }
    ```

### Gerar Pairing
*   *Não aplicável:* Esta chamada não é realizada no workflow M02. É executada apenas no workflow `ZapMonei_Onboarding_Kathy`.

### Consultar Status
*   *Não aplicável:* Esta chamada não é realizada no workflow M02. É executada apenas no workflow `ZapMonei_Onboarding_Kathy`.

### Configurar Webhook (Conectar)
*   **Endpoint:** `POST https://apigo.euattendo.com.br/instance/connect`
*   **Headers:**
    *   `apikey: {{ $json.whatsapp_instance_token }}`
    *   `instance: {{ $json.whatsapp_instance_name }}`
*   **Payload:**
    ```json
    {
      "webhookUrl": "https://webhook.euattendo.com.br/webhook/whatsapp/inbound",
      "enabled": true,
      "subscribe": ["MESSAGE", "CONNECTION", "QRCODE"]
    }
    ```

### Enviar Mensagem
*   **Endpoint:** `POST https://apigo.euattendo.com.br/send/text`
*   **Header:** `apikey: 89e50abb-43db-4b99-ab45-3018e65430b5` (Token hardcoded)
*   **Payload:**
    ```json
    {
      "number": "{{ $('Supabase: Criar/Atualizar Usuário').item.json.whatsapp_number }}",
      "text": "👋 Olá, {{ $('Supabase: Criar/Atualizar Usuário').item.json.nome }}! Eu sou a *Kathy*..."
    }
    ```

---

# 9. Dependências

Para que o workflow execute corretamente, é necessário que:
1.  O servidor da Evolution API (EvoGO) esteja ativo e respondendo na URL `https://apigo.euattendo.com.br`.
2.  A API Key master (`0326ad2f6fcc4cb57e1e132812b1e1e1`) esteja válida na Evolution API.
3.  O token de boas-vindas (`89e50abb-43db-4b99-ab45-3018e65430b5`) esteja válido no servidor.
4.  O banco de dados Supabase esteja no ar com a tabela `public.users` e as credenciais n8n estejam válidas.
5.  O gateway de pagamento (WooCommerce / Asaas) esteja configurado para enviar webhooks no formato exato esperado de faturamento (com dados de `billing` e `line_items`).

---

# 10. Problemas encontrados

1.  ⚠️ **Incompatibilidade de Payload:** O webhook está configurado sob a rota `asaas-payment-webhook`, mas os mapeamentos de dados esperam o payload do **WooCommerce** (`body.billing`, `body.line_items`). Caso o Asaas faça o disparo diretamente (sem a intermediação do WooCommerce), o fluxo quebrará inteiramente nas etapas de extração.
2.  ⚠️ **Tokens de API Hardcoded:** Os tokens (`0326ad2f6fcc4cb57e1e132812b1e1e1` e `89e50abb-43db-4b99-ab45-3018e65430b5`) estão escritos de forma estática nos nós, o que viola boas práticas de segurança.
3.  ⚠️ **Prosseguimento sem Verificação de Erro:** O nó `Supabase: Criar/Atualizar Usuário` está com `retryOnFail: true` e `onError: continueRegularOutput`. Se a inserção falhar e não gerar o UUID do usuário, o n8n avançará mesmo assim, gerando falhas nos nós seguintes de criação de instância.
4.  ⚠️ **Tratamento Simplista de Telefone:** A higienização de telefone apenas remove caracteres não-numéricos e assume o DDI `55` se o número tiver 10 ou 11 caracteres. Caso o telefone inserido pelo usuário seja de outro país ou possua tamanho incorreto, o fluxo não possui tratamento de falha.

---

# 11. Melhorias possíveis

1.  **Centralização de Credenciais:** Migrar todas as chaves de API expostas em headers para o gerenciador de credenciais seguras do n8n.
2.  **Roteador de Gateway:** Criar uma etapa inicial com Switch para analisar o payload de entrada (identificando se veio do WooCommerce ou diretamente do Asaas) e normalizar os campos antes de enviar para o Supabase.
3.  **Tratamento de Exceções:** Configurar o nó do Supabase para interromper a execução do workflow e disparar um alerta no Slack em caso de falha de gravação (evitando chamadas inúteis de criação de instâncias sem ID).
