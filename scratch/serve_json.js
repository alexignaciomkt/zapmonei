const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  if (req.url === '/json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const data = fs.readFileSync('e:\\Sistemas\\Finanças Pessoais\\scratch\\onboarding_final.json', 'utf8');
    res.end(data);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(3000, () => {
  console.log('Servidor local rodando em http://localhost:3000/json');
});
