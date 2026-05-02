# Stack Tecnológica — Sistemas Necessários para o Sistema de Gestão Financeira

Este documento lista todos os sistemas, ferramentas e serviços necessários para construir e operar o sistema, com justificativas, custos estimados e alternativas.

---

## 1. Visão Geral da Stack

| Camada | Tecnologia Principal | Alternativas |
|--------|-----------------|-------------|
| **Backend** | Supabase | Firebase, PlanetScale, Neon |
| **Orquestração** | n8n | Zapier, Make, Pipefy |
| **WhatsApp** | Evolution API (EvoGO) | Twilio, Meta Business API, WPPConnect |
| **OCR** | Google Cloud Vision | AWS Textract, Azure Form Recognizer, Tesseract |
| **IA/NLP** | OpenAI (GPT-4o mini) | Anthropic Claude, LangChain + spaCy |
| **Frontend** | Next.js + React | Vue.js, SvelteKit |
| **Hospedagem** | Vercel | Railway, Render, DigitalOcean |
| **Domínio/DNS** | Cloudflare | AWS Route53, Registro.br |
| **Monitoramento** | Sentry | Datadog, LogRocket |
| **SSL** | Let's Encrypt (auto) | Cloudflare SSL |

---

## 2. Detalhamento por Sistema

### 2.1 Supabase — Backend Completo

**O que faz:** Banco de dados PostgreSQL + Auth + Storage + Edge Functions + Realtime

**Por que escolher:**
- PostgreSQL real (não Firebase)
- Auth built-in (magic links)
- Storage para notas fiscais
- Edge Functions para API
- Row Level Security (RLS)

**Plano recomendado:**
| Plano | Precio | Recursos |
|-------|-------|----------|
| **Free** | R$ 0 | 500MB DB, 1GB Storage, API Ilimitadas |
| **Pro** | R$ 25/mês | 8GB DB, 100GB Storage |
| **Team** | R$ 599/mês | 50GB DB, 1TB Storage |

**Configuração necessária:**
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Tabelas a criar:**
- users
- transactions
- messages
- categories
- attachments
- audits
- settings
- ai_training

---

### 2.2 Evolution API (EvoGO) — Integração WhatsApp

**O que faz:** API para enviar e receber mensagens via WhatsApp, gerenciar instâncias, baixar mídias

**Por que escolher:**
- Open source (gratuito)
- API REST completa
- Suporte a múltiplas instâncias
- Envio de imagens, áudio, botões
- Hooks para webhooks

**Instalaçõesuportada:**
| Opção | Hospedagem | Custo |
|-------|-----------|-------|
| **Docker** | Servidor próprio / VPS | R$ 50-150/mês (VPS) |
| **Railway** | Cloud | R$ 5/mês |
| **Render** | Cloud | Free - $ 5/mês |

**Endpoints principais:**
```
POST /webhook/inbound    → Receive messages
POST /webhook/outbound   → Send messages  
GET  /instance/status    → Check instance
POST /instance/create   → Create new instance
POST /message/sendText  → Send text message
POST /message/sendMedia → Send media
```

**Configuração:**
```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key
INSTANCE_NAME=motorhub-worker
```

**Alternativas:**

| Serviço | Custo | Prós | Contras |
|---------|-------|-----|--------|
| **Twilio** | R$ 0,05/mensagem | API estável, global | Pago por mensagem |
| **Meta Business API** |_gratuito até 1K/mês | Oficial | Aprovação difícil |
| **WPPConnect** |_gratuito | Open source | Instável, bloqueável |

**Recomendação:** Evolution API para MVP (gratuito), migrar para Twilio se precisar de escala.

---

### 2.3 n8n — Orquestrador de Automação

**O que faz:** Workflows de automação para processar mensagens, OCR, NLP, criar transações

**Por que escolher:**
- Interface visual (Node.js)
- Integra com tudo
- Self-hosted (sem custo)
- Comunidade ativa
- Executa JavaScript

**Instalaçõesuportada:**
| Opção | Hospedagem | Custo |
|-------|-----------|-------|
| **Docker** | Servidor próprio / VPS | R$ 50-150/mês |
| **n8n.cloud** | Saas oficial | Free - R$ 120/mês |
| **Railway** | Cloud | R$ 5/mês |

**Workflows necessários:**

| Workflow | Função |
|----------|-------|
| **WhatsApp Inbound** | Recebe webhook da Evolution API |
| **Message Parser** | Normaliza e estrutura dados |
| **OCR Processor** | Envia imagem para OCR |
| **NLP Engine** | Extrai valor e categoria |
| **Transaction Create** | Cria transação no Supabase |
| **Confirmation Send** | Envia resposta ao WhatsApp |
| **Reminder** | Lembretes periódicos |
| **Error Handler** | Captura falhas |

**Configuração mínima:**
```env
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=xxx
N8N_ENCRYPTION_KEY=xxx
WEBHOOK_URL=https://seu-n8n.com/webhook/whatsapp/inbound
```

---

### 2.4 Google Cloud Vision — OCR

**O que faz:** Extrai texto de imagens (notas fiscais)

**Por que escolher:**
- Excelente precisão
- API simples
- Suporte a português
- Preço acessível

**Custo estimado:**
| Volume | Custo |
|--------|------|
| **1.500 imagens/mês** | R$ 1,50 |
| **10.000 imagens/mês** | R$ 10,00 |
| **100.000 imagens/mês** | R$ 75,00 |

**Alternativas:**

| Serviço | Custo (1K imagens) | Precisão |
|---------|-----------------|----------|
| **Google Vision** | R$ 1,25 | Excelente |
| **AWS Textract** | R$ 1,50 | Boa |
| **Azure Form Recognizer** | R$ 2,00 | Boa |
| **Tesseract (local)** | R$ 0 | Ruim |

**Configuração:**
```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
VISION_API_KEY=xxx
```

---

### 2.5 OpenAI (GPT-4o mini) — NLP/IA

**O que faz:** Classifica mensagens, sugere categorias, interpreta linguagem natural

**Por que escolher:**
- Excelente em linguagem natural
- API simples
- Preço baixo (mini)
- Contexto multilíngue

**Custo estimado:**
| Mensagens/mês | Custo |
|---------------|------|
| **5.000** | R$ 0,50 |
| **50.000** | R$ 5,00 |
| **500.000** | R$ 50,00 |

**Alternativas:**

| Serviço | Custo (1K chamadas) | Melhor para |
|---------|-------------------|-----------|
| **OpenAI GPT-4o mini** | R$ 0,10 | Classificação geral |
| **Anthropic Claude** | R$ 0,15 | Contexto longo |
| **spaCy (local)** | R$ 0 | Regex/heurística |

**Prompt de exemplo para NLP:**
```
Você é um assistente financeiro para motoristas de aplicativo.
Analise a mensagem e extraction: valor, categoria, contexto (pessoal/trabalho).

Mensagem: "{mensagem}"

Responda em JSON:
{{
  "valor": null,
  "tipo": "ganho|gasto",
  "categoria": "combustivel|alimentacao|...",
  "contexto": "pessoal|trabalho",
  "confianca": 0.0-1.0
}}
```

---

### 2.6 Next.js + React — Frontend (PWA)

**O que faz:** Dashboard web paravisualização e gestão

**Por que escolher:**
- React/TypeScript
- Server-side rendering
- PWA out-of-box
- Excelente DX

**Componentes:**
| Biblioteca | Função |
|-----------|-------|
| **Next.js 14+** | Framework |
| **Tailwind CSS** | Estilização |
| **shadcn/ui** | Componentes |
| **Recharts** | Gráficos |
| **React Query** | Fetch data |
| **PWA** | Instalável |

**Hospedagem:**
| Opção | Custo |
|-------|-------|
| **Vercel** | Free (dev) - R$ 20/mês |
| **Railway** | R$ 5/mês |
| **VPS próprio** | R$ 50-150/mês |

---

### 2.7 Cloudflare — Domínio, DNS e SSL

**O que faz:** DNS, CDN, proteção DDoS, SSL gratuito

**Custo:** Free (free tier)

**Configuração:**
- Criar conta
- Adicionar domínio
- Configurar DNS para:
  - app.motorhub.com.br → Vercel
  - api.motorhub.com.br → Supabase
  - n8n.motorhub.com.br → n8n
  - wa.motorhub.com.br → Evolution API
- Ativar SSL automático

---

## 3. Diagrama de Integração

```
┌─────────────────────────────��───────────────────────────────────────────┐
│                         USUÁRIO (WhatsApp)                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 EVOLUTION API (EvoGO)                                  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Webhook      │  Instance    │  Send     │  Media               │  │
│  │  Receiver    │  Manager    │  Message  │  Download            │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ Webhook
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           n8n (Automação)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │  Webhook   │  │  Parser    │  │  NLP/AI   │  │  OCR    │ │
│  │  Inbound   │  │  Message   │  │  OpenAI   │  │  Vision │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘ │
│         │                │               │               │              │
│         ▼                ▼               ▼               ▼              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Transaction Creator → Supabase                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                       │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐          │
│  │  PostgreSQL��  │  Auth   │  │ Storage  │  │ Edge Funcs │          │
│  │  (DB)   │  │  (JWT)  │  │ (S3)    │  │ (API)    │          │
│  └───────────┘  └───────────┘  └───────────┘  └────────────┘          │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS (Dashboard PWA)                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────────┐          │
│  │ Dashboard │  │ Histórico │  │ Relatórios│  │  Config   │          │
│  └───────────┘  └───────────┘  └───────────┘  └────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Sequência de Provisionamento

### Fase 1: Backend (Supabase)
1. Criar conta em supabase.com
2. Criar projeto
3. Executar DDL do modelo de banco
4. Configurar RLS
5. Criar bucket de storage
6. Configurar Edge Functions

### Fase 2: WhatsApp (Evolution API)
1. Criar droplet/VPS (DigitalOcean/Railway)
2. Instalar Docker
3. Executar container Evolution API
4. Criar instância WhatsApp
5. Escurear QR Code
6. Conectar número

### Fase 3: Automação (n8n)
1. Instalar n8n (Docker)
2. Configurar credenciais:
   - Supabase
   - Evolution API
   - Google Vision
   - OpenAI
3. Criar workflows
4. Configurar webhooks

### Fase 4: Frontend (Next.js)
1. Criar projeto Next.js
2. Implementar telas
3. Conectar API Supabase
4. Configurar PWA
5. Deploy Vercel

### Fase 5: DNS e SSL
1. Comprar domínio
2. Configurar Cloudflare
3. Configurar DNS
4. Ativar SSL

---

## 5. Orçamento Estimado (MVP)

| Serviço | Plano | Custo Mensal |
|---------|-------|-------------|
| **Supabase** | Free/Pro | R$ 0-25 |
| **Evolution API** | Docker (VPS) | R$ 50 |
| **n8n** | Docker (mesma VPS) | R$ 0 |
| **Google Vision** | Pay-per-use | R$ 10 |
| **OpenAI** | Pay-per-use | R$ 5 |
| **Next.js** | Vercel Free | R$ 0 |
| **Domínio** | .com.br | R$ 40/ano |
| **Cloudflare** | Free | R$ 0 |
| **TOTAL** | | **R$ 85-90/mês** |

**Custo com escala (10K usuários):**
| Serviço | Custo Mensal |
|---------|-------------|
| Supabase Pro | R$ 25 |
| VPS maior | R$ 100 |
| Google Vision | R$ 50 |
| OpenAI | R$ 50 |
| **TOTAL** | **R$ 225/mês** |

---

## 6. Variáveis de Ambiente Completa

```env
# ===================
# SUPABASE
# ===================
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# ===================
# EVOLUTION API
# ===================
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=xxx
INSTANCE_NAME=motorhub-worker

# ===================
# N8N
# ===================
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=xxx
N8N_ENCRYPTION_KEY=xxx

# ===================
# GOOGLE (OCR)
# ===================
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
VISION_API_KEY=xxx

# ===================
# OPENAI (NLP)
# ===================
OPENAI_API_KEY=xxx

# ===================
# APP
# ===================
APP_URL=https://app.motorhub.com.br
WEBHOOK_SECRET=xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# ===================
# DATABASE
# ===================
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

---

## 7. Monitoramento e Saúde

| checks | Como fazer |
|--------|-----------|
| **Supabase** | dashboard.supabase.com → Health |
| **Evolution API** | curl http://wa.api:8080/health |
| **n8n** | n8n → Settings → Health |
| **WhatsApp** | Verificar última mensagem recebida |
| **Transações** | Verificar count do dia |

---

## 8. Contingência

| Problema | Solução |
|----------|--------|
| Supabase offline | Cache em memória, retry |
| Evolution API | Restart Docker, reconnect |
| n8n parado | Monitoramento + alerta |
| OCR falha | Pedir input manual |
| IA errar | Allow correção, feedback loop |

---

## 9. Referências

|Recurso | Link |
|--------|------|
| **Supabase Docs** | supabase.com/docs |
| **Evolution API** | doc.evolution-api.com |
| **n8n Docs** | docs.n8n.io |
| **Google Vision** | cloud.google.com/vision/docs |
| **OpenAI** | platform.openai.com/docs |
| **Next.js** | nextjs.org/docs |