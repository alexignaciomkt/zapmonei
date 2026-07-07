# 🚀 PLANO DE LANÇAMENTO ZAPMONEI
## Terça-feira 13 → Sábado 17 de Maio de 2026

> **Objetivo:** Ter o ecossistema completo ZapMonei funcionando até sábado com LP, checkout, área de afiliados e integração com o sistema existente (Next.js + Supabase + N8N + WhatsApp).

---

## ✅ DECISÕES CONFIRMADAS (11/05/2026)

| Item | Decisão |
|---|---|
| **Domínio WordPress** | `zapmonei.com.br` (raiz) |
| **Dashboard Next.js** | `app.zapmonei.com.br` (subdomínio) |
| **Gateway de pagamento** | **Asaas** — plugin oficial `woo-asaas` (gratuito, 8k+ instalações) |
| **Área de Afiliados** | AffiliateWP (licença sendo adquirida) |
| **Logo** | Será colocada na pasta `/Imagens` |
| **Textos da LP** | Baseados na LP atual do Next.js |
| **Infraestrutura** | WordPress na mesma VPS via Docker |

> [!WARNING]
> **CONFLITO DE ROTA DETECTADO:** O `docker-compose.yml` atual aponta `zapmonei.com.br` para o **Next.js**. Com o WordPress, o domínio raiz vai para o **WordPress** e o Next.js precisa mudar para `app.zapmonei.com.br`. Isso precisa ser resolvido na terça antes do deploy. **A IA já preparou o arquivo `docker-compose.wordpress.yml` com essa arquitetura.**

---

---

## 👥 Divisão de Responsabilidades

| Quem | O Que Faz |
|---|---|
| **Você (Humano)** | Acesso ao servidor, credenciais, decisões visuais, aprovações, testes finais |
| **IA (Antigravity)** | Código, configurações, workflows N8N, estrutura de páginas, documentação, execução via MCP |

---

## 📋 PRÉ-REQUISITOS — Antes de Começar

> [!IMPORTANT]
> Estes itens precisam estar resolvidos **antes da terça-feira** para não travar o plano.

### Você precisa providenciar:

- [x] **Domínio decidido** — `zapmonei.com.br` (WordPress) + `app.zapmonei.com.br` (Next.js)
- [x] **Gateway de pagamento** — **Asaas** (plugin oficial gratuito: `woo-asaas`)
  - [ ] Ter as **chaves API Asaas** em mãos (Sandbox + Produção)
- [x] **Logo do ZapMonei** em PNG/SVG → pasta `/Imagens`
- [x] **Paleta de cores oficial** (HEX) — extraída do dashboard Next.js
- [ ] **Textos de marketing** da LP — baseados na LP atual *(ajustar na quarta)*
- [x] **Planos de preço definidos**: Mensal (R$ 49,90) e Anual (R$ 397,00)
- [x] **Credenciais de acesso à VPS** (IP, usuário SSH, senha ou chave)
- [x] **Chave de licença AffiliateWP** — Instalada e Ativa
- [x] **MCPs instalados e funcionando**: WordPress MCP, WooCommerce MCP, Elementor MCP

### IA já preparou (prontos para usar):
- [x] `docker-compose.wordpress.yml` — WordPress + MariaDB integrado ao Traefik existente
- [x] `.env.wordpress.example` — template de variáveis de ambiente

---

## 📅 TERÇA-FEIRA, 13 DE MAIO
### Tema: Infraestrutura WordPress na VPS

---

### 🤖 IA FAZ — Criar docker-compose do WordPress

**Objetivo:** Adicionar o WordPress ao ecossistema Docker existente na VPS, sem conflitar com os serviços atuais (N8N, Supabase, Next.js).

#### O que será feito:
- Criar bloco Docker Compose para WordPress + MariaDB
- Configurar volumes persistentes
- Configurar rede interna compartilhada com os demais serviços
- Definir variáveis de ambiente seguras (.env)
- Configurar Nginx Proxy Manager ou Traefik para rotear o domínio

**Arquivo gerado:** `docker-compose.wordpress.yml`

---

### 👤 VOCÊ FAZ — Deploy na VPS

1. Copiar o arquivo `docker-compose.wordpress.yml` gerado para a VPS
2. Executar: `docker compose -f docker-compose.wordpress.yml up -d`
3. Confirmar que os containers estão rodando: `docker ps`
4. Apontar o DNS do domínio escolhido para o IP da VPS
5. Compartilhar com a IA:
   - URL do WordPress no ar (ex: `https://zapmonei.com.br`)
   - Usuário admin e senha gerados na instalação

---

### 🤖 IA FAZ — Configuração Inicial via MCP (WordPress MCP)

Com acesso via MCP, a IA irá:

- [x] Definir título do site, tagline e URL
- [x] Configurar fuso horário (America/Sao_Paulo) e idioma (pt_BR)
- [x] Instalar e ativar plugins essenciais:
  - WooCommerce
  - Elementor (Free + Pro se disponível)
  - AffiliateWP + extensões
  - WooCommerce Subscriptions (se plano recorrente)
  - FluentSMTP (e-mail transacional)
- [x] Remover plugins padrão desnecessários (Hello Dolly, Akismet trial)
- [x] Configurar permalink para `/%postname%/`
- [x] Desativar comentários globalmente

**Critério de conclusão:** WordPress limpo, seguro, com todos os plugins ativos.

---

### ✅ CHECK DO DIA — Terça
| Item | Status |
|---|---|
| WordPress no ar com HTTPS | [x] |
| Plugins instalados e ativos | [x] |
| Domínio apontado corretamente | [x] |
| Acesso admin funcionando | [x] |

---

## 📅 QUARTA-FEIRA, 14 DE MAIO
### Tema: WooCommerce + Afiliados + Identidade Visual

---

### 🛒 IA FAZ — Configuração de Vendas (WooCommerce MCP)

- [x] Criar produto principal "ZapMonei - Plano Mensal" (Virtual/Simples)
- [x] Criar produto "ZapMonei - Plano Anual" (Virtual/Simples)
- [x] Configurar Cupom de Desconto Mestre (10% OFF) para Afiliados
- [ ] Configurar Gateway Asaas (Keys API)
- [ ] Testar checkout em Sandbox
- [ ] Configurar e-mails transacionais (confirmação de pedido, acesso liberado)
- [ ] Configurar Webhook WooCommerce:
  - Evento: `order.completed`
  - URL destino: `https://[VPS]/webhook/woocommerce-compra` (N8N)
- [ ] Criar página de Checkout customizada
- [ ] Criar página "Minha Conta" (login, pedidos, dados)
- [ ] Configurar redirecionamento pós-compra

#### Configurações de segurança:
- [ ] Ativar SSL obrigatório no checkout
- [ ] Limitar tentativas de login (Wordfence)
- [ ] Configurar SMTP para e-mails (FluentSMTP)

---

### 🤝 IA FAZ — Área de Afiliados (AffiliateWP MCP)

- [ ] Configurar registro automático de afiliados
- [x] Definir comissão global (20% na primeira venda / 10% na recorrência)
- [ ] Personalizar e-mails de notificação de venda para afiliados
- [ ] Configurar o "Affiliate Portal" com a marca ZapMonei
- [ ] Criar página de registro de afiliado
- [ ] Criar página de dashboard do afiliado
- [ ] Configurar área de recursos do afiliado:
  - Links rastreados gerados automaticamente
  - Relatório de cliques e conversões
  - Histórico de comissões e saques
- [ ] Definir método de pagamento de comissões (PayPal, transferência bancária)
- [ ] Configurar e-mail de boas-vindas para novos afiliados

---

### 🤖 IA FAZ — Identidade Visual Global (Elementor Kit via MCP)

Com base nas cores e fontes do ZapMonei (extraídas do Next.js existente):

- [ ] Criar/importar **Global Kit Elementor** com:
  - Cores primária, secundária, acento, fundo, texto
  - Tipografia: fonte título + fonte corpo
  - Botões: estilo padrão, hover, tamanhos
  - Espaçamentos globais
- [ ] Configurar Header global (logo + menu)
- [ ] Configurar Footer global (links + copyright)
- [ ] Definir template de página padrão

---

### 👤 VOCÊ FAZ — Quarta

1. Aprovar a paleta de cores e fontes aplicadas (IA envia preview)
2. Fornecer os textos definitivos da LP (headline, benefícios, depoimentos se houver)
3. Confirmar preços dos planos para o WooCommerce
4. Testar checkout em modo sandbox com cartão de teste
5. Confirmar visual do header/footer global

---

### ✅ CHECK DO DIA — Quarta

| Item | Status |
|---|---|
| WooCommerce configurado com produto | ⬜ |
| Gateway de pagamento em sandbox funcionando | ⬜ |
| Webhook WooCommerce → N8N criado | ⬜ |
| AffiliateWP configurado com regras de comissão | ⬜ |
| Kit visual aplicado no Elementor | ⬜ |
| Header e Footer globais criados | ⬜ |

---

## 📅 QUINTA-FEIRA, 15 DE MAIO
### Tema: Páginas + Integração N8N

---

### 🤖 IA FAZ — Landing Page (Elementor via MCP)

Estrutura completa da LP com identidade visual aplicada:

```
SEÇÃO 1 — Hero
  ├── Headline principal (impacto máximo)
  ├── Subheadline (proposta de valor)
  ├── CTA principal → Ir para o checkout
  └── Imagem/vídeo hero

SEÇÃO 2 — Problema / Dor
  ├── Identificação da dor do público (motoristas, etc.)
  └── Agitação do problema

SEÇÃO 3 — Como Funciona
  ├── Passo 1: Cadastro via WhatsApp
  ├── Passo 2: IA registra suas finanças
  └── Passo 3: Dashboard com inteligência financeira

SEÇÃO 4 — Benefícios
  └── 6 cards com ícones e benefícios principais

SEÇÃO 5 — Planos e Preços
  └── Cards de planos (WooCommerce integrado)

SEÇÃO 6 — Prova Social
  └── Depoimentos / Números do produto

SEÇÃO 7 — FAQ
  └── 6-8 perguntas frequentes (Accordion)

SEÇÃO 8 — CTA Final
  └── Urgência + botão checkout

FOOTER
  └── Links legais, contato, redes sociais
```

---

### 🤖 IA FAZ — Páginas de Login e Conta

- [ ] **Página de Login** customizada com Elementor:
  - Logo centralizado
  - Formulário de login WooCommerce
  - Link "Esqueci a senha"
  - Visual alinhado com a identidade ZapMonei
- [ ] **Página Minha Conta** customizada:
  - Dados do usuário
  - Histórico de pedidos / plano ativo
  - Link para acessar o Dashboard ZapMonei (Next.js)
- [ ] **Página de Recuperação de Senha** customizada

---

### 🤖 IA FAZ — Workflow N8N: Compra → Ativação Automática

Criar/atualizar workflow no N8N:

```
TRIGGER: Webhook WooCommerce (order.completed)
    ↓
VALIDAR: Verificar se é produto ZapMonei
    ↓
BUSCAR/CRIAR: Usuário no Supabase
    ├── Se existe → ativar/renovar plano
    └── Se não existe → criar conta + definir senha temporária
    ↓
SUPABASE: Registrar plano, data de início, data de vencimento
    ↓
EVOLUTION API: Enviar WhatsApp de boas-vindas com:
    ├── Nome do usuário
    ├── Link de acesso ao dashboard
    └── Instruções de primeiro uso
    ↓
E-MAIL: Enviar confirmação com credenciais de acesso
```

---

### 🤖 IA FAZ — Workflow N8N: Registro de Afiliado

```
TRIGGER: Webhook AffiliateWP (novo afiliado aprovado)
    ↓
SUPABASE: Registrar afiliado + código de rastreamento
    ↓
EVOLUTION API: WhatsApp de boas-vindas para afiliado com:
    ├── Link de afiliado personalizado
    ├── Informações de comissão
    └── Link para área de afiliados
```

---

### 👤 VOCÊ FAZ — Quinta

1. Revisar e aprovar o conteúdo da Landing Page
2. Testar o fluxo completo: compra → recebimento do WhatsApp
3. Criar sua conta de afiliado de teste
4. Verificar se as comissões aparecem no painel AffiliateWP
5. Confirmar que o usuário é criado no Supabase após compra

---

### ✅ CHECK DO DIA — Quinta

| Item | Status |
|---|---|
| Landing Page publicada | ⬜ |
| Página de Login customizada | ⬜ |
| Página Minha Conta customizada | ⬜ |
| Workflow compra → Supabase → WhatsApp funcionando | ⬜ |
| Workflow afiliado → WhatsApp funcionando | ⬜ |
| Teste de compra end-to-end aprovado | ⬜ |

---

## 📅 SEXTA-FEIRA, 16 DE MAIO
### Tema: Testes, Ajustes Finos e Preparação para o Lançamento

---

### 🤖 IA FAZ — Auditoria e Ajustes

- [ ] Verificar SEO básico de todas as páginas (title, meta description, OG tags)
- [ ] Testar responsividade mobile de todas as páginas
- [ ] Validar velocidade (PageSpeed Insights)
- [ ] Revisar todos os e-mails transacionais (formatação, links)
- [ ] Configurar Google Analytics / Meta Pixel (se você fornecer os IDs)
- [ ] Criar página de Política de Privacidade e Termos de Uso
- [ ] Configurar página de obrigado (thank you page) pós-compra
- [ ] Verificar que todos os webhooks estão respondendo corretamente
- [ ] Documentar credenciais e acessos no arquivo de docs do projeto

---

### 👤 VOCÊ FAZ — Sexta

1. **Teste de compra real** com valor baixo (ex: R$1,00 para validar gateway em produção)
2. Revisar todos os textos e imagens da LP com olhos frescos
3. Testar pelo celular (compra, login, dashboard)
4. Confirmar que o e-mail e WhatsApp de boas-vindas chegaram
5. Testar o painel de afiliado (registrar, pegar link, simular conversão)
6. **Decisão:** Soft launch para lista de espera ou lançamento aberto?
7. Preparar material de divulgação (stories, posts, grupos)

---

### ✅ CHECK DO DIA — Sexta

| Item | Status |
|---|---|
| Compra real testada e aprovada | ⬜ |
| Todos os e-mails transacionais OK | ⬜ |
| WhatsApp de boas-vindas OK | ⬜ |
| Mobile testado e aprovado | ⬜ |
| Termos de Uso e Privacidade publicados | ⬜ |
| Painel de afiliado testado | ⬜ |
| Material de divulgação pronto | ⬜ |

---

## 📅 SÁBADO, 17 DE MAIO
### Tema: 🎯 LANÇAMENTO

---

### 🤖 IA FAZ — Suporte em Tempo Real

- Monitorar logs do N8N durante o lançamento
- Corrigir qualquer bug que apareça durante as primeiras vendas
- Ajustar workflows se necessário
- Documentar primeiras vendas e usuários ativados

---

### 👤 VOCÊ FAZ — GO LIVE

1. **Ativar gateway em modo produção** (desativar sandbox)
2. Publicar LP definitivamente (remover modo manutenção se estava ativo)
3. Disparar divulgação para lista de espera / grupos
4. Monitorar as primeiras vendas e ativações
5. Acompanhar painel do AffiliateWP
6. Verificar Supabase: usuários sendo criados corretamente
7. Responder dúvidas de primeiros compradores

---

## 🗂️ STACK TECNOLÓGICO COMPLETO

```
┌─────────────────────────────────────────────────────────┐
│                     ECOSSISTEMA ZAPMONEI                 │
├─────────────────────────────────────────────────────────┤
│  MARKETING & VENDAS (WordPress na VPS)                  │
│  ├── WordPress + Elementor Pro                          │
│  ├── WooCommerce + Gateway BR                           │
│  └── AffiliateWP + Extensões                            │
├─────────────────────────────────────────────────────────┤
│  PRODUTO (Já existente)                                 │
│  ├── Next.js (Dashboard financeiro)                     │
│  ├── Supabase (Auth + Database)                         │
│  └── Evolution API (WhatsApp)                           │
├─────────────────────────────────────────────────────────┤
│  AUTOMAÇÃO (Cola entre os sistemas)                     │
│  └── N8N (Workflows de integração)                      │
├─────────────────────────────────────────────────────────┤
│  INFRAESTRUTURA (VPS única)                             │
│  ├── Docker + Docker Compose                            │
│  ├── Nginx Proxy Manager (SSL automático)               │
│  └── Portainer (gestão visual dos containers)           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 CREDENCIAIS NECESSÁRIAS (checklist para você reunir)

> [!CAUTION]
> Nunca compartilhe estas credenciais em canais públicos. Use sempre canais seguros.

- [ ] IP da VPS + usuário SSH + chave de acesso
- [ ] Credenciais admin WordPress (após instalação)
- [ ] API Key do gateway de pagamento (pública + secreta, sandbox e produção)
- [ ] Licença AffiliateWP
- [ ] URL + Token de acesso N8N
- [ ] Credenciais Supabase (URL + Service Role Key)
- [ ] Token Evolution API (para WhatsApp)
- [ ] IDs do Meta Pixel e Google Analytics (se tiver)
- [ ] Conta de e-mail SMTP para envio transacional (ex: Brevo, SendGrid)

---

## 📊 RESUMO DO CRONOGRAMA

| Dia | Foco Principal | Responsável Principal |
|---|---|---|
| **Seg 12** (HOJE) | Reunir pré-requisitos e credenciais | **Você** |
| **Ter 13** | WordPress na VPS + plugins | Você (deploy) + **IA (config)** |
| **Qua 14** | WooCommerce + AffiliateWP + Kit Visual | **IA** + Você (aprovação) |
| **Qui 15** | LP + Páginas + Workflows N8N | **IA** + Você (testes) |
| **Sex 16** | Testes finais + Ajustes + Preparação | **IA** + **Você** (50/50) |
| **Sáb 17** | 🚀 LANÇAMENTO | **Você** + IA (suporte) |

---

## ⚡ REGRA DE OURO DO PROJETO

> **Se você está esperando pela IA → forneça credenciais/aprovações rapidamente.**
> **Se a IA está esperando por você → ela documenta e prepara o próximo passo.**
>
> **Zero tempo parado. Qualquer bloqueio → comunicar imediatamente.**

---

*Documento criado em: 11/05/2026 | Última atualização: 11/05/2026*
*Próxima revisão: Após cada dia de execução*
