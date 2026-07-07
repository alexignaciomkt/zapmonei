# M02 - Ativação Pós Pagamento

## Objetivo

Transformar um pagamento confirmado em um usuário completamente operacional no ZapMonei.

---

# Fluxo

## Passo 01
**Evento recebido:** Asaas  
**Evento esperado:** `PAYMENT_CONFIRMED`  
*Se qualquer outro evento chegar:* Encerrar workflow.

---

## Passo 02
**Extrair:**
*   `payment.id`
*   `payment.externalReference`
*   `customer`
*   `value`
*   `billingType`

---

## Passo 03
**Consultar WooCommerce:**
Usar `externalReference` como número do pedido.  
**Obter:**
*   `nome`
*   `telefone`
*   `email`

---

## Passo 04
**Validar:**  
*Existe usuário?*  
*   **SIM:** Atualizar assinatura.
*   **NÃO:** Criar usuário.

---

## Passo 05
**Provisionamento:**  
Criar instância Evolution.  
**Salvar:**
*   `instance_name`
*   `api_key`
*   `instance_id`

---

## Passo 06
**Gerar Pairing Code:**  
Salvar no perfil do usuário.

---

## Passo 07
**Enviar WhatsApp:**  
Mensagem:
```
Bem-vindo ao ZapMonei.

Sua conta já está pronta.

Seu código de conexão é:

XXXXXX
```

---

## Passo 08
**Registrar auditoria:**  
Gravar log na tabela `audits`.

---

## Resultado esperado
*   Usuário ativo.
*   Instância criada.
*   WhatsApp pronto.
*   Nenhuma intervenção humana.

---

# Especificações Técnicas (Padrão V2)

### Entradas
*   Webhook payload do Asaas contendo evento de pagamento e referências.

### Saídas
*   Instância ativa na Evolution API.
*   Código de pareamento gerado e enviado.
*   Registro do usuário salvo no Supabase com status de onboarding inicial.

### Dependências
*   M01 - Checkout (WooCommerce/Asaas).
*   M03 - Evolution (Evolution API).
*   Banco de Dados Supabase (tabelas `users`, `audits`).

### Workflows
*   **Nome:** M02 - Ativação
*   **Versão:** 1.0
*   **Status:** Produção
*   **n8n JSON Path:** `workflows/M02-Ativacao.json` (Futuro)

### APIs Utilizadas
*   WooCommerce REST API (`GET /wp-json/wc/v3/orders/{{ id }}`)
*   Evolution API (`POST /instance/create`, `POST /instance/pair`, `POST /settings/set`)
*   Supabase REST API (Insert/Update `users`, Insert `audits`)

### Testes
*   Simular evento `PAYMENT_CONFIRMED` via webhook local.
*   Validar se o fluxo consome o id do pedido no WooCommerce.
*   Validar tratamento de erro caso a Evolution API retorne fora do ar (sistema deve registrar falha e tentar novamente).
