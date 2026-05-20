const fs = require('fs');

const workflowName = "ZapMonei: Onboarding do Usuário (Condicional Completo)";

const HTTP_HEADER = {
    "parameters": [
        { "name": "apikey", "value": "={{ $('Supabase: Buscar Status').item.json.whatsapp_instance_token }}" }
    ]
};
const BASE_URL = "https://apigo.euattendo.com.br/send/text";
const inputContentVar = "$('Gatilho: Iniciar Onboarding').item.json.content";
const numberVar = "$('Supabase: Buscar Status').item.json.whatsapp_number";
const aiSystemMessage = "Você é um extrator de dados. IMPORTANTE: Retorne APENAS a string JSON crua. NUNCA utilize blocos de formatação markdown (como ```json ou ```). Comece direto com a chave { ou [.";

// HELPER TO ADD STEP
function createAskWithWait(idWait, idAsk, positionWait, positionAsk, text) {
    const idPresence = `presence-${idWait}`;
    return [
        {
            "parameters": {
                "method": "POST",
                "url": `={{ 'https://apigo.euattendo.com.br/chat/sendPresence/' + $('Supabase: Buscar Status').item.json.whatsapp_instance_name }}`,
                "sendHeaders": true,
                "headerParameters": HTTP_HEADER,
                "sendBody": true,
                "bodyParameters": {
                    "parameters": [
                        { "name": "number", "value": `={{ ${numberVar} }}` },
                        { "name": "delay", "value": 3000 },
                        { "name": "presence", "value": "composing" }
                    ]
                }
            },
            "id": idPresence,
            "name": `Digitando... ${idWait}`,
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.4,
            "position": [positionWait[0] - 150, positionWait[1]]
        },
        {
            "parameters": { "amount": 3, "unit": "seconds" },
            "id": idWait,
            "name": `Wait: ${idWait}`,
            "type": "n8n-nodes-base.wait",
            "typeVersion": 1,
            "position": positionWait
        },
        {
            "parameters": {
                "method": "POST",
                "url": BASE_URL,
                "sendHeaders": true,
                "headerParameters": HTTP_HEADER,
                "sendBody": true,
                "bodyParameters": {
                    "parameters": [
                        { "name": "number", "value": `={{ ${numberVar} }}` },
                        { "name": "text", "value": text }
                    ]
                }
            },
            "id": idAsk,
            "name": `Ask: ${idAsk}`,
            "type": "n8n-nodes-base.httpRequest",
            "typeVersion": 4.4,
            "position": positionAsk
        }
    ];
}


let nodes = [
    {
        "parameters": { "inputSource": "passthrough" },
        "id": "bb8b13a4-5abd-46df-89f6-7c63f276fd57",
        "name": "Gatilho: Iniciar Onboarding",
        "type": "n8n-nodes-base.executeWorkflowTrigger",
        "typeVersion": 1.1,
        "position": [-1200, 100]
    },
    {
        "parameters": {
            "operation": "getAll",
            "tableId": "users",
            "filters": {
                "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $json.user_id }}" }]
            }
        },
        "id": "a8dd7ff9-84ff-4301-8b60-5f97081e14dc",
        "name": "Supabase: Buscar Status",
        "type": "n8n-nodes-base.supabase",
        "typeVersion": 1,
        "position": [-950, 100]
    },
    {
        "parameters": {
            "rules": {
                "values": Array.from({ length: 10 }, (_, i) => ({
                    "conditions": {
                        "options": { "caseSensitive": true, "leftValue": "", "typeValidation": "strict", "version": 2 },
                        "conditions": [{
                            "leftValue": "={{ $json.onboarding_step || 0 }}",
                            "operator": { "type": "number", "operation": "equals" },
                            "rightValue": i
                        }],
                        "combinator": "and"
                    }
                }))
            }
        },
        "id": "switch-etapa",
        "name": "Switch: Etapa do Onboarding",
        "type": "n8n-nodes-base.switch",
        "typeVersion": 3.2,
        "position": [-700, 100]
    },
    {
        "parameters": { "options": {} },
        "id": "gemini-model",
        "name": "Gemini Model",
        "type": "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
        "typeVersion": 1,
        "position": [-300, 1500]
    }
];

let connections = {
    "Gatilho: Iniciar Onboarding": { "main": [[{ "node": "Supabase: Buscar Status", "type": "main", "index": 0 }]] },
    "Supabase: Buscar Status": { "main": [[{ "node": "Switch: Etapa do Onboarding", "type": "main", "index": 0 }]] },
    "Switch: Etapa do Onboarding": { "main": [[], [], [], [], [], [], [], [], [], []] },
    "Gemini Model": { "ai_languageModel": [] }
};

// HELPER TO ADD STEP
function addStep(stepIndex, askText, saveFields, nextStepNodes, aiCleanNode = null) {
    const askId = `node-ask-${stepIndex}`;
    const waitId = `wait-${stepIndex}`;
    const presenceId = `presence-${waitId}`;
    const saveId = `node-save-${stepIndex}`;
    const py = (stepIndex * 150) - 400;

    // Conecta o switch ao wait ou direto ao save se for etapa >= 1
    if (stepIndex === 0) {
        connections["Switch: Etapa do Onboarding"].main[stepIndex] = [{ "node": presenceId, "type": "main", "index": 0 }];
    } else {
        if (aiCleanNode) {
            connections["Switch: Etapa do Onboarding"].main[stepIndex] = [{ "node": aiCleanNode.id, "type": "main", "index": 0 }];
            connections[aiCleanNode.id] = { "main": [[{ "node": saveId, "type": "main", "index": 0 }]] };
            nodes.push(aiCleanNode);
            connections["Gemini Model"].ai_languageModel.push([{ "node": aiCleanNode.id, "type": "ai_languageModel", "index": 0 }]);
        } else {
            connections["Switch: Etapa do Onboarding"].main[stepIndex] = [{ "node": saveId, "type": "main", "index": 0 }];
        }
    }

    if (stepIndex === 0) {
        nodes.push(...createAskWithWait(waitId, askId, [-400, py], [-200, py], askText));
        connections[presenceId] = { "main": [[{ "node": waitId, "type": "main", "index": 0 }]] };
        connections[waitId] = { "main": [[{ "node": askId, "type": "main", "index": 0 }]] };
        connections[askId] = { "main": [[{ "node": saveId, "type": "main", "index": 0 }]] };
        
        nodes.push({
            "parameters": {
                "operation": "update", "tableId": "users",
                "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
                "fieldsUi": { "fieldValues": saveFields }
            },
            "id": saveId, "name": `Save ${stepIndex}`, "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [0, py]
        });
    } else {
        nodes.push({
            "parameters": {
                "operation": "update", "tableId": "users",
                "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
                "fieldsUi": { "fieldValues": saveFields }
            },
            "id": saveId, "name": `Save ${stepIndex}`, "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [-400, py]
        });

        if (Array.isArray(nextStepNodes) && nextStepNodes.length > 0) {
            connections[saveId] = { "main": [nextStepNodes] };
        } else if (askText) {
            nodes.push(...createAskWithWait(waitId, askId, [-200, py], [0, py], askText));
            connections[saveId] = { "main": [[{ "node": presenceId, "type": "main", "index": 0 }]] };
            connections[presenceId] = { "main": [[{ "node": waitId, "type": "main", "index": 0 }]] };
            connections[waitId] = { "main": [[{ "node": askId, "type": "main", "index": 0 }]] };
        }
    }
}

// STEP 0: Início
addStep(0, 
    "Fala, {{ $('Supabase: Buscar Status').item.json.nome }}! Sou seu novo Agente Financeiro e meu único trabalho é fazer seu dinheiro render e sobrar. 🚀\n\nPara a gente selar essa parceria: **Como você quer me chamar?**\n(Pode ser Alfred, Meu Sócio, Contador... você quem manda!)", 
    [ { "fieldId": "onboarding_step", "fieldValue": 1 }, { "fieldId": "onboarding_status", "fieldValue": "agent_onboarding" } ],
    null
);

// STEP 1: Salvar Nome e Perguntar Aniversário
addStep(1, 
    "Prazer em ser o *{{ $('Gatilho: Iniciar Onboarding').item.json.content }}*! Vou cuidar de tudo por aqui.\n\nPara eu te dar os parabéns e quem sabe te mandar um presente no futuro, quando é o seu aniversário? 🎂\n(Me manda assim: 15/05/1990)", 
    [ { "fieldId": "agent_custom_name", "fieldValue": `={{ ${inputContentVar} }}` }, { "fieldId": "onboarding_step", "fieldValue": 2 } ],
    null
);

// STEP 2: Limpar Data e Salvar Aniversário. Pergunta Rotina.
addStep(2, 
    "Anotado! Já guardei essa data. 🎈\n\nAgora, me conta da sua rotina. Como você trabalha hoje?\n\n1️⃣ Vivo 100% de Apps (Uber, 99, etc)\n2️⃣ Tenho um trabalho fixo e faço App nas horas vagas\n3️⃣ Não trabalho com Apps, quero organizar minha vida pessoal", 
    [ { "fieldId": "birth_date", "fieldValue": "={{ JSON.parse($json.output).date }}" }, { "fieldId": "onboarding_step", "fieldValue": 3 } ],
    null,
    {
        "parameters": { "promptType": "define", "text": `=Extraia a data de nascimento da mensagem: \"{{ ${inputContentVar} }}\". Retorne APENAS o JSON: {\"date\": \"YYYY-MM-DD\"}. Se não houver ano, use 1990.`, "options": { "systemMessage": aiSystemMessage } },
        "id": "ia-clean-date", "name": "IA: Limpar Data", "type": "@n8n/n8n-nodes-langchain.agent", "typeVersion": 3.1, "position": [-600, -100]
    }
);

// STEP 3: Salvar Rotina e Ramificar usando IF
nodes.push({
    "parameters": {
        "operation": "update", "tableId": "users",
        "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
        "fieldsUi": {
            "fieldValues": [
                { "fieldId": "is_driver", "fieldValue": `={{ ${inputContentVar}.includes('1') || ${inputContentVar}.includes('2') }}` },
                { "fieldId": "has_fixed_job", "fieldValue": `={{ ${inputContentVar}.includes('2') || ${inputContentVar}.includes('3') }}` }
            ]
        }
    },
    "id": "node-save-3", "name": "Save 3", "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [-400, 50]
});
nodes.push({
    "parameters": {
        "conditions": {
            "options": { "caseSensitive": true, "typeValidation": "strict" },
            "conditions": [{ "leftValue": `={{ ${inputContentVar} }}`, "operator": { "type": "string", "operation": "equals" }, "rightValue": "3" }], "combinator": "and"
        }
    },
    "id": "if-rotina-3", "name": "É opção 3?", "type": "n8n-nodes-base.if", "typeVersion": 2.3, "position": [-200, 50]
});
nodes.push({
    "parameters": {
        "operation": "update", "tableId": "users",
        "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
        "fieldsUi": { "fieldValues": [{ "fieldId": "onboarding_step", "fieldValue": 4 }] }
    },
    "id": "set-step-4", "name": "Set Step 4", "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [0, -50]
});
nodes.push({
    "parameters": {
        "operation": "update", "tableId": "users",
        "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
        "fieldsUi": { "fieldValues": [{ "fieldId": "onboarding_step", "fieldValue": 5 }] }
    },
    "id": "set-step-5", "name": "Set Step 5", "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [0, 150]
});

// Mensagem Ask Plataformas
nodes.push(...createAskWithWait("wait-3-plats", "node-ask-3-plats", [200, -50], [400, -50], "Maneiro! E **quais plataformas você roda hoje?**\n(Ex: Uber, 99, inDrive, Lalamove...)"));
// Mensagem Ask Renda Fixa
nodes.push(...createAskWithWait("wait-3-renda", "node-ask-3-renda", [200, 150], [400, 150], "Perfeito! Como você tem um trabalho fixo, **qual a sua renda fixa mensal líquida estimada?**\nIsso me ajuda a projetar seu orçamento base todo mês. 💰\n(Ex: R$ 3500)"));

connections["Switch: Etapa do Onboarding"].main[3] = [{ "node": "node-save-3", "type": "main", "index": 0 }];
connections["node-save-3"] = { "main": [[{ "node": "if-rotina-3", "type": "main", "index": 0 }]] };
connections["if-rotina-3"] = { "main": [[{ "node": "set-step-5", "type": "main", "index": 0 }], [{ "node": "set-step-4", "type": "main", "index": 0 }]] };

connections["set-step-4"] = { "main": [[{ "node": "presence-wait-3-plats", "type": "main", "index": 0 }]] };
connections["presence-wait-3-plats"] = { "main": [[{ "node": "wait-3-plats", "type": "main", "index": 0 }]] };
connections["wait-3-plats"] = { "main": [[{ "node": "node-ask-3-plats", "type": "main", "index": 0 }]] };

connections["set-step-5"] = { "main": [[{ "node": "presence-wait-3-renda", "type": "main", "index": 0 }]] };
connections["presence-wait-3-renda"] = { "main": [[{ "node": "wait-3-renda", "type": "main", "index": 0 }]] };
connections["wait-3-renda"] = { "main": [[{ "node": "node-ask-3-renda", "type": "main", "index": 0 }]] };

// STEP 4: Plataformas Salvas -> Pergunta Renda (se has_fixed_job) ou Escopo
nodes.push({
    "parameters": {
        "promptType": "define", "text": `=Extraia as plataformas: \"{{ ${inputContentVar} }}\". Retorne JSON: {"platforms": ["Uber", "99"]}.`, "options": { "systemMessage": aiSystemMessage }
    },
    "id": "ia-clean-plats", "name": "IA: Plataformas", "type": "@n8n/n8n-nodes-langchain.agent", "typeVersion": 3.1, "position": [-600, 300]
});
connections["Gemini Model"].ai_languageModel.push([{ "node": "ia-clean-plats", "type": "ai_languageModel", "index": 0 }]);

nodes.push({
    "parameters": {
        "operation": "update", "tableId": "users",
        "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
        "fieldsUi": {
            "fieldValues": [{ "fieldId": "platforms", "fieldValue": "={{ JSON.stringify(JSON.parse($json.output).platforms) }}" }]
        }
    },
    "id": "node-save-4", "name": "Save 4", "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [-400, 300]
});
connections["Switch: Etapa do Onboarding"].main[4] = [{ "node": "ia-clean-plats", "type": "main", "index": 0 }];
connections["ia-clean-plats"] = { "main": [[{ "node": "node-save-4", "type": "main", "index": 0 }]] };

nodes.push({
    "parameters": {
        "conditions": {
            "options": { "caseSensitive": true, "typeValidation": "strict" },
            "conditions": [{ "leftValue": "={{ $('Supabase: Buscar Status').item.json.has_fixed_job }}", "operator": { "type": "boolean", "operation": "true" }, "rightValue": "" }], "combinator": "and"
        }
    },
    "id": "if-tem-renda", "name": "Tem Renda Fixa?", "type": "n8n-nodes-base.if", "typeVersion": 2.3, "position": [-200, 300]
});
connections["node-save-4"] = { "main": [[{ "node": "if-tem-renda", "type": "main", "index": 0 }]] };

nodes.push({
    "parameters": {
        "operation": "update", "tableId": "users",
        "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
        "fieldsUi": { "fieldValues": [{ "fieldId": "onboarding_step", "fieldValue": 5 }] }
    },
    "id": "set-step-5-b", "name": "Set Step 5 (Renda)", "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [0, 200]
});
nodes.push({
    "parameters": {
        "operation": "update", "tableId": "users",
        "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
        "fieldsUi": { "fieldValues": [{ "fieldId": "onboarding_step", "fieldValue": 6 }] }
    },
    "id": "set-step-6-a", "name": "Set Step 6 (Escopo)", "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [0, 400]
});

connections["if-tem-renda"] = { "main": [[{ "node": "set-step-5-b", "type": "main", "index": 0 }], [{ "node": "set-step-6-a", "type": "main", "index": 0 }]] };
connections["set-step-5-b"] = { "main": [[{ "node": "presence-wait-3-renda", "type": "main", "index": 0 }]] };

nodes.push(...createAskWithWait("wait-escopo", "node-ask-escopo", [200, 400], [400, 400], "Entendido. E o que vamos organizar primeiro?\n\n1️⃣ Só meu Trabalho 💼\n2️⃣ Só minha Vida Pessoal 🏠\n3️⃣ Os dois (Quero separar o que ganho do que gasto!) ⚖️"));
connections["set-step-6-a"] = { "main": [[{ "node": "presence-wait-escopo", "type": "main", "index": 0 }]] };
connections["presence-wait-escopo"] = { "main": [[{ "node": "wait-escopo", "type": "main", "index": 0 }]] };
connections["wait-escopo"] = { "main": [[{ "node": "node-ask-escopo", "type": "main", "index": 0 }]] };

// STEP 5: Salvar Renda Fixa -> Pergunta Escopo
nodes.push({
    "parameters": {
        "promptType": "define", "text": `=Extraia o valor da renda fixa: \"{{ ${inputContentVar} }}\". Retorne JSON: {"value": 3500.00}.`, "options": { "systemMessage": aiSystemMessage }
    },
    "id": "ia-clean-renda", "name": "IA: Renda Fixa", "type": "@n8n/n8n-nodes-langchain.agent", "typeVersion": 3.1, "position": [-600, 500]
});
connections["Gemini Model"].ai_languageModel.push([{ "node": "ia-clean-renda", "type": "ai_languageModel", "index": 0 }]);

nodes.push({
    "parameters": {
        "operation": "update", "tableId": "users",
        "filters": { "conditions": [{ "keyName": "id", "condition": "eq", "keyValue": "={{ $('Supabase: Buscar Status').item.json.id }}" }] },
        "fieldsUi": {
            "fieldValues": [
                { "fieldId": "fixed_income", "fieldValue": "={{ JSON.parse($json.output).value }}" },
                { "fieldId": "onboarding_step", "fieldValue": 6 }
            ]
        }
    },
    "id": "node-save-5", "name": "Save 5", "type": "n8n-nodes-base.supabase", "typeVersion": 1, "position": [-400, 500]
});
connections["Switch: Etapa do Onboarding"].main[5] = [{ "node": "ia-clean-renda", "type": "main", "index": 0 }];
connections["ia-clean-renda"] = { "main": [[{ "node": "node-save-5", "type": "main", "index": 0 }]] };
connections["node-save-5"] = { "main": [[{ "node": "presence-wait-escopo", "type": "main", "index": 0 }]] };

// STEP 6: Salvar Escopo -> Pergunta Meta Diária
addStep(6, 
    "Vamos pensar no hoje! Qual a sua **meta de ganho limpo por dia** de trabalho? Aquele valor que te faz voltar pra casa tranquilo. 🎯\n(Ex: 250)", 
    [ { "fieldId": "control_type", "fieldValue": `={{ ${inputContentVar} }}` }, { "fieldId": "onboarding_step", "fieldValue": 7 } ],
    null
);

// STEP 7: Salvar Meta -> Pergunta Gastos Fixos
addStep(7, 
    "Show! Agora o diferencial: me lista seus **gastos fixos pessoais** (Aluguel, Luz, Moto...). Manda o nome, o valor e o DIA do vencimento.\nEx: Aluguel 1500 dia 5, Luz 200 dia 10.\n\nEu vou lembrar deles todo mês pra você, sem você precisar digitar de novo! 🧠", 
    [ { "fieldId": "daily_goal", "fieldValue": "={{ JSON.parse($json.output).value }}" }, { "fieldId": "onboarding_step", "fieldValue": 8 } ],
    null,
    {
        "parameters": { "promptType": "define", "text": `=Extraia apenas o valor numérico da meta diária da mensagem: \"{{ ${inputContentVar} }}\". Retorne APENAS o JSON: {\"value\": 250.00}.`, "options": { "systemMessage": aiSystemMessage } },
        "id": "ia-clean-meta", "name": "IA: Limpar Meta", "type": "@n8n/n8n-nodes-langchain.agent", "typeVersion": 3.1, "position": [-600, 700]
    }
);

// STEP 8: Salvar Gastos -> Pergunta WOW (Começar)
addStep(8, 
    "Sensacional! Olha o que eu vou te entregar todo dia:\n✅ Seu Lucro Real (limpo!)\n📈 Ganhos e Custos por KM\n⛽ Saúde do seu Carro\n\nE o melhor: **pode mandar tudo na hora!** Comeu um lanche? Manda um áudio ou foto do recibo. Eu me viro pra processar. Só não esquece, porque eu não leio pensamento! 😂\n\nPodemos começar nosso primeiro dia?", 
    [ { "fieldId": "fixed_expenses", "fieldValue": "={{ JSON.parse($json.output) }}" }, { "fieldId": "onboarding_step", "fieldValue": 9 } ],
    null,
    {
        "parameters": { "promptType": "define", "text": `=Extraia a lista de gastos da mensagem: \"{{ ${inputContentVar} }}\". Retorne JSON: [{\"item\": \"Aluguel\", \"valor\": 1500, \"dia_vencimento\": 5}]. Use null se não houver dia.`, "options": { "systemMessage": aiSystemMessage } },
        "id": "ia-clean-expenses", "name": "IA: Limpar Gastos", "type": "@n8n/n8n-nodes-langchain.agent", "typeVersion": 3.1, "position": [-600, 900]
    }
);

// STEP 9: Finalize
addStep(9, 
    "✨ TUDO PRONTO! ✨\n\nJá estou ativo e vigiando seu bolso. Qualquer gasto ou ganho, áudio ou foto de recibo, manda aqui que eu organizo na hora. Vamos bater essas metas! 💰🏁", 
    [ { "fieldId": "onboarding_status", "fieldValue": "completed" }, { "fieldId": "onboarding_completed_at", "fieldValue": "={{ new Date().toISOString() }}" } ],
    null
);

const finalWorkflow = {
    "name": workflowName,
    "nodes": nodes,
    "connections": connections,
    "settings": { "executionOrder": "v1" }
};

fs.writeFileSync('e:\\Sistemas\\Finanças Pessoais\\scratch\\onboarding_final.json', JSON.stringify(finalWorkflow, null, 2));
console.log('Onboarding Condicional gerado!');
