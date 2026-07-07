# Fluxo de Onboarding via WhatsApp (Kathy → Motorista)

## Conceito
A **Kathy** é a chefe dos assistentes. Ela fala pelo número oficial do ZapMonei e conduz o motorista no processo de ativação. No final, ela "delega" um assistente novinho para o motorista, que falará consigo mesmo pelo WhatsApp.

## Pré-requisitos
- Número oficial do ZapMonei (instância `zapmonei_oficial` na Evo-Go)
- Instância do motorista já criada no nó anterior
- Imagens tutoriais (com setas) para os passos do WhatsApp

---

## Fluxo Detalhado

### Mensagem 1 — Boas-Vindas (Kathy → Motorista)
```
👋 Olá, [Nome]! Eu sou a Kathy, a chefe dos assistentes aqui no ZapMonei!

Seu plano *[nome_do_plano]* foi ativado com sucesso ✅

Estou preparando um assistente financeiro novinho em folha só pra você! 🤖✨

Mas antes, preciso conectar ele ao seu WhatsApp. 
Me diz uma coisa:

*Você está usando agora o celular que vai usar com o seu assistente?*

1️⃣ Sim, estou neste celular
2️⃣ Não, vou usar outro aparelho
```

### Aguarda Resposta → IF

---

### SE RESPOSTA == "1" (Mesmo Celular → Pairing Code)

**Ação n8n:** `POST /instance/pair` → Retorna `PairingCode`

**Mensagem 2a:**
```
Perfeito! Vou te enviar um código de conexão agora.

Seu código: *XXXX-XXXX*

Siga os passos abaixo pra conectar 👇
```

**Mensagem 3a — Imagem Tutorial:**
> Enviar imagem com setas mostrando:
> 1. Tela do WhatsApp → ícone de 3 pontos (⋮)
> 2. Menu → "Dispositivos Conectados"
> 3. Botão "Vincular Dispositivo"  
> 4. Opção "Vincular com Número de Telefone" (em vez de QR)
> 5. Campo para digitar o código

**Mensagem 4a:**
```
Depois de colar o código, aguarde uns segundinhos... ⏳
Assim que conectar, eu te aviso aqui!
```

---

### SE RESPOSTA == "2" (Outro Aparelho → QR Code)

**Ação n8n:** `GET /instance/qrcode` → Retorna imagem do QR Code

**Mensagem 2b:**
```
Sem problema! Vou te enviar o QR Code agora.

Escaneie ele com a câmera do aparelho que vai usar 📱👇
```

**Mensagem 3b — Imagem do QR Code:**
> Enviar a imagem Base64 do QR Code retornada pela Evo-Go

**Mensagem 4b — Imagem Tutorial:**
> Enviar imagem com setas mostrando:
> 1. Tela do WhatsApp no OUTRO aparelho → ícone de 3 pontos (⋮)
> 2. Menu → "Dispositivos Conectados"
> 3. Botão "Vincular Dispositivo"
> 4. Apontar a câmera para o QR Code

**Mensagem 5b:**
```
Aguarde a conexão... ⏳
Assim que conectar, eu te aviso aqui!
```

---

### Após Conexão Confirmada (Webhook de status da instância)

**Mensagem Final — Kathy:**
```
🎉 *Tudo pronto, [Nome]!*

Seu assistente financeiro está ativo e esperando por você!

A partir de agora, é só abrir *o seu próprio WhatsApp* e mandar uma mensagem *pra você mesmo*.

Sim, é isso mesmo! Manda uma mensagem no SEU chat, tipo:

💬 _"Gastei 50 reais de gasolina no posto Shell"_

Seu assistente vai ler, registrar e organizar tudo pra você automaticamente. 

Qualquer dúvida, é só me chamar aqui! 
Boas corridas e bons lucros! 🚗💰

— Kathy, sua chefe dos assistentes 😎
```

---

## Estrutura dos Nós no n8n

```
[Webhook Pagamento]
    ↓
[Supabase: Criar Usuário] (Upsert)
    ↓
[Evo-Go: Criar Instância do Motorista]
    ↓
[Kathy: Enviar Boas-Vindas] (via instância zapmonei_oficial)
    ↓
[Webhook: Aguardar Resposta do Motorista] (novo webhook ou polling)
    ↓
[IF: Resposta == 1 ou 2]
    ├─ 1 → [Evo-Go: Pair Code] → [Kathy: Enviar Código + Tutorial]
    └─ 2 → [Evo-Go: QR Code]  → [Kathy: Enviar QR + Tutorial]
    ↓
[Webhook: Aguardar Conexão] (evento CONNECTION da Evo-Go)
    ↓
[Kathy: Mensagem Final "Fale com você mesmo!"]
    ↓
[Atualizar Supabase: onboarding_status = "active"]
```

## Imagens Necessárias (Criar/Capturar)
1. `tutorial_pairing_code.png` — Print do WhatsApp com setas: Menu → Dispositivos → Vincular → Código
2. `tutorial_qrcode.png` — Print do WhatsApp com setas: Menu → Dispositivos → Vincular → QR Code
