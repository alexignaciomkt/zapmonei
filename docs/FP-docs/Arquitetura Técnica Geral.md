# Arquitetura Técnica Geral — Sistema de Gestão Financeira para Motoristas de Aplicativo

## 1. Visão Geral da Arquitetura

Este documento descreve a arquitetura técnica do sistema, detalhando os componentes, fluxos de dados, integrações e decisões de design. A arquitetura segue o modelo de **microserviços léger** com processamento assíncrono via n8n, utilizando o Supabase como backend principal e a Evolution API (EvoGO) para integração com WhatsApp.

---

## 2. Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USUÁRIO (Motorista)                              │
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                   │
│  │  WhatsApp   │    │  PWA/Web    │    │   Upload    │                   │
│  │  (ZAP)      │    │  Dashboard  │    │   Notas     │                   │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                   │
└─────────┼───────────────────┼───────────────────┼───────────────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE ENTRADA                                 │
│                                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐                    │
│  │   Evolution API     │    │    Cloudflare       │                    │
│  │   (EvoGO WhatsApp)  │    │    Workers /       │                    │
│  │   Webhook Inbound   │    │    CDN            │                    │
│  └──────────┬─────────┘    └──────────────────────┘                    │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                          n8n (Orquestrador)                          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Workflow: WhatsApp Inbound → Parse → NLP → OCR → Transaction  │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └���─────────────────────────────────┬───────────────────────────────────┘ │
└──────────────────────────────────────┼─────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE BACKEND                                 │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │    Supabase     │  │    Supabase     │  │  Bucket S3     │           │
│  │  (PostgreSQL)   │  │    (Auth)      │  │  (Storage)     │           │
│  └────────┬────────┘  └─────────────────┘  └─────────────────┘           │
│           │                                                           │
│           ▼                                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                    API Layer (Edge Functions)                         │ │
│  │   - POST /api/transactions                                         │ │
│  │   - GET  /api/summary                                           │ │
│  │   - POST /api/webhooks/whatsapp                                 │ │
│  │   - GET  /api/messages                                         │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CAMADA DE INTELIGÊNCIA                              │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │    NLP/NER     │  │      OCR        │  │   AI/LLM       │           │
│  │  (Extração de   │  │  (Leitura de    │  │  (Classific.   │           │
│  │   entidades)   │  │   notas fiscais)│  │   avançada)    │           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└───────────────────────────────���─────────────────────────────────────────────┘
```

---

## 3. Componentes Principais

### 3.1 Supabase (Backend as a Service)

O Supabase atua como o núcleo do sistema, fornecendo:

| Componente | Função | Detalhes |
|------------|--------|----------|
| **PostgreSQL** | Banco de dados principal | Todas as entidades (users, transactions, messages, categories, attachments, audits) |
| **Auth** | Autenticação de usuários | Magic links via WhatsApp, JWT tokens |
| **Storage** | Armazenamento de imagens | Notas fiscais, comprovantes |
| **Edge Functions** | API serverless | Processamento de requisições API |
| **Realtime** | Websockets | Atualização em temporeal do dashboard |
| **Row Level Security** | Segurança em nível de linha | Isolamento de dados por usuário |

#### Estrutura de Tabelas (resumo)

```sql
-- Principais tabelas
users          -- Perfis dos motoristas
transactions  -- Lançamentos financeiros
messages      -- Mensagens recebidas via WhatsApp
categories    -- Categorias de gastos/ganhos
attachments   -- Imagens de notas fiscais
audits        -- Log de auditoria
```

### 3.2 Evolution API (EvoGO)

A Evolution API é um fork daEvolution APIoriginal, utilizada para integração com WhatsApp:

| Recurso | Descrição |
|--------|------------|
| **Webhook Inbound** | Recebe mensagens do WhatsApp |
| **Webhook Outbound** | Envia confirmações ao usuário |
| **Instance Management** | Gerencia instâncias do WhatsApp |
| **Media Download** | Baixa imagens e áudio |
| **Sending Messages** | Envia texto, botões, templates |

#### Configuração Recomendada

```
URL: http://evolution-api:8080
API Key: ххххххххххххххххххх
Instance: motorhub-worker-{id}
```

### 3.3 n8n (Orquestrador de Automação)

O n8n é responsável por todo o fluxo de processamento:

| Workflow | Função |
|----------|--------|
| **WhatsApp Inbound** | Recebe webhook da Evolution API |
| **Message Parser** | Normaliza payload da mensagem |
| **OCR Handler** | Envia imagem para processamento OCR |
| **NLP Engine** | Extrai entidades (valor, categoria) |
| **Transaction Creator** | Cria transação no Supabase |
| **Confirmation Sender** | Envia resposta ao usuário |
| **Reminder Workflow** | Envia lembretes periódicos |
| **Error Handler** | Captura e notifica falhas |

---

## 4. Fluxos de Dados

### 4.1 Fluxo Principal: Recebimento de Mensagem

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  WhatsApp   │────▶│  Evolution  │────▶│    n8n      │────▶│  Supabase   │
│  Usuário   │     │    API     │     │  Workflow   │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      │                                        ▼
      │                               ┌─────────────────────┐
      │                               │    WhatsApp        │
      └─────────────────────────────▶│   Confirmação      │
                                      └─────────────────────┘
```

#### Passo a Passo Detalhado

1. **Usuário envia mensagem** no WhatsApp
2. **Evolution API recebe** via webhook
3. **n8n captura** o webhook `/whatsapp/inbound`
4. **Normaliza payload** (extrai texto, mídia, metadata)
5. **Verifica duplicata** (idempotência)
6. **Salva mensagem** na tabela `messages`
7. **Se imagem**: baixa → faz upload no Supabase Storage → dispara OCR
8. **Executa NLP/NER** (extrai valor, categorize)
9. **Cria transação** em modo "draft" na tabela `transactions`
10. **Envia confirmação** ao usuário via Evolution API
11. **Usuário confirma** → transação muda para "confirmed"

### 4.2 Fluxo de Upload de Nota Fiscal

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Foto da   │     │  Evolution  │     │    n8n     │     │  Supabase   │
│    Nota     │────▶│    API     │────▶│  Download  │────▶│   Storage   │
└─────────────┘     └─────────────┘     │    Media   │     └─────────────┘
                                        └─────────────┘
                                             │
                                             ▼
                                        ┌─────────────┐
                                        │  OCR API   │
                                        │ (Vision)  │
                                        └─────────────┘
                                             │
                                             ▼
                                        ┌─────────────┐
                                        │    n8n     │
                                        │  Extract   │
                                        └─────────────┘
```

### 4.3 Fluxo de Consulta (Dashboard)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PWA/Web   │────▶│ Supabase   │────▶│   Edge     │────▶│  Resposta  │
│  Dashboard │     │   Query    │     │  Function  │     │   JSON     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

---

## 5. Decisões Arquiteturais

### 5.1 Por Que Essa Stack?

| Decisão | Motivação |
|--------|----------|
| **Supabase** | PostgreSQL gerenciado, auth built-in, storage, realtime — tudo em um |
| **n8n** | Workflows visuais, fácil manutenção, grande comunidade |
| **Evolution API** | Alternativa open-source à Twilio, boa integração com n8n |
| **Edge Functions** | Baixa latência, escala automática |
| **PWA** | Sem necessidade de app store, instalação facilitada |

### 5.2 Padrões Utilizados

| Padrão | Aplicação |
|--------|----------|
| **Idempotência** | WhatsApp message ID único previne duplicatas |
| **Event Sourcing** | Tabela `messages` preserva original para reprocessamento |
| **CQRS** | Leitura separada (dashboard) da escrita (transações) |
| **Async Processing** | OCR e NLP rodam assíncronos |
| **Circuit Breaker** | n8n com retry e DLQ para falhas |

### 5.3 Camadas de Segurança

| Camada | Implementação |
|--------|------------|
| **Transporte** | HTTPS/TLS |
| **API** | API Keys, JWT |
| **Banco** | RLS (Row Level Security) |
| **Armazenamento** | URLs assinadas (presigned) |
| **WhatsApp** | HMAC signature verification |

---

## 6. Infraestrutura Recomendada

### 6.1 Ambiente de Produção

| Serviço | Especificação | Provedor |
|---------|-------------|----------|
| **Supabase** | Pro Plan (PostgreSQL 2GB RAM) | supabase.com |
| **n8n** | 2 vCPU, 4GB RAM, 20GB SSD | Railway / Render / DigitalOcean |
| **Evolution API** | 1 vCPU, 2GB RAM | Same que n8n ou Docker local |
| **OCR** | Google Vision API | Google Cloud |
| **Domínio** | — | Cloudflare |

### 6.2 Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=xxx

# n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=xxx
N8N_ENCRYPTION_KEY=xxx

# OCR
GOOGLE_VISION_API_KEY=xxx

# App
APP_URL=https://app.motorhub.com.br
WEBHOOK_SECRET=xxx
```

---

## 7. Escalabilidade

### 7.1 Horizontar (n8n)

- Multiple workers via queue (Redis)
- Horizontal scaling do n8n com sticky sessions

### 7.2 Vertical (Supabase)

- Upgrade de plano conforme base cresce
- Read replicas para consultas pesadas

### 7.3 Otimizações

| Query | Otimização |
|-------|-----------|
| Resumo diário | Índice composto (user_id, ocorrencia_em) |
| Histórico | Paginação com cursor |
| Busca fuzzy | GIN index no jsonb |

---

## 8. Monitoramento

| Métrica | Ferramenta |
|---------|----------|
| **Uptime** | Health checks nativos |
| **Erros** | Sentry |
| **Logs** | n8n internal + Supabase logs |
| **Metrics** | Simple dashboard próprio |
| **Alertas** | n8n error workflow → Slack/Email |

---

## 9. Backup e Recuperação

| Tipo | Frequência | Retenção |
|------|-----------|---------|
| **Supabase** | Automático (daily) | 7 dias |
| **Storage** | Versionamento ativado | — |
| **Docker** | Snapshotsmanuais | — |

---

## 10. Fluxo de Deploy Sugerido

```
Desenvolvimento ──▶───────▶ Homologação ──▶───────▶ Produção
     │                          │                         │
   git push               teste manual          git merge main
                           n8n test         deploy automatico
```

---

## 11. Dependências Entre Documentos

| Documento | Relação |
|----------|--------|
| **Modelo de Banco** | Define schema referenciado aqui |
| **Integração n8n** | Detalha workflows |
| **MVP** | Requisita essa arquitetura |
| **Design de Telas** | Consome APIs descritas aqui |

---

## 12. Riscos e Mitigações

| Risco | Mitigação |
|-------|-----------|
| Evolution API instável | Docker com health check, restartautomático |
| OCR falha | Fallback para entrada manual de valor |
| Supabase down | Cache em memória para dashboard offline |
| Rate limiting | Implementar throttling no n8n |
| dados financeiros perdidos | Backups automáticos + replicas |

---

## 13. Próximos Passos

- [ ] Configurar ambiente de desenvolvimento
- [ ] Provisionar Supabase e executar DDL
- [ ] Deploy Evolution API (Docker)
- [ ] Deploy n8n (Docker ou cloud)
- [ ] Configurar webhook da EvolutionAPI → n8n
- [ ] Criar workflows básicos no n8n
- [ ] Testar end-to-end com WhatsApp real
- [ ] Deploy para produção