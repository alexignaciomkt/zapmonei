# Stack Técnica — EvoGO (Evolution API Go Edition)

> Referência técnica para integração do ZapMonei com a instância EvoGO já implantada.

---

## 1. Identificação

| Item | Valor |
|------|-------|
| **Produto** | EvoGO (Evolution API reescrita em Go) |
| **URL Pública** | `https://apigo.euattendo.com.br` |
| **Porta Interna** | `4000` |
| **Client Name** | `evolution` |
| **Global API Key** | `0326ad2f6fcc4cb57e1e132812b1e1e1` |
| **Rede Docker** | `automacoes` (external) |
| **Proxy reverso** | Traefik com SSL automático (Let's Encrypt) |

---

## 2. Diferenças Críticas vs Evolution API (Node.js)

| Aspecto | Evolution API (Node) | EvoGO |
|---------|---------------------|-------|
| **Linguagem** | Node.js | Go |
| **Porta padrão** | 8080 | 4000 |
| **Performance** | Boa | Superior (Go) |
| **DB próprio** | Opcional | PostgreSQL dedicado (auth + users) |
| **Fila** | Redis/RabbitMQ | Redis (configurado) |
| **Storage mídia** | Local/S3 | MinIO (já configurado) |

---

## 3. Bancos de Dados (PostgreSQL)

```
evogo_auth  → Autenticação de instâncias
evogo_users → Dados de usuários/contatos
```

**Connection strings (internas ao stack Docker):**
```
POSTGRES_AUTH_DB=postgresql://postgres:***@postgres:5432/evogo_auth?sslmode=disable
POSTGRES_USERS_DB=postgresql://postgres:***@postgres:5432/evogo_users?sslmode=disable
```

---

## 4. Infraestrutura de Suporte

| Serviço | Config |
|---------|--------|
| **Redis** | `redis://redis:6379` |
| **MinIO** | `s3.a2tickets360.com.br` (SSL ativo) |
| **MinIO Bucket** | `evolution-go` |
| **AMQP** | Não configurado |
| **NATS** | Não configurado |

---

## 5. MinIO (Storage de Mídia)

> ⚠️ O MinIO JÁ ESTÁ ATIVO e configurado na infra.
> **Usar MinIO para `notas-fiscais` do ZapMonei** — não Supabase Storage.

| Item | Valor |
|------|-------|
| **Endpoint** | `s3.a2tickets360.com.br` |
| **Access Key** | `L8ca0aF9HQjPKs9WyGhg` |
| **Secret Key** | `CvPskTwrxYdZ498NdRsYY0AoLJvzssNqr6kuhrEy` |
| **Bucket EvoGO** | `evolution-go` |
| **Bucket ZapMonei** | `zapmonei-notas` *(a criar)* |
| **SSL** | Ativo |

---

## 6. Comportamentos Importantes

| Config | Valor | Impacto |
|--------|-------|---------|
| `DATABASE_SAVE_MESSAGES` | `false` | EvoGO NÃO salva msgs no próprio DB → n8n deve capturar tudo |
| `WEBHOOKFILES` | `true` | Webhook envia dados de arquivo (foto/áudio) no payload |
| `CONNECT_ON_STARTUP` | `true` | Instâncias reconectam automaticamente ao reiniciar |
| `EVENT_IGNORE_STATUS` | `true` | Eventos de status (digitando, lido) são ignorados |
| `EVENT_IGNORE_GROUP` | `false` | Grupos são processados |

---

## 7. Endpoints da API (EvoGO)

Base URL: `https://apigo.euattendo.com.br`
Header: `apikey: 0326ad2f6fcc4cb57e1e132812b1e1e1`

### Instâncias (multi-tenant por motorista)

```http
POST /instance/create
GET  /instance/fetchInstances
GET  /instance/connectionState/{instanceName}
DELETE /instance/delete/{instanceName}
```

### Envio de Mensagens

```http
POST /message/sendText/{instanceName}
POST /message/sendMedia/{instanceName}
POST /message/sendButtons/{instanceName}
```

### Webhook por Instância

```http
POST /webhook/set/{instanceName}
GET  /webhook/find/{instanceName}
```

---

## 8. Configuração de Webhook (por Motorista)

Ao criar nova instância para um motorista, configurar:

```json
{
  "url": "https://n8n.zapmonei.com.br/webhook/whatsapp/inbound",
  "webhook_by_events": true,
  "webhook_base64": false,
  "events": [
    "MESSAGES_UPSERT",
    "MESSAGES_UPDATE",
    "CONNECTION_UPDATE"
  ]
}
```

> **Nota:** O n8n identificará o motorista pelo campo `instance` no payload do webhook.

---

## 9. Payload de Webhook (Mensagem Recebida)

```json
{
  "event": "messages.upsert",
  "instance": "motorista-uuid-aqui",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "ABCDEF123456"
    },
    "message": {
      "conversation": "Ganhei 85 reais na corrida"
    },
    "messageTimestamp": 1714000000,
    "pushName": "Carlos Motorista"
  }
}
```

---

## 10. Fluxo de Onboarding Multi-Tenant (ZapMonei)

```
1. Motorista cadastra no zapmonei.com.br
2. Backend chama: POST /instance/create → instanceName = "motorista-{user_id}"
3. Backend chama: POST /instance/connect/{instanceName} → retorna QR Code
4. QR Code exibido no frontend
5. Motorista escaneia com próprio celular
6. Webhook configurado automaticamente → aponta para n8n
7. instance_id salvo em users.whatsapp_instance no Supabase
```

---

## 11. Variáveis de Ambiente (n8n / Backend)

```env
EVOGO_API_URL=https://apigo.euattendo.com.br
EVOGO_API_KEY=0326ad2f6fcc4cb57e1e132812b1e1e1
EVOGO_CLIENT_NAME=evolution

MINIO_ENDPOINT=s3.a2tickets360.com.br
MINIO_ACCESS_KEY=L8ca0aF9HQjPKs9WyGhg
MINIO_SECRET_KEY=CvPskTwrxYdZ498NdRsYY0AoLJvzssNqr6kuhrEy
MINIO_BUCKET_NOTAS=zapmonei-notas
MINIO_USE_SSL=true
```
