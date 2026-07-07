# Documentação da API - ZapMonei V2

Este documento mapeia todas as rotas e contratos de API disponíveis no backend do ZapMonei V2.

---

## 🚦 Tabela de Endpoints

### 👤 Usuários (`/api/v1/users`)

| Método | Endpoint | Descrição | Payload (Entrada) | Resposta (Saída) |
|---|---|---|---|---|
| **GET** | `/` | Retorna metadados básicos de status da API. | *Nenhum* | `{"service": "ZapMonei API", "version": "2.0.0", "status": "online"}` (200 OK) |
| **GET** | `/health` | Validação ativa de integridade da API, Postgres e Redis. | *Nenhum* | `{"service": "ZapMonei API", "status": "healthy", "checks": { "api": "online", "postgres": "online", "redis": "online" }}` (200 OK) |
| **POST** | `/api/v1/users` | Cadastra ou atualiza dados de um motorista (upsert) baseado no número do WhatsApp. | Ver [Payload POST Usuários](#payload-post-apiv1users) | Ver [Resposta POST Usuários](#resposta-post-apiv1users) (201 Created / 200 OK) |
| **GET** | `/api/v1/users` | Busca dados do motorista utilizando Query String `?phone=`. | `?phone=5516982265352` (Obrigatório) | Ver [Resposta UserDTO](#resposta-padrao-userdto) (200 OK) |
| **GET** | `/api/v1/users/:id` | Consulta os dados cadastrais do motorista com base em seu ID do banco. | *Nenhum* | Ver [Resposta UserDTO](#resposta-padrao-userdto) (200 OK) |
| **PATCH** | `/api/v1/users/:id` | Atualiza dados gerais do motorista (`name`, `email`, `plan`) com base no ID. | Ver [Payload PATCH Dados](#payload-patch-dados-apiv1usersid) | Ver [Resposta UserDTO](#resposta-padrao-userdto) (200 OK) |
| **PATCH** | `/api/v1/users/:id/status` | Atualiza especificamente o status do onboarding do motorista com base no ID. | Ver [Payload PATCH Status](#payload-patch-status-apiv1usersidstatus) | Ver [Resposta UserDTO](#resposta-padrao-userdto) (200 OK) |

### 💰 Transações (`/api/v1/transactions`)

| Método | Endpoint | Descrição | Payload (Entrada) | Resposta (Saída) |
|---|---|---|---|---|
| **POST** | `/api/v1/transactions` | Registra uma nova movimentação financeira (ganho ou gasto). | Ver [Payload POST Transações](#payload-post-transacoes) | Ver [Resposta TransactionDTO](#resposta-padrao-transactiondto) (201 Created) |
| **GET** | `/api/v1/transactions/user/:userId` | Retorna o extrato/histórico de transações de um motorista específico. | *Nenhum* | Lista de `TransactionDTO` (200 OK) |

---

## 📯 Contratos de Payload e Resposta

### Resposta Padrão (UserDTO)
```json
{
  "success": true,
  "data": {
    "id": "e5b8d2a6-c7b9-40ea-9efc-fa8d4b3e6f9a",
    "name": "Carlos Silva",
    "whatsapp_number": "5516982265352",
    "plan": "piloto",
    "onboarding_status": "pending_kathy"
  }
}
```

### Resposta Padrão (TransactionDTO)
```json
{
  "success": true,
  "data": {
    "id": "2d1f4a8b-11d2-4328-971c-4b68e92fc91a",
    "user_id": "e5b8d2a6-c7b9-40ea-9efc-fa8d4b3e6f9a",
    "description": "Corrida Uber",
    "amount": 150.00,
    "type": "ganho",
    "date": "2026-07-01T23:38:00.000Z"
  }
}
```

---

### Detalhes de Endpoints (Usuários)

#### Payload POST (`/api/v1/users`)
```json
{
  "name": "Carlos Silva",
  "whatsapp_number": "+55 (16) 98226-5352",
  "email": "carlos@piloto.com",
  "plan": "piloto"
}
```

#### Resposta POST (`/api/v1/users`)
*   **201 Created:** Retornado caso o usuário seja criado pela primeira vez no banco.
*   **200 OK:** Retornado caso o usuário já existisse com o número do WhatsApp e tenha sido atualizado no upsert.

#### Payload PATCH Dados (`/api/v1/users/:id`)
*Todos os campos são opcionais, atualizando apenas os que forem repassados:*
```json
{
  "name": "Carlos Silva Atualizado",
  "email": "carlos.novo@piloto.com",
  "plan": "pro"
}
```

#### Payload PATCH Status (`/api/v1/users/:id/status`)
*Valores aceitos de status: `pending_kathy`, `waiting_connection`, `connected`, `pending_agent`, `active`, `blocked`.*
```json
{
  "onboarding_status": "connected"
}
```

---

### Detalhes de Endpoints (Transações)

#### Payload POST Transações (`/api/v1/transactions`)
```json
{
  "user_id": "e5b8d2a6-c7b9-40ea-9efc-fa8d4b3e6f9a",
  "description": "Posto Shell Gasolina",
  "amount": 80.00,
  "type": "gasto",
  "date": "2026-07-01T23:30:00.000Z"
}
```
*   `date` é opcional e, se omitido, assume o timestamp atual (`now()`).
*   `amount` deve ser um número positivo diferente de zero (os sinais são determinados pela propriedade `type`).

---

## ❌ Respostas de Erro (400 Bad Request / 404 Not Found / 500 Internal Error)
Todas as falhas estruturais, validações ou erros de banco seguem a mesma padronização de retorno:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PHONE",
    "message": "Telefone com quantidade de dígitos inválida."
  }
}
```
*Códigos de erros mapeados:*
*   `INVALID_NAME` (400): Nome ausente ou inválido.
*   `INVALID_PHONE` (400): WhatsApp inválido, mal formatado ou com dígitos errados.
*   `INVALID_EMAIL` (400): E-mail ausente ou sem `@`.
*   `INVALID_PLAN` (400): Plano ausente.
*   `INVALID_STATUS` (400): Status de onboarding não pertencente à lista permitida.
*   `INVALID_USER_ID` (400): ID de usuário inválido ou ausente.
*   `INVALID_AMOUNT` (400): Valor numérico ausente, zero ou mal formatado.
*   `INVALID_TYPE` (400): Tipo de transação inválido (deve ser "ganho" ou "gasto").
*   `BAD_REQUEST` (400): Chamadas incompletas ou parâmetros de query string obrigatórios ausentes.
*   `USER_NOT_FOUND` (404): ID ou telefone informado não encontrado na base de dados.
*   `DATABASE_ERROR` (500): Falha crítica interna no PostgreSQL da VPS.
