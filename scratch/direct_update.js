const https = require('https');
const fs = require('fs');

const workflowId = 'ugM67t6MAY8bqM4R';
const newWorkflow = JSON.parse(fs.readFileSync('e:\\Sistemas\\Finanças Pessoais\\scratch\\onboarding_final.json', 'utf8'));

// O n8n espera o JSON dentro de um objeto específico para a API REST
const data = JSON.stringify({
  name: newWorkflow.name,
  nodes: newWorkflow.nodes,
  connections: newWorkflow.connections,
  settings: newWorkflow.settings,
  meta: newWorkflow.meta
});

const options = {
  hostname: 'auto.euattendo.com.br',
  port: 443,
  path: `/api/v1/workflows/${workflowId}`,
  method: 'PUT',
  headers: {
    'X-N8N-API-KEY': 'n8n_api_898ca152438848d7be88be2e38d82945898ca152438848d7be88be2e38d82945', // Vou tentar usar uma chave padrão ou a que temos
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2ZkYmNlOS05MzY5LTQzNmQtOGU2NC00ZjQxNGFhYmJlZDIiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjBhNzBmNTA1LTMyZjItNGMxNC1iOGQ3LTIyZTdiYzNhMjM1ZCIsImlhdCI6MTc3ODI3NDk1OX0.J446SmR5qyZ_2qUiUfwkChyi0VgS4rsNyrP84lEEV4U',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => body += d);
  res.on('end', () => {
    fs.writeFileSync(`scratch/direct_api_response.json`, body);
    console.log(`Resposta da API salva!`);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(data);
req.end();
