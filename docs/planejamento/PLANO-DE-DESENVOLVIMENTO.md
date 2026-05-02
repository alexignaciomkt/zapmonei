# Plano de Desenvolvimento — Sistema de Gestão Financeira para Motoristas

Este documento apresenta o passo a passo completo para desenvolver o sistema, desde a infraestrutura até o lançamento do MVP.

---

## Visão Rápida do Projeto

| Item | Detalhe |
|------|---------|
| **Produto** | Sistema de gestão financeira para motoristas de aplicativo |
| **Canal principal** | WhatsApp (registro por texto, áudio, foto de nota) |
| **Dashboard** | PWA web para visualização de resultados |
| **Diferencial** | Registro sem esforço, separação pessoal/trabalho, lucro real |

---

## Fase 1 — Infraestrutura Base

### 1.1 Configurar Supabase (Backend)

| Passo | Ação |
|-------|------|
| 1 | Criar conta em [supabase.com](https://supabase.com) |
| 2 | Criar novo projeto (ex: `motorhub-finance`) |
| 3 | Anotar `SUPABASE_URL` e `SUPABASE_ANON_KEY` |
| 4 | Executar DDL do banco (参见 Passo 6) |
| 5 | Configurar RLS (Row Level Security) |
| 6 | Criar bucket `notas-fiscais` no Storage |

**Variáveis a salvar:**
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

### 1.2 Configurar Domínio e DNS

| Passo | Ação |
|-------|------|
| 1 | Comprar domínio (ex: `motorhub.com.br`) |
| 2 | Criar conta na [Cloudflare](https://cloudflare.com) |
| 3 | Adicionar domínio e configurar nameservers |
| 4 | Configurar DNS: |
|   | • `app` → IP do Vercel |
|   | • `api` → Supabase URL |
|   | • `wa` →IP do servidor WhatsApp |
| 5 | Ativar SSL automático (Flexsible) |

### 1.3 Configurar VPS/Servidor

| Passo | Ação |
|-------|------|
| 1 | Criar droplet na DigitalOcean (VPS básica) |
| 2 | Configurar firewall (portas 22, 80, 443, 8080) |
| 3 | Instalar Docker e Docker Compose |
| 4 | Configurar proxy reverso (nginx) |

**Custo estimado:** R$ 50-80/mês (VPS 2GB RAM)

---

## Fase 2 — Integração WhatsApp

### 2.1 Instalar Evolution API

| Passo | Ação |
|-------|------|
| 1 | Criar arquivo `docker-compose.yml` |
| 2 | Executar `docker-compose up -d` |
| 3 | Acessar `http://SEU_IP:8080` |
| 4 | Criar usuário admin |
| 5 | Gerar API Key |

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  evolution:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - SERVER_TYPE=openai
      - AUTHENTICATION_API_KEY=sua_chave_aqui
    volumes:
      - evolution_data:/evolution/instances
```

### 2.2 Criar Instância WhatsApp

| Passo | Ação |
|-------|------|
| 1 | Na Evolution API, criar nova instância |
| 2 | Gerar QR Code para conexão |
| 3 | Escanear com o WhatsApp do motorista |
| 4 | Definir webhooks: |
|   | • Inbound: `https://SEU_N8N.com/webhook/whatsapp/inbound` |
|   | • Status: `https://SEU_N8N.com/webhook/whatsapp/status` |
| 5 | Testar conexão enviando mensagem |

**Variáveis a salvar:**
```env
EVOLUTION_API_URL=http://SEU_IP:8080
EVOLUTION_API_KEY=sua_chave_api
INSTANCE_NAME=motorhub-worker
```

### 2.3 Configurar n8n (Orquestrador)

| Passo | Ação |
|-------|------|
| 1 | Criar container n8n: |
|   | ```bash |
|   | docker run -d --name n8n -p 5678:5678 \
|   | -e N8N_BASIC_AUTH_ACTIVE=true \
|   | -e N8N_BASIC_AUTH_USER=admin \
|   | -e N8N_BASIC_AUTH_PASSWORD=senha_forte \
|   | -e WEBHOOK_URL=https://SEU_N8N.com \
|   | n8nio/n8n
|   ``` |
| 2 | Acessar `http://SEU_IP:5678` |
| 3 | Configurar credenciais: |
|   | • Supabase (API URL + Key) |
|   | • Evolution API (URL + Key) |
|   | • OpenAI (API Key) |
|   | • Google Vision (credentials) |
| 4 | Criar primeiro workflow de teste |

---

## Fase 3 — Banco de Dados

### 3.1 Executar DDL

参见 arquivo `Passo 6 — Modelo de Banco de Dados.md`

### 3.2 Estrutura de Tabelas Principais

```sql
-- USUARIOS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  city VARCHAR(50),
  vehicle_type VARCHAR(20),
  activity_type VARCHAR(20),
  financial_profile VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSAÇÕES
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(10) NOT NULL, -- 'gain' | 'expense'
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(30),
  context VARCHAR(20), -- 'personal' | 'work'
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MENSAGENS
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content TEXT,
  media_url TEXT,
  direction VARCHAR(10), -- 'inbound' | 'outbound'
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Configurar RLS

| Passo | Ação |
|-------|------|
| 1 | Ativar RLS em cada tabela |
| 2 | Criar política: usuários veem apenas seus dados |
| 3 | Testar acesso com usuário fake |

```sql
CREATE POLICY "users own data" ON transactions
  FOR ALL USING (auth.uid() = user_id);
```

---

## Fase 4 — Workflows n8n

### 4.1 WhatsApp Inbound (Receber Mensagem)

| Passo | Ação |
|-------|------|
| 1 | Criar novo workflow |
| 2 | Adicionar nó **Webhook** (Evolution API) |
| 3 | Adicionar nó **Function** (normalizar payload) |
| 4 | Adicionar nó **Supabase** (salvar mensagem) |
| 5 | Ativar webhook |

**Fluxo:**
```
Webhook inbound → Switch (texto/imagem) → 
  ├── Texto: NLP → Classificar → Criar transação
  └── Imagem: Baixar → OCR → Extrair dados → Confirmar
```

### 4.2 NLP Engine (Classificar Mensagem)

| Passo | Ação |
|-------|------|
| 1 | Adicionar nó **OpenAI** |
| 2 | Configurar prompt de classificação |
| 3 | Mapear resposta para campos |
| 4 | Testar com mensagens de exemplo |

**Prompt base:**
```
Você é um assistente financeiro para motoristas.
Analise a mensagem e extraia:
- valor: número (em centavos se necessário)
- tipo: "gain" | "expense"
- categoria: "fuel" | "food" | "maintenance" | etc
- contexto: "personal" | "work"

Mensagem: {mensagem}

Responda em JSON.
```

### 4.3 OCR Handler (Notas Fiscais)

| Passo | Ação |
|-------|------|
| 1 | Adicionar nó **HTTP Request** (baixar mídia) |
| 2 | Adicionar nó **Google Vision OCR** |
| 3 | Adicionar nó **Function** (extrair valor/estabelecimento) |
| 4 | Adicionar nó **Evolution API** (confirmar dados) |

### 4.4 Confirmation Sender (Resposta ao Usuário)

| Passo | Ação |
|-------|------|
| 1 | Criar workflow separado |
| 2 | Adicionar nó **Webhook** (de outros workflows) |
| 3 | Adicionar nó **Evolution API** (enviar mensagem) |
| 4 | Configurar mensagem templatizada |

**Mensagens de exemplo:**
```
✅ Anotei: Gain R$ 120,00 (corrida) para trabalho
📸 Notei R$ 210,00 no posto. Confirmar?
❌ Não entendi. Me ajuda aclassificar?
```

---

## Fase 5 — Frontend (Dashboard PWA)

### 5.1 Criar Projeto Next.js

| Passo | Ação |
|-------|------|
| 1 | Criar projeto: |
|   | ```bash |
|   | npx create-next-app@latest motorhub-dashboard \
|   | --typescript --tailwind --eslint
|   ``` |
| 2 | Instalar dependências: |
|   | ```bash |
|   | npm install @supabase/supabase-js \
|   | @supabase/ssr recharts lucide-react clsx
|   ``` |
| 3 | Configurar variáveis de ambiente |
| 4 | Implementar Auth provider |

### 5.2 Implementar Telas

参见 arquivo `Passo 5 — Design de Telas e Painel Web.md`

### 5.3 Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── transactions/page.tsx
│   │   └── reports/page.tsx
│   └── layout.tsx
├── components/
│   ├── ui/           # shadcn/ui
│   ├── dashboard/
│   └── forms/
├── lib/
│   ├── supabase.ts
│   └── utils.ts
└── hooks/
    └── use-transactions.ts
```

### 5.4 Deploy

| Passo | Ação |
|-------|------|
| 1 | Conectar repositório ao Vercel |
| 2 | Configurar variáveis de ambiente |
| 3 | Fazer primeiro deploy |
| 4 | Configurar domínio customizado |

---

## Fase 6 — Testes e Validação

### 6.1 Testes Unitários

| O que testar | Ferramenta |
|-------------|------------|
| NLP classification | Jest |
| OCR extraction | Jest |
| Cálculos financeiros | Jest |

### 6.2 Testes de Integração

| O que testar | Como |
|-------------|------|
| WhatsApp → transação | Enviar mensagem real |
| Foto → OCR → transação | Enviar nota fiscal |
| Resumo diário | Verificar cálculos |

### 6.3 Teste com Usuários Reais

| Passo | Ação |
|-------|------|
| 1 | Criar conta teste |
| 2 | Registrar 10 ganhos |
| 3 | Registrar 10 gastos |
| 4 | Enviar 5 fotos de notas |
| 5 | Consultar resumos |
| 6 | Ajustar com base no feedback |

---

## Fase 7 — Lançamento

### 7.1 Checklist Pré-Lançamento

- [ ] Supabase funcionando
- [ ] WhatsApp conectado e respondendo
- [ ] n8n processando mensagens
- [ ] Dashboard no ar
- [ ] SSL funcionando
- [ ] Logs ok (sem erros)
- [ ] Testes passando

### 7.2 Documentação

| Documento | Descrição |
|-----------|----------|
| Tutorial WhatsApp | Como usar o sistema |
| FAQ | Perguntas frequentes |
| Termos de uso | LGPD e condições |

### 7.3 Monitoramento Inicial

| Métrica | Meta |
|--------|------|
| Mensagens processadas | 100% |
| Tempo de resposta | < 5s |
| OCR acurácia | > 80% |
| NLP acurácia | > 70% |

---

## Cronograma Sugerido

| Semana | Foco |
|--------|------|
| **Semana 1** | Infraestrutura (Supabase, VPS) |
| **Semana 2** | WhatsApp (Evolution API + n8n) |
| **Semana 3** | Banco + workflows |
| **Semana 4** | Frontend (MVP) |
| **Semana 5** | Testes e ajustes |
| **Semana 6** | Lançamento |

---

## Próximos Passos Imediatos

1. [ ] Configurar conta Supabase
2. [ ] Comprar domínio
3. [ ] Criar VPS
4. [ ] Continuar em **Passo 6 — Modelo de Banco de Dados**