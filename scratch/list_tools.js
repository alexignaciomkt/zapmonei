const https = require('https');
const fs = require('fs');

const data = JSON.stringify({
  jsonrpc: "2.0",
  id: 8,
  method: "tools/list",
  params: {}
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
    fs.writeFileSync(`scratch/n8n_tools_list.json`, body);
    console.log(`Lista de ferramentas salva!`);
  });
});

req.write(data);
req.end();
