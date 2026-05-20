const https = require('https');
const fs = require('fs');

// Ler o novo workflow gerado
const newWorkflowJson = JSON.parse(fs.readFileSync('e:\\Sistemas\\Finanças Pessoais\\scratch\\onboarding_final.json', 'utf8'));

const data = JSON.stringify({
  jsonrpc: "2.0",
  id: 3,
  method: "tools/call",
  params: {
    name: "update_workflow",
    arguments: {
      workflowId: "ugM67t6MAY8bqM4R",
      workflow: newWorkflowJson
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
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Enviando atualização para o n8n...');

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    fs.writeFileSync('e:\\Sistemas\\Finanças Pessoais\\scratch\\update_response.json', body);
    console.log('Resposta salva em scratch/update_response.json');
    if (res.statusCode === 200) {
        console.log('✅ Workflow atualizado com sucesso!');
    } else {
        console.log('❌ Erro na atualização. Verifique o status e o arquivo de resposta.');
    }
  });
});

req.on('error', (e) => {
  console.error('Erro na requisição:', e);
});

req.write(data);
req.end();
