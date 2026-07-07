# Relatório Completo — Fluxo M02: Ativação Pós-Pagamento

> **Status:** ✅ CONCLUÍDO E EM PRODUÇÃO  
> **Data de conclusão:** 03/07/2026  
> **Workflow n8n:** `hny1Z8BTMqvcwlWR`  
> **URL do workflow:** https://auto.euattendo.com.br/workflow/hny1Z8BTMqvcwlWR

---

## 1. Objetivo

Migrar o fluxo de ativação pós-pagamento do ZapMonei para utilizar a nova API Express (ZapMonei API V2), eliminando completamente o Supabase do processo de onboarding dos motoristas.

---

## 2. Infraestrutura Implantada

### 2.1 Backend (ZapMonei API)

| Item | Detalhe |
|---|---|
| **Linguagem** | TypeScript + Express |
| **ORM** | Prisma 5.22 |
| **Banco de Dados** | PostgreSQL (banco `zapmonei`, VPS) |
| **Cache** | Redis (VPS, rede interna Docker) |
| **Container** | Docker (Debian Slim + OpenSSL) |
| **Imagem Docker Hub** | `a2system/zapmoneiapi:latest` |
| **Repositório GitHub** | https://github.com/alexignaciomkt/zapmoneiapi.git |
| **Porta** | 3000 |
| **Rede Docker** | `automacoes` (compartilhada com n8n, Redis, Postgres) |

### 2.2 Stack do Portainer (Docker Swarm)

```yaml
version: '3.8'

services:
  zapmonei-api:
    image: a2system/zapmoneiapi:latest
    ports:
      - "3000:3000"
    networks:
      - automacoes
    deploy:
      mode: replicated
      replicas: 1
      restart_policy:
        condition: on-failure
      placement:
        constraints:
          - node.role == manager
    environment:
      - PORT=3000
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:euattendo010203@postgres:5432/zapmonei?schema=public
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=euattendo010203
      - EVOLUTION_URL=https://apigo.euattendo.com.br
      - EVOLUTION_MASTER_KEY=<chave>
      - GOOGLE_GEMINI_API_KEY=<chave>
      - ASAAS_API_KEY=<chave>

networks:
  automacoes:
    external: true
    name: automacoes
```

### 2.3 Tabelas Criadas no PostgreSQL (`zapmonei`)

| Tabela | Descrição |
|---|---|
| `User` | Motoristas cadastrados (nome, telefone, plano, status de onboarding, credenciais da instância WhatsApp) |
| `Transaction` | Lançamentos financeiros (ganhos e gastos) |
| `Audit` | Registro de auditoria |

---

## 3. Endpoints da API Utilizados pelo Fluxo

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/users` | Criar ou atualizar motorista (upsert por `whatsapp_number`) |
| `PATCH` | `/api/v1/users/:id` | Atualizar dados do motorista (ex: salvar token da instância WhatsApp) |
| `PATCH` | `/api/v1/users/:id/status` | Atualizar status de onboarding |
| `GET` | `/health` | Health check da API |

### Formato de Resposta Padrão

```json
{
  "success": true,
  "data": {
    "id": "652fca21-e18b-46bb-9660-ab34ff226e71",
    "name": "Alexsandro",
    "whatsapp_number": "5516982265352",
    "plan": "ZapMonei - Plano Mensal",
    "onboarding_status": "pending_kathy"
  }
}
```

> **Nota:** Campos sensíveis como `whatsapp_instance_token` e `whatsapp_instance_name` são persistidos no banco mas **nunca** são expostos no DTO de resposta.

---

## 4. Fluxo do Workflow M02 no n8n

```
[Webhook: Pagamento Recebido]
         │  POST asaas-payment-webhook
         ▼
[API: Criar/Atualizar Usuário]
         │  POST http://zapmonei-api:3000/api/v1/users
         │  Upsert por whatsapp_number
         ▼
[Evo-Go: Criar Instância]
         │  POST https://apigo.euattendo.com.br/instance/create
         │  Cria instância WhatsApp na Evolution API
         ▼
[API: Salvar Token]
         │  PATCH http://zapmonei-api:3000/api/v1/users/:id
         │  Persiste whatsapp_instance_name e whatsapp_instance_token
         ▼
[API: Atualizar Status]
         │  PATCH http://zapmonei-api:3000/api/v1/users/:id/status
         │  Status → waiting_connection
         ▼
[EvoGo: Configurar Webhook]
         │  POST https://apigo.euattendo.com.br/instance/connect
         │  Configura webhook de mensagens/conexão/QR Code
         ▼
[Kathy: Boas-Vindas]
         │  POST https://apigo.euattendo.com.br/send/text
         │  Envia mensagem formatada pelo WhatsApp
         ▼
       ✅ FIM
```

---

## 5. Mensagem da Kathy (WhatsApp)

A mensagem de boas-vindas enviada ao motorista após a ativação do plano:

> 👋 **Olá, {nome}!**
>
> Eu sou a **Kathy**, a chefe dos assistentes aqui no **ZapMonei**! ✅
>
> 💰 Seu plano foi ativado com sucesso e estou preparando o seu assistente financeiro pessoal! 🤖✨
>
> 📲 Para conectá-lo, você vai precisar **escanear um QR Code**.
>
> Como eu não sei se você está no celular ou no computador, me diga:
>
> **Como você prefere receber o QR Code?**
>
> 1️⃣ **Pelo Computador**
> _Vou mandar o código aqui mesmo_
>
> 2️⃣ **Por Outro Aparelho**
> _Vou mandar para outro Zap seu ou de um amigo_

---

## 6. Problemas Resolvidos Durante a Implantação

| # | Problema | Causa | Solução |
|---|---|---|---|
| 1 | `ECONNREFUSED ::1:3000` | n8n tentava conectar em localhost (que é o próprio container) | Deploy da API na VPS + comunicação via rede Docker interna (`zapmonei-api:3000`) |
| 2 | `libssl.so.1.1 not found` | Alpine Linux não possui OpenSSL 1.1 para o Prisma | Troca do Dockerfile de `node:20-alpine` para `node:20-slim` (Debian) |
| 3 | `DATABASE_ERROR 500` | Tabelas não existiam no PostgreSQL | Executado `npx prisma db push` dentro do container |
| 4 | Tabelas criadas no banco errado | DATABASE_URL apontava para banco `postgres` ao invés de `zapmonei` | Corrigido para `postgresql://postgres:...@postgres:5432/zapmonei?schema=public` |
| 5 | `\n\n` aparecendo como texto no WhatsApp | Escape duplo de quebras de linha no JSON do n8n | Corrigido para usar `\\n` no JSON (que o parser converte em `\n` real) |
| 6 | Docker push para conta errada | Docker Desktop logado na conta `gbacentrotecnico` | Logout + login na conta `a2system` |

---

## 7. Pipeline de Deploy

```
Código Local (IDE)
       │
       ▼
   git commit
       │
       ▼
   git push → GitHub (alexignaciomkt/zapmoneiapi)
       │
       ▼
   docker build -t a2system/zapmoneiapi:latest .
       │
       ▼
   docker push → Docker Hub (a2system/zapmoneiapi)
       │
       ▼
   Portainer → Pull latest image → Redeploy Stack
       │
       ▼
   ✅ API em Produção na VPS
```

---

## 8. Arquivos do Backend

```
backend/
├── .env.example
├── .gitignore
├── Dockerfile                          # Debian Slim + OpenSSL
├── docker-compose.dev.yml              # Dev local (Redis + App)
├── package.json
├── prisma/
│   └── schema.prisma                   # User, Transaction, Audit
├── src/
│   ├── index.ts                        # Entry point Express
│   ├── config/
│   │   ├── database.ts                 # Prisma Client
│   │   ├── logger.ts                   # Winston Logger
│   │   ├── minio.ts                    # MinIO Client
│   │   └── redis.ts                    # Redis (ioredis)
│   ├── constants/
│   │   ├── onboarding.ts               # Estados do onboarding
│   │   ├── plans.ts                    # Planos disponíveis
│   │   └── transaction-types.ts        # Tipos de transação
│   ├── controllers/
│   │   ├── health.controller.ts        # GET /health
│   │   └── root.controller.ts          # GET /
│   ├── users/
│   │   ├── controller.ts               # createUser, updateUser, findByPhone, updateStatus
│   │   └── mapper.ts                   # toUserDTO (omite campos sensíveis)
│   ├── transactions/
│   │   ├── controller.ts               # createTransaction, getByUserId
│   │   └── mapper.ts                   # toTransactionDTO
│   ├── ai/
│   │   ├── intent.parser.ts            # Gemini JSON Mode (classificação de intenções)
│   │   └── context.builder.ts          # Cache de conversas no Redis
│   ├── routes/
│   │   ├── index.ts                    # Router principal
│   │   └── internal/
│   │       ├── users.ts                # Rotas de usuários
│   │       ├── transactions.ts         # Rotas de transações
│   │       ├── onboarding.ts           # Rotas de onboarding
│   │       ├── payments.ts             # Rotas de pagamentos
│   │       └── webhooks.ts             # Rotas de webhooks
│   ├── integrations/
│   │   ├── asaas.ts                    # Gateway de pagamentos
│   │   ├── evolution.ts                # Evolution API
│   │   ├── gemini.ts                   # Google Gemini
│   │   └── woocommerce.ts              # WooCommerce
│   └── lib/
│       └── phone.ts                    # Normalização de telefone
└── tsconfig.json
```

---

## 9. Workflows no n8n (Inventário Completo)

| # | Workflow | ID | Status | Migrado? |
|---|---|---|---|---|
| 1 | Ativação Pós-Pagamento (Completo) | `hny1Z8BTMqvcwlWR` | ✅ Ativo | ✅ **Concluído** |
| 2 | Entrada de WhatsApp | `67YPm1nKSktXwXGW` | 🟢 Ativo | ⏳ Pendente |
| 3 | Onboarding_Kathy | `j3eyLr3P8yhJtslL` | 🟢 Ativo | ⏳ Pendente |
| 4 | Onboarding do Usuário (Condicional) | `pWzC99a3p7rCkqLr` | 🟢 Ativo | ⏳ Pendente |
| 5 | Motor de Inteligência Artificial | `XekB9YJ42IPtNg0Y` | 🟢 Ativo | ⏳ Pendente |
| 6 | Leitor de Recibos (OCR) | `KAes31apBR0uuIBh` | 🟢 Ativo | ⏳ Pendente |
| 7 | Transcritor de Áudio | `5NwgAaUFTrAtFfkN` | 🟢 Ativo | ⏳ Pendente |
| 8 | Proactive Nudge | `zQxxcCL7pgUrdUD7` | 🔴 Inativo | ⏳ Pendente |

---

## 10. Próximos Passos

1. **Migrar o fluxo de Entrada de WhatsApp** (`67YPm1nKSktXwXGW`) — Processar respostas dos motoristas.
2. **Migrar o Onboarding da Kathy** (`j3eyLr3P8yhJtslL`) — Pareamento do QR Code e conexão do WhatsApp.
3. **Configurar domínio** `controle.zapmonei.com.br` — Painel administrativo para dashboard, central de atendimento e suporte.
4. **Configurar CI/CD** — Automatizar o pipeline GitHub → Docker Hub → Portainer com GitHub Actions.
