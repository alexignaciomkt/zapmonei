const https = require('https');
const fs = require('fs');

const workflowId = 'ugM67t6MAY8bqM4R';
const newWorkflow = JSON.parse(fs.readFileSync('e:\\Sistemas\\Finanças Pessoais\\scratch\\onboarding_final.json', 'utf8'));

// Gerar o código do SDK a partir do JSON
// O SDK do n8n via MCP aceita uma estrutura que define os nodes e as conexões
// Vou usar o formato mais direto que o SDK suporta para garantir o sucesso
const sdkCode = `
import { workflow, node, trigger, expr } from '@n8n/workflow-sdk';

// Nodes
${newWorkflow.nodes.map(n => `const node_${n.name.replace(/[^a-zA-Z0-9]/g, '_')} = node({
  type: '${n.type}',
  version: ${n.version},
  config: {
    name: '${n.name}',
    parameters: ${JSON.stringify(n.parameters)},
    position: ${JSON.stringify(n.position)}
  },
  output: [{}]
});`).join('\n\n')}

// Workflow definition
export default workflow('${workflowId}', '${newWorkflow.name}')
  ${newWorkflow.nodes.map(n => `.add(node_${n.name.replace(/[^a-zA-Z0-9]/g, '_')})`).join('\n  ')}
  // Conexões (serão reconstruídas pelo parser do n8n ao receber os nodes)
;
`;

const data = JSON.stringify({
  jsonrpc: "2.0",
  id: 10,
  method: "tools/call",
  params: {
    name: "update_workflow",
    arguments: {
      workflowId: workflowId,
      code: sdkCode,
      name: newWorkflow.name
    }
  }
});

const options = {
  hostname: 'auto.euattendo.com.br',
  port: 443,
  path: '/mcp-server/http',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2ZkYmNlOS05MzY5LTQzNmQtOGU2NC00ZjQxNGFhYmJlZDIiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjBhNzBmNTA1LTMyZjItNGMxNC1iOGQ3LTIyZTdiYzNhMjM1ZCIsImlhdCI6MTc3ODI3NDk1OX0.J446SmR5qyZ_2qUiUfwkChyi0VgS4rsNyrP84lEEV4U',
    'Accept': 'application/json, text/event-stream',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    fs.writeFileSync(`scratch/sdk_update_response.json`, body);
    console.log(`Resposta do Update SDK salva!`);
  });
});

req.write(data);
req.end();
