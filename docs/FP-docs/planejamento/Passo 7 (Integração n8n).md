Passo 7 (Integração n8n)

abaixo segue o fluxo n8n detalhado node-a-node, com explicações didáticas, exemplos de payloads/expressões, opções de implementação (via DB direto ou API), e práticas recomendadas (idempotência, retries, logs, segurança). Vou assumir um provedor genérico de WhatsApp (estrutura típica: message.id, from, type, text.body, image.url). Ajuste as expressões conforme o formato real do seu provider.
Resumo do objetivo do workflow 
●	Receber webhook do WhatsApp → persistir a mensagem (messages) → baixar/upload da imagem (se houver) → rodar OCR (se imagem) → rodar NLP/NER (texto ou OCR) → criar um transaction em draft vinculado à message → enviar confirmação ao usuário → aguardar confirmação e confirmar/editar transação.
Fluxo node-a-node (ordem e propósito)
1.	Webhook (Webhook)
2.	Normalize Payload (Set / Function)
3.	Deduplicação (IF / Postgres SELECT)
4.	Save Message (Postgres INSERT ou HTTP Request para API)
5.	(opcional) Download Media (HTTP Request) → Upload S3 (S3 node / HTTP PUT) → Save Attachment (Postgres/ API)
6.	Trigger OCR (HTTP Request para OCR sync ou criar Job na fila)
7.	Run NLP / Extract Entities (HTTP Request para NLP ou Function+regex)
8.	Create Transaction Draft (Postgres INSERT ou API POST /transactions)
9.	Send Confirmation via WhatsApp (HTTP Request)
10.	Wait for User Confirmation (separate webhook flow / state machine)
11.	Confirm / Update Transaction (Postgres UPDATE ou API PATCH)
12.	Audit & Notification (Postgres INSERT audits + Notify admin on error)
Agora detalho cada node com exemplos práticos.
1.	Webhook (n8n: Webhook node)
●	Nome do node: Webhook - WhatsApp Inbound
●	Path: /whatsapp/inbound
●	Method: POST
●	Settings: escolher “Respond Immediately” com 200 OK ao provider para garantir baixa latência de recebimento (muito importante para providers que exigem ACK rápido).
●	Output esperado (exemplo genérico provider):
json
Copy
{  
  "message": {  
    "id": "wamid.HBgL...",  
    "from": "5511999887766",  
    "type": "image",           // ou "text"  
    "text": { "body": "Gastei 120 no posto" },  
    "image": { "url": "https://provider/media/abc.jpg" },  
    "timestamp": "2026-04-22T10:00:00Z"  
  }  
}  

●	Observação: você pode escolher devolver 200 e continuar o processamento internamente; caso queira devolver conteúdo ao usuário imediatamente, usar “Respond” com mensagem simples (não recomendado para processos pesados).
2.	Normalize Payload (Set / Function)
●	Propósito: mapear a estrutura do provider para campos consistentes usados pelo resto do fluxo.
●	Exemplo (Set node ou Function com JS):
○	whatsapp_message_id = {{$json["message"]["id"]}}
○	phone = {{$json["message"]["from"]}}
○	type = {{$json["message"]["type"]}}
○	text = {{json["message"]["type"]==="text"?json["message"]["type"] === "text" ? json["message"]["type"]==="text"?json["message"]["text"]["body"] : ""}}
○	media_url = {{json["message"]["image"]?json["message"]["image"] ? json["message"]["image"]?json["message"]["image"]["url"] : null}}
○	received_at = {{$json["message"]["timestamp"]}}
●	Dica: armazene o JSON original em raw_payload para auditoria: raw_payload = {{$json}}
3.	Deduplicação (IF node ou Postgres SELECT)
●	Propósito: evitar inserir a mesma mensagem duas vezes (por reenvios do provider).
●	Opção A — IF node + Postgres node:
○	IF node chama Postgres (SELECT 1 FROM messages WHERE whatsapp_message_id = :id LIMIT 1)
○	Se existe → terminar fluxo (log e responder 200).
○	Se não existe → continuar.
●	Opção B — tentar inserir com constraint UNIQUE no banco e tratar conflito (ON CONFLICT DO NOTHING) — mais robusto.
Exemplo SQL (Postgres node - Exec Query):
sql
Copy
SELECT id FROM messages WHERE whatsapp_message_id = $1 LIMIT 1;  
-- Bind: {{$node["Set"].json["whatsapp_message_id"]}}  

4.	Save Message (inserir rastro)
●	Opção recomendada: chamar sua API interna (POST /api/messages) para manter regras de negócio centralizadas.
●	Alternativa: Postgres node para inserir diretamente.
Exemplo corpo para API:
json
Copy
{  
  "whatsapp_message_id": "wamid.HBgL...",  
  "user_phone": "5511999887766",  
  "type": "image",  
  "content": null,  
  "raw_payload": { ... },  
  "received_at": "2026-04-22T10:00:00Z"  
}  

Exemplo SQL (Postgres INSERT):
sql
Copy
INSERT INTO messages (id, user_id, whatsapp_message_id, conteudo, tipo, process_meta, recebido_em)  
VALUES (gen_random_uuid(), (SELECT id FROM users WHERE telefone = $1), $2, $3, $4, '{}'::jsonb, $5)  
RETURNING id;  

●	Bind: telefone, whatsapp_message_id, content/text, type, timestamp.
5.	(Se houver mídia) Download Media → Upload S3 → Save Attachment
●	Download media:
○	Node: HTTP Request
○	Método: GET para media_url (atentar headers de auth do provider).
○	Response: binary data (arquivo).
●	Upload S3:
○	Node: S3 Put (se usar n8n built-in) ou HTTP Request com presigned URL (mais seguro: obter presigned URL do seu backend e dar PUT).
●	Save Attachment:
○	Inserir na tabela attachments com transaction_id (se já criado) ou temporariamente com message_id para linkar depois.
●	Observação: salvar metadados (ocr_stage: pending) e checksum.
6.	OCR (se imagem)
●	Duas opções:
 A) OCR síncrono (n8n chama API de OCR e aguarda retorno) — simples, bom para pequenas cargas.
 B) OCR assíncrono via fila (n8n dispara job a um worker e recebe callback webhook) — escalável.
●	Node: HTTP Request para serviço OCR (Google Vision, AWS Textract, Tesseract microservice).
●	Exemplo request (sync):
json
Copy
{  
  "image_url": "https://s3.../nota.jpg"  
}  

●	Exemplo response:
json
Copy
{  
  "status": "success",  
  "raw_text": "POSTO IPIRANGA - TOTAL R$ 137,80 - DATA 22/04"  
}  

●	Salve raw_text em messages.process_meta. Também crie um campo ocr_text.
7.	NLP / NER (extrair intent, valor, categoria)
●	Opções:
○	Serviço de ML (Rasa, spaCy custom, OpenAI / LLM) via HTTP Request
○	Heurística simples (regex) em Function node para MVP
●	Exemplo heurística regex (Function node JS):
js
Copy
const text = $json["ocr_text"] || $json["text"];  
const re = /(?:R\$|RS?\.?|)(\s?)(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/i;  
const m = text.match(re);  
const valor = m ? parseFloat(m[1].replace('.', '').replace(',', '.')) : null;  
return [{ json: { intent: valor ? "registro_gasto" : "unknown", entities: { valor } } }];  

●	Exemplo de output (NLP):
json
Copy
{  
  "intent": "registro_gasto",  
  "entities": {  
    "valor": 137.80,  
    "estabelecimento": "Posto IPIRANGA"  
  },  
  "confidence": 0.92  
}  

●	Salve o resultado em messages.process_meta (chave nlp).
8.	Create Transaction Draft
●	Colocar transação em estado draft/awaiting_confirmation com link message_id e meta com nlp result.
●	Recomendado: usar API POST /transactions para centralizar validações (regras de categoria, duplicatas por valor+data, etc.).
●	Exemplo corpo API:
json
Copy
{  
  "user_id": "uuid-user",  
  "message_id": "uuid-msg",  
  "tipo": "gasto",  
  "valor": 137.80,  
  "categoria_sugerida": "combustivel",  
  "contexto": "trabalho",  
  "status": "awaiting_confirmation",  
  "meta": { "nlp": {...}, "ocr": {...} }  
}  

●	SQL exemplo (Postgres node):
sql
Copy
INSERT INTO transactions (id, user_id, message_id, tipo, valor, categoria_id, contexto, origem, referencia_texto, criado_em, status, meta)  
VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'whatsapp', $7, now(), 'awaiting_confirmation', $8::jsonb)  
RETURNING id;  

9.	Enviar confirmação ao usuário (WhatsApp outbound)
●	Node: HTTP Request para o Provider (Twilio/Meta/Gupshup).
●	Mensagem exemplo:
○	Texto simples: “Detectei um gasto de R$ 137,80 no Posto IPIRANGA. Está correto? Responda ‘Sim’ para confirmar ou envie ‘Editar’ para mudar.”
○	Melhor: usar template interativo / quick replies / buttons (dependendo do provider).
●	Exemplo payload Twilio-like:
json
Copy
{  
  "to": "5511999887766",  
  "type": "text",  
  "body": "Identifiquei R$137,80 no Posto IPIRANGA. Está correto? Responda: 1) Sim 2) Editar"  
}  

●	Salve no transaction.meta que saiu a solicitação de confirmação (timestamp, attempts).
10.	Esperar confirmação (Webhooks / State)
●	Quando o usuário responde, o mesmo webhook inbound captura reply; no Normalize Payload verifique se há transações em 'awaiting_confirmation' para esse user_id e associe.
●	Se confirmar:
○	Atualize transactions.status = 'confirmed' e atualize audits.
○	Envie mensagem de agradecimento: “Pronto, anotei R$ 137,80 como gasto de trabalho.”
●	Se editar:
○	Iniciar fluxo de edição: perguntar “Qual o valor?” etc., e atualizar transaction após resposta.
11.	Audit / Logging
●	Após CREATE / UPDATE / DELETE em transactions, insira registro em audits:
sql
Copy
INSERT INTO audits (id, entidade, entidade_id, acao, usuario_id, payload_diff, criado_em)  
VALUES (gen_random_uuid(), 'transactions', :tx_id, 'create', :user_id, :diff::jsonb, now());  

●	Também logar no monitoring (Sentry/Logstash).
12.	Error Handling e Retries
●	Em n8n, para nodes críticos (S3 upload, OCR call, DB write) habilite estratégias:
○	Retry automático com backoff
○	Em caso de falha persistente, enviar para DLQ (fila de erros) e notificar time via Slack/email
●	Crie workflow On Error (n8n has "Error Trigger" workflows) que captura exceções e:
○	grava audits com erro
○	notifica admin com payload e link para reprocessamento
●	Idempotência: usar whatsapp_message_id + unique constraint no DB. Emworkers, trate conflicts.
Boas práticas e recomendações operacionais
●	Preferir escrever via API em vez de inserir direto no banco: mantém validações e regras de negócio centralizadas.
●	Usar transactions e ON CONFLICT nas queries DB para garantir idempotência.
●	Salvar raw_payload e raw_ocr_text para permitir reprocessamento manual e treino do modelo.
●	Tokens/keys (WhatsApp, S3, DB, OCR, NLP) devem ser armazenados em n8n Credentials (secrets) — nunca hardcode.
●	Para OCR pesado: usar fila e worker (n8n dispara Job → worker processa → callback webhook para n8n).
●	Exponha endpoints protegidos e verifique assinaturas do provider (HMAC) para evitar spoofing.
●	Monitoramento: contadores de mensagens processadas, erros por etapa (OCR, NLP, DB), latências. Alertas para falhas recorrentes.
Exemplos concretos de expressões n8n
●	Pegar texto da mensagem:
○	{{json["message"]["text"]?json["message"]["text"] ? json["message"]["text"]?json["message"]["text"]["body"] : ($json["message"]["caption"] || "")}}
●	Pegar media URL:
○	{{json["message"]["image"]?json["message"]["image"] ? json["message"]["image"]?json["message"]["image"]["url"] : null}}
●	Passar valor para Postgres node:
○	Valor: {{$node["NLP"].json["entities"]["valor"]}}
Fluxos auxiliares / workflows recomendados
●	Workflow principal: Ingest → OCR → NLP → Draft → Confirmation → Finalize.
●	Workflow secundário: OCR worker (processa imagens de fila) — callback para o principal.
●	Workflow de reprocessamento: pega mensagens com process_meta.nlp.confidence < 0.6 e reprocessa via modelo atualizado.
●	Workflow de erro (Error Trigger): receber exceptions e escalar.
Testes e validação
●	Testar com mensagens simuladas (curl POST para /webhook/inbound).
●	Criar massa de testes com variações: texto com valor, sem valor, imagens borradas, áudio.
●	Verificar o rastro: messages → ocr_text → messages.process_meta.nlp → transaction draft → transaction final.
●	Testar idempotência enviando o mesmo message.id duas vezes: segundo envio NÃO deve criar novo message/transaction.
Exemplos de payloads para teste
●	Texto simples:
json
Copy
{  
  "message": {  
    "id":"msg-1",  
    "from":"5511999887766",  
    "type":"text",  
    "text": { "body":"Ganhei 85 na corrida" },  
    "timestamp":"2026-04-22T12:00:00Z"  
  }  
}  

●	Imagem (nota):
json
Copy
{  
  "message": {  
    "id":"msg-2",  
    "from":"5511999887766",  
    "type":"image",  
    "image": { "url":"https://provider/media/nota_2204.jpg" },  
    "timestamp":"2026-04-22T10:00:00Z"  
  }  
}  

●	Exemplo de resposta de NLP:
json
Copy
{  
  "intent": "registro_gasto",  
  "entities": {  
    "valor": 137.8,  
    "estabelecimento": "Posto Ipiranga",  
    "categoria": "combustivel"  
  },  
  "confidence": 0.92  
}  

Observações finais e próximos passos
●	Quer que eu gere um JSON pronto do workflow n8n exportável (workflow JSON) com os nodes e parâmetros básicos (webhook, set, http request, function, postgres)? Posso montar um esqueleto que você importe direto no n8n e ajuste credenciais.
●	Posso também detalhar o worker OCR assíncrono (fila RabbitMQ + worker em Python/Node) e o endpoint de callback para integrar com n8n.

