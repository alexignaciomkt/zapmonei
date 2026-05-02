Passo 6 — Modelo de Banco de Dados



Vou gerar o diagrama ER do modelo de dados e depois detalhar as tabelas, DDL, índices, queries de exemplo e recomendações operacionais — tudo em português e com explicações educativas.
Abaixo vem a explicação detalhada do modelo (texto educativo, com DDL exemplo e recomendações).


 


________________________________________
Explicação do modelo (visão geral)
●	Entidades principais:
○	Usuário: guarda dados do motorista (telefone é o identificador primário de login/identificação).
○	Lançamento: cada transação financeira (ganho ou gasto). Relacionado a Usuário e Categoria.
○	Categoria: categorias padrão (combustível, alimentação, pedágio etc.) com sugestão de contexto (pessoal/trabalho).
○	Anexo: guarda referências a imagens (notas) relacionadas a lançamentos — armazenar arquivos em S3/objeto e salvar URL.
○	Conversa: guarda mensagens recebidas via WhatsApp e metadados do processamento (intent, entities, ocr raw).
○	Log/Auditoria: registra mudanças (criação/edição/exclusão) para auditabilidade e reprocessamento.
________________________________________
DDL exemplo (PostgreSQL) — versão concisa e comentada
sql
Copy
-- Extensões recomendadas  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- ou usar gen_random_uuid()  
CREATE EXTENSION IF NOT EXISTS pg_trgm;     -- para buscas fuzzy  
  
-- Usuário  
CREATE TABLE users (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  telefone text NOT NULL UNIQUE,  
  nome text,  
  cidade text,  
  tipo_atividade text,  
  tipo_veiculo text,  
  perfil_preferencial text,  
  criado_em timestamptz DEFAULT now()  
);  
  
-- Categoria  
CREATE TABLE categories (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  nome text NOT NULL,  
  descricao text,  
  padrao_contexto text, -- 'trabalho' | 'pessoal' | 'misto'  
  criada_por uuid REFERENCES users(id) NULL,  
  ativo boolean DEFAULT true  
);  
  
-- Lançamento  
CREATE TABLE transactions (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
  tipo text NOT NULL CHECK (tipo IN ('ganho','gasto')),  
  valor numeric(12,2) NOT NULL,  
  categoria_id uuid REFERENCES categories(id),  
  contexto text CHECK (contexto IN ('trabalho','pessoal','misto')) DEFAULT 'misto',  
  origem text, -- 'whatsapp','web','import'  
  referencia_texto text, -- texto orig. da mensagem  
  ocorrencia_em timestamptz NOT NULL DEFAULT now(),  
  criado_em timestamptz DEFAULT now(),  
  meta jsonb DEFAULT '{}'::jsonb  -- OCR data, tags, heuristics  
);  
  
CREATE INDEX idx_transactions_user_ocorrencia ON transactions (user_id, ocorrencia_em DESC);  
CREATE INDEX idx_transactions_tipo_user ON transactions (user_id, tipo);  
  
-- Anexo  
CREATE TABLE attachments (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE,  
  url text NOT NULL,  
  checksum text,  
  metadata jsonb,  
  criado_em timestamptz DEFAULT now()  
);  
  
-- Conversa / Mensagem  
CREATE TABLE messages (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,  
  whatsapp_message_id text,  
  conteudo text,  
  tipo text CHECK (tipo IN ('texto','imagem','audio')) DEFAULT 'texto',  
  recebido_em timestamptz DEFAULT now(),  
  process_meta jsonb DEFAULT '{}'::jsonb, -- ocr_result, intent, entities, confidence  
  vinculada_transaction uuid REFERENCES transactions(id)  
);  
  
CREATE INDEX idx_messages_user_received ON messages (user_id, recebido_em DESC);  
  
-- Log / Auditoria  
CREATE TABLE audits (  
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),  
  entidade text NOT NULL,  
  entidade_id uuid,  
  acao text NOT NULL, -- create/update/delete  
  usuario_id uuid NULL,  
  payload_diff jsonb,  
  criado_em timestamptz DEFAULT now()  
);  
CREATE INDEX idx_audits_entidade ON audits (entidade, entidade_id);  

Comentários rápidos:
●	Use UUIDs para evitar colisão e facilitar sincronização.
●	Campos jsonb para flexibilidade nas primeiras iterações (OCR raw, heurísticas, nlp entities).
●	Índices por usuário + timestamp são cruciais para consultas de resumo (diário, semanal, mensal).
________________________________________
Exemplo de registros JSON (fluxo de mensagem → transação)
Mensagem (registro em table messages):
json
Copy
{  
  "id": "uuid-msg-1",  
  "user_id": "uuid-user-1",  
  "conteudo": "Gastei 137,80 no posto X",  
  "tipo": "texto",  
  "process_meta": {  
    "intent": "registro_gasto",  
    "entities": { "valor": 137.80, "termo":"posto X" },  
    "confidence": 0.92  
  },  
  "recebido_em": "2026-04-22T15:12:00Z"  
}  

Transação criada:
json
Copy
{  
  "id": "uuid-tx-1",  
  "user_id": "uuid-user-1",  
  "tipo": "gasto",  
  "valor": 137.80,  
  "categoria_id": "uuid-cat-combustivel",  
  "contexto": "trabalho",  
  "origem": "whatsapp",  
  "referencia_texto": "Gastei 137,80 no posto X",  
  "ocorrencia_em": "2026-04-22T15:12:00Z",  
  "meta": { "nlp": { "used_rule":"keywords", "confidence":0.92 } }  
}  

________________________________________
Consultas SQL úteis (exemplos)
1.	Resumo diário (ganhos, gastos, saldo):
sql
Copy
SELECT  
  date_trunc('day', ocorrencia_em) as dia,  
  sum(CASE WHEN tipo='ganho' THEN valor ELSE 0 END) as ganhos,  
  sum(CASE WHEN tipo='gasto' THEN valor ELSE 0 END) as gastos,  
  sum(CASE WHEN tipo='ganho' THEN valor ELSE -valor END) as saldo  
FROM transactions  
WHERE user_id = :user_id AND ocorrencia_em >= date_trunc('day', now())  
GROUP BY 1;  

2.	Total combustível no mês:
sql
Copy
SELECT sum(valor) as total_combustivel  
FROM transactions t  
JOIN categories c ON t.categoria_id = c.id  
WHERE t.user_id = :user_id  
  AND c.nome ILIKE '%combust%'   
  AND date_trunc('month', t.ocorrencia_em) = date_trunc('month', now());  

3.	Últimos lançamentos:
sql
Copy
SELECT id, tipo, valor, contexto, referencia_texto, ocorrencia_em  
FROM transactions  
WHERE user_id = :user_id  
ORDER BY ocorrencia_em DESC  
LIMIT 20;  

________________________________________
Regras, índices e otimizações
●	Índice composto (user_id, ocorrencia_em DESC) para consultas rápidas por período.
●	Indexes GIN para jsonb se você for buscar por keys dentro de process_meta:
 CREATE INDEX ON messages USING gin (process_meta jsonb_path_ops);
●	Para buscas fuzzy de estabelecimento: criar coluna lower(estabelecimento) e índice pg_trgm.
●	Particionamento futuro por data (monthly) se crescer muito.
________________________________________
Armazenamento de imagens / OCR
●	Não armazene imagens no banco. Use S3/MinIO e salve a URL e metadados em attachments.
●	Workflow: Recebe imagem (WhatsApp) → salva temporário → envia para OCR (Tesseract/Google/Vision) → grava resultado em messages.process_meta e cria anexo + transação sugerida.
●	Salve o JSON bruto do OCR em messages.process_meta. Depois use heurísticas para atacar o valor.
________________________________________
Logs, auditoria e reprocessamento
●	Sempre criar um registro em audits ao criar/editar/excluir transações.
●	Mantenha mensagem original e vínculo para reprocessamento caso a heurística melhore (ex.: correr retrain do NER).
________________________________________
Segurança e conformidade (LGPD)
●	Telefone é dado sensível: criptografe em repouso se necessário.
●	Armazene tokens/segredos em Secrets Manager (Vault/AWS Secrets Manager) — não em texto.
●	Políticas de retenção e deleção para atender a solicitações de dados do usuário (GDPR/LGPD): marcar records como deletáveis e implementar processo de anonimização.
________________________________________
Backup e recuperação
●	Backups diários completos (pg_dump + WAL shipping) e ponto-in-time recovery (PITR) para recuperação de incidentes.
●	Backups das buckets S3 (replicação ou versionamento ativado).
●	Testar restauração trimestralmente.
________________________________________
Escalabilidade e estimativas iniciais
●	Para MVP: uma única instância PostgreSQL gerenciada (CPU 2-4, RAM 8-16GB) costuma ser suficiente para alguns milhares de usuários.
●	Separar leitura (replicas) quando consultas de painel aumentarem.
●	Offload de OCR/IA para workers (fila RabbitMQ / Redis Streams / n8n workers) para não bloquear a ingestão de mensagens.
________________________________________
Integração com n8n (observações práticas)
●	n8n pode processar mensagens vindas do WhatsApp → executar OCR → criar/atualizar transação via API da aplicação.
●	Armazene webhook_id/message_id em messages.whatsapp_message_id para rastrear status.
●	Use n8n para retries, filas e orquestração (por exemplo: mensagem → criar job OCR → analisar → criar transação → enviar confirmação via WhatsApp).
________________________________________
Próximos passos técnicos imediatos (recomendação)
1.	Implementar DDL mínimo (users, transactions, messages, attachments, categories, audits).
2.	Implementar endpoint ingestion (recebe webhook do WhatsApp e grava na tabela messages).
3.	Implementar worker de processamento: NLP/OCR → sugestão de transação → grava transactions (estado draft) → enviar confirmação para usuário.
4.	Implementar APIs para o painel e queries de resumo.
5.	Testes com 3–5 motoristas para validar heurísticas de classificação.
________________________________________
1. A Lógica do Relacionamento
Em termos técnicos, temos um relacionamento de 1 para 1 (geralmente) ou N para 1:
●	Conversa (Tabela messages): É o registro histórico. Ela guarda a mensagem exatamente como chegou (texto, áudio ou imagem). É o "porquê" do lançamento existir.
●	Lançamento (Tabela transactions): É o dado financeiro processado. Ele contém apenas números, datas e categorias.
Por que separar?
 Se o motorista disser no WhatsApp: "Ganhei 50 reais", e depois apagar a mensagem, o lançamento financeiro deve permanecer. Além disso, se a IA errar a interpretação, você pode voltar na mensagem original para reprocessar ou entender o erro.
________________________________________
2. O Fluxo de Dados
1.	O usuário envia a mensagem.
2.	O sistema cria um registro em messages.
3.	O motor de IA (n8n + modelo de linguagem) lê o conteudo da mensagem.
4.	O motor extrai o valor e o tipo.
5.	O sistema cria o registro em transactions e vincula o ID da mensagem.
________________________________________
3. Exemplo JSON (O "Vínculo")
Imagine que o motorista Carlos enviou uma foto de um recibo de posto de gasolina.
Registro na Tabela de Mensagens (messages)
Este objeto guarda o rastro da interação.
json
Copy
{  
  "id": "msg_98765",  
  "user_id": "user_carlos_01",  
  "whatsapp_message_id": "ABEGt0D1E2F3G",  
  "tipo": "imagem",  
  "conteudo": "https://storage.gigante.com.br/notas/nota_fiscal_2204.jpg",  
  "process_meta": {  
    "ocr_status": "success",  
    "raw_text": "POSTO IPIRANGA - DATA 22/04 - TOTAL R$ 150,00",  
    "intent": "registro_gasto",  
    "confidence": 0.98  
  },  
  "recebido_em": "2026-04-22T10:00:00Z"  
}  

Registro na Tabela de Lançamentos (transactions)
Este objeto é o que o Dashboard vai ler para somar os gastos. Note o campo message_id que faz a ligação.
json
Copy
{  
  "id": "tx_12345",  
  "user_id": "user_carlos_01",  
  "message_id": "msg_98765",   
  "tipo": "gasto",  
  "valor": 150.00,  
  "categoria": "combustivel",  
  "contexto": "trabalho",  
  "descricao": "Abastecimento identificado via OCR (Posto Ipiranga)",  
  "ocorrencia_em": "2026-04-22T10:00:00Z",  
  "status": "confirmado"  
}  

________________________________________
4. Por que esse vínculo é educativo para o sistema?
1.	Auditoria: Se o Carlos reclamar: "Ué, por que tem um gasto de 150 reais aqui?", o suporte (ou o próprio sistema) clica no link e mostra: "Olha, foi por causa dessa mensagem/foto que você mandou às 10h".
2.	Treinamento: Se o sistema classificou "Posto Ipiranga" como "Mercado" por erro, você usa esse vínculo para ensinar a IA: "Sempre que o texto da message contiver 'Posto', a transaction.categoria deve ser 'Combustível'".
3.	Correção: Se o usuário editar o valor no Dashboard, você mantém a mensagem original intacta, preservando a verdade histórica do que foi dito.

