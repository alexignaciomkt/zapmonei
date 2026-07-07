# 03 - Banco de Dados (ZapMonei V2)

---

## 1. Modelo Entidade-Relacionamento

O banco de dados relacional (PostgreSQL no Supabase) é composto por 6 tabelas que organizam as transações, mensagens, categorias e perfis.

```
  +---------------+             +-----------------+
  |     users     | <─────────o |   categories    |
  +---------------+             +-----------------+
          |                              |
          |                              |
          v                              v
  +---------------+             +-----------------+
  |   messages    |             |  transactions   |
  +---------------+             +-----------------+
          |                              |
          v                              v
  +---------------+             +-----------------+
  |    audits     |             |   attachments   |
  +---------------+             +-----------------+
```

---

## 2. Dicionário de Tabelas

### 2.1 Tabela `users`
Armazena perfis e controle de onboarding/instância.
*   `id` (uuid, PRIMARY KEY): ID interno.
*   `auth_user_id` (uuid, UNIQUE): Vínculo com o Supabase Auth.
*   `whatsapp_number` (text, UNIQUE): Número de telefone formatado.
*   `nome` (text): Nome de exibição.
*   `plan` (text): Plano contratado (piloto, anual, familiar).
*   `whatsapp_instance_name` (text, UNIQUE): Nome da instância na Evolution.
*   `whatsapp_instance_token` (text): Token da instância.
*   `onboarding_status` (text): `pending_kathy` | `agent_onboarding` | `completed`.
*   `onboarding_step` (integer): Controle numérico da entrevista (0 a 5).
*   `agent_custom_name` (text): Nome personalizado do assistente de IA.
*   `control_type` (text): Tipo de controle (`trabalho`, `pessoal`, `ambos`).
*   `is_driver` (boolean): Flag se o perfil é motorista.
*   `monthly_goal` (numeric): Meta mensal de lucro líquido.

### 2.2 Tabela `categories`
Categorias do sistema.
*   `id` (uuid, PRIMARY KEY).
*   `nome` (text, NOT NULL): Nome amigável (ex: "Combustível").
*   `padrao_contexto` (text): `trabalho` | `pessoal` | `misto`.
*   `criada_por` (uuid, REFERENCES `users(id)`): Nulo para categorias globais do sistema.

### 2.3 Tabela `transactions`
Lançamentos financeiros de ganhos e gastos.
*   `id` (uuid, PRIMARY KEY).
*   `user_id` (uuid, REFERENCES `users(id)`, ON DELETE CASCADE).
*   `tipo` (text, NOT NULL): `ganho` | `gasto`.
*   `valor` (numeric(12,2), NOT NULL): Valor monetário positivo.
*   `categoria` (text): Nome da categoria extraída.
*   `contexto` (text): `trabalho` | `pessoal` | `misto`.
*   `descricao` (text): Texto descritivo opcional.
*   `ocorrencia_em` (timestamptz, NOT NULL): Data do evento financeiro.
*   `created_at` (timestamptz): Data de gravação no banco.

### 2.4 Tabela `messages`
Histórico de conversa do WhatsApp.
*   `id` (uuid, PRIMARY KEY).
*   `user_id` (uuid, REFERENCES `users(id)`, ON DELETE CASCADE).
*   `whatsapp_message_id` (text, UNIQUE): ID único do WhatsApp para idempotência.
*   `content` (text): Mensagem textual.
*   `role` (text): `user` | `assistant` | `system`.
*   `created_at` (timestamptz).

### 2.5 Tabela `attachments`
Imagens de recibos e notas fiscais.
*   `id` (uuid, PRIMARY KEY).
*   `transaction_id` (uuid, REFERENCES `transactions(id)`, ON DELETE CASCADE).
*   `url` (text, NOT NULL): URL assinada do Supabase Storage.

### 2.6 Tabela `audits`
Auditoria e logs de alteração.
*   `id` (uuid, PRIMARY KEY).
*   `entidade` (text, NOT NULL).
*   `entidade_id` (uuid, NOT NULL).
*   `acao` (text, NOT NULL): `create` | `update` | `delete`.
*   `payload_diff` (jsonb).

---

## 3. Segurança RLS Obrigatória
Nenhuma tabela financeira ou perfil de usuário pode ser exposta sem políticas ativas de RLS (Row Level Security).
*   **Regra Geral:** Um usuário autenticado (`auth.uid()`) só pode realizar operações (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) em registros cujo `user_id` seja correspondente ao seu perfil vinculado à tabela `users`.
