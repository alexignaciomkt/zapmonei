const fs = require('fs');

const workflowId = "XekB9YJ42IPtNg0Y";
const workflowName = "ZapMonei: Motor de Inteligência Artificial";

// Carregar o original para manter metadados
const originalRaw = fs.readFileSync(`e:\\Sistemas\\Finanças Pessoais\\scratch\\workflow_${workflowId}.json`, 'utf8');
const dataMatch = originalRaw.match(/data: (\{.*\})/);
const originalData = JSON.parse(dataMatch[1]);
const originalWorkflow = originalData.result.structuredContent.workflow;

const nodes = [
    {
        "parameters": { "inputSource": "passthrough" },
        "id": "ed93b35b-f370-478c-8084-b87ff38ec18a",
        "name": "Gatilho da IA",
        "type": "n8n-nodes-base.executeWorkflowTrigger",
        "typeVersion": 1.1,
        "position": [0, 0]
    },
    {
        "parameters": {
            "operation": "getAll",
            "tableId": "users",
            "filters": {
                "conditions": [
                    { "keyName": "id", "condition": "eq", "keyValue": "={{ $json.user_id }}" }
                ]
            }
        },
        "id": "07a13c73-1ddd-4a11-a9d5-2f481f3550da",
        "name": "Buscar Contexto do Usuário",
        "type": "n8n-nodes-base.supabase",
        "typeVersion": 1,
        "position": [220, 0]
    },
    {
        "parameters": { "options": {} },
        "id": "d697034c-258e-44b9-9c56-e27b477d199b",
        "name": "Cérebro Gemini",
        "type": "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
        "typeVersion": 1,
        "position": [450, 200]
    },
    {
        "parameters": {
            "promptType": "define",
            "text": "=Você é o {{ $json.agent_custom_name || \"Sócio-Assistente ZapMonei\" }} do parceiro {{ $json.nome || \"Parceiro\" }}.\n\nCONTEXTO DO PARCEIRO:\n- Meta Diária: R$ {{ $json.daily_goal || 0 }}\n- Custos Fixos: {{ $json.fixed_expenses || 'Nenhum cadastrado' }}\n- É Motorista: {{ $json.is_driver ? 'Sim' : 'Não' }}\n\nSUA TAREFA:\n1. Analisar a mensagem: \"{{ $node[\"Gatilho da IA\"].json.content }}\".\n2. Extrair dados financeiros ou de ritual (KM).\n3. Retornar OBRIGATORIAMENTE um JSON puro:\n{\n  \"e_transacao\": true,\n  \"tipo\": \"ganho\" | \"gasto\" | \"ritual\",\n  \"valor\": 100.00,\n  \"descricao\": \"...\",\n  \"categoria\": \"...\",\n  \"ritual_tipo\": \"inicio\" | \"fim\" | null,\n  \"km\": 123456,\n  \"texto_resposta\": \"Sua resposta amigável e motivadora. Se for ganho, compare com a meta diária de R$ {{ $json.daily_goal }}. Use emojis!\"\n}\n\nREGRAS:\n- Se for KM inicial/final, use \"tipo\": \"ritual\".\n- Seja o braço direito do motorista. Comemore vitórias e incentive metas.\n- Responda APENAS o JSON.",
            "options": {
                "systemMessage": "Você é um estrategista financeiro de elite para motoristas. Extraia dados e responda sempre em JSON puro."
            }
        },
        "id": "7569aaee-6d6a-4d8c-bf30-4ab0f678d39e",
        "name": "Análise Financeira (IA)",
        "type": "@n8n/n8n-nodes-langchain.agent",
        "typeVersion": 3.1,
        "position": [450, 0]
    },
    {
        "parameters": {
            "jsCode": "try {\n  let rawText = $json.response_text || $json.output || \"\";\n  let cleanJson = rawText.replace(/```json/g, \"\").replace(/```/g, \"\").trim();\n  const jsonMatch = cleanJson.match(/\\{[\\s\\S]*\\}/);\n  if (jsonMatch) cleanJson = jsonMatch[0];\n  const data = JSON.parse(cleanJson);\n  if (data.valor) data.valor = parseFloat(data.valor);\n  return data;\n} catch (e) {\n  return { tipo: \"erro\", valor: 0, texto_resposta: \"Não consegui processar essa, pode repetir?\" };\n}"
        },
        "id": "a7c22c6f-5c06-458b-8f96-1f0b332ef6c6",
        "name": "Processar Resposta da IA",
        "type": "n8n-nodes-base.code",
        "typeVersion": 2,
        "position": [700, 0]
    },
    {
        "parameters": {
            "conditions": {
                "options": { "caseSensitive": true, "typeValidation": "strict" },
                "conditions": [
                    { "leftValue": "={{ $json.tipo }}", "operator": { "type": "string", "operation": "notEquals" }, "rightValue": "ritual" }
                ]
            }
        },
        "id": "if-transacao",
        "name": "É Transação?",
        "type": "n8n-nodes-base.if",
        "typeVersion": 2.2,
        "position": [900, 0]
    },
    {
        "parameters": {
            "tableId": "transactions",
            "fieldsUi": {
                "fieldValues": [
                    { "fieldId": "user_id", "fieldValue": "={{ $node[\"Gatilho da IA\"].json.user_id }}" },
                    { "fieldId": "tipo", "fieldValue": "={{ $json.tipo }}" },
                    { "fieldId": "valor", "fieldValue": "={{ $json.valor }}" },
                    { "fieldId": "descricao", "fieldValue": "={{ $json.descricao }}" },
                    { "fieldId": "categoria", "fieldValue": "={{ $json.categoria }}" }
                ]
            }
        },
        "id": "aa90cbd0-8ce8-4dd8-9f24-88714c17d97b",
        "name": "Gravar Transação no Banco",
        "type": "n8n-nodes-base.supabase",
        "typeVersion": 1,
        "position": [1150, -50]
    },
    {
        "parameters": {
            "operation": "update",
            "tableId": "users",
            "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $node[\"Gatilho da IA\"].json.user_id }}" }] },
            "fieldsUi": {
                "fieldValues": [
                    { "fieldId": "user_metadata", "fieldValue": "={{ JSON.stringify({...$node[\"Buscar Contexto do Usuário\"].json.user_metadata, last_ritual: $json}) }}" }
                ]
            }
        },
        "id": "save-ritual",
        "name": "Gravar Ritual (Metadata)",
        "type": "n8n-nodes-base.supabase",
        "typeVersion": 1,
        "position": [1150, 150]
    },
    {
        "parameters": {
            "method": "POST",
            "url": "https://apigo.euattendo.com.br/send/text",
            "sendHeaders": true,
            "headerParameters": {
                "parameters": [
                    { "name": "apikey", "value": "={{ $node[\"Buscar Contexto do Usuário\"].json.whatsapp_instance_token }}" }
                ]
            },
            "sendBody": true,
            "bodyParameters": {
                "parameters": [
                    { "name": "number", "value": "={{ $node[\"Buscar Contexto do Usuário\"].json.whatsapp_number }}" },
                    { "name": "text", "value": "={{ $node[\"Processar Resposta da IA\"].json.texto_resposta }}" }
                ]
            }
        },
        "id": "8fc895dd-b1c9-4c5e-8905-9cf9acf2c9ae",
        "name": "Enviar Resposta WhatsApp",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 4.4,
        "position": [1450, 0]
    }
];

const connections = {
    "Gatilho da IA": { "main": [[{ "node": "Buscar Contexto do Usuário", "type": "main", "index": 0 }]] },
    "Buscar Contexto do Usuário": { "main": [[{ "node": "Análise Financeira (IA)", "type": "main", "index": 0 }]] },
    "Análise Financeira (IA)": { "main": [[{ "node": "Processar Resposta da IA", "type": "main", "index": 0 }]] },
    "Cérebro Gemini": { "ai_languageModel": [[{ "node": "Análise Financeira (IA)", "type": "ai_languageModel", "index": 0 }]] },
    "Processar Resposta da IA": { "main": [[{ "node": "É Transação?", "type": "main", "index": 0 }]] },
    "É Transação?": {
        "main": [
            [{ "node": "Gravar Transação no Banco", "type": "main", "index": 0 }],
            [{ "node": "Gravar Ritual (Metadata)", "type": "main", "index": 0 }]
        ]
    },
    "Gravar Transação no Banco": { "main": [[{ "node": "Enviar Resposta WhatsApp", "type": "main", "index": 0 }]] },
    "Gravar Ritual (Metadata)": { "main": [[{ "node": "Enviar Resposta WhatsApp", "type": "main", "index": 0 }]] }
};

const finalWorkflow = {
    "name": workflowName,
    "nodes": nodes,
    "connections": connections,
    "settings": originalWorkflow.settings,
    "staticData": originalWorkflow.staticData,
    "meta": originalWorkflow.meta,
    "tags": originalWorkflow.tags
};

fs.writeFileSync('e:\\Sistemas\\Finanças Pessoais\\scratch\\new_motor_ia.json', JSON.stringify(finalWorkflow, null, 2));
console.log('Novo Motor de IA gerado com sucesso!');
