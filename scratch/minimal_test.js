const https = require('https');
const fs = require('fs');

const data = JSON.stringify({
  jsonrpc: "2.0",
  id: 11,
  method: "tools/call",
  params: {
    name: "update_workflow",
    arguments: {
      workflowId: "ugM67t6MAY8bqM4R",
      code: "import { workflow, trigger } from '@n8n/workflow-sdk';\nexport default workflow('ugM67t6MAY8bqM4R', 'Teste de Conexão').add(trigger({ type: 'n8n-nodes-base.manualTrigger', version: 1, config: { name: 'Start' }, output: [{}] }));"
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
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    fs.writeFileSync(`scratch/minimal_test_response.json`, body);
    console.log(`Resposta do Teste Minimalista salva!`);
  });
});

req.write(data);
req.end();
